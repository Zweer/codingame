The problem asks us to count the number of squares that can be formed by selecting four distinct points from a given set of `N` integer coordinates. The squares are not necessarily axis-aligned.

### Reasoning

1.  **Representing Points:** The input points are integer coordinates (X, Y). To efficiently check for the existence of derived points, we can store them in two ways:
    *   An array of point objects (e.g., `{ x: number, y: number }[]`) for easy iteration.
    *   A `Set` (e.g., `Set<string>`) where each point is represented as a unique string key (e.g., `"x,y"`). This allows for O(1) average-time lookup for checking if a calculated point exists in the given set.

2.  **Strategy: Iterate Diagonal Pairs:**
    A common approach for problems involving geometric shapes defined by points is to fix a subset of points and deduce the others. For a square, we can choose two points and assume they are:
    *   Adjacent vertices (forming a side).
    *   Opposite vertices (forming a diagonal).

    The "opposite vertices" approach is often simpler for squares and rectangles because the midpoint of the diagonal is the center of the square.

    Let P1 = (x1, y1) and P2 = (x2, y2) be two points chosen from the input set. Assume they are opposite vertices of a square. Let the other two vertices be P3 = (x3, y3) and P4 = (x4, y4).

    *   The midpoint M of P1P2 is `((x1+x2)/2, (y1+y2)/2)`. This M is also the midpoint of P3P4.
    *   The vector from P1 to P2 is `V = (dx, dy) = (x2-x1, y2-y1)`.
    *   The vector P3P4 must be perpendicular to P1P2, have the same length, and share the same midpoint M.
    *   A vector perpendicular to `(dx, dy)` is `(-dy, dx)` or `(dy, -dx)`.
    *   Since P1P2 is a diagonal, its length squared is `dx^2 + dy^2`. A side length squared of the square is `(dx^2 + dy^2) / 2`.
    *   The vector from M to P3 (or P4) would be `(dx/2, dy/2)` rotated by 90 degrees. So, `(-dy/2, dx/2)` or `(dy/2, -dx/2)`.
    *   Therefore, the coordinates of P3 and P4 are:
        *   P3 = M + `(-dy/2, dx/2)` = `((x1+x2)/2 - dy/2, (y1+y2)/2 + dx/2)` = `((x1+x2-dy)/2, (y1+y2+dx)/2)`
        *   P4 = M + `(dy/2, -dx/2)` = `((x1+x2)/2 + dy/2, (y1+y2)/2 - dx/2)` = `((x1+x2+dy)/2, (y1+y2-dx)/2)`

3.  **Integer Coordinate Check:** For P3 and P4 to be valid integer coordinates (as required by the problem's input format), the numerators `(x1+x2-dy)`, `(y1+y2+dx)`, `(x1+x2+dy)`, and `(y1+y2-dx)` must all be even.
    This condition simplifies to: `(x1+x2)` and `(y1+y2)` must have the same parity.
    This is equivalent to `(x2-x1)` and `(y2-y1)` having the same parity (`dx % 2 === dy % 2`). If this condition is not met, P3 and P4 would have half-integer coordinates, so we can skip this pair.

4.  **Algorithm Steps:**
    *   Read `N` and all `N` points. Store them in a `pointList` array and a `pointSet` (for quick lookups).
    *   Initialize `squareCount = 0`.
    *   Iterate through all unique pairs of points `(P1, P2)` from `pointList`. We use nested loops: outer loop `i` from `0` to `N-1`, inner loop `j` from `i+1` to `N-1`. This ensures each pair is considered exactly once and points are distinct.
    *   For each pair `(P1, P2)`:
        *   Calculate `dx = P2.x - P1.x` and `dy = P2.y - P1.y`.
        *   Apply the parity check: `if ((P1.x + P2.x) % 2 !== (P1.y + P2.y) % 2) continue;`
        *   Calculate the candidate coordinates for P3 and P4 using the formulas derived above.
        *   Check if P3 and P4 exist in the `pointSet`.
        *   If both P3 and P4 exist, increment `squareCount`.
    *   Finally, divide `squareCount` by 2. This is because each square has two diagonals. When we pick `(P1, P2)` as the first diagonal, we find P3 and P4. When we later pick `(P3, P4)` as a diagonal (which will happen if P3 and P4 are encountered in the outer loops before or in combination with P1 and P2), we will find P1 and P2, effectively counting the same square again.

5.  **Complexity:**
    *   **Time Complexity:** The nested loops iterate `N * (N-1) / 2` times, which is O(N^2). Inside the loop, calculations are constant time, and `Set.has()` operations are O(1) on average. Total time complexity is O(N^2). Given `N <= 2000`, `N^2 = 4 * 10^6`, which is well within typical time limits (usually 1-2 seconds for 10^8 operations).
    *   **Space Complexity:** Storing `N` points in an array and a Set uses O(N) space.

### Code