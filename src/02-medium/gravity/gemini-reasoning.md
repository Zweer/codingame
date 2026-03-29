The problem asks us to simulate gravity on a 2D grid composed of '.' (empty space) and '#' (rock) characters. The goal is to make all '#' characters fall to the bottom of their respective columns, effectively stacking them up, and then print the resulting grid.

**Understanding the Gravity Effect**

Gravity in this context means that each '#' character in a column will move downwards until it hits either the bottom of the grid or another '#' character below it. This implies that within any single column, the '#' characters will always occupy the lowest possible positions, forming a contiguous block at the bottom. The '.' characters will then occupy the remaining space at the top of the column. Crucially, the total number of '#' characters in any given column remains constant.

**Algorithm**

Based on this understanding, the solution can be approached column by column:

1.  **Read Input and Initialize Grid**:
    *   First, read the `width` and `height` of the grid.
    *   Then, read `height` lines of characters. It's convenient to store the grid as a 2D array of characters (e.g., `string[][]` in TypeScript), where `grid[r][c]` represents the character at row `r` and column `c`. This allows for easy modification of individual cells.

2.  **Process Each Column**:
    *   Iterate through each column `c` from `0` to `width - 1`.
    *   For each column `c`:
        *   **Count '#' Characters**: Iterate through all rows `r` from `0` to `height - 1` in the current column. Count how many '#' characters are present in this column. Let's call this `hashCount`.
        *   **Reconstruct Column**: Now that we know `hashCount` for the current column, we can determine its new state:
            *   The bottom `hashCount` rows of this column will be filled with '#'.
            *   The top `height - hashCount` rows of this column will be filled with '.'.
            *   We can implement this by iterating through the rows `r` again for the current column `c`. If `r` is less than `height - hashCount` (meaning it's one of the top `height - hashCount` positions), set `grid[r][c]` to '.'. Otherwise (meaning `r` is one of the bottom `hashCount` positions), set `grid[r][c]` to '#'.

3.  **Print Output Grid**:
    *   After processing all columns, iterate through each row `r` from `0` to `height - 1`.
    *   For each row, join the characters in that row back into a single string and print it.

**Example Walkthrough (from problem description)**

Consider a column with `height = 5` and the characters:
```
# (row 0)
. (row 1)
. (row 2)
# (row 3)
# (row 4)
```
1.  **Count '#'**: There are three '#' characters (`hashCount = 3`).
2.  **Reconstruct**: Since `height = 5` and `hashCount = 3`:
    *   The top `height - hashCount = 5 - 3 = 2` rows should be '.'.
    *   The bottom `hashCount = 3` rows should be '#'.
    So the column becomes:
    ```
    . (row 0)
    . (row 1)
    # (row 2)
    # (row 3)
    # (row 4)
    ```
This matches the expected behavior and the example output.

**Constraints Check**

The constraints `0 < width < 100` and `0 < height < 10` indicate that the grid is very small.
The algorithm involves two nested loops for columns and rows (one for counting, one for reconstructing), resulting in a time complexity of O(width * height). With max values 99x9, this is `99 * 9 = 891` operations for counting and another `891` for reconstruction, totaling less than 2000 operations, which is extremely fast and well within typical time limits.