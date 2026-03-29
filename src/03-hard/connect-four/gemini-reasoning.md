The problem asks us to determine, for a given Connect Four grid, which columns each player (1 or 2) could drop a token into to win the game on their next turn.

**Game Rules and Constraints:**
*   The grid is 6 rows by 7 columns.
*   Tokens are '1', '2', or '.' (empty).
*   A token dropped into a column falls to the lowest empty cell.
*   A win occurs when 4 consecutive tokens of the same player are aligned horizontally, vertically, or diagonally.
*   Column indices are 0-based.
*   The grid is never full; there's always at least one playable column.

**Problem-Solving Approach:**

1.  **Parse Input Grid:** Read the 6 lines of input and store them in a 2D array (e.g., `string[][]`) for easy access. Let's define `ROWS = 6` and `COLS = 7`.

2.  **Iterate Through Possible Moves:**
    For each column `c` from 0 to `COLS - 1`:
    *   **Find Drop Position:** Determine the lowest available row `r` in column `c`. We can do this by iterating from `ROWS - 1` (bottom row) upwards to 0. If `grid[r][c]` is '.', then `(r, c)` is the position where a token would land.
    *   **Skip Full Columns:** If no empty cell is found in a column (i.e., the column is full, `grid[0][c]` is not '.'), then this column is not playable; skip to the next column.
    *   **Simulate Player 1's Move:**
        *   Place a '1' token at `grid[r][c]`.
        *   Call a helper function `checkWinAt(r, c, '1', grid)` to determine if this move creates a win for Player 1.
        *   If it's a winning move, add `c` to a list of Player 1's winning columns.
        *   **Crucially:** Revert the move by setting `grid[r][c] = '.'` to restore the grid to its original state for the next simulation.
    *   **Simulate Player 2's Move:**
        *   Place a '2' token at `grid[r][c]`.
        *   Call `checkWinAt(r, c, '2', grid)`.
        *   If it's a winning move, add `c` to a list of Player 2's winning columns.
        *   **Crucially:** Revert the move by setting `grid[r][c] = '.'`.

3.  **`checkWinAt(r, c, player, grid)` Function:**
    This function checks if placing `player`'s token at `(r, c)` creates a line of 4 for that `player`. It needs to check four directions:
    *   **Horizontal:** Check cells to the left and right of `(r, c)`.
    *   **Vertical:** Check cells above and below `(r, c)` (primarily below, as tokens fall down).
    *   **Main Diagonal (top-left to bottom-right):** Check cells along this diagonal passing through `(r, c)`.
    *   **Anti Diagonal (top-right to bottom-left):** Check cells along this diagonal passing through `(r, c)`.

    A robust way to implement `checkWinAt` is to iterate through standard direction vectors (e.g., `[0, 1]` for horizontal right, `[1, 0]` for vertical down, `[1, 1]` for down-right diagonal, `[1, -1]` for down-left diagonal). For each direction, consider all 4-token segments that include the `(r, c)` cell. For instance, if `(r, c)` is the `i`-th token in a 4-token sequence, then `i` can be 0, 1, 2, or 3. Calculate the starting cell `(startR, startC)` of this potential 4-token sequence and then check if all 4 cells in that sequence are within bounds and contain the `player`'s token.

4.  **Output Results:**
    *   Sort the collected winning column lists for Player 1 and Player 2 in ascending order.
    *   If a list is empty, print "NONE". Otherwise, print the columns separated by spaces.

**Example Walkthrough (from problem description):**
Input:
```
.......
.......
.......
.......
..222..
..111..
```
(row 4 contains `..222..`, row 5 contains `..111..`)

Let's simulate Player 1's turn:
*   **Column 0:** Lowest empty is `(5,0)`. Place '1' at `(5,0)`. `grid[5][0] = '1'`, `grid[5][1] = '.'`, `grid[5][2] = '1'`, `grid[5][3] = '1'`, `grid[5][4] = '1'`. No win. Revert.
*   **Column 1:** Lowest empty is `(5,1)`. Place '1' at `(5,1)`. `grid[5][0] = '.'`, `grid[5][1] = '1'`, `grid[5][2] = '1'`, `grid[5][3] = '1'`, `grid[5][4] = '1'`.
    Check `checkWinAt(5, 1, '1', grid)`.
    Horizontal check: Consider the sequence starting at `(5,1)`. `grid[5][1]`, `grid[5][2]`, `grid[5][3]`, `grid[5][4]` are all '1's. This is a win! Add 1 to `player1Wins`.
    Revert `grid[5][1] = '.'`.
*   ...
*   **Column 5:** Lowest empty is `(5,5)`. Place '1' at `(5,5)`. `grid[5][2] = '1'`, `grid[5][3] = '1'`, `grid[5][4] = '1'`, `grid[5][5] = '1'`.
    Check `checkWinAt(5, 5, '1', grid)`.
    Horizontal check: Consider the sequence starting at `(5,2)`. `grid[5][2]`, `grid[5][3]`, `grid[5][4]`, `grid[5][5]` are all '1's. This is a win! Add 5 to `player1Wins`.
    Revert `grid[5][5] = '.'`.

Player 1's winning columns: `[1, 5]`.
For Player 2, no winning moves are found in this specific example.

**TypeScript Code:**