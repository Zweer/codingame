// Read input
const inputs = readline().split(' ').map(Number);
let width = inputs[0]; // Initial width
let height = inputs[1]; // Initial height
const count = parseInt(readline()); // Number of tumbling actions

// Read the initial grid
let currentGrid: string[][] = [];
for (let i = 0; i < height; i++) {
    currentGrid.push(readline().split(''));
}

/**
 * Rotates the grid 90 degrees counter-clockwise.
 * A cell at (old_y, old_x) in an old_height x old_width grid moves to
 * (new_y, new_x) in a new_height x new_width grid.
 * Transformation: new_x = old_y, new_y = (old_width - 1) - old_x
 *
 * @param grid The input grid (rows x columns, i.e., height x width).
 * @returns The new grid after rotation (new_height x new_width).
 */
function rotateCounterClockwise(grid: string[][]): string[][] {
    const H_old = grid.length; // old height (number of rows)
    const W_old = grid[0].length; // old width (number of columns)

    // New grid dimensions after CCW 90 degree rotation
    // The old width becomes the new height, and old height becomes the new width.
    const H_new = W_old; 
    const W_new = H_old; 

    const newGrid: string[][] = Array(H_new).fill(null).map(() => Array(W_new).fill(''));

    for (let y_old = 0; y_old < H_old; y_old++) { // Iterate through old rows
        for (let x_old = 0; x_old < W_old; x_old++) { // Iterate through old columns
            // Calculate new coordinates for the cell grid[y_old][x_old]
            const new_y = (W_old - 1) - x_old;
            const new_x = y_old;
            newGrid[new_y][new_x] = grid[y_old][x_old];
        }
    }
    return newGrid;
}

/**
 * Applies gravity to the grid, moving all '#' bits to the bottom of their respective columns.
 * @param grid The input grid (rows x columns).
 * @returns A new grid with gravity applied.
 */
function applyGravity(grid: string[][]): string[][] {
    const H = grid.length; // current height
    const W = grid[0].length; // current width

    const newGrid: string[][] = Array(H).fill(null).map(() => Array(W).fill(''));

    // Apply gravity column by column
    for (let x = 0; x < W; x++) { // Iterate through each column
        let hashCount = 0;
        // Count '#' characters in the current column
        for (let y = 0; y < H; y++) {
            if (grid[y][x] === '#') {
                hashCount++;
            }
        }

        // Fill the current column in newGrid from bottom up
        // The bottom 'hashCount' cells are '#', the rest are '.'
        for (let y = H - 1; y >= 0; y--) {
            if (hashCount > 0) {
                newGrid[y][x] = '#';
                hashCount--;
            } else {
                newGrid[y][x] = '.';
            }
        }
    }
    return newGrid;
}

// Perform tumbling actions for 'count' times
for (let i = 0; i < count; i++) {
    currentGrid = rotateCounterClockwise(currentGrid);
    currentGrid = applyGravity(currentGrid);
}

// Output the final grid
for (let y = 0; y < currentGrid.length; y++) {
    console.log(currentGrid[y].join(''));
}