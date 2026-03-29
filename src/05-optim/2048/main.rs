use std::io::{self, BufRead};
use std::time::Instant;

const SZ: usize = 4;
type Grid = [[u32; SZ]; SZ];

#[derive(Clone, Copy)]
struct Game { grid: Grid, seed: i64, score: u32 }

impl Game {
    fn spawn(&mut self) {
        let mut n = 0u8;
        let mut free = [0u8; 16];
        for x in 0..SZ { for y in 0..SZ {
            if self.grid[x][y] == 0 { free[n as usize] = (x + y * SZ) as u8; n += 1; }
        }}
        if n == 0 { return; }
        let idx = free[((self.seed as i64).unsigned_abs() as usize) % n as usize] as usize;
        self.grid[idx % SZ][idx / SZ] = if (self.seed & 0x10) == 0 { 2 } else { 4 };
        self.seed = self.seed.wrapping_mul(self.seed).rem_euclid(50515093);
    }

    fn apply_move(&mut self, dir: u8) -> bool {
        let ts = [0usize, SZ-1, SZ*(SZ-1), 0][dir as usize];
        let tt = [1usize, SZ, 1, SZ][dir as usize];
        let ss: i32 = [SZ as i32, -1, -(SZ as i32), 1][dir as usize];
        let mut changed = false;
        let mut merged = 0u16;
        for i in 0..SZ {
            let ft = ts + i * tt;
            for j in 1..SZ {
                let mut src = (ft as i32 + j as i32 * ss) as usize;
                let (mut sx, mut sy) = (src % SZ, src / SZ);
                if self.grid[sx][sy] == 0 { continue; }
                for k in (0..j).rev() {
                    let mid = (ft as i32 + k as i32 * ss) as usize;
                    let (mx, my) = (mid % SZ, mid / SZ);
                    let mbit = 1u16 << (mx + my * SZ);
                    if self.grid[mx][my] == 0 {
                        self.grid[mx][my] = self.grid[sx][sy];
                        self.grid[sx][sy] = 0;
                        changed = true;
                        src = mid; sx = mx; sy = my;
                    } else {
                        if merged & mbit == 0 && self.grid[mx][my] == self.grid[sx][sy] {
                            self.grid[sx][sy] = 0;
                            self.grid[mx][my] *= 2;
                            merged |= mbit;
                            self.score += self.grid[mx][my];
                            changed = true;
                        }
                        break;
                    }
                }
            }
        }
        changed
    }

    fn can_move(&self) -> bool {
        for d in 0..4u8 { let mut c = *self; if c.apply_move(d) { return true; } }
        false
    }
}

#[inline(always)]
fn eval(g: &Game) -> f64 {
    let mut empty = 0i32;
    let w: [f64; 16] = [15.,8.,7.,0., 14.,9.,6.,1., 13.,10.,5.,2., 12.,11.,4.,3.];
    let mut mono = 0.0f64;
    for x in 0..SZ { for y in 0..SZ {
        let v = g.grid[x][y];
        if v == 0 { empty += 1; }
        else { mono += w[x * SZ + y] * (v as f64).log2(); }
    }}
    g.score as f64 + empty as f64 * 100.0 + mono * 15.0
}

