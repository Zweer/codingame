// Standard CodinGame readline function is available globally.
// In a local environment, you might need to mock it or use Node's 'readline' module.

// Read W (width) and H (height) from the first line
const [W, H] = readline().split(' ').map(Number);

// Create a 2D array to store the food amounts in the lake
const foodGrid: number[][] = [];
for (let i = 0; i < H; i++) {
    // Read each row of food amounts
    foodGrid.push(readline().split(' ').map(Number));
}

// Create a 2D DP (Dynamic Programming) table
// dp[r][c] will store the maximum food eaten to reach cell (r, c)
const dp: number[][] = Array(H).fill(0).map(() => Array(W).fill(0));

// Base case: The starting cell (0, 0)
// The maximum food to reach (0, 0) is just the food at (0, 0)
dp[0][0] = foodGrid[0][0];

// Fill the first row of the DP table
// To reach any cell in the first row (r=0, c>0), the duck can only come from its left (0, c-1)
for (let c = 1; c < W; c++) {
    dp[0][c] = foodGrid[0][c] + dp[0][c - 1];
}

// Fill the first column of the DP table
// To reach any cell in the first column (r>0, c=0), the duck can only come from above (r-1, 0)
for (let r = 1; r < H; r++) {
    dp[r][0] = foodGrid[r][0] + dp[r - 1][0];
}

// Fill the rest of the DP table
// For any other cell (r, c), the duck can come from above (r-1, c) or from the left (r, c-1)
// We choose the path that yields the maximum food
for (let r = 1; r < H; r++) {
    for (let c = 1; c < W; c++) {
        dp[r][c] = foodGrid[r][c] + Math.max(dp[r - 1][c], dp[r][c - 1]);
    }
}

// The maximum amount of food eaten before reaching the bottom-right field is stored at dp[H-1][W-1]
console.log(dp[H - 1][W - 1]);