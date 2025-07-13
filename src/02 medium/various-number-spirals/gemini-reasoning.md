The problem asks us to generate a number spiral of size `n x n`. The spiral's characteristics are determined by three inputs: its size `n`, its starting corner, and its order (ascending/descending) along with its direction (clockwise/counter-clockwise). The output should be the grid of numbers, with elements tab-separated.

Here's a breakdown of the approach:

1.  **Grid Initialization**: Create an `n x n` 2D array (matrix) initialized with zeros. These zeros will serve as markers for "unvisited" cells.

2.  **Number Sequence**:
    *   If the order is ascending (`+`), numbers start from 1 and increment up to `n*n`.
    *   If the order is descending (`-`), numbers start from `n*n` and decrement down to 1. The problem specifies that `n*n` should be placed at the starting corner.

3.  **Starting Position**:
    The input `v h` defines the initial `(row, col)` in the grid:
    *   `t l`: (0, 0) - Top-Left
    *   `t r`: (0, n-1) - Top-Right
    *   `b l`: (n-1, 0) - Bottom-Left
    *   `b r`: (n-1, n-1) - Bottom-Right

4.  **Spiral Traversal Logic**:
    This is the core of the solution. We use a simulation approach:
    *   We maintain `currentRow` and `currentCol` to track the current position.
    *   We define four direction vectors `(dr, dc)` for movement: Right `(0, 1)`, Down `(1, 0)`, Left `(0, -1)`, Up `(-1, 0)`. These are stored in arrays, indexed 0 to 3.
    *   `dirIndex` keeps track of the current direction.
    *   The `initial dirIndex` is crucial. It depends on the starting corner and the overall spiral direction (clockwise or counter-clockwise). For example, if starting Top-Left and going clockwise, the first move is Right. If starting Top-Left and going counter-clockwise, the first move is Down. This initial `dirIndex` is determined via a series of `if/else if` statements.
    *   We iterate `n*n` times, filling one cell in each iteration.
        1.  Place `currentNum` at `grid[currentRow][currentCol]`.
        2.  Update `currentNum` (increment or decrement).
        3.  Calculate the `nextRow` and `nextCol` based on the current `currentRow`, `currentCol`, and `dr[dirIndex]`, `dc[dirIndex]`.
        4.  **Check for a "turn" condition**: If the `(nextRow, nextCol)` is out of bounds (less than 0 or greater/equal to `n`) OR if `grid[nextRow][nextCol]` is already filled (not 0), it means we've hit a boundary or an already visited cell. In this case, we need to change direction:
            *   If `direction` is clockwise (`c`), `dirIndex` increments by 1 (and wraps around using modulo 4).
            *   If `direction` is counter-clockwise (`cc`), `dirIndex` decrements by 1 (or adds 3, modulo 4).
            *   After changing `dirIndex`, recalculate `nextRow` and `nextCol` using the *new* direction.
        5.  Update `currentRow = nextRow` and `currentCol = nextCol` for the next iteration.

5.  **Output**: After filling the entire grid, iterate through each row and print its elements joined by tabs (`\t`), followed by a newline for each row.

This algorithm effectively simulates the spiral movement by placing numbers, checking for boundaries or already filled cells, and turning accordingly. The use of the grid itself as a "visited" tracker simplifies boundary management compared to tracking min/max rows/cols.

**Example Dry Run (n=3, t l, + c):**
*   `n=3`, `grid` is `3x3` zeros. `currentNum=1`, `numIncrement=1`.
*   Start `(0,0)`, `dirIndex=0` (Right).
*   **1st Iteration (i=0):**
    *   `grid[0][0] = 1`. `currentNum = 2`.
    *   `next = (0,1)`. Valid and empty. `(currentRow, currentCol)` becomes `(0,1)`.
*   **2nd Iteration (i=1):**
    *   `grid[0][1] = 2`. `currentNum = 3`.
    *   `next = (0,2)`. Valid and empty. `(currentRow, currentCol)` becomes `(0,2)`.
*   **3rd Iteration (i=2):**
    *   `grid[0][2] = 3`. `currentNum = 4`.
    *   `next = (0,3)`. Out of bounds (`nextCol >= n`). Turn!
    *   `dirIndex = (0+1)%4 = 1` (Down).
    *   Recalculate `next = (0+1, 2+0) = (1,2)`. Valid and empty.
    *   `(currentRow, currentCol)` becomes `(1,2)`.
*   ...and so on.

This process continues until all `n*n` cells are filled, replicating the spiral pattern.