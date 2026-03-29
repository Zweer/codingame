The problem asks us to calculate the number of visible paper layers from a specific side after a sequence of folds. The key is to correctly model how each type of fold (Right, Left, Up, Down) affects the visible layers on all four edges of the paper.

Let's denote the number of visible layers on each of the four edges as `L` (Left), `R` (Right), `U` (Up), and `D` (Down).

**Initial State:**
A single sheet of paper has 1 visible layer from any of its four sides.
So, `L = 1`, `R = 1`, `U = 1`, `D = 1`.

**Folding Rules:**
When a fold occurs, one side of the paper is folded onto another. This action results in two types of edges for the current paper:
1.  **The "open" edge:** This is the edge where the folded part of the paper meets the stationary part. The layers visible from this edge are the sum of the layers that were previously exposed on both the stationary and the folded-over edges.
2.  **The "crease" edge:** This is the edge that becomes a fold line. A crease is a continuous bend of the paper; it does not expose new original layers beyond the base thickness of the folded paper at that point. Hence, the number of visible layers from a crease edge is always 1.
3.  **Perpendicular edges:** Any fold, whether horizontal (L/R) or vertical (U/D), effectively doubles the paper's thickness. Therefore, the number of visible layers on the edges perpendicular to the fold direction will double.

Let's apply these rules to each fold type:

*   **Fold 'R' (Right folds onto Left):**
    *   The new Left edge (`L`) becomes the "open" edge, combining the old Left and Right edges: `new_L = old_L + old_R`.
    *   The new Right edge (`R`) becomes a "crease" edge: `new_R = 1`.
    *   The Up (`U`) and Down (`D`) edges are perpendicular to the fold direction, so their visible layers double: `new_U = old_U * 2`, `new_D = old_D * 2`.

*   **Fold 'L' (Left folds onto Right):**
    *   The new Right edge (`R`) becomes the "open" edge: `new_R = old_R + old_L`.
    *   The new Left edge (`L`) becomes a "crease" edge: `new_L = 1`.
    *   The Up (`U`) and Down (`D`) edges double: `new_U = old_U * 2`, `new_D = old_D * 2`.

*   **Fold 'U' (Up folds onto Down):**
    *   The new Down edge (`D`) becomes the "open" edge: `new_D = old_D + old_U`.
    *   The new Up edge (`U`) becomes a "crease" edge: `new_U = 1`.
    *   The Left (`L`) and Right (`R`) edges are perpendicular to the fold direction, so their visible layers double: `new_L = old_L * 2`, `new_R = old_R * 2`.

*   **Fold 'D' (Down folds onto Up):**
    *   The new Up edge (`U`) becomes the "open" edge: `new_U = old_U + old_D`.
    *   The new Down edge (`D`) becomes a "crease" edge: `new_D = 1`.
    *   The Left (`L`) and Right (`R`) edges double: `new_L = old_L * 2`, `new_R = old_R * 2`.

**Algorithm:**
1.  Initialize `L, R, U, D` to 1.
2.  Iterate through each fold in the `order` string.
3.  For each fold, apply the corresponding rules to update `L, R, U, D`. It's crucial to use the values from *before* the current fold's transformation for all calculations in a single step. This can be achieved by storing the new values in temporary variables (e.g., `nextL`, `nextR`, etc.) and then assigning them back to `currentL`, `currentR`, etc., at the end of the step.
4.  After processing all folds, print the value of the side specified in the `side` input.

**Example Trace (`UL`, view `D`):**

*   **Initial:** `L=1, R=1, U=1, D=1`

*   **Fold 'U' (Up onto Down):**
    *   `nextD = currentD + currentU = 1 + 1 = 2`
    *   `nextU = 1`
    *   `nextL = currentL * 2 = 1 * 2 = 2`
    *   `nextR = currentR * 2 = 1 * 2 = 2`
    *   **State after 'U':** `L=2, R=2, U=1, D=2`

*   **Fold 'L' (Left onto Right):**
    *   `nextR = currentR + currentL = 2 + 2 = 4`
    *   `nextL = 1`
    *   `nextU = currentU * 2 = 1 * 2 = 2`
    *   `nextD = currentD * 2 = 2 * 2 = 4`
    *   **State after 'L':** `L=1, R=4, U=2, D=4`

*   **Final Side 'D':** The result is `4`. This matches the example output.