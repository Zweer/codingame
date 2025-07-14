/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

function solve(): void {
    const M: number = parseInt(readline()); // Number of rows
    const N: number = parseInt(readline()); // Number of columns

    // Read the grid map into a 2D array of numbers (0 for free, 1 for wall)
    const grid: number[][] = [];
    for (let i = 0; i < M; i++) {
        const rowString: string = readline();
        grid.push(rowString.split('').map(char => parseInt(char)));
    }

    // dp[r][c] will store the number of paths to reach cell (r, c) from (0, 0)
    // Initialize all values to 0
    const dp: number[][] = Array(M).fill(0).map(() => Array(N).fill(0));

    // Handle the starting cell (0, 0)
    // If the starting cell is a wall, there are 0 paths to anywhere, so the result will be 0.
    if (grid[0][0] === 1) {
        console.log(0);
        return; // No paths if the start is blocked
    } else {
        // There is 1 way to be at the starting cell itself (by simply being there)
        dp[0][0] = 1;
    }

    // Fill the first row: cells can only be reached from the left
    for (let c = 1; c < N; c++) {
        // If the current cell is not a wall (0) AND the cell to its left is reachable (dp value > 0)
        if (grid[0][c] === 0 && dp[0][c - 1] > 0) {
            // There's 1 way to reach this cell by continuing the path from the left
            dp[0][c] = 1;
        }
        // If grid[0][c] is 1 (wall), or dp[0][c-1] is 0 (left cell unreachable), dp[0][c] remains 0
    }

    // Fill the first column: cells can only be reached from above
    for (let r = 1; r < M; r++) {
        // If the current cell is not a wall (0) AND the cell above it is reachable (dp value > 0)
        if (grid[r][0] === 0 && dp[r - 1][0] > 0) {
            // There's 1 way to reach this cell by continuing the path from above
            dp[r][0] = 1;
        }
        // If grid[r][0] is 1 (wall), or dp[r-1][0] is 0 (above cell unreachable), dp[r][0] remains 0
    }

    // Fill the rest of the dp table using the recurrence relation
    // A cell (r, c) can be reached either from (r-1, c) (from above) or (r, c-1) (from left)
    for (let r = 1; r < M; r++) {
        for (let c = 1; c < N; c++) {
            if (grid[r][c] === 0) { // If the current cell is not a wall
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
            }
            // If grid[r][c] is 1 (wall), dp[r][c] remains 0 (as initialized or explicitly set)
        }
    }

    // The result is the number of paths to the bottom-right cell (M-1, N-1)
    console.log(dp[M - 1][N - 1]);
}

// Call the solve function to execute the logic
solve();