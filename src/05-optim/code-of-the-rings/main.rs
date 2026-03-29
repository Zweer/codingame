use std::io;

const NCELLS: usize = 30;
const ALPHA: usize = 27;

fn char_to_idx(c: char) -> usize {
    if c == ' ' { 0 } else { (c as usize) - ('A' as usize) + 1 }
}

/// Shortest +/- distance in circular alphabet
fn alpha_cost(from: usize, to: usize) -> i32 {
    let fwd = ((to + ALPHA - from) % ALPHA) as i32;
    let bwd = (ALPHA as i32) - fwd;
    fwd.min(bwd)
}

fn alpha_dir(from: usize, to: usize) -> i32 {
    let fwd = ((to + ALPHA - from) % ALPHA) as i32;
    let bwd = (ALPHA as i32) - fwd;
    if fwd <= bwd { fwd } else { -bwd }
}

/// Shortest <> distance in circular tape
fn tape_cost(from: usize, to: usize) -> i32 {
    let fwd = ((to + NCELLS - from) % NCELLS) as i32;
    let bwd = (NCELLS as i32) - fwd;
    fwd.min(bwd)
}

fn tape_dir(from: usize, to: usize) -> i32 {
    let fwd = ((to + NCELLS - from) % NCELLS) as i32;
    let bwd = (NCELLS as i32) - fwd;
    if fwd <= bwd { fwd } else { -bwd }
}

fn emit(ch: char, n: i32) -> String {
    if n >= 0 {
        std::iter::repeat(ch).take(n as usize).collect()
    } else {
        let neg = if ch == '>' { '<' } else { '-' };
        std::iter::repeat(neg).take((-n) as usize).collect()
    }
}

/// Greedy: for each char, pick the cell that minimizes move+change cost.
fn solve_greedy(phrase: &[usize]) -> String {
    let mut cells = [0usize; NCELLS];
    let mut pos = 0usize;
    let mut out = String::new();

    for &target in phrase {
        let mut best_cost = i32::MAX;
        let mut best_cell = 0;
        for c in 0..NCELLS {
            let cost = tape_cost(pos, c) + alpha_cost(cells[c], target);
            if cost < best_cost {
                best_cost = cost;
                best_cell = c;
            }
        }
        out.push_str(&emit('>', tape_dir(pos, best_cell)));
        pos = best_cell;
        out.push_str(&emit('+', alpha_dir(cells[pos], target)));
        cells[pos] = target;
        out.push('.');
    }
    out
}

/// Greedy with run-length: same-char runs use loops when beneficial.
fn solve_greedy_loops(phrase: &[usize]) -> String {
    let mut cells = [0usize; NCELLS];
    let mut pos = 0usize;
    let mut out = String::new();
    let mut i = 0;

    while i < phrase.len() {
        let target = phrase[i];
        let mut run = 1;
        while i + run < phrase.len() && phrase[i + run] == target {
            run += 1;
        }

        // Find best cell
        let mut best_cost = i32::MAX;
        let mut best_cell = 0;
        for c in 0..NCELLS {
            let cost = tape_cost(pos, c) + alpha_cost(cells[c], target);
            if cost < best_cost {
                best_cost = cost;
                best_cell = c;
            }
        }

        out.push_str(&emit('>', tape_dir(pos, best_cell)));
        pos = best_cell;
        out.push_str(&emit('+', alpha_dir(cells[pos], target)));
        cells[pos] = target;

        // Decide: dots vs loop
        let dots_cost = run;
        let loop_cost = loop_overhead(pos, run, &cells);

        if run >= 3 && loop_cost < dots_cost {
            // Use loop with adjacent counter cell
            let cc = pick_counter_cell(pos, &cells);
            let to_cc = tape_dir(pos, cc);
            let to_pos = tape_dir(cc, pos);
            let move_cost = to_cc.unsigned_abs() as usize + to_pos.unsigned_abs() as usize;

            if run <= 26 {
                out.push_str(&emit('>', to_cc));
                out.push_str(&emit('+', alpha_dir(cells[cc], run)));
                cells[cc] = run;
                out.push('[');
                out.push_str(&emit('>', to_pos));
                out.push('.');
                out.push_str(&emit('>', to_cc));
                out.push('-');
                out.push(']');
                cells[cc] = 0;
                out.push_str(&emit('>', to_pos));
                pos = pos; // we're back
            } else {
                // Nested loop: find a*b closest to run, a,b <= 26
                let (a, b, rem) = best_factors(run);
                if a > 0 {
                    let cc1 = pick_counter_cell(pos, &cells);
                    let cc2 = pick_counter_cell2(pos, cc1, &cells);
                    
                    let to_cc1 = tape_dir(pos, cc1);
                    let to_cc2 = tape_dir(cc1, cc2);
                    let cc2_to_pos = tape_dir(cc2, pos);
                    let pos_to_cc2 = tape_dir(pos, cc2);
                    let cc2_to_cc1 = tape_dir(cc2, cc1);

                    // Set cc1 = a
                    out.push_str(&emit('>', to_cc1));
                    out.push_str(&emit('+', alpha_dir(cells[cc1], a)));
                    cells[cc1] = a;

                    out.push('[');
                    // Set cc2 = b
                    out.push_str(&emit('>', to_cc2));
                    out.push_str(&emit('+', alpha_dir(cells[cc2], b)));
                    cells[cc2] = b;

                    out.push('[');
                    out.push_str(&emit('>', cc2_to_pos));
                    out.push('.');
                    out.push_str(&emit('>', pos_to_cc2));
                    out.push('-');
                    out.push(']');

                    out.push_str(&emit('>', cc2_to_cc1));
                    out.push('-');
                    out.push(']');

                    cells[cc1] = 0;
                    cells[cc2] = 0;

                    let cc1_to_pos = tape_dir(cc1, pos);
                    out.push_str(&emit('>', cc1_to_pos));
                    for _ in 0..rem {
                        out.push('.');
                    }
                } else {
                    for _ in 0..run { out.push('.'); }
                }
            }
        } else {
            for _ in 0..run { out.push('.'); }
        }

        i += run;
    }
    out
}