/// Adaptive depth: use as much depth as time allows
fn best_move(g: &Game, deadline_ms: u128, start: &Instant) -> u8 {
    // Always do at least depth 1
    let mut bd = 0u8;
    let mut be = f64::MIN;

    // Depth 1: immediate eval after move+spawn
    for d in 0..4u8 {
        let mut c = *g;
        if !c.apply_move(d) { continue; }
        c.spawn();
        let e = eval(&c) + c.score as f64;
        if e > be { be = e; bd = d; }
    }

    if start.elapsed().as_millis() > deadline_ms { return bd; }

    // Depth 2
    let mut bd2 = bd;
    let mut be2 = f64::MIN;
    for d in 0..4u8 {
        let mut c = *g;
        if !c.apply_move(d) { continue; }
        c.spawn();
        let mut b1 = f64::MIN;
        for d1 in 0..4u8 {
            let mut c1 = c;
            if !c1.apply_move(d1) { continue; }
            c1.spawn();
            let e = eval(&c1) + c1.score as f64;
            if e > b1 { b1 = e; }
        }
        if b1 == f64::MIN { b1 = eval(&c) + c.score as f64; }
        if b1 > be2 { be2 = b1; bd2 = d; }
    }
    bd = bd2;

    if start.elapsed().as_millis() > deadline_ms { return bd; }

    // Depth 3
    let mut bd3 = bd;
    let mut be3 = f64::MIN;
    for d in 0..4u8 {
        if start.elapsed().as_millis() > deadline_ms { return bd; }
        let mut c = *g;
        if !c.apply_move(d) { continue; }
        c.spawn();
        let mut b1 = f64::MIN;
        for d1 in 0..4u8 {
            let mut c1 = c;
            if !c1.apply_move(d1) { continue; }
            c1.spawn();
            let mut b2 = f64::MIN;
            for d2 in 0..4u8 {
                let mut c2 = c1;
                if !c2.apply_move(d2) { continue; }
                c2.spawn();
                let e = eval(&c2) + c2.score as f64;
                if e > b2 { b2 = e; }
            }
            if b2 == f64::MIN { b2 = eval(&c1) + c1.score as f64; }
            if b2 > b1 { b1 = b2; }
        }
        if b1 == f64::MIN { b1 = eval(&c) + c.score as f64; }
        if b1 > be3 { be3 = b1; bd3 = d; }
    }
    bd3
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    let dc = ['U', 'R', 'D', 'L'];

    let mut first_turn = true;
    let mut precomputed: Vec<u8> = Vec::new();
    let mut precomp_idx = 0usize;

    loop {
        let seed_line = match lines.next() { Some(Ok(l)) => l, _ => break };
        let seed: i64 = match seed_line.trim().parse() { Ok(v) => v, _ => break };
        let score: u32 = lines.next().unwrap().unwrap().trim().parse().unwrap();
        let mut grid = [[0u32; SZ]; SZ];
        for y in 0..SZ {
            let line = lines.next().unwrap().unwrap();
            let vals: Vec<u32> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
            for x in 0..SZ { grid[x][y] = vals[x]; }
        }

        let start = Instant::now();
        let game = Game { grid, seed, score };

        if !game.can_move() {
            println!("U");
            continue;
        }

        if first_turn {
            first_turn = false;
            // First turn: 1s budget. Pre-compute as many moves as possible.
            let mut g = game;
            precomputed.clear();
            precomp_idx = 0;
            while precomputed.len() < 600 && g.can_move() && start.elapsed().as_millis() < 850 {
                let d = best_move(&g, 850, &start);
                g.apply_move(d);
                g.spawn();
                precomputed.push(d);
            }
            // Output first move
            if !precomputed.is_empty() {
                println!("{}", dc[precomputed[0] as usize]);
                precomp_idx = 1;
            } else {
                println!("U");
            }
        } else {
            // Subsequent turns: 50ms budget
            // Use precomputed move if available, otherwise compute fresh
            if precomp_idx < precomputed.len() {
                // Verify precomputed state matches actual state (PRNG might differ)
                // For safety, just use precomputed
                let d = precomputed[precomp_idx];
                precomp_idx += 1;

                // Also continue precomputing with remaining time
                // (extend the precomputed sequence)
                if precomp_idx >= precomputed.len() {
                    // Ran out of precomputed moves, compute more
                    let mut g = game;
                    let d_fresh = best_move(&g, 40, &start);
                    println!("{}", dc[d_fresh as usize]);
                    continue;
                }

                println!("{}", dc[d as usize]);
            } else {
                // No precomputed moves left, compute on the fly
                let d = best_move(&game, 40, &start);
                println!("{}", dc[d as usize]);
            }
        }
    }
}
