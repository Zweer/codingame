// Define constants for grid size and block size
const GRID_SIZE = 25;
const BLOCK_SIZE = 5;

// Global state variables for the Sudoku grid, candidates, and propagation worklist
// These are declared globally to simplify passing them around recursive functions,
// effectively making them shared mutable state for the solver.
let grid: number[][]; // Stores the solved values (-1 for empty, 0-24 for A-Y)
let candidates: boolean[][][]; // candidates[r][c][v] is true if value 'v' is possible for cell (r,c)
let numCandidates: number[][]; // numCandidates[r][c] stores the count of possible values for cell (r,c)

// Type definition for changes recorded in the history for backtracking
type Change = {
    type: 'cellSet';
    r: number;
    c: number;
    val: number; // The value that was set
    oldVal: number; // The old value (should be -1)
} | {
    type: 'candidateRemoved';
    r: number;
    c: number;
    val: number; // The candidate value that was removed
};

// History log to store changes made during a guess branch, allowing efficient backtracking
let history: Change[];

// Worklist for the `fullPropagate` function to handle cascading deductions
// Stores coordinates [row, col] of cells whose state has changed and need further propagation
let propagationWorklist: Array<[number, number]>;

// --- Helper Functions ---

/** Converts a character 'A'-'Y' to its corresponding number 0-24. */
const charToNum = (char: string): number => char.charCodeAt(0) - 'A'.charCodeAt(0);

/** Converts a number 0-24 to its corresponding character 'A'-'Y'. */
const numToChar = (num: number): string => String.fromCharCode('A'.charCodeAt(0) + num);

// --- Core Solver Functions ---

/**
 * Main function to solve the Sudoku puzzle.
 * Initializes the grid, candidates, and runs the solving process.
 * @param initialGridInput Array of strings representing the 25x25 initial grid.
 * @returns Array of strings representing the solved 25x25 grid.
 */
function solveSudoku(initialGridInput: string[]): string[] {
    // 1. Initialize data structures
    grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(-1));
    candidates = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(true)));
    numCandidates = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(GRID_SIZE));
    history = [];
    propagationWorklist = [];

    // 2. Parse input and initialize pre-filled cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const char = initialGridInput[r][c];
            if (char !== '.') {
                const val = charToNum(char);
                // Directly set the cell value and reduce its candidates to only its value.
                // These initial fixed cells are added to the worklist for initial propagation.
                grid[r][c] = val;
                for (let v = 0; v < GRID_SIZE; v++) {
                    if (v !== val) {
                        candidates[r][c][v] = false;
                    }
                }
                numCandidates[r][c] = 1;
                propagationWorklist.push([r, c]);
            }
        }
    }

    // 3. Perform initial constraint propagation based on pre-filled cells.
    // If this leads to a contradiction, the puzzle is invalid (shouldn't happen per problem statement).
    if (!fullPropagate()) {
        throw new Error("Initial grid leads to a contradiction.");
    }

    // 4. Start the recursive backtracking search.
    if (!recursiveSolve()) {
        throw new Error("No solution found (should not happen for valid Sudoku).");
    }

    // 5. Format the solved grid into the required output format (array of strings).
    const result: string[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        let rowStr = '';
        for (let c = 0; c < GRID_SIZE; c++) {
            rowStr += numToChar(grid[r][c]);
        }
        result.push(rowStr);
    }
    return result;
}

/**
 * Attempts to set a cell (r, c) to a specific value 'val'.
 * Records the change in `history` and adds `(r, c)` to `propagationWorklist`.
 * This function only performs the direct assignment and preparation for propagation,
 * the actual propagation logic is handled by `fullPropagate`.
 * @param r Row index.
 * @param c Column index.
 * @param val Value to set (0-24).
 * @returns True if the assignment is valid (no immediate conflict), false otherwise.
 */
function trySetCell(r: number, c: number, val: number): boolean {
    // If the cell is already set, check if the new value is consistent.
    if (grid[r][c] !== -1) {
        return grid[r][c] === val;
    }
    // If the value is not a possible candidate for this cell, it's an invalid attempt.
    if (!candidates[r][c][val]) {
        return false;
    }

    // Record the change for potential backtracking.
    history.push({ type: 'cellSet', r, c, val, oldVal: -1 });
    grid[r][c] = val; // Set the cell value.

    // Add this cell to the worklist; its new fixed value needs to be propagated.
    propagationWorklist.push([r, c]);

    return true; // Assignment was valid so far.
}

