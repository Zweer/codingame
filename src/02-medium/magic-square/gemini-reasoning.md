The problem asks us to determine if a given `n`x`n` square grid of numbers is a "Magic Square".

A square is considered a Magic Square if it meets the following criteria:

1.  **Dimensions**: It's an `n`x`n` grid.
2.  **Contents**: It must be filled with distinct positive integers.
3.  **Range**: These integers must specifically be in the range from `1` to `n²` (inclusive). This implies that every integer from `1` to `n²` must appear exactly once in the grid.
4.  **Constant Sums**: The sum of the integers in each row, each column, and both main diagonals (top-left to bottom-right, and top-right to bottom-left) must all be equal. This sum is called the "magic constant".

**Algorithm Breakdown:**

1.  **Input Reading**:
    *   Read the integer `n` which represents the size of the square.
    *   Read the following `n` lines, each containing `n` space-separated integers, and store them in a 2D array (matrix).
    *   Additionally, collect all numbers from the grid into a single 1D array for easier validation of their distinctness and range.

2.  **Validate Numbers (Distinctness and Range)**:
    *   Initialize `N_SQUARED = n * n`. This is the upper bound for the numbers and the total count of numbers expected.
    *   Use a `Set` (e.g., `seenNumbers`) to keep track of numbers encountered so far.
    *   Iterate through all the numbers collected from the grid:
        *   For each number `num`, check if `num < 1` or `num > N_SQUARED`. If true, the number is out of the required range, so it's a "MUGGLE".
        *   Check if `seenNumbers` already `has(num)`. If true, it's a duplicate, so it's a "MUGGLE".
        *   If it passes both checks, add `num` to `seenNumbers`.
    *   If this loop completes without returning "MUGGLE", it guarantees that all `N_SQUARED` numbers in the grid are distinct and are within the range `[1, N_SQUARED]`. This implicitly means the grid contains exactly the numbers `1, 2, ..., N_SQUARED`.

3.  **Calculate the Magic Constant**:
    *   The sum of all integers from `1` to `N_SQUARED` is given by the formula `N_SQUARED * (N_SQUARED + 1) / 2`.
    *   Since a magic square's rows (or columns) each sum to the magic constant, and there are `n` rows, the magic constant is the total sum divided by `n`.
    *   `magicConstant = (N_SQUARED * (N_SQUARED + 1) / 2) / n`.
    *   This simplifies to `n * (N_SQUARED + 1) / 2`.

4.  **Check Sums**:
    *   **Row Sums**: Iterate through each row, calculate its sum, and compare it to `magicConstant`. If any row sum doesn't match, return "MUGGLE".
    *   **Column Sums**: Iterate through each column, calculate its sum, and compare it to `magicConstant`. If any column sum doesn't match, return "MUGGLE".
    *   **Main Diagonal Sum**: Calculate the sum of elements where the row index equals the column index (`grid[i][i]`). Compare to `magicConstant`. If it doesn't match, return "MUGGLE".
    *   **Anti-Diagonal Sum**: Calculate the sum of elements where the row index plus the column index equals `n - 1` (`grid[i][n - 1 - i]`). Compare to `magicConstant`. If it doesn't match, return "MUGGLE".

5.  **Output**: If all the above checks pass, the square is indeed a magic square, so print "MAGIC".

**Example Walkthrough (n=3):**
Grid:
2 7 6
9 5 1
4 3 8

1.  `n = 3`, `N_SQUARED = 9`. `allNumbers = [2,7,6,9,5,1,4,3,8]`.
2.  **Validate Numbers**: All numbers are distinct and within `[1, 9]`. `seenNumbers` will contain `{1,2,3,4,5,6,7,8,9}`. No "MUGGLE" returned here.
3.  **Magic Constant**: `magicConstant = 3 * (9 + 1) / 2 = 3 * 10 / 2 = 15`.
4.  **Check Sums**:
    *   Rows:
        *   2+7+6 = 15 (OK)
        *   9+5+1 = 15 (OK)
        *   4+3+8 = 15 (OK)
    *   Columns:
        *   2+9+4 = 15 (OK)
        *   7+5+3 = 15 (OK)
        *   6+1+8 = 15 (OK)
    *   Main Diagonal:
        *   2+5+8 = 15 (OK)
    *   Anti-Diagonal:
        *   6+5+4 = 15 (OK)
5.  All checks pass. Output: "MAGIC".