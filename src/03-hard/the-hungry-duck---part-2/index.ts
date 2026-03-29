/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

// Read W and H from the first line
const [W_str, H_str] = readline().split(' ');
const W = parseInt(W_str, 10);
const H = parseInt(H_str, 10);

// Create the lake grid to store food amounts
const lake: number[][] = [];
for (let i = 0; i < H; i++) {
    // Read each row of food amounts and parse them as numbers
    lake.push(readline().split(' ').map(Number));
}

// Create the DP table to store the maximum food collected to reach each cell
// Initialize with 0s. Use .map(() => Array(W).fill(0)) to ensure independent inner arrays.
const dp: number[][] = Array(H).fill(0).map(() => Array(W).fill(0));

// Base case: The starting cell (0,0)
dp[0][0] = lake[0][0];

// Fill the first row of the DP table
// To reach any cell (0, j) in the first row, the duck can only come from (0, j-1)
for (let j = 1; j < W; j++) {
    dp[0][j] = dp[0][j - 1] + lake[0][j];
}

// Fill the first column of the DP table
// To reach any cell (i, 0) in the first column, the duck can only come from (i-1, 0)
for (let i = 1; i < H; i++) {
    dp[i][0] = dp[i - 1][0] + lake[i][0];
}

// Fill the rest of the DP table
// For any other cell (i, j), the duck can come from (i-1, j) (down) or (i, j-1) (right)
// Choose the path that maximizes the food collected
for (let i = 1; i < H; i++) {
    for (let j = 1; j < W; j++) {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]) + lake[i][j];
    }
}

// The maximum food collected to reach the bottom-right cell (H-1, W-1)
console.log(dp[H - 1][W - 1]);