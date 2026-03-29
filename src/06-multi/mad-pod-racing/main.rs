use std::io;

const _CP_R: f64 = 600.0;
const _POD_R: f64 = 400.0;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s
}

#[derive(Clone, Copy)]
struct Pod {
    x: f64, y: f64,
    vx: f64, vy: f64,
    angle: f64,
    next_cp: usize,
}

impl Pod {
    fn speed(&self) -> f64 { (self.vx * self.vx + self.vy * self.vy).sqrt() }
    fn dist_to(&self, px: f64, py: f64) -> f64 {
        ((self.x - px).powi(2) + (self.y - py).powi(2)).sqrt()
    }
    fn angle_to(&self, px: f64, py: f64) -> f64 {
        let a = (py - self.y).atan2(px - self.x).to_degrees();
        let mut diff = a - self.angle;
        while diff > 180.0 { diff -= 360.0; }
        while diff < -180.0 { diff += 360.0; }
        diff
    }
}

fn main() {
    let laps: usize = read_line().trim().parse().unwrap();
    let cp_count: usize = read_line().trim().parse().unwrap();
    let mut cps = Vec::with_capacity(cp_count);
    for _ in 0..cp_count {
        let v: Vec<f64> = read_line().trim().split_whitespace()
            .map(|s| s.parse().unwrap()).collect();
        cps.push((v[0], v[1]));
    }

    // Find longest stretch for BOOST
    let mut longest_sq = 0.0_f64;
    let mut boost_cp_idx = 0;
    for i in 0..cp_count {
        let j = (i + 1) % cp_count;
        let dx = cps[j].0 - cps[i].0;
        let dy = cps[j].1 - cps[i].1;
        let d2 = dx * dx + dy * dy;
        if d2 > longest_sq { longest_sq = d2; boost_cp_idx = j; }
    }

    let _total_cps = laps * cp_count;
    let mut boost_used = [false; 2];

    loop {
        let mut pods = [Pod { x: 0.0, y: 0.0, vx: 0.0, vy: 0.0, angle: 0.0, next_cp: 0 }; 4];
        for i in 0..4 {
            let v: Vec<f64> = read_line().trim().split_whitespace()
                .map(|s| s.parse().unwrap()).collect();
            pods[i] = Pod {
                x: v[0], y: v[1], vx: v[2], vy: v[3],
                angle: v[4], next_cp: v[5] as usize,
            };
        }

        // Track checkpoint progress (how many CPs passed)
        // We detect when next_cp changes
        // (simplified: just use next_cp + laps info for relative progress)

        // Determine which enemy pod is ahead
        let enemy_leader = if pods[2].next_cp >= pods[3].next_cp { 2 } else { 3 };

        // === POD 0: RACER ===
        {
            let me = &pods[0];
            let cp_idx = me.next_cp;
            let (cpx, cpy) = cps[cp_idx];
            let next_idx = (cp_idx + 1) % cp_count;
            let (ncx, ncy) = cps[next_idx];
            let dist = me.dist_to(cpx, cpy);
            let diff = me.angle_to(cpx, cpy);
            let abs_diff = diff.abs();
            let speed = me.speed();

            // Target: shift toward next CP when close
            let mut tx = cpx;
            let mut ty = cpy;
            let dnx = ncx - cpx;
            let dny = ncy - cpy;
            let dn = (dnx * dnx + dny * dny).sqrt();
            if dn > 1.0 && dist < 2500.0 && abs_diff < 60.0 {
                let factor = (1.0 - dist / 2500.0).max(0.0);
                tx = cpx + dnx / dn * 400.0 * factor;
                ty = cpy + dny / dn * 400.0 * factor;
            }

            // Drift compensation
            if speed > 100.0 {
                let dx = tx - me.x;
                let dy = ty - me.y;
                let d = (dx * dx + dy * dy).sqrt();
                if d > 1.0 {
                    let ux = dx / d;
                    let uy = dy / d;
                    let perp = -me.vx * uy + me.vy * ux;
                    tx += uy * perp * 2.5;
                    ty += -ux * perp * 2.5;
                }
            }

            // Thrust
            let thrust: String = if !boost_used[0] && cp_idx == boost_cp_idx
                && abs_diff < 5.0 && dist > 4000.0
            {
                boost_used[0] = true;
                "BOOST".to_string()
            } else if abs_diff >= 90.0 {
                "0".to_string()
            } else {
                let mut t = if abs_diff > 60.0 { 20 }
                    else { (100.0 - abs_diff * 1.2) as i32 };

                if dist < 1500.0 && speed > 200.0 {
                    let brake = ((dist / speed) * 50.0) as i32;
                    t = t.min(brake.max(10));
                }
                if dist < 600.0 { t = t.min(30); }
                format!("{}", t.max(0).min(100))
            };

            println!("{:.0} {:.0} {}", tx, ty, thrust);
        }

        // === POD 1: BLOCKER ===
        {
            let me = &pods[1];
            let enemy = &pods[enemy_leader];
            let ecp = enemy.next_cp;
            let (ecpx, ecpy) = cps[ecp];

            // Position between enemy and their next checkpoint
            // Aim slightly ahead of the enemy's target
            let ex_future = enemy.x + enemy.vx * 3.0;
            let ey_future = enemy.y + enemy.vy * 3.0;

            // Intercept point: between enemy future pos and their checkpoint
            let mut tx = (ex_future + ecpx) / 2.0;
            let mut ty = (ey_future + ecpy) / 2.0;

            let dist_to_enemy = me.dist_to(enemy.x, enemy.y);
            let diff = me.angle_to(tx, ty);
            let abs_diff = diff.abs();

            // If very close to enemy, ram them
            if dist_to_enemy < 1500.0 {
                tx = enemy.x + enemy.vx * 2.0;
                ty = enemy.y + enemy.vy * 2.0;

                // Use SHIELD if about to collide
                if dist_to_enemy < 850.0 && me.speed() > 100.0 {
                    println!("{:.0} {:.0} SHIELD", tx, ty);
                    continue;
                }
            }

            // If too far from action, race toward enemy's checkpoint
            if dist_to_enemy > 5000.0 {
                tx = ecpx;
                ty = ecpy;
            }

            // Thrust
            let thrust: String = if !boost_used[1] && dist_to_enemy > 6000.0 && abs_diff < 10.0 {
                boost_used[1] = true;
                "BOOST".to_string()
            } else if abs_diff >= 90.0 {
                "20".to_string()
            } else {
                format!("{}", (100.0 - abs_diff * 0.8) as i32)
            };

            println!("{:.0} {:.0} {}", tx, ty, thrust);
        }
    }
}
