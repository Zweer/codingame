The problem asks us to find an approximate solution to the Travelling Salesman Problem (TSP) using a greedy algorithm. We are given `N` cities (points) with their (x, y) coordinates. The algorithm dictates starting at the first input point, then repeatedly moving to the nearest unvisited city until all cities have been visited. Finally, the path must return to the starting city. The distance metric is Euclidean distance, and ties (same distance to multiple cities) are broken by choosing the city that appeared earliest in the original input list. The total distance should be rounded to the nearest integer.

**Algorithm Breakdown:**

1.  **Input Reading and Storage:**
    *   Read the number of points, `N`.
    *   Create an array of `Point` objects. Each `Point` will store its `x` coordinate, `y` coordinate, and its original `id` (its 0-based index in the input list). Storing the `id` is crucial for tie-breaking.

2.  **Initialization:**
    *   Initialize `totalDistance` to `0`.
    *   Create a `visited` boolean array of size `N`, initially all `false`. This tracks which cities have been visited.
    *   Set the `currentPointIndex` to `0` (the first point in the input list).
    *   Store the `startPoint` (which is `points[0]`) to calculate the final return trip.
    *   Mark `visited[currentPointIndex]` as `true`.

3.  **Greedy Path Construction (N-1 steps):**
    *   We need to visit `N-1` more cities after the initial one. So, loop `N-1` times.
    *   In each iteration:
        *   Get the `currentPoint` from `points[currentPointIndex]`.
        *   Initialize `minDistance` to `Infinity` and `nextPointIndex` to `-1`.
        *   Iterate through all `j` from `0` to `N-1`:
            *   If `points[j]` has not been `visited[j]`:
                *   Calculate the Euclidean distance between `currentPoint` and `points[j]`.
                *   If this `dist` is less than `minDistance`:
                    *   Update `minDistance = dist`.
                    *   Update `nextPointIndex = j`.
                *   **Tie-breaking:** If `dist` is *equal* to `minDistance`, we do *nothing*. Because we iterate `j` in increasing order (0, 1, 2, ...), the `nextPointIndex` will already hold the index of the city that appeared *first* in the input list among those with the minimum distance. This correctly implements the tie-breaking rule.
        *   Add `minDistance` to `totalDistance`.
        *   Update `currentPointIndex` to `nextPointIndex` (move to the chosen nearest city).
        *   Mark `visited[currentPointIndex]` as `true`.

4.  **Return to Origin:**
    *   After the loop, all cities have been visited. The `currentPointIndex` now points to the last city visited.
    *   Calculate the Euclidean distance between `points[currentPointIndex]` (the last city) and `startPoint` (the first city).
    *   Add this final distance to `totalDistance`.

5.  **Output:**
    *   Print `totalDistance` rounded to the nearest integer using `Math.round()`.

**Euclidean Distance Function:**
The distance between two points `(x1, y1)` and `(x2, y2)` is `sqrt((x2 - x1)^2 + (y2 - y1)^2)`.

**Constraints Check:**
*   `N` is small (5 to 14), so an `O(N^2)` complexity per step (finding the nearest point among remaining `N` points) for `N-1` steps, resulting in `O(N^3)` overall, is perfectly fine. `14^3 = 2744`, which is negligible.
*   Coordinates (0 to 100) ensure distances are manageable and fit within standard floating-point numbers.

**Example Walkthrough (matches the thought process in reasoning):**
The example provided in the problem description results in a path and total distance calculation that matches the expected output of 71, confirming the logic.