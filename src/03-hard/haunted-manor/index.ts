// Define global readline for CodinGame environment
declare const readline: () => string;

// --- Puzzle Logic ---

// Input parsing
const [vampireCount, zombieCount, ghostCount] = readline().split(' ').map(Number);
const size = parseInt(readline());

const topViews = readline().split(' ').map(Number);
const bottomViews = readline().split(' ').map(Number);
const leftViews = readline().split(' ').map(Number);
const rightViews = readline().split(' ').map(Number);

const initialGrid: string[][] = [];
const emptyCells: { r: number, c: number }[] = [];
for (let i = 0; i < size; i++) {
    const row = readline().split('');
    initialGrid.push(row);
    for (let j = 0; j < size; j++) {
        if (row[j] === '.') {
            emptyCells.push({ r: i, c: j });
        }
    }
}

// Precompute path data for early pruning
// precomputedPathsCrossingCell[r][c] will store an array of { windowIdx, isDirect }
// Each element signifies one time a light beam from `windowIdx` passes through `(r,c)` with `isDirect` view.
const precomputedPathsCrossingCell: { windowIdx: number, isDirect: boolean }[][][] = Array(size).fill(null).map(() => Array(size).fill(null).map(() => []));

// Combine all expected window counts into a single array for easier indexing
const expectedWindowCounts = [...topViews, ...bottomViews, ...leftViews, ...rightViews];

// Simulate light paths for all 4*size windows
for (let windowIdx = 0; windowIdx < 4 * size; windowIdx++) {
    let r: number, c: number; // Current position of the light ray
    let dr: number, dc: number; // Current direction delta (delta_row, delta_col)
    let currentIsDirectView: boolean = true;

    // Determine starting position and initial direction based on windowIdx
    if (windowIdx < size) { // Top windows (0 to size-1)
        r = -1; c = windowIdx; // Start just outside top border
        dr = 1; dc = 0; // Going down
    } else if (windowIdx < 2 * size) { // Bottom windows (size to 2*size-1)
        r = size; c = windowIdx - size; // Start just outside bottom border
        dr = -1; dc = 0; // Going up
    } else if (windowIdx < 3 * size) { // Left windows (2*size to 3*size-1)
        r = windowIdx - 2 * size; c = -1; // Start just outside left border
        dr = 0; dc = 1; // Going right
    } else { // Right windows (3*size to 4*size-1)
        r = windowIdx - 3 * size; c = size; // Start just outside right border
        dr = 0; dc = -1; // Going left
    }

    // Simulate the path of the light ray
    while (true) {
        r += dr;
        c += dc;

        // Check if ray is out of bounds
        if (r < 0 || r >= size || c < 0 || c >= size) {
            break; // Ray exited the grid
        }

        const cellContent = initialGrid[r][c];

        if (cellContent === '.') { // This is an empty cell where a monster will be placed
            // Record that this window's path crosses this cell, and its direct/reflected status
            precomputedPathsCrossingCell[r][c].push({ windowIdx: windowIdx, isDirect: currentIsDirectView });
        } else if (cellContent === '\\') { // Backslash mirror
            // Reflection rule for '\': (dr, dc) becomes (dc, dr)
            [dr, dc] = [dc, dr];
            currentIsDirectView = false; // View is now reflected
        } else if (cellContent === '/') { // Slash mirror
            // Reflection rule for '/': (dr, dc) becomes (-dc, -dr)
            [dr, dc] = [-dc, -dr];
            currentIsDirectView = false; // View is now reflected
        }
        // If it's a mirror, the view becomes reflected for subsequent cells.
        // If it's a monster cell ('.'), view status does not change (it's the cell content that determines monster visibility).
    }
}

// Global state for current monster counts seen by each window.
// This array is updated incrementally during backtracking and reverted.
const currentWindowCounts: number[] = new Array(4 * size).fill(0);

// Copy of the initial grid to modify during backtracking.
// This will hold the final solution.
const finalGrid = initialGrid.map(row => [...row]);

