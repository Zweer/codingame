use std::io;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s
}

fn angle_diff(a: f64, b: f64) -> f64 {
    let mut d = b - a;
    while d > 180.0 { d -= 360.0; }
    while d < -180.0 { d += 360.0; }
    d
}

fn race_output(
    x: f64, y: f64, vx: f64, vy: f64, angle: f64,
    cp_idx: usize, cps: &[(f64,f64)], cp_count: usize,
    turn_angle: &[f64], boost_cp_idx: usize,
    boost_used: &mut bool, shield_cd: &mut i32,
    px: &[f64;4], py: &[f64;4], pvx: &[f64;4], pvy: &[f64;4],
    turn: i32, pod_id: usize,
) -> String {
    let (cpx, cpy) = cps[cp_idx];
    let next_idx = (cp_idx + 1) % cp_count;
    let (ncx, ncy) = cps[next_idx];
    let dx = cpx - x; let dy = cpy - y;
    let dist = (dx * dx + dy * dy).sqrt();
    let speed = (vx * vx + vy * vy).sqrt();
    let diff = angle_diff(angle, dy.atan2(dx).to_degrees());
    let abs_diff = diff.abs();

    let mut tx = cpx; let mut ty = cpy;

    // Drift through: shift toward next CP
    let dnx = ncx - cpx; let dny = ncy - cpy;
    let dn = (dnx * dnx + dny * dny).sqrt();
    if dn > 1.0 && dist < 2500.0 && abs_diff < 60.0 {
        let f = (1.0 - dist / 2500.0).max(0.0);
        tx = cpx + dnx / dn * 400.0 * f;
        ty = cpy + dny / dn * 400.0 * f;
    }

    // Drift compensation
    if speed > 100.0 {
        let tdx = tx - x; let tdy = ty - y;
        let td = (tdx * tdx + tdy * tdy).sqrt();
        if td > 1.0 {
            let ux = tdx / td; let uy = tdy / td;
            let perp = -vx * uy + vy * ux;
            tx += uy * perp * 2.5;
            ty += -ux * perp * 2.5;
        }
    }

    // Collision avoidance from enemies
    for ei in 2..4 {
        let edx = px[ei] - x; let edy = py[ei] - y;
        let ed = (edx * edx + edy * edy).sqrt();
        if ed < 1200.0 && ed < dist {
            let tdx = tx - x; let tdy = ty - y;
            let td = (tdx * tdx + tdy * tdy).sqrt();
            if td > 1.0 {
                let dot = (edx * tdx + edy * tdy) / (ed * td);
                if dot > 0.5 {
                    let cross = edx * tdy - edy * tdx;
                    let sign = if cross > 0.0 { 1.0 } else { -1.0 };
                    tx += (-tdy / td) * 600.0 * sign;
                    ty += (tdx / td) * 600.0 * sign;
                }
            }
        }
    }

    // Thrust
    let upcoming_turn = turn_angle[cp_idx];

    // First 5 turns: full speed sprint
    if turn < 5 {
        if !*boost_used && abs_diff < 5.0 && dist > 4000.0 {
            *boost_used = true;
            return format!("{:.0} {:.0} BOOST", tx, ty);
        } else {
            let t = if abs_diff > 90.0 { 0 } else { 100 };
            return format!("{:.0} {:.0} {}", tx, ty, t);
        }
    }

    if !*boost_used && cp_idx == boost_cp_idx && abs_diff < 5.0 && dist > 4000.0 {
        *boost_used = true;
        return format!("{:.0} {:.0} BOOST", tx, ty);
    }

    if abs_diff >= 90.0 {
        return format!("{:.0} {:.0} 0", tx, ty);
    }

    let mut t = if abs_diff > 60.0 { 15.0 } else { 100.0 - abs_diff * 1.4 };

    // Brake for sharp turn — but less aggressively than before
    if upcoming_turn > 45.0 && dist < 2000.0 {
        let turn_brake = (1.0 - upcoming_turn / 180.0).max(0.3);
        let dist_f = (dist / 2000.0).max(0.3);
        t *= turn_brake * dist_f + (1.0 - dist_f);
    }

    // Brake when very fast and close
    if dist < 1500.0 && speed > 300.0 {
        t = t.min((dist / speed * 80.0).max(15.0));
    }

    // SHIELD if enemy ramming
    if *shield_cd <= 0 {
        for ei in 2..4 {
            let ed = ((px[ei]-x).powi(2) + (py[ei]-y).powi(2)).sqrt();
            if ed < 850.0 {
                let closing = -((px[ei]-x)*(pvx[ei]-vx) + (py[ei]-y)*(pvy[ei]-vy));
                if closing > 200.0 {
                    *shield_cd = 4;
                    return format!("{:.0} {:.0} SHIELD", tx, ty);
                }
            }
        }
    }

    format!("{:.0} {:.0} {}", tx, ty, (t as i32).max(0).min(100))
}

