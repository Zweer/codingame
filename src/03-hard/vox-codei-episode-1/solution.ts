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

function targetIdx(x: number, y: number): number {
    for (let i = 0; i < NT; i++) {
        if (targets[i][0] === x && targets[i][1] === y) return i;
    }
    return -1;
}

// For each non-wall cell, compute bitmask of targets it can destroy
// Include '@' cells too — they can become empty after a prior bomb destroys them
interface Spot { x: number; y: number; hits: number; selfTarget: number; }
const spots: Spot[] = [];

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        if (grid[y][x] === '#') continue;
        let hits = 0;
        // A bomb at (x,y) hits targets in cross pattern, range 3
        for (const [dx, dy] of DIRS) {
            for (let i = 1; i <= 3; i++) {
                const nx = x + dx * i, ny = y + dy * i;
                if (nx < 0 || nx >= W || ny < 0 || ny >= H) break;
                const c = grid[ny][nx];
                if (c === '#') break;
                if (c === '@') {
                    const ti = targetIdx(nx, ny);
                    if (ti >= 0) hits |= 1 << ti;
                }
            }
        }
        // If this cell IS a target, the bomb doesn't destroy itself but we need
        // to track that this spot requires the target to be destroyed first
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

// DFS set cover with dependency: if spot is on a target cell, that target must
// already be covered (destroyed by a prior bomb) before we can place there
let solution: Spot[] | null = null;

function dfs(covered: number, maxBombs: number, chosen: Spot[]): boolean {
    if (covered === allMask) {
        solution = [...chosen];
        return true;
    }
    if (chosen.length >= maxBombs) return false;

    // Find first uncovered target
    const uncovered = allMask & ~covered;
    let firstUncovered = 0;
    while (!((uncovered >> firstUncovered) & 1)) firstUncovered++;

    // Pruning: can any remaining spots cover this target?
    let canCoverFirst = false;
    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;
        // Can we use this spot? Either it's not on a target, or that target is already covered
        if (s.selfTarget < 0 || ((covered >> s.selfTarget) & 1)) {
            canCoverFirst = true;
            break;
        }
        // Or: the target it sits on could be covered by another spot we haven't tried yet
        canCoverFirst = true; // optimistic — let DFS handle it
        break;
    }
    if (!canCoverFirst) return false;

    for (const s of spots) {
        if (!((s.hits >> firstUncovered) & 1)) continue;

        // If spot is on a target cell, that target must already be destroyed
        if (s.selfTarget >= 0 && !((covered >> s.selfTarget) & 1)) continue;

        chosen.push(s);
        if (dfs(covered | s.hits, maxBombs, chosen)) return true;
        chosen.pop();
    }
    return false;
}

// Read first turn
let [rounds, bombs] = readline().split(' ').map(Number);

for (let b = 1; b <= bombs; b++) {
    if (dfs(0, b, [])) break;
}

if (!solution || solution.length === 0) {
    console.error(`No solution found! NT=${NT} spots=${spots.length}`);
    for (const s of spots.slice(0, 20)) {
        console.error(`  spot(${s.x},${s.y}) self=${s.selfTarget} hits=${s.hits.toString(2).padStart(NT, '0')}`);
    }
}

// Now we need to ORDER the solution: spots on target cells must come AFTER
// the bomb that destroys that target. Bombs explode 3 turns after placement.
// Simple approach: place "free" spots first (not on targets), then dependent ones.
const ordered: Spot[] = [];
if (solution) {
    const remaining = [...solution];
    const destroyed = new Set<number>();

    while (remaining.length > 0) {
        let placed = false;
        for (let i = 0; i < remaining.length; i++) {
            const s = remaining[i];
            if (s.selfTarget < 0 || destroyed.has(s.selfTarget)) {
                ordered.push(s);
                remaining.splice(i, 1);
                // After this bomb explodes, its targets are destroyed
                for (let t = 0; t < NT; t++) {
                    if ((s.hits >> t) & 1) destroyed.add(t);
                }
                placed = true;
                break;
            }
        }
        if (!placed) {
            // Circular dependency — just place them in order
            ordered.push(...remaining);
            break;
        }
    }
}

console.error(`Solution: ${ordered.length} bombs`);
for (const s of ordered) console.error(`  ${s.x},${s.y}`);

// Game loop
let turn = 0;
while (true) {
    if (turn > 0) readline();

    if (turn < ordered.length) {
        console.log(`${ordered[turn].x} ${ordered[turn].y}`);
    } else {
        console.log('WAIT');
    }
    turn++;
}
