use std::io;
use std::collections::HashMap;
use std::time::Instant;

const PLAYER_NUM: usize = 4;
const MAX_W: usize = 15;
const MAX_H: usize = 15;

#[derive(Clone)]
struct Bomb { x: usize, y: usize, owner: usize, remain_time: i32, range: i32 }

#[derive(Clone)]
struct Item { x: usize, y: usize, item_id: i32 }

#[derive(Clone, Default)]
struct Player { x: usize, y: usize, id: i32, remain_bombs: i32, range: i32, is_dead: bool }

#[derive(Clone)]
struct GameState {
    width: usize, height: usize, my_id: usize,
    delete_bomb: [[i32; MAX_W]; MAX_H],
    delete_item: [[i32; MAX_W]; MAX_H],
    bomb_owner: [[i32; MAX_W]; MAX_H],
    item_id: [[i32; MAX_W]; MAX_H],
    explode_area: [[i32; MAX_W]; MAX_H],
    bomb_range: [[i32; MAX_W]; MAX_H],
    bombs: Vec<Bomb>, items: Vec<Item>,
    board: [[u8; MAX_W]; MAX_H],
    p: [Player; PLAYER_NUM],
    boxes_destroyed: [i32; PLAYER_NUM],
    max_bombs: [i32; PLAYER_NUM],
}

impl GameState {
    fn new(w: usize, h: usize, my_id: usize) -> Self {
        Self {
            width: w, height: h, my_id,
            delete_bomb: [[-1; MAX_W]; MAX_H], delete_item: [[-1; MAX_W]; MAX_H],
            bomb_owner: [[-1; MAX_W]; MAX_H], item_id: [[-1; MAX_W]; MAX_H],
            explode_area: [[0; MAX_W]; MAX_H], bomb_range: [[-1; MAX_W]; MAX_H],
            bombs: Vec::new(), items: Vec::new(),
            board: [[b'.'; MAX_W]; MAX_H],
            p: std::array::from_fn(|_| Player { id: -1, is_dead: true, ..Default::default() }),
            boxes_destroyed: [0; PLAYER_NUM], max_bombs: [1; PLAYER_NUM],
        }
    }
}

fn explode(mut st: GameState, x: usize, y: usize, range: i32, owner: usize) -> GameState {
    let dy: [i32; 4] = [-1, 0, 0, 1];
    let dx: [i32; 4] = [0, -1, 1, 0];
    let mut queue = std::collections::VecDeque::new();
    for i in 0..4 {
        queue.push_back((y as i32, x as i32, i, owner, range - 1));
    }
    st.delete_bomb[y][x] = 114514;
    st.explode_area[y][x] = 1;
    let mut update_board = st.board;

    while let Some((by, bx, dir, bowner, brange)) = queue.pop_front() {
        let ny = by + dy[dir];
        let nx = bx + dx[dir];
        if ny >= 0 && (ny as usize) < st.height && nx >= 0 && (nx as usize) < st.width && brange >= 1 {
            let (uy, ux) = (ny as usize, nx as usize);
            let cell = st.board[uy][ux];
            if cell == b'.' {
                if st.bomb_owner[uy][ux] >= 0 {
                    if st.delete_bomb[uy][ux] != 114514 {
                        for i in 0..4 {
                            let r = if dir != i {
                                st.bomb_range[uy][ux] - 1
                            } else if brange > st.bomb_range[uy][ux] {
                                std::cmp::min(brange - 1, st.bomb_range[uy][ux] - 1)
                            } else {
                                std::cmp::max(brange - 1, st.bomb_range[uy][ux] - 1)
                            };
                            queue.push_back((ny, nx, i, st.bomb_owner[uy][ux] as usize, r));
                        }
                    } else {
                        queue.push_back((ny, nx, dir, bowner, brange - 1));
                    }
                    st.delete_bomb[uy][ux] = 114514;
                } else if st.item_id[uy][ux] >= 0 {
                    st.delete_item[uy][ux] = 114514;
                } else {
                    queue.push_back((ny, nx, dir, bowner, brange - 1));
                }
                st.explode_area[uy][ux] = 1;
            } else if cell == b'0' {
                st.boxes_destroyed[bowner] += 1;
                update_board[uy][ux] = b'.';
                st.explode_area[uy][ux] = 1;
            } else if cell == b'1' {
                st.boxes_destroyed[bowner] += 1;
                update_board[uy][ux] = b'.';
                st.item_id[uy][ux] = 1;
                st.delete_item[uy][ux] = -1;
                st.items.push(Item { x: ux, y: uy, item_id: 1 });
                st.explode_area[uy][ux] = 1;
            } else if cell == b'2' {
                st.boxes_destroyed[bowner] += 1;
                update_board[uy][ux] = b'.';
                st.item_id[uy][ux] = 2;
                st.delete_item[uy][ux] = -1;
                st.items.push(Item { x: ux, y: uy, item_id: 2 });
                st.explode_area[uy][ux] = 1;
            }
        }
    }
    st.board = update_board;
    st
}

