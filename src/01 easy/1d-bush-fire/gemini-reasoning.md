The problem asks us to find the minimum number of water drops to extinguish all fires on a 1D strip of bushland. A single water drop, when targeted at a cell `X`, effectively puts out fire in cells `X-1`, `X`, and `X+1`. Edge cases apply: if `X=1`, it covers `1,2`; if `X=L` (the last cell), it covers `L-1,L`. In 0-indexed terms, if a drop is targeted at index `idx`, it covers cells `max(0, idx-1)`, `idx`, and `min(L-1, idx+1)`.

**Greedy Strategy:**

The most effective approach for this problem is a greedy one. We iterate through the bushland strip from left to right.

1.  **Find the Leftmost Fire:** When we encounter the first (leftmost) fire at a certain cell `j` (0-indexed), we *must* place a water drop to extinguish it.
2.  **Maximize Coverage to the Right:** To minimize the total number of drops, we want each drop to cover `j` and extend its effect as far to the right as possible.
    *   If we target a drop at `j-1`, it covers `j-2, j-1, j`.
    *   If we target a drop at `j`, it covers `j-1, j, j+1`.
    *   If we target a drop at `j+1`, it covers `j, j+1, j+2`.
    The last option, targeting the drop at `j+1`, is optimal because it covers `j` and extends furthest to the right (covering `j`, `j+1`, and `j+2`).
3.  **Advance the Pointer:** After placing a drop that covers `j`, `j+1`, and `j+2`, we know these three cells are now fire-free. Therefore, we can safely advance our inspection pointer `j` by 3 positions to `j+3`. This ensures we don't re-check or place redundant drops on already extinguished sections.

We repeat this process until we have iterated through the entire strip.

**Example Trace (`....f....f..`, Length 12):**

*   Initialize `drops = 0`, `j = 0`.
*   `j = 0,1,2,3`: Cells are `.` (no fire). `j` increments to 4.
*   `j = 4`: Cell `line[4]` is `f`.
    *   Increment `drops` to 1.
    *   Place a drop targeted at `j+1 = 5`. This covers cells `4, 5, 6`.
    *   Advance `j` by 3: `j = 4 + 3 = 7`.
*   `j = 7,8`: Cells are `.` (no fire). `j` increments to 9.
*   `j = 9`: Cell `line[9]` is `f`.
    *   Increment `drops` to 2.
    *   Place a drop targeted at `j+1 = 10`. This covers cells `9, 10, 11`.
    *   Advance `j` by 3: `j = 9 + 3 = 12`.
*   `j = 12`: `j` is now equal to `line.length`, so the loop terminates.
*   Total drops: 2.

This matches the example output. The greedy choice works because it makes the locally optimal decision (covering the current fire and extending coverage as far right as possible) which leads to the globally optimal solution (minimum drops).

**Constraints:**
*   `1 <= N <= 100` (number of test cases)
*   `1 <= length of each line <= 255`
The time complexity will be `O(N * L)`, where `L` is the length of the strip. With max `N=100` and `L=255`, this is `100 * 255 = 25500` operations, which is very efficient and well within typical time limits.