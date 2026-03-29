The puzzle "Xmas Rush" in the Wood 4 league requires us to navigate a 7x7 board to reach a specific quest item. Turns alternate between PUSH and MOVE. In a PUSH turn, we insert our held tile into a row or column, displacing tiles and potentially our player. In a MOVE turn, we can move up to 20 steps along connected paths. The goal is to collect our single quest item before the opponent.

My strategy focuses on finding the shortest path to the target quest item, considering the current board state or a hypothetical future state after a push.

**1. Data Structures:**
- `Direction` enum: Defines UP, RIGHT, DOWN, LEFT for clarity.
- `Tile` class: Represents a board square. It stores whether each of its four directions has a path (e.g., `hasPath.UP`), the original 4-digit string representation for easy re-creation, and any `Item` present on it. `canConnect` method checks if two adjacent tiles have connecting paths.
- `PlayerInfo` class: Stores player's coordinates (`x`, `y`), and the string representation of the tile they are currently holding outside the board (`tileString`).
- `Item` class: Stores item name, its coordinates (`x`, `y`), and the player ID it belongs to.
- `Quest` class: Stores the item name required for the quest and the player ID it belongs to.

**2. Core Logic - Pathfinding (BFS):**
- The `findPath` function implements a Breadth-First Search (BFS) to discover the shortest sequence of moves from a `(startX, startY)` to a `(targetX, targetY)` on a given `board`.
- It keeps track of visited cells to prevent cycles and redundant computations.
- The `path` array stores the sequence of `Direction` enums taken to reach the current cell.
- It respects the `maxSteps` limit (20 for MOVE turns). If no path is found within this limit, it returns `null`.
- The `Tile.canConnect` method is crucial here to ensure moves are only made between validly connected paths on adjacent tiles.

**3. PUSH Turn Strategy:**
- In a PUSH turn, our objective is to modify the board (and potentially our player's position) to create or shorten a path to our quest item.
- **Simulation:** The `simulatePush` function is key. It takes the current board, player info, a `pushId` (row/column index), and a `pushDirection`. It creates a *new* board reflecting the push, calculates the player's new `(x, y)` coordinates (handling warping if pushed off the board), and identifies the tile that was pushed out (which becomes our new `playerTile` for the *next* turn).
- **Optimization (Wood 4):** Since the game is simple in Wood 4 (7x7 board, 1 quest, max 20 moves), we can brute-force all possible pushes. There are 7 rows/columns, and 2 directions for each (UP/DOWN for columns, LEFT/RIGHT for rows), totaling 28 possible push actions.
- For each of these 28 possible pushes:
    1. Simulate the push using `simulatePush` to get the resulting board and our new player position.
    2. Check if the player immediately lands on the target quest item's tile after the push. If so, this is the best possible outcome (0 steps to complete the quest). We prioritize this by setting `bestPathLength` to 0 and immediately selecting this push.
    3. Otherwise, run `findPath` (BFS) on the simulated board from the new player position to the target item.
    4. If a path is found, compare its length to `bestPathLength` and update `bestPush` if a shorter path is found.
- **Output:** If a `bestPush` is found (meaning at least one push leads to a path within 20 steps), we execute it. Otherwise, we execute a default, safe push (e.g., `PUSH 0 RIGHT`) to avoid passing or an invalid action.

**4. MOVE Turn Strategy:**
- In a MOVE turn, we simply need to find the shortest path from our current position to the quest item on the current board.
- We call `findPath` with our current `x`, `y` and the target item's `x`, `y`.
- **Output:**
    - If `findPath` returns a non-empty path, we output `MOVE` followed by the sequence of directions.
    - If `findPath` returns an empty path (meaning we are already on the target tile) or `null` (no path found within 20 steps), we output `PASS`. This is correct as no movement is needed if already on the target, and if no path exists, we cannot move.

**Input Parsing:**
The input is read in a specific order:
1. `turnType`
2. 7x7 board tile strings
3. Player 0 info (`numCards`, `x`, `y`)
4. Player 0's held tile string
5. Player 1 info (`numCards`, `x`, `y`)
6. Player 1's held tile string
7. `numItems`
8. `numItems` lines of item info
9. `numQuests`
10. `numQuests` lines of quest info

A crucial step is to first read all `initialTileStrings`, then all player and item data. After that, we construct the `boardWithItems` by iterating through the `initialTileStrings` and overlaying the `Item` objects onto the corresponding `Tile` instances. For Wood 4, our quest item is guaranteed to be on the board, simplifying the target lookup.

The solution ensures all constraints (7x7 board, 20 max moves, 50ms response time) are met. BFS on a 7x7 board is very fast, and 28 BFS runs per PUSH turn are well within the time limit.