/**
 * Attempts to remove 'val' as a possible candidate for cell (r, c).
 * Records the change in `history`. If this removal makes the cell a Naked Single,
 * it adds the cell to `propagationWorklist`.
 * @param r Row index.
 * @param c Column index.
 * @param val Candidate value to remove (0-24).
 * @returns True if the operation is valid (no contradiction), false if cell becomes unsolvable.
 */
function tryRemoveCandidate(r: number, c: number, val: number): boolean {
    // If the candidate is already removed, do nothing.
    if (!candidates[r][c][val]) {
        return true;
    }

    // Record the change for potential backtracking.
    history.push({ type: 'candidateRemoved', r, c, val });
    candidates[r][c][val] = false; // Mark candidate as no longer possible.
    numCandidates[r][c]--; // Decrement the count of remaining candidates.

    // If the cell now has zero candidates, it's a contradiction.
    if (numCandidates[r][c] === 0) {
        return false;
    }
    // If the cell now has exactly one candidate, it's a Naked Single.
    // Add it to the worklist to be resolved by `fullPropagate`.
    if (numCandidates[r][c] === 1) {
        propagationWorklist.push([r, c]);
    }
    return true; // Removal was valid so far.
}

/**
 * Performs iterative constraint propagation, applying various deduction rules.
 * This function processes the `propagationWorklist` and repeatedly checks for
 * Hidden Singles and Pointing (Box-Line Reduction) until no more deductions can be made.
 * @returns True if no contradiction is found, false if a contradiction occurs.
 */
