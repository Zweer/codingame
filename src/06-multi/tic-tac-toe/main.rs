use std::io;
use std::time::Instant;

const WIN_MASKS: [u16; 8] = [
    0b000_000_111, 0b000_111_000, 0b111_000_000,
    0b001_001_001, 0b010_010_010, 0b100_100_100,
    0b100_010_001, 0b001_010_100,
];

#[inline(always)]
fn has_win(mask: u16) -> bool {
    for &w in &WIN_MASKS {
        if mask & w == w { return true; }
    }
    false
}

// Board: cells[big][player], big[player], finished
#[derive(Clone, Copy)]
struct Board {
    cells: [[u16; 2]; 9],
    big: [u16; 2],
    finished: u16,
}

impl Board {
    fn new() -> Self { Board { cells: [[0; 2]; 9], big: [0; 2], finished: 0 } }

    #[inline(always)]
    fn play(&mut self, b: usize, s: usize, p: usize) {
        self.cells[b][p] |= 1 << s;
        if has_win(self.cells[b][p]) {
            self.big[p] |= 1 << b;
            self.finished |= 1 << b;
        } else if (self.cells[b][0] | self.cells[b][1]) == 0x1FF {
            self.finished |= 1 << b;
        }
    }

    #[inline(always)]
    fn winner(&self) -> i8 {
        if has_win(self.big[0]) { return 0; }
        if has_win(self.big[1]) { return 1; }
        if self.finished == 0x1FF { return 2; }
        -1
    }
}

#[derive(Clone, Copy)]
struct Mv(u8); // big*9+small

impl Mv {
    #[inline(always)] fn new(b: usize, s: usize) -> Self { Mv((b * 9 + s) as u8) }
    #[inline(always)] fn b(self) -> usize { (self.0 / 9) as usize }
    #[inline(always)] fn s(self) -> usize { (self.0 % 9) as usize }
    #[inline(always)] fn to_rc(self) -> (usize, usize) {
        let b = self.b(); let s = self.s();
        ((b/3)*3 + s/3, (b%3)*3 + s%3)
    }
    fn from_rc(r: usize, c: usize) -> Self { Mv::new((r/3)*3 + c/3, (r%3)*3 + c%3) }
}

// Flat move buffer — no allocation
struct MoveList { data: [Mv; 81], len: usize }

impl MoveList {
    fn new() -> Self { MoveList { data: [Mv(0); 81], len: 0 } }

    fn fill(&mut self, board: &Board, last: Option<Mv>) {
        self.len = 0;
        if let Some(lm) = last {
            let target = lm.s();
            if board.finished & (1 << target) == 0 {
                let occ = board.cells[target][0] | board.cells[target][1];
                let mut free = (!occ) & 0x1FF;
                while free != 0 {
                    let bit = free.trailing_zeros() as usize;
                    self.data[self.len] = Mv::new(target, bit);
                    self.len += 1;
                    free &= free - 1;
                }
                return;
            }
        }
        let mut open = (!board.finished) & 0x1FF;
        while open != 0 {
            let b = open.trailing_zeros() as usize;
            let occ = board.cells[b][0] | board.cells[b][1];
            let mut free = (!occ) & 0x1FF;
            while free != 0 {
                let bit = free.trailing_zeros() as usize;
                self.data[self.len] = Mv::new(b, bit);
                self.len += 1;
                free &= free - 1;
            }
            open &= open - 1;
        }
    }
}

// --- Evaluation ---
const BIG_W: [i32; 9] = [3,2,3,2,5,2,3,2,3];
const SMALL_W: [i32; 9] = [3,2,3,2,4,2,3,2,3];

#[inline]
fn eval_line(me: u16, opp: u16, w: u16) -> i32 {
    let m = me & w; let o = opp & w;
    if m != 0 && o != 0 { return 0; }
    let cm = m.count_ones() as i32;
    let co = o.count_ones() as i32;
    match cm { 3 => 100, 2 => 10, _ => match co { 3 => -100, 2 => -10, _ => cm - co } }
}

