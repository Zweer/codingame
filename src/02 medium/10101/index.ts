/**
 * Reads a line from standard input. In CodinGame, `readline()` is globally available.
 */
declare function readline(): string;

/**
 * Writes a value to standard output, followed by a newline. In CodinGame, `print()` is globally available,
 * but `console.log()` also works.
 */
declare function print(message: any): void;


/**
 * Counts the number of complete rows and columns in a grid.
 * A row/column is complete if all its cells are true (filled).
 * @param grid The 2D boolean array representing the grid.
 * @param W The width of the grid.
 * @param H The height of the grid.
 * @returns The total count of completed rows and columns.
 */
function countCompletedLines(grid: boolean[][], W: number, H: number): number {
    let completedCount = 0;

    // Check rows
    for (let r = 0; r < H; r++) {
        let rowIsComplete = true;
        for (let c = 0; c < W; c++) {
            if (!grid[r][c]) { // If any cell in the row is false (empty)
                rowIsComplete = false;
                break;
            }
        }
        if (rowIsComplete) {
            completedCount++;
        }
    }

    // Check columns
    for (let c = 0; c < W; c++) {
        let colIsComplete = true;
        for (let r = 0; r < H; r++) {
            if (!grid[r][c]) { // If any cell in the column is false (empty)
                colIsComplete = false;
                break;
            }
        }
        if (colIsComplete) {
            completedCount++;
        }
    }

    return completedCount;
}

// Read W and H from input
const W: number = parseInt(readline());
const H: number = parseInt(readline());

// Read the initial grid state
// Store it as a 2D boolean array: true for '#', false for '.'
const initialGrid: boolean[][] = [];
for (let i = 0; i < H; i++) {
    initialGrid.push(readline().split('').map(char => char === '#'));
}

// Initialize the maximum number of completed lines found
let maxCompletedLines = 0;

// Iterate through all possible top-left positions (r, c) for a 2x2 block
// A 2x2 block occupies cells (r,c), (r,c+1), (r+1,c), (r+1,c+1).
// So, 'r' can go up to H-2 and 'c' can go up to W-2 to ensure the block fits within bounds.
for (let r = 0; r <= H - 2; r++) {
    for (let c = 0; c <= W - 2; c++) {
        // Check if all four cells for the 2x2 block are currently empty (false)
        if (!initialGrid[r][c] &&
            !initialGrid[r][c + 1] &&
            !initialGrid[r + 1][c] &&
            !initialGrid[r + 1][c + 1]) {

            // If the spot is valid (all 4 cells are empty), simulate placing the block
            // Create a deep copy of the grid to avoid modifying the original 'initialGrid'
            // for subsequent placement simulations.
            // JSON.parse(JSON.stringify()) is a convenient way to deep copy simple arrays/objects.
            const simulatedGrid: boolean[][] = JSON.parse(JSON.stringify(initialGrid));

            // Place the 2x2 block by setting the cells to true (filled)
            simulatedGrid[r][c] = true;
            simulatedGrid[r][c + 1] = true;
            simulatedGrid[r + 1][c] = true;
            simulatedGrid[r + 1][c + 1] = true;

            // Count completed lines (rows + columns) in this simulated grid
            const currentCompletedLines = countCompletedLines(simulatedGrid, W, H);

            // Update the maximum completed lines found so far
            maxCompletedLines = Math.max(maxCompletedLines, currentCompletedLines);
        }
    }
}

// Output the maximum number of completed rows and columns.
// If no 2x2 block could be placed, maxCompletedLines will remain 0, which is the specified output for that case.
console.log(maxCompletedLines);