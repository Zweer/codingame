The goal of this puzzle is to find a pirate's treasure on a map. The map consists of free spaces (0) and obstacles (1). The treasure is located on a free space that is completely surrounded by obstacles. The definition of "surrounded" includes all 8 adjacent cells (horizontal, vertical, and diagonal). The puzzle specifies that for a treasure in a corner, 3 obstacles are required; for one on an edge (but not a corner), 5 obstacles; and for one inside the map, 8 obstacles. There is exactly one treasure on the map.

**Reasoning:**

1.  **Input Reading:** We first read the width `W` and height `H` of the map. Then, we read `H` lines, each representing a row of the map. Each line contains `W` space-separated '0' or '1' characters, which we parse into a 2D array of numbers.

2.  **Iterate Through Map:** Since there's only one treasure, we can iterate through every cell `(x, y)` on the map.

3.  **Check Potential Treasure:** For each cell `(x, y)`:
    *   First, check if the cell `map[y][x]` itself is a free space (`0`). If it's an obstacle (`1`), it cannot be the treasure, so we skip it.

4.  **Count Neighbors:** If `map[y][x]` is `0`, we then need to check its surroundings.
    *   We define arrays `dx` and `dy` to represent the offsets for all 8 directions: `(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)`.
    *   We initialize two counters: `validNeighborCount` and `obstacleNeighborCount`.
    *   For each of the 8 directions:
        *   Calculate the coordinates of the neighbor: `nx = x + dx[i]` and `ny = y + dy[i]`.
        *   **Boundary Check:** Verify if `(nx, ny)` is within the map boundaries (`0 <= nx < W` and `0 <= ny < H`).
        *   If the neighbor is within bounds:
            *   Increment `validNeighborCount` (because this is an existing neighbor).
            *   Check if `map[ny][nx]` is an obstacle (`1`). If it is, increment `obstacleNeighborCount`.

5.  **Identify Treasure:** The problem states "surrounded by *only* obstacles". This implies that *all* valid neighbors (those within the map boundaries) must be obstacles.
    *   Therefore, if `validNeighborCount === obstacleNeighborCount`, it means every accessible neighbor is an obstacle. Combined with the initial check that `map[y][x]` is `0`, this cell `(x, y)` is the treasure.
    *   The elegance of this approach is that `validNeighborCount` will automatically be 3 for a corner, 5 for an edge, and 8 for an inside cell, matching the specific requirements given in the puzzle description without needing separate `if` conditions for corner/edge/inside.

6.  **Output and Exit:** Once the treasure is found, print its coordinates in the format "x y" and terminate the program, as there's only one treasure.

**TypeScript Code:**