fn countdown_and_explode(mut st: GameState) -> GameState {
    st.explode_area = [[0; MAX_W]; MAX_H];
    let bombs_snap: Vec<(usize, usize, i32, usize)> = st.bombs.iter().map(|b| (b.x, b.y, b.range, b.owner)).collect();
    for b in st.bombs.iter_mut() { b.remain_time -= 1; }
    for i in 0..st.bombs.len() {
        if st.bombs[i].remain_time == 0 {
            let (bx, by, br, bo) = bombs_snap[i];
            st = explode(st, bx, by, br, bo);
            for j in 0..PLAYER_NUM {
                if !st.p[j].is_dead && st.explode_area[st.p[j].y][st.p[j].x] == 1 {
                    st.p[j].is_dead = true;
                }
            }
        }
    }
    let del_bomb = st.delete_bomb;
    st.bombs.retain(|b| del_bomb[b.y][b.x] != 114514);
    // clear delete flags
    for y in 0..st.height {
        for x in 0..st.width {
            if st.delete_bomb[y][x] == 114514 {
                st.delete_bomb[y][x] = -1;
                st.bomb_owner[y][x] = -1;
                st.bomb_range[y][x] = -1;
            }
        }
    }
    let del_item = st.delete_item;
    st.items.retain(|it| del_item[it.y][it.x] != 114514);
    for y in 0..st.height {
        for x in 0..st.width {
            if st.delete_item[y][x] == 114514 {
                st.delete_item[y][x] = -1;
                st.item_id[y][x] = -1;
            }
        }
    }
    st
}

fn move_player(mut st: GameState, x: usize, y: usize, pid: usize) -> GameState {
    for i in 0..PLAYER_NUM {
        if st.p[i].id == pid as i32 && st.board[y][x] == b'.' && st.bomb_owner[y][x] < 0 {
            if st.item_id[y][x] == 1 {
                st.p[i].range += 1;
                st.delete_item[y][x] = 114514;
            } else if st.item_id[y][x] == 2 {
                st.p[i].remain_bombs += 1;
                st.max_bombs[i] += 1;
                st.delete_item[y][x] = 114514;
            }
            st.p[i].x = x;
            st.p[i].y = y;
            break;
        }
    }
    let del = st.delete_item;
    st.items.retain(|it| del[it.y][it.x] != 114514);
    for y in 0..st.height {
        for x in 0..st.width {
            if st.delete_item[y][x] == 114514 {
                st.delete_item[y][x] = -1;
                st.item_id[y][x] = -1;
            }
        }
    }
    st
}

