// Global variables to store problem state and solution
let N_DUMBBELLS: number;
let H: number;
let W: number;
let isInitialO: boolean[][]; // Marks true for original 'o' positions
let totalInitialOs: number = 0; // Total count of 'o's in initialGrid

let solutionGrid: string[][]; // Stores the final solution
let foundSolution: boolean = false;

// Global mutable state for the current grid configuration and initial 'o' usage during backtracking
let currentGrid: string[][];
let initialOsUsedCount: number[][]; // 0 or 1, tracks if an initial 'o' is used as an endpoint

/**
 * Checks if a dumbbell can be placed at the specified positions.
 * @param r1 Row of the first endpoint.
 * @param c1 Column of the first endpoint.
 * @param r2 Row of the second endpoint.
 * @param c2 Column of the second endpoint.
 * @param r_mid Row of the midpoint (bar).
 * @param c_mid Column of the midpoint (bar).
 * @returns True if placement is valid, false otherwise.
 */
function canPlace(r1: number, c1: number, r2: number, c2: number, r_mid: number, c_mid: number): boolean {
    // 1. Bounds check: Ensure all three cells are within grid boundaries.
    if (r1 < 0 || r1 >= H || c1 < 0 || c1 >= W ||
        r2 < 0 || r2 >= H || c2 < 0 || c2 >= W ||
        r_mid < 0 || r_mid >= H || c_mid < 0 || c_mid >= W) {
        return false;
    }

    // 2. Midpoint (bar) must be empty ('.').
    if (currentGrid[r_mid][c_mid] !== '.') {
        return false;
    }

    // 3. Endpoints (weights) must be empty ('.') or an unused initial 'o'.
    const checkEndpoint = (r: number, c: number): boolean => {
        const cell = currentGrid[r][c];
        if (cell === '.') {
            return true; // Empty cell is fine.
        } else if (cell === 'o') {
            // 'o' cell must be an initial 'o' and not yet used by another dumbbell.
            return isInitialO[r][c] && initialOsUsedCount[r][c] === 0;
        } else {
            // Cell is a bar ('-' or '|'), cannot place a weight here.
            return false;
        }
    };

    if (!checkEndpoint(r1, c1) || !checkEndpoint(r2, c2)) {
        return false;
    }

    return true;
}

/**
 * Places a dumbbell on the currentGrid and updates initialOsUsedCount.
 * Assumes canPlace() has already returned true for these coordinates.
 * @param r1 Row of the first endpoint.
 * @param c1 Column of the first endpoint.
 * @param r2 Row of the second endpoint.
 * @param c2 Column of the second endpoint.
 * @param r_mid Row of the midpoint (bar).
 * @param c_mid Column of the midpoint (bar).
 * @param barChar Character for the bar ('-' or '|').
 * @returns Number of initial 'o's that were just consumed by this placement (0, 1, or 2).
 */
function place(r1: number, c1: number, r2: number, c2: number, r_mid: number, c_mid: number, barChar: string): number {
    currentGrid[r_mid][c_mid] = barChar;
    currentGrid[r1][c1] = 'o'; // Mark as weight 'o'
    currentGrid[r2][c2] = 'o'; // Mark as weight 'o'

    let usedCount = 0;
    // If an initial 'o' was used as an endpoint, mark it as used and decrement remaining count.
    if (isInitialO[r1][c1]) {
        // We only increment if it hasn't been marked as used already (initial value 0)
        // This is important because initialOsUsedCount is shared and unplace decrements it.
        if (initialOsUsedCount[r1][c1] === 0) {
            initialOsUsedCount[r1][c1] = 1;
            usedCount++;
        }
    }
    if (isInitialO[r2][c2]) {
        if (initialOsUsedCount[r2][c2] === 0) {
            initialOsUsedCount[r2][c2] = 1;
            usedCount++;
        }
    }
    return usedCount;
}

/**
 * Reverts the changes made by a place() call, for backtracking.
 * @param r1 Row of the first endpoint.
 * @param c1 Column of the first endpoint.
 * @param r2 Row of the second endpoint.
 * @param c2 Column of the second endpoint.
 * @param r_mid Row of the midpoint (bar).
 * @param c_mid Column of the midpoint (bar).
 */
function unplace(r1: number, c1: number, r2: number, c2: number, r_mid: number, c_mid: number): void {
    currentGrid[r_mid][c_mid] = '.'; // Revert bar to empty

    // Revert endpoints. If original was an 'o', revert to 'o'. Else, revert to '.'.
    // Also, decrement initialOsUsedCount if applicable.
    if (isInitialO[r1][c1]) {
        initialOsUsedCount[r1][c1] = 0;
        currentGrid[r1][c1] = 'o';
    } else {
        currentGrid[r1][c1] = '.';
    }

    if (isInitialO[r2][c2]) {
        initialOsUsedCount[r2][c2] = 0;
        currentGrid[r2][c2] = 'o';
    } else {
        currentGrid[r2][c2] = '.';
    }
}

