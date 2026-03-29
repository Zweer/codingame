use std::io;
fn main() {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    let n: i32 = s.trim().parse().unwrap();
    if n == 0 { println!("0"); return; }
    let mut s2 = String::new();
    io::stdin().read_line(&mut s2).unwrap();
    let t: Vec<i32> = s2.trim().split(' ').map(|x| x.parse().unwrap()).collect();
    let mut r = t[0];
    for &v in &t {
        if v.abs() < r.abs() || (v.abs() == r.abs() && v > 0) { r = v; }
    }
    println!("{}", r);
}
