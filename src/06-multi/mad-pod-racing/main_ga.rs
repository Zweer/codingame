use std::f64::consts::PI;
use std::io;
use std::time::Instant;

fn read_line() -> String { let mut s = String::new(); io::stdin().read_line(&mut s).unwrap(); s }

// ─── Pod ───
#[derive(Clone, Copy)]
struct Pod { x: f64, y: f64, vx: f64, vy: f64, angle: f64, ncp: usize, checked: i32, shield: i32 }

impl Pod {
    fn mass(&self) -> f64 { if self.shield > 0 { 10.0 } else { 1.0 } }

    fn get_angle_to(&self, px: f64, py: f64) -> f64 {
        let d = ((px-self.x).powi(2) + (py-self.y).powi(2)).sqrt();
        if d < 1e-6 { return self.angle; }
        let a = ((px-self.x)/d).acos() * 180.0/PI;
        if py < self.y { 360.0 - a } else { a }
    }

    fn diff_angle(&self, px: f64, py: f64) -> f64 {
        let a = self.get_angle_to(px, py);
        let r = if self.angle <= a { a - self.angle } else { 360.0 - self.angle + a };
        let l = if self.angle >= a { self.angle - a } else { self.angle + 360.0 - a };
        if r < l { r } else { -l }
    }

    fn rotate_to(&mut self, px: f64, py: f64) {
        let a = self.diff_angle(px, py).clamp(-18.0, 18.0);
        self.angle += a;
        if self.angle >= 360.0 { self.angle -= 360.0; }
        if self.angle < 0.0 { self.angle += 360.0; }
    }

    fn rotate_by(&mut self, da: f64) {
        self.angle += da.clamp(-18.0, 18.0);
        if self.angle >= 360.0 { self.angle -= 360.0; }
        if self.angle < 0.0 { self.angle += 360.0; }
    }

    fn thrust(&mut self, power: i32) {
        if self.shield > 0 { return; }
        let ra = self.angle * PI / 180.0;
        self.vx += ra.cos() * power as f64;
        self.vy += ra.sin() * power as f64;
    }

    fn mv(&mut self, t: f64) { self.x += self.vx * t; self.y += self.vy * t; }

    fn end(&mut self) {
        self.x = self.x.round();
        self.y = self.y.round();
        self.vx = (self.vx * 0.85) as i64 as f64;
        self.vy = (self.vy * 0.85) as i64 as f64;
        if self.shield > 0 { self.shield -= 1; }
    }

    fn apply_move(&mut self, m: Mv) {
        self.rotate_by(m.a);
        if m.t == -1 { self.shield = 4; } else { self.thrust(m.t); }
    }

    fn d2(&self, px: f64, py: f64) -> f64 { (self.x-px).powi(2) + (self.y-py).powi(2) }
}

// ─── Move ───
#[derive(Clone, Copy)]
struct Mv { a: f64, t: i32 }

// ─── Collision ───
fn col_time(ax: f64, ay: f64, avx: f64, avy: f64, bx: f64, by: f64, bvx: f64, bvy: f64, sr: f64) -> f64 {
    let (dx, dy) = (ax-bx, ay-by);
    if dx*dx+dy*dy < sr { return 0.0; }
    let (dvx, dvy) = (avx-bvx, avy-bvy);
    let a = dvx*dvx + dvy*dvy;
    if a < 1e-10 { return 2.0; }
    let b = 2.0*(dx*dvx + dy*dvy);
    let c = dx*dx + dy*dy - sr;
    let disc = b*b - 4.0*a*c;
    if disc < 0.0 { return 2.0; }
    let t = (-b - disc.sqrt()) / (2.0*a);
    if t < 1e-6 || t > 1.0 { 2.0 } else { t }
}

