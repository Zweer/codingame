The problem asks us to calculate scores in a Go game using "Area Scoring" and determine the winner. The board is given in a stable state, meaning we only need to count stones and territories, without simulating game moves or captures. White starts with an additional 6.5 points (komi).

Here's a breakdown of the scoring rules and the strategy to implement them:

1.  **Stone Count**: Each player gets one point for each of their stones (`B` for Black, `W` for White) on the board. This is straightforward: iterate through the board and count `B`s and `W`s.

2.  **Territory Count**: An empty intersection (`.`) is part of a player's territory if it is "surrounded" by that player's stones. The definition of "surrounded" for this problem is crucial and slightly specific:
    *   A connected group of empty intersections (cells marked `.`) forms a potential territory.
    *   This group is considered territory for a specific player if *all* of its directly adjacent stone cells (`B` or `W`) belong to that *single* player.
    *   Crucially, if the empty region also touches the edge of the board, it is still considered territory as long as all adjacent *stones* are of a single color. It is *not* disqualified by touching the edge.
    *   If an empty region touches stones of both Black and White, or if it doesn't touch any stones at all (an impossible scenario on a stable Go board unless it's a completely empty board), it is not considered territory for either player.

3.  **Komi**: White's final score is increased by 6.5 points.

4.  **Winner Determination**: The player with the higher total score wins. White's score should always be displayed with one decimal place (`.5`).

**Algorithm:**

1.  **Initialize Scores**: Set `blackScore = 0` and `whiteScore = 0`.

2.  **Count Stones**: Iterate through the entire board. If a cell contains 'B', increment `blackScore`. If it contains 'W', increment `whiteScore`.

3.  **Find and Score Territories**:
    *   Create a `visited` 2D boolean array of the same size as the board, initialized to `false`. This array will keep track of empty cells that have already been processed as part of a territory or non-territory region.
    *   Iterate through the board again. If you encounter an empty cell `board[r][c] === '.'` that has not yet been `visited[r][c]`:
        *   Start a Breadth-First Search (BFS) from `(r, c)`. This BFS will find all connected empty cells forming a single "empty region".
        *   During the BFS, maintain:
            *   `currentRegionSize`: The number of empty cells in the current connected region.
            *   `potentialOwners`: A `Set` to store the colors of stones ('B' or 'W') that are adjacent to any empty cell in this region.
            *   `isContested`: A boolean flag, set to `true` if `potentialOwners` ever contains both 'B' and 'W'.
        *   Mark each empty cell encountered during the BFS as `visited[nr][nc] = true` to ensure it's not processed again by a new BFS.
        *   When a neighbor of an empty cell is a stone (`'B'` or `'W'`), add its color to `potentialOwners`. If `potentialOwners` already contains a color different from the current stone's color, set `isContested = true`.
        *   After the BFS for the current region completes:
            *   If `!isContested` (meaning only one color of stone, or no stones, was adjacent) AND `potentialOwners.size === 1` (meaning it was surrounded by exactly one color of stone), then:
                *   Add `currentRegionSize` to `blackScore` if the owner was 'B'.
                *   Add `currentRegionSize` to `whiteScore` if the owner was 'W'.
            *   Otherwise (if `isContested` is true, or `potentialOwners.size` is 0 or > 1), the region is not territory for anyone.

4.  **Apply Komi**: Add `6.5` to `whiteScore`.

5.  **Determine Winner and Print**:
    *   Compare `blackScore` and `whiteScore`.
    *   Print the scores in the specified format: `BLACK : <score>`, `WHITE : <score.5>`. Use `toFixed(1)` for White's score to ensure the `.5` format.
    *   Print `BLACK WINS` or `WHITE WINS` based on the comparison.

**Example Trace (4x4 from problem description):**
```
.BW.
BBWW
.BW.
BBWW
```

1.  **Initial Scores**:
    *   Black stones: `(0,1), (1,0), (1,1), (2,1), (3,0), (3,1)` (6 stones) -> `blackScore = 6`
    *   White stones: `(0,2), (1,2), (1,3), (2,2), (3,2), (3,3)` (6 stones) -> `whiteScore = 6`

2.  **Territories**:
    *   **Cell (0,0) `.`**:
        *   Start BFS. `currentRegionSize = 1`. `potentialOwners = Set()`. `isContested = false`.
        *   Neighbors: `(0,1) = 'B'`, `(1,0) = 'B'`.
        *   `potentialOwners` becomes `{'B'}`. `isContested` remains `false`.
        *   BFS ends. `!isContested` is true, `potentialOwners.size` is 1 (owner 'B').
        *   Add `currentRegionSize` (1) to `blackScore`. `blackScore = 6 + 1 = 7`.
    *   **Cell (0,3) `.`**: (Similar process)
        *   Neighbors: `(0,2) = 'W'`, `(1,3) = 'W'`.
        *   Owner is 'W'. Add 1 to `whiteScore`. `whiteScore = 6 + 1 = 7`.
    *   **Cell (2,0) `.`**: (Similar process)
        *   Neighbors: `(2,1) = 'B'`, `(3,0) = 'B'`.
        *   Owner is 'B'. Add 1 to `blackScore`. `blackScore = 7 + 1 = 8`.
    *   **Cell (2,3) `.`**: (Similar process)
        *   Neighbors: `(2,2) = 'W'`, `(3,3) = 'W'`.
        *   Owner is 'W'. Add 1 to `whiteScore`. `whiteScore = 7 + 1 = 8`.

3.  **Komi**: `whiteScore = 8 + 6.5 = 14.5`.

4.  **Final Scores**: `BLACK : 8`, `WHITE : 14.5`. `WHITE WINS`. This matches the example.

**TypeScript Code Structure:**

The code will use a 2D array for the board, a `visited` 2D array, and standard BFS (using an array as a queue). `readline()` and `console.log()` are global in the CodinGame environment.