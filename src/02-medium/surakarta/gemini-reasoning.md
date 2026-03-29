The problem asks us to count the number of distinct capture moves for our pieces in a Surakarta game. A capture move is defined as moving one of your pieces ('X') to an opponent's piece ('O') *after doing one or more loops*. Pieces can move horizontally or vertically any distance, but cannot pass through other pieces. When a piece reaches the "bold edge" (the outermost lines of the 6x6 grid), it can continue by "looping" along the perimeter.

**Board Representation:**
The board is a 6x6 grid. We can represent it as `board[row][col]`, where `row` and `col` range from 0 to 5.
Your pieces are 'X', opponent's pieces are 'O', and empty squares are '.'.

**Movement Rules Breakdown:**

1.  **Straight Movement:** A piece moves horizontally or vertically. It stops if it encounters any other piece ('X' or 'O'). If it encounters an 'O' and has *not* looped, it's blocked, not a capture.
2.  **Looping:** This is the core complexity.
    *   The "bold edge" consists of all cells in row 0, row 5, col 0, or col 5.
    *   If a piece is on an edge cell (e.g., `(0, C)`) and attempts to move *off* the board in its current straight direction (e.g., `(0, C)` trying to move Up to `(-1, C)`), it instead *redirects* along the perimeter.
    *   Crucially, when such a redirection occurs, it marks the path as having "looped".
    *   From a given edge cell and attempted "off-board" direction, there are *two* possible ways to redirect: clockwise (CW) or counter-clockwise (CCW) along the perimeter. This means the path branches.
    *   The problem statement "Each piece can potentially move in 4 directions..." and the example output "1" for a scenario where a loop is implied (as a direct straight move would not involve a loop) strongly suggest this branching interpretation.

**Capture Rule:**
A capture occurs if your piece lands on an opponent's piece ('O') AND the `hasLooped` flag is true for that path. Once a piece is captured, the path is blocked at that cell.

**Goal:**
For each of *your* pieces ('X'), and for each of the 4 initial straight directions (Up, Down, Left, Right), we need to determine if that particular starting "move" can lead to a capture. We sum up the total count of such distinct initial moves. If a single initial move leads to multiple captures along its path, it still counts as only one capture move for the initial piece and direction.

**Algorithm (BFS-based):**

1.  **Parse Board:** Read the 6 lines of input, storing the board state in a 2D array and identifying the coordinates of all your pieces ('X').
2.  **Iterate Your Pieces:** For each of your pieces `(sr, sc)`:
    a.  **Iterate Initial Directions:** For each of the 4 cardinal directions `(initialDr, initialDc)` (e.g., (0,1) for Right, (0,-1) for Left, etc.):
        i.  **Initialize BFS:**
            *   Create a queue `Q` to hold `BFSState` objects: `{ r, c, dr, dc, hasLooped }`. `dr, dc` represent the *current* direction of travel.
            *   Create a `visited` set to prevent infinite loops and re-processing the same state. A state is unique by `(r, c, dr, dc, hasLooped)`.
            *   Set `foundCaptureOnThisPath = false`. This flag will be set to `true` if this specific initial move (from `(sr, sc)` in `(initialDr, initialDc)`) results in *any* capture.
            *   Add the initial state `{ r: sr, c: sc, dr: initialDr, dc: initialDc, hasLooped: false }` to `Q` and `visited`.
        ii. **Run BFS:** While `Q` is not empty:
            *   Dequeue `(currR, currC, currDr, currDc, currHasLooped)`.
            *   Calculate `nextR = currR + currDr`, `nextC = currC + currDc`.
            *   **Check for Loop Redirection:** If `isValidCell(nextR, nextC)` is `false` (meaning the piece would go off-board from an edge cell):
                *   Set `newHasLooped = true`.
                *   Calculate `cwRedirect` and `ccwRedirect` using helper functions (`getClockwiseRedirect`, `getCounterClockwiseRedirect`). These functions provide the `(r, c, dr, dc)` for the first step of the respective loop path.
                *   For each valid redirect (CW and CCW):
                    *   Check if the `redirect.r, redirect.c` cell is blocked by 'X' or 'O'. If 'O' and `newHasLooped` is true, mark `foundCaptureOnThisPath = true`. In any blocking case, the path ends for this branch.
                    *   If not blocked, add `{ redirect.r, redirect.c, redirect.dr, redirect.dc, true }` to `Q` and `visited`.
                *   `continue` to the next iteration of the while loop, as the current path segment from `(currR, currC)` has branched.
            *   **Check for Normal Straight Move:** If `isValidCell(nextR, nextC)` is `true` (piece stays on board):
                *   `newHasLooped = currHasLooped`.
                *   Check `board[nextR][nextC]`:
                    *   If `'X'`: Path is blocked by your own piece. `continue`.
                    *   If `'O'`: If `newHasLooped` is `true`, then `foundCaptureOnThisPath = true`. Path is blocked by opponent. `continue`.
                    *   If `'.'`: Empty cell. Add `{ nextR, nextC, currDr, currDc, newHasLooped }` to `Q` and `visited` if not already visited.
        iii. **After BFS:** If `foundCaptureOnThisPath` is `true`, increment `totalCaptures`.
3.  **Output:** Print `totalCaptures`.

**Helper Functions:**
*   `isValidCell(r, c)`: Returns `true` if `0 <= r < 6` and `0 <= c < 6`.
*   `getClockwiseRedirect(r, c, dr, dc)`: Given an edge position `(r, c)` and a direction `(dr, dc)` that would lead off-board, calculates the `(nextR, nextC, nextDr, nextDc)` for the first step of a clockwise loop. Handles corners and straight edge segments correctly. Returns `null` if the input is not a valid edge-hit-and-redirect scenario.
*   `getCounterClockwiseRedirect(r, c, dr, dc)`: Similar to `getClockwiseRedirect`, but for a counter-clockwise loop.

This detailed approach correctly interprets the "loop" rule as a branching mechanism when hitting the board's edge, and precisely defines when a capture (after a loop) occurs.