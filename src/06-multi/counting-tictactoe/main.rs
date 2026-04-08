use std::io;
use std::time::Instant;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

const N: usize = 10;

#[derive(Clone)]
struct Board {
    cells: [u8; N * N],
    sc: [i32; 2],
    empty: u32,
    hash: u64,
}

// Zobrist
static mut ZOB: [[u64; 3]; 100] = [[0; 3]; 100]; // [cell][player]

fn init_zobrist() {
    let mut rng: u64 = 0xABCDEF0123456789;
    let mut next = || -> u64 { rng ^= rng << 13; rng ^= rng >> 7; rng ^= rng << 17; rng };
    unsafe { for i in 0..100 { for p in 0..3 { ZOB[i][p] = next(); } } }
}

impl Board {
    fn new() -> Self { Board { cells: [0; N * N], sc: [0; 2], empty: 100, hash: 0 } }

    fn place(&mut self, pos: usize, p: u8) -> i32 {
        let delta = self.new_threes(pos, p);
        self.cells[pos] = p;
        self.sc[p as usize - 1] += delta;
        self.empty -= 1;
        unsafe { self.hash ^= ZOB[pos][p as usize]; }
        delta
    }

    fn unplace(&mut self, pos: usize, p: u8, delta: i32) {
        unsafe { self.hash ^= ZOB[pos][p as usize]; }
        self.cells[pos] = 0;
        self.sc[p as usize - 1] -= delta;
        self.empty += 1;
    }

    fn new_threes(&self, pos: usize, p: u8) -> i32 {
        let r = pos / N;
        let c = pos % N;
        let mut count = 0i32;
        let is_p = |rr: usize, cc: usize| self.cells[rr * N + cc] == p;

        // Horizontal
        for sc in c.saturating_sub(2)..=(c.min(N - 3)) {
            if (sc == c || is_p(r, sc)) && (sc + 1 == c || is_p(r, sc + 1)) && (sc + 2 == c || is_p(r, sc + 2)) {
                count += 1;
            }
        }
        // Vertical
        for sr in r.saturating_sub(2)..=(r.min(N - 3)) {
            if (sr == r || is_p(sr, c)) && (sr + 1 == r || is_p(sr + 1, c)) && (sr + 2 == r || is_p(sr + 2, c)) {
                count += 1;
            }
        }
        // Diag DR
        for d in 0..3usize {
            let (sr, sc2) = (r as i32 - d as i32, c as i32 - d as i32);
            if sr < 0 || sc2 < 0 || sr + 2 >= N as i32 || sc2 + 2 >= N as i32 { continue; }
            let mut ok = true;
            for k in 0..3i32 {
                let (rr, cc) = ((sr + k) as usize, (sc2 + k) as usize);
                if rr == r && cc == c { continue; }
                if !is_p(rr, cc) { ok = false; break; }
            }
            if ok { count += 1; }
        }
        // Diag DL
        for d in 0..3usize {
            let (sr, sc2) = (r as i32 - d as i32, c as i32 + d as i32);
            if sr < 0 || sc2 >= N as i32 || sr + 2 >= N as i32 || sc2 - 2 < 0 { continue; }
            let mut ok = true;
            for k in 0..3i32 {
                let (rr, cc) = ((sr + k) as usize, (sc2 - k) as usize);
                if rr == r && cc == c { continue; }
                if !is_p(rr, cc) { ok = false; break; }
            }
            if ok { count += 1; }
        }
        count
    }

    fn get_empty_sorted(&self, me: u8, opp: u8) -> Vec<(i32, usize)> {
        let mut v = Vec::with_capacity(self.empty as usize);
        for i in 0..N * N {
            if self.cells[i] == 0 {
                let g = self.new_threes(i, me) * 3 + self.new_threes(i, opp) * 2;
                v.push((-g, i));
            }
        }
        v.sort_unstable();
        v
    }
}

fn mirror(pos: usize) -> usize { N * N - 1 - pos }

// --- TT for solver ---
const TT_SIZE: usize = 1 << 20;
const TT_MASK: usize = TT_SIZE - 1;

#[derive(Clone, Copy)]
struct TTE { hash: u64, depth: u8, flag: u8, val: i16 }
static mut TT: [TTE; TT_SIZE] = [TTE { hash: 0, depth: 0, flag: 0, val: 0 }; TT_SIZE];

const EXACT: u8 = 0;
const LOWER: u8 = 1;
const UPPER: u8 = 2;

static mut TIMED_OUT: bool = false;
static mut DEADLINE: Instant = unsafe { std::mem::zeroed() };
static mut NODES: u64 = 0;

