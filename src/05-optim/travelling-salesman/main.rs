use std::io::{self, BufRead};
use std::time::Instant;

const SA_MS: u128 = 4800;

struct Rng(u64);
impl Rng {
    fn next(&mut self) -> u64 { self.0 ^= self.0 << 13; self.0 ^= self.0 >> 7; self.0 ^= self.0 << 17; self.0 }
    fn usize(&mut self, n: usize) -> usize { (self.next() % n as u64) as usize }
    fn f64(&mut self) -> f64 { (self.next() % 1_000_000) as f64 / 1_000_000.0 }
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    let n: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let mut px = vec![0.0f64; n];
    let mut py = vec![0.0f64; n];
    for i in 0..n {
        let line = lines.next().unwrap().unwrap();
        let p: Vec<f64> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
        px[i] = p[0]; py[i] = p[1];
    }

    if n <= 2 {
        let out: Vec<String> = (0..n).map(|i| i.to_string()).collect();
        println!("{} 0", out.join(" "));
        return;
    }

    let mut d = vec![vec![0.0f64; n]; n];
    for i in 0..n { for j in i+1..n {
        let dx = px[i] - px[j]; let dy = py[i] - py[j];
        let v = (dx*dx + dy*dy).sqrt();
        d[i][j] = v; d[j][i] = v;
    }}

    // Nearest-neighbor from 0
    let mut tour = Vec::with_capacity(n);
    let mut vis = vec![false; n];
    tour.push(0); vis[0] = true;
    for _ in 1..n {
        let last = *tour.last().unwrap();
        let best = (0..n).filter(|&j| !vis[j]).min_by(|&a, &b| d[last][a].partial_cmp(&d[last][b]).unwrap()).unwrap();
        tour.push(best); vis[best] = true;
    }

    let cost = |t: &[usize]| -> f64 {
        let mut s = 0.0;
        for i in 0..t.len() { s += d[t[i]][t[(i+1) % t.len()]]; }
        s
    };

    // 2-opt until no improvement
    let mut improved = true;
    while improved {
        improved = false;
        for i in 1..n-1 { for j in i+1..n {
            let old = d[tour[i-1]][tour[i]] + d[tour[j]][tour[(j+1)%n]];
            let new = d[tour[i-1]][tour[j]] + d[tour[i]][tour[(j+1)%n]];
            if new < old - 1e-10 { tour[i..=j].reverse(); improved = true; }
        }}
    }

    let mut best_tour = tour.clone();
    let mut best_cost = cost(&tour);
    let mut cur_cost = best_cost;

    // SA with 2-opt moves only (simpler, no accumulation bugs)
    let mut rng = Rng(987654321);
    let start = Instant::now();
    let t0 = best_cost * 0.05;
    let mut iters = 0u64;

    while start.elapsed().as_millis() < SA_MS {
        iters += 1;
        let elapsed = start.elapsed().as_millis() as f64 / SA_MS as f64;
        let temp = t0 * (1.0 - elapsed).max(1e-6);

        // 2-opt: pick two random positions (not 0)
        let mut i = 1 + rng.usize(n - 1);
        let mut j = 1 + rng.usize(n - 1);
        if i == j { continue; }
        if i > j { std::mem::swap(&mut i, &mut j); }

        let pi = tour[i - 1];
        let ci = tour[i];
        let cj = tour[j];
        let nj = tour[(j + 1) % n];
        let delta = d[pi][cj] + d[ci][nj] - d[pi][ci] - d[cj][nj];

        if delta < 0.0 || (-delta / temp).exp() > rng.f64() {
            tour[i..=j].reverse();
            cur_cost += delta;

            // Recalculate periodically to avoid float drift
            if iters % 100_000 == 0 { cur_cost = cost(&tour); }

            if cur_cost < best_cost {
                best_cost = cur_cost;
                best_tour = tour.clone();
            }
        }
    }

    eprintln!("dist: {:.1}, iters: {}M", best_cost, iters / 1_000_000);
    let out: Vec<String> = best_tour.iter().map(|i| i.to_string()).collect();
    println!("{} 0", out.join(" "));
}
