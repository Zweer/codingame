The puzzle "Adversarial Mate with Rook" is a simplified Chess endgame where White (White King, White Rook) must checkmate Black (Black King) as quickly as possible. Black will play optimally to prolong the game or achieve a draw. This is a classic minimax search problem.

## Reasoning and Approach

1.  **Game State Representation:**
    A game state is defined by the positions of the three pieces: White King (WK), White Rook (WR), and Black King (BK). We'll represent positions as `[row, col]` arrays, where `row` and `col` are 0-indexed (0-7). For example, "a1" is `[0, 0]`, "h8" is `[7, 7]`.

2.  **Move Representation:**
    Moves are represented as `[fromCoords, toCoords]`, where `fromCoords` and `toCoords` are `[row, col]` arrays. For output, we convert them back to algebraic notation like "h5h1".

3.  **Core Chess Logic:**
    To implement the minimax algorithm, we need functions for:
    *   **Coordinate Conversion:** `algebraicToCoords`, `coordsToAlgebraic`, `parseMove`, `formatMove`.
    *   **Board Utilities:** `isOnBoard` (checks if coordinates are within 8x8 board), `isSameSquare` (checks if two coordinate pairs are identical), `isKingAdjacent` (checks if two kings are on adjacent squares, illegal for opposing kings).
    *   **Path Clearance:** `isPathClear` checks if a straight line between two squares is clear of other pieces. This is crucial for Rook moves.
    *   **Attack Logic:** `isAttackedByWhite` and `isAttackedByBlack` determine if a given square is attacked by a player's pieces.
    *   **Check Detection:** `isInCheck` uses the attack logic to determine if a king is currently in check.
    *   **Move Application:** `applyMove` takes a current state and a move, returning the new state.
    *   **Legal Move Generation:** `generateLegalMoves` iterates through all possible moves for the current player's pieces and filters out illegal moves. A move is illegal if:
        *   It moves a piece off the board.
        *   It moves a piece onto a square occupied by an allied piece.
        *   It results in the moving player's king being in check.
        *   A king moves to a square adjacent to the opposing king.
        *   A rook's path is blocked by another piece.

4.  **Minimax Algorithm with Alpha-Beta Pruning:**
    This is an adversarial search problem where White minimizes the mate depth and Black maximizes it.
    *   **Function Signature:** `minimax(wk, wr, bk, currentWhiteMoves, isWhiteTurn, alpha, beta)`
        *   `wk, wr, bk`: Current piece positions.
        *   `currentWhiteMoves`: The number of white moves made so far to reach this state. This is our target score.
        *   `isWhiteTurn`: True if it's White's turn, false if Black's.
        *   `alpha, beta`: For alpha-beta pruning.
    *   **Return Value:** The function returns the minimum number of White moves required to checkmate Black from the current state, or `Infinity` if no mate is possible (within the depth limit or it's a stalemate/loss for White).
    *   **Base Cases:**
        *   **Depth Limit:** If `currentWhiteMoves` exceeds 13 (the maximum allowed mate depth), return `Infinity` (no mate found within limits).
        *   **Game Over Conditions (Checkmate/Stalemate):** Before generating moves for the current player, we check if the current player *to move* has any legal moves.
            *   If no legal moves and the current player's king is in check: It's a checkmate. The *previous* player won.
                *   If `isWhiteTurn` is true (White is checkmated by Black), return `Infinity` (bad for White).
                *   If `isWhiteTurn` is false (Black is checkmated by White), return `currentWhiteMoves` (White won in this many moves).
            *   If no legal moves and the current player's king is NOT in check: It's a stalemate (draw). Return `Infinity`.
    *   **Recursive Steps:**
        *   **White's Turn (Minimizing Player):**
            *   Initialize `minMateDepth = Infinity`.
            *   Generate all legal moves for White.
            *   For each legal move:
                *   Apply the move to get `newState`.
                *   Recursively call `minimax(newState, currentWhiteMoves + 1, false, alpha, beta)`. (Increment `currentWhiteMoves` because White made a move, switch to Black's turn).
                *   Update `minMateDepth = min(minMateDepth, score)`.
                *   Perform alpha-beta pruning: `alpha = max(alpha, minMateDepth)`. If `beta <= alpha`, break.
            *   Return `minMateDepth`.
        *   **Black's Turn (Maximizing Player):**
            *   Initialize `maxMateDepth = -Infinity`.
            *   Generate all legal moves for Black.
            *   For each legal move:
                *   Apply the move to get `newState`.
                *   Recursively call `minimax(newState, currentWhiteMoves, true, alpha, beta)`. (`currentWhiteMoves` does *not* increment for Black's move, switch back to White's turn).
                *   Update `maxMateDepth = max(maxMateDepth, score)`.
                *   Perform alpha-beta pruning: `beta = min(beta, maxMateDepth)`. If `beta <= alpha`, break.
            *   Return `maxMateDepth`.

5.  **Transposition Table (Memoization):**
    To avoid recomputing scores for identical states, a `Map` (`memo`) is used to store `(stateKey, mateDepth)` pairs. This significantly speeds up the search. The `memo` table is cleared at the start of each turn to ensure fresh computation for the new initial state.

6.  **Main Game Loop:**
    *   Read initial piece positions.
    *   In a loop:
        *   Read opponent's move. If not "NA" (first turn), update Black King's position.
        *   Call `findBestWhiteMove` to get the optimal move. This function iterates through all of White's possible first moves, and for each, calls `minimax` to determine the mate depth assuming optimal play from both sides. It chooses the move that leads to the smallest mate depth.
        *   Print the chosen move.
        *   Update White King/Rook positions based on the chosen move for the next iteration.

## Code