// Helper function to determine monster contribution to a view count
function getMonsterContribution(monsterType: string, isDirect: boolean): number {
    if (monsterType === 'V' && isDirect) return 1; // Vampire: seen directly
    if (monsterType === 'Z') return 1;             // Zombie: seen directly or in mirror
    if (monsterType === 'G' && !isDirect) return 1; // Ghost: seen in mirror
    return 0; // No contribution
}

/**
 * Backtracking function to fill empty cells with monsters.
 * @param cellIndex The index of the current empty cell being considered in `emptyCells`.
 * @param remainingV Remaining Vampires to place.
 * @param remainingZ Remaining Zombies to place.
 * @param remainingG Remaining Ghosts to place.
 * @returns True if a valid solution is found, false otherwise.
 */
function solve(cellIndex: number, remainingV: number, remainingZ: number, remainingG: number): boolean {
    if (cellIndex === emptyCells.length) {
        // All empty cells have been filled.
        // Now, check if the current monster counts match the expected counts for all windows.
        for (let i = 0; i < expectedWindowCounts.length; i++) {
            if (currentWindowCounts[i] !== expectedWindowCounts[i]) {
                return false; // Mismatch in counts (either too high or too low)
            }
        }
        return true; // All counts match, a valid solution is found
    }

    const { r, c } = emptyCells[cellIndex]; // Coordinates of the current empty cell
    const MONSTER_TYPES = ['V', 'Z', 'G']; // Types of monsters to try

    // Try placing each monster type in the current empty cell
    for (const monsterType of MONSTER_TYPES) {
        let currentRemaining: number;
        if (monsterType === 'V') currentRemaining = remainingV;
        else if (monsterType === 'Z') currentRemaining = remainingZ;
        else currentRemaining = remainingG;

        if (currentRemaining > 0) { // If there are monsters of this type left to place
            finalGrid[r][c] = monsterType; // Place the monster in the grid

            // Prepare remaining monster counts for the next recursive call
            let nextRemainingV = remainingV;
            let nextRemainingZ = remainingZ;
            let nextRemainingG = remainingG;
            if (monsterType === 'V') nextRemainingV--;
            else if (monsterType === 'Z') nextRemainingZ--;
            else nextRemainingG--;

            let isValidPath = true;
            // Get all window paths that cross this (r,c) cell
            const affectedWindows = precomputedPathsCrossingCell[r][c];
            // Store deltas to efficiently revert `currentWindowCounts` during backtracking
            const deltas: { windowIdx: number, delta: number }[] = [];

            // Apply monster's contribution to affected window counts
            for (const { windowIdx, isDirect } of affectedWindows) {
                const delta = getMonsterContribution(monsterType, isDirect);
                deltas.push({ windowIdx, delta }); // Store for reverting
                
                currentWindowCounts[windowIdx] += delta; // Update running count
                
                // Early pruning: if any window's count exceeds its expected count, this path is invalid
                if (currentWindowCounts[windowIdx] > expectedWindowCounts[windowIdx]) {
                    isValidPath = false;
                    // No need to continue processing affected windows for this placement, it's already invalid
                    break; 
                }
            }

            if (isValidPath) {
                // If current placement is valid so far, recurse to fill the next empty cell
                if (solve(cellIndex + 1, nextRemainingV, nextRemainingZ, nextRemainingG)) {
                    return true; // A solution was found in a deeper recursion, propagate up
                }
            }
            
            // Backtrack: If the recursive call didn't find a solution (or current placement was invalid)
            finalGrid[r][c] = '.'; // Remove the monster from the grid (restore placeholder)
            // Revert changes to currentWindowCounts
            for (const { windowIdx, delta } of deltas) {
                currentWindowCounts[windowIdx] -= delta;
            }
        }
    }
    return false; // No monster type placed at this cell led to a solution
}

// Start the backtracking process from the first empty cell (index 0)
solve(0, vampireCount, zombieCount, ghostCount);

// Output the final grid row by row
for (let i = 0; i < size; i++) {
    console.log(finalGrid[i].join(''));
}