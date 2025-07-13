The problem asks us to find the shortest path from a starting point (Alice) to a rabbit, and then the shortest path from the rabbit back to the starting point, in a given labyrinth. The labyrinth is represented as a grid where each cell's value (in hexadecimal) encodes the presence of walls.

**1. Labyrinth Representation and Wall Decoding:**
Each cell `(x, y)` has an integer value `V`. This `V` is a sum of powers of 2, representing walls:
*   `1` (binary `0001`): Down wall
*   `2` (binary `0010`): Left wall
*   `4` (binary `0100`): Top wall
*   `8` (binary `1000`): Right wall

For example, if `V = 7` (hexadecimal), which is `4 + 2 + 1`, it means there are walls on the top, left, and down sides of the cell.

**2. Movement Rules (One-Way Doors):**
A crucial aspect mentioned is "one-way doors are not forbidden". This means moving from cell A to cell B requires checking walls in *both* A and B.
*   To move **Down** from `(x, y)` to `(x, y+1)`:
    *   Cell `(x, y)` must *not* have a down wall (`!(V(x,y) & 1)`).
    *   Cell `(x, y+1)` must *not* have a top wall (`!(V(x,y+1) & 4)`).
*   To move **Up** from `(x, y)` to `(x, y-1)`:
    *   Cell `(x, y)` must *not* have a top wall (`!(V(x,y) & 4)`).
    *   Cell `(x, y-1)` must *not* have a down wall (`!(V(x,y-1) & 1)`).
*   To move **Left** from `(x, y)` to `(x-1, y)`:
    *   Cell `(x, y)` must *not* have a left wall (`!(V(x,y) & 2)`).
    *   Cell `(x-1, y)` must *not* have a right wall (`!(V(x-1,y) & 8)`).
*   To move **Right** from `(x, y)` to `(x+1, y)`:
    *   Cell `(x, y)` must *not* have a right wall (`!(V(x,y) & 8)`).
    *   Cell `(x+1, y)` must *not* have a left wall (`!(V(x+1,y) & 2)`).

**3. Pathfinding Algorithm:**
Since we need the "shortest" path in an unweighted grid, Breadth-First Search (BFS) is the ideal algorithm. BFS explores the grid layer by layer, guaranteeing that the first time it reaches a target cell, it has found the shortest path to it (in terms of number of steps).

**4. BFS Implementation Details:**
*   A `queue` will store the cells to visit, along with their coordinates `[x, y]`.
*   A `dist` 2D array (`dist[y][x]`) will store the minimum number of steps required to reach `(x, y)` from the starting point of the current BFS. It's initialized with `-1` for unvisited cells.
*   When a cell `(currX, currY)` is dequeued, we check its four neighbors. For each valid neighbor `(nextX, nextY)`:
    *   Check if `(nextX, nextY)` is within labyrinth bounds.
    *   Check if `(nextX, nextY)` has already been visited (i.e., `dist[nextY][nextX]` is not `-1`). If it has, we ignore it because we've already found a shorter or equal path to it.
    *   Apply the wall-checking logic described above to determine if a move from `(currX, currY)` to `(nextX, nextY)` is possible.
    *   If the move is possible, update `dist[nextY][nextX] = dist[currY][currX] + 1` and enqueue `[nextX, nextY]`.
*   The BFS stops and returns `dist[targetY][targetX]` once the target cell is dequeued.

**5. Overall Logic:**
1.  Read the input: start coordinates (`xs`, `ys`), rabbit coordinates (`xr`, `yr`), labyrinth dimensions (`w`, `h`), and the labyrinth grid itself (parsing hexadecimal characters to integers).
2.  Perform the first BFS: `bfs(xs, ys, xr, yr, maze, w, h)` to find the shortest path from Alice to the Rabbit. Let this distance be `dist1`.
3.  Perform the second BFS: `bfs(xr, yr, xs, ys, maze, w, h)` to find the shortest path from the Rabbit back to Alice. Let this distance be `dist2`.
4.  Print `dist1` and `dist2`. The problem asks for the "number of cells needed", but the example output `5 5` for a 5-step path clarifies that it means the "number of steps".

The constraints `1 <= w, h <= 7` indicate a very small grid, so a BFS solution will be extremely efficient and execute almost instantly.