fn bounce(a: &mut Pod, b: &mut Pod) {
    let (m1, m2) = (a.mass(), b.mass());
    let (nx, ny) = (a.x-b.x, a.y-b.y);
    let nn = nx*nx + ny*ny;
    if nn < 1.0 { return; }
    let dvn = nx*(a.vx-b.vx) + ny*(a.vy-b.vy);
    let f1 = (m2 * dvn) / ((m1 + m2) * nn);
    let f2 = (m1 * dvn) / ((m1 + m2) * nn);
    a.vx -= f1 * nx; a.vy -= f1 * ny;
    b.vx += f2 * nx; b.vy += f2 * ny;
    let imp = ((f1 * nx).powi(2) + (f1 * ny).powi(2)).sqrt() * m1;
    if imp < 120.0 && imp > 0.01 {
        let scale = 120.0 / imp;
        a.vx += f1 * nx; a.vy += f1 * ny;
        b.vx -= f2 * nx; b.vy -= f2 * ny;
        a.vx -= f1 * scale * nx; a.vy -= f1 * scale * ny;
        b.vx += f2 * scale * nx; b.vy += f2 * scale * ny;
    }
}

fn sim_turn(pods: &mut [Pod; 4], cps: &[(f64,f64)], ncp: usize) {
    let mut t = 0.0;
    for _ in 0..20 {
        if t >= 1.0 { break; }
        let mut bt = 2.0_f64;
        let mut btype = -1i32;
        let mut bi = 0; let mut bj = 0;
        for i in 0..4 {
            for j in (i+1)..4 {
                let ct = col_time(pods[i].x,pods[i].y,pods[i].vx,pods[i].vy,
                    pods[j].x,pods[j].y,pods[j].vx,pods[j].vy, 640000.0);
                if ct+t < 1.0 && ct < bt { bt=ct; btype=0; bi=i; bj=j; }
            }
            let cp = cps[pods[i].ncp];
            let ct = col_time(pods[i].x,pods[i].y,pods[i].vx,pods[i].vy,
                cp.0,cp.1,0.0,0.0, 1000000.0);
            if ct+t < 1.0 && ct < bt { bt=ct; btype=1; bi=i; }
        }
        if btype == -1 { for p in pods.iter_mut() { p.mv(1.0-t); } break; }
        for p in pods.iter_mut() { p.mv(bt); }
        t += bt;
        if btype == 0 {
            let ptr = pods.as_mut_ptr();
            unsafe { bounce(&mut *ptr.add(bi), &mut *ptr.add(bj)); }
        } else {
            pods[bi].ncp = (pods[bi].ncp+1) % ncp;
            pods[bi].checked += 1;
        }
    }
    if t < 1.0 { for p in pods.iter_mut() { p.mv(1.0-t); } }
    for p in pods.iter_mut() { p.end(); }
}

// ─── GA ───
const DEPTH: usize = 4;
const POP: usize = 6;

struct Rng(u64);
impl Rng {
    fn next(&mut self) -> u64 { self.0 ^= self.0 << 13; self.0 ^= self.0 >> 7; self.0 ^= self.0 << 17; self.0 }
    fn range(&mut self, lo: i32, hi: i32) -> i32 { if hi<=lo { lo } else { lo + (self.next() % (hi-lo) as u64) as i32 } }
    fn frange(&mut self, lo: f64, hi: f64) -> f64 { lo + (self.next() % 10000) as f64 / 10000.0 * (hi-lo) }
}

#[derive(Clone, Copy)]
struct Sol { m: [[Mv; DEPTH]; 2], score: f64 }

fn heuristic(pod: &Pod, cps: &[(f64,f64)]) -> Mv {
    let da = pod.diff_angle(cps[pod.ncp].0, cps[pod.ncp].1);
    Mv { a: da.clamp(-18.0, 18.0), t: if da.abs() > 90.0 { 0 } else { 100 } }
}

fn progress(p: &Pod, cps: &[(f64,f64)]) -> f64 {
    p.checked as f64 * 50000.0 - p.d2(cps[p.ncp].0, cps[p.ncp].1).sqrt()
}