fn loop_overhead(pos: usize, run: usize, cells: &[usize; NCELLS]) -> usize {
    let cc = pick_counter_cell(pos, cells);
    let move_cost = tape_cost(pos, cc) as usize;
    let set_cost = if run <= 26 { alpha_cost(cells[cc], run) as usize } else { return run; };
    // Loop: move_to_cc + set + '[' + move_back + '.' + move_to_cc + '-' + ']' + move_back
    // = set_cost + move_cost + 1 + move_cost + 1 + move_cost + 1 + 1 + move_cost
    set_cost + 4 * move_cost + 4
}

fn pick_counter_cell(pos: usize, _cells: &[usize; NCELLS]) -> usize {
    (pos + 1) % NCELLS
}

fn pick_counter_cell2(pos: usize, cc1: usize, _cells: &[usize; NCELLS]) -> usize {
    let c = (pos + 2) % NCELLS;
    if c == cc1 { (pos + 3) % NCELLS } else { c }
}

fn best_factors(n: usize) -> (usize, usize, usize) {
    let mut best = (0, 0, n);
    for a in 2..=26 {
        let b = n / a;
        if b > 26 { continue; }
        let rem = n - a * b;
        if rem < best.2 {
            best = (a, b, rem);
        }
    }
    best
}

/// Try to detect full-phrase repeating patterns and use loops.
fn solve_pattern(phrase: &[usize]) -> Option<String> {
    let n = phrase.len();
    let max_pat = 26.min(n / 2);

    let mut best: Option<String> = None;

    for pat_len in 1..=max_pat.min(NCELLS - 1) {
        if n % pat_len != 0 { continue; }
        let repeats = n / pat_len;
        if repeats < 3 || repeats > 26 { continue; }
        let pattern = &phrase[..pat_len];
        if !phrase.chunks(pat_len).all(|c| c == pattern) { continue; }

        // Use cells 0..pat_len for pattern, cell pat_len as counter
        let cc = pat_len;
        let mut out = String::new();
        let mut pos = 0usize;

        // Set up pattern
        for (j, &ch) in pattern.iter().enumerate() {
            out.push_str(&emit('>', tape_dir(pos, j)));
            pos = j;
            out.push_str(&emit('+', alpha_dir(0, ch)));
        }

        // Set counter
        out.push_str(&emit('>', tape_dir(pos, cc)));
        out.push_str(&emit('+', alpha_dir(0, repeats)));
        pos = cc;

        out.push('[');
        for j in 0..pat_len {
            out.push_str(&emit('>', tape_dir(pos, j)));
            out.push('.');
            pos = j;
        }
        out.push_str(&emit('>', tape_dir(pos, cc)));
        out.push('-');
        pos = cc;
        out.push(']');

        if best.as_ref().map_or(true, |b| out.len() < b.len()) {
            best = Some(out);
        }
    }

    // Also try partial patterns (prefix is pattern * k, then remainder)
    for pat_len in 2..=max_pat.min(NCELLS - 1) {
        let pattern = &phrase[..pat_len];
        let mut repeats = 0;
        while (repeats + 1) * pat_len <= n 
            && phrase[repeats * pat_len..(repeats + 1) * pat_len] == *pattern 
        {
            repeats += 1;
        }
        if repeats < 3 || repeats > 26 { continue; }
        let remainder = &phrase[repeats * pat_len..];

        let cc = pat_len;
        let mut out = String::new();
        let mut pos = 0usize;
        let mut cells = [0usize; NCELLS];

        // Set up pattern
        for (j, &ch) in pattern.iter().enumerate() {
            out.push_str(&emit('>', tape_dir(pos, j)));
            pos = j;
            out.push_str(&emit('+', alpha_dir(0, ch)));
            cells[j] = ch;
        }

        // Set counter
        out.push_str(&emit('>', tape_dir(pos, cc)));
        out.push_str(&emit('+', alpha_dir(0, repeats)));
        cells[cc] = repeats;
        pos = cc;

        out.push('[');
        for j in 0..pat_len {
            out.push_str(&emit('>', tape_dir(pos, j)));
            out.push('.');
            pos = j;
        }
        out.push_str(&emit('>', tape_dir(pos, cc)));
        out.push('-');
        pos = cc;
        out.push(']');
        cells[cc] = 0;

        // Handle remainder with greedy
        for &target in remainder {
            let mut bc = i32::MAX;
            let mut bcell = 0;
            for c in 0..NCELLS {
                let cost = tape_cost(pos, c) + alpha_cost(cells[c], target);
                if cost < bc { bc = cost; bcell = c; }
            }
            out.push_str(&emit('>', tape_dir(pos, bcell)));
            pos = bcell;
            out.push_str(&emit('+', alpha_dir(cells[pos], target)));
            cells[pos] = target;
            out.push('.');
        }

        if best.as_ref().map_or(true, |b| out.len() < b.len()) {
            best = Some(out);
        }
    }

    best
}

