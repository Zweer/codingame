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

// Cells reachable by a bomb blast (for chain detection)
function blastReaches(bx: number, by: number, cx: number, cy: number): boolean {
    if (bx === cx && by === cy) return false;
    if (bx !== cx && by !== cy) return false;
    const dist = Math.abs(cx - bx) + Math.abs(cy - by);
    if (dist > 3) return false;
    const dx = Math.sign(cx - bx), dy = Math.sign(cy - by);
    for (let i = 1; i < dist; i++) {
        if (grid[by + dy * i][bx + dx * i] === '#') return false;
    }
    return true;
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

// Full simulation with chain reactions and proper timing
function simulate(placements: Spot[], maxRounds: number): { destroyed: number; schedule: { turn: number; x: number; y: number }[] } | null {
    interface Bomb { x: number; y: number; hits: number; placeTurn: number; explodeTurn: number; exploded: boolean; }
    const bombs: Bomb[] = [];
    const remaining = [...placements];
    let destroyed = 0;
    let turn = 0;

    while (turn < maxRounds + 10) {
        // Try to place a bomb this turn
        for (let i = 0; i < remaining.length; i++) {
            const s = remaining[i];
            // Can place if cell is empty or target already destroyed
            if (s.selfTarget < 0 || ((destroyed >> s.selfTarget) & 1)) {
                bombs.push({ x: s.x, y: s.y, hits: s.hits, placeTurn: turn, explodeTurn: turn + 3, exploded: false });
                remaining.splice(i, 1);
                break;
            }
        }

        // Process explosions (with chain reactions)
        let changed = true;
        while (changed) {
            changed = false;
            for (const b of bombs) {
                if (!b.exploded && b.explodeTurn <= turn) {
                    b.exploded = true;
                    destroyed |= b.hits;
                    changed = true;
                    // Chain: trigger other bombs in blast radius
                    for (const other of bombs) {
                        if (!other.exploded && blastReaches(b.x, b.y, other.x, other.y)) {
                            other.explodeTurn = turn; // explode now
                        }
                    }
                }
            }
        }

        if (destroyed === allMask && remaining.length === 0) {
            return {
                destroyed,
                schedule: bombs.map(b => ({ turn: b.placeTurn, x: b.x, y: b.y })),
            };
        }

        // If all bombs placed and exploded, no point continuing
        if (remaining.length === 0 && bombs.every(b => b.exploded)) break;

        turn++;
    }

    if (destroyed === allMask) {
        return {
            destroyed,
            schedule: bombs.map(b => ({ turn: b.placeTurn, x: b.x, y: b.y })),
        };
    }
    return null;
}

// DFS: pick spots, then simulate to verify
let bestSchedule: { turn: number; x: number; y: number }[] | null = null;

function dfs(maxBombs: number, chosen: Spot[], maxRounds: number): boolean {
    // Try simulation with current set (chains might complete coverage)
    if (chosen.length > 0) {
        const result = simulate(chosen, maxRounds);
        if (result && result.destroyed === allMask) {
            bestSchedule = result.schedule;
            return true;
        }
    }

    if (chosen.length >= maxBombs) return false;

    // Find first uncovered target (by direct hits of chosen spots, ignoring chains for DFS guidance)
    let directCover = 0;
    for (const c of chosen) directCover |= c.hits;
    if (directCover === allMask) return false; // all covered directly but simulate failed? shouldn't happen

    const uncovered = allMask & ~directCover;
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;

        // If spot is on a target, some other chosen bomb must be able to destroy it
        // (either directly via hits, or via chain — but for DFS pruning, check if any
        // chosen bomb's blast reaches this cell)
        if (s.selfTarget >= 0) {
            let canFree = false;
            for (const c of chosen) {
                if ((c.hits >> s.selfTarget) & 1) { canFree = true; break; }
                if (blastReaches(c.x, c.y, s.x, s.y)) { canFree = true; break; }
            }
            if (!canFree) continue;
        }

        chosen.push(s);
        if (dfs(maxBombs, chosen, maxRounds)) return true;
        chosen.pop();
    }
    return false;
}

const [rounds, bombs] = readline().split(' ').map(Number);
console.error(`Rounds: ${rounds}, Bombs: ${bombs}`);

for (let b = 1; b <= bombs; b++) {
    if (dfs(b, [], rounds)) break;
}

if (!bestSchedule) {
    console.error('No solution found!');
    bestSchedule = [];
}

console.error(`Schedule: ${bestSchedule.length} bombs`);
for (const s of bestSchedule) console.error(`  turn ${s.turn}: (${s.x},${s.y})`);

// Game loop
let gameTurn = 0;
const scheduleMap = new Map<number, { x: number; y: number }>();
for (const s of bestSchedule) scheduleMap.set(s.turn, { x: s.x, y: s.y });

while (true) {
    if (gameTurn > 0) readline();
    const action = scheduleMap.get(gameTurn);
    console.log(action ? `${action.x} ${action.y}` : 'WAIT');
    gameTurn++;
}
