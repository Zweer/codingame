The problem asks us to implement a hint system for a match-3 game on a 9x9 grid. We need to find all pairs of adjacent tokens that, when swapped, result in a new horizontal or vertical alignment of 3 or more identical tokens. The output should list these pairs, ordered by the coordinates of the first token (row then column), and each pair should be reported only once (e.g., `(A,B)` but not `(B,A)`).

Here's the breakdown of the solution strategy:

1.  **Grid Representation**: A 2D array (matrix) `board[row][col]` is used to store the token types. The grid dimensions are fixed at 9 rows and 9 columns.

2.  **Checking for Matches (`checkMatchAtPosition`)**:
    *   This function takes the board and a `(row, col)` coordinate as input.
    *   It determines the token value at `(row, col)`.
    *   It then checks for horizontal matches: It counts consecutive identical tokens to the left and right of `(row, col)`. If the total count (including the token at `(row, col)`) is 3 or more, a horizontal match exists.
    *   Similarly, it checks for vertical matches: It counts consecutive identical tokens above and below `(row, col)`. If the total count is 3 or more, a vertical match exists.
    *   The function returns `true` if either a horizontal or vertical match of 3 or more is found that includes the specified `(row, col)` position, otherwise `false`.

3.  **Iterating Through Swaps (`checkSwapAndMatch`)**:
    *   We need to consider every possible adjacent swap. To ensure each pair is reported once and in the correct order (`row1 col1 row2 col2` where `(row1, col1)` is lexicographically smaller than `(row2, col2)`), we can iterate through each cell `(r, c)` and only consider swaps with its right neighbor `(r, c+1)` and its bottom neighbor `(r+1, c)`. This way, `(r, c)` will always be the "first" coordinate in the pair.
    *   For each potential swap:
        *   **Temporary Swap**: The `checkSwapAndMatch` function performs the swap directly on the global `board` array. This is safe because it immediately undoes the swap after checking.
        *   **Match Check**: After swapping, it calls `checkMatchAtPosition` for *both* positions involved in the swap (`(r1, c1)` and `(r2, c2)`). If a match is formed at either of these new positions, the swap is considered valid. This is crucial because a match can be formed at the original token's new spot, or at the swapped token's new spot.
        *   **Undo Swap**: After checking, the `checkSwapAndMatch` function restores the board to its original state by swapping the tokens back.
        *   **Record Result**: If the swap is valid, the coordinates `(r1, c1, r2, c2)` are added to a `results` list.

4.  **Main Program Flow**:
    *   Read the 9 lines of input, parsing each line into an array of numbers and populating the `board`.
    *   Loop through each cell `(r, c)` from `(0,0)` to `(8,8)`.
    *   Inside the loop, if `c+1` is within bounds, try swapping `(r, c)` with `(r, c+1)` using `checkSwapAndMatch`. If it's a valid move, add `r c r c+1` to `results`.
    *   If `r+1` is within bounds, try swapping `(r, c)` with `(r+1, c)` using `checkSwapAndMatch`. If it's a valid move, add `r c r+1 c` to `results`.
    *   Finally, print the total number of valid pairs (`results.length`), followed by each pair on a new line.

This approach ensures correctness, adheres to the ordering requirement, and reports each valid pair exactly once.