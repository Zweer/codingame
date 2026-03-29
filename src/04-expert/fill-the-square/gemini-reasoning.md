The problem asks us to find a sequence of "touches" on an `N x N` grid of LEDs to make all LEDs lit. When an LED at `(r, c)` is touched, its state flips, as do the states of its immediate horizontal and vertical neighbors (`(r-1, c)`, `(r+1, c)`, `(r, c-1)`, `(r, c+1)`). We are guaranteed that `3 <= N <= 15` and there is always exactly one solution. We need to output an `N x N` grid indicating which LEDs to touch (`X`) and which not to (`.`).

**Understanding the Mechanics (XOR Logic):**

This type of puzzle is often solvable using properties of XOR operations (addition modulo 2).
1.  **Order doesn't matter:** Touching LED A then LED B has the same final effect as touching LED B then LED A.
2.  **Touching twice is no-op:** Touching an LED twice reverts its state and the state of its neighbors back to what they were before the two touches. This means for each LED, we either touch it once or not at all.
3.  **Local dependencies:** The state of an LED `(r, c)` after all operations depends on its initial state and whether `(r, c)` itself, or any of its direct neighbors, were touched.

Let `initial[r][c]` be the initial state of the LED at `(r, c)` (1 for lit, 0 for unlit).
Let `press[r][c]` be 1 if we press the LED at `(r, c)`, 0 otherwise.
We want the `final[r][c]` to be 1 for all `(r, c)`.

The final state of an LED `(i, j)` can be expressed as:
`final[i][j] = initial[i][j] XOR press[i][j] XOR press[i-1][j] XOR press[i+1][j] XOR press[i][j-1] XOR press[i][j+1]` (where out-of-bounds `press` terms are ignored).
Since we want `final[i][j] = 1` for all `i, j`:
`1 = initial[i][j] XOR press[i][j] XOR press[i-1][j] XOR press[i+1][j] XOR press[i][j-1] XOR press[i][j+1]`

**The "Row-by-Row" Strategy:**

The small constraint `N <= 15` is a strong hint that a solution involving `2^N` complexity is acceptable. This often points to an approach where we guess the first row's decisions and then deduce the rest.

Consider the cell `(r-1, c)` (the cell directly above `(r, c)`). Its final state depends on `press[r-1][c]`, `press[r-2][c]`, `press[r-1][c-1]`, `press[r-1][c+1]`, and `press[r][c]`.
If we iterate through rows from `r=0` to `N-1`, and for each row, iterate through columns `c=0` to `N-1`:
When we are deciding whether to press `press[r][c]`, all `press` values for cells in rows `0` to `r-1` (and `press[r][0]` to `press[r][c-1]`) have already been determined.
Crucially, for `r > 0`, the decision for `press[r][c]` is the *only* remaining action that can affect the final state of the LED directly above it, `(r-1, c)`. All other presses that affect `(r-1, c)` (i.e., `press[r-1][c]`, `press[r-2][c]`, `press[r-1][c-1]`, `press[r-1][c+1]`) have already been set.

Therefore, for each cell `(r-1, c)` (where `r > 0`), if its current state (after all *previous* presses have been applied) is OFF, we *must* press `(r, c)` to flip it ON. If `(r-1, c)` is already ON, we *must not* press `(r, c)`, otherwise it would flip OFF.

This gives us a deterministic way to determine `press[r][c]` for `r > 0` based on the state of `(r-1, c)`.

**Algorithm Steps:**

1.  **Read Input:** Store the initial `N x N` grid as a 2D array of booleans (`true` for lit, `false` for unlit).

2.  **Iterate First Row Possibilities:**
    *   There are `2^N` ways to press the LEDs in the first row (`r=0`). Since `N <= 15`, `2^15 = 32768`, which is a manageable number of trials.
    *   We can represent each combination using a bitmask (from `0` to `2^N - 1`). If the `k`-th bit is set, it means we press `(0, k)`.

3.  **For Each First Row Combination:**
    a.  **Initialize `currentGridState` and `pressGrid`:**
        *   Create a deep copy of the `initialGrid` into `currentGridState`. This `currentGridState` will reflect the actual state of the LEDs as presses are applied.
        *   Initialize an `N x N` `pressGrid` (to store the final `X` or `.` output) with all `false`.
    b.  **Apply First Row Presses:**
        *   Based on the current `firstRowMask`, for each column `c` in row `0`:
            *   If the `c`-th bit of `firstRowMask` is `1`:
                *   Set `pressGrid[0][c] = true`.
                *   Apply the effect of pressing `(0, c)` to `currentGridState`. (This involves toggling `currentGridState[0][c]` and its neighbors).
    c.  **Propagate Downwards:**
        *   For each row `r` from `1` to `N-1`:
            *   For each column `c` from `0` to `N-1`:
                *   Check `currentGridState[r-1][c]`. This is the state of the LED directly above the current cell `(r,c)`.
                *   If `currentGridState[r-1][c]` is `false` (unlit):
                    *   We *must* press `(r, c)` to light up `(r-1, c)`.
                    *   Set `pressGrid[r][c] = true`.
                    *   Apply the effect of pressing `(r, c)` to `currentGridState`.
                *   If `currentGridState[r-1][c]` is `true` (lit):
                    *   We *must not* press `(r, c)`.
                    *   `pressGrid[r][c]` remains `false`.
                    *   No effect is applied to `currentGridState` from `(r,c)`.
    d.  **Check Final State:**
        *   After propagating through all rows, `currentGridState` represents the final state of the LEDs.
        *   Iterate through all cells `(r, c)` in `currentGridState`. If all are `true` (lit):
            *   This is the unique solution. Print the `pressGrid` in the required format and terminate the program.

**`applyPressEffect` Helper Function:**
A helper function `applyPressEffect(r, c, gridState)` will toggle the states of the LED at `(r, c)` and its valid neighbors within the `gridState` array.

**Complexity:**
*   There are `2^N` first-row combinations.
*   For each combination, we iterate `N*N` cells.
*   Applying a press effect involves toggling at most 5 cells (constant time).
*   Checking the final state involves iterating `N*N` cells.
*   Total time complexity: `O(2^N * N^2)`. For `N=15`, this is roughly `2^15 * 15^2 = 32768 * 225 = ~7.3 * 10^6` operations, which is very fast.