fn negamax(board: &mut Board, me: u8, opp: u8, depth: u32, mut alpha: i32, beta: i32) -> i32 {
    unsafe {
        NODES += 1;
        if NODES & 2047 == 0 && Instant::now() >= DEADLINE { TIMED_OUT = true; return 0; }
        if TIMED_OUT { return 0; }
    }

    if board.empty == 0 || depth == 0 {
        return board.sc[me as usize - 1] - board.sc[opp as usize - 1];
    }

    // TT probe
    let hash = board.hash;
    unsafe {
        let idx = hash as usize & TT_MASK;
        let e = &TT[idx];
        if e.hash == hash && e.depth as u32 >= depth {
            let v = e.val as i32;
            match e.flag {
                EXACT => return v,
                LOWER => if v >= beta { return v; },
                UPPER => if v <= alpha { return v; },
                _ => {}
            }
        }
    }

    let moves = board.get_empty_sorted(me, opp);
    let mut best = i32::MIN;
    let orig_alpha = alpha;

    for &(_, pos) in &moves {
        let delta = board.place(pos, me);
        let val = -negamax(board, opp, me, depth - 1, -beta, -alpha);
        board.unplace(pos, me, delta);
        if unsafe { TIMED_OUT } { return 0; }
        if val > best { best = val; }
        if best > alpha { alpha = best; }
        if alpha >= beta { break; }
    }

    // TT store
    unsafe {
        let idx = hash as usize & TT_MASK;
        let flag = if best <= orig_alpha { UPPER } else if best >= beta { LOWER } else { EXACT };
        TT[idx] = TTE { hash, depth: depth as u8, flag, val: best as i16 };
    }

    best
}

fn try_solve(board: &mut Board, valid: &[usize], my_id: u8, start: Instant) -> Option<usize> {
    let opp_id = if my_id == 1 { 2 } else { 1 };

    // Try with increasing depth
    let max_depth = board.empty;
    let time_budget = if board.empty <= 16 { 85u64 } else { 70 };
    let deadline = start + std::time::Duration::from_millis(time_budget);

    unsafe { TIMED_OUT = false; DEADLINE = deadline; NODES = 0; }

    let mut best_move = None;
    let mut best_val = i32::MIN;

    // Order valid moves
    let mut moves: Vec<(i32, usize)> = valid.iter().map(|&pos| {
        let g = board.new_threes(pos, my_id) * 3 + board.new_threes(pos, opp_id) * 2;
        (-g, pos)
    }).collect();
    moves.sort_unstable();

    for &(_, pos) in &moves {
        let delta = board.place(pos, my_id);
        let val = -negamax(board, opp_id, my_id, max_depth - 1, i32::MIN + 1, i32::MAX);
        board.unplace(pos, my_id, delta);
        if unsafe { TIMED_OUT } {
            eprintln!("solve timeout empty={} nodes={}", board.empty, unsafe { NODES });
            return None;
        }
        if val > best_val { best_val = val; best_move = Some(pos); }
    }

    eprintln!("SOLVED empty={} val={} nodes={}", board.empty, best_val, unsafe { NODES });
    if best_val > 0 { best_move } else { None }
}

fn best_greedy(board: &Board, valid: &[usize], my_id: u8) -> usize {
    let opp_id = if my_id == 1 { 2 } else { 1 };
    let mut best = valid[0];
    let mut best_score = i32::MIN;
    for &pos in valid {
        let my_gain = board.new_threes(pos, my_id);
        let opp_gain = board.new_threes(pos, opp_id);
        let score = my_gain * 3 + opp_gain * 2;
        let mb = if board.cells[mirror(pos)] == 0 { 1 } else { 0 };
        let total = score * 10 + mb;
        if total > best_score { best_score = total; best = pos; }
    }
    best
}

fn main() {
    init_zobrist();
    let mut board = Board::new();
    let mut my_id: u8 = 0;

    loop {
        let line = read_line();
        let start = Instant::now();
        let parts: Vec<i32> = line.split_whitespace().map(|x| x.parse().unwrap()).collect();
        let (opp_r, opp_c) = (parts[0], parts[1]);

        let n_valid: usize = read_line().parse().unwrap();
        let mut valid = Vec::with_capacity(n_valid);
        for _ in 0..n_valid {
            let l = read_line();
            let p: Vec<usize> = l.split_whitespace().map(|x| x.parse().unwrap()).collect();
            valid.push(p[0] * N + p[1]);
        }

        if n_valid >= 99 {
            board = Board::new();
            my_id = if n_valid == 100 { 1 } else { 2 };
            // Clear TT for new game
            unsafe { for i in 0..TT_SIZE { TT[i] = TTE { hash: 0, depth: 0, flag: 0, val: 0 }; } }
        }

        let opp_id = if my_id == 1 { 2u8 } else { 1u8 };
        let opp_pos = if opp_r >= 0 { Some(opp_r as usize * N + opp_c as usize) } else { None };
        if let Some(op) = opp_pos { board.place(op, opp_id); }

        // 1. Try to solve
        let solved = if board.empty <= 28 {
            try_solve(&mut board, &valid, my_id, start)
        } else {
            None
        };

        let chosen = if let Some(pos) = solved {
            pos
        } else if let Some(op) = opp_pos {
            // 2. Mirror
            let mp = mirror(op);
            if board.cells[mp] == 0 { mp } else { best_greedy(&board, &valid, my_id) }
        } else {
            // First move
            let centers = [4 * N + 5, 5 * N + 4, 4 * N + 4, 5 * N + 5];
            centers.iter().find(|&&p| board.cells[p] == 0).copied().unwrap_or(valid[0])
        };

        board.place(chosen, my_id);
        println!("{} {}", chosen / N, chosen % N);
    }
}
