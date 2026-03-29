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

/// Tight partial pruning during permutation generation.
/// p[0..depth] are placed. Check if target feedback is still achievable.
fn partial_ok(guess: &[u8], p: &[u8; MAXLEN], depth: usize, len: usize, used: &[bool; 10], target: u8) -> bool {
    let tb = (target >> 4) as i8;
    let tc = (target & 0xF) as i8;

    // Bulls from placed positions
    let mut bulls: i8 = 0;
    for i in 0..depth {
        if guess[i] == p[i] { bulls += 1; }
    }
    if bulls > tb { return false; }

    // Max additional bulls from unplaced positions
    let remaining = (len - depth) as i8;
    if bulls + remaining < tb { return false; }

    // Cows from placed positions: guess digits (not bulls) that appear in placed set
    let mut pmask = 0u16;
    for i in 0..depth { pmask |= 1 << p[i]; }

    let mut cows: i8 = 0;
    for i in 0..len {
        if i < depth {
            // This position is placed; if not a bull, check if guess[i] is elsewhere in secret
            // We can't know yet, but we know placed digits
            continue;
        }
        // Unplaced guess position: if guess[i] is in placed digits (and not a bull at that pos)
        if pmask & (1 << guess[i]) != 0 {
            // guess[i] matches a placed digit — this will be a cow
            // But only if guess[i] != p[i] (which we don't know for unplaced i)
            // Conservative: count it
            cows += 1;
        }
    }
    // Also count placed non-bull guess digits that match unplaced secret digits
    // This is hard to bound tightly, so use: total matched = bulls + cows_so_far
    // where cows_so_far counts guess digits matched by placed secret digits
    let mut placed_cows: i8 = 0;
    for i in 0..depth {
        if guess[i] != p[i] {
            // guess[i] at position i is not a bull. Is guess[i] in the secret?
            // We don't know the full secret, but if guess[i] is used (placed somewhere), it's a cow
            // Actually we need: is guess[i] in the SECRET, not in the partial
            // Skip — too complex for partial check
        }
    }

    // Simpler tight bound: count total matches possible
    // Digits in guess that are in placed set (pmask): these are guaranteed matches (bull or cow)
    let mut guaranteed = 0i8;
    let mut gmask_used = 0u16; // avoid double-counting same digit
    for i in 0..len {
        let d = guess[i];
        if pmask & (1 << d) != 0 && gmask_used & (1 << d) == 0 {
            guaranteed += 1;
            gmask_used |= 1 << d;
        }
    }
    // Digits in guess NOT in placed set: could still match unplaced digits
    let mut could_match = 0i8;
    for i in 0..len {
        let d = guess[i];
        if gmask_used & (1 << d) != 0 { continue; }
        if !used[d as usize] { // digit d is not yet placed, could appear later
            could_match += 1;
            gmask_used |= 1 << d;
        }
    }

    let total_target = tb + tc;
    if guaranteed > total_target { return false; }
    if guaranteed + could_match < total_target { return false; }

    // Also: bulls can't exceed tb, and we already have `bulls` from placed positions
    // For remaining positions, count how many COULD be bulls
    let mut possible_extra_bulls = 0i8;
    for i in depth..len {
        if !used[guess[i] as usize] { possible_extra_bulls += 1; }
    }
    if bulls + possible_extra_bulls < tb { return false; }

    true
}

fn generate_filtered(len: usize, constraints: &[(Vec<u8>, u8)]) -> Vec<u64> {
    let mut result = Vec::new();
    let mut p = [0u8; MAXLEN];
    let mut used = [false; 10];

    let mut cant_have = 0u16;
    for (guess, fb) in constraints {
        if *fb == 0 {
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
            if used[d as usize] || cant_have & (1 << d) != 0 { continue; }

            p[depth] = d;
            used[d as usize] = true;

            let mut ok = true;
            for (guess, fb) in constraints.iter() {
                if !partial_ok(guess, p, depth + 1, len, used, *fb) {
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
    let mut sd = [0u8; MAXLEN];
    let mut smask = 0u16;
    let mut s = secret;
    for i in (0..len).rev() { sd[i] = (s & 0xF) as u8; s >>= 4; smask |= 1 << sd[i]; }
    let mut bulls = 0u8;
    let mut cows = 0u8;
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
