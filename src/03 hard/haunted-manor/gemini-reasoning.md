The problem asks us to determine the type and position of monsters in a haunted manor, represented by a grid. Some cells contain fixed mirrors (`\` or `/`), while others (`.`) are placeholders for monsters. We are given the total counts of three monster types (Vampire 'V', Zombie 'Z', Ghost 'G') and the number of monsters seen through windows on each border of the grid. The line of sight bounces off mirrors, and each monster type has specific visibility rules:
- **Vampire (V):** Seen directly, but not in a mirror.
- **Zombie (Z):** Seen both directly and in a mirror.
- **Ghost (G):** Not seen directly, but seen in a mirror.
Crucially, if a reflected line of sight crosses the same monster multiple times, it counts each time it's visible. The grid size `N` is small (1 to 7).

**Problem Analysis and Approach:**

1.  **Input Parsing:** We first parse the total monster counts, grid size, and the expected monster counts from each border window (top, bottom, left, right). We also read the initial grid, identifying fixed mirror positions and empty cells (`.`) where monsters will be placed.

2.  **Constraint Satisfaction:** The problem specifies that all `.` cells will contain one of the monsters, and the total number of `.` cells in the input grid must exactly match `vampireCount + zombieCount + ghostCount`. This simplifies the problem as we don't need to decide if a `.` cell remains empty; it must be filled. Given the small `size` constraint, this suggests a backtracking (recursive brute-force) approach.

3.  **Backtracking Strategy:**
    *   **State:** The state of our backtracking function will include:
        *   The index of the current empty cell we are trying to fill (`cellIndex`).
        *   The remaining counts of each monster type (`remainingV`, `remainingZ`, `remainingG`).
        *   The current state of the grid (`finalGrid`).
        *   The running counts of monsters seen from each window (`currentWindowCounts`).
    *   **Base Case:** If `cellIndex` equals the total number of empty cells, it means we have successfully placed all monsters. At this point, we perform a final check: ensure that `currentWindowCounts` exactly matches `expectedWindowCounts` for all windows. If they match, a solution is found.
    *   **Recursive Step:** For the empty cell at `emptyCells[cellIndex]`, we try placing each of the three monster types ('V', 'Z', 'G'), provided we still have that monster type available (`remainingX > 0`).
        *   Place the monster in `finalGrid[r][c]`.
        *   Update the `remainingX` count.
        *   **Early Pruning (Forward Checking):** This is crucial for performance. When a monster is placed at `(r,c)`, it affects the visibility counts for all light rays (windows) that pass through `(r,c)`. We update `currentWindowCounts` for all affected windows. If, for any window, its `currentWindowCounts` *exceeds* its `expectedWindowCounts`, this particular monster placement is invalid, and we immediately backtrack. This prunes large parts of the search tree.
        *   If the placement is valid so far, recursively call `solve` for `cellIndex + 1`. If the recursive call returns `true` (meaning a solution was found further down), propagate `true` upwards.
        *   **Backtracking:** After a recursive call (or if the placement was invalid due to pruning), we must undo the changes: remove the monster from `finalGrid[r][c]` (set it back to `'.'`) and revert the `currentWindowCounts` for all affected windows.

4.  **Simulating Line of Sight and Mirror Reflection:**
    *   We need to determine which cells a light ray passes through and whether the view is direct or reflected. This information is precomputed before backtracking.
    *   For each of the `4 * size` border windows:
        *   Determine its starting position (just outside the grid) and initial direction (e.g., from top, going down).
        *   Simulate the light ray's path step by step:
            *   Move to the next cell.
            *   If out of bounds, terminate the ray.
            *   If the cell contains a `.` (empty cell), record that this window's path passes through this cell, along with the current `isDirectView` status (true initially, becomes false after hitting any mirror). Since a ray can loop and cross the same cell multiple times, we record each such crossing.
            *   If the cell contains a mirror:
                *   For `\` (diagonal down mirror): A ray entering with `(dr, dc)` reflects to `(dc, dr)`.
                *   For `/` (diagonal up mirror): A ray entering with `(dr, dc)` reflects to `(-dc, -dr)`.
                *   Set `isDirectView` to `false` for all subsequent cells on this path.
    *   This precomputation populates `precomputedPathsCrossingCell[r][c]`, which is a list of `{ windowIdx, isDirect }` objects for each empty cell `(r,c)`.

5.  **Monster Visibility Rules (Helper Function `getMonsterContribution`):**
    *   `getMonsterContribution(monsterType, isDirect)` calculates `1` if the monster is visible under the given `isDirect` status, `0` otherwise.
        *   'V' (Vampire): Returns 1 if `isDirect` is true, 0 otherwise.
        *   'Z' (Zombie): Returns 1 always (visible directly or in mirror).
        *   'G' (Ghost): Returns 1 if `isDirect` is false (i.e., reflected), 0 otherwise.

This optimized backtracking with early pruning is efficient enough for `N <= 7` because `N_empty` (number of monster cells) is at most `3 * N = 21`, and the pruning significantly reduces the search space.