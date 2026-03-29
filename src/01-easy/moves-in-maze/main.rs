use std::collections::VecDeque;
use std::io;

fn main() {
    let mut line = String::new();
    io::stdin().read_line(&mut line).unwrap();
    let mut it = line.trim().split(' ');
    let w: usize = it.next().unwrap().parse().unwrap();
    let h: usize = it.next().unwrap().parse().unwrap();

    let mut grid: Vec<Vec<u8>> = Vec::with_capacity(h);
    let mut start = (0, 0);
    for r in 0..h {
        let mut row = String::new();
        io::stdin().read_line(&mut row).unwrap();
        let bytes: Vec<u8> = row.trim().bytes().collect();
        if let Some(c) = bytes.iter().position(|&b| b == b'S') {
            start = (r, c);
        }
        grid.push(bytes);
    }

    let chars = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let mut dist = vec![vec![-1i32; w]; h];
    dist[start.0][start.1] = 0;
    let mut queue = VecDeque::new();
    queue.push_back(start);

    while let Some((r, c)) = queue.pop_front() {
        for (dr, dc) in [(0, 1), (0, -1), (1, 0), (-1, 0)] {
            let nr = (r as isize + dr).rem_euclid(h as isize) as usize;
            let nc = (c as isize + dc).rem_euclid(w as isize) as usize;
            if grid[nr][nc] != b'#' && dist[nr][nc] == -1 {
                dist[nr][nc] = dist[r][c] + 1;
                queue.push_back((nr, nc));
            }
        }
    }

    for r in 0..h {
        let row: String = (0..w).map(|c| {
            if grid[r][c] == b'#' { '#' }
            else if dist[r][c] == -1 { '.' }
            else { chars[dist[r][c] as usize] as char }
        }).collect();
        println!("{}", row);
    }
}
