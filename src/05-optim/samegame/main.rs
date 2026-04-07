/// SameGame — Optimized Beam Search solver
///
/// === GAME RULES ===
/// 15×15 grid, 5 colors (0–4), empty = -1.
/// Remove connected regions of ≥2 same-color cells.
/// Score per move: (region_size - 2)².
/// Bonus +1000 for clearing the board.
/// After removal: cells fall down, empty columns collapse left.
///
/// === STRATEGY ===
/// Beam search with width 400, using the full 20s first-turn budget.
/// Key optimizations vs v1:
/// - Bitset-based flood fill (u256 via [u64;4]) instead of Vec allocations
/// - Improved heuristic: penalize color fragmentation + isolated cells
/// - Larger beam = more states explored = better solutions
/// - Grid stored as compact [u8; 225] with pack/unpack for fast clone

use std::io;
use std::time::Instant;

const ROWS: usize = 15;
const COLS: usize = 15;
const CELLS: usize = ROWS * COLS; // 225
const EMPTY: u8 = 255;
const NUM_COLORS: usize = 5;
const BEAM_WIDTH: usize = 400;
const TIME_LIMIT_MS: u128 = 19000;

type Grid = [u8; CELLS];

fn idx(r: usize, c: usize) -> usize { r * COLS + c }

/// Flood fill using a stack, returning a bitmask of cells in the region.
/// Uses [u64; 4] as a 256-bit bitset (we only need 225 bits).
fn flood_fill(grid: &Grid, start: usize) -> ([u64; 4], usize) {
    let color = grid[start];
    let mut mask = [0u64; 4];
    if color == EMPTY { return (mask, 0); }

    let mut stack = [0u16; CELLS];
    let mut sp = 0;
    stack[0] = start as u16;
    sp = 1;
    mask[start / 64] |= 1u64 << (start % 64);
    let mut count = 0usize;

    while sp > 0 {
        sp -= 1;
        let pos = stack[sp] as usize;
        count += 1;
        let r = pos / COLS;
        let c = pos % COLS;

        // Up
        if r > 0 {
            let n = pos - COLS;
            if grid[n] == color && (mask[n / 64] >> (n % 64)) & 1 == 0 {
                mask[n / 64] |= 1u64 << (n % 64);
                stack[sp] = n as u16; sp += 1;
            }
        }
        // Down
        if r + 1 < ROWS {
            let n = pos + COLS;
            if grid[n] == color && (mask[n / 64] >> (n % 64)) & 1 == 0 {
                mask[n / 64] |= 1u64 << (n % 64);
                stack[sp] = n as u16; sp += 1;
            }
        }
        // Left
        if c > 0 {
            let n = pos - 1;
            if grid[n] == color && (mask[n / 64] >> (n % 64)) & 1 == 0 {
                mask[n / 64] |= 1u64 << (n % 64);
                stack[sp] = n as u16; sp += 1;
            }
        }
        // Right
        if c + 1 < COLS {
            let n = pos + 1;
            if grid[n] == color && (mask[n / 64] >> (n % 64)) & 1 == 0 {
                mask[n / 64] |= 1u64 << (n % 64);
                stack[sp] = n as u16; sp += 1;
            }
        }
    }
    (mask, count)
}

/// Remove cells in mask, apply gravity and column collapse.
fn apply_move(grid: &mut Grid, mask: &[u64; 4]) {
    // Clear cells
    for i in 0..CELLS {
        if (mask[i / 64] >> (i % 64)) & 1 != 0 {
            grid[i] = EMPTY;
        }
    }
    // Gravity: compact each column downward
    for c in 0..COLS {
        let mut write = ROWS - 1;
        for r in (0..ROWS).rev() {
            if grid[idx(r, c)] != EMPTY {
                if r != write {
                    grid[idx(write, c)] = grid[idx(r, c)];
                    grid[idx(r, c)] = EMPTY;
                }
                write = write.wrapping_sub(1);
            }
        }
    }
    // Column collapse: shift non-empty columns left
    let mut wc = 0;
    for rc in 0..COLS {
        // Check if column has any cell (bottom row)
        if grid[idx(ROWS - 1, rc)] != EMPTY {
            if rc != wc {
                for r in 0..ROWS {
                    grid[idx(r, wc)] = grid[idx(r, rc)];
                    grid[idx(r, rc)] = EMPTY;
                }
            }
            wc += 1;
        }
    }
}

/// Find all unique legal moves. Returns (representative_cell_index, region_size).
fn find_moves(grid: &Grid) -> Vec<(usize, usize)> {
    let mut global_visited = [0u64; 4];
    let mut moves = Vec::with_capacity(30);

    // Scan bottom-to-top, left-to-right
    for r in (0..ROWS).rev() {
        for c in 0..COLS {
            let i = idx(r, c);
            if grid[i] == EMPTY || (global_visited[i / 64] >> (i % 64)) & 1 != 0 {
                continue;
            }
            let (mask, count) = flood_fill(grid, i);
            // Merge into global visited
            for k in 0..4 { global_visited[k] |= mask[k]; }
            if count >= 2 {
                moves.push((i, count));
            }
        }
    }
    moves
}

