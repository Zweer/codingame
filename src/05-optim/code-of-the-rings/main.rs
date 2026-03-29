use std::io;
use std::time::Instant;

const NC: usize = 30;
const AL: usize = 27;
const SA_MS: u128 = 1500;

fn c2i(c: char) -> usize { if c == ' ' { 0 } else { (c as usize) - 64 } }

fn ad(a: usize, b: usize) -> i32 {
    let f = ((b + AL - a) % AL) as i32;
    if f * 2 <= AL as i32 { f } else { f - AL as i32 }
}

fn td(a: usize, b: usize) -> i32 {
    let f = ((b + NC - a) % NC) as i32;
    if f * 2 <= NC as i32 { f } else { f - NC as i32 }
}

fn em(n: i32, p: char, m: char) -> String {
    if n >= 0 { std::iter::repeat(p).take(n as usize).collect() }
    else { std::iter::repeat(m).take((-n) as usize).collect() }
}

fn verify(prog: &str, expected: &[usize]) -> bool {
    let b = prog.as_bytes();
    let mut cells = [0i32; NC];
    let mut pos = 0usize;
    let mut out = Vec::new();
    let mut pc = 0usize;
    let mut steps = 0u32;
    let mut bmap = vec![0usize; b.len()];
    let mut stk = Vec::new();
    for i in 0..b.len() {
        match b[i] { b'[' => stk.push(i), b']' => { let j = stk.pop().unwrap(); bmap[j] = i; bmap[i] = j; } _ => {} }
    }
    while pc < b.len() {
        steps += 1;
        if steps > 200_000 { return false; }
        match b[pc] {
            b'>' => pos = (pos + 1) % NC,
            b'<' => pos = (pos + NC - 1) % NC,
            b'+' => cells[pos] = (cells[pos] + 1).rem_euclid(AL as i32),
            b'-' => cells[pos] = (cells[pos] - 1).rem_euclid(AL as i32),
            b'.' => out.push(cells[pos] as usize),
            b'[' => { if cells[pos] == 0 { pc = bmap[pc]; } }
            b']' => { if cells[pos] != 0 { pc = bmap[pc]; } }
            _ => {}
        }
        pc += 1;
    }
    out == expected
}

struct Rng(u64);
impl Rng {
    fn next(&mut self) -> u64 { self.0 ^= self.0 << 13; self.0 ^= self.0 >> 7; self.0 ^= self.0 << 17; self.0 }
    fn usize(&mut self, n: usize) -> usize { (self.next() % n as u64) as usize }
    fn f32(&mut self) -> f32 { (self.next() % 10000) as f32 / 10000.0 }
}

// ─── Core: generate output given a cell assignment ───

fn gen_with_assign(phrase: &[usize], assign: &[usize; AL]) -> String {
    let mut cells = [0usize; NC];
    let mut pos = 0usize;
    let mut out = String::new();
    for &t in phrase {
        let cell = assign[t];
        out.push_str(&em(td(pos, cell), '>', '<'));
        pos = cell;
        if cells[pos] != t {
            out.push_str(&em(ad(cells[pos], t), '+', '-'));
            cells[pos] = t;
        }
        out.push('.');
    }
    out
}

fn cost_with_assign(phrase: &[usize], assign: &[usize; AL]) -> usize {
    let mut cells = [0usize; NC];
    let mut pos = 0usize;
    let mut cost = 0usize;
    for &t in phrase {
        let cell = assign[t];
        cost += td(pos, cell).abs() as usize;
        pos = cell;
        cost += ad(cells[pos], t).abs() as usize;
        cells[pos] = t;
        cost += 1; // the dot
    }
    cost
}

// ─── Strategy: SA on cell assignment ───

fn sa_assign(phrase: &[usize], time_ms: u128) -> String {
    let mut freq = [0u32; AL];
    for &c in phrase { freq[c] += 1; }
    let mut chars: Vec<usize> = (0..AL).filter(|&c| freq[c] > 0).collect();
    chars.sort_by(|&a, &b| freq[b].cmp(&freq[a]));
    let n = chars.len();
    if n > NC { return greedy(phrase); }

    let mut rng = Rng(12345678);

    // Initial assignment: spread chars evenly
    let mut assign = [0usize; AL];
    for (i, &ch) in chars.iter().enumerate() {
        assign[ch] = i % NC;
    }
    // Unused chars point to cell 0
    for c in 0..AL { if freq[c] == 0 { assign[c] = 0; } }

    let mut cur_cost = cost_with_assign(phrase, &assign);
    let mut best_assign = assign;
    let mut best_cost = cur_cost;

    let start = Instant::now();
    let mut temp = 50.0f32;
    let mut iters = 0u64;

    while start.elapsed().as_millis() < time_ms {
        iters += 1;
        let elapsed = start.elapsed().as_millis() as f32 / time_ms as f32;
        temp = 50.0 * (1.0 - elapsed).max(0.001);

        // Mutation: swap two chars' cell assignments
        let i = rng.usize(n);
        let j = rng.usize(n);
        if i == j { continue; }
        let ci = chars[i];
        let cj = chars[j];

        let old_i = assign[ci];
        let old_j = assign[cj];
        assign[ci] = old_j;
        assign[cj] = old_i;

        let new_cost = cost_with_assign(phrase, &assign);
        let delta = new_cost as f32 - cur_cost as f32;

        if delta < 0.0 || (-delta / temp).exp() > rng.f32() {
            cur_cost = new_cost;
            if cur_cost < best_cost {
                best_cost = cur_cost;
                best_assign = assign;
            }
        } else {
            assign[ci] = old_i;
            assign[cj] = old_j;
        }
    }

    eprintln!("SA: {} iters, cost {} -> {}", iters, cost_with_assign(phrase, &{let mut a = [0;AL]; for (i,&ch) in chars.iter().enumerate() { a[ch] = i % NC; } a}), best_cost);
    gen_with_assign(phrase, &best_assign)
}

