The problem asks us to simulate Langton's Ant on a grid for a given number of turns and print the final state of the grid.

Here's a breakdown of the logic:

1.  **Grid Representation:** We'll use a 2D array of characters (`string[][]`) to represent the grid, where `.` denotes a white square and `#` denotes a black square.

2.  **Ant State:** The ant's state is defined by its current coordinates (`antX`, `antY`) and its current direction (`antDir`).

3.  **Direction Mapping:** To simplify rotations and movements, we can map the cardinal directions ('N', 'E', 'S', 'W') to numerical values:
    *   `N` (North) = 0 (Up)
    *   `E` (East) = 1 (Right)
    *   `S` (South) = 2 (Down)
    *   `W` (West) = 3 (Left)

4.  **Movement Deltas:** We'll predefine arrays `dx` and `dy` that store the change in `x` and `y` coordinates for each direction (indexed by our numerical direction values).
    *   `dx = [0, 1, 0, -1]` (for N, E, S, W respectively)
    *   `dy = [-1, 0, 1, 0]` (for N, E, S, W respectively)

5.  **Rotation Logic:**
    *   **90° Left (Counter-clockwise):** If the current direction is `D`, the new direction will be `(D - 1 + 4) % 4`. Adding 4 before taking modulo ensures a positive result even if `D-1` is negative (e.g., `0 - 1 = -1`, `(-1 + 4) % 4 = 3`, which is W for N).
    *   **90° Right (Clockwise):** If the current direction is `D`, the new direction will be `(D + 1) % 4`.

6.  **Simulation Loop:** We iterate `T` times, representing each turn. In each turn:
    *   **Check Current Square:** Determine the color of the square the ant is currently on (`grid[antY][antX]`).
    *   **Rotate Ant:**
        *   If the square is white (`.`), rotate the ant 90° left.
        *   If the square is black (`#`), rotate the ant 90° right.
    *   **Invert Color:** Change the color of the current square: `.` becomes `#`, and `#` becomes `.`.
    *   **Move Ant:** Update `antX` and `antY` by adding the corresponding `dx` and `dy` values for the ant's new direction. The problem statement guarantees the ant will not go out of bounds.

7.  **Output:** After `T` turns, iterate through the modified `grid` and print each row, joining the characters to form a string.

**Constraints:**
*   `W, H` up to 30: This means the grid is small (max 900 cells).
*   `T` up to 1000: The number of turns is manageable.
*   The total operations will be roughly `T * (constant operations per turn)`, which is `1000 * few_operations`, well within typical time limits.