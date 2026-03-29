The puzzle "Ghost Legs" requires simulating a path through a diagram to map top labels to bottom labels. The diagram consists of vertical lines ('|') and horizontal connectors ('--'). When a path encounters a horizontal connector, it must follow it to the adjacent vertical line before continuing downwards.

Here's a breakdown of the approach:

1.  **Input Parsing:**
    *   Read `W` (width) and `H` (height) of the diagram.
    *   Read the `H` lines of the diagram into an array of strings.

2.  **Extracting Labels:**
    *   **Top Labels:** The first line of the diagram contains the top labels. Iterate through this string. Any non-space character is a label. Store these labels along with their original column index. It's crucial to maintain the original order (left to right) for the output. A `[{ label: string, col: number }]` array is suitable for this.
    *   **Bottom Labels:** The last line of the diagram contains the bottom labels. Iterate through this string and store non-space characters as labels, mapping their column index to the label. A `Map<number, string>` is efficient for looking up the final bottom label by column.

3.  **Path Traversal Simulation:**
    *   For each top label found (and its starting column `startCol`):
        *   Initialize `currentCol` to `startCol`.
        *   Iterate through the rows of the diagram from the second line (index 1) up to the second-to-last line (index `H-2`). These are the rows that contain the vertical lines and horizontal connectors.
        *   At each `(row, currentCol)` position:
            *   **Check for a rightward connector (`|--`):** If `diagramLines[row][currentCol + 1]` is `'-'` AND `diagramLines[row][currentCol + 2]` is `'-'`, it means the current path is at the left end of a horizontal connector. The path must move to the right. Update `currentCol` by adding 3 (to skip `|`, `--`, and land on the next `|`). Ensure bounds `currentCol + 2 < W`.
            *   **Check for a leftward connector (`--|`):** If the path didn't move right, check for a leftward connector. If `diagramLines[row][currentCol - 1]` is `'-'` AND `diagramLines[row][currentCol - 2]` is `'-'`, it means the current path is at the right end of a horizontal connector. The path must move to the left. Update `currentCol` by subtracting 3. Ensure bounds `currentCol - 2 >= 0`.
            *   The problem statement guarantees that "left and right horizontal connectors will never appear at the same point", so an `if-else if` structure is correct here. If no connector is found in either direction, the path simply continues straight down in the `currentCol`.
    *   After iterating through all intermediate rows, `currentCol` will hold the final column index reached at the bottom of the diagram. Use this `currentCol` to look up the corresponding bottom label from the `bottomLabelsMap`.
    *   Form the pair (e.g., "A2") and store it.

4.  **Output:**
    *   Print all stored pairs, each on a new line, in the order corresponding to the left-to-right order of the top labels.

**Example Walkthrough (A to 2):**

Let's trace starting from 'A' at `col=0` for the given example:

```
A  B  C  (row 0)
|  |  |  (row 1)
|--|  |  (row 2)
|  |--|  (row 3)
|  |--|  (row 4)
|  |  |  (row 5)
1  2  3  (row 6)
```

*   **Initial:** `currentCol = 0` (for 'A')
*   **Row 1 (`|  |  |`):**
    *   At `(1,0)`: No horizontal connector. `currentCol` remains `0`.
*   **Row 2 (`|--|  |`):**
    *   At `(2,0)`: `diagramLines[2][1]` is `'-'` and `diagramLines[2][2]` is `'-'`. This is a `|--` to the right.
    *   `currentCol` becomes `0 + 3 = 3`.
*   **Row 3 (`|  |--|`):**
    *   At `(3,3)`: `diagramLines[3][4]` is `'-'` and `diagramLines[3][5]` is `'-'`. This is a `|--` to the right.
    *   `currentCol` becomes `3 + 3 = 6`.
*   **Row 4 (`|  |--|`):**
    *   At `(4,6)`: `diagramLines[4][5]` is `'-'` and `diagramLines[4][4]` is `'-'`. This is a `--|` from the left.
    *   `currentCol` becomes `6 - 3 = 3`.
*   **Row 5 (`|  |  |`):**
    *   At `(5,3)`: No horizontal connector. `currentCol` remains `3`.
*   **End:** Path ends at `currentCol = 3`. The bottom label at column 3 is '2'. So, `A2`.

This matches the example output. The logic holds for all given cases.