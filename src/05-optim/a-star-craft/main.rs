// A*Craft optimization — Simulated Annealing in Rust
// Port of the C++ SA approach with faster simulation using bitset state tracking.

use std::io::{self, BufRead};
use std::time::Instant;

const W: usize = 19;
const H: usize = 10;
// State space: 19 * 10 * 4 = 760 possible (x, y, dir) states per robot
const STATE_SPACE: usize = W * H * 4;
const SIM_MS: u128 = 920;

#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
enum Cell { Void = 0, Empty = 1, U = 2, R = 3, D = 4, L = 5 }

impl Cell {
    fn is_arrow(self) -> bool { matches!(self, Cell::U | Cell::R | Cell::D | Cell::L) }
    fn is_platform(self) -> bool { !matches!(self, Cell::Void) }
    fn to_dir(self) -> u8 {
        match self { Cell::U => 0, Cell::R => 1, Cell::D => 2, Cell::L => 3, _ => 255 }
    }
    fn from_dir(d: u8) -> Cell {
        match d { 0 => Cell::U, 1 => Cell::R, 2 => Cell::D, _ => Cell::L }
    }
    fn to_char(self) -> char {
        match self { Cell::U => 'U', Cell::R => 'R', Cell::D => 'D', Cell::L => 'L', _ => '?' }
    }
}

// dx, dy for directions U=0, R=1, D=2, L=3
const DX: [i32; 4] = [0, 1, 0, -1];
const DY: [i32; 4] = [-1, 0, 1, 0];

struct Robot { x: usize, y: usize, dir: u8 }

struct Rng(u64);
impl Rng {
    fn next(&mut self) -> u64 {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 7;
        self.0 ^= self.0 << 17;
        self.0
    }
    fn usize(&mut self, n: usize) -> usize { (self.next() % n as u64) as usize }
    fn f32(&mut self) -> f32 { (self.next() % 10000) as f32 / 10000.0 }
}

#[inline(always)]
fn state_idx(x: usize, y: usize, dir: u8) -> usize {
    (y * W + x) * 4 + dir as usize
}

/// Simulate all robots on the given map. Returns total score.
/// Uses a fixed-size bitset per robot for O(1) state lookup.
fn simulate(map: &[[Cell; W]; H], robots: &[Robot]) -> u64 {
    let mut score = 0u64;

    // Reusable bitset — 760 bits = 12 u64s
    const WORDS: usize = (STATE_SPACE + 63) / 64;
    let mut visited = [0u64; WORDS];

    for robot in robots {
        // Clear visited
        for w in visited.iter_mut() { *w = 0; }

        let mut x = robot.x;
        let mut y = robot.y;
        let mut dir = robot.dir;

        // Initial arrow check
        let cell = map[y][x];
        if cell.is_arrow() { dir = cell.to_dir(); }

        // Mark initial state
        let si = state_idx(x, y, dir);
        visited[si / 64] |= 1u64 << (si % 64);

        loop {
            // Score: robot is alive this turn
            score += 1;

            // Move
            x = ((x as i32 + DX[dir as usize]).rem_euclid(W as i32)) as usize;
            y = ((y as i32 + DY[dir as usize]).rem_euclid(H as i32)) as usize;

            let cell = map[y][x];

            // Void check
            if !cell.is_platform() { break; }

            // Arrow check
            if cell.is_arrow() { dir = cell.to_dir(); }

            // State revisit check
            let si = state_idx(x, y, dir);
            let word = si / 64;
            let bit = 1u64 << (si % 64);
            if visited[word] & bit != 0 { break; }
            visited[word] |= bit;
        }
    }
    score
}

