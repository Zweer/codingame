// For CodinGame environment, `readline()` is typically a global function.
// For local development or testing, you might need to mock it.
declare function readline(): string;

// Helper arrays for iterating over 8 neighbors
const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

/**
 * Checks if a given (row, col) coordinate is within the grid boundaries.
 */
function isSafe(r: number, c: number, h: number, w: number): boolean {
    return r >= 0 && r < h && c >= 0 && c < w;
}

// Read grid dimensions and number of mines
const [h, w] = readline().split(' ').map(Number);
const nb = parseInt(readline());

// Store the initial clues from the input grid
const initialClues: string[][] = [];
for (let i = 0; i < h; i++) {
    initialClues.push(readline().split(''));
}

// mineStatus grid: 'U' (Unknown), 'M' (Mine), 'N' (Not a mine)
const mineStatus: string[][] = Array(h).fill(0).map(() => Array(w).fill(''));

// --- Pre-processing: Initial deductions ---

// 1. Initialize mineStatus: Mark 'N' for clue cells and 'U' for '?' cells.
for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
        if (initialClues[r][c] === '?') {
            mineStatus[r][c] = 'U';
        } else {
            // Clue cells ('.', 'n') are never mines themselves
            mineStatus[r][c] = 'N'; 
        }
    }
}

// 2. Propagate '.' constraints: Mark neighbors of '.' as 'N'.
// This is done iteratively as a change can trigger further changes.
let changedSomething = true;
while (changedSomething) {
    changedSomething = false;
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (initialClues[r][c] === '.') {
                for (let i = 0; i < 8; i++) {
                    const nr = r + dr[i];
                    const nc = c + dc[i];
                    if (isSafe(nr, nc, h, w)) {
                        if (mineStatus[nr][nc] === 'U') {
                            mineStatus[nr][nc] = 'N'; // Found a cell that cannot be a mine
                            changedSomething = true;
                        }
                    }
                }
            }
        }
    }
}

// Collect all remaining 'U' cells as candidates for mines
const candidateCells: { r: number, c: number }[] = [];
for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
        if (mineStatus[r][c] === 'U') {
            candidateCells.push({ r, c });
        }
    }
}

// Array to store the final mine locations found
const finalMines: { r: number, c: number }[] = [];

/**
 * Counts the number of confirmed mines and unknown neighbors around a given clue cell.
 */
function countNeighborMines(clueR: number, clueC: number): { currentMines: number, unknownNeighbors: number } {
    let currentMines = 0;
    let unknownNeighbors = 0;
    for (let i = 0; i < 8; i++) {
        const nr = clueR + dr[i];
        const nc = clueC + dc[i];
        if (isSafe(nr, nc, h, w)) {
            if (mineStatus[nr][nc] === 'M') {
                currentMines++;
            } else if (mineStatus[nr][nc] === 'U') {
                unknownNeighbors++;
            }
        }
    }
    return { currentMines, unknownNeighbors };
}

/**
 * Pruning/Validation function for a partial grid state.
 * Checks if the current mineStatus configuration violates any clue.
 */
function isValidPartialPlacement(): boolean {
    // Iterate through all clue cells (non-'?') in the original grid
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const clueChar = initialClues[r][c];

            if (clueChar === '.') {
                // A '.' cell must have NO mines in its neighbors.
                const { currentMines } = countNeighborMines(r, c);
                if (currentMines > 0) {
                    return false; // Contradiction: '.' cell has a mine neighbor
                }
            } else if (clueChar !== '?') { // It's a digit '1'-'8'
                const requiredMines = parseInt(clueChar);
                const { currentMines, unknownNeighbors } = countNeighborMines(r, c);

                // Pruning conditions for digit clues:
                // 1. Too many mines already placed around this clue.
                if (currentMines > requiredMines) {
                    return false;
                }
                // 2. Not enough mines can possibly be placed around this clue,
                // even if all remaining 'U' neighbors become mines.
                if (currentMines + unknownNeighbors < requiredMines) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Final validation function, called only when `nb` mines have been placed.
 * Ensures the final grid configuration perfectly satisfies all clues.
 */
function validateGrid(): boolean {
    // Iterate through all clue cells (non-'?') in the original grid
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const clueChar = initialClues[r][c];

            if (clueChar === '.') {
                const { currentMines } = countNeighborMines(r, c);
                if (currentMines > 0) { // Must be exactly 0 mines
                    return false;
                }
            } else if (clueChar !== '?') { // It's a digit '1'-'8'
                const requiredMines = parseInt(clueChar);
                const { currentMines, unknownNeighbors } = countNeighborMines(r, c);
                // At this point, all candidate cells must have been assigned 'M' or 'N',
                // so `unknownNeighbors` should be 0.
                if (currentMines !== requiredMines || unknownNeighbors !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Recursive backtracking function to find mine locations.
 * @param k The current index in the `candidateCells` array being considered.
 * @param minesPlacedCount The number of mines placed in the current hypothesis.
 * @returns True if a valid solution is found, false otherwise.
 */
function solve(k: number, minesPlacedCount: number): boolean {
    // Base case 1: All required mines have been placed.
    if (minesPlacedCount === nb) {
        // Assume all remaining candidate cells (from k to end) are NOT mines ('N')
        for (let i = k; i < candidateCells.length; i++) {
            mineStatus[candidateCells[i].r][candidateCells[i].c] = 'N';
        }
        
        // Validate the complete grid configuration
        if (validateGrid()) {
            // Solution found: collect coordinates of all 'M' cells
            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    if (mineStatus[r][c] === 'M') {
                        finalMines.push({ r, c });
                    }
                }
            }
            return true; // Propagate success
        }

        // If validation failed, backtrack by resetting the temporary 'N's to 'U'
        for (let i = k; i < candidateCells.length; i++) {
            mineStatus[candidateCells[i].r][candidateCells[i].c] = 'U';
        }
        return false; // This path didn't lead to a valid solution
    }

    // Base case 2: All candidate cells have been processed, but not enough mines placed.
    if (k === candidateCells.length) {
        return false;
    }

    // Pruning: If it's impossible to place the remaining mines required (`nb` - `minesPlacedCount`)
    // from the remaining candidate cells (`candidateCells.length - k`).
    if (minesPlacedCount + (candidateCells.length - k) < nb) {
        return false;
    }

    const { r, c } = candidateCells[k]; // Current candidate cell to decide on

    // --- Option 1: Place a mine at (r, c) ---
    mineStatus[r][c] = 'M';
    if (isValidPartialPlacement()) { // Check if this placement immediately violates any clue
        if (solve(k + 1, minesPlacedCount + 1)) {
            return true; // Propagate success
        }
    }
    mineStatus[r][c] = 'U'; // Backtrack: Reset cell status for the next option

    // --- Option 2: Do NOT place a mine at (r, c) ---
    mineStatus[r][c] = 'N';
    if (isValidPartialPlacement()) { // Check if this non-placement immediately violates any clue
        if (solve(k + 1, minesPlacedCount)) {
            return true; // Propagate success
        }
    }
    mineStatus[r][c] = 'U'; // Backtrack: Reset cell status for parent call's next option

    return false; // No solution found via this path
}

// Initiate the backtracking search
solve(0, 0);

// Sort the found mine locations as required:
// 1. Column ascending (a.c - b.c)
// 2. Then by Line ascending (a.r - b.r) for ties in column
finalMines.sort((a, b) => {
    if (a.c !== b.c) {
        return a.c - b.c;
    }
    return a.r - b.r;
});

// Output the results in "col lin" format
for (const mine of finalMines) {
    console.log(`${mine.c} ${mine.r}`);
}