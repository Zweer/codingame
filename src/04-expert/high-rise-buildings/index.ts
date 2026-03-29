// Define interfaces for clarity
interface Clues {
    north: number[];
    west: number[];
    east: number[];
    south: number[];
}

// Global variables for grid size, clues, and the grid itself.
// These are accessed by helper functions without explicit passing to keep signatures cleaner.
let N: number;
let clues: Clues;
let grid: number[][];

/**
 * Counts the number of visible towers from the start of a sequence.
 * Taller towers block the view of shorter towers behind them.
 * @param sequence An array of building heights.
 * @returns The count of visible towers.
 */
function countVisible(sequence: number[]): number {
    let visibleCount = 0;
    let maxSoFar = 0;
    for (let i = 0; i < N; i++) {
        if (sequence[i] > maxSoFar) {
            visibleCount++;
            maxSoFar = sequence[i];
        }
    }
    return visibleCount;
}

/**
 * Calculates the minimum and maximum possible visible towers for a partial sequence.
 * @param currentSequence A partial array of building heights (can contain 0 for unknown).
 * @param missingValues A list of numbers (1 to N) not yet used in the non-zero parts of currentSequence.
 * @returns A tuple [minVisible, maxVisible] representing the range of possible visible towers.
 */
function getMinMaxVisible(currentSequence: number[], missingValues: number[]): [min: number, max: number] {
    const numZeros = currentSequence.filter(val => val === 0).length;

    // If no zeros, the sequence is complete, just return its visible count.
    if (numZeros === 0) {
        const visible = countVisible(currentSequence);
        return [visible, visible];
    }

    // Calculate MINIMUM possible visible towers:
    // Fill zeros with missing values in descending order (largest first) to block as much as possible.
    const minSimulatedSequence = [...currentSequence];
    const minFill = [...missingValues].sort((a, b) => b - a); // Sort descending
    let minFillIdx = 0;
    for (let i = 0; i < N; i++) {
        if (minSimulatedSequence[i] === 0) {
            minSimulatedSequence[i] = minFill[minFillIdx++];
        }
    }
    const minPossible = countVisible(minSimulatedSequence);

    // Calculate MAXIMUM possible visible towers:
    // Fill zeros with missing values in ascending order (smallest first) to maximize visibility.
    const maxSimulatedSequence = [...currentSequence];
    const maxFill = [...missingValues].sort((a, b) => a - b); // Sort ascending
    let maxFillIdx = 0;
    for (let i = 0; i < N; i++) {
        if (maxSimulatedSequence[i] === 0) {
            maxSimulatedSequence[i] = maxFill[maxFillIdx++];
        }
    }
    const maxPossible = countVisible(maxSimulatedSequence);

    return [minPossible, maxPossible];
}

/**
 * Checks if placing 'val' at (r, c) is valid according to all puzzle rules.
 * This function temporarily modifies the grid for checks and restores it before returning.
 * @param r Row index.
 * @param c Column index.
 * @param val Value to place.
 * @returns True if the placement is valid, false otherwise.
 */
function isValidPlacement(r: number, c: number, val: number): boolean {
    // 1. Check uniqueness in row 'r' and column 'c'
    for (let k = 0; k < N; k++) {
        if (k !== c && grid[r][k] === val) return false; // Value already exists in row
        if (k !== r && grid[k][c] === val) return false; // Value already exists in column
    }

    // Temporarily apply the value for clue checks.
    // This allows `getMissingValues` and `getMinMaxVisible` to operate on the hypothetical state.
    const originalValue = grid[r][c];
    grid[r][c] = val;

    // Helper to get all non-zero values currently in a sequence (row or column).
    const getUsedValues = (sequence: number[]): Set<number> => {
        const used = new Set<number>();
        for (const v of sequence) {
            if (v !== 0) used.add(v);
        }
        return used;
    };

    // Helper to determine which values (1 to N) are still missing from a set of used values.
    const getMissingValuesList = (used: Set<number>): number[] => {
        const missing: number[] = [];
        for (let i = 1; i <= N; i++) {
            if (!used.has(i)) {
                missing.push(i);
            }
        }
        return missing;
    };

    let checkPassed = true; // Assume valid until a contradiction is found

    // 2. Check clue consistency for row 'r' (West & East clues)
    const rowValues = [...grid[r]]; // Get current state of row 'r'
    const rowUsedValues = getUsedValues(rowValues);
    const rowMissingValues = getMissingValuesList(rowUsedValues);

    const [minWest, maxWest] = getMinMaxVisible(rowValues, rowMissingValues);
    if (clues.west[r] < minWest || clues.west[r] > maxWest) {
        checkPassed = false;
    } else {
        const rowValuesReversed = [...rowValues].reverse(); // For East clue, reverse the sequence
        const [minEast, maxEast] = getMinMaxVisible(rowValuesReversed, rowMissingValues);
        if (clues.east[r] < minEast || clues.east[r] > maxEast) {
            checkPassed = false;
        }
    }

    // 3. Check clue consistency for column 'c' (North & South clues)
    if (checkPassed) { // Only proceed if row checks passed
        const colValues: number[] = [];
        for (let rowIdx = 0; rowIdx < N; rowIdx++) {
            colValues.push(grid[rowIdx][c]); // Build column array
        }
        const colUsedValues = getUsedValues(colValues);
        const colMissingValues = getMissingValuesList(colUsedValues);

        const [minNorth, maxNorth] = getMinMaxVisible(colValues, colMissingValues);
        if (clues.north[c] < minNorth || clues.north[c] > maxNorth) {
            checkPassed = false;
        } else {
            const colValuesReversed = [...colValues].reverse(); // For South clue, reverse the sequence
            const [minSouth, maxSouth] = getMinMaxVisible(colValuesReversed, colMissingValues);
            if (clues.south[c] < minSouth || clues.south[c] > maxSouth) {
                checkPassed = false;
            }
        }
    }

    // Restore original value in the grid before returning to avoid side effects
    grid[r][c] = originalValue;
    return checkPassed;
}

