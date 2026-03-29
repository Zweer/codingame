The problem asks us to simulate a "tumbling" process on a 2D landscape. A single tumble consists of two actions:
1.  Rotating the landscape counterclockwise by 90 degrees.
2.  Applying gravity, causing all '#' (heavy bits) to fall to the bottom of their respective columns.

The input provides the initial `width` and `height` of the map, the number of `count` tumbling actions, and the map itself, composed of '.' (empty bits) and '#' characters. The initial map is guaranteed to be in a "stable" configuration, meaning gravity has already been applied.

**1. Data Structure for the Map:**
A 2D array of strings (`string[][]`) is suitable to represent the grid. `grid[y][x]` will store the character at row `y` and column `x`.

**2. Rotation (Counterclockwise 90 degrees):**
Let the original grid have dimensions `H_old` (rows) by `W_old` (columns). A point `(x_old, y_old)` in the original grid (where `x_old` is column index and `y_old` is row index) moves to a new position `(x_new, y_new)` in the rotated grid.
For a 90-degree counterclockwise rotation around the origin `(0,0)`, a point `(x, y)` transforms to `(-y, x)`.
When mapping this to a new grid where `(0,0)` is the top-left:
*   The new grid will have dimensions `W_old` (rows) by `H_old` (columns).
*   The `x` coordinate in the new system (`x_new`) corresponds to the original `y_old`.
*   The `y` coordinate in the new system (`y_new`) corresponds to `-x_old`. To make it positive and relative to the new grid's height, we can use `(W_old - 1) - x_old`, where `W_old - 1` is the maximum column index of the original grid.

So, the transformation rule is:
`newGrid[new_y][new_x] = oldGrid[y_old][x_old]`
where:
`new_x = y_old`
`new_y = (W_old - 1) - x_old`

**3. Applying Gravity:**
After rotation, the new grid has new dimensions. Gravity acts downwards within each column.
To apply gravity to a grid:
*   Iterate through each column (`x`).
*   For each column, count the number of '#' characters (`hashCount`).
*   Create a new column. Fill the bottom `hashCount` cells with '#' and the remaining top cells with '.'. This can be done by iterating from `y = currentHeight - 1` down to `0`.

**4. Simulation Loop:**
The tumbling process is repeated `count` times. In each iteration:
*   The `currentGrid` is rotated using `rotateCounterClockwise`.
*   The rotated grid then has gravity applied using `applyGravity`.
*   The result becomes the `currentGrid` for the next iteration.

**5. Output:**
After all `count` tumbles are performed, the final `currentGrid` is printed. The problem states that:
*   If `count` is odd, the output will have `initial_width` lines of `initial_height` characters.
*   If `count` is even, the output will have `initial_height` lines of `initial_width` characters.
My `rotateCounterClockwise` function naturally swaps the dimensions in each step. If initial dimensions are `H0 x W0`:
*   After 1 tumble: `W0 x H0`
*   After 2 tumbles: `H0 x W0`
*   After `N` tumbles: `H0 x W0` if N is even, `W0 x H0` if N is odd.
This matches the output specification, so simply printing `currentGrid` row by row will result in the correct dimensions and orientation.

**Example Walkthrough (Initial state and first tumble):**
Input: `width=17, height=5`. `count=1`. Initial `currentGrid` is `5x17`.

1.  **Rotate (`count=1`):** `rotateCounterClockwise` is called.
    *   `H_old = 5`, `W_old = 17`.
    *   `H_new = 17`, `W_new = 5`. `newGrid` is `17x5`.
    *   For `oldGrid[y_old][x_old]` at `(0,0)` (top-left '.'):
        `new_x = 0`, `new_y = (17 - 1) - 0 = 16`.
        `newGrid[16][0] = '.'`
    *   For `oldGrid[y_old][x_old]` at `(4,16)` (bottom-right '#'):
        `new_x = 4`, `new_y = (17 - 1) - 16 = 0`.
        `newGrid[0][4] = '#'`
    *   This process fills the `newGrid` based on the 90-degree CCW rotation. For instance, the original column 16 (rightmost column) which is `[.,.,.,.,#]` (top to bottom) becomes the first row of `newGrid` (i.e., `newGrid[0]`), in the order `[.,.,.,.,#]`.

2.  **Apply Gravity (`count=1`):** `applyGravity` is called on the `17x5` rotated grid.
    *   For each of the 5 columns in this `17x5` grid, all '#' bits are moved to the bottom.
    *   For `newGrid[0]` (the first row of the rotated grid, which originated from the rightmost column of the input grid, i.e., `[.,.,.,.,#]`): This row is processed as a column for gravity purposes. Since it's already `[.,.,.,.,#]` after rotation, it remains `[.,.,.,.,#]` after gravity.
    *   This logic is applied to all 17 rows, which are treated as columns of 5 cells each for gravity application (as the internal representation is `rows x columns`).

The puzzle solution passed on CodinGame, confirming that the standard matrix rotation and gravity application were the correct approach, despite my initial confusion with the example's specific cell contents.