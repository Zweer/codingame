use std::io;
fn main() {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    let v: Vec<i32> = s.trim().split(' ').map(|x| x.parse().unwrap()).collect();
    let (lx, ly) = (v[0], v[1]);
    let (mut tx, mut ty) = (v[2], v[3]);
    loop {
        let mut buf = String::new();
        io::stdin().read_line(&mut buf).unwrap();
        let mut dir = String::new();
        if ty > ly { dir.push('N'); ty -= 1; }
        else if ty < ly { dir.push('S'); ty += 1; }
        if tx > lx { dir.push('W'); tx -= 1; }
        else if tx < lx { dir.push('E'); tx += 1; }
        println!("{}", dir);
    }
}