/// Heuristic: estimate remaining potential score.
/// - For each removable region: (n-2)² potential
/// - Penalty for isolated cells (size 1): they're dead weight
/// - Penalty for color fragmentation: many small groups of same color = bad
/// - Bonus for empty board
fn heuristic(grid: &Grid) -> i32 {
    let mut global_visited = [0u64; 4];
    let mut h: i32 = 0;
    let mut total_cells = 0u32;
    let mut isolated = 0i32;

    for r in 0..ROWS {
        for c in 0..COLS {
            let i = idx(r, c);
            if grid[i] == EMPTY || (global_visited[i / 64] >> (i % 64)) & 1 != 0 {
                continue;
            }
            let (mask, count) = flood_fill(grid, i);
            for k in 0..4 { global_visited[k] |= mask[k]; }
            total_cells += count as u32;
            let n = count as i32;
            if n >= 2 {
                h += (n - 2) * (n - 2);
            } else {
                isolated += 1;
            }
        }
    }

    if total_cells == 0 {
        h += 1000;
    }

    // Penalize isolated cells more heavily — they can never be removed
    h -= isolated * 5;

    h
}

#[derive(Clone)]
struct State {
    grid: Grid,
    score: i32,
    moves: Vec<(usize, usize)>, // (col, row) in game coordinates
}

fn beam_search(initial: Grid, start: Instant) -> Vec<(usize, usize)> {
    let mut beam = vec![State { grid: initial, score: 0, moves: vec![] }];
    let mut best = State { grid: initial, score: i32::MIN, moves: vec![] };

    loop {
        if start.elapsed().as_millis() > TIME_LIMIT_MS { break; }

        let mut candidates: Vec<(i32, State)> = Vec::with_capacity(BEAM_WIDTH * 20);

        for state in &beam {
            let moves = find_moves(&state.grid);
            if moves.is_empty() {
                let cleared = state.grid[idx(ROWS - 1, 0)] == EMPTY;
                let fs = state.score + if cleared { 1000 } else { 0 };
                if fs > best.score {
                    best = State { grid: state.grid, score: fs, moves: state.moves.clone() };
                }
                continue;
            }

            for &(cell, size) in &moves {
                let mut ng = state.grid;
                let (mask, _) = flood_fill(&ng, cell);
                apply_move(&mut ng, &mask);
                let ms = (size as i32 - 2) * (size as i32 - 2);
                let ns = state.score + ms;
                let h = heuristic(&ng);
                let priority = ns + h;

                let r = cell / COLS;
                let c = cell % COLS;
                let game_col = c;
                let game_row = ROWS - 1 - r;
                let mut nm = state.moves.clone();
                nm.push((game_col, game_row));

                candidates.push((priority, State { grid: ng, score: ns, moves: nm }));
            }

            if start.elapsed().as_millis() > TIME_LIMIT_MS { break; }
        }

        if candidates.is_empty() { break; }

        // Keep top BEAM_WIDTH
        candidates.sort_unstable_by(|a, b| b.0.cmp(&a.0));
        candidates.truncate(BEAM_WIDTH);
        beam = candidates.into_iter().map(|(_, s)| s).collect();
    }

    // Check beam for best terminal
    for s in &beam {
        let cleared = s.grid[idx(ROWS - 1, 0)] == EMPTY;
        let fs = s.score + if cleared { 1000 } else { 0 };
        if fs > best.score {
            best = State { grid: s.grid, score: fs, moves: s.moves.clone() };
        }
    }

    if best.score == i32::MIN && !beam.is_empty() {
        return beam[0].moves.clone();
    }
    best.moves
}

fn main() {
    let mut grid = [EMPTY; CELLS];
    for r in 0..ROWS {
        let mut line = String::new();
        io::stdin().read_line(&mut line).unwrap();
        for (c, tok) in line.trim().split_whitespace().enumerate() {
            let v: i8 = tok.parse().unwrap();
            grid[idx(r, c)] = if v < 0 { EMPTY } else { v as u8 };
        }
    }

    let start = Instant::now();
    let moves = beam_search(grid, start);

    if !moves.is_empty() {
        let (col, row) = moves[0];
        println!("{} {}", col, row);
    }

    for i in 1..moves.len() {
        // Read and discard subsequent turn input
        for _ in 0..ROWS {
            let mut line = String::new();
            io::stdin().read_line(&mut line).unwrap();
        }
        let (col, row) = moves[i];
        println!("{} {}", col, row);
    }
}
