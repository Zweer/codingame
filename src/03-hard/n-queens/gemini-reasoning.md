The N-Queens puzzle is a classic problem in computer science that involves placing `n` non-attacking queens on an `n x n` chessboard. A queen can attack any piece in the same row, column, or diagonal. The goal is to find the total number of distinct ways to place `n` queens so that no two queens threaten each other.

This problem is typically solved using a backtracking algorithm.

**Reasoning:**

1.  **Problem Simplification:** Since no two queens can share the same row, we can assume that each queen will occupy a unique row. This allows us to place queens row by row, starting from the first row (row 0).

2.  **Backtracking Approach:**
    *   We use a recursive function, let's call it `placeQueen(row)`, which attempts to place a queen in the given `row`.
    *   **Base Case:** If `row` becomes equal to `n` (meaning we have successfully placed queens in all `n` rows from `0` to `n-1`), we have found a valid solution. We increment a global counter for solutions and return.
    *   **Recursive Step:** For the current `row`, we iterate through each `col` from `0` to `n-1`. For each `(row, col)` position:
        *   **Check Safety:** We need to determine if placing a queen at `(row, col)` is safe. This means checking if any other queen already placed (in previous rows) attacks this position. A position is safe if:
            *   No queen is in the same `col`.
            *   No queen is in the same main diagonal (`row + col` is constant for main diagonals).
            *   No queen is in the same anti-diagonal (`row - col` is constant for anti-diagonals).
        *   **If Safe:**
            *   We "place" the queen by marking its `col`, `row + col` diagonal, and `row - col` anti-diagonal as occupied.
            *   We then recursively call `placeQueen(row + 1)` to try and place a queen in the next row.
            *   **Backtrack:** After the recursive call returns (meaning all possibilities stemming from this placement have been explored), we "unplace" the queen by unmarking the `col` and diagonals. This is crucial for backtracking, allowing us to explore other column choices for the current `row`.

3.  **Data Structures for Checking Safety:**
    To efficiently check if a `col` or `diagonal` is occupied, we use boolean arrays:
    *   `occupiedCols[col]`: A boolean array of size `n` to track occupied columns. `occupiedCols[c]` is `true` if column `c` is taken.
    *   `occupiedDiag1[row + col]`: A boolean array to track main diagonals. The sum `row + col` ranges from `0` (for `(0,0)`) to `2*n - 2` (for `(n-1, n-1)`). So, its size should be `2*n - 1`.
    *   `occupiedDiag2[row - col + (n - 1)]`: A boolean array to track anti-diagonals. The difference `row - col` ranges from `-(n-1)` (for `(0, n-1)`) to `n-1` (for `(n-1, 0)`). To map these to non-negative array indices, we add an offset of `n-1`. This maps the range to `0` to `2*n - 2`. So, its size should also be `2*n - 1`.

4.  **Constraints (1 <= n <= 11):** The small constraint on `n` means that a direct backtracking approach will be efficient enough to pass within typical time limits. The number of solutions grows quite fast, but for `n=11`, the maximum number of solutions is 2680, which is manageable.

**TypeScript Implementation Details:**

*   Global variables (`N`, `solutionsCount`, `occupiedCols`, `occupiedDiag1`, `occupiedDiag2`) are used to simplify passing state through recursive calls, which is a common practice in competitive programming for cleaner code.
*   The main `solveNQueens` function initializes these global variables and then kicks off the `placeQueen` recursion from `row = 0`.
*   `readline()` is used to read input and `console.log()` to print the final result, as is customary in CodinGame.