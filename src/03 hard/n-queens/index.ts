/**
 * Global variables for the N-Queens solution.
 * These are used to avoid passing large arrays through recursive calls,
 * making the recursion cleaner and potentially more efficient for execution context (though not asymptotically).
 */
let N: number; // The size of the chessboard (N x N) and number of queens.
let solutionsCount: number; // Counter for the total number of valid solutions.

// Boolean arrays to keep track of occupied columns and diagonals.
// Using boolean arrays for O(1) lookup and update.
let occupiedCols: boolean[];
let occupiedDiag1: boolean[]; // For main diagonals (row + col). Max sum is (N-1) + (N-1) = 2N-2, so size 2N-1.
let occupiedDiag2: boolean[]; // For anti-diagonals (row - col). Offset by N-1 to make indices non-negative.
                               // Range is -(N-1) to N-1. After offset, 0 to 2N-2. So size 2N-1.

/**
 * Recursive backtracking function to place queens.
 * It attempts to place a queen in the current `row`.
 *
 * @param row The current row where we are trying to place a queen.
 */
function placeQueen(row: number): void {
    // Base case: If we have successfully placed queens in all N rows (0 to N-1),
    // it means we found a valid solution.
    if (row === N) {
        solutionsCount++;
        return;
    }

    // Iterate through each column in the current `row` to find a safe spot for the queen.
    for (let col = 0; col < N; col++) {
        // Calculate the indices for the two types of diagonals.
        // Main diagonal: row + col is constant.
        const diag1Index = row + col;
        // Anti-diagonal: row - col is constant. Add N-1 as an offset to ensure index is non-negative.
        // The difference (row - col) ranges from -(N-1) to N-1.
        // Adding N-1 maps this range to 0 to 2*N-2.
        const diag2Index = row - col + (N - 1);

        // Check if the current position (row, col) is safe to place a queen.
        // It's safe if no queen is in the same column, main diagonal, or anti-diagonal.
        if (!occupiedCols[col] && !occupiedDiag1[diag1Index] && !occupiedDiag2[diag2Index]) {
            // Place the queen: Mark the column and diagonals as occupied.
            occupiedCols[col] = true;
            occupiedDiag1[diag1Index] = true;
            occupiedDiag2[diag2Index] = true;

            // Recurse to place a queen in the next row.
            placeQueen(row + 1);

            // Backtrack: After the recursive call returns (meaning all possibilities for
            // subsequent rows with the current queen placement have been explored),
            // unmark the current position. This allows exploring other placements for the
            // queen in the current row.
            occupiedCols[col] = false;
            occupiedDiag1[diag1Index] = false;
            occupiedDiag2[diag2Index] = false;
        }
    }
}

/**
 * Solves the N-Queens problem to find the total number of distinct solutions.
 *
 * @param n The size of the chessboard (N x N) and the number of queens to place.
 * @returns The total number of solutions.
 */
function solveNQueens(n: number): number {
    N = n;
    solutionsCount = 0;

    // Initialize the boolean arrays.
    // All positions are initially unoccupied.
    occupiedCols = new Array(N).fill(false);
    occupiedDiag1 = new Array(2 * N - 1).fill(false);
    occupiedDiag2 = new Array(2 * N - 1).fill(false);

    // Start the backtracking process from the first row (row 0).
    placeQueen(0);

    return solutionsCount;
}

// Read input from stdin
const n: number = parseInt(readline());

// Calculate and print the number of solutions
console.log(solveNQueens(n));