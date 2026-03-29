The problem requires us to simulate chess moves on a board starting from a given FEN (Forsyth-Edwards Notation) string and then output the final board state as an FEN string. We only need to handle the piece placement part of the FEN.

Here's a breakdown of the solution logic:

1.  **FEN Parsing (Input):**
    *   The FEN string for piece placement is `rank8/rank7/.../rank1`.
    *   Each rank string consists of piece characters (e.g., `p`, `R`, `k`) and digits representing consecutive empty squares.
    *   We'll represent the board as an 8x8 2D array (`string[][]`). To map FEN ranks (8 to 1) and files (a to h) to array indices:
        *   FEN rank 8 maps to `row 0`. FEN rank 1 maps to `row 7`. So, `row = 8 - FEN_rank_digit`.
        *   FEN file 'a' maps to `col 0`. FEN file 'h' maps to `col 7`. So, `col = charCodeAt(0) - 'a'.charCodeAt(0)`.
    *   The `FENBoard` class's constructor will handle this parsing.

2.  **Move Application:**
    *   Moves are given as strings like `e2e4`, `e7e8Q`, `e1g1`, `h5g6`.
    *   We need to parse the start square, target square, and an optional promotion piece.
    *   The problem statement guarantees that "All the moves are legal and can be made following standard chess rules." This is crucial as it means we don't need to implement move validation (e.g., checking if paths are clear, if the king is in check, or if castling/en passant rights are valid). We simply execute the described move.
    *   **Coordinate Conversion:** A helper function `algToCoords(square: string)` will convert algebraic notation (e.g., "e2") to our `[row, col]` array indices.
    *   **Types of Moves:**
        *   **Castling:** If a King (`K` or `k`) moves two squares horizontally (e.g., `e1g1` or `e8c8`), it's a castling move. In addition to moving the King, we must also move the corresponding Rook.
            *   Kingside (King moves to `g` file): Rook from `h` moves to `f`.
            *   Queenside (King moves to `c` file): Rook from `a` moves to `d`.
        *   **En Passant:** If a pawn (`P` or `p`) moves diagonally to an empty square, and there's an opponent's pawn on the adjacent file on the *same rank as the capturing pawn's start position*, then it's an en passant capture. The opponent's pawn (which is on the `start_row` but `target_col`) is removed.
        *   **Pawn Promotion:** If the move string has a fifth character (e.g., `e7e8Q`), it signifies pawn promotion. The pawn that lands on the target square is immediately replaced by the specified promotion piece.
        *   **Standard Move:** For all other moves, the piece is simply moved from the start square to the target square, and the start square is cleared.

3.  **FEN Generation (Output):**
    *   After applying all moves, the `toFen()` method of the `FENBoard` class will convert the 2D array back into an FEN string.
    *   It iterates through each row (rank), counts consecutive empty squares, and appends the piece characters or the empty square counts to build the rank string. Ranks are then joined by `/`.

**Data Structure:**

*   `board: string[][]`: An 8x8 array of strings, where each string is a piece character (e.g., 'p', 'R') or '.' for an empty square.

**Example Tracing (from reasoning):**

*   **`e2e4`**: White Pawn `P` moves from `(6,4)` to `(4,4)`. `board[4][4] = 'P'`, `board[6][4] = '.'`.
*   **`e1g1` (White Kingside Castling)**: King `K` moves from `(7,4)` to `(7,6)`. Rook `R` moves from `(7,7)` to `(7,5)`.
    *   `board[7][6] = 'K'`, `board[7][4] = '.'`
    *   `board[7][5] = 'R'`, `board[7][7] = '.'`
*   **`h5g6` (En Passant)**: White Pawn `P` moves from `(3,7)` to `(2,6)`. Target `(2,6)` is empty. An opponent's pawn `p` is at `(3,6)`.
    *   `board[3][6] = '.'` (remove captured pawn)
    *   `board[2][6] = 'P'`, `board[3][7] = '.'` (move capturing pawn)
*   **`e7e8Q` (Promotion)**: Black Pawn `p` moves from `(1,4)` to `(0,4)`. `Q` is the promotion piece.
    *   `board[0][4] = 'p'`, `board[1][4] = '.'` (initial move)
    *   `board[0][4] = 'Q'` (apply promotion)

This robust approach covers all specified move types while simplifying by leveraging the "moves are legal" constraint.