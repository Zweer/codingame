The Hitori puzzle requires shading cells in a grid according to three main rules:
1.  **Unique Numbers:** Unshaded cells must have unique numbers in their respective rows and columns.
2.  **No Adjacent Shaded:** Shaded cells cannot touch each other horizontally or vertically.
3.  **Connectivity:** All unshaded cells must form a single, continuous area.

The grid size `N` is small (2 to 8), which makes a backtracking (recursive brute-force) approach feasible.

**Algorithm Breakdown:**

1.  **State Representation:**
    *   We'll use two global 2D arrays: `originalGrid` to store the initial puzzle numbers, and `solutionGrid` to represent the current state of our solution during the backtracking process. `solutionGrid` cells will either hold their original number (if unshaded) or an asterisk `*` (if shaded).

2.  **Backtracking Function (`backtrack(r, c)`):**
    *   This function attempts to find a solution by deciding the state (shaded or unshaded) for each cell `(r, c)` in the grid.
    *   **Base Case:** If `r` reaches `N` (meaning all cells from `(0,0)` to `(N-1, N-1)` have been assigned a state), we have a complete grid configuration. At this point, we call `isValidSolution()` to check if this configuration satisfies all three Hitori rules. If it does, we've found a solution and return `true`.
    *   **Recursive Step:** For the current cell `(r, c)`:
        *   **Option 1: Keep `(r, c)` unshaded.**
            *   We don't need to change `solutionGrid[r][c]` because it's initially filled with `originalGrid[r][c]` and will remain so unless we explicitly shade it.
            *   Recursively call `backtrack()` for the next cell (`nextR`, `nextC`). If this path leads to a solution (`true` is returned), propagate `true` upwards.
        *   **Option 2: Shade `(r, c)` (`*`).**
            *   **Pruning (Rule 2 Early Check):** Before actually shading, we check if placing an `*` at `(r, c)` would immediately violate Rule 2 (no adjacent shaded cells). We only need to check its top (`r-1, c`) and left (`r, c-1`) neighbors because these are the only cells that would have already been processed and potentially shaded. If either is `*`, this choice is invalid, and we immediately return `false` (prune this branch).
            *   If it's safe to shade, we temporarily set `solutionGrid[r][c] = '*'`.
            *   Recursively call `backtrack()` for the next cell (`nextR`, `nextC`). If this path leads to a solution, propagate `true`.
            *   **Backtrack Step:** If Option 2 did not lead to a solution, we must "undo" our choice by restoring `solutionGrid[r][c]` back to its original number (`originalGrid[r][c]`). This allows previous recursive calls to explore other possibilities cleanly.
    *   If neither option leads to a solution, return `false`.

3.  **Validation Function (`isValidSolution()`):**
    *   This function is called only when a full grid configuration is proposed by the `backtrack` function. It performs comprehensive checks for all three rules:
        *   **Rule 1 (Unique Numbers):** Iterates through each row and column. For each unshaded cell, it adds its number to a `Set`. If a number is already in the `Set`, it means a duplicate exists, and the solution is invalid (`return false`).
        *   **Rule 2 (No Adjacent Shaded):** Iterates through all cells. If a cell `(r, c)` is shaded (`*`), it checks all four of its cardinal neighbors (`(r-1,c)`, `(r+1,c)`, `(r,c-1)`, `(r,c+1)`). If any neighbor is also `*`, the solution is invalid (`return false`).
        *   **Rule 3 (Connectivity):**
            *   First, find any unshaded cell in the grid. If no unshaded cells exist (the entire grid is shaded), it's trivially considered connected (`return true`).
            *   Perform a Breadth-First Search (BFS) or Depth-First Search (DFS) starting from the found unshaded cell. During the traversal, count all reachable unshaded cells.
            *   After the traversal, count the total number of unshaded cells in the entire `solutionGrid`.
            *   If the count of reachable unshaded cells equals the total count of unshaded cells, it means all unshaded cells form a single continuous area (`return true`). Otherwise, they are disconnected (`return false`).
    *   If all three rules pass, the configuration is a valid solution (`return true`).

**TypeScript Implementation Notes:**

*   `readline()` is used to read input from `stdin`.
*   `parseInt()` converts string to integer.
*   `split('')` on a string creates an array of characters. `map(Number)` converts character digits to numbers.
*   Global variables `n`, `originalGrid`, and `solutionGrid` are used to simplify recursive function calls.