/**
 * Recursive backtracking function to find the dumbbell placements.
 * @param dumbbellsPlaced Number of dumbbells successfully placed so far.
 * @param initialOsRemaining Number of initial 'o's that still need to be used as an endpoint.
 * @param searchFromRow Row to start searching for the next dumbbell placement.
 * @param searchFromCol Column to start searching for the next dumbbell placement.
 */
function solveDumbbells(dumbbellsPlaced: number, initialOsRemaining: number, searchFromRow: number, searchFromCol: number): void {
    if (foundSolution) {
        return; // A unique solution has already been found.
    }

    // Base Case 1: All N dumbbells have been placed.
    if (dumbbellsPlaced === N_DUMBBELLS) {
        // Check if all initial 'o's have been used as endpoints.
        if (initialOsRemaining === 0) {
            solutionGrid = currentGrid.map(row => [...row]); // Deep copy the solution grid
            foundSolution = true;
        }
        return; // Path ends here (either success or failure).
    }

    // Pruning 1: If too many initial 'o's remain for the dumbbells left to place.
    // Each dumbbell can use at most 2 initial 'o's.
    if (initialOsRemaining > (N_DUMBBELLS - dumbbellsPlaced) * 2) {
        return;
    }

    // Iterate through all cells from (searchFromRow, searchFromCol) onwards
    // This structured iteration prevents redundant checks and ensures all combinations are explored systematically.
    for (let r = searchFromRow; r < H; r++) {
        for (let c = (r === searchFromRow ? searchFromCol : 0); c < W; c++) {
            // Try placing a horizontal dumbbell (o-o)
            const r1_h = r, c1_h = c;
            const r2_h = r, c2_h = c + 2;
            const r_mid_h = r, c_mid_h = c + 1;

            if (canPlace(r1_h, c1_h, r2_h, c2_h, r_mid_h, c_mid_h)) {
                const usedOs = place(r1_h, c1_h, r2_h, c2_h, r_mid_h, c_mid_h, '-');
                
                // Calculate next search starting point: current cell + 1 to ensure progress.
                let nextSearchCol = c + 1;
                let nextSearchRow = r;
                if (nextSearchCol >= W) {
                    nextSearchCol = 0;
                    nextSearchRow++;
                }

                solveDumbbells(dumbbellsPlaced + 1, initialOsRemaining - usedOs, nextSearchRow, nextSearchCol);
                if (foundSolution) return; // Propagate solution up the stack
                unplace(r1_h, c1_h, r2_h, c2_h, r_mid_h, c_mid_h); // Backtrack
            }

            // Try placing a vertical dumbbell (o|o)
            const r1_v = r, c1_v = c;
            const r2_v = r + 2, c2_v = c;
            const r_mid_v = r + 1, c_mid_v = c;

            if (canPlace(r1_v, c1_v, r2_v, c2_v, r_mid_v, c_mid_v)) {
                const usedOs = place(r1_v, c1_v, r2_v, c2_v, r_mid_v, c_mid_v, '|');
                
                // Calculate next search starting point
                let nextSearchCol = c + 1;
                let nextSearchRow = r;
                if (nextSearchCol >= W) {
                    nextSearchCol = 0;
                    nextSearchRow++;
                }

                solveDumbbells(dumbbellsPlaced + 1, initialOsRemaining - usedOs, nextSearchRow, nextSearchCol);
                if (foundSolution) return; // Propagate solution up the stack
                unplace(r1_v, c1_v, r2_v, c2_v, r_mid_v, c_mid_v); // Backtrack
            }
        }
    }
}

// --- Main execution ---
// Read input
N_DUMBBELLS = parseInt(readline());
[H, W] = readline().split(' ').map(Number);

// Initialize grid states
isInitialO = Array(H).fill(0).map(() => Array(W).fill(false));
currentGrid = []; // This will be the mutable grid for backtracking
initialOsUsedCount = Array(H).fill(0).map(() => Array(W).fill(0)); // All zeros initially

for (let r = 0; r < H; r++) {
    const rowChars = readline().split('');
    currentGrid.push(rowChars); // Populate currentGrid with initial state
    for (let c = 0; c < W; c++) {
        if (rowChars[c] === 'o') {
            isInitialO[r][c] = true;
            totalInitialOs++; // Count total initial 'o's
        }
    }
}

// Start the backtracking search
solveDumbbells(0, totalInitialOs, 0, 0);

// Print the final solution
for (let r = 0; r < H; r++) {
    console.log(solutionGrid[r].join(''));
}