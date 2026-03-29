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
        if (hits) spots.push({ x, y, hits, selfTarget: targetIdx(x, y) });
    }
}

function popcount(n: number): number {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

spots.sort((a, b) => popcount(b.hits) - popcount(a.hits));

// Full simulation: place bombs in order, handle chains and timing
function simulate(placements: Spot[], maxRounds: number): { turn: number; x: number; y: number }[] | null {
    interface Bomb { x: number; y: number; hits: number; placeTurn: number; explodeTurn: number; exploded: boolean; }
    const bombs: Bomb[] = [];
    const remaining = [...placements];
    let destroyed = 0;

    for (let turn = 0; turn < maxRounds + 10; turn++) {
        // Place a bomb if possible
        for (let i = 0; i < remaining.length; i++) {
            const s = remaining[i];
            if (s.selfTarget < 0 || ((destroyed >> s.selfTarget) & 1)) {
                bombs.push({ x: s.x, y: s.y, hits: s.hits, placeTurn: turn, explodeTurn: turn + 3, exploded: false });
                remaining.splice(i, 1);
                break;
            }
        }

        // Explode with chains
        let changed = true;
        while (changed) {
            changed = false;
            for (const b of bombs) {
                if (!b.exploded && b.explodeTurn <= turn) {
                    b.exploded = true;
                    destroyed |= b.hits;
                    changed = true;
                    for (const o of bombs) {
                        if (!o.exploded && blastReaches(b.x, b.y, o.x, o.y)) {
                            o.explodeTurn = turn;
                        }
                    }
                }
            }
        }

        if (destroyed === allMask && remaining.length === 0) {
            return bombs.map(b => ({ turn: b.placeTurn, x: b.x, y: b.y }));
        }
        if (remaining.length === 0 && bombs.every(b => b.exploded)) break;
    }

    return destroyed === allMask && remaining.length === 0
        ? bombs.map(b => ({ turn: b.placeTurn, x: b.x, y: b.y }))
        : null;
}

// DFS: no selfTarget filtering — let simulate() handle feasibility
let bestSchedule: { turn: number; x: number; y: number }[] | null = null;
const startTime = Date.now();

function dfs(directCover: number, maxBombs: number, chosen: Spot[], maxRounds: number): boolean {
    if (Date.now() - startTime > 800) return false; // timeout safety

    if (chosen.length > 0 && chosen.length <= maxBombs) {
        // Check if simulation succeeds (handles chains + timing)
        const result = simulate(chosen, maxRounds);
        if (result) {
            bestSchedule = result;
            return true;
        }
    }

    if (chosen.length >= maxBombs) return false;

    // Guide DFS: pick first uncovered target (by direct hits)
    const uncovered = allMask & ~directCover;
    if (uncovered === 0) return false; // all covered directly but simulate failed
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;
        chosen.push(s);
        if (dfs(directCover | s.hits, maxBombs, chosen, maxRounds)) return true;
        chosen.pop();
    }
    return false;
}

const [rounds, bombs] = readline().split(' ').map(Number);
console.error(`Rounds: ${rounds}, Bombs: ${bombs}`);

for (let b = 1; b <= bombs; b++) {
    if (dfs(0, b, [], rounds)) break;
}

if (!bestSchedule) {
    console.error('No solution found!');
    bestSchedule = [];
}

console.error(`Schedule: ${bestSchedule.length} bombs`);
for (const s of bestSchedule) console.error(`  turn ${s.turn}: (${s.x},${s.y})`);

let gameTurn = 0;
const scheduleMap = new Map<number, { x: number; y: number }>();
for (const s of bestSchedule) scheduleMap.set(s.turn, { x: s.x, y: s.y });

while (true) {
    if (gameTurn > 0) readline();
    const action = scheduleMap.get(gameTurn);
    console.log(action ? `${action.x} ${action.y}` : 'WAIT');
    gameTurn++;
}
