/// Number Shifting — CG submission version
/// Outputs level code, reads grid, outputs solution.
/// The level code should be updated as you progress through levels.

use std::io;
use std::time::Instant;

const TIME_LIMIT_MS: u128 = 18000;
const DX: [i32; 4] = [0, 1, 0, -1];
const DY: [i32; 4] = [1, 0, -1, 0];
const DIR_STR: [&str; 4] = ["D", "R", "U", "L"];

#[derive(Clone, Copy)]
struct Move { x: usize, y: usize, dir: usize, sub: bool }

fn solve(
    grid: &mut Vec<i32>, w: usize, h: usize, nonzero: &mut usize,
    result: &mut Vec<Move>, start: &Instant, nodes: &mut u64,
) -> bool {
    if *nonzero == 0 { return true; }
    if *nonzero == 1 { return false; }
    *nodes += 1;
    if *nodes % 10000 == 0 && start.elapsed().as_millis() > TIME_LIMIT_MS { return false; }

    let mut moves: Vec<(Move, i32)> = Vec::new();
    for x in 0..w {
        for y in 0..h {
            let val = grid[x * h + y];
            if val == 0 { continue; }
            for d in 0..4 {
                let nx = x as i32 + DX[d] * val;
                let ny = y as i32 + DY[d] * val;
                if nx < 0 || nx >= w as i32 || ny < 0 || ny >= h as i32 { continue; }
                let target = grid[nx as usize * h + ny as usize];
                if target == 0 { continue; }
                let sub_pri = if val == target { 5 }
                    else if val == 2 * target { 4 }
                    else if target == 2 * val { 3 }
                    else { 1 };
                moves.push((Move { x, y, dir: d, sub: true }, sub_pri));
                moves.push((Move { x, y, dir: d, sub: false }, 0));
            }
        }
    }
    moves.sort_by(|a, b| b.1.cmp(&a.1));

    for (m, _) in moves {
        let si = m.x * h + m.y;
        let val = grid[si];
        if val == 0 { continue; }
        let tx = (m.x as i32 + DX[m.dir] * val) as usize;
        let ty = (m.y as i32 + DY[m.dir] * val) as usize;
        let ti = tx * h + ty;
        let target = grid[ti];
        if target == 0 { continue; }

        let new_val = if m.sub { (target - val).abs() } else { target + val };
        grid[si] = 0;
        grid[ti] = new_val;
        *nonzero -= 1;
        if new_val == 0 { *nonzero -= 1; }
        result.push(m);

        if solve(grid, w, h, nonzero, result, start, nodes) { return true; }

        result.pop();
        grid[si] = val;
        grid[ti] = target;
        *nonzero += 1;
        if new_val == 0 { *nonzero += 1; }
    }
    false
}

fn main() {
    // === UPDATE THIS WITH YOUR CURRENT LEVEL CODE ===
    println!("first_level");

    let mut line = String::new();
    std::io::stdin().read_line(&mut line).unwrap();
    let parts: Vec<usize> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
    let (w, h) = (parts[0], parts[1]);

    let mut grid = vec![0i32; w * h];
    for y in 0..h {
        let mut row = String::new();
        io::stdin().read_line(&mut row).unwrap();
        let vals: Vec<i32> = row.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
        for x in 0..w { grid[x * h + y] = vals[x]; }
    }

    let nonzero = grid.iter().filter(|&&v| v != 0).count();
    let start = Instant::now();
    let mut result = vec![];
    let mut nz = nonzero;
    let mut nodes = 0u64;

    if solve(&mut grid, w, h, &mut nz, &mut result, &start, &mut nodes) {
        for m in &result {
            println!("{} {} {} {}", m.x, m.y, DIR_STR[m.dir], if m.sub { "-" } else { "+" });
        }
    }
}