/// Dedicated cell assignment: assign each unique char to a fixed cell, 
/// then just navigate between cells.
fn solve_fixed_assignment(phrase: &[usize]) -> String {
    // Count unique chars and their frequencies
    let mut freq = [0usize; ALPHA];
    for &c in phrase { freq[c] += 1; }
    let unique: Vec<usize> = (0..ALPHA).filter(|&c| freq[c] > 0).collect();
    
    if unique.len() > NCELLS { return solve_greedy(phrase); }

    // Assign chars to cells. Try to minimize total movement.
    // Simple heuristic: assign in order of first appearance, spread evenly.
    let mut first_seen = vec![0usize; ALPHA];
    let mut order = Vec::new();
    for (i, &c) in phrase.iter().enumerate() {
        if !order.contains(&c) {
            first_seen[c] = i;
            order.push(c);
        }
    }

    // Try multiple cell spacing strategies
    let mut best = String::new();
    let mut best_len = usize::MAX;

    for spacing in 1..=NCELLS / order.len().max(1) {
        for start in 0..NCELLS {
            let mut assignment = [ALPHA; ALPHA]; // char -> cell
            let mut valid = true;
            let mut used = [false; NCELLS];
            for (i, &ch) in order.iter().enumerate() {
                let cell = (start + i * spacing) % NCELLS;
                if used[cell] { valid = false; break; }
                used[cell] = true;
                assignment[ch] = cell;
            }
            if !valid { continue; }

            // Generate solution
            let mut out = String::new();
            let mut pos = 0usize;
            let mut cells = [0usize; NCELLS];

            for &target in phrase {
                let cell = assignment[target];
                out.push_str(&emit('>', tape_dir(pos, cell)));
                pos = cell;
                out.push_str(&emit('+', alpha_dir(cells[pos], target)));
                cells[pos] = target;
                out.push('.');
            }

            if out.len() < best_len {
                best_len = out.len();
                best = out;
            }
        }
    }

    best
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let phrase = input.trim_end_matches('\n');
    let phrase: Vec<usize> = if phrase.is_empty() {
        vec![]
    } else {
        phrase.chars().map(char_to_idx).collect()
    };

    if phrase.is_empty() {
        println!();
        return;
    }

    let mut candidates = vec![
        solve_greedy(&phrase),
        solve_greedy_loops(&phrase),
        solve_fixed_assignment(&phrase),
    ];

    if let Some(s) = solve_pattern(&phrase) {
        candidates.push(s);
    }

    let best = candidates.into_iter().min_by_key(|s| s.len()).unwrap();

    eprintln!("Length: {}", best.len());
    println!("{}", best);
}
