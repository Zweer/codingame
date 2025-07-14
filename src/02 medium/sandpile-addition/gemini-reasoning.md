The problem asks us to simulate the addition of two "sandpiles". A sandpile is defined as a square matrix where each cell contains a number of sand grains between 0 and 3.

The process of adding two sandpiles involves two main steps:

1.  **Initial Element-wise Addition**: First, we simply add the corresponding elements of the two input matrices. For example, if `sandpile1[r][c]` is 2 and `sandpile2[r][c]` is 3, the initial sum for `resultGrid[r][c]` will be 5.

2.  **Normalization (Toppling)**: After the initial sum, the resulting matrix might not be a valid sandpile because some cells might contain 4 or more grains. These cells must "topple":
    *   If a cell `(r, c)` has 4 or more grains, it "loses" 4 grains.
    *   These 4 grains are then distributed, one to each of its four immediate neighbors (up, down, left, right).
    *   If a neighbor is outside the grid boundaries (i.e., off an edge), the grain is lost.
    *   This process must be repeated until *all* cells in the matrix have 3 grains or less. This implies that if a cell topples and causes a neighbor to also exceed 3 grains, that neighbor must then topple, potentially creating a chain reaction.

**Algorithm Steps:**

1.  **Read Input `N`**: Get the size of the square sandpiles.
2.  **Initialize Sandpile Matrices**: Create two `N x N` 2D arrays (e.g., `number[][]`) to store the input sandpiles.
3.  **Read Sandpile Data**: Populate the two sandpile matrices by reading `2*N` lines of input. Each character in a line represents a digit for a cell.
4.  **Calculate Initial Sum**: Create a `resultGrid` matrix of size `N x N`. Iterate through both input sandpiles and sum their corresponding elements, storing the result in `resultGrid[r][c] = sandpile1[r][c] + sandpile2[r][c]`.
5.  **Normalization Loop**:
    *   Use a `while` loop that continues as long as `toppleOccurred` is `true`. Initialize `toppleOccurred` to `true` to enter the loop at least once.
    *   Inside the `while` loop, set `toppleOccurred = false` at the beginning of each iteration.
    *   Iterate through every cell `(r, c)` of the `resultGrid`:
        *   If `resultGrid[r][c]` is 4 or greater:
            *   Set `toppleOccurred = true` (since a topple has happened, another full scan might be needed).
            *   Subtract 4 from `resultGrid[r][c]`.
            *   For each of its four neighbors (up, down, left, right):
                *   Calculate the neighbor's coordinates (`nr`, `nc`).
                *   Check if `(nr, nc)` is within the grid boundaries (`0 <= nr < N` and `0 <= nc < N`).
                *   If it's in bounds, increment `resultGrid[nr][nc]` by 1.
    *   If, after checking all cells in an iteration, `toppleOccurred` remains `false`, it means no cells had 4 or more grains, so the matrix is stable, and the `while` loop can terminate.
6.  **Print Output**: Iterate through the final `resultGrid` and print each row as a string of digits, without spaces.

**Constraints Analysis:**
The constraint `2 <= N <= 10` is very small. This means that a simple iterative approach for normalization (scanning the entire grid repeatedly until no changes occur) is perfectly efficient and will complete quickly. The maximum initial sum in a cell is `3+3=6`. Even if a cell constantly receives grains and topples, the system is guaranteed to stabilize (a property of Abelian Sandpiles), and given `N` is small, the number of iterations will be low.

**Example Walkthrough (from problem description):**
Input:
```
3
121
202
121
020
202
020
```

1.  **Initial Sum:**
    ```
    141
    404
    141
    ```
2.  **Normalization (Iteration 1):** `toppleOccurred = true`
    *   `(0,1)` is 4: `(0,1)` becomes 0. Neighbors `(0,0)`, `(0,2)`, `(1,1)` get +1.
    *   Grid: `303, 040, 303` (values are accumulated and cells topple in sequence).
    *   Specifically, `(1,0)`, `(1,2)`, and `(2,1)` will also topple in this pass, causing `(1,1)` to become `4` again at the end of this pass.
    *   After iterating through all cells, `toppleOccurred` is `true` because cells `(0,1), (1,0), (1,2), (2,1)` all toppled.
3.  **Normalization (Iteration 2):** `toppleOccurred = true` (because `(1,1)` became 4 in the previous step)
    *   `(1,1)` is 4: `(1,1)` becomes 0. Neighbors `(0,1)`, `(2,1)`, `(1,0)`, `(1,2)` get +1.
    *   Grid: `313, 101, 313`
    *   After iterating through all cells, `toppleOccurred` is still `true` because `(1,1)` toppled.
4.  **Normalization (Iteration 3):** `toppleOccurred = false`
    *   Scan all cells. All values are 0, 1, or 3. No cells are >= 4. `toppleOccurred` remains `false`.
    *   Loop terminates.

Final Output:
```
313
101
313
```
This matches the example.