The problem asks us to find the minimum number of moves a chess knight needs to go from a starting point 'B' to an ending point 'E' on a given board. The board can contain obstacles marked '#', which the knight cannot land on. The board dimensions are small (up to 8x8).

This is a classic shortest path problem on an unweighted graph. For such problems, Breadth-First Search (BFS) is the optimal algorithm as it explores the graph level by level, guaranteeing that the first time the target is reached, it is via the shortest path.

**Reasoning:**

1.  **Board Representation:** The input board is given as lines of characters. We can store this as a 2D array of characters (or strings).
2.  **Start and End Points:** We need to parse the input board to find the `(row, column)` coordinates for 'B' (start) and 'E' (end).
3.  **Knight's Moves:** A knight moves in an L-shaped pattern. From a given `(r, c)` position, there are 8 possible moves:
    *   `(-2, -1), (-2, +1)`
    *   `(-1, -2), (-1, +2)`
    *   `(+1, -2), (+1, +2)`
    *   `(+2, -1), (+2, +1)`
    We can represent these as two arrays, one for row changes (`dr`) and one for column changes (`dc`).
4.  **BFS Algorithm:**
    *   **Queue:** We'll use a queue to store the states to visit. Each state will be a tuple `[row, col, distance]`, representing the current position and the number of moves taken to reach it.
    *   **Visited Set/Array:** To prevent cycles and redundant processing, we need a way to keep track of cells that have already been added to the queue (or fully processed). A 2D boolean array `visited[H][W]` is suitable for this small grid size.
    *   **Initialization:** Add the starting position `[startR, startC, 0]` to the queue and mark `visited[startR][startC]` as true.
    *   **Iteration:**
        *   Dequeue a state `[currentRow, currentCol, currentDistance]`.
        *   If `(currentRow, currentCol)` is the target 'E', we have found the shortest path. The `currentDistance` is our answer. Break the loop.
        *   Otherwise, for each of the 8 possible knight moves:
            *   Calculate the `nextRow` and `nextCol`.
            *   **Validity Checks:**
                *   Is `(nextRow, nextCol)` within the board boundaries?
                *   Has `(nextRow, nextCol)` not been `visited` yet?
                *   Is `board[nextRow][nextCol]` not an obstacle ('#')? (The problem states we cannot *land* on '#', but can "go over" them, which means '#' only blocks the destination square, not intermediate path parts for a jumping piece like a knight).
            *   If all checks pass, mark `visited[nextRow][nextCol]` as true and enqueue `[nextRow, nextCol, currentDistance + 1]`.
    *   **No Path:** If the queue becomes empty and the target 'E' was never reached, it means 'E' is unreachable. In this case, output "Impossible".

**Time and Space Complexity:**
*   **Time:** O(W * H) because each cell on the board is visited and processed at most once. For each cell, we check 8 constant-time moves. Given W, H <= 8, this is extremely efficient (max 64 cells).
*   **Space:** O(W * H) for storing the board, the `visited` array, and the queue (which in the worst case might hold all reachable cells). This is also well within limits for W, H <= 8.

**Code Structure:**

1.  Read `W` and `H`.
2.  Read board rows and populate a 2D array, simultaneously finding `startR, startC, endR, endC`.
3.  Initialize `queue` and `visited` array.
4.  Perform BFS as described above.
5.  Print the result or "Impossible".