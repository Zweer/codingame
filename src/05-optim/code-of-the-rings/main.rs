use std::io;

const NCELLS: usize = 30;
const ALPHA: usize = 27; // ' ', 'A'..'Z'

fn char_to_idx(c: char) -> usize {
    if c == ' ' { 0 } else { (c as usize) - ('A' as usize) + 1 }
}

fn idx_to_char(i: usize) -> char {
    if i == 0 { ' ' } else { (b'A' + (i - 1) as u8) as char }
}

/// Shortest distance in circular alphabet of size ALPHA
fn alpha_dist(from: usize, to: usize) -> (i32, i32) {
    let fwd = ((to + ALPHA - from) % ALPHA) as i32;
    let bwd = ((from + ALPHA - to) % ALPHA) as i32;
    if fwd <= bwd { (fwd, 1) } else { (-bwd, -1) }
}

/// Shortest distance in circular tape of size NCELLS
fn tape_dist(from: usize, to: usize) -> (i32, i32) {
    let fwd = ((to + NCELLS - from) % NCELLS) as i32;
    let bwd = ((from + NCELLS - to) % NCELLS) as i32;
    if fwd <= bwd { (fwd, 1) } else { (-bwd, -1) }
}

fn repeat_char(c: char, n: i32) -> String {
    std::iter::repeat(c).take(n as usize).collect()
}

fn move_str(dist: i32, pos_char: char, neg_char: char) -> String {
    if dist >= 0 {
        repeat_char(pos_char, dist)
    } else {
        repeat_char(neg_char, -dist)
    }
}

/// Greedy approach: for each character in the phrase, find the best cell to use.
/// "Best" = cell that minimizes (move_to_cell_cost + change_rune_cost).
/// After outputting '.', the cell's rune value is updated.
fn solve_greedy(phrase: &[usize]) -> String {
    let mut cells = [0usize; NCELLS]; // current rune value per cell
    let mut pos = 0usize; // current position on tape
    let mut out = String::new();

    for &target in phrase {
        // Find best cell
        let mut best_cost = i32::MAX;
        let mut best_cell = 0;
        for c in 0..NCELLS {
            let (td, _) = tape_dist(pos, c);
            let (ad, _) = alpha_dist(cells[c], target);
            let cost = td.abs() + ad.abs();
            if cost < best_cost {
                best_cost = cost;
                best_cell = c;
            }
        }

        // Move to best cell
        let (td, _) = tape_dist(pos, best_cell);
        out.push_str(&move_str(td, '>', '<'));
        pos = best_cell;

        // Change rune
        let (ad, _) = alpha_dist(cells[pos], target);
        out.push_str(&move_str(ad, '+', '-'));
        cells[pos] = target;

        out.push('.');
    }
    out
}

/// Try to use a simple loop pattern for runs of the same character.
/// For a run of N identical chars already set on a cell: just do "." N times.
/// But we can also use loops for repeated patterns.
fn solve_with_simple_loops(phrase: &[usize]) -> String {
    let mut cells = [0usize; NCELLS]; 
    let mut pos = 0usize;
    let mut out = String::new();
    let mut i = 0;

    while i < phrase.len() {
        let target = phrase[i];

        // Count run of same character
        let mut run = 1;
        while i + run < phrase.len() && phrase[i + run] == target {
            run += 1;
        }

        // Find best cell for this target
        let mut best_cost = i32::MAX;
        let mut best_cell = 0;
        for c in 0..NCELLS {
            let (td, _) = tape_dist(pos, c);
            let (ad, _) = alpha_dist(cells[c], target);
            let cost = td.abs() + ad.abs();
            if cost < best_cost {
                best_cost = cost;
                best_cell = c;
            }
        }

        // Move to best cell
        let (td, _) = tape_dist(pos, best_cell);
        out.push_str(&move_str(td, '>', '<'));
        pos = best_cell;

        // Change rune to target
        let (ad, _) = alpha_dist(cells[pos], target);
        out.push_str(&move_str(ad, '+', '-'));
        cells[pos] = target;

        if run >= 4 {
            // Use loop: set counter on adjacent cell, then loop
            // Find a neighbor cell to use as counter
            let counter_cell = (pos + 1) % NCELLS;
            let saved_counter = cells[counter_cell];

            // Set counter cell to run value (using alphabet: run maps to index)
            // We need counter to count down to space (0).
            // Set counter = run, then loop: [<.>-] or similar
            // But counter is in alphabet space (0-26), so max run per loop = 26
            
            if run <= 26 {
                // Move to counter cell, set it to `run`
                let (td2, _) = tape_dist(pos, counter_cell);
                out.push_str(&move_str(td2, '>', '<'));
                let (ad2, _) = alpha_dist(cells[counter_cell], run);
                out.push_str(&move_str(ad2, '+', '-'));
                cells[counter_cell] = run;

                // Loop: go back to target cell, print, go to counter, decrement
                let (back, _) = tape_dist(counter_cell, pos);
                let (fwd, _) = tape_dist(pos, counter_cell);
                let back_str = move_str(back, '>', '<');
                let fwd_str = move_str(fwd, '>', '<');

                out.push('[');
                out.push_str(&back_str);
                out.push('.');
                out.push_str(&fwd_str);
                out.push('-');
                out.push(']');

                cells[counter_cell] = 0; // counter ends at space
                // Move back to target cell
                let (back2, _) = tape_dist(counter_cell, pos);
                out.push_str(&move_str(back2, '>', '<'));
            } else {
                // run > 26: nest or just repeat dots
                // For simplicity, use multiple loops or just dots
                // Use outer*inner loop: find a,b where a*b = run, a<=26, b<=26
                let mut best_a = 0;
                let mut best_b = 0;
                let mut best_rem = run;
                for a in 2..=26 {
                    let b = run / a;
                    let rem = run - a * b;
                    if b <= 26 && rem < best_rem {
                        best_a = a;
                        best_b = b;
                        best_rem = rem;
                    }
                }

                if best_a > 0 && best_b > 0 {
                    let counter1 = (pos + 1) % NCELLS;
                    let counter2 = (pos + 2) % NCELLS;

                    // Set counter1 = best_a
                    let (td1, _) = tape_dist(pos, counter1);
                    out.push_str(&move_str(td1, '>', '<'));
                    let (ad1, _) = alpha_dist(cells[counter1], best_a);
                    out.push_str(&move_str(ad1, '+', '-'));
                    cells[counter1] = best_a;

                    // Outer loop
                    out.push('[');

                    // Set counter2 = best_b
                    let (td2, _) = tape_dist(counter1, counter2);
                    out.push_str(&move_str(td2, '>', '<'));
                    let (ad2, _) = alpha_dist(cells[counter2], best_b);
                    out.push_str(&move_str(ad2, '+', '-'));
                    cells[counter2] = best_b;

                    // Inner loop
                    out.push('[');
                    let (to_target, _) = tape_dist(counter2, pos);
                    out.push_str(&move_str(to_target, '>', '<'));
                    out.push('.');
                    let (to_c2, _) = tape_dist(pos, counter2);
                    out.push_str(&move_str(to_c2, '>', '<'));
                    out.push('-');
                    out.push(']');

                    // Back to counter1, decrement
                    let (to_c1, _) = tape_dist(counter2, counter1);
                    out.push_str(&move_str(to_c1, '>', '<'));
                    out.push('-');
                    out.push(']');

                    cells[counter1] = 0;
                    cells[counter2] = 0;

                    // Print remainder
                    let (back, _) = tape_dist(counter1, pos);
                    out.push_str(&move_str(back, '>', '<'));
                    for _ in 0..best_rem {
                        out.push('.');
                    }
                } else {
                    // Fallback: just dots
                    for _ in 0..run {
                        out.push('.');
                    }
                }
            }
        } else {
            for _ in 0..run {
                out.push('.');
            }
        }

        i += run;
    }
    out
}

