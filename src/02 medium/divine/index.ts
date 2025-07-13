// Define board dimensions as constants
const ROWS = 9;
const COLS = 9;

// Global array to store the game board
const board: number[][] = [];

// Array to store valid swap results as strings "row1 col1 row2 col2"
const results: string[] = [];

/**
 * Checks if a match of 3 or more identical tokens exists at the given position (r, c).
 * This function checks horizontal and vertical alignments centered around (r, c)
 * or including (r,c) as part of a line.
 *
 * @param r The row of the token to check.
 * @param c The column of the token to check.
 * @returns True if a match is found, false otherwise.
 */
function checkMatchAtPosition(r: number, c: number): boolean {
    // Get the value of the token at the current position
    const value = board[r][c];

    // --- Check horizontal match ---
    let horizontalCount = 1;
    // Count identical tokens to the left
    for (let k = c - 1; k >= 0; k--) {
        if (board[r][k] === value) {
            horizontalCount++;
        } else {
            break; // Stop if a different token is encountered
        }
    }
    // Count identical tokens to the right
    for (let k = c + 1; k < COLS; k++) {
        if (board[r][k] === value) {
            horizontalCount++;
        } else {
            break; // Stop if a different token is encountered
        }
    }
    // If 3 or more identical tokens are aligned horizontally, return true
    if (horizontalCount >= 3) {
        return true;
    }

    // --- Check vertical match ---
    let verticalCount = 1;
    // Count identical tokens above
    for (let k = r - 1; k >= 0; k--) {
        if (board[k][c] === value) {
            verticalCount++;
        } else {
            break; // Stop if a different token is encountered
        }
    }
    // Count identical tokens below
    for (let k = r + 1; k < ROWS; k++) {
        if (board[k][c] === value) {
            verticalCount++;
        } else {
            break; // Stop if a different token is encountered
        }
    }
    // If 3 or more identical tokens are aligned vertically, return true
    if (verticalCount >= 3) {
        return true;
    }

    // No match found at this position
    return false;
}

/**
 * Temporarily performs a swap between two tokens, checks if a match is formed
 * at either of the new positions, and then undoes the swap.
 *
 * @param r1 The row of the first token.
 * @param c1 The column of the first token.
 * @param r2 The row of the second token.
 * @param c2 The column of the second token.
 * @returns True if a match is formed after the swap, false otherwise.
 */
function checkSwapAndMatch(r1: number, c1: number, r2: number, c2: number): boolean {
    // Perform the temporary swap using array destructuring
    [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];

    // Check if a match is formed at either of the swapped positions' new locations.
    // A relevant match must involve one of the moved tokens.
    const isMatchFormed = checkMatchAtPosition(r1, c1) || checkMatchAtPosition(r2, c2);

    // Undo the swap to restore the board to its original state for subsequent checks
    [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];

    return isMatchFormed;
}

// --- Main Program Logic ---

// Read the input board row by row
for (let i = 0; i < ROWS; i++) {
    // readline() reads a line from standard input
    // split(' ') separates the string by spaces into an array of strings
    // map(Number) converts each string element to a number
    board.push(readline().split(' ').map(Number));
}

// Iterate through each cell of the board
for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        // --- Check swap with right neighbor ---
        // We ensure (r, c) is always the "first" coordinate (row-major order)
        // by only checking (r, c+1) from (r, c).
        if (c + 1 < COLS) { // Ensure right neighbor is within board bounds
            if (checkSwapAndMatch(r, c, r, c + 1)) {
                results.push(`${r} ${c} ${r} ${c + 1}`);
            }
        }

        // --- Check swap with bottom neighbor ---
        // Similarly, we only check (r+1, c) from (r, c).
        if (r + 1 < ROWS) { // Ensure bottom neighbor is within board bounds
            if (checkSwapAndMatch(r, c, r + 1, c)) {
                results.push(`${r} ${c} ${r + 1} ${c}`);
            }
        }
    }
}

// Output the total number of valid pairs found
console.log(results.length);

// Output each valid pair on a new line
results.forEach(pair => console.log(pair));