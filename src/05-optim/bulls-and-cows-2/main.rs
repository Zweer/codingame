use std::io::{self, BufRead, Write};
use std::time::Instant;

const MAXLEN: usize = 11;

#[inline(always)]
fn feedback(guess: &[u8], secret: &[u8], len: usize) -> u8 {
    let mut bulls = 0u8;
    let mut cows = 0u8;
    let mut smask = 0u16;
    for i in 0..len { smask |= 1 << secret[i]; }
    for i in 0..len {
        if guess[i] == secret[i] { bulls += 1; }
        else if smask & (1 << guess[i]) != 0 { cows += 1; }
    }
    bulls * 16 + cows
}

/// Partial feedback: compute bulls and cows for positions 0..depth only.
/// Returns (exact_bulls, max_possible_bulls, min_cows, max_cows)
/// Used for pruning during generation.
fn partial_check(guess: &[u8], partial: &[u8], depth: usize, len: usize, used: &[bool; 10], target_fb: u8) -> bool {
    let target_bulls = target_fb >> 4;
    let target_cows = target_fb & 0xF;
    let total = target_bulls + target_cows;

    // Count bulls so far
    let mut bulls = 0u8;
    for i in 0..depth {
        if guess[i] == partial[i] { bulls += 1; }
    }
    // Already too many bulls?
    if bulls > target_bulls { return false; }

    // Remaining positions can add at most (len - depth) more bulls
    let remaining = (len - depth) as u8;
    if bulls + remaining < target_bulls { return false; }

    // Count how many guess digits are "used" (present in partial so far)
    let mut partial_mask = 0u16;
    for i in 0..depth { partial_mask |= 1 << partial[i]; }

    let mut matched = 0u8; // guess digits found in partial (bulls + cows from placed digits)
    for i in 0..len {
        if i < depth && guess[i] == partial[i] {
            matched += 1; // bull
        } else if partial_mask & (1 << guess[i]) != 0 {
            matched += 1; // cow (from already-placed digits)
        }
    }

    // matched can only grow as we place more digits. If already > total, prune.
    if matched > total { return false; }

    // How many unplaced guess digits could still match?
    // Unplaced digits are those not yet in `used` and not in partial_mask
    // This is hard to compute exactly, so just check: can we still reach `total`?
    let unplaced_slots = remaining;
    if matched + unplaced_slots < total { return false; }

    true
}

fn generate_filtered(len: usize, constraints: &[(Vec<u8>, u8)]) -> Vec<u64> {
    let mut result = Vec::new();
    let mut p = [0u8; MAXLEN];
    let mut used = [false; 10];

    // Precompute cant_have
    let mut cant_have = 0u16;
    for (guess, fb) in constraints {
        if *fb == 0 { // 0 bulls, 0 cows
            for i in 0..len { cant_have |= 1 << guess[i]; }
        }
    }

    fn build(p: &mut [u8; MAXLEN], depth: usize, used: &mut [bool; 10], len: usize,
             result: &mut Vec<u64>, constraints: &[(Vec<u8>, u8)], cant_have: u16) {
        if depth == len {
            for (guess, fb) in constraints {
                if feedback(guess, p, len) != *fb { return; }
            }
            let mut v = 0u64;
            for i in 0..len { v = (v << 4) | p[i] as u64; }
            result.push(v);
            return;
        }
        let start = if depth == 0 { 1u8 } else { 0u8 };
        for d in start..10 {
            if used[d as usize] { continue; }
            if cant_have & (1 << d) != 0 { continue; }

            p[depth] = d;
            used[d as usize] = true;

            // Partial pruning: check each constraint
            let mut ok = true;
            for (guess, fb) in constraints.iter() {
                if !partial_check(guess, p, depth + 1, len, used, *fb) {
                    ok = false;
                    break;
                }
            }

            if ok {
                build(p, depth + 1, used, len, result, constraints, cant_have);
            }

            used[d as usize] = false;
        }
    }

    build(&mut p, 0, &mut used, len, &mut result, constraints, cant_have);
    result
}

fn decode(v: u64, len: usize) -> Vec<u8> {
    let mut r = vec![0u8; len];
    let mut vv = v;
    for i in (0..len).rev() { r[i] = (vv & 0xF) as u8; vv >>= 4; }
    r
}

fn feedback_enc(guess: &[u8], secret: u64, len: usize) -> u8 {
    let mut bulls = 0u8;
    let mut cows = 0u8;
    let mut smask = 0u16;
    let mut s = secret;
    let mut sd = [0u8; MAXLEN];
    for i in (0..len).rev() { sd[i] = (s & 0xF) as u8; s >>= 4; smask |= 1 << sd[i]; }
    for i in 0..len {
        if guess[i] == sd[i] { bulls += 1; }
        else if smask & (1 << guess[i]) != 0 { cows += 1; }
    }
    bulls * 16 + cows
}

