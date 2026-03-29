The goal of this puzzle is to extinguish all fires on a 10x10 map while keeping the number of burned forest squares (`*`) below a given `maxBurnedForest` limit.

### Reasoning

1.  **Understanding Fire Mechanics:**
    *   Fires progress: `1` -> `2` -> `3`.
    *   A `3` fire, if not extinguished, becomes a `*` (burned forest) and spreads `1`s to adjacent forest squares (`^`) that are not already on fire.
    *   Crucially, when you extinguish a square, the fire at that square is *immediately* put out and **does not spread** and **does not turn into `*`**. This is the most important rule for our strategy.

2.  **Sequence of Actions per Turn:**
    1.  Your program chooses a square `(x, y)` to extinguish.
    2.  The chosen square's fire is extinguished.
    3.  Remaining fires evolve (`1`s become `2`s, `2`s become `3`s).
    4.  Any `3` fires (that were *not* extinguished by you) then turn into `*` and spread to neighbors.

3.  **Optimal Strategy - Prioritization:**
    Based on the rules, preventing a `3` fire is the highest priority because:
    *   It directly prevents that square from becoming a `*` (burned forest).
    *   It directly prevents the spread of new `1` fires to up to 4 neighboring squares. This is key to limiting the total number of burned squares and controlling the overall fire.

    If there are no `3` fires, the next best thing is to prevent a `2` fire from becoming a `3` fire. By extinguishing a `2`, you prevent it from becoming a `3` in the next turn, thus preventing it from turning into `*` and spreading in the turn after that.

    If there are no `3`s or `2`s, then extinguishing a `1` fire is the least urgent but still contributes to putting out the fire.

    Therefore, the strategy is a clear hierarchy:
    *   **Priority 1: Extinguish any `3` fire.** (Prevents immediate burning and spreading)
    *   **Priority 2: Extinguish any `2` fire.** (Prevents it from becoming a `3` next turn)
    *   **Priority 3: Extinguish any `1` fire.** (Prevents it from becoming a `2` next turn)

4.  **Tie-breaking:** If there are multiple fires of the same priority level (e.g., several `3`s), the puzzle does not provide specific criteria for choosing one. In such cases, picking the first one found (e.g., by iterating row by row, then column by column, which corresponds to the top-leftmost fire) is a simple and effective approach.

5.  **Handling No Fires:** If no `1`, `2`, or `3` fires are found on the map, it means all fires are extinguished. In this scenario, we can output any valid coordinates (e.g., `0 0`), as the game will then check the victory conditions (no fires, `*` count within limit) and likely end.

### Code Structure

1.  Read `maxBurnedForest` once at the beginning.
2.  Enter an infinite game loop (as CodinGame puzzles typically run until victory/defeat).
3.  Inside the loop:
    a.  Read the 10 rows of the current map.
    b.  Iterate through the 10x10 map to identify and store the coordinates of all `1`, `2`, and `3` fires in separate lists.
    c.  Based on the priority (3 > 2 > 1), select a target `(x, y)` from the highest-priority list that is not empty.
    d.  If no fires are found, choose a default coordinate like `0 0`.
    e.  Print the chosen `x` and `y` coordinates.

This greedy approach effectively minimizes the spread of fire and helps in meeting the victory conditions.

### Code