fn main() {
    let _laps: usize = read_line().trim().parse().unwrap();
    let cp_count: usize = read_line().trim().parse().unwrap();
    let mut cps = Vec::with_capacity(cp_count);
    for _ in 0..cp_count {
        let v: Vec<f64> = read_line().trim().split_whitespace()
            .map(|s| s.parse().unwrap()).collect();
        cps.push((v[0], v[1]));
    }

    let mut turn_angle = vec![0.0f64; cp_count];
    for i in 0..cp_count {
        let prev = (i + cp_count - 1) % cp_count;
        let next = (i + 1) % cp_count;
        let a1 = (cps[i].1 - cps[prev].1).atan2(cps[i].0 - cps[prev].0).to_degrees();
        let a2 = (cps[next].1 - cps[i].1).atan2(cps[next].0 - cps[i].0).to_degrees();
        turn_angle[i] = angle_diff(a1, a2).abs();
    }

    let mut longest_sq = 0.0_f64;
    let mut boost_cp_idx = 0;
    for i in 0..cp_count {
        let j = (i + 1) % cp_count;
        let dx = cps[j].0 - cps[i].0; let dy = cps[j].1 - cps[i].1;
        if dx*dx+dy*dy > longest_sq && turn_angle[j] < 40.0 {
            longest_sq = dx*dx+dy*dy; boost_cp_idx = j;
        }
    }

    eprintln!("LAPS={} CPS={}", _laps, cp_count);
    for (i, cp) in cps.iter().enumerate() {
        eprintln!("CP{}: {:.0} {:.0}", i, cp.0, cp.1);
    }

    let mut boost_used = [false; 2];
    let mut shield_cd = [0i32; 2];
    let mut prev_cp = [0usize; 4];
    let mut progress = [0i32; 4];
    let mut turn = 0i32;
    let mut first = true;

    loop {
        let mut px = [0.0f64;4]; let mut py = [0.0f64;4];
        let mut pvx = [0.0f64;4]; let mut pvy = [0.0f64;4];
        let mut pa = [0.0f64;4]; let mut pcp = [0usize;4];

        for i in 0..4 {
            let v: Vec<f64> = read_line().trim().split_whitespace()
                .map(|s| s.parse().unwrap()).collect();
            px[i]=v[0]; py[i]=v[1]; pvx[i]=v[2]; pvy[i]=v[3]; pa[i]=v[4]; pcp[i]=v[5] as usize;
        }

        if first { for i in 0..4 { prev_cp[i] = pcp[i]; } first = false; }
        else { for i in 0..4 { if pcp[i] != prev_cp[i] { progress[i] += 1; } prev_cp[i] = pcp[i]; } }
        for s in shield_cd.iter_mut() { if *s > 0 { *s -= 1; } }

        // DEBUG: log state of all 4 pods
        for i in 0..4 {
            let label = if i < 2 { format!("M{}", i) } else { format!("E{}", i-2) };
            eprintln!("T{} {}: x={:.0} y={:.0} vx={:.0} vy={:.0} a={:.0} ncp={} prog={}",
                turn, label, px[i], py[i], pvx[i], pvy[i], pa[i], pcp[i], progress[i]);
        }

        // Dynamic role: pod with more progress = racer, other = blocker
        // First 15 turns: both race
        let both_race = turn < 15;
        let racer = if progress[0] >= progress[1] { 0 } else { 1 };
        let _blocker = 1 - racer;

        let enemy_leader = if progress[2] > progress[3] { 2 }
            else if progress[3] > progress[2] { 3 }
            else {
                let d2 = (px[2]-cps[pcp[2]].0).powi(2)+(py[2]-cps[pcp[2]].1).powi(2);
                let d3 = (px[3]-cps[pcp[3]].0).powi(2)+(py[3]-cps[pcp[3]].1).powi(2);
                if d2 < d3 { 2 } else { 3 }
            };

        for pod in 0..2 {
            let role;
            let mov;
            if both_race || pod == racer {
                role = "RACE";
                mov = race_output(
                    px[pod], py[pod], pvx[pod], pvy[pod], pa[pod],
                    pcp[pod], &cps, cp_count, &turn_angle, boost_cp_idx,
                    &mut boost_used[pod], &mut shield_cd[pod],
                    &px, &py, &pvx, &pvy, turn, pod,
                );
            } else {
                // BLOCKER
                role = "BLOCK";
                let ei = enemy_leader;
                let ecp = pcp[ei];
                let (ecx, ecy) = cps[ecp];
                let efx = px[ei] + pvx[ei] * 3.0;
                let efy = py[ei] + pvy[ei] * 3.0;
                let dist_to_enemy = ((px[pod]-px[ei]).powi(2)+(py[pod]-py[ei]).powi(2)).sqrt();
                let _enemy_dist_cp = ((px[ei]-ecx).powi(2)+(py[ei]-ecy).powi(2)).sqrt();

                // Intercept: aim at enemy's checkpoint, or at enemy if close
                let (tx, ty) = if dist_to_enemy < 2000.0 {
                    (efx, efy) // chase enemy
                } else {
                    (ecx, ecy) // race to their checkpoint
                };

                let diff = angle_diff(pa[pod], (ty-py[pod]).atan2(tx-px[pod]).to_degrees()).abs();

                // SHIELD on collision
                if shield_cd[pod] <= 0 && dist_to_enemy < 850.0 {
                    let closing = -((px[ei]-px[pod])*(pvx[ei]-pvx[pod])+(py[ei]-py[pod])*(pvy[ei]-pvy[pod]));
                    if closing > 100.0 {
                        shield_cd[pod] = 4;
                        mov = format!("{:.0} {:.0} SHIELD", efx, efy);
                        eprintln!("T{} M{} {}: {}", turn, pod, role, mov);
                        println!("{}", mov);
                        continue;
                    }
                }

                let t = if diff >= 90.0 { 0 } else { 100 };
                mov = format!("{:.0} {:.0} {}", tx, ty, t);
            }
            eprintln!("T{} M{} {}: {}", turn, pod, role, mov);
            println!("{}", mov);
        }
        turn += 1;
    }
}
