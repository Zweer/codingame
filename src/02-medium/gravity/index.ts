/**
 * Reads a line of input from stdin.
 * In CodinGame, this is provided by the environment.
 */
declare function readline(): string;

/**
 * Prints a string to stdout, followed by a newline.
 * In CodinGame, this is often 'print()' or 'console.log()'.
 * Using console.log for standard TypeScript/Node.js compatibility.
 */
declare function console.log(message?: any, ...optionalParams: any[]): void;


function solve() {
    // Read the width and height of the grid
    const [width, height] = readline().split(' ').map(Number);

    // Initialize the grid as a 2D array of characters (strings of length 1)
    const grid: string[][] = [];
    for (let i = 0; i < height; i++) {
        // Read each row as a string and split it into an array of characters
        grid.push(readline().split(''));
    }

    // Process each column
    for (let col = 0; col < width; col++) {
        let hashCount = 0;

        // Step 1: Count the number of '#' characters in the current column
        for (let row = 0; row < height; row++) {
            if (grid[row][col] === '#') {
                hashCount++;
            }
        }

        // Step 2: Reconstruct the current column based on the hashCount
        // The bottom 'hashCount' rows will be '#', and the top 'height - hashCount' rows will be '.'
        for (let row = 0; row < height; row++) {
            // If the current row is among the top 'height - hashCount' rows, it should be '.'
            if (row < height - hashCount) {
                grid[row][col] = '.';
            } 
            // Otherwise, it's among the bottom 'hashCount' rows, so it should be '#'
            else {
                grid[row][col] = '#';
            }
        }
    }

    // Print the final modified grid
    for (let row = 0; row < height; row++) {
        // Join the characters in each row back into a single string for printing
        console.log(grid[row].join(''));
    }
}

// Call the solve function to run the puzzle logic
solve();