/// A gene: (index into empties list, cell value to place)
#[derive(Clone, Copy)]
struct Gene { empty_idx: u16, cell: Cell }

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();

    let mut base_map = [[Cell::Void; W]; H];
    for y in 0..H {
        let line = lines.next().unwrap().unwrap();
        for (x, c) in line.chars().enumerate() {
            base_map[y][x] = match c {
                '#' => Cell::Void,
                '.' => Cell::Empty,
                'U' => Cell::U,
                'R' => Cell::R,
                'D' => Cell::D,
                'L' => Cell::L,
                _ => Cell::Void,
            };
        }
    }

    let robot_count: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let mut robots = Vec::with_capacity(robot_count);
    for _ in 0..robot_count {
        let line = lines.next().unwrap().unwrap();
        let parts: Vec<&str> = line.trim().split_whitespace().collect();
        let x: usize = parts[0].parse().unwrap();
        let y: usize = parts[1].parse().unwrap();
        let dir: u8 = match parts[2] { "U" => 0, "R" => 1, "D" => 2, _ => 3 };
        robots.push(Robot { x, y, dir });
    }

    // Collect empty cells
    let mut empties: Vec<(usize, usize)> = Vec::new();
    for y in 0..H {
        for x in 0..W {
            if base_map[y][x] == Cell::Empty {
                empties.push((x, y));
            }
        }
    }
    let n_empties = empties.len();

    let mut rng = Rng(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH).unwrap().subsec_nanos() as u64 | 1);

    // SA state: vector of genes (like C++ version: 40 random genes)
    let n_genes: usize = 40.min(n_empties);

    // Initialize: random genes
    let mut current_genes: Vec<Gene> = (0..n_genes).map(|_| {
        let idx = rng.usize(n_empties);
        let dir = rng.usize(5);
        let cell = if dir < 4 { Cell::from_dir(dir as u8) } else { Cell::Empty };
        Gene { empty_idx: idx as u16, cell }
    }).collect();

    // Apply genes to map and simulate
    let apply = |map: &mut [[Cell; W]; H], genes: &[Gene], empties: &[(usize, usize)]| {
        for g in genes {
            let (x, y) = empties[g.empty_idx as usize];
            if map[y][x] == Cell::Empty {
                map[y][x] = g.cell;
            }
        }
    };

    let eval = |genes: &[Gene]| -> u64 {
        let mut map = base_map;
        apply(&mut map, genes, &empties);
        simulate(&map, &robots)
    };

    let mut current_score = eval(&current_genes);
    let mut best_genes = current_genes.clone();
    let mut best_score = current_score;

    let start = Instant::now();
    let mut iters = 0u64;
    let mut temp: f32 = 1000.0;

    while start.elapsed().as_millis() < SIM_MS {
        iters += 1;

        // Mutate one gene
        let mut new_genes = current_genes.clone();
        let ge = rng.usize(n_genes);
        let move_idx = rng.usize(n_empties);
        let dir = rng.usize(5);
        let cell = if dir < 4 { Cell::from_dir(dir as u8) } else { Cell::Empty };
        new_genes[ge] = Gene { empty_idx: move_idx as u16, cell };

        let new_score = eval(&new_genes);
        let delta = new_score as f32 - current_score as f32;

        if delta > 0.0 || (temp > 0.01 && (delta / temp).exp() > rng.f32()) {
            current_genes = new_genes;
            current_score = new_score;
            if current_score > best_score {
                best_score = current_score;
                best_genes = current_genes.clone();
            }
        }

        temp *= 0.999;
        if temp < 0.1 { temp = 0.1; }
    }

    eprintln!("sa {} {}", best_score, iters);

    // Output
    let mut out = String::new();
    let mut output_map = base_map;
    for g in &best_genes {
        let (x, y) = empties[g.empty_idx as usize];
        if output_map[y][x] == Cell::Empty && g.cell.is_arrow() {
            output_map[y][x] = g.cell;
            out.push_str(&format!("{} {} {} ", x, y, g.cell.to_char()));
        }
    }

    if out.is_empty() {
        println!("0 0 U");
    } else {
        println!("{}", out.trim());
    }
}
