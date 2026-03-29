declare function readline(): string;

const [W, H] = readline().split(' ').map(Number);
const grid: string[][] = [];
const targets: [number, number][] = [];

for (let y = 0; y < H; y++) {
    grid.push(readline().split(''));
    for (let x = 0; x < W; x++) {
        if (grid[y][x] === '@') targets.push([x, y]);
    }
}

console.error(`Grid ${W}x${H}, ${targets.length} targets:`);
for (let y = 0; y < H; y++) console.error(`  ${grid[y].join('')}`);

const NT = targets.length;
const allMask = (1 << NT) - 1;
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

function targetIdx(x: number, y: number): number {
    for (let i = 0; i < NT; i++) {
        if (targets[i][0] === x && targets[i][1] === y) return i;
    }
    return -1;
}

// For each non-wall cell, which targets a bomb there hits directly
function computeHits(x: number, y: number): number {
    let hits = 0;
    for (const [dx, dy] of DIRS) {
        for (let i = 1; i <= 3; i++) {
            const nx = x + dx * i, ny = y + dy * i;
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
            if (grid[ny][nx] === '#') break;
            const ti = targetIdx(nx, ny);
            if (ti >= 0) hits |= 1 << ti;
        }
    }
    return hits;
}

interface Spot { x: number; y: number; hits: number; selfTarget: number; }
const spots: Spot[] = [];

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        if (grid[y][x] === '#') continue;
        const hits = computeHits(x, y);
        const self = targetIdx(x, y);
        if (hits) spots.push({ x, y, hits, selfTarget: self });
    }
}

function popcount(n: number): number {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

spots.sort((a, b) => popcount(b.hits) - popcount(a.hits));

// Check if bomb at (bx,by) reaches cell (cx,cy) — for chain detection
function bombReaches(bx: number, by: number, cx: number, cy: number): boolean {
    if (bx === cx && by === cy) return false;
    if (bx !== cx && by !== cy) return false;
    const dx = Math.sign(cx - bx), dy = Math.sign(cy - by);
    const dist = Math.abs(cx - bx) + Math.abs(cy - by);
    if (dist > 3) return false;
    // Check no wall in between
    for (let i = 1; i < dist; i++) {
        if (grid[by + dy * i][bx + dx * i] === '#') return false;
    }
    return true;
}

// Simulate a set of bomb placements with chain reactions
// Returns bitmask of destroyed targets, or -1 if placement is invalid
function simulate(placements: Spot[], maxRounds: number): { destroyed: number; schedule: { turn: number; spot: Spot }[] } | null {
    // We need to figure out the order: bombs on target cells need that target destroyed first
    // Also chain reactions: bomb A explodes and triggers bomb B if A's blast reaches B

    interface BombState { spot: Spot; placeTurn: number; explodeTurn: number; }
    const scheduled: BombState[] = [];
    const remaining = [...placements];
    const destroyedByTurn = new Map<number, number>(); // turn -> cumulative destroyed mask
    let destroyed = 0;
    let turn = 0;

    while (remaining.length > 0 && turn < maxRounds) {
        // Process explosions this turn
        let changed = true;
        while (changed) {
            changed = false;
            for (const b of scheduled) {
                if (b.explodeTurn === turn) {
                    const newDestroyed = b.spot.hits & ~destroyed;
                    if (newDestroyed) {
                        destroyed |= b.spot.hits;
                        changed = true;
                    }
                    // Chain: check if this bomb triggers other placed bombs
                    for (const other of scheduled) {
                        if (other.explodeTurn > turn && bombReaches(b.spot.x, b.spot.y, other.spot.x, other.spot.y)) {
                            if (other.explodeTurn !== turn) {
                                other.explodeTurn = turn;
                                changed = true;
                            }
                        }
                    }
                }
            }
        }

        // Try to place a bomb
        for (let i = 0; i < remaining.length; i++) {
            const s = remaining[i];
            if (s.selfTarget < 0 || ((destroyed >> s.selfTarget) & 1)) {
                scheduled.push({ spot: s, placeTurn: turn, explodeTurn: turn + 3 });
                remaining.splice(i, 1);
                break;
            }
        }

        turn++;
    }

    // Process remaining explosions
    while (turn < maxRounds + 5) {
        let changed = true;
        let anyExploded = false;
        while (changed) {
            changed = false;
            for (const b of scheduled) {
                if (b.explodeTurn === turn) {
                    destroyed |= b.spot.hits;
                    anyExploded = true;
                    for (const other of scheduled) {
                        if (other.explodeTurn > turn && bombReaches(b.spot.x, b.spot.y, other.spot.x, other.spot.y)) {
                            other.explodeTurn = turn;
                            changed = true;
                        }
                    }
                }
            }
        }
        if (!anyExploded && scheduled.every(b => b.explodeTurn <= turn)) break;
        turn++;
    }

    if (remaining.length > 0) return null;

    const schedule = scheduled.map(b => ({ turn: b.placeTurn, spot: b.spot }));
    return { destroyed, schedule };
}

// DFS: find bomb placements
let bestSolution: { turn: number; spot: Spot }[] | null = null;

function dfs(covered: number, maxBombs: number, chosen: Spot[], maxRounds: number): boolean {
    if (covered === allMask) {
        // Verify with simulation
        const result = simulate(chosen, maxRounds);
        if (result && result.destroyed === allMask) {
            bestSolution = result.schedule;
            return true;
        }
        return false;
    }
    if (chosen.length >= maxBombs) {
        // Check if chain reactions help
        const result = simulate(chosen, maxRounds);
        if (result && result.destroyed === allMask) {
            bestSolution = result.schedule;
            return true;
        }
        return false;
    }

    const uncovered = allMask & ~covered;
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;
        // Skip if on a target that isn't covered by chosen bombs yet
        // (but allow it — simulation will handle ordering)
        if (s.selfTarget >= 0 && !((covered >> s.selfTarget) & 1)) {
            // Check if any already-chosen bomb covers this target
            let coveredByChosen = false;
            for (const c of chosen) {
                if ((c.hits >> s.selfTarget) & 1) { coveredByChosen = true; break; }
            }
            if (!coveredByChosen) continue;
        }

        chosen.push(s);
        if (dfs(covered | s.hits, maxBombs, chosen, maxRounds)) return true;
        chosen.pop();
    }
    return false;
}

const [rounds, bombs] = readline().split(' ').map(Number);
console.error(`Rounds: ${rounds}, Bombs: ${bombs}`);

for (let b = 1; b <= bombs; b++) {
    if (dfs(0, b, [], rounds)) break;
}

if (!bestSolution) {
    console.error('No solution found!');
    bestSolution = [];
}

console.error(`Schedule: ${bestSolution.length} bombs`);
for (const s of bestSolution) console.error(`  turn ${s.turn}: (${s.spot.x},${s.spot.y})`);

// Game loop
let gameTurn = 0;
const scheduleMap = new Map<number, Spot>();
for (const s of bestSolution) scheduleMap.set(s.turn, s.spot);

while (true) {
    if (gameTurn > 0) readline();
    const action = scheduleMap.get(gameTurn);
    if (action) {
        console.log(`${action.x} ${action.y}`);
    } else {
        console.log('WAIT');
    }
    gameTurn++;
}
