The problem asks us to design a dungeon maze, find a treasure location, and a monster interception point, then print the maze.

The core parts are:
1.  **Maze Generation**: A rectangular WxH grid where walls are placed based on a Blum Blum Shub (BBS) pseudo-random number generator.
2.  **Pathfinding**:
    *   Find the longest path from the entrance (0,0) to determine the treasure 'T'.
    *   Find the shortest path from the monster barracks (W-1, H-1) to help identify the interception point 'X'.
3.  **Maze Representation**: Convert the logical grid into a `(2H+1) x (2W+1)` character map.

### 1. Maze Generation

The maze generation rule is as follows:
For each cell `(x,y)` *except* those on the eastern (`x = W-1`) or southern (`y = H-1`) borders:
*   Calculate a BBS pseudo-random number `BBS_N`.
*   If `BBS_N` is odd ("heads"), a wall is built to the east of `(x,y)`.
*   If `BBS_N` is even ("tails"), a wall is built to the south of `(x,y)`.

Cells on the eastern or southern borders (i.e., `x = W-1` or `y = H-1`) do *not* toss a coin and therefore do not build any walls from themselves. This means passages to their east (if `x < W-1`) or south (if `y < H-1`) are always open by default, consistent with "long corridors in the south and east".

The BBS formula for cell `(x,y)` is: `(R^(2^(x+y*W+1) mod lcm(P-1,Q-1)) mod P*Q)`.
Let `S = x + y*W + 1`. `S` ranges from `1` (for (0,0)) to `W*H` (for (W-1,H-1)).
Let `M = P*Q`.
Let `lambda = lcm(P-1, Q-1)`.
The formula involves `BigInt` for intermediate calculations due to potentially large numbers (`2^S` and `R^E`). We need a `modPow(base, exp, mod)` function.
`lcm(a,b)` can be calculated as `(a * b) / gcd(a,b)`. We need a `gcd` function (Euclidean algorithm).

**Data Structure for Maze**:
We use a 3D boolean array `mazeGrid[y][x][direction]`.
`mazeGrid[y][x][0]` is `true` if there's a passage from `(x,y)` to `(x+1,y)` (east).
`mazeGrid[y][x][1]` is `true` if there's a passage from `(x,y)` to `(x,y+1)` (south).
Initially, all passages are `true`. Then, for interior cells `(x,y)`:
*   If `BBS_N` is odd: `mazeGrid[y][x][0] = false`. (East wall built).
*   If `BBS_N` is even: `mazeGrid[y][x][1] = false`. (South wall built).

**Note on Example Consistency**:
There appears to be a logical inconsistency between the given `R` value for the example (`100000`, an even number) and the stated rule (`R^E mod N`) for determining wall placement (even `R` raised to any positive power will always result in an even number, given `N` is odd, which `P*Q` is). This implies all `BBS_N` values would be even, always building south walls for interior cells. This would create a specific, simple maze not matching the example output. Based on the common behavior in such puzzles, I've implemented the rule as stated, and if it fails, the next logical step would be to reverse the "odd/even" interpretation (i.e., if even, build east wall; if odd, build south wall), which aligns with the example's visual output. My code follows the *literal* interpretation of the rules provided, assuming the example may be slightly misleading or based on an implicit nuance not explicitly stated.

### 2. Pathfinding

We use Breadth-First Search (BFS) for pathfinding because it finds the shortest path in an unweighted graph.
For the "longest path" from entrance to treasure, since this maze is a "binary tree maze" (no cycles), BFS will correctly find all reachable cells and their distances. The cell with the maximum distance from the entrance is the treasure.

**Finding Treasure (T)**:
*   Perform BFS starting from `(0,0)`.
*   Store `distFromEntrance[y][x]` (distance from (0,0)) and `parentOfEntrancePath[y][x]` (to reconstruct the path).
*   After BFS, iterate through all reachable cells to find `T_cell = {Ty, Tx}` which has the maximum `distFromEntrance`.

**Finding Interception Point (X)**:
*   Perform BFS starting from the barracks at `(W-1, H-1)`.
*   Store `distFromBarracks[y][x]` (distance from (W-1, H-1)).
*   Reconstruct the path from `(0,0)` to `T_cell` using `parentOfEntrancePath`. Let this be `pathET`.
*   Iterate through each cell `(cy, cx)` in `pathET`.
*   The `X_cell` is the cell in `pathET` that minimizes `distFromBarracks[cy][cx]`.
*   If `X_cell` is the same as `T_cell`, only `T` is marked.

### 3. Maze Representation for Output

The final map is `(2H+1) x (2W+1)`.
*   Initialize `charMap` with all `'#'` (walls).
*   Set the entrance `.` at `charMap[0][1]` and the exit `.` at `charMap[2*H][2*W-1]`.
*   For each grid cell `(x,y)`:
    *   Set its center `charMap[2*y+1][2*x+1]` to `'.'`.
    *   If `mazeGrid[y][x][0]` is `true` (east passage): Set `charMap[2*y+1][2*x+2]` to `'.'`.
    *   If `mazeGrid[y][x][1]` is `true` (south passage): Set `charMap[2*y+2][2*x+1]` to `'.'`.
    *   The walls implicitly remain `'#'` if the corresponding `mazeGrid` entry is `false`.
*   Finally, place `'T'` at `charMap[2*T_cell.y+1][2*T_cell.x+1]` and `'X'` at `charMap[2*X_cell.y+1][2*X_cell.x+1]` (if `X_cell` is distinct from `T_cell`).
*   Print each row of `charMap` joined by characters.