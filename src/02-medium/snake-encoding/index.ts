// Read N, the size of the square
const N: number = parseInt(readline());
// Read X, the number of times to encode
const X: number = parseInt(readline());

// Initialize the grid with the input text
let grid: string[][] = [];
for (let i = 0; i < N; i++) {
    const line: string = readline();
    grid.push(line.split('')); // Convert each line to an array of characters
}

/**
 * Performs one step of the snake encoding.
 * Creates a new grid based on the current one by shifting characters
 * according to the defined rules.
 *
 * @param currentGrid The N x N grid of characters to encode for this step.
 * @param N The size of the square grid.
 * @returns The new N x N encoded grid.
 */
function encode(currentGrid: string[][], N: number): string[][] {
    // Create a new grid for the encoded result.
    // Use Array.fill(null).map to ensure distinct inner arrays (rows).
    const nextGrid: string[][] = Array(N).fill(null).map(() => Array(N).fill(' '));

    // Iterate through each column to apply the encoding pattern
    for (let c = 0; c < N; c++) {
        if (c % 2 === 0) { // Even column (0, 2, 4...): Characters move upwards
            // Shift characters within this column: currentGrid[r][c] moves to nextGrid[r-1][c]
            // This loop goes from the bottom of the column up to the second row (index 1).
            for (let r = N - 1; r >= 1; r--) {
                nextGrid[r - 1][c] = currentGrid[r][c];
            }
            
            // After shifting up, the character at the top of the current column (row 0)
            // moves to the top of the next column.
            // currentGrid[0][c] moves to nextGrid[0][c+1]
            if (c < N - 1) { // Ensure there is a next column
                nextGrid[0][c + 1] = currentGrid[0][c];
            }
        } else { // Odd column (1, 3, 5...): Characters move downwards
            // Shift characters within this column: currentGrid[r][c] moves to nextGrid[r+1][c]
            // This loop goes from the top of the column down to the second-to-last row (index N-2).
            for (let r = 0; r < N - 1; r++) {
                nextGrid[r + 1][c] = currentGrid[r][c];
            }

            // After shifting down, the character at the bottom of the current column (row N-1)
            // moves to the bottom of the next column.
            // currentGrid[N-1][c] moves to nextGrid[N-1][c+1]
            if (c < N - 1) { // Ensure there is a next column
                nextGrid[N - 1][c + 1] = currentGrid[N-1][c];
            }
        }
    }

    // Special final rule: The character at the top-right corner of the original grid
    // moves to the bottom-left corner of the new grid.
    // currentGrid[0][N-1] moves to nextGrid[N-1][0]
    nextGrid[N - 1][0] = currentGrid[0][N-1];

    return nextGrid;
}

// Apply the encoding process X times
for (let i = 0; i < X; i++) {
    grid = encode(grid, N);
}

// Print the final encoded grid, row by row
for (let r = 0; r < N; r++) {
    console.log(grid[r].join('')); // Join characters in each row back into a string
}