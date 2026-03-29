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

fn main() {
    let _laps: usize = read_line().trim().parse().unwrap();
    let cp_count: usize = read_line().trim().parse().unwrap();
    let mut cps = Vec::with_capacity(cp_count);
    for _ in 0..cp_count {
        let v: Vec<f64> = read_line().trim().split_whitespace()
            .map(|s| s.parse().unwrap()).collect();
        cps.push((v[0], v[1]));
    }

    // Precompute turn sharpness at each checkpoint
    let mut turn_angle = vec![0.0f64; cp_count];
    for i in 0..cp_count {
        let prev = (i + cp_count - 1) % cp_count;
        let next = (i + 1) % cp_count;
        let a1 = (cps[i].1 - cps[prev].1).atan2(cps[i].0 - cps[prev].0).to_degrees();
        let a2 = (cps[next].1 - cps[i].1).atan2(cps[next].0 - cps[i].0).to_degrees();
        turn_angle[i] = angle_diff(a1, a2).abs();
    }

    // Find best BOOST checkpoint
    let mut longest_sq = 0.0_f64;
    let mut boost_cp_idx = 0;
    for i in 0..cp_count {
        let j = (i + 1) % cp_count;
        let dx = cps[j].0 - cps[i].0;
        let dy = cps[j].1 - cps[i].1;
        if dx * dx + dy * dy > longest_sq && turn_angle[j] < 40.0 {
            longest_sq = dx * dx + dy * dy;
            boost_cp_idx = j;
        }
    }

    let mut boost_used = [false; 2];
    let mut shield_cd = [0i32; 2];
    // Track total checkpoints passed per pod to know who's ahead
    let mut prev_cp = [0usize; 4];
    let mut progress = [0i32; 4]; // total CPs passed
    let mut first_turn = true;

    loop {
        let mut px = [0.0f64; 4]; let mut py = [0.0f64; 4];
        let mut pvx = [0.0f64; 4]; let mut pvy = [0.0f64; 4];
        let mut pa = [0.0f64; 4]; let mut pcp = [0usize; 4];

        for i in 0..4 {
            let v: Vec<f64> = read_line().trim().split_whitespace()
                .map(|s| s.parse().unwrap()).collect();
            px[i] = v[0]; py[i] = v[1]; pvx[i] = v[2]; pvy[i] = v[3];
            pa[i] = v[4]; pcp[i] = v[5] as usize;
        }

        // Update progress tracking
        if first_turn {
            for i in 0..4 { prev_cp[i] = pcp[i]; }
            first_turn = false;
        } else {
            for i in 0..4 {
                if pcp[i] != prev_cp[i] {
                    progress[i] += 1;
                }
                prev_cp[i] = pcp[i];
            }
        }

        for s in shield_cd.iter_mut() { if *s > 0 { *s -= 1; } }

        // Enemy leader: most progress, tiebreak by distance to next cp
        let enemy_leader = if progress[2] > progress[3] { 2 }
            else if progress[3] > progress[2] { 3 }
            else {
                let d2 = (px[2]-cps[pcp[2]].0).powi(2) + (py[2]-cps[pcp[2]].1).powi(2);
                let d3 = (px[3]-cps[pcp[3]].0).powi(2) + (py[3]-cps[pcp[3]].1).powi(2);
                if d2 < d3 { 2 } else { 3 }
            };

        for pod in 0..2 {
            let x = px[pod]; let y = py[pod];
            let vx = pvx[pod]; let vy = pvy[pod];
            let angle = pa[pod];
            let cp_idx = pcp[pod];
            let speed = (vx * vx + vy * vy).sqrt();

            // === POD 1: BLOCKER ===
            if pod == 1 {
                let ei = enemy_leader;
                let ecp = pcp[ei];
                let (ecx, ecy) = cps[ecp];

                // Predict where enemy will be in ~3 turns
                let efx = px[ei] + pvx[ei] * 3.0;
                let efy = py[ei] + pvy[ei] * 3.0;

                // Target: enemy's next checkpoint (get there before them)
                let my_dist_to_ecp = ((x - ecx).powi(2) + (y - ecy).powi(2)).sqrt();
                let enemy_dist_to_ecp = ((px[ei] - ecx).powi(2) + (py[ei] - ecy).powi(2)).sqrt();

                let (tx, ty) = if my_dist_to_ecp < 1500.0 && enemy_dist_to_ecp < 3000.0 {
                    // We're at the checkpoint, aim at incoming enemy
                    (efx, efy)
                } else if enemy_dist_to_ecp < my_dist_to_ecp {
                    // Enemy is closer to their CP than us, chase them directly
                    (efx, efy)
                } else {
                    // Race to enemy's checkpoint to intercept
                    (ecx, ecy)
                };

                let diff = angle_diff(angle, (ty - y).atan2(tx - x).to_degrees()).abs();
                let dist_to_enemy = ((x - px[ei]).powi(2) + (y - py[ei]).powi(2)).sqrt();

                // SHIELD on collision
                if shield_cd[pod] <= 0 && dist_to_enemy < 900.0 {
                    let closing = -((px[ei]-x) * (pvx[ei]-vx) + (py[ei]-y) * (pvy[ei]-vy));
                    if closing > 0.0 {
                        shield_cd[pod] = 4;
                        println!("{:.0} {:.0} SHIELD", px[ei] + pvx[ei], py[ei] + pvy[ei]);
                        continue;
                    }
                }

                // BOOST to reach intercept point
                let thrust = if !boost_used[pod] && diff < 10.0 && my_dist_to_ecp > 5000.0 {
                    boost_used[pod] = true;
                    "BOOST".to_string()
                } else if diff >= 90.0 {
                    "0".to_string()
                } else {
                    format!("{}", 100)
                };

                eprintln!("BLOCKER -> enemy {} at ({:.0},{:.0}) cp{} dist={:.0}", ei, px[ei], py[ei], ecp, dist_to_enemy);
                println!("{:.0} {:.0} {}", tx, ty, thrust);
                continue;
            }

            // === POD 0: RACER ===
            let (cpx, cpy) = cps[cp_idx];
            let next_idx = (cp_idx + 1) % cp_count;
            let (ncx, ncy) = cps[next_idx];
            let dx = cpx - x; let dy = cpy - y;
            let dist = (dx * dx + dy * dy).sqrt();
            let diff = angle_diff(angle, dy.atan2(dx).to_degrees());
            let abs_diff = diff.abs();

            // Target: shift toward next CP
            let mut tx = cpx; let mut ty = cpy;
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

            // Collision avoidance
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

            let thrust: String = if !boost_used[pod] && cp_idx == boost_cp_idx
                && abs_diff < 5.0 && dist > 4000.0
            {
                boost_used[pod] = true;
                "BOOST".to_string()
            } else if abs_diff >= 90.0 {
                "0".to_string()
            } else {
                let mut t = if abs_diff > 60.0 { 15.0 }
                    else { 100.0 - abs_diff * 1.4 };

                // Brake for sharp turn ahead
                if upcoming_turn > 30.0 && dist < 3000.0 {
                    let turn_brake = (1.0 - upcoming_turn / 180.0).max(0.2);
                    let dist_f = (dist / 3000.0).max(0.2);
                    t *= turn_brake * dist_f + (1.0 - dist_f);
                }

                // Brake when fast and close
                if dist < 2000.0 && speed > 200.0 {
                    t = t.min((dist / speed * 60.0).max(10.0));
                }

                // SHIELD if enemy ramming us
                if shield_cd[pod] <= 0 {
                    for ei in 2..4 {
                        let ed = ((px[ei]-x).powi(2) + (py[ei]-y).powi(2)).sqrt();
                        if ed < 900.0 {
                            let closing = -((px[ei]-x)*(pvx[ei]-vx) + (py[ei]-y)*(pvy[ei]-vy));
                            if closing > 200.0 {
                                shield_cd[pod] = 4;
                                println!("{:.0} {:.0} SHIELD", tx, ty);
                                break;
                            }
                        }
                    }
                    if shield_cd[pod] == 4 { continue; }
                }

                format!("{}", (t as i32).max(0).min(100))
            };

            println!("{:.0} {:.0} {}", tx, ty, thrust);
        }
    }
}
