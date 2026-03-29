The problem asks us to find the maximum amount of food a duck can eat while moving from the top-left corner to the bottom-right corner of a `W`x`H` grid. The duck can only move right or down. Each cell contains a certain amount of food.

This is a classic dynamic programming problem. We can define `dp[i][j]` as the maximum amount of food the duck can eat to reach the cell at row `i` and column `j`.

**Reasoning and Approach:**

1.  **Grid Representation:** We'll store the food amounts for each cell in a 2D array, let's call it `lake[H][W]`.
2.  **DP Table:** We'll create another 2D array, `dp[H][W]`, to store the maximum food collected to reach each cell.
3.  **Base Case:** The duck starts at `(0, 0)`. So, the maximum food to reach `(0, 0)` is simply the food at `(0, 0)`.
    `dp[0][0] = lake[0][0]`
4.  **First Row Initialization:** To reach any cell `(0, j)` in the first row (where `j > 0`), the duck can only come from the cell `(0, j-1)` by moving right. Thus, the maximum food to reach `(0, j)` is the sum of food collected up to `(0, j-1)` plus the food at `(0, j)`.
    `dp[0][j] = dp[0][j-1] + lake[0][j]` for `j` from `1` to `W-1`.
5.  **First Column Initialization:** Similarly, to reach any cell `(i, 0)` in the first column (where `i > 0`), the duck can only come from the cell `(i-1, 0)` by moving down.
    `dp[i][0] = dp[i-1][0] + lake[i][0]` for `i` from `1` to `H-1`.
6.  **General Case:** For any other cell `(i, j)` where `i > 0` and `j > 0`, the duck can reach it from two possible previous cells:
    *   From `(i-1, j)` (moving down)
    *   From `(i, j-1)` (moving right)
    To maximize the food eaten, the duck should choose the path that yielded the maximum food from the previous step. Therefore:
    `dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]) + lake[i][j]`
7.  **Result:** After filling the entire `dp` table, the maximum amount of food the duck can eat before reaching the bottom-right field `(H-1, W-1)` will be `dp[H-1][W-1]`.

**Time and Space Complexity:**
*   **Time Complexity:** O(W * H). We iterate through each cell of the `W`x`H` grid exactly once to compute its `dp` value. Given `W, H <= 100`, this means at most 100 * 100 = 10,000 operations, which is highly efficient.
*   **Space Complexity:** O(W * H). We use two 2D arrays: one for the `lake` (input) and one for the `dp` table.

This dynamic programming approach avoids redundant calculations and efficiently solves the problem within the given constraints.