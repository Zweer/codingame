use std::io::{self, BufRead, Write};
use std::time::Instant;

#[inline(always)]
fn feedback(guess: &[u8], secret: &[u8]) -> u8 {
    let mut bulls = 0u8;
    let mut cows = 0u8;
    let mut smask = 0u16;
    for &s in secret.iter() { smask |= 1 << s; }
    for i in 0..guess.len() {
        if guess[i] == secret[i] { bulls += 1; }
        else if smask & (1 << guess[i]) != 0 { cows += 1; }
    }
    bulls * 16 + cows
}

/// Compact representation: store permutation as u64 (4 bits per digit, max 10 digits = 40 bits)
fn encode(perm: &[u8]) -> u64 {
    let mut v = 0u64;
    for &d in perm { v = (v << 4) | d as u64; }
    v
}

fn decode(v: u64, len: usize) -> Vec<u8> {
    let mut r = vec![0u8; len];
    let mut vv = v;
    for i in (0..len).rev() { r[i] = (vv & 0xF) as u8; vv >>= 4; }
    r
}

fn feedback_encoded(guess: &[u8], secret: u64, len: usize) -> u8 {
    let mut bulls = 0u8;
    let mut cows = 0u8;
    let mut smask = 0u16;
    let mut s = secret;
    // Extract secret digits and build mask
    let mut sd = [0u8; 10];
    for i in (0..len).rev() { sd[i] = (s & 0xF) as u8; s >>= 4; smask |= 1 << sd[i]; }
    for i in 0..len {
        if guess[i] == sd[i] { bulls += 1; }
        else if smask & (1 << guess[i]) != 0 { cows += 1; }
    }
    bulls * 16 + cows
}

/// Generate all valid permutations as encoded u64, with early pruning
fn generate_encoded(len: usize, constraints: &[(Vec<u8>, u8)]) -> Vec<u64> {
    let mut r = Vec::new();
    let mut p = [0u8; 11];
    let mut u = [false; 10];

    // Precompute: which digits MUST be in the number (appeared as bull or cow)
    // and which CANNOT be (0 bulls + 0 cows for all positions)
    let mut must_have = 0u16; // bitmask of digits that must appear
    let mut cant_have = 0u16; // bitmask of digits that can't appear
    let mut exact = [255u8; 11]; // exact[pos] = digit if known

    for (guess, fb) in constraints {
        let bulls = fb >> 4;
        let cows = fb & 0xF;
        if bulls + cows == 0 {
            // None of these digits are in the secret
            for &d in guess.iter() { cant_have |= 1 << d; }
        }
        // If a position has bull, we know exact digit
        // But we can't tell which position from aggregate feedback alone
    }

    fn build(p: &mut [u8; 11], depth: usize, u: &mut [bool; 10], len: usize,
             r: &mut Vec<u64>, constraints: &[(Vec<u8>, u8)], cant_have: u16) {
        if depth == len {
            let sl = &p[..len];
            for (guess, fb) in constraints {
                if feedback(guess, sl) != *fb { return; }
            }
            r.push(encode(sl));
            return;
        }
        let start = if depth == 0 { 1 } else { 0 };
        for d in start..10u8 {
            if u[d as usize] { continue; }
            if cant_have & (1 << d) != 0 { continue; } // prune!
            u[d as usize] = true;
            p[depth] = d;
            build(p, depth + 1, u, len, r, constraints, cant_have);
            u[d as usize] = false;
        }
    }
    build(&mut p, 0, &mut u, len, &mut r, constraints, cant_have);
    r
}

fn score_fast(guess: &[u8], cands: &[u64], len: usize, max_sample: usize) -> f64 {
    let step = (cands.len() / max_sample).max(1);
    let mut buckets = [0u32; 256];
    let mut n = 0u32;
    for i in (0..cands.len()).step_by(step) {
        buckets[feedback_encoded(guess, cands[i], len) as usize] += 1;
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

    // If too many candidates, just pick first (no time for scoring)
    if cands.len() > 5000 { return decode(cands[0], len); }

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

    // Hardcoded guesses for gathering info before expensive generation
    let hc_guesses: [&[u8]; 4] = [
        &[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        &[5, 6, 7, 8, 9, 0, 1, 2, 3, 4],
        &[3, 8, 1, 6, 9, 0, 5, 2, 7, 4],
        &[9, 0, 7, 2, 5, 4, 3, 8, 1, 6],
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
                    candidates.retain(|&c| feedback_encoded(guess, c, num_len) == fb);
                }
            }
        }

        // Decide: use hardcoded guess or generate candidates
        let min_hc = if num_len >= 10 { 4 } else if num_len >= 9 { 3 } else if num_len >= 7 { 2 } else { 1 };

        if !generated && (turn == 1 || constraints.len() < min_hc) {
            // Use hardcoded guess
            let idx = (turn - 1).min(hc_guesses.len() - 1);
            let mut g = hc_guesses[idx][..num_len].to_vec();
            if g[0] == 0 { g.swap(0, 1); }
            writeln!(out, "{}", to_string(&g)).unwrap();
            out.flush().unwrap();
            last_guess = Some(g);
            continue;
        }

        if !generated {
            candidates = generate_encoded(num_len, &constraints);
            generated = true;
        }

        if candidates.is_empty() {
            candidates = generate_encoded(num_len, &constraints);
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
