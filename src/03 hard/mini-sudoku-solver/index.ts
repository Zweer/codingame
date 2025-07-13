// Standard input/output for CodinGame
declare function readline(): string;
// declare function print(message: any): void; // Not strictly needed as console.log is usually aliased

/**
 * Checks if placing a number `num` at `(row, col)` in the `board` is valid
 * according to Sudoku rules (row, column, and 2x2 block).
 *
 * @param board The 4x4 Sudoku grid.
 * @param row The row index (0-3).
 * @param col The column index (0-3).
 * @param num The number to check (1-4).
 * @returns True if the placement is valid, false otherwise.
 */
function isValid(board: number[][], row: number, col: number, num: number): boolean {
    // Check row: ensure `num` is not already in this row
    for (let c = 0; c < 4; c++) {
        if (board[row][c] === num) {
            return false;
        }
    }

    // Check column: ensure `num` is not already in this column
    for (let r = 0; r < 4; r++) {
        if (board[r][col] === num) {
            return false;
        }
    }

    // Check 2x2 block: ensure `num` is not already in this block
    // Calculate the top-left corner of the 2x2 block
    const startRow = Math.floor(row / 2) * 2;
    const startCol = Math.floor(col / 2) * 2;

    for (let r = startRow; r < startRow + 2; r++) {
        for (let c = startCol; c < startCol + 2; c++) {
            if (board[r][c] === num) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Solves the 4x4 Sudoku grid using a backtracking algorithm.
 * Modifies the `board` in-place to find the solution.
 *
 * @param board The 4x4 Sudoku grid (empty cells are 0).
 * @returns True if a solution is found, false otherwise (should always be true for this puzzle per constraints).
 */
function solveSudoku(board: number[][]): boolean {
    // Iterate through each cell of the board
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            // If the cell is empty (represented by 0)
            if (board[r][c] === 0) {
                // Try numbers from 1 to 4
                for (let num = 1; num <= 4; num++) {
                    // If placing `num` at `(r, c)` is valid
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num; // Place the number

                        // Recursively try to solve the rest of the board
                        if (solveSudoku(board)) {
                            return true; // If a solution is found, propagate true
                        }

                        // If the recursive call returns false, it means `num` was not the correct choice for this cell
                        // Backtrack: reset the cell to 0 and try the next number
                        board[r][c] = 0;
                    }
                }
                // If no number (1-4) works for this cell, then the current path is incorrect
                // Return false to trigger backtracking in the previous recursive call
                return false;
            }
        }
    }
    // If no empty cells are found after checking all cells, it means the board is completely filled and solved
    return true;
}

// --- Main Program Logic ---

// Read input grid from stdin
const initialGridLines: string[] = [];
for (let i = 0; i < 4; i++) {
    initialGridLines.push(readline());
}

// Convert input strings into a 2D number array
const grid: number[][] = initialGridLines.map(line =>
    line.split('').map(char => parseInt(char, 10)) // Use radix 10 for safety, though not strictly necessary for single digits
);

// Solve the sudoku puzzle
// The solveSudoku function modifies the 'grid' array in-place.
solveSudoku(grid);

// Print the solved grid to stdout
grid.forEach(row => {
    console.log(row.join(''));
});