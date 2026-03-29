The Game of Life is a cellular automaton devised by the British mathematician John Horton Conway. The core idea is to simulate the evolution of a grid of cells based on simple rules that govern their birth, survival, or death.

**Reasoning:**

1.  **Input Reading:** The first step is to read the dimensions of the board (`width` and `height`) and then the initial state of each cell. We'll store this initial state in a 2D array, let's call it `board`. Since cell states are '0' or '1', we can parse them directly into numbers (0 for dead, 1 for live).

2.  **Separate Board for Next State:** A critical aspect of the Game of Life is that all cell updates for a new generation must be based *simultaneously* on the state of the *current* generation. If we were to update the `board` in place, changes made to a cell early in the iteration might affect the neighbor count for subsequent cells in the same iteration, leading to incorrect results. Therefore, we need to create a new 2D array, say `nextBoard`, to store the calculated states for the next generation. After all calculations are done, `nextBoard` will hold the final state.

3.  **Iterating Through Cells:** We'll use nested loops to iterate through every cell `(r, c)` on the `board`.

4.  **Counting Live Neighbors:** For each cell `(r, c)`, we need to count its live neighbors. A cell has eight possible neighbors (horizontally, vertically, and diagonally). We'll define arrays for relative row and column changes (`dr` and `dc`) to easily iterate through these neighbor positions. For each potential neighbor `(nr, nc)`:
    *   We must first check if `(nr, nc)` is within the board's boundaries (i.e., `0 <= nr < height` and `0 <= nc < width`).
    *   If it's within bounds, we check its state in the `currentBoard` (the initial state board). If it's '1' (live), we increment our `liveNeighbors` count.

5.  **Applying Game of Life Rules:** Once the `liveNeighbors` count for a cell `(r, c)` is determined, we apply the four rules:
    *   **If the current cell is LIVE (1):**
        *   If `liveNeighbors < 2`: It dies (under-population). `nextState = 0`.
        *   If `liveNeighbors == 2` or `liveNeighbors == 3`: It lives. `nextState = 1`.
        *   If `liveNeighbors > 3`: It dies (over-population). `nextState = 0`.
    *   **If the current cell is DEAD (0):**
        *   If `liveNeighbors == 3`: It becomes live (reproduction). `nextState = 1`.
        *   Otherwise: It remains dead. `nextState = 0`.
    The calculated `nextState` is then stored in `nextBoard[r][c]`.

6.  **Outputting the Result:** After processing all cells, `nextBoard` contains the updated state. We then iterate through `nextBoard` row by row, converting each row (an array of numbers) back into a string of '0's and '1's, and print it.

**TypeScript Considerations:**

*   `readline()`: This function is globally available in the CodinGame environment for reading input lines.
*   `console.log()`: Used for printing output.
*   Array initialization: `Array(height).fill(0).map(() => Array(width).fill(0))` is a common way to create a 2D array filled with zeros in TypeScript.
*   Type safety: Using `parseInt` for converting string inputs to numbers and specifying types for variables (e.g., `width: number`, `board: number[][]`) improves code readability and helps prevent common errors.