The problem asks us to determine the orientation of dominoes (horizontal '=' or vertical '|') on a grid, given the grid's dimensions, the maximum value `n` on the dominoes, and the numbers within each cell of the grid. We are told that all unique dominoes with values from 0 to `n` appear exactly once, and there's a unique solution.

This is a classic constraint satisfaction problem that can be effectively solved using a backtracking (depth-first search) algorithm.

**Reasoning:**

1.  **Domino Definition:** A domino consists of two numbers, say `a` and `b`. All unique pairs `(a,b)` where `0 <= a <= b <= n` exist exactly once. For example, if `n=1`, the dominoes are `(0,0)`, `(0,1)`, and `(1,1)`.

2.  **Grid Representation:**
    *   We'll store the input numbers in a 2D array, `gridValues`.
    *   To keep track of which cells are already covered by a placed domino, we'll use a 2D boolean array, `covered`.
    *   To store the final solution, we'll use a 2D string array, `solution`, where each cell will eventually hold `'='` or `'|'`.
    *   To ensure each unique domino is used exactly once, we'll use a `Set` called `usedDominoes` to store the "canonical" string representation of placed dominoes (e.g., "0-1" for a 0-1 domino, ensuring "1-0" also maps to "0-1").

3.  **Backtracking Approach:**
    The core of the solution is a recursive function, `solve()`.

    *   **Base Case:** If all cells in the grid are covered (i.e., `findNextUncoveredCell()` returns `null`), it means we've successfully placed all dominoes according to the rules. In this case, `solve()` returns `true`.

    *   **Recursive Step:**
        1.  Find the next available (uncovered) cell, typically the top-leftmost one, using `findNextUncoveredCell()`. Let its coordinates be `(r, c)`.
        2.  Consider the number at `gridValues[r][c]`.
        3.  **Try placing a horizontal domino:**
            *   Check if `(r, c+1)` is within the grid boundaries and is not already covered.
            *   If yes, form the canonical key for the domino `(gridValues[r][c], gridValues[r][c+1])`.
            *   If this domino key is not in `usedDominoes`:
                *   Tentatively place the domino: Mark `(r, c)` and `(r, c+1)` as covered, set `solution[r][c]` and `solution[r][c+1]` to `'='`, and add the domino key to `usedDominoes`.
                *   Recursively call `solve()`.
                *   If the recursive call returns `true` (meaning a solution was found down this path), propagate `true` upwards.
                *   **Backtrack:** If the recursive call returns `false`, undo the tentative placement: remove the domino key from `usedDominoes`, mark cells `(r, c)` and `(r, c+1)` as uncovered, and clear their entries in `solution`.
        4.  **Try placing a vertical domino:** (Similar logic as horizontal)
            *   Check if `(r+1, c)` is within the grid boundaries and is not already covered.
            *   If yes, form the canonical key for the domino `(gridValues[r][c], gridValues[r+1][c])`.
            *   If this domino key is not in `usedDominoes`:
                *   Tentatively place the domino: Mark `(r, c)` and `(r+1, c)` as covered, set `solution[r][c]` and `solution[r+1][c]` to `'|'`, and add the domino key to `usedDominoes`.
                *   Recursively call `solve()`.
                *   If the recursive call returns `true`, propagate `true` upwards.
                *   **Backtrack:** If the recursive call returns `false`, undo the tentative placement.
        5.  If neither horizontal nor vertical placement from `(r, c)` leads to a solution, return `false`.

4.  **Helper Functions:**
    *   `getDominoKey(val1, val2)`: Returns a string `"${minVal}-${maxVal}"` to standardize domino representation.
    *   `findNextUncoveredCell()`: Iterates through the `covered` array to find the first `false` cell.

5.  **Constraints Consideration:**
    The constraints (`1 <= n <= 6`, `2 <= h, w <= 8`) are small, meaning the grid size is at most 8x8 = 64 cells. The number of unique dominoes is at most `(6+1)*(6+2)/2 = 28`. Backtracking on such small grids is typically efficient enough for CodinGame time limits, especially with the guarantee of a unique solution (which means we don't need to explore all possible paths).

**Example Walkthrough (from prompt):**
`n=1, h=2, w=3`
Grid:
`011`
`100`

1.  `solve()` starts. `findNextUncoveredCell()` returns `[0,0]`. `gridValues[0][0] = 0`.
2.  Try horizontal at `(0,0)`: `(0,0)-(0,1)` values are `0-1`. Key "0-1". Not used.
    *   Place `0-1` horizontally. `covered[0][0]=T, covered[0][1]=T`. `solution[0][0]='=', solution[0][1]='='`. `usedDominoes.add("0-1")`.
    *   Recurse `solve()`.
        *   `findNextUncoveredCell()` returns `[0,2]`. `gridValues[0][2] = 1`.
        *   Try horizontal at `(0,2)`: `(0,2)-(0,3)` is out of bounds.
        *   Try vertical at `(0,2)`: `(0,2)-(1,2)` values are `1-0`. Key "0-1". **Already used!** Cannot place.
        *   No placement for `(0,2)`. Return `false`.
    *   Backtrack: Undo horizontal `0-1` at `(0,0)`. `usedDominoes` cleared. `covered`, `solution` reset for `(0,0),(0,1)`.
3.  Try vertical at `(0,0)`: `(0,0)-(1,0)` values are `0-1`. Key "0-1". Not used.
    *   Place `0-1` vertically. `covered[0][0]=T, covered[1][0]=T`. `solution[0][0]='|', solution[1][0]='|'`. `usedDominoes.add("0-1")`.
    *   Recurse `solve()`.
        *   `findNextUncoveredCell()` returns `[0,1]`. `gridValues[0][1] = 1`.
        *   Try horizontal at `(0,1)`: `(0,1)-(0,2)` values are `1-1`. Key "1-1". Not used.
            *   Place `1-1` horizontally. `covered[0][1]=T, covered[0][2]=T`. `solution[0][1]='=', solution[0][2]='='`. `usedDominoes.add("1-1")`.
            *   Recurse `solve()`.
                *   `findNextUncoveredCell()` returns `[1,1]`. `gridValues[1][1] = 0`.
                *   Try horizontal at `(1,1)`: `(1,1)-(1,2)` values are `0-0`. Key "0-0". Not used.
                    *   Place `0-0` horizontally. `covered[1][1]=T, covered[1][2]=T`. `solution[1][1]='=', solution[1][2]='='`. `usedDominoes.add("0-0")`.
                    *   Recurse `solve()`.
                        *   `findNextUncoveredCell()` returns `null`. **All cells covered!** Return `true`.
                    *   Propagate `true`.
                *   Propagate `true`.
            *   Propagate `true`.
        *   Propagate `true`.
    *   Propagate `true`.

Solution found. The final `solution` array results in the output:
`|==`
`|==`