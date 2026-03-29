The puzzle "Shadows of the Knight - Episode 2" requires us to find a hidden bomb's location (X, Y) within a grid (building) by making a series of jumps. Unlike the first episode, we don't get direct directional feedback (UP, DOWN, LEFT, RIGHT). Instead, the device tells us if our last jump brought us `WARMER` (closer), `COLDER` (further), or `SAME` distance to the bomb. The distance is Euclidean.

**Understanding the Problem and Strategy:**

1.  **Search Space:** The building is a rectangular grid. We can define our search space using `minX`, `maxX`, `minY`, and `maxY` coordinates. Initially, this space is `[0, W-1]` for X and `[0, H-1]` for Y.

2.  **Feedback Interpretation (Euclidean Distance):**
    *   Let `(prevX, prevY)` be Batman's position *before* the last jump, and `(currX, currY)` be his position *after* the last jump (his current position).
    *   The bomb's unknown location is `(bombX, bombY)`.
    *   The squared Euclidean distance from `P1(x1, y1)` to `P2(x2, y2)` is `(x2-x1)^2 + (y2-y1)^2`. We use squared distance to avoid square roots, which is sufficient for comparisons.
    *   The set of points equidistant from `(prevX, prevY)` and `(currX, currY)` forms a perpendicular bisector line.
        *   If `WARMER`: The bomb is on the side of this bisector that contains `(currX, currY)`.
        *   If `COLDER`: The bomb is on the side of this bisector that contains `(prevX, prevY)`.
        *   If `SAME`: The bomb is exactly on this bisector line.

3.  **Simplifying for 2D Search (Independent Axes):**
    While the true geometric interpretation of `WARMER`/`COLDER` involves half-planes defined by diagonal lines, a common and effective strategy for CodinGame puzzles with `log N` constraints is to treat the X and Y dimensions as largely independent. This means updating `minX/maxX` based on horizontal movement and `minY/maxY` based on vertical movement.

    *   **Updating X-bounds:** If Batman moved horizontally (`dx = currX - prevX != 0`):
        *   Calculate the midpoint `midX_float = (prevX + currX) / 2`.
        *   If `WARMER`: The bomb is closer to `currX`. If `dx > 0` (moved right), `bombX` must be `> midX_float`. So, `minX` becomes `floor(midX_float) + 1`. If `dx < 0` (moved left), `bombX` must be `< midX_float`. So, `maxX` becomes `floor(midX_float)`.
        *   If `COLDER`: The bomb is closer to `prevX`. If `dx > 0` (moved right), `bombX` must be `< midX_float`. So, `maxX` becomes `floor(midX_float)`. If `dx < 0` (moved left), `bombX` must be `> midX_float`. So, `minX` becomes `floor(midX_float) + 1`.
        *   If `SAME`: The bomb's X-coordinate must be `midX_float`. Since coordinates are integers, if `midX_float` is `X.5`, the bomb can be either `floor(midX_float)` or `ceil(midX_float)`. So, `minX` becomes `floor(midX_float)` and `maxX` becomes `ceil(midX_float)`. If `midX_float` is an integer, `minX` and `maxX` both become that integer, effectively fixing the X coordinate.
    *   **Updating Y-bounds:** Similar logic applies for updating `minY/maxY` based on vertical movement (`dy = currY - prevY != 0`).

4.  **Next Jump Target:** After updating the search space bounds, Batman should jump to the center of the *remaining* valid rectangle. This ensures the most efficient reduction of the search space, akin to a binary search:
    `nextX = floor((minX + maxX) / 2)`
    `nextY = floor((minY + maxY) / 2)`

5.  **First Turn (`UNKNOWN`):** On the first turn, `bombDir` is `UNKNOWN`, so no feedback is available. The search space bounds remain the full grid. Batman makes his first jump to the center of the grid, and this position becomes `(currX, currY)` for the next turn's evaluation.

**Game State Variables:**

*   `W, H`: Dimensions of the building.
*   `batmanX, batmanY`: Batman's current coordinates.
*   `prevBatmanX, prevBatmanY`: Batman's coordinates *before* the last jump (used to evaluate feedback).
*   `minX, maxX, minY, maxY`: The current boundaries of the possible bomb location.

**Algorithm Flow:**

1.  **Initialization:**
    *   Read `W`, `H`, `N`.
    *   Read `X0`, `Y0` (Batman's starting position).
    *   Set `batmanX = X0`, `batmanY = Y0`.
    *   Set `prevBatmanX = X0`, `prevBatmanY = Y0`. (This is a dummy initial value; for the first turn, there's no actual "previous" jump for feedback, so `bombDir` will be `UNKNOWN`.)
    *   Set `minX = 0`, `maxX = W - 1`, `minY = 0`, `maxY = H - 1`.

2.  **Game Loop (runs `N` times):**
    *   Read `bombDir`.
    *   **If `bombDir` is not `UNKNOWN`:**
        *   Calculate `dx = batmanX - prevBatmanX` and `dy = batmanY - prevBatmanY`.
        *   Apply the `WARMER`/`COLDER`/`SAME` logic as described above to update `minX`, `maxX`, `minY`, `maxY`. Use `Math.floor()` for lower bounds and `Math.ceil()` for upper bounds to ensure integer coordinate coverage.
    *   **Update `prevBatmanX/Y`:**
        *   Set `prevBatmanX = batmanX`, `prevBatmanY = batmanY`. (The current position becomes the "previous" position for the *next* turn's evaluation.)
    *   **Calculate next jump:**
        *   `batmanX = Math.floor((minX + maxX) / 2)`.
        *   `batmanY = Math.floor((minY + maxY) / 2)`.
    *   **Output:** Print `batmanX batmanY`.

This approach ensures that with each step (except the first `UNKNOWN` one), the search space is effectively halved in at least one dimension, guaranteeing convergence within the given `N` jumps.