fn evaluate(board: &Board, me: usize) -> i32 {
    let opp = 1 - me;
    let gw = board.winner();
    if gw == me as i8 { return 100_000; }
    if gw == opp as i8 { return -100_000; }
    if gw == 2 { return 0; }

    let mut score: i32 = 0;
    for &w in &WIN_MASKS { score += eval_line(board.big[me], board.big[opp], w) * 50; }
    for b in 0..9 {
        if board.finished & (1 << b) != 0 {
            if board.big[me] & (1 << b) != 0 { score += BIG_W[b] * 40; }
            else if board.big[opp] & (1 << b) != 0 { score -= BIG_W[b] * 40; }
            continue;
        }
        let mut ss: i32 = 0;
        for &w in &WIN_MASKS { ss += eval_line(board.cells[b][me], board.cells[b][opp], w); }
        for s in 0..9 {
            if board.cells[b][me] & (1 << s) != 0 { ss += SMALL_W[s]; }
            if board.cells[b][opp] & (1 << s) != 0 { ss -= SMALL_W[s]; }
        }
        score += ss * BIG_W[b];
    }
    score
}

// --- Flat MCTS with arena allocator ---
// Node stored in flat array, children as index ranges
const MAX_NODES: usize = 500_000;

struct Node {
    mv: Mv,
    player: u8,
    visits: u32,
    value: f32,
    first_child: u32, // index into arena
    num_children: u16,
    expanded: bool,
}

struct Arena {
    nodes: Vec<Node>,
}

impl Arena {
    fn new() -> Self {
        let mut nodes = Vec::with_capacity(MAX_NODES);
        // pre-allocate to avoid realloc
        for _ in 0..MAX_NODES {
            nodes.push(Node {
                mv: Mv(0), player: 0, visits: 0, value: 0.0,
                first_child: 0, num_children: 0, expanded: false,
            });
        }
        Arena { nodes }
    }

    fn reset(&mut self) {
        // just reset count, we'll track via next_free
    }

    #[inline(always)]
    fn init_node(&mut self, idx: usize, mv: Mv, player: u8) {
        let n = &mut self.nodes[idx];
        n.mv = mv; n.player = player; n.visits = 0; n.value = 0.0;
        n.first_child = 0; n.num_children = 0; n.expanded = false;
    }
}

