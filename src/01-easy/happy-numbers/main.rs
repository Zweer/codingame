use std::collections::HashSet;
use std::io;

fn digit_square_sum(s: &str) -> u64 {
    s.bytes().map(|b| { let d = (b - b'0') as u64; d * d }).sum()
}

fn is_happy(n: &str) -> bool {
    let mut seen = HashSet::new();
    let mut sum = digit_square_sum(n);
    while sum != 1 && seen.insert(sum) {
        sum = digit_square_sum(&sum.to_string());
    }
    sum == 1
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let n: usize = input.trim().parse().unwrap();

    for _ in 0..n {
        let mut line = String::new();
        io::stdin().read_line(&mut line).unwrap();
        let num = line.trim();
        println!("{} {}", num, if is_happy(num) { ":)" } else { ":(" });
    }
}
