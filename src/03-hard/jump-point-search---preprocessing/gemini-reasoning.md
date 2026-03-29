The puzzle asks us to implement the preprocessing phase of the Jump Point Search Plus (JPS+) algorithm. This involves computing, for every open tile on a given grid map, the distance to the nearest wall or "jump point" in each of the eight cardinal and diagonal directions. Distances to walls are reported as negative numbers, and distances to jump points as positive numbers.

The core of this problem lies in correctly identifying "jump points" and efficiently calculating these distances. The problem refers to a specific academic paper for the algorithm's details.

**Key Concepts and Algorithm Approach:**

1.  **Grid Representation:** The map is a 2D grid of characters (`.` for open, `#` for wall). We use `mapGrid[row][col]` for consistency. Coordinates `(column, row)` are used in input/output.

2.  **Eight Directions:** JPS uses 8-directional movement (N, NE, E, SE, S, SW, W, NW). Each direction is represented by a `(dr, dc)` pair (row change, column change).

3.  **Diagonal Movement Constraint:** A crucial rule is that diagonal movement (e.g., NE from `(r,c)` to `(r-1, c+1)`) is only possible if both cardinal neighbors (`(r-1, c)` and `(r, c+1)`) are open. This rule is fundamental for JPS but applies to *traversability*, not directly to the definition of a forced neighbor. The `isValid` function for checking if a cell is open simply checks its own `.` status and bounds, without considering the diagonal constraint, as the forced neighbor conditions implicitly rely on certain cardinal cells being blocked to "force" a diagonal path.

4.  **Jump Point Definition (Preprocessing Phase - Section 14.2 & 14.6 of the cited paper):**
    A cell `(currR, currC)` is a jump point (JP) if it's an open cell and one of the following conditions is met, considering the approach from `(prevR, prevC)` to `(currR, currC)`:
    *   **Cardinal Movement (`dr_move == 0` or `dc_move == 0`):**
        A forced neighbor exists if an orthogonal cell is blocked, but a diagonal cell (accessible via that orthogonal direction) is open.
        For example, if moving North (`dr_move=-1, dc_move=0`) to `(currR, currC)`:
        *   If `(currR, currC + 1)` (East of `curr`) is blocked (`#`) AND `(currR - 1, currC + 1)` (NE of `curr`) is open (`.`).
        *   OR if `(currR, currC - 1)` (West of `curr`) is blocked (`#`) AND `(currR - 1, currC - 1)` (NW of `curr`) is open (`.`).
        (Note: the diagonal (`currR-1, currC+1`) from `curr` means `(dr_move+dc_move, dr_move-dc_move)` using the movement vector's components in the formulas).

    *   **Diagonal Movement (`dr_move != 0` and `dc_move != 0`):**
        1.  **Forced neighbor condition:** An orthogonal cardinal cell (relative to `curr`) is blocked, but a diagonal cell (using that blocked cardinal's position and the other cardinal direction of movement) is open.
            For example, if moving NE (`dr_move=-1, dc_move=1`) to `(currR, currC)`:
            *   If `(currR, currC - dc_move)` (i.e., `(currR, currC - 1)`, which is West of `curr`) is blocked (`#`) AND `(currR + dr_move, currC - dc_move)` (i.e., `(currR - 1, currC - 1)`, which is NW of `curr`) is open (`.`).
            *   OR if `(currR - dr_move, currC)` (i.e., `(currR + 1, currC)`, which is South of `curr`) is blocked (`#`) AND `(currR - dr_move, currC + dc_move)` (i.e., `(currR + 1, currC + 1)`, which is SE of `curr`) is open (`.`).
        2.  **Recursive condition:** A cardinal predecessor (the cell immediately before `curr` along either its horizontal or vertical component of the diagonal path) is itself a jump point. This requires looking up precomputed distances for cardinal directions.

5.  **Dynamic Programming (DP) for Preprocessing:**
    Instead of raycasting for each cell and direction (which would be inefficient for the recursive JP definition), a DP approach is used.
    *   We maintain a 3D `distances` array: `distances[dirIdx][row][col]`.
    *   Initialize `distances` to a `MAX_DIST` value for all open cells and `0` for all wall cells (a wall is a "pruned neighbor" at distance 0 from itself).
    *   The distances are propagated in specific scan orders (e.g., for North, scan rows from 0 to `height-1` and columns 0 to `width-1`). This ensures that `distances[dirIdx][prevR][prevC]` (where `(prevR, prevC)` is the cell immediately preceding `(row,col)` in `dirIdx`) is already computed when we need it.
    *   For each open cell `(r, c)` and each direction `dirIdx`:
        *   Get `(prevR, prevC)` (the cell `1` step opposite to `dirIdx` from `(r,c)`).
        *   If `isJumpPoint(r, c, prevR, prevC)` is true, set `distances[dirIdx][r][c] = 1`.
        *   Else if `(prevR, prevC)` is a valid open cell and its distance `distances[dirIdx][prevR][prevC]` is not `MAX_DIST`, then `distances[dirIdx][r][c] = 1 + distances[dirIdx][prevR][prevC]`.

6.  **Scan Order for DP:**
    *   **Cardinal directions (N, S, E, W) are computed first.** Their `isJumpPoint` checks only depend on direct neighbors, not recursive calls to `distances` table.
    *   **Diagonal directions (NE, SE, SW, NW) are computed second.** Their `isJumpPoint` checks can rely on the already computed cardinal distances.
    *   Specific `start/end/step` values for row and column iterations ensure that `prevR, prevC` are always processed before `r, c` for a given direction.

7.  **Output Generation:**
    For each open tile `(r,c)`:
    *   For each direction `i`, retrieve `d = distances[i][r][c]`.
    *   Calculate `(targetR, targetC)` by moving `d` steps from `(r,c)` in direction `i`.
    *   If `isBlocked(targetR, targetC)` is true, output `-d` (it's a wall).
    *   Else (it's an open cell), output `d` (it's a jump point).
    *   The `MAX_DIST` value should not appear in the output. The `isBlocked` function handles out-of-bounds cells as walls, guaranteeing a value if the ray exits the map.

Constraints: `width`, `height` <= 20. This small size makes the DP approach with two passes very efficient.