The puzzle asks us to validate a potential Othello move and, if legal, report the resulting counts of white and black tokens. Othello (also known as Reversi) involves placing a token to "sandwich" opponent's tokens between the new token and an existing token of the player's color. The sandwiched tokens are then flipped to the player's color. This process must occur in at least one of the eight directions (horizontal, vertical, or diagonal) for the move to be legal.

Here's a step-by-step breakdown of the solution logic:

1.  **Input Reading**:
    *   The first 8 lines represent the 8x8 Othello board. Each line is read and split into an array of characters (e.g., 'B', 'W', '-'). This forms a `string[][]` representing the board.
    *   The 9th line contains the player's color ('B' or 'W') and the chess-like coordinates of the move (e.g., `c4`). This line is parsed to extract the `playerColor`, `opponentColor`, and the `moveStr`.

2.  **Coordinate Conversion**:
    *   The chess-like coordinates (e.g., `a1`, `c4`, `h8`) need to be converted into 0-indexed row and column numbers.
        *   The column letter (`a` through `h`) is converted to an index by subtracting the ASCII value of 'a'. So, 'a' becomes 0, 'b' becomes 1, and so on.
        *   The row number (`1` through `8`) is converted to an index by subtracting 1. So, '1' becomes 0, '2' becomes 1, and so on.
    *   For `c4`, this translates to `col = 2`, `row = 3`.

3.  **Initial Move Validation (`NOPE` Check)**:
    *   The very first check is to see if the target cell for the move (`moveR`, `moveC`) is already occupied. If `board[moveR][moveC]` is not `'-'`, the move is illegal, and "NOPE" is printed.

4.  **Sandwich Check (`NULL` and Legality)**:
    *   This is the core of the Othello logic. A move is legal only if it results in at least one "sandwich."
    *   **Directions**: We iterate through all 8 possible directions from the `moveR, moveC` coordinates: horizontal, vertical, and diagonal. These are represented as `[dr, dc]` pairs (change in row, change in column).
    *   **Traversing a Direction**: For each direction:
        *   We start from the cell *adjacent* to the new token's position in that direction.
        *   We keep moving in that direction, collecting any opponent's tokens encountered.
        *   If we then encounter a token of the `playerColor` (our own color), and we have collected at least one opponent's token along the way, a sandwich is formed. All the collected opponent tokens in `currentDirectionFlipped` are added to a `tokensToFlip` list. The `isLegalMove` flag is set to `true`.
        *   If we encounter an empty cell (`'-'`) or go off the board before finding an own-colored token, no sandwich is formed in that direction.
    *   After checking all 8 directions:
        *   If `isLegalMove` is still `false` (meaning no sandwiches were formed in any direction), the move is illegal, and "NULL" is printed.

5.  **Applying the Move and Counting Tokens**:
    *   If `isLegalMove` is `true`, the move is legal.
    *   A deep copy of the original board (`newBoard`) is created. This is crucial because we don't want to modify the original board state until we confirm the move is legal.
    *   The new token (`playerColor`) is placed at `newBoard[moveR][moveC]`.
    *   All tokens collected in the `tokensToFlip` list are changed to `playerColor` on `newBoard`.
    *   Finally, the `newBoard` is iterated through to count the total number of 'W' and 'B' tokens.
    *   The counts (`countW countB`) are then printed.

This structured approach correctly implements the Othello rules for move legality and board state calculation.