fn evaluate(pods: &[Pod; 4], cps: &[(f64,f64)], total: i32) -> f64 {
    if pods[0].checked >= total || pods[1].checked >= total { return 1e9; }
    if pods[2].checked >= total || pods[3].checked >= total { return -1e9; }
    let (mr, mb) = if progress(&pods[0],cps) > progress(&pods[1],cps) { (0,1) } else { (1,0) };
    let hr = if progress(&pods[2],cps) > progress(&pods[3],cps) { 2 } else { 3 };
    let mut s = progress(&pods[mr], cps) - progress(&pods[hr], cps);
    let hcp = cps[pods[hr].ncp];
    s -= pods[mb].d2(hcp.0, hcp.1).sqrt() * 0.01;
    s
}

fn main() {
    let laps: i32 = read_line().trim().parse().unwrap();
    let ncp: usize = read_line().trim().parse().unwrap();
    let mut cps = Vec::new();
    for _ in 0..ncp {
        let v: Vec<f64> = read_line().trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
        cps.push((v[0], v[1]));
    }
    let total = laps * ncp as i32;
    let mut prev_cp = [0usize;4];
    let mut checked = [0i32;4];
    let mut shield_cd = [0i32;4];
    let mut turn = 0u32;
    let mut prev_sol: Option<Sol> = None;

    loop {
        let mut pods = [Pod { x:0.0,y:0.0,vx:0.0,vy:0.0,angle:0.0,ncp:0,checked:0,shield:0 }; 4];
        for i in 0..4 {
            let v: Vec<f64> = read_line().trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
            pods[i].x=v[0]; pods[i].y=v[1]; pods[i].vx=v[2]; pods[i].vy=v[3]; pods[i].ncp=v[5] as usize;
            if v[4] < 0.0 {
                pods[i].angle = ((cps[pods[i].ncp].1-pods[i].y).atan2(cps[pods[i].ncp].0-pods[i].x) * 180.0/PI + 360.0) % 360.0;
            } else { pods[i].angle = v[4]; }
        }
        if turn > 0 { for i in 0..4 { if pods[i].ncp != prev_cp[i] { checked[i] += 1; } } }
        for i in 0..4 { prev_cp[i]=pods[i].ncp; pods[i].checked=checked[i]; pods[i].shield=shield_cd[i]; }

        let start = Instant::now();
        let budget = if turn == 0 { 800u64 } else { 60 };
        let mut rng = Rng(turn as u64 * 6364136223846793005 + 1442695040888963407 | 1);

        // Predict enemies
        let mut emoves = [[Mv{a:0.0,t:100};DEPTH];2];
        { let mut ep = [pods[2], pods[3]];
          for d in 0..DEPTH { for i in 0..2 {
              emoves[i][d] = heuristic(&ep[i], &cps);
              ep[i].apply_move(emoves[i][d]); ep[i].mv(1.0); ep[i].end();
          }}
        }

        let score_sol = |sol: &mut Sol| {
            let mut sp = pods;
            for d in 0..DEPTH {
                sp[0].apply_move(sol.m[0][d]); sp[1].apply_move(sol.m[1][d]);
                sp[2].apply_move(emoves[0][d]); sp[3].apply_move(emoves[1][d]);
                sim_turn(&mut sp, &cps, ncp);
            }
            sol.score = evaluate(&sp, &cps, total);
        };

        let mut pop = Vec::with_capacity(POP);

        // Seed: previous solution shifted
        if let Some(ref prev) = prev_sol {
            let mut s = Sol { m: [[Mv{a:0.0,t:100};DEPTH];2], score: -1e18 };
            for p in 0..2 { for d in 0..DEPTH-1 { s.m[p][d] = prev.m[p][d+1]; }
                s.m[p][DEPTH-1] = heuristic(&pods[p], &cps); }
            score_sol(&mut s); pop.push(s);
        }

        // Seed: heuristic
        { let mut s = Sol { m: [[Mv{a:0.0,t:100};DEPTH];2], score: -1e18 };
          let mut tp = [pods[0], pods[1]];
          for d in 0..DEPTH { for p in 0..2 {
              s.m[p][d] = heuristic(&tp[p], &cps);
              tp[p].apply_move(s.m[p][d]); tp[p].mv(1.0); tp[p].end();
          }}
          score_sol(&mut s); pop.push(s);
        }

        // Random seeds
        while pop.len() < POP {
            let mut s = Sol { m: [[Mv{a:0.0,t:100};DEPTH];2], score: -1e18 };
            for p in 0..2 { for d in 0..DEPTH {
                s.m[p][d] = Mv { a: rng.frange(-18.0,18.0), t: rng.range(0,101) };
            }}
            score_sol(&mut s); pop.push(s);
        }
        pop.sort_by(|a,b| b.score.partial_cmp(&a.score).unwrap());

        let mut iters = 0u32;
        while start.elapsed().as_millis() < budget as u128 {
            let amp = 1.0 - start.elapsed().as_millis() as f64 / budget as f64 * 0.7;
            let idx = rng.range(0, POP as i32) as usize;
            let mut child = pop[idx];
            for p in 0..2 { for d in 0..DEPTH {
                if rng.range(0,100) < 50 { continue; }
                let m = &mut child.m[p][d];
                m.a = rng.frange((m.a-36.0*amp).max(-18.0), (m.a+36.0*amp).min(18.0));
                let lo = (m.t as i32 - (100.0*amp) as i32).max(0);
                let hi = (m.t as i32 + (100.0*amp) as i32).min(100);
                m.t = rng.range(lo, hi+1);
            }}
            score_sol(&mut child);
            if child.score > pop[POP-1].score {
                pop[POP-1] = child;
                pop.sort_by(|a,b| b.score.partial_cmp(&a.score).unwrap());
            }
            iters += 1;
        }

        eprintln!("T{}: {} iters, best={:.0}", turn, iters, pop[0].score);

        // Predict 1 step for validation
        {
            let mut sp = pods;
            sp[0].apply_move(pop[0].m[0][0]); sp[1].apply_move(pop[0].m[1][0]);
            sp[2].apply_move(emoves[0][0]); sp[3].apply_move(emoves[1][0]);
            sim_turn(&mut sp, &cps, ncp);
            for i in 0..2 {
                eprintln!("T{} PRED M{}: x={:.0} y={:.0} vx={:.0} vy={:.0} a={:.0}",
                    turn, i, sp[i].x, sp[i].y, sp[i].vx, sp[i].vy, sp[i].angle);
            }
            for i in 0..2 {
                let label = ["M0","M1","E0","E1"];
                eprintln!("T{} REAL {}: x={:.0} y={:.0} vx={:.0} vy={:.0} a={:.0}",
                    turn, label[i], pods[i].x, pods[i].y, pods[i].vx, pods[i].vy, pods[i].angle);
            }
        }

        for p in 0..2 {
            let m = pop[0].m[p][0];
            let mut a = pods[p].angle + m.a;
            if a >= 360.0 { a -= 360.0; } else if a < 0.0 { a += 360.0; }
            let ra = a * PI / 180.0;
            let px = pods[p].x + ra.cos() * 10000.0;
            let py = pods[p].y + ra.sin() * 10000.0;
            if m.t == -1 {
                println!("{:.0} {:.0} SHIELD", px, py);
                shield_cd[p] = 4;
            } else {
                println!("{:.0} {:.0} {}", px, py, m.t);
                if shield_cd[p] > 0 { shield_cd[p] -= 1; }
            }
        }

        prev_sol = Some(pop[0]);
        turn += 1;
    }
}