// ─── Greedy ───

fn greedy(phrase: &[usize]) -> String {
    let mut cells = [0usize; NC];
    let mut pos = 0usize;
    let mut out = String::new();
    for &t in phrase {
        let (mut bc, mut bi) = (i32::MAX, 0);
        for c in 0..NC {
            let cost = td(pos, c).abs() + ad(cells[c], t).abs();
            if cost < bc { bc = cost; bi = c; }
        }
        out.push_str(&em(td(pos, bi), '>', '<'));
        pos = bi;
        out.push_str(&em(ad(cells[pos], t), '+', '-'));
        cells[pos] = t;
        out.push('.');
    }
    out
}

fn greedy_with_cells(phrase: &[usize], cells: &mut [usize; NC], pos: &mut usize) -> String {
    let mut out = String::new();
    for &t in phrase {
        let (mut bc, mut bi) = (i32::MAX, 0);
        for c in 0..NC {
            let cost = td(*pos, c).abs() + ad(cells[c], t).abs();
            if cost < bc { bc = cost; bi = c; }
        }
        out.push_str(&em(td(*pos, bi), '>', '<'));
        *pos = bi;
        out.push_str(&em(ad(cells[*pos], t), '+', '-'));
        cells[*pos] = t;
        out.push('.');
    }
    out
}

// ─── Run loops ───

fn emit_run(run: usize, pos: &mut usize, cells: &mut [usize; NC], out: &mut String) {
    if run >= 3 && run <= 26 {
        let cc = (*pos + 1) % NC;
        let to_cc = td(*pos, cc);
        let to_p = td(cc, *pos);
        let overhead = (to_cc.abs() + ad(cells[cc], run).abs() + 1 + to_p.abs() + 1 + to_cc.abs() + 1 + 1 + to_p.abs()) as usize;
        if overhead < run {
            out.push_str(&em(to_cc, '>', '<'));
            out.push_str(&em(ad(cells[cc], run), '+', '-'));
            cells[cc] = run;
            out.push('[');
            out.push_str(&em(to_p, '>', '<'));
            out.push('.');
            out.push_str(&em(to_cc, '>', '<'));
            out.push('-');
            out.push(']');
            cells[cc] = 0;
            out.push_str(&em(to_p, '>', '<'));
            return;
        }
    }
    if run > 26 {
        let (mut ba, mut bb, mut br) = (0usize, 0usize, run);
        for a in 2..=26usize { let b = run / a; if b >= 2 && b <= 26 && run - a * b < br { ba = a; bb = b; br = run - a * b; } }
        if ba > 0 {
            let c1 = (*pos + 1) % NC;
            let c2 = (*pos + 2) % NC;
            out.push_str(&em(td(*pos, c1), '>', '<'));
            out.push_str(&em(ad(cells[c1], ba), '+', '-')); cells[c1] = ba;
            out.push('[');
            out.push_str(&em(td(c1, c2), '>', '<'));
            out.push_str(&em(ad(cells[c2], bb), '+', '-')); cells[c2] = bb;
            out.push('[');
            out.push_str(&em(td(c2, *pos), '>', '<'));
            out.push('.');
            out.push_str(&em(td(*pos, c2), '>', '<'));
            out.push('-'); out.push(']');
            out.push_str(&em(td(c2, c1), '>', '<'));
            out.push('-'); out.push(']');
            cells[c1] = 0; cells[c2] = 0;
            out.push_str(&em(td(c1, *pos), '>', '<'));
            for _ in 0..br { out.push('.'); }
            return;
        }
    }
    for _ in 0..run { out.push('.'); }
}

fn greedy_runs(phrase: &[usize]) -> String {
    let mut cells = [0usize; NC];
    let mut pos = 0usize;
    let mut out = String::new();
    let mut i = 0;
    while i < phrase.len() {
        let t = phrase[i];
        let mut run = 1;
        while i + run < phrase.len() && phrase[i + run] == t { run += 1; }
        let (mut bc, mut bi) = (i32::MAX, 0);
        for c in 0..NC { let cost = td(pos, c).abs() + ad(cells[c], t).abs(); if cost < bc { bc = cost; bi = c; } }
        out.push_str(&em(td(pos, bi), '>', '<'));
        pos = bi;
        out.push_str(&em(ad(cells[pos], t), '+', '-'));
        cells[pos] = t;
        emit_run(run, &mut pos, &mut cells, &mut out);
        i += run;
    }
    out
}

