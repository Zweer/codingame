use std::io;
use std::time::Instant;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

type BB = u64;

#[inline] fn bit(x: usize, y: usize) -> BB { 1u64 << (y * 8 + x) }

// Move: from (x1,y1) to (x2,y2) — pack into u16
#[inline] fn pack(x1: usize, y1: usize, x2: usize, y2: usize) -> u16 {
    ((y1 as u16) << 9) | ((x1 as u16) << 6) | ((y2 as u16) << 3) | x2 as u16
}
#[inline] fn unpack(m: u16) -> (usize, usize, usize, usize) {
    (((m >> 6) & 7) as usize, ((m >> 9) & 7) as usize, (m & 7) as usize, ((m >> 3) & 7) as usize)
}

fn move_str(m: u16) -> String {
    let (x1, y1, x2, y2) = unpack(m);
    format!("{}{}{}{}", (b'a' + x1 as u8) as char, y1 + 1, (b'a' + x2 as u8) as char, y2 + 1)
}

fn parse_action(s: &str) -> u16 {
    let b = s.as_bytes();
    let x1 = (b[0] - b'a') as usize;
    let y1 = (b[1] - b'0') as usize - 1;
    let x2 = (b[2] - b'a') as usize;
    let y2 = (b[3] - b'0') as usize - 1;
    pack(x1, y1, x2, y2)
}

// --- Zobrist ---
static mut ZW: [u64; 64] = [0; 64];
static mut ZB: [u64; 64] = [0; 64];
static mut ZS: u64 = 0;

fn init_zobrist() {
    let mut rng: u64 = 0xCAFEBABEDEADBEEF;
    let mut next = || -> u64 { rng ^= rng << 13; rng ^= rng >> 7; rng ^= rng << 17; rng };
    unsafe { for i in 0..64 { ZW[i] = next(); ZB[i] = next(); } ZS = next(); }
}

// --- TT ---
const TT_BITS: usize = 20;
const TT_SIZE: usize = 1 << TT_BITS;
const TT_MASK: usize = TT_SIZE - 1;
const EXACT: u8 = 0;
const LOWER: u8 = 1;
const UPPER: u8 = 2;

#[derive(Clone, Copy)]
struct TTE { key: u32, depth: u8, flag: u8, score: i16, best: u16 }
static mut TT: [TTE; TT_SIZE] = [TTE { key: 0, depth: 0, flag: 0, score: 0, best: 0 }; TT_SIZE];

fn tt_probe(hash: u64, depth: usize, alpha: i32, beta: i32) -> (Option<i32>, u16) {
    unsafe {
        let e = &TT[hash as usize & TT_MASK];
        let key = (hash >> TT_BITS) as u32;
        if e.key == key {
            let bm = e.best;
            if e.depth as usize >= depth {
                let s = e.score as i32;
                match e.flag {
                    EXACT => return (Some(s), bm),
                    LOWER => if s >= beta { return (Some(s), bm); },
                    UPPER => if s <= alpha { return (Some(s), bm); },
                    _ => {}
                }
            }
            return (None, bm);
        }
        (None, 0)
    }
}

fn tt_store(hash: u64, depth: usize, flag: u8, score: i32, best: u16) {
    unsafe {
        let idx = hash as usize & TT_MASK;
        let key = (hash >> TT_BITS) as u32;
        if depth as u8 >= TT[idx].depth || TT[idx].key != key {
            TT[idx] = TTE { key, depth: depth as u8, flag, score: score as i16, best };
        }
    }
}

// --- History table ---
static mut HIST: [[i32; 64]; 64] = [[0; 64]; 64];

// --- State ---
#[derive(Clone, Copy)]
struct State { white: BB, black: BB, white_turn: bool, hash: u64 }

const DIRS: [(i32, i32); 4] = [(0, -1), (1, 0), (0, 1), (-1, 0)]; // N E S W

impl State {
    fn me(&self) -> BB { if self.white_turn { self.white } else { self.black } }
    fn opp(&self) -> BB { if self.white_turn { self.black } else { self.white } }

