use std::io;

fn digit_sum(mut n: u64) -> u64 {
    let mut s = 0;
    while n > 0 {
        s += n % 10;
        n /= 10;
    }
    s
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let mut r1: u64 = input.trim().parse().unwrap();

    input.clear();
    io::stdin().read_line(&mut input).unwrap();
    let mut r2: u64 = input.trim().parse().unwrap();

    while r1 != r2 {
        if r1 < r2 {
            r1 += digit_sum(r1);
        } else {
            r2 += digit_sum(r2);
        }
    }
    println!("{}", r1);
}
