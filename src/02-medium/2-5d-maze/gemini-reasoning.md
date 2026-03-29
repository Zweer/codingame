The puzzle asks for the shortest path in a 2.5D maze. This means Link can move horizontally (north, south, east, west) and sometimes change his "height" or "level" within the maze. The movement costs are uniform (1 step for horizontal movement), but some transitions (like changing height on a slope) might be considered "free" (0 cost). This suggests a Breadth-First Search (BFS) or a 0-1 BFS algorithm.

**Maze Elements and Levels:**

Link can be at three conceptual height levels:
*   **0 (Floor):** The default level for `.` (floor) tiles. Slopes also exist at this level.
*   **1 (Raised):** For walking `+` (short walls) and `X` (bridges) *over*.
*   **-1 (Underground):** For walking `X` (bridges) and `O` (tunnels) *under*.

**State Representation:**

A state in our search will be `(y, x, height)`. To use this with array indexing, we can map `height` values to indices:
*   `height = 0` (Floor) maps to array index `0`.
*   `height = 1` (Raised) maps to array index `1`.
*   `height = -1` (Underground) maps to array index `2`.

**Movement Rules (Transitions):**

1.  **Cost 0 Transitions (Vertical Movement at Same Cell):**
    *   If Link is on a `|` (vertical slope) or `-` (horizontal slope) tile:
        *   From `(y, x, 0)`: Can transition to `(y, x, 1)` and `(y, x, -1)`.
        *   From `(y, x, 1)`: Can transition to `(y, x, 0)`.
        *   From `(y, x, -1)`: Can transition to `(y, x, 0)`.
    These transitions cost 0 steps. This is a key characteristic of a 0-1 BFS.

2.  **Cost 1 Transitions (Horizontal Movement to Adjacent Cell):**
    These are movements from `(currY, currX, currHeight)` to an adjacent `(nextY, nextX, nextHeight)`.
    *   **From Floor Level (`currHeight = 0`):**
        *   If on a `.` (floor) tile: Can move to an adjacent `.` (floor) or `|`/`-` (slope) tile, remaining at `nextHeight = 0`. Cannot directly move to `+`, `X`, or `O`.
        *   If on a `|`/`-` (slope) tile (at floor level):
            *   Can move to an adjacent `.` or `|`/`-` tile, remaining at `nextHeight = 0`.
            *   Can move to an adjacent `+` or `X` tile, transitioning to `nextHeight = 1` (walking onto a raised platform).
            *   Can move to an adjacent `X` or `O` tile, transitioning to `nextHeight = -1` (going under a bridge/tunnel).
    *   **From Raised Level (`currHeight = 1`):**
        *   If on a `+` (short wall) or `X` (bridge over) tile:
            *   Can move to an adjacent `+` or `X` tile, remaining at `nextHeight = 1`.
            *   Can move to an adjacent `|`/`-` tile, transitioning to `nextHeight = 0` (walking off the raised platform onto a slope at floor level). Cannot move directly to `.` or `O`.
    *   **From Underground Level (`currHeight = -1`):**
        *   If on an `X` (bridge under) or `O` (tunnel under) tile:
            *   Can move to an adjacent `X` or `O` tile, remaining at `nextHeight = -1`.
            *   Can move to an adjacent `|`/`-` tile, transitioning to `nextHeight = 0` (walking out from under to a slope at floor level). Cannot move directly to `.` or `+`.
    *   `#` (high wall) is always impassable at any height.

**Algorithm: 0-1 BFS**

We use a `dist[y][x][height_idx]` array to store the minimum steps to reach `(y, x)` at a specific `height`. Initialize all distances to `Infinity`.

1.  **Queues:** Use two queues, `q0` for states reachable with 0-cost (vertical transitions) and `q1` for states reachable with 1-cost (horizontal movements).
2.  **Initialization:** Start at `(startY, startX)` on the `HEIGHT_FLOOR`. Set `dist[startY][startX][HEIGHT_TO_IDX[HEIGHT_FLOOR]] = 0` and add this state to `q0`.
3.  **Search Loop:** Continue as long as either `q0` or `q1` is not empty.
    *   Prioritize `q0`: If `q0` has states, take its contents as the `currentBatch` to process. Then clear `q0`.
    *   If `q0` is empty, take `q1`'s contents as the `currentBatch`. Then clear `q1`. This effectively means `q1` now becomes the `q0` for the *next* level of 1-cost steps.
    *   Process states in `currentBatch`: For each `(currY, currX, currHeightIdx)`:
        *   Retrieve `currentSteps = dist[currY][currX][currHeightIdx]`. This is the shortest path found *so far* to this state.
        *   **Generate 0-cost neighbors:** Apply vertical transition rules. If a new `(currY, currX, newHeightIdx)` state is reachable with `currentSteps` (i.e., `dist[currY][currX][newHeightIdx] > currentSteps`), update its distance and add it to `q0`.
        *   **Generate 1-cost neighbors:** For each adjacent `(nextY, nextX)`: Apply horizontal movement rules. If a `(nextY, nextX, nextHeightIdx)` state is reachable with `currentSteps + 1` (i.e., `dist[nextY][nextX][nextHeightIdx] > currentSteps + 1`), update its distance and add it to `q1`.
4.  **Result:** After the BFS completes, `dist[endY][endX][HEIGHT_TO_IDX[HEIGHT_FLOOR]]` will contain the length of the shortest path. The problem states start/end are on the floor, so we only need to check the floor level at the exit.

**Example Walkthrough:**
For the given example, the maze contains only `.` and `#`. All movement is at `height = 0`. The 0-1 BFS degenerates to a standard BFS, correctly finding the path length of 13.

The solution uses array initialization with `Array(H).fill(0).map(() => ...)` to ensure distinct inner arrays for each dimension, preventing unintended shared references.