    fn gen_moves(&self, buf: &mut Vec<u16>) {
        buf.clear();
        let me = self.me();
        let opp = self.opp();
        let mut pieces = me;
        while pieces != 0 {
            let idx = pieces.trailing_zeros() as usize;
            pieces &= pieces - 1;
            let x = idx % 8;
            let y = idx / 8;
            for &(dx, dy) in &DIRS {
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx < 0 || nx >= 8 || ny < 0 || ny >= 8 { continue; }
                if opp & bit(nx as usize, ny as usize) != 0 {
                    buf.push(pack(x, y, nx as usize, ny as usize));
                }
            }
        }
    }

    fn apply(&self, m: u16) -> State {
        let (x1, y1, x2, y2) = unpack(m);
        let from = bit(x1, y1);
        let to = bit(x2, y2);
        let fi = y1 * 8 + x1;
        let ti = y2 * 8 + x2;
        let mut s = *self;
        unsafe {
            let mut h = self.hash ^ ZS;
            if self.white_turn {
                h ^= ZW[fi] ^ ZW[ti]; // move white from->to
                h ^= ZB[ti];          // remove black at target
                s.white = (s.white & !from) | to;
                s.black &= !to;
            } else {
                h ^= ZB[fi] ^ ZB[ti];
                h ^= ZW[ti];
                s.black = (s.black & !from) | to;
                s.white &= !to;
            }
            s.hash = h;
        }
        s.white_turn = !s.white_turn;
        s
    }

    fn has_moves(&self) -> bool {
        let me = self.me();
        let opp = self.opp();
        let mut pieces = me;
        while pieces != 0 {
            let idx = pieces.trailing_zeros() as usize;
            pieces &= pieces - 1;
            let x = idx % 8;
            let y = idx / 8;
            for &(dx, dy) in &DIRS {
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && opp & bit(nx as usize, ny as usize) != 0 {
                    return true;
                }
            }
        }
        false
    }

    // Mobility-based eval: count moves for each side
    fn count_moves_for(&self, is_white: bool) -> i32 {
        let me = if is_white { self.white } else { self.black };
        let opp = if is_white { self.black } else { self.white };
        let mut count = 0i32;
        let mut pieces = me;
        while pieces != 0 {
            let idx = pieces.trailing_zeros() as usize;
            pieces &= pieces - 1;
            let x = idx % 8;
            let y = idx / 8;
            for &(dx, dy) in &DIRS {
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && opp & bit(nx as usize, ny as usize) != 0 {
                    count += 1;
                }
            }
        }
        count
    }

    fn eval(&self) -> i32 {
        let wm = self.count_moves_for(true);
        let bm = self.count_moves_for(false);

        if wm == 0 { return -(INF - 2); }
        if bm == 0 { return INF - 2; }

        // Mobility is king
        let mut score = (wm - bm) * 60;

        let wc = self.white.count_ones() as i32;
        let bc = self.black.count_ones() as i32;
        score += (wc - bc) * 5;

        // Per-piece: count adjacent enemies (more = more future moves)
        // and adjacent friends (connectivity)
        let mut w = self.white;
        while w != 0 {
            let idx = w.trailing_zeros() as usize;
            w &= w - 1;
            let x = idx % 8;
            let y = idx / 8;
            let mut adj_opp = 0i32;
            let mut adj_own = 0i32;
            for &(dx, dy) in &DIRS {
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx >= 0 && nx < 8 && ny >= 0 && ny < 8 {
                    let nb = bit(nx as usize, ny as usize);
                    if self.black & nb != 0 { adj_opp += 1; }
                    if self.white & nb != 0 { adj_own += 1; }
                }
            }
            score += adj_opp * 15 + adj_own * 3;
        }

        let mut b = self.black;
        while b != 0 {
            let idx = b.trailing_zeros() as usize;
            b &= b - 1;
            let x = idx % 8;
            let y = idx / 8;
            let mut adj_opp = 0i32;
            let mut adj_own = 0i32;
            for &(dx, dy) in &DIRS {
                let nx = x as i32 + dx;
                let ny = y as i32 + dy;
                if nx >= 0 && nx < 8 && ny >= 0 && ny < 8 {
                    let nb = bit(nx as usize, ny as usize);
                    if self.white & nb != 0 { adj_opp += 1; }
                    if self.black & nb != 0 { adj_own += 1; }
                }
            }
            score -= adj_opp * 15 + adj_own * 3;
        }

        score
    }
}