function fullPropagate(): boolean {
    let changedInRound = true; // Flag to indicate if any deduction was made in a full round

    // Continue propagating as long as new deductions are being made
    while (changedInRound) {
        changedInRound = false;

        // Phase 1: Process cells in the propagationWorklist
        // These are cells that were just set or became Naked Singles.
        while (propagationWorklist.length > 0) {
            const [r, c] = propagationWorklist.shift()!; // Get next cell from worklist

            if (grid[r][c] !== -1) {
                // If the cell (r,c) is now fixed, remove its value from its peers.
                const val = grid[r][c];

                // Remove 'val' from other cells in the same row
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (col !== c) {
                        if (!tryRemoveCandidate(r, col, val)) return false; // Contradiction
                    }
                }
                // Remove 'val' from other cells in the same column
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (row !== r) {
                        if (!tryRemoveCandidate(row, c, val)) return false; // Contradiction
                    }
                }
                // Remove 'val' from other cells in the same 5x5 block
                const blockRowStart = Math.floor(r / BLOCK_SIZE) * BLOCK_SIZE;
                const blockColStart = Math.floor(c / BLOCK_SIZE) * BLOCK_SIZE;
                for (let row = blockRowStart; row < blockRowStart + BLOCK_SIZE; row++) {
                    for (let col = blockColStart; col < blockColStart + BLOCK_SIZE; col++) {
                        if (row !== r || col !== c) {
                            if (!tryRemoveCandidate(row, col, val)) return false; // Contradiction
                        }
                    }
                }
            } else if (numCandidates[r][c] === 1) {
                // If (r,c) became a Naked Single (value already removed from peers)
                // it needs to be set. Find its single remaining candidate.
                for (let v = 0; v < GRID_SIZE; v++) {
                    if (candidates[r][c][v]) {
                        if (!trySetCell(r, c, v)) return false; // Contradiction (e.g., trying to set to an impossible value)
                        changedInRound = true; // A new cell was fixed, so another round might be needed.
                        break;
                    }
                }
            }
        }

        // Phase 2: Hidden Singles (values that can only go in one cell within a unit)
        // Check rows, columns, and blocks for hidden singles.
        for (let unitIdx = 0; unitIdx < GRID_SIZE; unitIdx++) {
            // Check Rows for Hidden Singles
            for (let val = 0; val < GRID_SIZE; val++) {
                let count = 0; // Count how many cells in this row can contain 'val'
                let lastPos: [number, number] = [-1, -1]; // Store the last possible position

                for (let col = 0; col < GRID_SIZE; col++) {
                    if (grid[unitIdx][col] === -1 && candidates[unitIdx][col][val]) {
                        count++;
                        lastPos = [unitIdx, col];
                    }
                }
                // If 'val' can only go in one cell in this row, and that cell is not yet fixed, fix it.
                if (count === 1 && grid[lastPos[0]][lastPos[1]] === -1) {
                    if (!trySetCell(lastPos[0], lastPos[1], val)) return false; // Contradiction
                    changedInRound = true; // A new cell was fixed
                }
            }

            // Check Columns for Hidden Singles (similar logic to rows)
            for (let val = 0; val < GRID_SIZE; val++) {
                let count = 0;
                let lastPos: [number, number] = [-1, -1];
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (grid[row][unitIdx] === -1 && candidates[row][unitIdx][val]) {
                        count++;
                        lastPos = [row, unitIdx];
                    }
                }
                if (count === 1 && grid[lastPos[0]][lastPos[1]] === -1) {
                    if (!trySetCell(lastPos[0], lastPos[1], val)) return false;
                    changedInRound = true;
                }
            }

            // Check Blocks for Hidden Singles
            const blockRowStart = Math.floor(unitIdx / BLOCK_SIZE) * BLOCK_SIZE;
            const blockColStart = (unitIdx % BLOCK_SIZE) * BLOCK_SIZE;
            for (let val = 0; val < GRID_SIZE; val++) {
                let count = 0;
                let lastPos: [number, number] = [-1, -1];
                for (let r = blockRowStart; r < blockRowStart + BLOCK_SIZE; r++) {
                    for (let c = blockColStart; c < blockColStart + BLOCK_SIZE; c++) {
                        if (grid[r][c] === -1 && candidates[r][c][val]) {
                            count++;
                            lastPos = [r, c];
                        }
                    }
                }
                if (count === 1 && grid[lastPos[0]][lastPos[1]] === -1) {
                    if (!trySetCell(lastPos[0], lastPos[1], val)) return false;
                    changedInRound = true;
                }
            }
        }

        // Phase 3: Pointing (Box-Line Reduction)
        // If all candidates for a value in a block are on the same row/column,
        // remove that value from that row/column outside the block.
        for (let blockIdx = 0; blockIdx < GRID_SIZE; blockIdx++) {
            const blockRStart = Math.floor(blockIdx / BLOCK_SIZE) * BLOCK_SIZE;
            const blockCStart = (blockIdx % BLOCK_SIZE) * BLOCK_SIZE;

            for (let val = 0; val < GRID_SIZE; val++) {
                let possibleRowsInBlock = new Set<number>();
                let possibleColsInBlock = new Set<number>();

                // Find all cells within this block that can contain 'val'
                for (let r = blockRStart; r < blockRStart + BLOCK_SIZE; r++) {
                    for (let c = blockCStart; c < blockCStart + BLOCK_SIZE; c++) {
                        if (grid[r][c] === -1 && candidates[r][c][val]) {
                            possibleRowsInBlock.add(r);
                            possibleColsInBlock.add(c);
                        }
                    }
                }

                // If 'val' is confined to a single row within this block
                if (possibleRowsInBlock.size === 1) {
                    const rowToClear = possibleRowsInBlock.values().next().value;
                    // Remove 'val' from cells in this row that are outside the current block
                    for (let c = 0; c < GRID_SIZE; c++) {
                        // Check if column 'c' is outside the current block's column range
                        if (Math.floor(c / BLOCK_SIZE) !== (blockIdx % BLOCK_SIZE)) {
                            if (candidates[rowToClear][c][val]) {
                                if (!tryRemoveCandidate(rowToClear, c, val)) return false; // Contradiction
                                changedInRound = true; // Candidates were removed
                            }
                        }
                    }
                }

                // If 'val' is confined to a single column within this block
                if (possibleColsInBlock.size === 1) {
                    const colToClear = possibleColsInBlock.values().next().value;
                    // Remove 'val' from cells in this column that are outside the current block
                    for (let r = 0; r < GRID_SIZE; r++) {
                        // Check if row 'r' is outside the current block's row range
                        if (Math.floor(r / BLOCK_SIZE) !== Math.floor(blockIdx / BLOCK_SIZE)) {
                            if (candidates[r][colToClear][val]) {
                                if (!tryRemoveCandidate(r, colToClear, val)) return false; // Contradiction
                                changedInRound = true; // Candidates were removed
                            }
                        }
                    }
                }
            }
        }
    }
    return true; // No contradiction found after a full round of propagation
}

