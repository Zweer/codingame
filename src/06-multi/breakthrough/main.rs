use std::io;
use std::time::Instant;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

type BB = u64;

#[inline] fn bit(r: usize, c: usize) -> BB { 1u64 << (r * 8 + c) }

fn parse_move(s: &str) -> u16 {
    let b = s.as_bytes();
    pack(8 - (b[1] - b'0') as usize, (b[0] - b'a') as usize,
         8 - (b[3] - b'0') as usize, (b[2] - b'a') as usize)
}

fn move_str(m: u16) -> String {
    let (fr, fc, tr, tc) = unpack(m);
    format!("{}{}{}{}", (b'a' + fc as u8) as char, 8 - fr, (b'a' + tc as u8) as char, 8 - tr)
}

#[inline] fn pack(fr: usize, fc: usize, tr: usize, tc: usize) -> u16 {
    ((fr as u16) << 9) | ((fc as u16) << 6) | ((tr as u16) << 3) | tc as u16
}
#[inline] fn unpack(m: u16) -> (usize, usize, usize, usize) {
    (((m >> 9) & 7) as usize, ((m >> 6) & 7) as usize, ((m >> 3) & 7) as usize, (m & 7) as usize)
}

// --- Zobrist ---
static mut ZW: [u64; 64] = [0; 64];
static mut ZB: [u64; 64] = [0; 64];
static mut ZS: u64 = 0;