const INF: i32 = 30_000;

static mut KILLERS: [[u16; 2]; 32] = [[0; 2]; 32];
static mut NODES: u64 = 0;
static mut TIMED_OUT: bool = false;
static mut DEADLINE: Option<Instant> = None;

fn score_move(m: u16, state: &State, tt_move: u16, depth: usize) -> i32 {
    if m == tt_move && tt_move != 0 { return -1_000_000; }
    let (x1, y1, x2, y2) = unpack(m);
    let fi = y1 * 8 + x1;
    let ti = y2 * 8 + x2;
    let mut s = 0i32;
    unsafe {
        if m == KILLERS[depth][0] { s -= 50_000; }
        else if m == KILLERS[depth][1] { s -= 40_000; }
        s -= HIST[fi][ti];
    }
    s
}

fn ab(state: &State, depth: usize, mut alpha: i32, mut beta: i32, max: bool, mbuf: &mut [Vec<u16>; 32]) -> i32 {
    unsafe {
        NODES += 1;
        if NODES & 2047 == 0 { if let Some(d) = DEADLINE { if Instant::now() >= d { TIMED_OUT = true; return 0; } } }
        if TIMED_OUT { return 0; }
    }

    // Terminal check: current player can't move = loses
    if !state.has_moves() {
        return if state.white_turn { -(INF - 1) } else { INF - 1 };
    }
    if depth == 0 { return state.eval(); }

    let (tt_score, tt_move) = tt_probe(state.hash, depth, alpha, beta);
    if let Some(s) = tt_score { return s; }

    // Null move pruning
    if depth >= 3 {
        let null_state = State { white: state.white, black: state.black, white_turn: !state.white_turn, hash: state.hash ^ unsafe { ZS } };
        if null_state.has_moves() {
            let null_val = ab(&null_state, depth - 3, alpha, beta, !max, mbuf);
            if !unsafe { TIMED_OUT } {
                if max && null_val >= beta { return beta; }
                if !max && null_val <= alpha { return alpha; }
            }
        }
    }

    let mut moves = std::mem::take(&mut mbuf[depth]);
    state.gen_moves(&mut moves);
    if moves.is_empty() {
        mbuf[depth] = moves;
        return if max { -(INF - 1) } else { INF - 1 };
    }

    moves.sort_unstable_by_key(|&m| score_move(m, state, tt_move, depth));

    let mut best = if max { -INF } else { INF };
    let mut best_m = moves[0];
    let orig_alpha = alpha;

    for (i, &m) in moves.iter().enumerate() {
        let child = state.apply(m);
        let (x1, y1, x2, y2) = unpack(m);

        let red = if i >= 3 && depth >= 3 { 1 + (i >= 8) as usize } else { 0 };
        let mut val = ab(&child, depth - 1 - red, alpha, beta, !max, mbuf);

        if red > 0 && !unsafe { TIMED_OUT } {
            if (max && val > alpha) || (!max && val < beta) {
                val = ab(&child, depth - 1, alpha, beta, !max, mbuf);
            }
        }

        if unsafe { TIMED_OUT } { break; }

        if max {
            if val > best { best = val; best_m = m; }
            if best > alpha { alpha = best; }
            if alpha >= beta {
                unsafe { KILLERS[depth][1] = KILLERS[depth][0]; KILLERS[depth][0] = m; }
                unsafe { HIST[y1 * 8 + x1][y2 * 8 + x2] += (depth * depth) as i32; }
                break;
            }
        } else {
            if val < best { best = val; best_m = m; }
            if best < beta { beta = best; }
            if beta <= alpha {
                unsafe { KILLERS[depth][1] = KILLERS[depth][0]; KILLERS[depth][0] = m; }
                unsafe { HIST[y1 * 8 + x1][y2 * 8 + x2] += (depth * depth) as i32; }
                break;
            }
        }
    }

    mbuf[depth] = moves;

    if !unsafe { TIMED_OUT } {
        let flag = if best <= orig_alpha { UPPER } else if best >= beta { LOWER } else { EXACT };
        tt_store(state.hash, depth, flag, best, best_m);
    }
    best
}

