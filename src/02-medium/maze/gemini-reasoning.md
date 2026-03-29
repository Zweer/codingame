This problem asks us to find all reachable "exits" from a given starting point in a maze. An exit is defined as an empty cell (`.`) located on the border of the maze. Walls are represented by `#`. We can move horizontally or vertically to adjacent empty cells.

This is a classic graph traversal problem, where the maze cells are nodes and possible movements between adjacent empty cells are edges. Since we need to find all reachable exits, Breadth-First Search (BFS) is a suitable algorithm. BFS explores the maze layer by layer, guaranteeing that all reachable cells are visited.

**Algorithm Steps:**

1.  **Input Reading:** Read the maze dimensions (`W`, `H`), the starting coordinates (`X`, `Y`), and the maze grid itself. Store the maze as a 2D array of characters.

2.  **Data Structures:**
    *   `maze`: A `string[][]` to store the maze layout. `maze[y][x]` will access the cell at column `x` and row `y`.
    *   `visited`: A `boolean[][]` of the same dimensions as the maze, initialized to `false`. This keeps track of cells that have already been visited by the BFS, preventing infinite loops in cycles and redundant processing.
    *   `queue`: A `[number, number][]` (an array of `[x, y]` coordinate pairs) to implement the BFS queue.
    *   `exitSet`: A `Set<string>` to store the unique coordinates of found exits. Using a `Set` automatically handles duplicate exits (e.g., if an exit can be reached via multiple paths). Coordinates will be stored as strings like "X Y" to be used as set keys.

3.  **Initialization:**
    *   Add the starting coordinates `[X, Y]` to the `queue`.
    *   Mark `visited[Y][X]` as `true`.

4.  **BFS Traversal:**
    *   While the `queue` is not empty:
        *   Dequeue the current cell's coordinates `[currentX, currentY]`.
        *   **Check for Exit Condition:** If `currentX` is 0 or `W-1` (on the left or right border) OR `currentY` is 0 or `H-1` (on the top or bottom border), then `[currentX, currentY]` is an exit. Add its coordinates (as a string "X Y") to the `exitSet`.
        *   **Explore Neighbors:** Consider the four adjacent cells (up, down, left, right). For each potential neighbor `[nextX, nextY]`:
            *   **Boundary Check:** Ensure `nextX` and `nextY` are within the maze boundaries (`0 <= nextX < W` and `0 <= nextY < H`).
            *   **Wall Check:** Ensure `maze[nextY][nextX]` is an empty cell (`.`).
            *   **Visited Check:** Ensure `[nextX, nextY]` has not been `visited` yet.
            *   If all checks pass, mark `visited[nextY][nextX]` as `true` and enqueue `[nextX, nextY]`.

5.  **Output Processing:**
    *   Convert the `exitSet` into an array of `[number, number]` coordinate pairs.
    *   Sort this array of exits: primarily by `EX` (x-coordinate) in ascending order, and secondarily by `EY` (y-coordinate) in ascending order for ties in `EX`.
    *   Print the total number of exits found.
    *   Print each sorted exit's `EX EY` coordinates on a new line.

**Constraints Consideration:**
The maze dimensions `W` and `H` are small (7 to 21). This means the total number of cells is at most 21x21 = 441. A BFS algorithm will visit each cell and edge at most once, making it very efficient for these constraints.