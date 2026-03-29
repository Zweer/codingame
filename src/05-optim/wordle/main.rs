use std::io::{self, BufRead, Write};

const WLEN: usize = 6;
type Word = [u8; WLEN];

/// CodinGame feedback: NOT standard Wordle count-based!
/// Pass 1: exact matches → 3
/// Pass 2: if letter exists ANYWHERE in secret → 2 (no counting!)
fn feedback(guess: &Word, secret: &Word) -> u16 {
    let mut r = [1u8; WLEN];
    // Pass 1: exact
    for i in 0..WLEN {
        if guess[i] == secret[i] { r[i] = 3; }
    }
    // Pass 2: present anywhere
    for i in 0..WLEN {
        if r[i] == 3 { continue; }
        for j in 0..WLEN {
            if guess[i] == secret[j] { r[i] = 2; break; }
        }
    }
    let mut k = 0u16;
    for i in 0..WLEN { k = k * 4 + r[i] as u16; }
    k
}

fn feedback_arr(guess: &Word, secret: &Word) -> [u8; WLEN] {
    let mut r = [1u8; WLEN];
    for i in 0..WLEN {
        if guess[i] == secret[i] { r[i] = 3; }
    }
    for i in 0..WLEN {
        if r[i] == 3 { continue; }
        for j in 0..WLEN {
            if guess[i] == secret[j] { r[i] = 2; break; }
        }
    }
    r
}

fn score(guess: &Word, cands: &[Word]) -> f64 {
    let mut buckets = [0u32; 4096];
    for c in cands { buckets[feedback(guess, c) as usize] += 1; }
    let n = cands.len() as f64;
    let mut sum = 0.0f64;
    for &b in &buckets { if b > 0 { sum += (b as f64) * (b as f64); } }
    sum / n
}

fn to_upper(b: u8) -> u8 { if b >= b'a' && b <= b'z' { b - 32 } else { b } }

fn to_arr(s: &str) -> Word {
    let mut a = [0u8; WLEN];
    for (i, b) in s.bytes().enumerate().take(WLEN) { a[i] = to_upper(b); }
    a
}

fn to_str(w: &Word) -> String { w.iter().map(|&b| b as char).collect() }

fn best_guess(cands: &[Word], all: &[Word], first_turn: bool) -> Word {
    if cands.len() <= 2 { return cands[0]; }

    // Hardcoded optimal opener
    if first_turn {
        return *b"CARIES";
    }

    let mut best_w = cands[0];
    let mut best_s = f64::MAX;

    // Evaluate all remaining candidates
    for w in cands {
        let s = score(w, cands) - 0.5; // bonus: can win immediately
        if s < best_s { best_s = s; best_w = *w; }
    }

    // Also sample from full dictionary (non-candidates can split better)
    if cands.len() > 3 && cands.len() <= 2000 {
        let step = (all.len() / 1000).max(1);
        for i in (0..all.len()).step_by(step) {
            let s = score(&all[i], cands);
            if s < best_s { best_s = s; best_w = all[i]; }
        }
    }

    best_w
}

fn main() {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = io::BufWriter::new(stdout.lock());
    let mut input = stdin.lock();
    let mut line = String::new();

    input.read_line(&mut line).unwrap();
    let word_count: usize = line.trim().parse().unwrap();

    let mut all_words: Vec<Word> = Vec::with_capacity(word_count);
    while all_words.len() < word_count {
        line.clear();
        if input.read_line(&mut line).unwrap() == 0 { break; }
        for w in line.split_whitespace() {
            if w.len() == WLEN && all_words.len() < word_count {
                all_words.push(to_arr(w));
            }
        }
    }

    let mut candidates = all_words.clone();
    let mut last_guess: Option<Word> = None;
    let mut first_turn = true;

    loop {
        line.clear();
        if input.read_line(&mut line).unwrap() == 0 { break; }
        let states: Vec<u8> = line.split_whitespace()
            .filter_map(|s| s.parse().ok())
            .collect();
        if states.len() < WLEN { continue; }

        if !states.iter().all(|&s| s == 0) {
            if let Some(ref guess) = last_guess {
                if states.iter().all(|&s| s == 3) {
                    break;
                }
                let mut fb = [0u8; WLEN];
                for i in 0..WLEN { fb[i] = states[i]; }
                candidates.retain(|c| feedback_arr(guess, c) == fb);
            }
        }

        if candidates.is_empty() { candidates = all_words.clone(); }

        let guess = if candidates.len() == 1 {
            candidates[0]
        } else {
            best_guess(&candidates, &all_words, first_turn)
        };

        writeln!(out, "{}", to_str(&guess)).unwrap();
        out.flush().unwrap();
        last_guess = Some(guess);
        first_turn = false;
    }
}