fn init_zobrist() {
    let mut rng: u64 = 0x12345678DEADBEEF;
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

// --- History table for move ordering ---
static mut HIST: [[i32; 64]; 64] = [[0; 64]; 64];

// --- State ---
#[derive(Clone, Copy)]
struct State { white: BB, black: BB, white_turn: bool, hash: u64 }

const ROW1: BB = 0xFF;

impl State {
    #[inline] fn me(&self) -> BB { if self.white_turn { self.white } else { self.black } }
    #[inline] fn opp(&self) -> BB { if self.white_turn { self.black } else { self.white } }

    fn gen_moves(&self, buf: &mut Vec<u16>) {
        buf.clear();
        let all = self.white | self.black;
        let (pieces, own, fwd): (BB, BB, i32) = if self.white_turn {
            (self.white, self.white, -1)
        } else {
            (self.black, self.black, 1)
        };
        let mut p = pieces;
        while p != 0 {
            let idx = p.trailing_zeros() as usize;
            p &= p - 1;
            let r = idx / 8;
            let c = idx % 8;
            let nr = (r as i32 + fwd) as usize;
            if nr > 7 { continue; }
            if all & bit(nr, c) == 0 { buf.push(pack(r, c, nr, c)); }
            if c > 0 && own & bit(nr, c - 1) == 0 { buf.push(pack(r, c, nr, c - 1)); }
            if c < 7 && own & bit(nr, c + 1) == 0 { buf.push(pack(r, c, nr, c + 1)); }
        }
    }

    fn apply(&self, m: u16) -> State {
        let (fr, fc, tr, tc) = unpack(m);
        let fb = bit(fr, fc);
        let tb = bit(tr, tc);
        let fi = fr * 8 + fc;
        let ti = tr * 8 + tc;
        let mut s = *self;
        unsafe {
            let mut h = self.hash ^ ZS;
            if self.white_turn {
                h ^= ZW[fi] ^ ZW[ti];
                s.white = (s.white | tb) & !fb;
                if s.black & tb != 0 { h ^= ZB[ti]; s.black &= !tb; }
            } else {
                h ^= ZB[fi] ^ ZB[ti];
                s.black = (s.black | tb) & !fb;
                if s.white & tb != 0 { h ^= ZW[ti]; s.white &= !tb; }
            }
            s.hash = h;
        }
        s.white_turn = !s.white_turn;
        s
    }

    fn winner(&self) -> Option<bool> {
        if self.white & 0xFF != 0 { return Some(true); }
        if self.black & (0xFFu64 << 56) != 0 { return Some(false); }
        if self.white == 0 { return Some(false); }
        if self.black == 0 { return Some(true); }
        None
    }

    // Distance to goal for the most advanced pawn (0 = already won)
    fn best_dist_white(&self) -> i32 {
        if self.white == 0 { return 99; }
        let mut w = self.white;
        let mut best = 99i32;
        while w != 0 {
            let idx = w.trailing_zeros() as usize;
            w &= w - 1;
            let r = idx / 8;
            let d = r as i32; // distance to row 0
            if d < best { best = d; }
        }
        best
    }

    fn best_dist_black(&self) -> i32 {
        if self.black == 0 { return 99; }
        let mut b = self.black;
        let mut best = 99i32;
        while b != 0 {
            let idx = b.trailing_zeros() as usize;
            b &= b - 1;
            let r = idx / 8;
            let d = 7 - r as i32; // distance to row 7
            if d < best { best = d; }
        }
        best
    }

    fn eval(&self) -> i32 {
        let wc = self.white.count_ones() as i32;
        let bc = self.black.count_ones() as i32;
        let mut score = (wc - bc) * 80;

        let center: [i32; 8] = [0, 1, 3, 4, 4, 3, 1, 0];
        // Advancement weights: exponential near goal
        let wadv: [i32; 8] = [0, 8, 16, 24, 35, 55, 90, 200];

        let mut w = self.white;
        while w != 0 {
            let idx = w.trailing_zeros() as usize;
            w &= w - 1;
            let r = idx / 8;
            let c = idx % 8;
            let adv = 7 - r;
            score += wadv[adv];
            score += center[c];

            // Protection
            let def_l = r < 7 && c > 0 && self.white & bit(r + 1, c - 1) != 0;
            let def_r = r < 7 && c < 7 && self.white & bit(r + 1, c + 1) != 0;
            if def_l || def_r { score += 8; }

            // Attacked and undefended
            let atk = r > 0 && ((c > 0 && self.black & bit(r - 1, c - 1) != 0) ||
                                (c < 7 && self.black & bit(r - 1, c + 1) != 0));
            if atk && !def_l && !def_r { score -= 15 + adv as i32 * 8; }
        }

        let mut b = self.black;
        while b != 0 {
            let idx = b.trailing_zeros() as usize;
            b &= b - 1;
            let r = idx / 8;
            let c = idx % 8;
            let adv = r;
            score -= wadv[adv];
            score -= center[c];

            let def_l = r > 0 && c > 0 && self.black & bit(r - 1, c - 1) != 0;
            let def_r = r > 0 && c < 7 && self.black & bit(r - 1, c + 1) != 0;
            if def_l || def_r { score -= 8; }

            let atk = r < 7 && ((c > 0 && self.white & bit(r + 1, c - 1) != 0) ||
                                (c < 7 && self.white & bit(r + 1, c + 1) != 0));
            if atk && !def_l && !def_r { score += 15 + adv as i32 * 8; }
        }

        // Racing bonus: if both sides have advanced pawns, tempo matters
        let wd = self.best_dist_white();
        let bd = self.best_dist_black();
        if wd <= 3 || bd <= 3 {
            let tempo = if self.white_turn { 0 } else { 1 }; // white moves first advantage
            let w_eff = wd - tempo;
            let b_eff = bd - (1 - tempo);
            if w_eff <= 0 { score += 5000; }
            else if b_eff <= 0 { score -= 5000; }
            else { score += (b_eff - w_eff) * 150; }
        }

        score
    }
}

const INF: i32 = 100_000;

static mut KILLERS: [[u16; 2]; 32] = [[0; 2]; 32];
static mut NODES: u64 = 0;
static mut TIMED_OUT: bool = false;
static mut DEADLINE: Option<Instant> = None;

fn score_move(m: u16, state: &State, tt_move: u16, depth: usize) -> i32 {
    if m == tt_move && tt_move != 0 { return -1_000_000; }
    let (fr, fc, tr, tc) = unpack(m);
    let fi = fr * 8 + fc;
    let ti = tr * 8 + tc;
    let mut s = 0i32;
    // Captures: MVV (value of captured piece by advancement)
    if state.opp() & bit(tr, tc) != 0 {
        let victim_adv = if state.white_turn { tr } else { 7 - tr };
        s -= 100_000 + victim_adv as i32 * 1000;
    }
    unsafe {
        if m == KILLERS[depth][0] { s -= 50_000; }
        else if m == KILLERS[depth][1] { s -= 40_000; }
        // History heuristic
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

    if let Some(ww) = state.winner() {
        return if ww { INF - 1 } else { -(INF - 1) };
    }
    if depth == 0 { return state.eval(); }

    let (tt_score, tt_move) = tt_probe(state.hash, depth, alpha, beta);
    if let Some(s) = tt_score { return s; }

    // Null move pruning: skip our turn, if opponent still can't beat beta, prune
    if depth >= 3 {
        let null_state = State { white: state.white, black: state.black, white_turn: !state.white_turn, hash: state.hash ^ unsafe { ZS } };
        let null_val = ab(&null_state, depth - 3, alpha, beta, !max, mbuf);
        if !unsafe { TIMED_OUT } {
            if max && null_val >= beta { return beta; }
            if !max && null_val <= alpha { return alpha; }
        }
    }

    let mut moves = std::mem::take(&mut mbuf[depth]);
    state.gen_moves(&mut moves);
    if moves.is_empty() { mbuf[depth] = moves; return if max { -(INF - 1) } else { INF - 1 }; }

    moves.sort_unstable_by_key(|&m| score_move(m, state, tt_move, depth));

    let mut best = if max { -INF } else { INF };
    let mut best_m = moves[0];
    let orig_alpha = alpha;

    for (i, &m) in moves.iter().enumerate() {
        let child = state.apply(m);
        let (fr, fc, tr, tc) = unpack(m);
        let is_capture = state.opp() & bit(tr, tc) != 0;

        // LMR: reduce late quiet moves
        let red = if i >= 3 && depth >= 3 && !is_capture { 1 + (i >= 8) as usize } else { 0 };
        let mut val = ab(&child, depth - 1 - red, alpha, beta, !max, mbuf);

        // Re-search if reduced move beats alpha/beta
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
                if !is_capture {
                    unsafe { KILLERS[depth][1] = KILLERS[depth][0]; KILLERS[depth][0] = m; }
                    unsafe { HIST[fr * 8 + fc][tr * 8 + tc] += (depth * depth) as i32; }
                }
                break;
            }
        } else {
            if val < best { best = val; best_m = m; }
            if best < beta { beta = best; }
            if beta <= alpha {
                if !is_capture {
                    unsafe { KILLERS[depth][1] = KILLERS[depth][0]; KILLERS[depth][0] = m; }
                    unsafe { HIST[fr * 8 + fc][tr * 8 + tc] += (depth * depth) as i32; }
                }
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
    let mut moves = Vec::with_capacity(48);
    state.gen_moves(&mut moves);
    if moves.len() == 1 { return moves[0]; }

    let max = i_am_white;
    let mut best_move = moves[0];
    let mut mbuf: [Vec<u16>; 32] = std::array::from_fn(|_| Vec::with_capacity(48));

    unsafe {
        DEADLINE = Some(deadline);
        // Age history table
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
    for c in 0..8 { state.black |= bit(0, c) | bit(1, c); state.white |= bit(6, c) | bit(7, c); }
    state.hash = compute_hash(&state);

    let mut i_am_white: Option<bool> = None;
    let mut first_turn = true;

    loop {
        let last_move = read_line();
        let start = Instant::now();
        let n: usize = read_line().parse().unwrap();
        for _ in 0..n { read_line(); }

        if i_am_white.is_none() { i_am_white = Some(last_move == "None"); }
        if last_move != "None" { state = state.apply(parse_move(&last_move)); }

        let budget: u64 = if first_turn { 900 } else { 90 };
        first_turn = false;
        let deadline = start + std::time::Duration::from_millis(budget);

        let m = find_best(&state, i_am_white.unwrap(), deadline);
        state = state.apply(m);
        println!("{}", move_str(m));
    }
}
