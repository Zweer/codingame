use std::io;
fn main() {
    loop {
        let (mut max, mut idx) = (-1i32, 0);
        for i in 0..8 {
            let mut s = String::new();
            io::stdin().read_line(&mut s).unwrap();
            let h: i32 = s.trim().parse().unwrap();
            if h > max { max = h; idx = i; }
        }
        println!("{}", idx);
    }
}
