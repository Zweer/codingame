The problem asks us to implement an AI for the game Amazons on an 8x8 board. The goal is to be the last player to make a legal move. A turn consists of moving one of your pieces (like a chess queen, but cannot cross or land on occupied squares) and then placing a "wall" (a blocked square) on any empty square reachable by queen-like movement from the piece's new position. The original square where the piece started from is also a valid spot for the wall, provided it's empty after the piece moves.

The time limits are strict: 1000ms for the first turn, and 100ms for subsequent turns. This implies that computationally expensive searches (like deep Minimax or Monte Carlo Tree Search) are likely not feasible for every turn.

### Game State Representation

*   The board is represented as a 2D array of characters (`string[][]`), where `.` is empty, `w` is a white piece, `b` is a black piece, and `-` is a wall.
*   Coordinates: CodinGame uses A1-H8 format. A1 is top-left, H8 is bottom-right. Our internal representation will be 0-indexed rows (0-7) and columns (0-7).
    *   Row conversion: `row = 8 - digit_char`. E.g., '8' -> 0, '1' -> 7.
    *   Column conversion: `col = char_code - 'a'_code`. E.g., 'a' -> 0, 'h' -> 7.
    *   Helper functions `posToStr` and `strToPos` handle these conversions.

### Core Logic: Finding Legal Moves

A move consists of `(from, to, wall)` positions. To find all legal moves:

1.  **Identify Player Pieces:** Find all `(r, c)` positions on the board occupied by the player's pieces.
2.  **Generate Piece Moves (`from` to `to`):** For each of your pieces (`startPos`):
    *   Iterate through all 8 cardinal and diagonal directions (like a queen).
    *   For each direction, iterate through possible distances (1 to `BOARD_SIZE - 1`).
    *   For each step `k`:
        *   Calculate the `currentPos`.
        *   Check if `currentPos` is within board bounds.
        *   Check if `currentPos` or any square on the path to it is occupied by a piece or a wall. If so, this path is blocked, so break from this direction.
        *   If `currentPos` is valid and empty, it's a potential `endPos`. Add it to a list of `possibleEndPositions`.
3.  **Generate Wall Placements (`wall`):** For each `(startPos, endPos)` pair identified in step 2:
    *   **Simulate the move:** Temporarily update the board: set `board[startPos.r][startPos.c] = '.'` and `board[endPos.r][endPos.c] = playerColor`. Store the original characters at these positions to revert later.
    *   **Find wall positions:** From `endPos`, again iterate through all 8 directions and all distances.
        *   Calculate `currentWallPos`.
        *   Check if `currentWallPos` is within board bounds and empty (on the *simulated* board). If valid, it's a legal `wall` position. Add the complete `(startPos, endPos, currentWallPos)` move to the list of `legalMoves`.
    *   **Special rule: Original position as wall:** The problem states "it may place a wall in the direction the piece moved from". This is generally interpreted as the original `startPos` square being a valid wall placement option, as it is now empty. Add `(startPos, endPos, startPos)` to `legalMoves`.
    *   **Revert simulation:** Restore `board[startPos.r][startPos.c]` and `board[endPos.r][endPos.c]` to their original states.

The `getLegalMoves` function implements this logic, returning a list of `Move` objects. The `countLegalMoves` function uses the same logic but just increments a counter instead of building a list of `Move` objects, making it slightly faster for evaluation.

### AI Strategy (Heuristic)

Given the tight time constraints, a common strategy for Amazons is to use a "mobility" heuristic in a shallow search (depth 1).

1.  **Generate all my legal moves:** Use `getLegalMoves(currentBoard, MY_COLOR)` to get `myLegalMoves`.
2.  **Evaluate each move:** For each `myMove` in `myLegalMoves`:
    *   Create a deep copy of the board (`simulatedBoard`).
    *   Apply `myMove` to `simulatedBoard`.
    *   Calculate my mobility: `myMobility = countLegalMoves(simulatedBoard, MY_COLOR)`.
    *   Calculate opponent's mobility: `opponentMobility = countLegalMoves(simulatedBoard, OPPONENT_COLOR)`.
    *   **Score:** The heuristic score for `myMove` is `myMobility - opponentMobility`. This aims to maximize my future moves while minimizing the opponent's.
3.  **Choose the best move:** Select the `myMove` that yields the highest score.

This strategy explores all of the current player's possible moves and evaluates the immediate impact on both players' mobility. While this is a greedy, one-ply lookahead, it's often sufficient to perform reasonably well within strict time limits.

### Optimizations

*   **No deep board copies in `countLegalMoves` / `getLegalMoves` inner loops:** Instead of creating a new `tempBoard` for every wall placement check, these functions temporarily modify the passed `board` array and then meticulously revert the changes before returning. This avoids expensive deep copies inside the most frequent loops.
*   **Direct `r_curr, c_curr` variables:** Instead of creating `Pos` objects in tight loops (`for k` loops), direct integer variables are used (`r_curr`, `c_curr`, `r_wall_curr`, `c_wall_curr`) to avoid excessive object creation and garbage collection overhead. `Pos` objects are only created when adding a valid move or a potential end position to a list.

This combination of a simple, effective heuristic and careful implementation should allow the bot to operate within the given time limits.