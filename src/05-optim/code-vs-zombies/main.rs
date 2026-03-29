use std::io;
use std::time::Instant;

const MAP_W: f64 = 16000.0;
const MAP_H: f64 = 9000.0;
const ASH_SPEED: f64 = 1000.0;
const ZOMBIE_SPEED: f64 = 400.0;
const KILL_RANGE: f64 = 2000.0;
const KILL_RANGE_SQ: f64 = KILL_RANGE * KILL_RANGE;
const MAX_TURNS: usize = 300;
const SIM_BUDGET_MS: u128 = 95;

#[derive(Clone, Copy)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn dist_sq(self, other: Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        dx * dx + dy * dy
    }

    fn dist(self, other: Point) -> f64 {
        self.dist_sq(other).sqrt()
    }

    fn move_towards(self, target: Point, speed: f64) -> Point {
        let d = self.dist(target);
        if d <= speed {
            target
        } else {
            let ratio = speed / d;
            Point {
                x: self.x + (target.x - self.x) * ratio,
                y: self.y + (target.y - self.y) * ratio,
            }
        }
    }
}

#[derive(Clone)]
struct Human {
    id: i32,
    pos: Point,
    alive: bool,
}

#[derive(Clone)]
struct Zombie {
    id: i32,
    pos: Point,
    alive: bool,
}

#[derive(Clone)]
struct State {
    ash: Point,
    humans: Vec<Human>,
    zombies: Vec<Zombie>,
    score: i64,
}

// Precomputed fibonacci values (enough for up to 30 zombies killed in one turn)
const FIB: [i64; 31] = {
    let mut f = [0i64; 31];
    f[0] = 1;
    f[1] = 1;
    let mut i = 2;
    while i < 31 {
        f[i] = f[i - 1] + f[i - 2];
        i += 1;
    }
    f
};

impl State {
    fn alive_humans(&self) -> i64 {
        self.humans.iter().filter(|h| h.alive).count() as i64
    }

    fn alive_zombies(&self) -> usize {
        self.zombies.iter().filter(|z| z.alive).count()
    }

    fn game_over(&self) -> bool {
        self.alive_zombies() == 0 || self.alive_humans() == 0
    }

    // Simulate one turn with Ash moving towards `target`. Returns false if all humans died.
    fn step(&mut self, target: Point) -> bool {
        // 1. Zombies move towards nearest human (including Ash)
        for z in self.zombies.iter_mut().filter(|z| z.alive) {
            let mut best_dist = z.pos.dist_sq(self.ash);
            let mut best_pos = self.ash;
            for h in self.humans.iter().filter(|h| h.alive) {
                let d = z.pos.dist_sq(h.pos);
                if d < best_dist {
                    best_dist = d;
                    best_pos = h.pos;
                }
            }
            z.pos = z.pos.move_towards(best_pos, ZOMBIE_SPEED);
        }

        // 2. Ash moves
        self.ash = self.ash.move_towards(target, ASH_SPEED);

        // 3. Kill zombies in range
        let humans_alive = self.alive_humans();
        let base_points = humans_alive * humans_alive * 10;
        let mut combo = 0usize;
        for z in self.zombies.iter_mut().filter(|z| z.alive) {
            if self.ash.dist_sq(z.pos) <= KILL_RANGE_SQ {
                z.alive = false;
                self.score += base_points * FIB[combo.min(30)];
                combo += 1;
            }
        }

        // 4. Zombies eat humans
        for h in self.humans.iter_mut().filter(|h| h.alive) {
            for z in self.zombies.iter().filter(|z| z.alive) {
                if (z.pos.x - h.pos.x).abs() < 0.001 && (z.pos.y - h.pos.y).abs() < 0.001 {
                    h.alive = false;
                    break;
                }
            }
        }

        self.alive_humans() > 0 || self.alive_zombies() == 0
    }
}

// Simple xorshift RNG
struct Rng(u64);

impl Rng {
    fn next(&mut self) -> u64 {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 7;
        self.0 ^= self.0 << 17;
        self.0
    }

    fn next_f64(&mut self) -> f64 {
        (self.next() % 10000) as f64 / 10000.0
    }

    fn range(&mut self, lo: f64, hi: f64) -> f64 {
        lo + self.next_f64() * (hi - lo)
    }

