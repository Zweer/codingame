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

// Debug: print grid
console.error(`Grid ${W}x${H}, ${targets.length} targets:`);
for (let y = 0; y < H; y++) console.error(`  ${grid[y].join('')}`);
for (let i = 0; i < targets.length; i++) console.error(`  T${i}: (${targets[i][0]},${targets[i][1]})`);

const NT = targets.length;
const allMask = (1 << NT) - 1;
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

function targetIdx(x: number, y: number): number {
    for (let i = 0; i < NT; i++) {
        if (targets[i][0] === x && targets[i][1] === y) return i;
    }
    return -1;
}

interface Spot { x: number; y: number; hits: number; selfTarget: number; }
const spots: Spot[] = [];

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        if (grid[y][x] === '#') continue;
        let hits = 0;
        for (const [dx, dy] of DIRS) {
            for (let i = 1; i <= 3; i++) {
                const nx = x + dx * i, ny = y + dy * i;
                if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
                if (grid[ny][nx] === '#') break;
                if (grid[ny][nx] === '@') {
                    const ti = targetIdx(nx, ny);
                    if (ti >= 0) hits |= 1 << ti;
                }
            }
        }
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

let solution: Spot[] | null = null;

function dfs(covered: number, maxBombs: number, chosen: Spot[]): boolean {
    if (covered === allMask) {
        solution = [...chosen];
        return true;
    }
    if (chosen.length >= maxBombs) return false;

    const uncovered = allMask & ~covered;
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;
        if (s.selfTarget >= 0 && !((covered >> s.selfTarget) & 1)) continue;

        chosen.push(s);
        if (dfs(covered | s.hits, maxBombs, chosen)) return true;
        chosen.pop();
    }
    return false;
}

const [rounds, bombs] = readline().split(' ').map(Number);
console.error(`Rounds: ${rounds}, Bombs: ${bombs}`);

for (let b = 1; b <= bombs; b++) {
    if (dfs(0, b, [])) break;
}

if (!solution) {
    console.error('No solution found!');
    solution = [];
}

// Order solution respecting timing: a bomb on a target cell needs that target
// destroyed first, and bombs take 3 turns to explode.
// We simulate turn-by-turn: track which targets are destroyed at which turn.
const schedule: { turn: number; spot: Spot }[] = [];
const pendingBombs: { spot: Spot; explodeTurn: number }[] = [];
const destroyedSet = new Set<number>();
const toPlace = [...solution!];
let t = 0;

while (toPlace.length > 0 || pendingBombs.length > 0) {
    // Explode bombs that are due
    const exploding = pendingBombs.filter(b => b.explodeTurn === t);
    for (const b of exploding) {
        for (let ti = 0; ti < NT; ti++) {
            if ((b.spot.hits >> ti) & 1) destroyedSet.add(ti);
        }
    }
    // Remove exploded bombs
    for (let i = pendingBombs.length - 1; i >= 0; i--) {
        if (pendingBombs[i].explodeTurn === t) pendingBombs.splice(i, 1);
    }

    // Try to place a bomb this turn
    let placed = false;
    for (let i = 0; i < toPlace.length; i++) {
        const s = toPlace[i];
        if (s.selfTarget < 0 || destroyedSet.has(s.selfTarget)) {
            schedule.push({ turn: t, spot: s });
            pendingBombs.push({ spot: s, explodeTurn: t + 3 });
            toPlace.splice(i, 1);
            placed = true;
            break;
        }
    }

    t++;
    // Safety: don't loop forever
    if (t > rounds + 10) break;
}

console.error(`Schedule: ${schedule.length} bombs over ${t} turns`);
for (const s of schedule) console.error(`  turn ${s.turn}: (${s.spot.x},${s.spot.y})`);

// Game loop
let gameTurn = 0;
const scheduleMap = new Map<number, Spot>();
for (const s of schedule) scheduleMap.set(s.turn, s.spot);

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