fn mcts(board: &Board, me: usize, last_move: Option<Mv>, time_ms: u64) -> Mv {
    let mut ml = MoveList::new();
    ml.fill(board, last_move);
    if ml.len == 1 { return ml.data[0]; }

    let opp = 1 - me;
    let mut arena = Arena::new();
    let mut next_free: usize = 0;

    // Root node
    let root = next_free; next_free += 1;
    arena.init_node(root, Mv(255), opp as u8);
    arena.nodes[root].expanded = true;

    // Expand root
    let fc = next_free;
    for i in 0..ml.len {
        arena.init_node(next_free, ml.data[i], me as u8);
        next_free += 1;
    }
    arena.nodes[root].first_child = fc as u32;
    arena.nodes[root].num_children = ml.len as u16;

    let start = Instant::now();
    let mut iter_count: u32 = 0;
    let mut ml2 = MoveList::new();

    // Path buffer for backprop
    let mut path = [0u32; 82];
    let mut path_len: usize;

    while start.elapsed().as_millis() < time_ms as u128 {
        if next_free >= MAX_NODES - 82 { break; }

        let saved = *board;
        let mut bd = saved;

        // SELECT
        path_len = 0;
        let mut cur = root;
        let mut cur_last_move = last_move;

        loop {
            let nc = arena.nodes[cur].num_children as usize;
            if nc == 0 || !arena.nodes[cur].expanded { break; }

            // UCB1 inline
            let pv = (arena.nodes[cur].visits as f32).ln();
            let fc = arena.nodes[cur].first_child as usize;
            let mut best_i = fc;
            let mut best_v = f32::NEG_INFINITY;
            for i in fc..fc+nc {
                let n = &arena.nodes[i];
                let v = if n.visits == 0 { f32::INFINITY }
                        else { n.value / n.visits as f32 + 1.41 * (pv / n.visits as f32).sqrt() };
                if v > best_v { best_v = v; best_i = i; }
            }

            let child = best_i;
            let m = arena.nodes[child].mv;
            let p = arena.nodes[child].player as usize;
            bd.play(m.b(), m.s(), p);
            cur_last_move = Some(m);
            path[path_len] = child as u32;
            path_len += 1;
            cur = child;
        }

        let leaf = cur;
        let gw = bd.winner();
        let result: f32;

        if gw >= 0 {
            result = if gw == me as i8 { 1.0 } else if gw == opp as i8 { 0.0 } else { 0.5 };
        } else if !arena.nodes[leaf].expanded {
            arena.nodes[leaf].expanded = true;
            let next_p = if arena.nodes[leaf].player as usize == me { opp } else { me };
            ml2.fill(&bd, cur_last_move);

            if ml2.len > 0 && next_free + ml2.len < MAX_NODES {
                let fc = next_free;
                for i in 0..ml2.len {
                    arena.init_node(next_free, ml2.data[i], next_p as u8);
                    next_free += 1;
                }
                arena.nodes[leaf].first_child = fc as u32;
                arena.nodes[leaf].num_children = ml2.len as u16;
            }

            let ev = evaluate(&bd, me);
            result = 1.0 / (1.0 + (-ev as f32 / 200.0).exp());
        } else {
            result = 0.5;
        }

        // BACKPROP
        arena.nodes[root].visits += 1;
        arena.nodes[root].value += if arena.nodes[root].player as usize == me { result } else { 1.0 - result };
        for i in 0..path_len {
            let idx = path[i] as usize;
            arena.nodes[idx].visits += 1;
            arena.nodes[idx].value += if arena.nodes[idx].player as usize == me { result } else { 1.0 - result };
        }

        iter_count += 1;
    }

    eprintln!("MCTS: {} iters, {} nodes", iter_count, next_free);

    // Pick most visited
    let fc = arena.nodes[root].first_child as usize;
    let nc = arena.nodes[root].num_children as usize;
    let mut best_v = 0u32;
    let mut best_m = arena.nodes[fc].mv;
    for i in fc..fc+nc {
        if arena.nodes[i].visits > best_v {
            best_v = arena.nodes[i].visits;
            best_m = arena.nodes[i].mv;
        }
    }
    best_m
}

fn main() {
    let mut board = Board::new();
    let mut first_turn = true;
    let mut last_move: Option<Mv> = None;

    let mut input = String::new();
    loop {
        input.clear();
        io::stdin().read_line(&mut input).unwrap();
        let parts: Vec<i32> = input.trim().split_whitespace().map(|x| x.parse().unwrap()).collect();
        let (opp_r, opp_c) = (parts[0], parts[1]);

        input.clear();
        io::stdin().read_line(&mut input).unwrap();
        let n: usize = input.trim().parse().unwrap();
        for _ in 0..n {
            input.clear();
            io::stdin().read_line(&mut input).unwrap();
        }

        if opp_r >= 0 {
            let om = Mv::from_rc(opp_r as usize, opp_c as usize);
            board.play(om.b(), om.s(), 1); // opp = player 1
            last_move = Some(om);
        }

        let time_limit = if first_turn { 900 } else { 90 };
        let best = mcts(&board, 0, last_move, time_limit);
        board.play(best.b(), best.s(), 0);
        last_move = Some(best);

        let (r, c) = best.to_rc();
        println!("{} {}", r, c);
        first_turn = false;
    }
}