/**
 * Recursive backtracking function to solve the Sudoku.
 * Applies constraint propagation, selects an unassigned cell, and tries values.
 * @returns True if a solution is found, false otherwise.
 */
function recursiveSolve(): boolean {
    // 1. Always start by running full propagation. This deduces immediate consequences
    // of previous assignments/removals and clears the `propagationWorklist`.
    if (!fullPropagate()) {
        return false; // Contradiction found, this branch is invalid.
    }

    // 2. Find the unassigned cell with the fewest candidates (Minimum Remaining Values heuristic).
    let bestR = -1;
    let bestC = -1;
    let minCandidates = GRID_SIZE + 1; // Initialize with a value higher than any possible count

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === -1) { // If cell is unassigned
                if (numCandidates[r][c] < minCandidates) {
                    minCandidates = numCandidates[r][c];
                    bestR = r;
                    bestC = c;
                }
            }
        }
    }

    // 3. Base Case: If no unassigned cells are found, the puzzle is solved.
    if (bestR === -1) {
        return true;
    }

    // (Self-check): If minCandidates is 0, it means an unassigned cell has no possible values.
    // This should have been caught by `fullPropagate()` returning `false`.

    // 4. Get the possible candidates for the chosen cell.
    const candidatesToTry: number[] = [];
    for (let v = 0; v < GRID_SIZE; v++) {
        if (candidates[bestR][bestC][v]) {
            candidatesToTry.push(v);
        }
    }

    // 5. Store the current state (history checkpoint) for backtracking.
    const historyCheckpoint = history.length;
    // The propagationWorklist should be empty here, but a checkpoint provides robustness.
    const propagationWorklistCheckpoint = propagationWorklist.length;

    // 6. Try each possible candidate for the chosen cell.
    for (const val of candidatesToTry) {
        // Attempt to set the cell (bestR, bestC) to `val`.
        // `trySetCell` will add `(bestR, bestC)` to `propagationWorklist`.
        if (trySetCell(bestR, bestC, val)) {
            // If the assignment was valid, recurse to solve the rest of the puzzle.
            if (recursiveSolve()) {
                return true; // Solution found! Propagate success upwards.
            }
        }
        // If the recursive call returned false (no solution from this path) OR
        // if `trySetCell` returned false (immediate contradiction), backtrack.

        // Revert all changes made since the `historyCheckpoint`.
        while (history.length > historyCheckpoint) {
            const change = history.pop()!;
            if (change.type === 'cellSet') {
                grid[change.r][change.c] = change.oldVal; // Restore old value (-1)
            } else if (change.type === 'candidateRemoved') {
                candidates[change.r][change.c][change.val] = true; // Restore candidate
                numCandidates[change.r][change.c]++; // Increment candidate count
            }
        }
        // Also ensure the propagation worklist is reset to its state before this guess.
        // It should normally be empty after `fullPropagate`, but this is a defensive measure.
        propagationWorklist.splice(propagationWorklistCheckpoint);
    }

    return false; // No solution found from this branch (all possibilities for bestR,bestC failed).
}

// --- CodinGame Input/Output Handling ---

// The CodinGame platform provides a global `readline()` function to read input line by line.
// We collect all 25 lines of the grid first, then process.
const inputLines: string[] = [];
let lineCount = 0;

// Loop to read 25 lines of input
while (lineCount < GRID_SIZE) {
    const line = readline(); // Reads one line from standard input
    inputLines.push(line);
    lineCount++;
}

// Solve the puzzle and print the output
const solution = solveSudoku(inputLines);
solution.forEach(line => console.log(line));