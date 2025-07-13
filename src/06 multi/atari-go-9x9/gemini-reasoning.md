The Atari Go 9x9 puzzle is a simplified version of the traditional game of Go. The goal is to capture more opponent stones. The core mechanics involve understanding groups of stones, their liberties (empty adjacent spaces), and how capturing works. Crucially, it includes rules for suicidal moves (with an exception if a capture occurs) and the Ko-rule, which prevents immediate board state repetition.

### Game Rules Summary & Implementation Approach:

1.  **Board Representation**: A 2D array (`CellState[][]`) to represent the 9x9 board. Each cell can be `.` (empty), `B` (black stone), or `W` (white stone).

2.  **Groups and Liberties**:
    *   **Group**: Stones of the same color connected horizontally or vertically.
    *   **Liberty**: An empty adjacent space to a stone or a group.
    *   **Capture**: A stone or group is captured and removed from the board if it has zero liberties.
    *   **Implementation**: A Breadth-First Search (BFS) algorithm (`findGroup`) is used to identify connected stones of a group and count their liberties.

3.  **Move Validation**:
    A move `(r, c)` for `playerColor` is valid if:
    *   **Empty Spot**: The cell `(r, c)` must be empty (`.`).
    *   **Captures First**: When a stone is placed, any opponent groups that lose all their liberties due to this placement are immediately captured and removed from the board. This happens *before* checking the new stone's liberties.
    *   **No Suicidal Moves**: After applying captures, if the newly placed stone (or its group) has zero liberties, the move is illegal *unless* it captured at least one opponent stone. The "captures first" rule handles the exception naturally, as captured spaces become liberties.
    *   **Ko-Rule**: A move is illegal if it results in a board state identical to the board state *immediately before the opponent's last move*. This prevents infinite loops in certain capture-recapture scenarios. We store the `previousBoardState` to check this.

4.  **AI Strategy**:
    Given the tight time constraints (100ms per turn), a simple heuristic-based approach is used:
    *   **Prioritize Captures**: The most important heuristic is to capture opponent stones. Moves that capture more stones are preferred.
    *   **Threaten Captures (Atari)**: If no immediate captures are possible, moves that reduce an opponent group's liberties to one (putting them "in Atari") are highly valued.
    *   **Increase Own Liberties**: For defensive or expansionary moves, those that provide more liberties to my own group are preferred.
    *   **Tie-breaking**: If multiple moves have the same score based on the above heuristics, an arbitrary tie-breaker (e.g., top-left-most coordinate) is used.

### Code Structure:

*   `Point` interface: Simple `{ r: number, c: number }` for coordinates.
*   `Board` class: Manages the 2D grid, allows cloning, setting/getting cell states, and validating coordinates.
*   Helper functions (`pointToString`, `stringToPoint`, `findGroup`, `getLiberties`): Implement the core logic for group traversal and liberty calculation. `findGroup` is a BFS implementation.
*   `GameState` class: Holds the current board, player colors, scores, and the `previousBoardState` for Ko rule. It contains `applyMove` (simulates a move and captures) and `isValidMove` (implements all Go rule validations).
*   `GoAI` class: The main AI logic. It updates the `GameState` with new input and implements `chooseMove`, which evaluates all valid moves based on the defined heuristics and returns the best one or "PASS".

### Detailed Explanation of `isValidMove` and `chooseMove`:

*   **`isValidMove(r, c, playerColor)`**:
    1.  Checks if `(r, c)` is empty.
    2.  Calls `this.applyMove` internally to get a `newBoard` state and `capturedStones` count. This `applyMove` handles all captures of opponent stones.
    3.  Calculates `newStoneLiberties` for the `playerColor` stone at `(r, c)` on the `newBoard`.
    4.  If `newStoneLiberties` is 0 AND `capturedStones` is 0, it's an illegal suicidal move.
    5.  Compares `newBoard` to `this.previousBoardState` for the Ko rule. If they are identical, it's an illegal Ko move.
    6.  If all checks pass, the move is valid.

*   **`chooseMove()`**:
    1.  Iterates through every empty cell `(r, c)` on the current board.
    2.  For each empty cell, it checks `this.gameState.isValidMove(r, c, this.gameState.myColor)`.
    3.  If valid, it *re-simulates* the move using `this.gameState.applyMove` to get `capturedStones`.
    4.  It also calculates `myLibertiesAfter` (liberties of my group on the new board) and `opponentAtariThreats` (how many opponent groups are now in Atari).
    5.  These evaluations are stored in `MoveEvaluation` objects.
    6.  Finally, `possibleMoves` are sorted:
        *   Descending by `captured` stones.
        *   Descending by `opponentAtariThreats`.
        *   Descending by `myLibertiesAfter`.
        *   Ascending by `r` then `c` for consistent tie-breaking.
    7.  The best move (first in the sorted list) is returned. If no valid moves, it returns 'PASS'.