The problem asks us to determine the size and drawing order of several overlapping squares represented by ASCII characters on a grid. Each square is identified by a unique label (a digit from 1 to `nb`). The key insight is that if a square `A` is drawn after square `B`, then parts of `B`'s border that `A` covers will appear as `A`'s label on the final grid, not `B`'s.

This leads to a "dependency" relationship: if a cell `(r, c)` on the grid shows `current_label`, but that same cell `(r, c)` would have been part of `other_label`'s border if `other_label` were fully visible, then `current_label` must have been drawn *after* `other_label`. This means `other_label` must precede `current_label` in the drawing order.

We can model these "must precede" relationships as a directed graph where an edge `A -> B` means square `A` must be drawn before square `B`. Once this graph is constructed, a topological sort will give us the desired drawing order.

Here's the step-by-step reasoning:

1.  **Parse Input and Identify Square Bounding Boxes:**
    *   Read the grid dimensions (`h`, `w`) and the number of squares (`nb`).
    *   Read the grid content into a 2D array.
    *   For each square label (1 to `nb`), iterate through the grid to find all occurrences of that label. Keep track of the minimum row (`minR`), maximum row (`maxR`), minimum column (`minC`), and maximum column (`maxC`) where the label appears. This defines the square's bounding box.
    *   The `size` of a square is `maxR - minR + 1` (or `maxC - minC + 1`, since it's a square). Store this information (min/max coordinates, size) for each label.

2.  **Define `isBorderOfSquare` Helper Function:**
    *   Create a function, say `isBorderOfSquare(r, c, label)`, which takes a cell's coordinates `(r, c)` and a square `label`.
    *   This function returns `true` if `(r, c)` is part of the border of the square identified by `label`. A cell `(r, c)` is on the border of a square `S` if:
        *   It lies within `S`'s bounding box (`r` between `minR` and `maxR`, `c` between `minC` and `maxC`).
        *   It is on one of the four edges of the bounding box (`r == minR` OR `r == maxR` OR `c == minC` OR `c == maxC`).

3.  **Construct the Dependency Graph:**
    *   Initialize an adjacency list (e.g., a `Map<number, Set<number>>`) to represent the graph. `dependencies.get(A)` will store all labels `B` such that an edge `A -> B` exists (meaning `A` must be drawn before `B`).
    *   Iterate through every cell `(r, c)` of the input grid:
        *   If `grid[r][c]` is `.` (empty), skip it.
        *   Otherwise, let `current_label` be `parseInt(grid[r][c])`.
        *   Now, for every `other_label` from 1 to `nb` (excluding `current_label`):
            *   If `isBorderOfSquare(r, c, other_label)` is `true`:
                *   This means cell `(r, c)` belongs to the border of `other_label`'s square. However, `current_label` is visible at this cell.
                *   This implies that `current_label` must have been drawn *after* `other_label`.
                *   Therefore, add a directed edge `other_label -> current_label` to our `dependencies` graph. This means `other_label` is a prerequisite for `current_label`.

4.  **Perform Topological Sort (Kahn's Algorithm):**
    *   Calculate the in-degree for each square label (how many other squares must be drawn before it).
    *   Initialize a queue with all square labels that have an in-degree of 0 (these can be drawn first).
    *   Create an empty list `resultOrder` to store the sorted sequence.
    *   While the queue is not empty:
        *   Dequeue a `current_label`.
        *   Add `current_label` to `resultOrder`.
        *   For every `neighbor` (square `N` where `current_label -> N`):
            *   Decrement the in-degree of `neighbor`.
            *   If `neighbor`'s in-degree becomes 0, enqueue `neighbor`.
    *   The `resultOrder` list now contains the labels of the squares in their correct drawing order.

5.  **Output Results:**
    *   Iterate through `resultOrder`. For each `label` in the list, retrieve its `size` from the stored `squareInfos` and print `label` and `size` separated by a space.

Given the small constraints (`h, w <= 10`, `nb <= 5`), this approach is efficient enough.