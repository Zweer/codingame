The puzzle requires displaying a set of given points on an ASCII graph within an orthonormal basis. The graph's elements (axes, origin, points, empty spaces) have specific ASCII characters, and there are rules for character precedence and graph dimensions.

Here's a breakdown of the solution strategy:

1.  **Read Input and Store Points**:
    *   Read `N`, the number of points.
    *   Initialize `minX`, `maxX`, `minY`, `maxY` to `0`. These variables will track the minimum and maximum coordinates, initially considering only the origin (0,0) as a reference point.
    *   Read `N` lines, each containing `x` and `y` coordinates.
    *   Store these points in a `Set` for efficient lookup later. A string format like `"${x},${y}"` is used as the key for each point in the set.
    *   For each point read, update `minX`, `maxX`, `minY`, `maxY` by comparing them with the point's coordinates. This ensures that the overall range of coordinates, including the origin and all given points, is captured.

2.  **Determine Graph Boundaries**:
    *   After processing all points, adjust the `minX`, `maxX`, `minY`, `maxY` by subtracting 1 from the minimums and adding 1 to the maximums. This expands the graph by one unit on each side, as per the problem description.

3.  **Iterate and Construct the Graph**:
    *   The graph is built row by row. Since the Y-axis typically goes up in Cartesian coordinates but printing goes top-to-bottom, we iterate `y` from `maxY` down to `minY` to form rows.
    *   For each `y` (row), iterate `x` from `minX` up to `maxX` to form columns.
    *   For each `(x, y)` coordinate pair, determine the character to display based on the following precedence rules (highest to lowest):
        *   If `(x, y)` is one of the `points` in our set, display `*`.
        *   Else if `(x, y)` is the origin `(0,0)`, display `+`.
        *   Else if `y` is `0` (on the X-axis), display `-`.
        *   Else if `x` is `0` (on the Y-axis), display `|`.
        *   Otherwise (empty cell), display `.`.
    *   Append the determined character to a `rowString`.
    *   After iterating through all `x` for a given `y`, `print` the `rowString`.

This approach ensures correct boundary calculations, proper character assignment based on precedence, and correct graph orientation for ASCII output. The constraints on `N` and coordinates are small, so this direct iteration method is highly efficient.