fn set_bombs(mut st: GameState, x: usize, y: usize, pid: usize) -> GameState {
    if st.p[pid].remain_bombs > 0 {
        st.p[pid].remain_bombs -= 1;
        let px = st.p[pid].x;
        let py = st.p[pid].y;
        st.bomb_owner[py][px] = pid as i32;
        st.bomb_range[py][px] = st.p[pid].range;
        st.bombs.push(Bomb { x: px, y: py, owner: pid, remain_time: 8, range: st.p[pid].range });
    }
    move_player(st, x, y, pid)
}

fn eval_score(st: &GameState, player: usize) -> i32 {
    let mut score: i32 = 0;
    for i in 0..PLAYER_NUM {
        if st.p[i].id == player as i32 && st.p[i].is_dead { return -1_000_000; }
        else if st.p[i].is_dead && st.p[i].id >= 0 { score += 1000; }
    }
    for i in 0..PLAYER_NUM {
        if st.p[i].id == player as i32 {
            score += st.max_bombs[i] * 100 + st.p[i].range * 100;
        } else if !st.p[i].is_dead && st.p[i].id >= 0 {
            score -= st.max_bombs[i] * 100 + st.p[i].range * 100 + st.boxes_destroyed[i] * 1000;
        }
    }
    // Reachability flood
    let mut canmove = [[0u8; MAX_W]; MAX_H];
    canmove[st.p[player].y][st.p[player].x] = 1;
    let mut sim = st.clone();
    for _ in 0..10 {
        sim = countdown_and_explode(sim);
        for i in 0..sim.height {
            for j in 0..sim.width {
                if sim.explode_area[i][j] == 1 { canmove[i][j] = 0; }
                if canmove[i][j] == 1 {
                    for &(di, dj) in &[(1i32,0i32),(-1,0),(0,1),(0,-1)] {
                        let ni = i as i32 + di;
                        let nj = j as i32 + dj;
                        if ni >= 0 && (ni as usize) < sim.height && nj >= 0 && (nj as usize) < sim.width {
                            let (ui, uj) = (ni as usize, nj as usize);
                            if sim.board[ui][uj] == b'.' && sim.bomb_owner[ui][uj] < 0 {
                                canmove[ui][uj] = 1;
                            }
                            if sim.explode_area[ui][uj] == 1 { canmove[ui][uj] = 0; }
                        }
                    }
                }
            }
        }
    }
    let mut add = 0i32;
    let mut box_dist = 100i32;
    let py = st.p[player].y as i32;
    let px = st.p[player].x as i32;
    for i in 0..st.height {
        for j in 0..st.width {
            let c = st.board[i][j];
            if c == b'0' || c == b'1' || c == b'2' {
                box_dist = box_dist.min((i as i32 - py).abs() + (j as i32 - px).abs());
            }
            if canmove[i][j] == 1 {
                for &(di, dj) in &[(-1i32,0),(1,0),(0,-1i32),(0,1)] {
                    let ni = i as i32 + di;
                    let nj = j as i32 + dj;
                    if ni >= 0 && (ni as usize) < st.height && nj >= 0 && (nj as usize) < st.width {
                        let c2 = st.board[ni as usize][nj as usize];
                        if c2 == b'0' || c2 == b'1' || c2 == b'2' { score += 1; }
                    }
                }
                add += 100;
            }
        }
    }
    score -= box_dist;
    score += st.boxes_destroyed[st.my_id] * 1000;
    if add == 0 { -1_000_000 } else { score + add }
}

