use std::io;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s
}

fn main() {
    let mut boost_used = false;
    let mut prev_x = 0.0_f64;
    let mut prev_y = 0.0_f64;
    let mut first_turn = true;

    // Checkpoint tracking
    let mut cps: Vec<(f64, f64)> = Vec::new();
    let mut prev_cpx = -1.0_f64;
    let mut prev_cpy = -1.0_f64;
    let mut mapped = false;
    let mut longest_sq = 0.0_f64;
    let mut boost_cp: (f64, f64) = (0.0, 0.0);

    loop {
        let v: Vec<f64> = read_line().trim().split_whitespace()
            .map(|s| s.parse().unwrap()).collect();
        let (x, y, cpx, cpy, dist, angle) = (v[0], v[1], v[2], v[3], v[4], v[5]);

        let _: Vec<f64> = read_line().trim().split_whitespace()
            .map(|s| s.parse().unwrap()).collect();

        // Infer velocity
        let (vx, vy) = if first_turn { (0.0, 0.0) } else { (x - prev_x, y - prev_y) };
        let speed = (vx * vx + vy * vy).sqrt();

        // Map checkpoints
        if !mapped {
            if cpx != prev_cpx || cpy != prev_cpy || cps.is_empty() {
                if cps.iter().any(|&(cx, cy)| (cx - cpx).abs() < 1.0 && (cy - cpy).abs() < 1.0) {
                    mapped = true;
                    for i in 0..cps.len() {
                        let j = (i + 1) % cps.len();
                        let dx = cps[j].0 - cps[i].0;
                        let dy = cps[j].1 - cps[i].1;
                        let d2 = dx * dx + dy * dy;
                        if d2 > longest_sq {
                            longest_sq = d2;
                            boost_cp = cps[j];
                        }
                    }
                    eprintln!("Mapped {} cps, boost toward ({},{})", cps.len(), boost_cp.0, boost_cp.1);
                } else {
                    cps.push((cpx, cpy));
                }
            }
        }

        // Find next checkpoint index and position
        let next_cp_pos = if mapped {
            let idx = cps.iter().position(|&(cx, cy)| (cx - cpx).abs() < 1.0 && (cy - cpy).abs() < 1.0);
            idx.map(|i| cps[(i + 1) % cps.len()])
        } else {
            None
        };

        let abs_angle = angle.abs();

        // === COMPUTE TARGET ===
        let mut tx = cpx;
        let mut ty = cpy;

        // When we know the next checkpoint, steer the target so we cut through
        // the current checkpoint toward the next one
        if let Some((nx, ny)) = next_cp_pos {
            // Vector from current cp to next cp
            let dnx = nx - cpx;
            let dny = ny - cpy;
            let dn = (dnx * dnx + dny * dny).sqrt();
            if dn > 1.0 && dist < 2500.0 && abs_angle < 60.0 {
                // Offset the target toward the next checkpoint
                // More offset when closer
                let factor = (1.0 - dist / 2500.0).max(0.0);
                tx = cpx + dnx / dn * 400.0 * factor;
                ty = cpy + dny / dn * 400.0 * factor;
            }
        }

        // Compensate for current drift: aim ahead of where we need to go
        // by subtracting a portion of our velocity from the target
        if speed > 100.0 {
            let dx = tx - x;
            let dy = ty - y;
            let d = (dx * dx + dy * dy).sqrt();
            if d > 1.0 {
                // Unit vector toward target
                let ux = dx / d;
                let uy = dy / d;
                // Component of velocity perpendicular to target direction
                let perp = -vx * uy + vy * ux;
                // Compensate: shift target opposite to perpendicular drift
                tx += uy * perp * 2.5;
                ty += -ux * perp * 2.5;
            }
        }

        // === COMPUTE THRUST ===
        // Recompute angle to adjusted target
        let dx = tx - x;
        let dy = ty - y;
        let _target_angle = dy.atan2(dx).to_degrees();
        // We don't know pod facing angle precisely, use the game-provided angle to checkpoint
        // So use the original angle for thrust decisions

        let thrust: String = if !boost_used && mapped
            && (cpx - boost_cp.0).abs() < 1.0 && (cpy - boost_cp.1).abs() < 1.0
            && abs_angle < 5.0 && dist > 4000.0
        {
            boost_used = true;
            "BOOST".to_string()
        } else if abs_angle >= 90.0 {
            // Facing away: full brake
            "0".to_string()
        } else {
            // Thrust proportional to alignment
            let mut t = if abs_angle > 60.0 {
                // Poor alignment: coast
                20
            } else {
                // Good alignment: scale with angle
                (100.0 - abs_angle * 1.2) as i32
            };

            // Approaching checkpoint fast: brake to not overshoot
            if dist < 1500.0 && speed > 200.0 {
                let brake = ((dist / speed) * 50.0) as i32;
                t = t.min(brake.max(10));
            }

            // Very close: just enough thrust to reach
            if dist < 600.0 {
                t = t.min(30);
            }

            format!("{}", t.max(0).min(100))
        };

        println!("{:.0} {:.0} {}", tx, ty, thrust);

        prev_x = x;
        prev_y = y;
        prev_cpx = cpx;
        prev_cpy = cpy;
        first_turn = false;
    }
}
