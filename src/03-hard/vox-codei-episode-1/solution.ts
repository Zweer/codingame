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

const NT = targets.length;
const allMask = (1 << NT) - 1;
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

// For each empty cell, compute bitmask of targets it can destroy
interface Spot { x: number; y: number; hits: number; }
const spots: Spot[] = [];

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        if (grid[y][x] !== '.') continue;
        let hits = 0;
        for (const [dx, dy] of DIRS) {
            for (let i = 1; i <= 3; i++) {
                const nx = x + dx * i, ny = y + dy * i;
                if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
                const c = grid[ny][nx];
                if (c === '#') break;
                if (c === '@') {
                    for (let t = 0; t < NT; t++) {
                        if (targets[t][0] === nx && targets[t][1] === ny) hits |= 1 << t;
                    }
                }
            }
        }
        if (hits) spots.push({ x, y, hits });
    }
}

// Sort by most targets hit
spots.sort((a, b) => popcount(b.hits) - popcount(a.hits));

function popcount(n: number): number {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

// DFS set cover: find minimum spots to cover all targets
let solution: Spot[] | null = null;

function dfs(covered: number, maxBombs: number, start: number, chosen: Spot[]): boolean {
    if (covered === allMask) {
        solution = [...chosen];
        return true;
    }
    if (chosen.length >= maxBombs) return false;

    // Pruning: can remaining spots cover what's missing?
    let canCover = covered;
    for (let i = start; i < spots.length; i++) canCover |= spots[i].hits;
    if (canCover !== allMask) return false;

    // Find first uncovered target to force coverage
    let uncovered = allMask & ~covered;
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    for (let i = start; i < spots.length; i++) {
        if (!((spots[i].hits >> firstUncovered) & 1)) continue; // must cover this target
        chosen.push(spots[i]);
        if (dfs(covered | spots[i].hits, maxBombs, i + 1, chosen)) return true;
        chosen.pop();
    }
    return false;
}

// Read first turn
let [rounds, bombs] = readline().split(' ').map(Number);

// Try with increasing bomb count for faster search
for (let b = 1; b <= bombs; b++) {
    if (dfs(0, b, 0, [])) break;
}

if (!solution) {
    // Fallback: shouldn't happen but just in case
    console.error('No solution found!');
    solution = [];
}

console.error(`Solution: ${solution.length} bombs`);
for (const s of solution) console.error(`  ${s.x},${s.y} hits=${s.hits.toString(2)}`);

// Game loop: place bombs then WAIT
let turn = 0;
while (true) {
    if (turn > 0) readline(); // consume turn input

    if (turn < solution.length) {
        console.log(`${solution[turn].x} ${solution[turn].y}`);
    } else {
        console.log('WAIT');
    }
    turn++;
}
