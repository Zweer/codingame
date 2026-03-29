use std::io;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s
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

    let mut boost_used = [false; 2];

    loop {
        let mut px = [0.0f64; 4];
        let mut py = [0.0f64; 4];
        let mut pvx = [0.0f64; 4];
        let mut pvy = [0.0f64; 4];
        let mut pa = [0.0f64; 4];
        let mut pcp = [0usize; 4];

        for i in 0..4 {
            let v: Vec<f64> = read_line().trim().split_whitespace()
                .map(|s| s.parse().unwrap()).collect();
            px[i] = v[0]; py[i] = v[1];
            pvx[i] = v[2]; pvy[i] = v[3];
            pa[i] = v[4]; pcp[i] = v[5] as usize;
        }

        for pod in 0..2 {
            let x = px[pod]; let y = py[pod];
            let vx = pvx[pod]; let vy = pvy[pod];
            let angle = pa[pod];
            let cp_idx = pcp[pod];
            let (cpx, cpy) = cps[cp_idx];
            let next_idx = (cp_idx + 1) % cp_count;
            let (ncx, ncy) = cps[next_idx];

            let dx = cpx - x;
            let dy = cpy - y;
            let dist = (dx * dx + dy * dy).sqrt();
            let speed = (vx * vx + vy * vy).sqrt();

            // Angle to checkpoint
            let a = (dy).atan2(dx).to_degrees();
            let mut diff = a - angle;
            while diff > 180.0 { diff -= 360.0; }
            while diff < -180.0 { diff += 360.0; }
            let abs_diff = diff.abs();

            // Target: shift toward next CP when close
            let mut tx = cpx;
            let mut ty = cpy;
            let dnx = ncx - cpx;
            let dny = ncy - cpy;
            let dn = (dnx * dnx + dny * dny).sqrt();
            if dn > 1.0 && dist < 2500.0 && abs_diff < 60.0 {
                let f = (1.0 - dist / 2500.0).max(0.0);
                tx = cpx + dnx / dn * 400.0 * f;
                ty = cpy + dny / dn * 400.0 * f;
            }

            // Drift compensation
            if speed > 100.0 {
                let tdx = tx - x;
                let tdy = ty - y;
                let td = (tdx * tdx + tdy * tdy).sqrt();
                if td > 1.0 {
                    let ux = tdx / td;
                    let uy = tdy / td;
                    let perp = -vx * uy + vy * ux;
                    tx += uy * perp * 2.5;
                    ty += -ux * perp * 2.5;
                }
            }

            // Thrust
            let thrust: String = if !boost_used[pod] && cp_idx == boost_cp_idx
                && abs_diff < 5.0 && dist > 4000.0
            {
                boost_used[pod] = true;
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
    }
}