// ─── Pattern prefix loop ───

fn pattern_loop(phrase: &[usize]) -> Vec<String> {
    let n = phrase.len();
    let mut results = Vec::new();

    for skip in 0..n.min(40) {
        for pat_len in 1..=NC.min((n - skip) / 2) {
            let pattern = &phrase[skip..skip + pat_len];
            let mut reps = 0;
            while skip + (reps + 1) * pat_len <= n && phrase[skip + reps * pat_len..skip + (reps + 1) * pat_len] == *pattern { reps += 1; }
            if reps < 3 || reps > 26 { continue; }
            let cc = pat_len;
            if cc >= NC { continue; }

            let mut out = String::new();
            let mut pos = 0usize;
            let mut cells = [0usize; NC];

            // Prefix: greedy using cells cc+1..
            for i in 0..skip {
                let t = phrase[i];
                let (mut bc2, mut bi2) = (i32::MAX, cc + 1);
                for c in (cc + 1)..NC { let cost = td(pos, c).abs() + ad(cells[c], t).abs(); if cost < bc2 { bc2 = cost; bi2 = c; } }
                out.push_str(&em(td(pos, bi2), '>', '<'));
                pos = bi2;
                out.push_str(&em(ad(cells[pos], t), '+', '-'));
                cells[pos] = t;
                out.push('.');
            }

            for (j, &ch) in pattern.iter().enumerate() {
                out.push_str(&em(td(pos, j), '>', '<'));
                pos = j;
                out.push_str(&em(ad(cells[j], ch), '+', '-'));
                cells[j] = ch;
            }
            out.push_str(&em(td(pos, cc), '>', '<'));
            out.push_str(&em(ad(cells[cc], reps), '+', '-'));
            cells[cc] = reps; pos = cc;
            out.push('[');
            for j in 0..pat_len {
                out.push_str(&em(td(pos, j), '>', '<'));
                out.push('.'); pos = j;
            }
            out.push_str(&em(td(pos, cc), '>', '<'));
            out.push('-'); pos = cc;
            out.push(']');
            cells[cc] = 0;

            let suffix = &phrase[skip + reps * pat_len..];
            out.push_str(&greedy_with_cells(suffix, &mut cells, &mut pos));
            results.push(out);
        }
    }
    results
}

// ─── Incremental sequence ───

fn incremental(phrase: &[usize]) -> Vec<String> {
    let n = phrase.len();
    let mut results = Vec::new();
    for start in 0..n {
        for step in &[1i32, -1, 2, -2] {
            let mut len = 1;
            while start + len < n {
                let exp = ((phrase[start] as i32 + step * len as i32).rem_euclid(AL as i32)) as usize;
                if phrase[start + len] != exp { break; }
                len += 1;
            }
            if len < 5 || len > 26 { continue; }

            let mut out = String::new();
            let mut pos = 0usize;
            let mut cells = [0usize; NC];
            for i in 0..start {
                let t = phrase[i];
                let (mut bc, mut bi) = (i32::MAX, 0);
                for c in 2..NC { let cost = td(pos, c).abs() + ad(cells[c], t).abs(); if cost < bc { bc = cost; bi = c; } }
                out.push_str(&em(td(pos, bi), '>', '<'));
                pos = bi;
                out.push_str(&em(ad(cells[pos], t), '+', '-'));
                cells[pos] = t;
                out.push('.');
            }
            out.push_str(&em(td(pos, 0), '>', '<'));
            out.push_str(&em(ad(cells[0], phrase[start]), '+', '-'));
            cells[0] = phrase[start]; pos = 0;
            out.push_str(&em(td(0, 1), '>', '<'));
            out.push_str(&em(ad(cells[1], len), '+', '-'));
            cells[1] = len; pos = 1;
            out.push_str(&format!("[<.{}>-]", em(*step, '+', '-')));
            cells[0] = ((phrase[start] as i32 + step * len as i32).rem_euclid(AL as i32)) as usize;
            cells[1] = 0;
            let suffix = &phrase[start + len..];
            out.push_str(&greedy_with_cells(suffix, &mut cells, &mut pos));
            results.push(out);
        }
    }
    results
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let phrase = input.trim_end_matches('\n');
    if phrase.is_empty() { println!(); return; }
    let ph: Vec<usize> = phrase.chars().map(c2i).collect();

    let mut candidates: Vec<String> = Vec::new();
    candidates.push(greedy(&ph));
    candidates.push(greedy_runs(&ph));
    candidates.push(sa_assign(&ph, SA_MS));
    candidates.extend(pattern_loop(&ph));
    candidates.extend(incremental(&ph));

    let best = candidates.into_iter()
        .filter(|s| s.len() < 4000 && verify(s, &ph))
        .min_by_key(|s| s.len())
        .unwrap_or_else(|| greedy(&ph));

    eprintln!("Length: {}", best.len());
    println!("{}", best);
}
