use std::collections::HashMap;

const WLEN: usize = 6;
type Word = [u8; WLEN];

fn feedback(guess: &Word, secret: &Word) -> [u8; WLEN] {
    let mut r = [1u8; WLEN];
    let mut su = [false; WLEN];
    let mut gu = [false; WLEN];
    for i in 0..WLEN {
        if guess[i] == secret[i] { r[i] = 3; su[i] = true; gu[i] = true; }
    }
    for i in 0..WLEN {
        if gu[i] { continue; }
        for j in 0..WLEN {
            if !su[j] && guess[i] == secret[j] { r[i] = 2; su[j] = true; break; }
        }
    }
    r
}

fn fb_key(fb: &[u8; WLEN]) -> u16 {
    let mut k = 0u16;
    for i in 0..WLEN { k = k * 4 + fb[i] as u16; }
    k
}

const ALL_CORRECT: u16 = {
    let mut k = 0u16;
    let mut i = 0;
    while i < WLEN { k = k * 4 + 3; i += 1; }
    k
};

fn score(guess: &Word, cands: &[Word]) -> f64 {
    let mut groups: HashMap<u16, u32> = HashMap::with_capacity(128);
    for c in cands {
        *groups.entry(fb_key(&feedback(guess, c))).or_insert(0) += 1;
    }
    let n = cands.len() as f64;
    groups.values().map(|&c| (c as f64).powi(2)).sum::<f64>() / n
}

fn to_arr(s: &str) -> Word {
    let mut a = [0u8; WLEN];
    for (i, b) in s.bytes().enumerate().take(WLEN) { a[i] = b; }
    a
}

fn best_guess(cands: &[Word], all: &[Word], first_turn: bool) -> Word {
    if cands.len() <= 2 { return cands[0]; }

    use std::collections::HashSet;
    let cand_set: HashSet<Word> = cands.iter().copied().collect();

    let max_eval = if first_turn { 1500 } else { 600 };
    let step = (all.len() / max_eval).max(1);

    let mut best_w = cands[0];
    let mut best_s = f64::MAX;

    // Sample from full dictionary
    for i in (0..all.len()).step_by(step) {
        let w = &all[i];
        let s = score(w, cands);
        let bonus = if cand_set.contains(w) { -0.5 } else { 0.0 };
        if s + bonus < best_s { best_s = s + bonus; best_w = *w; }
    }

    // Always evaluate all remaining candidates too
    for w in cands {
        let s = score(w, cands);
        if s - 0.5 < best_s { best_s = s - 0.5; best_w = *w; }
    }

    best_w
}

// @ts-expect-error
fn readline() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s
}

fn main() {
    let word_count: usize = readline().trim().parse().unwrap();
    let words_line = readline();
    let all_words: Vec<Word> = words_line.trim().split_whitespace()
        .map(|w| to_arr(&w.to_uppercase()))
        .collect();

    let mut candidates = all_words.clone();
    let mut last_guess: Option<Word> = None;

    loop {
        let line = readline();
        let states: Vec<u8> = line.trim().split_whitespace()
            .map(|s| s.parse().unwrap())
            .collect();
        if states.len() < WLEN { break; }

        let all_zero = states.iter().all(|&s| s == 0);

        if !all_zero {
            // Filter candidates based on last guess + feedback
            if let Some(ref guess) = last_guess {
                let mut fb = [0u8; WLEN];
                for i in 0..WLEN { fb[i] = states[i]; }

                // Check if we already won
                if fb_key(&fb) == ALL_CORRECT {
                    // Game should end, but just in case
                    break;
                }

                candidates.retain(|c| feedback(guess, c) == fb);
            }
        }

        if candidates.is_empty() {
            // Shouldn't happen, but fallback
            println!("{}", std::str::from_utf8(&all_words[0]).unwrap_or("AAAAAA"));
            continue;
        }

        if candidates.len() == 1 {
            let w: String = candidates[0].iter().map(|&b| b as char).collect();
            println!("{}", w);
            last_guess = Some(candidates[0]);
            continue;
        }

        let guess = best_guess(&candidates, &all_words, all_zero);
        let w: String = guess.iter().map(|&b| b as char).collect();
        println!("{}", w);
        last_guess = Some(guess);
    }
}
