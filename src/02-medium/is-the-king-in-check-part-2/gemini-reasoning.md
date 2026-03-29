The puzzle asks us to determine if a King ('k') is in check by either of two enemy pieces ('B', 'N', 'R', 'Q') on an 8x8 chessboard. The key challenges are:
1.  **Multiple Enemies**: Two enemy pieces need to be checked.
2.  **Blocking**: Rooks, Bishops, and Queens can be blocked by other pieces (in this case, the *other* enemy piece). Knights cannot be blocked.
3.  **King Symbol**: The King is represented by 'k' (lowercase), unlike 'K' in Part 1.

Here's the approach:

1.  **Board Parsing**:
    *   Read the 8 lines of input to construct an 8x8 2D array representing the chessboard.
    *   During parsing, identify the coordinates of the King (`k`) and the two enemy pieces (their type and coordinates).

2.  **`isSafe(r, c)` Helper**: A simple function to check if a given row and column are within the 8x8 board boundaries.

3.  **`isAttacking` Function**: This is the core logic. It determines if a single `attacker` piece can put the `kingPos` in check, given the `otherEnemyPos` (which might block the attack) and the `board` state.
    *   **Knight ('N') Logic**: Knights move in L-shapes (two squares in one direction, one square perpendicularly). They are unique because their attacks are *not* blocked by other pieces. The `isAttacking` function will iterate through all 8 possible L-shape target squares from the Knight's position. If any of these squares matches the King's position and is within bounds, the Knight is attacking.
    *   **Rook ('R'), Bishop ('B'), Queen ('Q') Logic (Linear Pieces)**: These pieces attack in straight lines (horizontal/vertical for Rook, diagonal for Bishop, both for Queen).
        *   The function defines the possible directions for the attacker (e.g., `[0, 1]` for right, `[1, 1]` for down-right).
        *   For each direction, it iterates step-by-step from the attacker's position outwards.
        *   At each step (`currR`, `currC`):
            *   If `(currR, currC)` is the King's position, the King is in check, and `true` is returned.
            *   If `(currR, currC)` is the `otherEnemyPos` (the second enemy piece), it means the path to the King is blocked, so this direction is stopped, and the function moves to check the next direction.
            *   If `(currR, currC)` is an empty square (`_`), the iteration continues in that direction.
            *   Based on the problem constraints, there are only 3 pieces (`k` and two enemies). So, if a square is not `_` and not `k`, it *must* be the `otherEnemyPos`.
        *   If no attack path is found after checking all directions, `false` is returned.

4.  **Main Logic**:
    *   After parsing, we will have `kingPos`, `piece1` (attacker 1), and `piece2` (attacker 2).
    *   Call `isAttacking(piece1, kingPos, piece2, board)`. If `true`, the King is in check.
    *   If not already in check, call `isAttacking(piece2, kingPos, piece1, board)`. If `true`, the King is in check.
    *   Finally, print "Check" or "No Check" based on the result.

This approach ensures that both enemy pieces are checked, blocking is correctly applied for linear pieces, and Knights are handled as an exception.