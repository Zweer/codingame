The puzzle requires identifying a simple geometric shape made of '#' characters on a 20x20 grid and outputting its name along with the coordinates of its corners. The coordinates must be sorted in ascending order of X, then Y.

**Shapes to Identify:**
*   POINT
*   LINE (horizontal, vertical, or 45-degree diagonal)
*   EMPTY TRIANGLE (right-angled, axes-aligned)
*   FILLED TRIANGLE (right-angled, axes-aligned)
*   EMPTY SQUARE
*   FILLED SQUARE
*   EMPTY RECTANGLE
*   FILLED RECTANGLE

**Constraints:**
*   Only one shape per test.
*   No ambiguous cases.

**Approach:**

1.  **Parse Input:** Read the 20 lines of 39 characters. Each character is `.` or `#`, separated by spaces. Convert this into a 2D boolean grid (e.g., `grid[y][x]` is `true` if `(x,y)` is `#`, `false` otherwise).

2.  **Collect Hash Coordinates:** Iterate through the grid and store the `(x,y)` coordinates of all '#' characters. This list will be crucial for determining the shape.

3.  **Determine Bounding Box:** Calculate `minX`, `maxX`, `minY`, `maxY` from all collected '#' coordinates. Also, compute `width = maxX - minX + 1` and `height = maxY - minY + 1`. The total number of '#' characters is `numHashes`.

4.  **Shape Identification Order:** The order of checking shapes is important to avoid misclassification. A good order is from simplest to more complex, and from more specific to more general (e.g., Square before Rectangle, Filled before Empty, Point first).

    *   **POINT:** If `numHashes` is exactly 1, it's a `POINT`.

    *   **RECTANGLE/SQUARE (Filled/Empty):**
        *   These shapes require `width > 1` and `height > 1`.
        *   Iterate through all cells `(x,y)` within the bounding box `(minX, minY)` to `(maxX, maxY)`.
        *   **Filled Rectangle/Square:** Check if `grid[y][x]` is `true` for *every* cell within the bounding box. If true, and `numHashes` equals `width * height`, it's a filled rectangle. If `width == height`, it's a square.
        *   **Empty Rectangle/Square:** Check if `grid[y][x]` is `true` for every cell on the *perimeter* of the bounding box, and `false` for every cell strictly *inside* the bounding box. If true, and `numHashes` equals `2 * (width + height) - 4`, it's an empty rectangle. If `width == height`, it's a square.

    *   **LINE:**
        *   **Horizontal Line:** If `height == 1` and `numHashes == width`. Verify all cells `(x, minY)` from `minX` to `maxX` are '#'.
        *   **Vertical Line:** If `width == 1` and `numHashes == height`. Verify all cells `(minX, y)` from `minY` to `maxY` are '#'.
        *   **Diagonal Line (45-degree):** If `width == height` and `numHashes == width`. Check for two types:
            *   Top-Left to Bottom-Right: `(x,y)` where `y - x` is constant. Verify all cells `(minX+i, minY+i)` are '#'.
            *   Top-Right to Bottom-Left: `(x,y)` where `y + x` is constant. Verify all cells `(minX+i, maxY-i)` are '#'.
        *   In all line cases, ensure only the line cells are '#'.

    *   **TRIANGLE (Filled/Empty):**
        *   The problem implies right-angled, axes-aligned triangles. There are 4 possible orientations based on where the right angle is (e.g., at `(minX, minY)`, `(maxX, minY)`, `(minX, maxY)`, `(maxX, maxY)`).
        *   For each of these 4 types, determine the hypotenuse endpoints.
        *   Define an `isInside` function: For a given `(x,y)` cell, determine if it lies inside the specific triangle shape (including its perimeter). This can be done using inequalities derived from the hypotenuse line and the legs.
        *   Define an `isOnPerimeter` function: Determine if a cell is on any of the three line segments forming the triangle's boundary.
        *   **Filled Triangle:** Iterate through all cells `(x,y)` within the shape's overall bounding box. Check if `grid[y][x]` is `true` *if and only if* `(x,y)` is `isInside` the candidate triangle. Also verify `numHashes` matches the count of `isInside` cells.
        *   **Empty Triangle:** Iterate through all cells `(x,y)` within the shape's overall bounding box. Check if `grid[y][x]` is `true` *if and only if* `(x,y)` is `isOnPerimeter` of the candidate triangle. Also verify `numHashes` matches the count of `isOnPerimeter` cells.

5.  **Output Formatting:** For all shapes, collect the corner coordinates (1 for POINT, 2 for LINE, 3 for TRIANGLE, 4 for RECTANGLE/SQUARE). Sort them first by X-coordinate, then by Y-coordinate, and format them as `(x,y)`.

**Detailed Logic for Triangle `isInside` Conditions:**
Let `W_len = maxX - minX` and `H_len = maxY - minY`. These are the lengths of the legs of the triangle.

*   **Right angle at (minX, minY):**
    `isInside` if `x >= minX && y >= minY && (W_len * (y - minY) + H_len * (x - minX) <= W_len * H_len)`
*   **Right angle at (maxX, minY):**
    `isInside` if `x <= maxX && y >= minY && (W_len * (y - minY) + H_len * (maxX - x) <= W_len * H_len)`
*   **Right angle at (minX, maxY):**
    `isInside` if `x >= minX && y <= maxY && (W_len * (maxY - y) + H_len * (x - minX) <= W_len * H_len)`
*   **Right angle at (maxX, maxY):**
    `isInside` if `x <= maxX && y <= maxY && (W_len * (maxY - y) + H_len * (maxX - x) <= W_len * H_len)`

The `onSegment` helper for triangle perimeters verifies that a point lies on the line connecting two specific points and is within their coordinate range.