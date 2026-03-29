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

    // Precompute: angle change at each checkpoint (how sharp the turn is)
    let mut turn_angle = vec![0.0f64; cp_count];
    for i in 0..cp_count {
        let prev = (i + cp_count - 1) % cp_count;
        let next = (i + 1) % cp_count;
        let a1 = (cps[i].1 - cps[prev].1).atan2(cps[i].0 - cps[prev].0).to_degrees();
        let a2 = (cps[next].1 - cps[i].1).atan2(cps[next].0 - cps[i].0).to_degrees();
        turn_angle[i] = angle_diff(a1, a2).abs();
    }

    // Find longest stretch for BOOST
    let mut longest_sq = 0.0_f64;
    let mut boost_cp_idx = 0;
    for i in 0..cp_count {
        let j = (i + 1) % cp_count;
        let dx = cps[j].0 - cps[i].0;
        let dy = cps[j].1 - cps[i].1;
        let d2 = dx * dx + dy * dy;
        // Only boost if the turn at destination is mild
        if d2 > longest_sq && turn_angle[j] < 40.0 {
            longest_sq = d2;
            boost_cp_idx = j;
        }
    }

    let mut boost_used = [false; 2];
    let mut shield_cd = [0i32; 2]; // shield cooldown

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

        for s in shield_cd.iter_mut() { if *s > 0 { *s -= 1; } }

        // Determine enemy leader
        let enemy_leader = if pcp[2] > pcp[3] { 2 }
            else if pcp[3] > pcp[2] { 3 }
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
            let (cpx, cpy) = cps[cp_idx];
            let next_idx = (cp_idx + 1) % cp_count;
            let (ncx, ncy) = cps[next_idx];

            let dx = cpx - x; let dy = cpy - y;
            let dist = (dx * dx + dy * dy).sqrt();
            let speed = (vx * vx + vy * vy).sqrt();
            let diff = angle_diff(angle, dy.atan2(dx).to_degrees());
            let abs_diff = diff.abs();

            let is_blocker = pod == 1;

            // === BLOCKER LOGIC ===
            if is_blocker {
                let ei = enemy_leader;
                let ecp = pcp[ei];
                let (ecx, ecy) = cps[ecp];
                let edist = ((px[ei]-ecx).powi(2) + (py[ei]-ecy).powi(2)).sqrt();

                // Target: between enemy and their checkpoint
                // Weighted toward checkpoint when far, toward enemy when close
                let w = (edist / 4000.0).min(1.0);
                let tx = ecx * w + (px[ei] + pvx[ei] * 3.0) * (1.0 - w);
                let ty = ecy * w + (py[ei] + pvy[ei] * 3.0) * (1.0 - w);

                let my_dist = ((x - px[ei]).powi(2) + (y - py[ei]).powi(2)).sqrt();
                let my_diff = angle_diff(angle, (ty - y).atan2(tx - x).to_degrees()).abs();

                // SHIELD when about to collide with enemy
                if shield_cd[pod] <= 0 && my_dist < 900.0 && speed > 100.0 {
                    shield_cd[pod] = 4;
                    println!("{:.0} {:.0} SHIELD", px[ei] + pvx[ei], py[ei] + pvy[ei]);
                    continue;
                }

                let t = if my_diff >= 90.0 { 0 }
                    else { (100.0 - my_diff * 0.8) as i32 };
                println!("{:.0} {:.0} {}", tx, ty, t.max(30).min(100));
                continue;
            }

            // === RACER LOGIC ===

            // Target: shift toward next CP when close
            let mut tx = cpx;
            let mut ty = cpy;
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

            // Collision avoidance: if enemy pod is between us and target, steer around
            for ei in 2..4 {
                let edx = px[ei] - x; let edy = py[ei] - y;
                let ed = (edx * edx + edy * edy).sqrt();
                if ed < 1200.0 && ed < dist {
                    // Check if enemy is roughly in our path
                    let tdx = tx - x; let tdy = ty - y;
                    let td = (tdx * tdx + tdy * tdy).sqrt();
                    if td > 1.0 {
                        let dot = (edx * tdx + edy * tdy) / (ed * td);
                        if dot > 0.5 { // enemy is ahead in our direction
                            // Steer perpendicular
                            let perpx = -tdy / td;
                            let perpy = tdx / td;
                            // Choose side based on cross product
                            let cross = edx * tdy - edy * tdx;
                            let sign = if cross > 0.0 { 1.0 } else { -1.0 };
                            tx += perpx * 600.0 * sign;
                            ty += perpy * 600.0 * sign;
                        }
                    }
                }
            }

            // === THRUST ===
            // How sharp is the upcoming turn?
            let upcoming_turn = turn_angle[cp_idx];

            let thrust: String = if !boost_used[pod] && cp_idx == boost_cp_idx
                && abs_diff < 5.0 && dist > 4000.0
            {
                boost_used[pod] = true;
                "BOOST".to_string()
            } else if abs_diff >= 90.0 {
                "0".to_string()
            } else {
                // Base thrust from angle
                let mut t = if abs_diff > 60.0 { 15.0 }
                    else { 100.0 - abs_diff * 1.4 };

                // Brake for upcoming sharp turn
                if upcoming_turn > 30.0 && dist < 3000.0 {
                    let turn_brake = (1.0 - upcoming_turn / 180.0).max(0.2);
                    let dist_factor = (dist / 3000.0).max(0.2);
                    t *= turn_brake * dist_factor + (1.0 - dist_factor);
                }

                // Brake when approaching fast
                if dist < 2000.0 && speed > 200.0 {
                    let brake = (dist / speed) * 60.0;
                    t = t.min(brake.max(10.0));
                }

                // SHIELD if enemy about to ram us
                if shield_cd[pod] <= 0 {
                    for ei in 2..4 {
                        let ed = ((px[ei]-x).powi(2) + (py[ei]-y).powi(2)).sqrt();
                        let espd = ((pvx[ei]).powi(2) + (pvy[ei]).powi(2)).sqrt();
                        if ed < 900.0 && espd > 200.0 {
                            shield_cd[pod] = 4;
                            println!("{:.0} {:.0} SHIELD", tx, ty);
                            break;
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
