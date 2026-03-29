The puzzle requires us to analyze a rectangular grid containing power nodes ('0') and empty cells ('.'). For each power node, we need to find its nearest power node to the right and its nearest power node to the bottom. If a neighbor does not exist in the specified direction, we output coordinates `-1 -1`.

Here's the approach:

1.  **Input Reading**: First, read the `width` and `height` of the grid. Then, read `height` lines, each representing a row of the grid. Store this grid data, for example, as an array of strings, where each string is a row. This allows easy access using `grid[y][x]`.

2.  **Iterate Through Cells**: We will use nested loops to iterate through every cell `(x, y)` in the grid, starting from `(0, 0)` up to `(width-1, height-1)`.

3.  **Identify Power Nodes**: Inside the loop, if the character at `grid[y][x]` is '0', it means we've found a power node. Let's call its coordinates `(x1, y1)`.

4.  **Find Right Neighbor**:
    *   Initialize `(x2, y2)` to `(-1, -1)`.
    *   Start a new loop from `x_temp = x1 + 1` up to `width - 1`.
    *   For each `x_temp`, check `grid[y1][x_temp]`.
    *   If `grid[y1][x_temp]` is '0', we've found the closest right neighbor. Set `x2 = x_temp` and `y2 = y1`, then `break` from this inner loop as we only need the *closest* one.

5.  **Find Bottom Neighbor**:
    *   Initialize `(x3, y3)` to `(-1, -1)`.
    *   Start a new loop from `y_temp = y1 + 1` up to `height - 1`.
    *   For each `y_temp`, check `grid[y_temp][x1]`.
    *   If `grid[y_temp][x1]` is '0', we've found the closest bottom neighbor. Set `x3 = x1` and `y3 = y_temp`, then `break` from this inner loop.

6.  **Output**: After finding both neighbors (or determining they don't exist), print the six coordinates `x1 y1 x2 y2 x3 y3` separated by spaces.

This approach ensures that:
*   Only power nodes are processed.
*   For each node, we find the *next* node in the horizontal and vertical directions, which implies the *closest* one by iterating sequentially.
*   If no neighbor is found in a direction, the default `(-1, -1)` remains, satisfying the problem's requirement.
*   Each node is processed exactly once.

The grid dimensions are small (up to 30x30), so this direct iteration method is very efficient and will run well within the given time limits.