/**
 * Solves the puzzle using a backtracking algorithm.
 * @param r Current row to start searching from.
 * @param c Current column to start searching from.
 * @returns True if a solution is found, false otherwise.
 */
function solve(r: number, c: number): boolean {
    // Find the next empty cell (0 means unknown height)
    let nextR = r;
    let nextC = c;
    while (nextR < N && grid[nextR][nextC] !== 0) {
        nextC++;
        if (nextC === N) { // Move to next row
            nextC = 0;
            nextR++;
        }
    }

    // Base case: If all cells are filled, a solution is found
    if (nextR === N) {
        return true;
    }

    // Iterate through possible building heights (1 to N) for the current empty cell
    for (let val = 1; val <= N; val++) {
        if (isValidPlacement(nextR, nextC, val)) {
            grid[nextR][nextC] = val; // Tentatively place the value
            if (solve(nextR, nextC)) { // Recursively try to solve the rest of the grid
                return true; // Solution found down this path
            }
            grid[nextR][nextC] = 0; // Backtrack: remove the value and try the next one
        }
    }

    return false; // No value worked for this cell, so backtrack further up
}

/**
 * Applies initial deductions based on simple clue rules (1 and N).
 * This prunes the search space significantly before the main backtracking.
 */
function applyInitialDeductions(): void {
    let changed = true;
    while (changed) {
        changed = false;

        for (let i = 0; i < N; i++) {
            // Rule: If a clue is 1, the first tower from that direction must be N (the tallest)
            // North (top-most row, column i)
            if (clues.north[i] === 1 && grid[0][i] === 0) {
                if (isValidPlacement(0, i, N)) {
                    grid[0][i] = N;
                    changed = true;
                }
            }
            // West (left-most column, row i)
            if (clues.west[i] === 1 && grid[i][0] === 0) {
                if (isValidPlacement(i, 0, N)) {
                    grid[i][0] = N;
                    changed = true;
                }
            }
            // East (right-most column, row i)
            if (clues.east[i] === 1 && grid[i][N - 1] === 0) {
                if (isValidPlacement(i, N - 1, N)) {
                    grid[i][N - 1] = N;
                    changed = true;
                }
            }
            // South (bottom-most row, column i)
            if (clues.south[i] === 1 && grid[N - 1][i] === 0) {
                if (isValidPlacement(N - 1, i, N)) {
                    grid[N - 1][i] = N;
                    changed = true;
                }
            }

            // Rule: If a clue is N, the towers must be 1, 2, ..., N in ascending order from that viewpoint
            // North (column i: buildings 1, 2, ..., N from top to bottom)
            if (clues.north[i] === N) {
                for (let r = 0; r < N; r++) {
                    if (grid[r][i] === 0) {
                        if (isValidPlacement(r, i, r + 1)) {
                            grid[r][i] = r + 1;
                            changed = true;
                        }
                    }
                }
            }
            // West (row i: buildings 1, 2, ..., N from left to right)
            if (clues.west[i] === N) {
                for (let c = 0; c < N; c++) {
                    if (grid[i][c] === 0) {
                        if (isValidPlacement(i, c, c + 1)) {
                            grid[i][c] = c + 1;
                            changed = true;
                        }
                    }
                }
            }
            // East (row i: buildings N, N-1, ..., 1 from left to right)
            if (clues.east[i] === N) {
                for (let c = 0; c < N; c++) {
                    if (grid[i][c] === 0) {
                        if (isValidPlacement(i, c, N - c)) {
                            grid[i][c] = N - c;
                            changed = true;
                        }
                    }
                }
            }
            // South (column i: buildings N, N-1, ..., 1 from top to bottom)
            if (clues.south[i] === N) {
                for (let r = 0; r < N; r++) {
                    if (grid[r][i] === 0) {
                        if (isValidPlacement(r, i, N - r)) {
                            grid[r][i] = N - r;
                            changed = true;
                        }
                    }
                }
            }
        }
    }
}

// --- Main execution flow ---

// Read input: N for grid size
N = parseInt(readline());

// Read clues
clues = {
    north: readline().split(' ').map(Number),
    west: readline().split(' ').map(Number),
    east: readline().split(' ').map(Number),
    south: readline().split(' ').map(Number),
};

// Read initial grid state
grid = [];
for (let i = 0; i < N; i++) {
    grid.push(readline().split('').map(Number));
}

// Apply initial deductions to pre-fill obvious cells and prune the search space
applyInitialDeductions();

// Start the backtracking search from cell (0, 0)
solve(0, 0);

// Output the solved grid in the required format
for (let i = 0; i < N; i++) {
    console.log(grid[i].join(' '));
}