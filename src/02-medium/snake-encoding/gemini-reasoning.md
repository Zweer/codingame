The problem asks us to apply a specific "snake encoding" pattern to a square grid of characters `X` times. The encoding involves shifting characters to new positions within the grid, with the movement pattern changing directions based on the column parity and current position. Crucially, the encoding for one step must be performed using the *original* grid from that step to produce a *new* grid, rather than modifying the grid in place.

Let's denote the original grid for a given encoding step as `currentGrid` and the new, encoded grid as `nextGrid`. Both are `N x N` matrices of characters.

**Encoding Logic Breakdown (One Step):**

1.  **Initialize `nextGrid`**: Create a new `N x N` grid, `nextGrid`, to store the result of the current encoding step. This grid should be distinct from `currentGrid`.

2.  **Iterate through columns (`c` from `0` to `N-1`):**
    *   **Even Columns (`c % 2 === 0`): Upwards Movement**
        *   **Vertical Shift:** Characters in this column (from `currentGrid[N-1][c]` up to `currentGrid[1][c]`) move one row *up*.
            *   Specifically, `currentGrid[r][c]` moves to `nextGrid[r-1][c]` for `r` from `N-1` down to `1`.
        *   **Column Switch (if not the last column):** The character at the top of the current column (`currentGrid[0][c]`) moves to the top of the next column (`nextGrid[0][c+1]`).
            *   This applies if `c < N-1`.

    *   **Odd Columns (`c % 2 !== 0`): Downwards Movement**
        *   **Vertical Shift:** Characters in this column (from `currentGrid[0][c]` down to `currentGrid[N-2][c]`) move one row *down*.
            *   Specifically, `currentGrid[r][c]` moves to `nextGrid[r+1][c]` for `r` from `0` up to `N-2`.
        *   **Column Switch (if not the last column):** The character at the bottom of the current column (`currentGrid[N-1][c]`) moves to the bottom of the next column (`nextGrid[N-1][c+1]`).
            *   This applies if `c < N-1`.

3.  **Special Final Rule:** After processing all columns, the character at the top-right corner of the `currentGrid` (`currentGrid[0][N-1]`) moves to the bottom-left corner of the `nextGrid` (`nextGrid[N-1][0]`). This completes the cycle for one encoding step.

4.  **Update Grid:** After `nextGrid` is fully populated, it becomes the `currentGrid` for the next iteration (if `X > 1`).

**Example Trace (N=3, one step):**

Initial `currentGrid`:
```
A B C
D E F
G H I
```

Initialize `nextGrid` as empty:
```
_ _ _
_ _ _
_ _ _
```

*   **Column 0 (c=0, even - upwards):**
    *   `G (2,0)` moves to `(1,0)`: `nextGrid[1][0] = 'G'`
    *   `D (1,0)` moves to `(0,0)`: `nextGrid[0][0] = 'D'`
    *   `A (0,0)` moves to `(0,1)` (column switch): `nextGrid[0][1] = 'A'`
    `nextGrid` after c=0:
    ```
    D A _
    G _ _
    _ _ _
    ```

*   **Column 1 (c=1, odd - downwards):**
    *   `B (0,1)` moves to `(1,1)`: `nextGrid[1][1] = 'B'`
    *   `E (1,1)` moves to `(2,1)`: `nextGrid[2][1] = 'E'`
    *   `H (2,1)` moves to `(2,2)` (column switch): `nextGrid[2][2] = 'H'`
    `nextGrid` after c=1:
    ```
    D A _
    G B _
    _ E H
    ```

*   **Column 2 (c=2, even - upwards):**
    *   `I (2,2)` moves to `(1,2)`: `nextGrid[1][2] = 'I'`
    *   `F (1,2)` moves to `(0,2)`: `nextGrid[0][2] = 'F'`
    *   No column switch (last column).
    `nextGrid` after c=2:
    ```
    D A F
    G B I
    _ E H
    ```

*   **Special Final Rule:**
    *   `C (0,2)` moves to `(2,0)`: `nextGrid[2][0] = 'C'`
    Final `nextGrid`:
    ```
    D A F
    G B I
    C E H
    ```
This matches the provided example output.

The solution involves reading inputs, repeatedly calling the `encode` function `X` times, and then printing the final grid. Since `N` is small (up to 20), an `O(N^2)` operation per step, repeated `X` times, is efficient enough.