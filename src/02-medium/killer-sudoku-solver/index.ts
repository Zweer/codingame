// Global variables for the grid and cage information
// 0 represents an empty cell
let grid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0)); 
let cages: Map<string, CageInfo> = new Map();
// Lookup table to quickly get cage ID for a cell (r, c)
let cellToCageId: string[][] = Array(9).fill('').map(() => Array(9).fill(''));

interface CellCoords {
    row: number;
    col: number;
}

interface CageInfo {
    id: string;
    sum: number; // Target sum for the cage
    cells: CellCoords[]; // Coordinates of cells belonging to this cage

    // Dynamic state for backtracking:
    currentSum: number; // Current sum of numbers placed in this cage
    valuesUsed: Set<number>; // Numbers currently used in this cage (for repetition check)
    emptyCount: number; // Number of empty cells currently in this cage
}

/**
 * Checks if a given value can be placed at a specific cell (r, c)
 * according to Sudoku and Killer Sudoku rules.
 * This function does NOT modify the grid or cage state.
 * @param r Row index.
 * @param c Column index.
 * @param val Value to attempt placing.
 * @returns True if placement is valid, false otherwise.
 */
function canPlace(r: number, c: number, val: number): boolean {
    // 1. Standard Sudoku checks: Row, Column, 3x3 Block

    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (grid[r][i] === val) { // Check row
            return false;
        }
        if (grid[i][c] === val) { // Check column
            return false;
        }
    }

    // Check 3x3 block
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === val) {
                return false;
            }
        }
    }

    // 2. Killer Sudoku: Cage rules
    const cageId = cellToCageId[r][c];
    const cage = cages.get(cageId)!; // '!' asserts that cage will not be undefined

    // Check for value repetition within the cage
    if (cage.valuesUsed.has(val)) {
        return false;
    }

    // Check sum constraints
    // If placing 'val' makes the sum exceed the target
    if (cage.currentSum + val > cage.sum) {
        return false;
    }

    // If this is the last empty cell in the cage, the sum MUST match exactly.
    // `emptyCount` is the number of cells still empty *before* placing `val`.
    // So, if `emptyCount` is 1, placing `val` fills the last cell in that cage.
    if (cage.emptyCount === 1) {
        if (cage.currentSum + val !== cage.sum) {
            return false;
        }
    }

    return true;
}

/**
 * The main backtracking function to solve the Killer Sudoku puzzle.
 * Modifies the global `grid` variable.
 * @returns True if a solution is found, false otherwise.
 */
function solve(): boolean {
    // Find the next empty cell (represented by 0)
    let r = -1;
    let c = -1;

    // Iterate through the grid to find the first empty cell
    // (This can be optimized with MRV heuristic but simple scan is usually sufficient)
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === 0) {
                r = i;
                c = j;
                break;
            }
        }
        if (r !== -1) {
            break;
        }
    }

    // If no empty cell is found, the puzzle is solved
    if (r === -1) {
        return true;
    }

    // Try placing digits from 1 to 9
    for (let val = 1; val <= 9; val++) {
        if (canPlace(r, c, val)) {
            // Place the number on the grid
            grid[r][c] = val;

            // Update the state of the associated cage
            const cageId = cellToCageId[r][c];
            const cage = cages.get(cageId)!;
            cage.currentSum += val;
            cage.valuesUsed.add(val);
            cage.emptyCount--;

            // Recursively try to solve the rest of the puzzle
            if (solve()) {
                return true; // Solution found down this path
            }

            // Backtrack: If the recursive call failed, undo the placement
            grid[r][c] = 0; // Clear the cell

            // Revert the state of the associated cage
            cage.currentSum -= val;
            cage.valuesUsed.delete(val);
            cage.emptyCount++;
        }
    }

    return false; // No valid number can be placed in this cell, backtrack
}

// --- Main execution flow ---

// Read the first 9 lines (grid content and cage IDs per cell)
for (let r = 0; r < 9; r++) {
    const lineParts = readline().split(' ');
    const gridStr = lineParts[0];
    const cageIdStr = lineParts[1];

    for (let c = 0; c < 9; c++) {
        const char = gridStr[c];
        if (char !== '.') {
            grid[r][c] = parseInt(char);
        }
        const cageId = cageIdStr[c];
        cellToCageId[r][c] = cageId;

        // Initialize cage info if not already present in the map
        if (!cages.has(cageId)) {
            cages.set(cageId, { 
                id: cageId, 
                sum: 0, // Sum will be set from the 10th line
                cells: [], 
                currentSum: 0, 
                valuesUsed: new Set(), 
                emptyCount: 0 
            });
        }
        // Add current cell to the cage's list of cells
        cages.get(cageId)!.cells.push({ row: r, col: c });
    }
}

// Read the 10th line (cage sums)
const cageSumsLine = readline();
cageSumsLine.split(' ').forEach(pair => {
    const [id, valueStr] = pair.split('=');
    const sum = parseInt(valueStr);
    cages.get(id)!.sum = sum; // Assign the target sum to the respective cage
});

// Initialize the dynamic state (currentSum, valuesUsed, emptyCount) for all cages
// based on the initially pre-filled grid values.
cages.forEach(cage => {
    cage.emptyCount = cage.cells.length; // Initially assume all cells in cage are empty (relative to solver's fill process)
    for (const cell of cage.cells) {
        if (grid[cell.row][cell.col] !== 0) { // If a cell is pre-filled
            const val = grid[cell.row][cell.col];
            cage.currentSum += val;
            cage.valuesUsed.add(val);
            cage.emptyCount--; // Decrement empty count for pre-filled cells
        }
    }
});

// Start solving the puzzle
solve();

// Print the solved grid
for (let r = 0; r < 9; r++) {
    console.log(grid[r].join(''));
}