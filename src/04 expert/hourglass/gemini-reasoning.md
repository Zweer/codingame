The problem asks us to simulate sand movement in an ASCII hourglass for `N` seconds. We are given the initial ASCII representation of the hourglass and the value of `N`.

Here's a breakdown of the solution strategy:

1.  **Input Parsing and Grid Representation:**
    *   Read the 23 lines representing the hourglass into a `string[]`.
    *   Convert this into a `string[][]` (character grid) for easier manipulation of individual sand grains ('o') and spaces (' ').

2.  **Initial Sand Count Validation:**
    *   Count all 'o' characters in the input grid.
    *   The problem states the capacity is 100 grains. If the initial count is not 100, print "BROKEN HOURGLASS" and terminate. This check is crucial.

3.  **Precomputing Sand Movement Paths:**
    The core challenge is to correctly interpret the ambiguous rules for sand movement and apply them consistently. The example input and output are the most reliable source of truth.

    *   **Hourglass Structure:**
        *   The hourglass is 23 lines tall.
        *   Lines 0 and 22 are the `+===+` borders.
        *   Line 11 is the 'X' pivot point.
        *   The top half consists of lines 1 to 10 (sand 'o's).
        *   The bottom half consists of lines 12 to 21 (where sand collects).
        *   All lines are centered around column 11 (0-indexed).
        *   The number of 'o's in a full line `r` (1 to 10) in the top half is `2 * (11 - r) - 1`.
        *   The number of 'o's a full line `r` (12 to 21) in the bottom half would have is `2 * (r - 11) - 1`.
        *   Total `o`s in a full top half (lines 1-10) is 100. Total `o`s in a full bottom half (lines 12-21) is also 100. Since the total capacity is 100, if the top is full, the bottom must be empty, and vice-versa.

    *   **Top Half Sand Removal Order (`topRemovalCoords`):**
        The example `N=15` output for the top half (lines 1-10) shows that sand is removed in a specific pattern:
        *   It affects lines 3, 2, and 1.
        *   First, the center 'o' of line 3 is removed, then line 2, then line 1.
        *   Then, the 'o's at horizontal distance `d=1` (left and right of center) for line 3 are removed, then line 2, then line 1.
        *   This pattern continues for increasing `d` values.
        *   Once lines 1, 2, 3 are exhausted for a particular `d`, the process continues with lines 10, 9, ..., 4.
        This suggests a priority order for lines: `(3, 2, 1)` then `(10, 9, ..., 4)`. For each line, grains are removed from the center outwards, alternating left and right.
        We generate a list `topRemovalCoords` of 100 `(row, col)` pairs in this precise order.

    *   **Bottom Half Sand Filling Order (`bottomFillCoords`):**
        The example `N=15` output for the bottom half (lines 12-21) shows:
        *   The first 10 grains form a vertical trail in the center: `(12,11), (13,11), ..., (21,11)`.
        *   After the trail, sand fills outwards horizontally from the middle, from the bottom-most line upwards.
        *   So, after the vertical trail, the grains `(21,10), (21,12)` are added, then `(20,10), (20,12)`, and so on.
        We generate a list `bottomFillCoords` of 100 `(row, col)` pairs in this precise order.

4.  **Applying `N` Seconds:**
    *   The problem states that `N` seconds means `N` grains have moved.
    *   This implies that `N` grains are removed from the top half (using `topRemovalCoords` list) and `N` grains are added to the bottom half (using `bottomFillCoords` list).
    *   We iterate `N` times. In each iteration `i`:
        *   We set `grid[topRemovalCoords[i].row][topRemovalCoords[i].col]` to ' '.
        *   We set `grid[bottomFillCoords[i].row][bottomFillCoords[i].col]` to 'o'.
    *   Constraints state `0 <= N <= 100`, so we will always have enough elements in our precomputed lists.
    *   The problem note about `N` being greater than initial top half grains and filling bottom half completely for `N` seconds implies that if `N` is e.g. 70, and top half only has 50 grains, the bottom half should still reflect 70 grains (50 from top + 20 "newly appeared" to fill up to N). My interpretation (N grains removed from top, N grains added to bottom) aligns with this, assuming the initial total is always 100.

5.  **Outputting the Result:**
    *   Convert the modified `grid` back into `string[]` by joining character arrays.
    *   Print each resulting line.
    *   The line formatting (trailing spaces etc.) is handled by joining the characters and the fixed width of the hourglass lines. The boundary characters are part of the grid and remain untouched.