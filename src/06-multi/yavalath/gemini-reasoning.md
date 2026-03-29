Yavalath is a challenging game because it introduces a unique win/loss condition: making a line of 4 wins, but making a line of 3 loses, unless the 4-line is formed simultaneously. This requires a careful balance in strategy.

### Game Analysis and Strategy

1.  **Grid Representation:** The game is played on a hexagonal grid with specific (x,y) coordinates. The grid is not rectangular; the valid X range varies per Y-coordinate. I will represent the board as a 2D array (matrix) and use helper methods to check for valid coordinates and access cells. The maximum grid dimensions are 10 (X: 0-9) by 8 (Y: 0-7).

    *   `min_x_per_y = [0, 0, 0, 0, 0, 1, 2, 3]`
    *   `max_x_per_y = [7, 8, 9, 9, 9, 9, 9, 9]`

2.  **Line Detection:** There are 4 primary axes (or 8 directions) to check for lines:
    *   Horizontal: `(x+k, y)`
    *   Vertical (aligned with Y-axis): `(x, y+k)`
    *   Diagonal (top-left to bottom-right): `(x+k, y+k)`
    *   Diagonal (bottom-left to top-right): `(x+k, y-k)`
    A function `checkWinLoss(x, y, playerColor)` will simulate placing a piece and determine if it results in a 4-line (win) or a 3-line (loss). The rule "if both lines were made one same turn the player wins" implies that a 4-line takes precedence over a 3-line.

3.  **Core AI - Minimax with Alpha-Beta Pruning:**
    Given the 100ms time limit per turn (1000ms for the first turn), a Minimax algorithm with Alpha-Beta Pruning is suitable.
    *   **Depth:** A depth of 2 or 3 is typically achievable within 100ms for a board of this size. I'll use depth 3 for the first turn (1000ms) and depth 2 for subsequent turns (100ms).
    *   **Evaluation Function (`evaluateBoard`):** For leaf nodes (depth 0), a heuristic is needed to score the board state. My `evaluateBoard` function performs a 1-ply lookahead for *all empty cells*, checking for immediate win/loss opportunities for both players.
        *   If placing my piece at an empty cell leads to a win, it's a strong positive score.
        *   If it leads to a loss, it's a strong negative score.
        *   If placing the opponent's piece leads to their win, it's a strong negative score (I want to prevent this).
        *   If placing the opponent's piece leads to their loss, it's a strong positive score (I want to encourage this).
        This provides a quick way to identify immediate threats and opportunities.
    *   **Win/Loss Scores:** Large constants (`WIN_SCORE`, `LOSE_SCORE`) are used to ensure that actual wins/losses found during the search are always prioritized over heuristic scores.

4.  **Special Rule: Player 2's First Turn (Steal):**
    Player 2 has the option to "steal" Player 1's first move, meaning Player 1's piece is replaced by Player 2's piece at the same coordinates.
    My strategy for this rule is:
    *   First, calculate the best possible move if Player 2 *doesn't* steal (using minimax).
    *   Then, simulate the steal move. Check if it leads to an immediate win or loss.
    *   If it leads to neither, run a separate minimax search from this "stolen" board state.
    *   Finally, compare the score of the best normal move versus the score of the steal move, and pick the one with the higher score.

### Code Structure

*   **`Board` Class:**
    *   Stores the `grid` (2D array of numbers).
    *   Contains `min_x_per_y` and `max_x_per_y` for grid boundary checks.
    *   `isValidCoordinate(x, y)`: Checks if a coordinate is within the hexagonal grid boundaries.
    *   `getCell(x, y)` and `setCell(x, y, value)`: Accessors for grid cells, handling out-of-bounds gracefully.
    *   `clone()`: Creates a deep copy of the board for minimax exploration.
    *   `getMyPiece(myId)` and `getOpponentPiece(myId)`: Converts player ID (0 or 1) to piece value (1 or 2).
    *   `directions`: Defines the 4 axes for line checking.
    *   `countConsecutive()`: Helper for `checkWinLoss`.
    *   `checkWinLoss(x, y, playerColor)`: The core logic to determine if placing a piece at `(x,y)` for `playerColor` results in a win (4-line) or a loss (3-line, not overridden by 4-line).

*   **`evaluateBoard()` Function:**
    *   Heuristic function used by minimax at leaf nodes. Iterates through empty cells and simulates moves to find immediate threats/opportunities.

*   **`minimax()` Function:**
    *   Implements the minimax algorithm with alpha-beta pruning.
    *   Recursively explores possible moves to find the best score for the maximizing player.

*   **`solve()` Function (Main Game Loop):**
    *   Reads initial player ID.
    *   Enters a loop for each turn.
    *   Reads the current board state and opponent's last move.
    *   Initializes `Board` object.
    *   Calculates the best normal move using `minimax`.
    *   If Player 2 on first turn, evaluates the "steal" option and compares its score to the best normal move.
    *   Selects the overall best move.
    *   Includes fallback logic to pick any safe empty cell if minimax fails to find a move (e.g., in very rare edge cases or if all moves lead to loss).
    *   Prints the chosen move and an optional message.