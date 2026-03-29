/**
 * Reads a line from standard input. In CodinGame, this function is globally available.
 */
declare function readline(): string;

/**
 * Prints a line to standard output. In CodinGame, this function is globally available.
 */
declare function print(message: string): void;

// Read grid dimensions
const width: number = parseInt(readline());
const height: number = parseInt(readline());

// Store the grid
const grid: string[] = [];
for (let i = 0; i < height; i++) {
    grid.push(readline());
}

// Iterate through each cell of the grid
for (let y1 = 0; y1 < height; y1++) {
    for (let x1 = 0; x1 < width; x1++) {
        // Check if the current cell contains a power node
        if (grid[y1][x1] === '0') {
            let x2 = -1; // X-coordinate of the right neighbor
            let y2 = -1; // Y-coordinate of the right neighbor
            let x3 = -1; // X-coordinate of the bottom neighbor
            let y3 = -1; // Y-coordinate of the bottom neighbor

            // Find the closest right neighbor
            for (let x = x1 + 1; x < width; x++) {
                if (grid[y1][x] === '0') {
                    x2 = x;
                    y2 = y1;
                    break; // Found the closest one, no need to search further
                }
            }

            // Find the closest bottom neighbor
            for (let y = y1 + 1; y < height; y++) {
                if (grid[y][x1] === '0') {
                    x3 = x1;
                    y3 = y;
                    break; // Found the closest one, no need to search further
                }
            }

            // Output the coordinates of the current node and its neighbors
            print(`${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`);
        }
    }
}