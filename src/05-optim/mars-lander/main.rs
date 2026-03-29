// Exact port of the Java solution for Mars Lander optim.
use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();

    let n: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let mut surface = Vec::new();
    for _ in 0..n {
        let line = lines.next().unwrap().unwrap();
        let p: Vec<i32> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
        surface.push((p[0], p[1]));
    }

    let mut left_x = 0i32;
    let mut right_x = 7000i32;
    let mut site_y = 0i32;
    for i in 1..surface.len() {
        if surface[i].1 == surface[i - 1].1 {
            left_x = surface[i - 1].0;
            right_x = surface[i].0;
            site_y = surface[i].1;
        }
    }

    loop {
        let line = match lines.next() { Some(Ok(l)) => l, _ => break };
        let v: Vec<i32> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
        let (x, y, hs, vs, _fuel, r, _p) = (v[0], v[1], v[2], v[3], v[4], v[5], v[6]);

        let dist = if x < left_x { x - left_x } else if x <= right_x { 0 } else { x - right_x };
        let should_keep_alt = (y - site_y) < 600 && dist.abs() > 1200;

        // getRotation
        let rotation = if should_keep_alt && hs != 0 {
            0
        } else {
            let mut angle_x = ((dist as f64) * (3.0 / 185.0)).round() as i32;
            angle_x += (angle_x as f64 / 0.67) as i32;
            let mut angle_hs = 0;
            if hs.abs() > 7 && y > site_y + 100 {
                angle_hs = ((hs as f64) * (9.0 / 24.7)).round() as i32;
                angle_hs += (angle_hs as f64 / 0.7) as i32;
            }
            (angle_x + angle_hs).clamp(-90, 90)
        };

        // getPower
        let power = if should_keep_alt && vs < -1 {
            4
        } else if dist == 0 && r == 0 && (y - site_y) < 123 && vs > -30 {
            0
        } else {
            let hs_comp = if (r < 0 && hs < 0) || (r > 0 && hs > 0) {
                ((hs as f64) / 15.0).round().abs() as i32
            } else {
                0
            };
            let vs_comp = -((vs as f64) / 6.6).round() as i32;
            (hs_comp + vs_comp).min(4)
        };

        println!("{} {}", rotation, power);
    }
}
