This problem is a classic sliding puzzle, specifically a 3x4 variant with 11 numbered tiles and one empty space (represented by 0). The goal is to rearrange the tiles into a specific sorted order within a maximum of 50 moves. This type of problem is best solved using a search algorithm, and given the need for an optimal or near-optimal path within a move limit, A* search is a suitable choice.

**1. Problem Analysis & Algorithm Choice (A* Search)**

*   **State Representation:** A 2D array (`number[][]`) is a natural fit for the board. To store visited states efficiently in a `Map` or `Set`, a string representation of the flattened board (e.g., "0,1,2,3,4,5,6,7,8,9,10,11") will serve as a unique key.
*   **Goal State:** The target configuration is explicitly given:
    ```
    0  1  2  3
    4  5  6  7
    8  9 10 11
    ```
*   **Moves:** A move consists of swapping an adjacent tile with the empty space. The output requires the `(row, column)` of the tile being moved.
*   **Heuristic (for A*): Manhattan Distance:** For a sliding puzzle, the Manhattan distance is a common and effective heuristic. It's calculated as the sum of the horizontal and vertical distances each tile (excluding the empty one) is from its target position. This heuristic is admissible (never overestimates the cost to reach the goal) and consistent, which are properties that ensure A* finds the optimal path when used correctly.
    *   `h(n)`: Sum of `|current_row - target_row| + |current_col - target_col|` for all tiles 1-11.
*   **Cost Function (for A*): `f(n) = g(n) + h(n)`**
    *   `g(n)`: The actual number of moves taken from the initial state to reach state `n`.
    *   `h(n)`: The estimated number of moves from state `n` to the goal state (Manhattan distance).
*   **Data Structures for A*:**
    *   `openSet`: A `MinHeap` (priority queue) to store `Node` objects, prioritized by their `f` value. This allows A* to always explore the most promising states first.
    *   `closedSet`: A `Map<string, number>` to keep track of visited board states and the minimum `g` cost (number of moves) at which they were reached. This prevents revisiting states via longer paths and cycles.
*   **Path Reconstruction:** Each `Node` will store a reference to its `parent` node and the `lastMove` (the coordinate of the tile moved) that led to it. Once the goal is found, the path can be reconstructed by backtracking from the goal node to the start node.
*   **Constraints:**
    *   **50 moves limit:** The search will prune any paths that exceed 50 moves (`current.g >= MAX_MOVES`).
    *   **1000ms time limit:** A* with Manhattan distance is generally efficient enough for 3x4 puzzles within this timeframe. The state space is large (12! / 2), but the heuristic significantly prunes the search tree.

**2. Detailed Implementation Plan**

1.  **Constants:** Define `ROWS`, `COLS`, `GOAL_BOARD`, and precompute `GOAL_POSITIONS` map for quick target lookups.
2.  **Types:** Define `Board`, `Position`, and `Node` types for clarity and type safety.
3.  **Helper Functions:**
    *   `boardToString(board: Board): string`: Converts a 2D board array to a comma-separated string for `Map` keys.
    *   `getEmptyPosition(board: Board): Position`: Locates the '0' tile.
    *   `isGoal(board: Board): boolean`: Compares the current board to the `GOAL_BOARD`.
    *   `calculateManhattanDistance(board: Board): number`: Implements the heuristic.
    *   `applyMove(board: Board, tileToMovePos: Position, emptyPos: Position): Board`: Returns a *new* board after swapping the tile with the empty space. Crucially, it performs a deep copy to avoid modifying existing states.
    *   `getPossibleMoves(emptyPos: Position): Position[]`: Returns an array of `Position` objects representing adjacent tiles that can be moved into the `emptyPos`.
4.  **MinHeap Class:** Implement a basic min-heap to serve as the priority queue for A*. It will need `insert`, `extractMin`, `isEmpty`, and internal `bubbleUp`/`bubbleDown` methods. The constructor will take a comparison function (`(a, b) => a.f - b.f`) to order `Node` objects by their `f` value.
5.  **A* Search Function (`solve11Puzzle`):**
    *   Initialize `startNode` with `g=0`, calculated `h`, and `f`.
    *   Check if `initialBoard` is already the goal; if so, return an empty array of moves.
    *   Create `openSet` (MinHeap) and `closedSet` (Map).
    *   Add `startNode` to `openSet` and `closedSet`.
    *   **Loop:** While `openSet` is not empty:
        *   Extract the `current` node with the lowest `f` value.
        *   If `current.g` exceeds `MAX_MOVES`, skip this node (pruning).
        *   If `current.board` is the `GOAL_BOARD`, reconstruct the path by tracing `parent` links and `lastMove` values, then `reverse()` it, and return.
        *   Generate `possibleMoves` from `current.emptyPos`.
        *   For each `tileToMovePos` (neighbor):
            *   Create `newBoard` by applying the move.
            *   Calculate `newG`, `newH`, `newF`.
            *   Convert `newBoard` to `boardKey`.
            *   If `boardKey` is in `closedSet` and `newG` is not better than the stored `g` for that state, skip.
            *   Otherwise, update `closedSet` with `newG`, create `newNode`, and insert it into `openSet`.
    *   If the loop finishes without finding the goal, return `null` (no solution within limits).
6.  **Main Execution:**
    *   Read the 3 lines of input to construct `initialBoard`.
    *   Call `solve11Puzzle` with `initialBoard`.
    *   If a `solutionPath` is returned, iterate through it and print each `move.row move.col`.

This approach ensures correctness (A* finds optimal paths), efficiency (Manhattan heuristic and MinHeap), and adheres to the problem's constraints.