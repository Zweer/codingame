use std::io;
fn main() {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    let n: usize = s.trim().parse().unwrap();
    let mut h = Vec::with_capacity(n);
    for _ in 0..n {
        let mut s = String::new();
        io::stdin().read_line(&mut s).unwrap();
        h.push(s.trim().parse::<i64>().unwrap());
    }
    h.sort();
    let min = h.windows(2).map(|w| w[1] - w[0]).min().unwrap();
    println!("{}", min);
}