/// Advanced: try to detect repeating multi-char patterns and use loops.
/// For example "ABCABC" → set A,B,C on cells 0,1,2, then loop 2x: [print 0,1,2, dec counter]
fn solve_pattern_loops(phrase: &[usize]) -> String {
    let mut best = solve_greedy(phrase);

    // Try pattern lengths 2..=min(26, phrase.len()/2)
    let max_pat = 26.min(phrase.len() / 2);
    for pat_len in 2..=max_pat {
        if phrase.len() % pat_len != 0 { continue; }
        let pattern = &phrase[..pat_len];
        let repeats = phrase.len() / pat_len;
        if repeats < 3 { continue; }
        if !phrase.chunks(pat_len).all(|chunk| chunk == pattern) { continue; }
        if repeats > 26 { continue; }

        // Entire phrase is `pattern` repeated `repeats` times
        // Strategy: use cells 0..pat_len for the pattern chars, cell pat_len as counter
        let counter_cell = pat_len;
        let mut out = String::new();

        // Set up pattern chars on cells 0..pat_len
        let mut pos = 0usize;
        let mut cells = [0usize; NCELLS];
        for (j, &ch) in pattern.iter().enumerate() {
            let (td, _) = tape_dist(pos, j);
            out.push_str(&move_str(td, '>', '<'));
            pos = j;
            let (ad, _) = alpha_dist(cells[j], ch);
            out.push_str(&move_str(ad, '+', '-'));
            cells[j] = ch;
        }

        // Move to counter cell, set to repeats
        let (td, _) = tape_dist(pos, counter_cell);
        out.push_str(&move_str(td, '>', '<'));
        let (ad, _) = alpha_dist(0, repeats);
        out.push_str(&move_str(ad, '+', '-'));
        pos = counter_cell;

        // Loop
        out.push('[');
        // Print all pattern cells
        for j in 0..pat_len {
            let (td2, _) = tape_dist(pos, j);
            out.push_str(&move_str(td2, '>', '<'));
            out.push('.');
            pos = j;
        }
        // Back to counter, decrement
        let (td3, _) = tape_dist(pos, counter_cell);
        out.push_str(&move_str(td3, '>', '<'));
        out.push('-');
        pos = counter_cell;
        out.push(']');

        if out.len() < best.len() {
            best = out;
        }
    }

    best
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let phrase = input.trim_end_matches('\n');
    // Handle empty phrase edge case
    let phrase: Vec<usize> = if phrase.is_empty() {
        vec![]
    } else {
        phrase.chars().map(char_to_idx).collect()
    };

    if phrase.is_empty() {
        println!();
        return;
    }

    // Try multiple strategies, pick shortest
    let s1 = solve_greedy(&phrase);
    let s2 = solve_with_simple_loops(&phrase);
    let s3 = solve_pattern_loops(&phrase);

    let mut best = s1;
    if s2.len() < best.len() { best = s2; }
    if s3.len() < best.len() { best = s3; }

    // Verify solution length < 4000
    assert!(best.len() < 4000, "Solution too long: {}", best.len());

    println!("{}", best);
}
