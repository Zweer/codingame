use std::io;

const MAX_W: f64 = 800.0;
const MAX_H: f64 = 515.0;
const MAX_TTC: f64 = 10.0;
const MASS_SAFE: f64 = 2.0;
const SHRINK: f64 = 0.9659258262890682; // sqrt(1 - 1/15)

#[derive(Clone)]
struct Blob {
    id: i32,
    player: i32,
    r: f64,
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    mass: f64,
    target: Option<(f64, f64, String)>, // tx, ty, label
}

impl Blob {
    fn new(id: i32, player: i32, r: f64, x: f64, y: f64, vx: f64, vy: f64) -> Self {
        Blob { id, player, r, x, y, vx, vy, mass: r * r, target: None }
    }

    fn dist(&self, o: &Blob) -> f64 {
        ((self.x - o.x).powi(2) + (self.y - o.y).powi(2)).sqrt()
    }

    fn dist2(&self, o: &Blob) -> f64 {
        (self.x - o.x).powi(2) + (self.y - o.y).powi(2)
    }

    fn moved(&self, t: f64) -> Blob {
        let mut b = self.clone();
        b.x += b.vx * t;
        b.y += b.vy * t;
        if b.x - b.r < 0.0 { b.x = b.r; b.vx *= -1.0; }
        if b.x + b.r > MAX_W { b.x = MAX_W * 2.0 - b.x - b.r; b.vx *= -1.0; }
        if b.y - b.r < 0.0 { b.y = b.r; b.vy *= -1.0; }
        if b.y + b.r > MAX_H { b.y = MAX_H * 2.0 - b.y - b.r; b.vy *= -1.0; }
        b
    }

    fn expeled(&self, tx: f64, ty: f64) -> Blob {
        let mut b = self.clone();
        let dx = tx - b.x;
        let dy = ty - b.y;
        let d = (dx * dx + dy * dy).sqrt();
        if d > 1e-9 {
            b.vx += (dx / d) * 200.0 / 14.0;
            b.vy += (dy / d) * 200.0 / 14.0;
            b.r *= SHRINK;
            b.mass = b.r * b.r;
        }
        b
    }

    fn closest_on_line(px: f64, py: f64, ax: f64, ay: f64, bx: f64, by: f64) -> (f64, f64) {
        let da = by - ay;
        let db = ax - bx;
        let c1 = da * ax + db * ay;
        let c2 = -db * px + da * py;
        let det = da * da + db * db;
        if det.abs() < 1e-12 { (px, py) }
        else { ((da * c1 - db * c2) / det, (da * c2 + db * c1) / det) }
    }

    fn ttc(&self, o: &Blob) -> f64 {
        let d2 = self.dist2(o);
        let sr2 = (self.r + o.r).powi(2);
        if d2 < sr2 { return 0.0; }
        if (self.vx - o.vx).abs() < 1e-12 && (self.vy - o.vy).abs() < 1e-12 { return 1e9; }

        let mx = self.x - o.x;
        let my = self.y - o.y;
        let svx = self.vx - o.vx;
        let svy = self.vy - o.vy;
        let spx = mx + svx;
        let spy = my + svy;

        let (cx, cy) = Self::closest_on_line(0.0, 0.0, mx, my, spx, spy);
        let pdist = cx * cx + cy * cy;
        let mypdist = (mx - cx).powi(2) + (my - cy).powi(2);

        if pdist < sr2 {
            let length = (svx * svx + svy * svy).sqrt();
            let backdist = (sr2 - pdist).sqrt();
            let fx = cx - backdist * (svx / length);
            let fy = cy - backdist * (svy / length);
            if (mx - fx).powi(2) + (my - fy).powi(2) > mypdist { return 1e9; }
            ((fx - mx).powi(2) + (fy - my).powi(2)).sqrt() / length
        } else {
            1e9
        }
    }
}

fn find_run(me: &Blob, blobs: &[Blob]) -> Option<(f64, f64)> {
    let mut min_t = MAX_TTC;
    let mut result = None;
    for b in blobs {
        if b.player == me.player { continue; }
        let t = me.ttc(b);
        if t < MAX_TTC && b.r > me.r && t < min_t {
            let future = b.moved(1.0);
            let tx = me.x + me.x - future.x - me.vx;
            let ty = me.y + me.y - future.y - me.vy;
            result = Some((tx, ty));
            min_t = t;
        }
    }
    result
}

fn find_attack(me: &Blob, blobs: &[Blob]) -> Option<(f64, f64)> {
    let mut min_dist = 1e9_f64;
    let mut min_ttc = 1e9_f64;
    let mut result = None;

    for b in blobs {
        if b.id == me.id { continue; }
        let d = me.dist(b);
        let dot = me.vx * b.vx + me.vy * b.vy;
        let t = me.ttc(b);

        if d < min_dist && me.r > 1.1 * b.r && d < 5.0 * me.r {
            if b.r > 25.0 || (dot <= 0.0 && me.r < 30.0) || d < 1.3 * (me.r + b.r) {
                if t <= min_ttc {
                    min_dist = d;
                    min_ttc = t;
                    let future = b.moved(1.0);
                    result = Some((future.x - me.vx, future.y - me.vy));
                }
            }
        }
    }
    result
}

fn should_wait(me: &Blob, blobs: &[Blob]) -> bool {
    let total: f64 = blobs.iter().map(|b| b.mass).sum();
    MASS_SAFE * me.mass > total
}

fn main() {
    let mut buf = String::new();
    io::stdin().read_line(&mut buf).unwrap();
    let my_id: i32 = buf.trim().parse().unwrap();

    loop {
        buf.clear(); io::stdin().read_line(&mut buf).unwrap();
        let _nc: usize = buf.trim().parse().unwrap();
        buf.clear(); io::stdin().read_line(&mut buf).unwrap();
        let ne: usize = buf.trim().parse().unwrap();

        let mut blobs = Vec::with_capacity(ne);
        for _ in 0..ne {
            buf.clear(); io::stdin().read_line(&mut buf).unwrap();
            let v: Vec<f64> = buf.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
            blobs.push(Blob::new(v[0] as i32, v[1] as i32, v[2], v[3], v[4], v[5], v[6]));
        }

        // Predict enemy actions (same logic as TS)
        let blobs_copy = blobs.clone();
        for b in blobs.iter_mut() {
            if b.player != my_id && b.player != -1 {
                if let Some((tx, ty)) = find_attack(b, &blobs_copy) {
                    b.target = Some((tx, ty, "ATT".into()));
                }
                if let Some((tx, ty)) = find_run(b, &blobs_copy) {
                    b.target = Some((tx, ty, "RUN".into()));
                }
                if should_wait(b, &blobs_copy) {
                    b.target = None;
                }
            }
        }

        // My chips
        let blobs_copy = blobs.clone();
        for b in blobs.iter_mut() {
            if b.player == my_id {
                if let Some((tx, ty)) = find_attack(b, &blobs_copy) {
                    b.target = Some((tx, ty, "ATT".into()));
                }
                if let Some((tx, ty)) = find_run(b, &blobs_copy) {
                    b.target = Some((tx, ty, "RUN".into()));
                }
                if should_wait(b, &blobs_copy) {
                    b.target = None;
                }
            }
        }

        // Output
        for b in &blobs {
            if b.player == my_id {
                if let Some((tx, ty, _)) = &b.target {
                    println!("{:.0} {:.0}", tx, ty);
                } else {
                    println!("WAIT");
                }
            }
        }
    }
}
