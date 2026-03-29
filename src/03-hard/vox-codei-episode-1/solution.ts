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

// Precompute: for each empty cell, which targets it can hit
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
interface BombSpot {
    x: number;
    y: number;
    hits: number; // bitmask of targets hit
}

const spots: BombSpot[] = [];
for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        if (grid[y][x] !== '.') continue;
        let hits = 0;
        for (const [dx, dy] of DIRS) {
            for (let i = 1; i <= 3; i++) {
                const nx = x + dx * i, ny = y + dy * i;
                if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
                if (grid[ny][nx] === '#') break;
                if (grid[ny][nx] === '@') {
                    const idx = targets.findIndex(([tx, ty]) => tx === nx && ty === ny);
                    if (idx >= 0) hits |= (1 << idx);
                }
            }
        }
        if (hits > 0) spots.push({ x, y, hits });
    }
}

// Sort spots by number of targets hit (descending) for better pruning
spots.sort((a, b) => bitcount(b.hits) - bitcount(a.hits));

function bitcount(n: number): number {
    let c = 0;
    while (n) { c += n & 1; n >>= 1; }
    return c;
}

const allTargets = (1 << targets.length) - 1;

// DFS: find minimal set of bomb placements that cover all targets
let solution: { x: number; y: number }[] | null = null;

function dfs(destroyed: number, bombsLeft: number, startIdx: number, chosen: { x: number; y: number }[]): boolean {
    if (destroyed === allTargets) {
        solution = [...chosen];
        return true;
    }
    if (bombsLeft === 0) return false;

    // Pruning: check if remaining spots can cover what's left
    let reachable = destroyed;
    for (let i = startIdx; i < spots.length; i++) {
        reachable |= spots[i].hits;
    }
    if (reachable !== allTargets) return false;

    for (let i = startIdx; i < spots.length; i++) {
        const s = spots[i];
        // Only consider if this spot hits at least one new target
        if ((s.hits & ~destroyed) === 0) continue;

        chosen.push({ x: s.x, y: s.y });
        if (dfs(destroyed | s.hits, bombsLeft - 1, i + 1, chosen)) return true;
        chosen.pop();
    }
    return false;
}

// Read first turn
let [rounds, bombs] = readline().split(' ').map(Number);

// Find solution
dfs(0, bombs, 0, []);

// Output solution moves, then WAIT for the rest
let moveIdx = 0;
while (true) {
    if (moveIdx > 0) {
        readline(); // read subsequent turns (we ignore them)
    }

    if (solution && moveIdx < solution.length) {
        console.log(`${solution[moveIdx].x} ${solution[moveIdx].y}`);
    } else {
        console.log('WAIT');
    }
    moveIdx++;
}