fn score_fast(guess: &[u8], cands: &[u64], len: usize, max_sample: usize) -> f64 {
    let step = (cands.len() / max_sample).max(1);
    let mut buckets = [0u32; 256];
    let mut n = 0u32;
    for i in (0..cands.len()).step_by(step) {
        buckets[feedback_enc(guess, cands[i], len) as usize] += 1;
        n += 1;
    }
    let nf = n as f64;
    buckets.iter().filter(|&&b| b > 0).map(|&b| (b as f64) * (b as f64)).sum::<f64>() / nf
}

fn first_guess(len: usize) -> Vec<u8> {
    let mut v: Vec<u8> = (1..=len.min(9)).map(|d| d as u8).collect();
    if len == 10 { v.push(0); }
    v
}

fn best_guess(cands: &[u64], len: usize, start: &Instant) -> Vec<u8> {
    if cands.len() <= 1 { return if cands.is_empty() { first_guess(len) } else { decode(cands[0], len) }; }
    if cands.len() > 5000 { return decode(cands[cands.len() / 2], len); }

    let max_sample = 2000.min(cands.len());
    let max_guesses = if cands.len() > 1000 { 50 } else { cands.len().min(200) };
    let step = (cands.len() / max_guesses).max(1);

    let mut best_v = cands[0];
    let mut best_s = f64::MAX;
    for i in (0..cands.len()).step_by(step) {
        if start.elapsed().as_millis() > 30 { break; }
        let g = decode(cands[i], len);
        let s = score_fast(&g, cands, len, max_sample);
        if s < best_s { best_s = s; best_v = cands[i]; }
    }
    decode(best_v, len)
}

fn to_string(d: &[u8]) -> String { d.iter().map(|&x| (b'0' + x) as char).collect() }

fn main() {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = io::BufWriter::new(stdout.lock());
    let mut input = stdin.lock();
    let mut line = String::new();

    input.read_line(&mut line).unwrap();
    let num_len: usize = line.trim().parse().unwrap();

    let mut candidates: Vec<u64> = Vec::new();
    let mut constraints: Vec<(Vec<u8>, u8)> = Vec::new();
    let mut last_guess: Option<Vec<u8>> = None;
    let mut turn = 0;
    let mut generated = false;

    let hc: Vec<Vec<u8>> = vec![
        vec![1,2,3,4,5,6,7,8,9,0],
        vec![5,6,7,8,9,0,1,2,3,4],
        vec![3,8,1,6,9,0,5,2,7,4],
        vec![9,0,7,2,5,4,3,8,1,6],
        vec![2,4,6,8,0,1,3,5,7,9],
        vec![7,0,5,9,3,2,8,4,6,1],
        vec![8,3,0,5,7,6,9,1,4,2],
        vec![4,9,2,0,1,8,6,7,5,3],
    ];

    loop {
        line.clear();
        if input.read_line(&mut line).unwrap() == 0 { break; }
        let vals: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
        if vals.len() < 2 { continue; }
        let (bulls, cows) = (vals[0], vals[1]);
        let start = Instant::now();
        turn += 1;

        if bulls >= 0 && cows >= 0 {
            if let Some(ref guess) = last_guess {
                if bulls as usize == num_len { break; }
                let fb = bulls as u8 * 16 + cows as u8;
                constraints.push((guess.clone(), fb));
                if generated {
                    candidates.retain(|&c| feedback_enc(guess, c, num_len) == fb);
                }
            }
        }

        // Use hardcoded guesses until we have enough constraints for fast generation
        let min_hc = if num_len >= 10 { hc.len() } else if num_len >= 9 { 6 } else if num_len >= 8 { 3 } else if num_len >= 7 { 2 } else { 1 };
        if !generated && constraints.len() < min_hc {
            let idx = turn - 1;
            let mut g = if idx < hc.len() { hc[idx][..num_len].to_vec() } else { first_guess(num_len) };
            if g[0] == 0 { g.swap(0, 1); }
            writeln!(out, "{}", to_string(&g)).unwrap();
            out.flush().unwrap();
            last_guess = Some(g);
            continue;
        }

        if !generated {
            candidates = generate_filtered(num_len, &constraints);
            generated = true;
        }

        if candidates.is_empty() {
            candidates = generate_filtered(num_len, &constraints);
        }

        let guess = if candidates.len() == 1 {
            decode(candidates[0], num_len)
        } else {
            best_guess(&candidates, num_len, &start)
        };

        writeln!(out, "{}", to_string(&guess)).unwrap();
        out.flush().unwrap();
        last_guess = Some(guess);
    }
}
