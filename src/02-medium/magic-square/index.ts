/**
 * Reads a line from standard input. In CodinGame, this is provided by the environment.
 * @returns {string} The line read from input.
 */
declare function readline(): string;

/**
 * Prints a value to standard output. In CodinGame, this is provided by the environment.
 * @param {any} value The value to print.
 */
declare function print(value: any): void;

// Read the size of the square
const n: number = parseInt(readline());

// Read the grid rows and collect all numbers for initial validation
const grid: number[][] = [];
const allNumbers: number[] = [];

for (let i = 0; i < n; i++) {
    const row: number[] = readline().split(' ').map(Number);
    grid.push(row);
    // Collect all numbers from the grid into a single array
    // This makes it easier to check for distinctness and range in one go
    for (const num of row) {
        allNumbers.push(num);
    }
}

/**
 * Determines if the given square grid represents a Magic Square.
 *
 * A magic square must satisfy the following conditions:
 * 1. It's an n x n grid filled with distinct positive integers.
 * 2. The integers must be in the range [1, n*n].
 * 3. The sum of integers in each row, each column, and both main diagonals
 *    must be equal to the 'magic constant'.
 *
 * @returns {string} "MAGIC" if the square is magic, otherwise "MUGGLE".
 */
function solve(): string {
    const N_SQUARED = n * n;

    // --- 1. Check for distinct positive integers in the range [1, n*n] ---
    // Use a Set to efficiently check for distinctness.
    const seenNumbers = new Set<number>();

    for (const num of allNumbers) {
        // Check if the number is within the required range [1, n*n]
        if (num < 1 || num > N_SQUARED) {
            return "MUGGLE"; // Number is out of range
        }
        // Check if the number is already present (i.e., it's a duplicate)
        if (seenNumbers.has(num)) {
            return "MUGGLE"; // Duplicate number found
        }
        // Add the number to the set of seen numbers
        seenNumbers.add(num);
    }
    // If we reached here, all N_SQUARED numbers are distinct and within the range [1, N_SQUARED].
    // This implicitly means the set of numbers is exactly {1, 2, ..., N_SQUARED}.

    // --- 2. Calculate the magic constant ---
    // The sum of integers from 1 to N_SQUARED is N_SQUARED * (N_SQUARED + 1) / 2.
    // For an n x n magic square, this total sum is distributed evenly among n rows (or columns).
    // So, the magic constant for each row/column/diagonal is (total sum) / n.
    // magicConstant = (N_SQUARED * (N_SQUARED + 1) / 2) / n
    //               = n * n * (n*n + 1) / (2 * n)
    //               = n * (n*n + 1) / 2
    const magicConstant = (n * (N_SQUARED + 1)) / 2;

    // --- 3. Check row sums ---
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            rowSum += grid[i][j];
        }
        if (rowSum !== magicConstant) {
            return "MUGGLE";
        }
    }

    // --- 4. Check column sums ---
    for (let j = 0; j < n; j++) {
        let colSum = 0;
        for (let i = 0; i < n; i++) {
            colSum += grid[i][j];
        }
        if (colSum !== magicConstant) {
            return "MUGGLE";
        }
    }

    // --- 5. Check main diagonal sum (top-left to bottom-right) ---
    let mainDiagonalSum = 0;
    for (let i = 0; i < n; i++) {
        mainDiagonalSum += grid[i][i];
    }
    if (mainDiagonalSum !== magicConstant) {
        return "MUGGLE";
    }

    // --- 6. Check anti-diagonal sum (top-right to bottom-left) ---
    let antiDiagonalSum = 0;
    for (let i = 0; i < n; i++) {
        antiDiagonalSum += grid[i][n - 1 - i];
    }
    if (antiDiagonalSum !== magicConstant) {
        return "MUGGLE";
    }

    // If all checks pass, it's a magic square
    return "MAGIC";
}

// Print the result
print(solve());