To solve this Battleship puzzle, we need to implement several key logic steps:

1.  **Parse Input**: Read the sister's shot coordinates and the 10x10 game grid.
2.  **Grid Validation**: This is the most complex part and involves two main checks:
    *   **Adjacency Rule**: Ensure no two ship parts (represented by `+` for intact or `_` for destroyed) touch each other diagonally. Also, ensure ships themselves are only connected horizontally or vertically (this is implicitly handled by how we identify ships).
    *   **Ship Count and Size Rule**: Identify all distinct ships on the grid and verify that there is exactly one of each required type:
        *   Aircraft carrier (size 5)
        *   Cruiser (size 4)
        *   Counter-torpedoist (size 3)
        *   Submarine (size 3)
        *   Torpedoist (size 2)
    *   If any validation fails, the output must be `INVALID`.
3.  **Analyze Shot (if grid is valid)**:
    *   Determine what the sister's shot hits:
        *   `MISSED`: If it hits water (`.`).
        *   `TOUCHE`: If it hits any part of a ship (`+` or `_`) and does *not* sink it.
        *   `TOUCHE COULE <size>`: If it hits an *intact* part (`+`) and causes the ship to become completely destroyed. `<size>` is the length of the sunk ship.
    *   **Game Over Condition**: After processing the shot, check if all ships are now sunk. If so, append ` THEN LOSE` to the output.

**Detailed Breakdown and Implementation Plan:**

1.  **Input Parsing**:
    *   The shot `A1`, `H7`, etc., needs to be converted to zero-indexed row/column. 'A' becomes 0, 'B' becomes 1, ..., 'J' becomes 9. '1' becomes 0, '10' becomes 9.
    *   The grid lines are read one by one and stored in a 2D array (e.g., `string[][]`).

2.  **Grid Validation - Adjacency**:
    *   Iterate through every cell `(r, c)` of the grid.
    *   If `grid[r][c]` is a ship part (`+` or `_`), check its four diagonal neighbors.
    *   If any diagonal neighbor `(nr, nc)` is also a ship part (`+` or `_`), then the grid is `INVALID`. This check must be performed before identifying ships, as it applies to *any* two ship parts.

3.  **Grid Validation - Ship Identification**:
    *   We need a way to find all connected ship parts. A Breadth-First Search (BFS) or Depth-First Search (DFS) is suitable.
    *   Use a `visited` 2D array to keep track of cells already processed as part of a ship.
    *   Iterate through the grid. When an unvisited ship part (`+` or `_`) is found at `(r, c)`:
        *   Start a BFS/DFS from `(r, c)`.
        *   During the traversal, collect all connected `+` and `_` cells (connected only by cardinal directions - horizontal or vertical). This ensures ships are straight lines.
        *   Count the number of `+` cells (`intactCount`) and `_` cells (`destroyedCount`) for this ship.
        *   Store the identified ship's properties: its cells (coordinates), its `size` (total length = `intactCount + destroyedCount`), `intactCount`, and `destroyedCount`.
    *   After traversing the entire grid, we'll have a list of all ships on the board.

4.  **Grid Validation - Ship Counts**:
    *   Count the occurrences of each ship size identified in the previous step.
    *   Compare these counts with the `expectedShipCounts` (1 of size 5, 1 of size 4, 2 of size 3, 1 of size 2).
    *   Also, verify that the total number of identified ships matches the total expected (1+1+2+1 = 5 ships).
    *   If counts don't match, or if any unexpected ship sizes are found, the grid is `INVALID`.

5.  **Shot Analysis**:
    *   Get the `shotR` and `shotC` coordinates.
    *   Determine the type of cell at `grid[shotR][shotC]`:
        *   If `.` (water): `output = "MISSED"`.
        *   If `+` (intact ship part):
            *   Find the `Ship` object that this cell belongs to.
            *   Decrement its `intactCount` and increment `destroyedCount`.
            *   `output = "TOUCHE"`.
            *   If `intactCount` becomes 0 for this ship, it's sunk: `output = "TOUCHE COULE <size>"`.
        *   If `_` (destroyed ship part):
            *   This means the shot hit a part of a ship that was already destroyed. The rules state "if it touches one of your ships, return TOUCHE." An `_` cell is still *part* of a ship. It doesn't change the ship's state (intact/destroyed counts) further. So, `output = "TOUCHE"`.

6.  **Game Over Check**:
    *   After applying the shot's effect (if any), iterate through all identified `ships`.
    *   If *any* ship still has `intactCount > 0`, the game is not over.
    *   If all ships have `intactCount === 0`, then append ` THEN LOSE` to the current `output`.

**TypeScript Code:**