// Define constants for grid size and character mappings
const SIZE = 16;
const BLOCK_SIZE = 4; // Sudoku block size (sqrt(SIZE))
const CHARS = 'ABCDEFGHIJKLMNOP';

// Maps for character-to-number and number-to-character conversion
const charToNum = new Map<string, number>();
const numToChar: string[] = [];

for (let i = 0; i < SIZE; i++) {
    charToNum.set(CHARS[i], i);
    numToChar.push(CHARS[i]);
}

// Global state variables for the Sudoku solver
let currentGrid: number[][]; // The mutable grid during the solving process
let rowTracker: boolean[][]; // rowTracker[row][val] is true if 'val' is present in 'row'
let colTracker: boolean[][]; // colTracker[col][val] is true if 'val' is present in 'col'
let blockTracker: boolean[][]; // blockTracker[blockIdx][val] is true if 'val' is present in 'blockIdx'
let emptyCellList: [number, number][]; // A list of all initially empty cell coordinates

/**
 * Calculates the block index for a given row and column.
 * For a 16x16 grid with 4x4 blocks:
 * Block index ranges from 0 to 15.
 *
 * @param row The row index (0-15).
 * @param col The column index (0-15).
 * @returns The block index (0-15).
 */
function getBlockIndex(row: number, col: number): number {
    return Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE + Math.floor(col / BLOCK_SIZE);
}

/**
 * Checks if a specific value can be placed at a given cell (row, col)
 * according to Sudoku rules using the current state of trackers.
 * This is an O(1) operation.
 *
 * @param row The row index.
 * @param col The column index.
 * @param val The value (0-15) to check.
 * @returns True if the placement is valid, false otherwise.
 */
function canPlace(row: number, col: number, val: number): boolean {
    const blockIdx = getBlockIndex(row, col);
    return !rowTracker[row][val] && !colTracker[col][val] && !blockTracker[blockIdx][val];
}

/**
 * Places a value at (row, col) and updates the constraint trackers.
 *
 * @param row The row index.
 * @param col The column index.
 * @param val The value (0-15) to place.
 */
function placeValue(row: number, col: number, val: number) {
    currentGrid[row][col] = val;
    const blockIdx = getBlockIndex(row, col);
    rowTracker[row][val] = true;
    colTracker[col][val] = true;
    blockTracker[blockIdx][val] = true;
}

/**
 * Removes a value from (row, col) (backtracking step) and updates the constraint trackers.
 *
 * @param row The row index.
 * @param col The column index.
 * @param val The value (0-15) to remove.
 */
function removeValue(row: number, col: number, val: number) {
    currentGrid[row][col] = -1; // -1 signifies empty cell
    const blockIdx = getBlockIndex(row, col);
    rowTracker[row][val] = false;
    colTracker[col][val] = false;
    blockTracker[blockIdx][val] = false;
}

/**
 * Finds the next empty cell to fill using the Minimum Remaining Values (MRV) heuristic.
 * It iterates through all initially empty cells and finds the one that currently has
 * the fewest possible valid values.
 *
 * @returns An array [row, col] of the best cell, or null if no empty cells are found.
 */
function findNextEmptyCellMRV(): [number, number] | null {
    let bestCell: [number, number] | null = null;
    let minPossible = SIZE + 1; // Initialize with a value greater than any possible count (0-16)

    // Iterate through the pre-populated list of empty cells
    for (const [r, c] of emptyCellList) {
        if (currentGrid[r][c] === -1) { // Check if this cell is still empty (not yet filled by backtracking)
            let currentPossible = 0;
            // Count possible values for the current empty cell
            for (let v = 0; v < SIZE; v++) {
                if (canPlace(r, c, v)) {
                    currentPossible++;
                }
            }

            // If this cell has fewer possibilities than the current best, update
            if (currentPossible < minPossible) {
                minPossible = currentPossible;
                bestCell = [r, c];
            }

            // Optimization: If a cell has 0 possibilities, it means the current path
            // is invalid (a contradiction). Return this cell immediately to trigger backtracking.
            if (minPossible === 0) {
                return bestCell;
            }
        }
    }
    return bestCell;
}

/**
 * The main recursive backtracking function to solve the Sudoku.
 * It implements the MRV heuristic to choose the next cell.
 *
 * @returns True if a solution is found, false otherwise.
 */
function solveSudoku(): boolean {
    const nextCell = findNextEmptyCellMRV();

    if (nextCell === null) {
        // No empty cells left, the puzzle is solved
        return true;
    }

    const [r, c] = nextCell;

    // Collect all valid candidate values for the chosen cell
    // This is done dynamically for the specific cell chosen by MRV.
    const candidates: number[] = [];
    for (let v = 0; v < SIZE; v++) {
        if (canPlace(r, c, v)) {
            candidates.push(v);
        }
    }

    // Iterate through candidate values and try to place them
    for (const val of candidates) {
        placeValue(r, c, val); // Place the value

        // Recursively call solveSudoku for the next state
        if (solveSudoku()) {
            return true; // Solution found! Propagate success upwards.
        }

        removeValue(r, c, val); // Backtrack: undo the placement if it didn't lead to a solution
    }

    return false; // No value worked for this cell, trigger further backtracking.
}

// --- Main execution block for CodinGame ---

// Initialize global state arrays
currentGrid = Array(SIZE).fill(0).map(() => Array(SIZE).fill(-1));
rowTracker = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
colTracker = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
blockTracker = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
emptyCellList = [];

// Read the initial grid input from standard input
for (let r = 0; r < SIZE; r++) {
    const line = readline(); // readline() is provided by CodinGame environment
    for (let c = 0; c < SIZE; c++) {
        const char = line[c];
        if (char === '.') {
            emptyCellList.push([r, c]); // Add empty cell coordinates to the list
        } else {
            const num = charToNum.get(char)!;
            // Place initial numbers and update trackers directly
            currentGrid[r][c] = num;
            const blockIdx = getBlockIndex(r, c);
            rowTracker[r][num] = true;
            colTracker[c][num] = true;
            blockTracker[blockIdx][num] = true;
        }
    }
}

// Start the Sudoku solver
solveSudoku();

// Print the solved grid to standard output
for (let r = 0; r < SIZE; r++) {
    let rowStr = '';
    for (let c = 0; c < SIZE; c++) {
        rowStr += numToChar[currentGrid[r][c]];
    }
    console.log(rowStr);
}