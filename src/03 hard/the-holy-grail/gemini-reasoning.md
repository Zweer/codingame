To solve "The Holy Grail" puzzle, we need to determine when a continuous path is formed between the starting tile `(0,0)` and the Holy Grail's tile `(W-1, H-1)`. Initially, only these two tiles are visible. New tiles appear one by one, and after each new tile appears, we must check if a path now exists. The bot can only move horizontally or vertically between visible tiles. We need to output the count of new tiles that had appeared when the path was first completed.

**Reasoning:**

1.  **Grid Representation:** A 2D boolean array (`boolean[][]`) is suitable to represent the room. `visibleTiles[x][y] = true` if a tile exists at `(x,y)`, and `false` otherwise. Given the constraints `W, H <= 40`, a `40x40` grid is small enough for this approach.

2.  **Initial State:**
    *   Read `W` and `H`.
    *   Initialize `visibleTiles` with all `false`.
    *   Set `visibleTiles[0][0]` and `visibleTiles[W-1][H-1]` to `true`.
    *   Initialize a counter `newTilesCount` to `0`.

3.  **Path Detection (BFS/DFS):** After each new tile appears, we need to check for a path. A Breadth-First Search (BFS) is an efficient algorithm for finding the shortest path in an unweighted graph (like a grid).
    *   **BFS Function (`canReachTarget`):**
        *   It will take `(0,0)` as the starting point and `(W-1, H-1)` as the target.
        *   It needs its own `visited` 2D array, which must be reset for each path check to avoid carrying over `visited` states from previous checks.
        *   Use a queue to store `(x,y)` coordinates of tiles to visit.
        *   While the queue is not empty:
            *   Dequeue a tile `(x,y)`.
            *   If `(x,y)` is the target `(W-1, H-1)`, a path is found; return `true`.
            *   Otherwise, explore its four neighbors (up, down, left, right):
                *   For each neighbor `(nx, ny)`:
                    *   Check if `(nx, ny)` is within grid boundaries (`0 <= nx < W` and `0 <= ny < H`).
                    *   Check if `visibleTiles[nx][ny]` is `true` (i.e., the tile exists).
                    *   Check if `visited[nx][ny]` is `false` (i.e., not yet visited in this current BFS).
                    *   If all conditions are met, mark `visited[nx][ny] = true` and enqueue `(nx, ny)`.
        *   If the queue becomes empty and the target was not reached, return `false`.

4.  **Main Loop:**
    *   Enter a `while (true)` loop to continuously read new tile coordinates.
    *   For each line of input:
        *   Parse `tileX` and `tileY`.
        *   Increment `newTilesCount`.
        *   Set `visibleTiles[tileX][tileY] = true`.
        *   Call `canReachTarget()`.
        *   If `canReachTarget()` returns `true`, then the path is complete. Print `newTilesCount` and `break` the loop (terminate the program).

**Example Walkthrough (re-verified from problem description):**
Input:
```
3 3
0 1
0 2
1 2
...
```
*   `W=3, H=3`. Start: `(0,0)`. Target: `(2,2)`.
*   Initially: `visibleTiles` has `(0,0)` and `(2,2)`. `newTilesCount = 0`. `canReachTarget()` returns `false`.
*   1. Read `0 1`. `newTilesCount = 1`. `visibleTiles[0][1] = true`. `canReachTarget()` returns `false`.
*   2. Read `0 2`. `newTilesCount = 2`. `visibleTiles[0][2] = true`. `canReachTarget()` returns `false`.
*   3. Read `1 2`. `newTilesCount = 3`. `visibleTiles[1][2] = true`. Now, `canReachTarget()` performs a BFS:
    *   `(0,0)` -> `(0,1)` (visible)
    *   `(0,1)` -> `(0,2)` (visible)
    *   `(0,2)` -> `(1,2)` (visible)
    *   `(1,2)` -> `(2,2)` (visible, target reached!)
    *   `canReachTarget()` returns `true`.
*   Output `3` and terminate. This matches the example.

**TypeScript Code Structure:**

The code will be contained within a `solve()` function. The `readline()` function is a global function provided by the CodinGame environment for input.