fn mc(state: &GameState, time_limit_ms: u64, start: Instant) -> (String, i32) {
    let depth_max = 6;
    let dxs: [i32; 5] = [-1, 0, 0, 0, 1];
    let dys: [i32; 5] = [0, -1, 0, 1, 0];
    let mut best_cmd = String::new();
    let mut best_score = i32::MIN;
    let mut rng: u32 = 88675123;
    let mut checked: HashMap<i64, bool> = HashMap::new();
    let mut pow10 = [0i64; 10];
    pow10[0] = 1;
    for i in 1..=8 { pow10[i] = 10 * pow10[i - 1]; }

    loop {
        if start.elapsed().as_millis() as u64 >= time_limit_ms { break; }
        let mut st = state.clone();
        let mut actions = vec![String::new(); depth_max];
        let mut hash: i64 = 0;
        let mut broke = false;

        for depth in 0..depth_max {
            st = countdown_and_explode(st);
            let mut found = false;
            let mut tried = [[false; 5]; 2];
            let mut cnt = 0;
            let (mut set, mut dir, mut nx, mut ny) = (0, 0, 0usize, 0usize);

            loop {
                rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
                set = (rng % 2) as usize;
                rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
                dir = (rng % 5) as usize;
                let tnx = st.p[st.my_id].x as i32 + dxs[dir];
                let tny = st.p[st.my_id].y as i32 + dys[dir];
                if tny >= 0 && (tny as usize) < st.height && tnx >= 0 && (tnx as usize) < st.width {
                    let (uy, ux) = (tny as usize, tnx as usize);
                    if st.board[uy][ux] == b'.' && st.bomb_owner[uy][ux] < 0 {
                        if set == 0 || st.p[st.my_id].remain_bombs > 0 {
                            nx = ux; ny = uy; found = true; break;
                        }
                    }
                }
                if !tried[set][dir] { tried[set][dir] = true; cnt += 1; }
                if cnt == 10 { break; }
            }
            if !found { broke = true; break; }

            hash += ((set * 5 + dir) as i64) * pow10[depth];
            if set == 0 {
                st = move_player(st, nx, ny, st.my_id);
                actions[depth] = format!("MOVE {} {}", nx, ny);
            } else {
                st = set_bombs(st, nx, ny, st.my_id);
                actions[depth] = format!("BOMB {} {}", nx, ny);
            }
        }

        if !checked.contains_key(&hash) {
            let e = eval_score(&st, st.my_id);
            if e > best_score {
                best_score = e;
                best_cmd = actions[0].clone();
            }
            checked.insert(hash, true);
        }
    }
    (best_cmd, best_score)
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let v: Vec<usize> = input.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
    let (width, height, my_id) = (v[0], v[1], v[2]);

    let mut turn = 0;
    loop {
        let mut state = GameState::new(width, height, my_id);
        for i in 0..height {
            let mut row = String::new();
            io::stdin().read_line(&mut row).unwrap();
            let row = row.trim();
            for (j, c) in row.bytes().enumerate() { state.board[i][j] = c; }
        }
        let mut ent_line = String::new();
        io::stdin().read_line(&mut ent_line).unwrap();
        let entities: usize = ent_line.trim().parse().unwrap();
        for _ in 0..entities {
            let mut line = String::new();
            io::stdin().read_line(&mut line).unwrap();
            let v: Vec<i32> = line.trim().split_whitespace().map(|s| s.parse().unwrap()).collect();
            let (et, owner, x, y, p1, p2) = (v[0], v[1] as usize, v[2] as usize, v[3] as usize, v[4], v[5]);
            match et {
                0 => {
                    state.p[owner] = Player { x, y, id: owner as i32, remain_bombs: p1, range: p2, is_dead: false };
                }
                1 => {
                    state.bomb_range[y][x] = p2;
                    state.bomb_owner[y][x] = owner as i32;
                    state.bombs.push(Bomb { x, y, owner, remain_time: p1, range: p2 });
                }
                2 => {
                    state.item_id[y][x] = p1;
                    state.items.push(Item { x, y, item_id: p1 });
                }
                _ => {}
            }
        }
        let start = Instant::now();
        let tl = if turn == 0 { 900 } else { 90 };
        let (cmd, score) = mc(&state, tl, start);
        if cmd.is_empty() {
            println!("MOVE {} {}", state.p[my_id].x, state.p[my_id].y);
        } else {
            println!("{}", cmd);
        }
        eprintln!("score={} elapsed={}ms", score, start.elapsed().as_millis());
        turn += 1;
    }
}