    fn usize(&mut self, n: usize) -> usize {
        (self.next() % n as u64) as usize
    }
}

/// Generate a random strategy: a sequence of moves (points) for Ash.
/// Strategy: 0-3 random moves, then chase zombies in random order.
fn random_strategy(state: &State, rng: &mut Rng) -> Vec<Point> {
    let mut moves = Vec::with_capacity(MAX_TURNS);
    let random_count = rng.usize(4); // 0..3 random moves
    for _ in 0..random_count {
        moves.push(Point {
            x: rng.range(0.0, MAP_W),
            y: rng.range(0.0, MAP_H),
        });
    }
    // Then chase zombies in random order
    let alive: Vec<Point> = state.zombies.iter().filter(|z| z.alive).map(|z| z.pos).collect();
    if !alive.is_empty() {
        let mut order: Vec<usize> = (0..alive.len()).collect();
        // Fisher-Yates shuffle
        for i in (1..order.len()).rev() {
            let j = rng.usize(i + 1);
            order.swap(i, j);
        }
        for &idx in &order {
            moves.push(alive[idx]);
        }
    }
    moves
}

/// Simulate a full game with a given strategy. Returns the score.
fn simulate(initial: &State, strategy: &[Point]) -> i64 {
    let mut state = initial.clone();
    let mut move_idx = 0;
    for _ in 0..MAX_TURNS {
        if state.game_over() {
            break;
        }
        let target = if move_idx < strategy.len() {
            strategy[move_idx]
        } else if let Some(z) = state.zombies.iter().find(|z| z.alive) {
            z.pos
        } else {
            break;
        };

        // Advance move_idx if we're close enough to current target
        if move_idx < strategy.len() && state.ash.dist(target) <= ASH_SPEED {
            move_idx += 1;
        }

        if !state.step(target) {
            return -1; // All humans died
        }
    }
    if state.alive_humans() == 0 && state.alive_zombies() > 0 {
        return -1;
    }
    state.score
}

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let mut rng = Rng(123456789);
    let mut best_global_strategy: Option<Vec<Point>> = None;

    loop {
        let parts: Vec<f64> = read_line().split_whitespace().map(|s| s.parse().unwrap()).collect();
        let ash = Point { x: parts[0], y: parts[1] };

        let human_count: usize = read_line().parse().unwrap();
        let mut humans = Vec::with_capacity(human_count);
        for _ in 0..human_count {
            let p: Vec<f64> = read_line().split_whitespace().map(|s| s.parse().unwrap()).collect();
            humans.push(Human { id: p[0] as i32, pos: Point { x: p[1], y: p[2] }, alive: true });
        }

        let zombie_count: usize = read_line().parse().unwrap();
        let mut zombies = Vec::with_capacity(zombie_count);
        for _ in 0..zombie_count {
            let p: Vec<f64> = read_line().split_whitespace().map(|s| s.parse().unwrap()).collect();
            zombies.push(Zombie { id: p[0] as i32, pos: Point { x: p[1], y: p[2] }, alive: true });
            // p[3], p[4] are next position — we don't need them since we simulate
        }

        let state = State { ash, humans, zombies, score: 0 };

        let start = Instant::now();
        let mut best_score: i64 = -1;
        let mut best_first_move = Point { x: 0.0, y: 0.0 };
        let mut iterations = 0u64;

        // If we have a previous global strategy, try continuing it (shifted by 1)
        if let Some(ref strat) = best_global_strategy {
            if strat.len() > 1 {
                let shifted: Vec<Point> = strat[1..].to_vec();
                let s = simulate(&state, &shifted);
                if s > best_score {
                    best_score = s;
                    best_first_move = shifted.first().copied().unwrap_or(state.ash);
                    best_global_strategy = Some(shifted);
                }
            }
        }

        while start.elapsed().as_millis() < SIM_BUDGET_MS {
            let strategy = random_strategy(&state, &mut rng);
            let s = simulate(&state, &strategy);
            if s > best_score {
                best_score = s;
                best_first_move = strategy.first().copied().unwrap_or(state.ash);
                best_global_strategy = Some(strategy);
            }
            iterations += 1;
        }

        eprintln!("Iterations: {} | Best score: {}", iterations, best_score);
        println!("{} {}", best_first_move.x as i32, best_first_move.y as i32);
    }
}