fn find_best(state: &State, i_am_white: bool, deadline: Instant) -> u16 {
    let mut moves = Vec::with_capacity(64);
    state.gen_moves(&mut moves);
    if moves.len() == 1 { return moves[0]; }

    let max = i_am_white;
    let mut best_move = moves[0];
    let mut mbuf: [Vec<u16>; 32] = std::array::from_fn(|_| Vec::with_capacity(64));

    unsafe {
        DEADLINE = Some(deadline);
        for i in 0..64 { for j in 0..64 { HIST[i][j] >>= 2; } }
    }

    for depth in 1..=30usize {
        unsafe { TIMED_OUT = false; NODES = 0; }
        let mut best_val = if max { -INF } else { INF };
        let mut cur_best = moves[0];

        if let Some(pos) = moves.iter().position(|&m| m == best_move) { moves.swap(0, pos); }

        for &m in &moves {
            let child = state.apply(m);
            let val = ab(&child, depth - 1, -INF, INF, !max, &mut mbuf);
            if unsafe { TIMED_OUT } { break; }
            if max { if val > best_val { best_val = val; cur_best = m; } }
            else { if val < best_val { best_val = val; cur_best = m; } }
        }

        if !unsafe { TIMED_OUT } {
            best_move = cur_best;
            eprint!("d{depth}={best_val} ");
        }
        if unsafe { TIMED_OUT } || Instant::now() >= deadline { break; }
        if best_val.abs() >= INF - 10 { break; }
    }
    eprintln!();
    best_move
}

fn compute_hash(s: &State) -> u64 {
    let mut h = 0u64;
    let mut w = s.white;
    while w != 0 { let i = w.trailing_zeros() as usize; w &= w - 1; unsafe { h ^= ZW[i]; } }
    let mut b = s.black;
    while b != 0 { let i = b.trailing_zeros() as usize; b &= b - 1; unsafe { h ^= ZB[i]; } }
    if !s.white_turn { unsafe { h ^= ZS; } }
    h
}

fn main() {
    init_zobrist();

    let mut state = State { white: 0, black: 0, white_turn: true, hash: 0 };
    let mut i_am_white = true;
    let mut first_turn = true;
    let mut got_init = false;

    loop {
        // First turn only: read board size and color
        if !got_init {
            let _size: usize = read_line().parse().unwrap();
            let color = read_line();
            i_am_white = color == "w";
            got_init = true;
        }

        let start = Instant::now();

        // Read board (8 rows, top to bottom = y=7 down to y=0)
        state.white = 0;
        state.black = 0;
        for row in 0..8 {
            let line = read_line();
            let y = 7 - row; // first row printed = y=7
            for (x, ch) in line.chars().enumerate() {
                match ch {
                    'w' => state.white |= bit(x, y),
                    'b' => state.black |= bit(x, y),
                    _ => {}
                }
            }
        }
        state.white_turn = i_am_white; // it's always our turn when we receive input
        state.hash = compute_hash(&state);

        let _last_action = read_line(); // last action
        let n: usize = read_line().parse().unwrap(); // number of legal moves

        let budget: u64 = if first_turn { 900 } else { 140 };
        first_turn = false;
        let deadline = start + std::time::Duration::from_millis(budget);

        let m = find_best(&state, i_am_white, deadline);
        println!("{}", move_str(m));
    }
}
