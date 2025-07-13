The problem asks us to find the cheapest way to tile a given floor using Tetris-shaped blocks and, for that specific cheapest set of blocks, count the number of distinct ways the floor can be paved. All Tetris blocks cover 4 cells. Blocks can be rotated but not broken. The floor contains empty cells (`.`) that must be covered and occupied cells (`#`) that must not be covered. The crucial constraint is `W, H <= 100`.

**Problem Breakdown and Approach:**

1.  **Fixed Number of Blocks:** Since every Tetris block covers exactly 4 cells, the total number of blocks needed is `(number of empty cells) / 4`. This is a fixed value, let's call it `N_blocks`.

2.  **Dynamic Programming (DP):** The constraints `W, H <= 100` rule out simple backtracking or bitmask DP over an entire row/column (which would be `2^W` or `2^H` states). This problem is a classic candidate for "Profile DP" or "Scanline DP" where the state only depends on a small window around the current cell being processed.

    *   **DP State:** We define `dp[r][c][mask_curr][mask_next]` to store the minimum cost, the counts of each block type, and the number of ways to pave the floor starting from cell `(r, c)`, given the `mask_curr` and `mask_next`.
        *   `r`: current row (0 to H-1)
        *   `c`: current column (0 to W-1)
        *   `mask_curr`: A 4-bit integer representing the state of cells `(r, c)`, `(r, c+1)`, `(r, c+2)`, `(r, c+3)`. A bit set to 1 means the corresponding cell is covered by a block that started *before* `(r, c)`. The most significant bit (`0b1000`) corresponds to `(r, c)`, `0b0100` to `(r, c+1)`, etc.
        *   `mask_next`: A 4-bit integer representing the state of cells `(r+1, c)`, `(r+1, c+1)`, `(r+1, c+2)`, `(r+1, c+3)`. Similarly, `0b1000` corresponds to `(r+1, c)`.
        *   The total mask size is 8 bits (`2^8 = 256` states). This is small enough.
    *   **Memoization Key:** We can combine `r`, `c`, `mask_curr`, and `mask_next` into a single integer key for the memoization map: `(r * W + c) * (1 << 8) + (mask_curr << 4) + mask_next`. The total number of states is `W * H * 256`, which is `100 * 100 * 256 = 2.56 * 10^6`.

3.  **DP Transitions:**
    We process cells in row-major order: `(0,0), (0,1), ..., (0, W-1), (1,0), ...`.

    *   **Base Case:** If `r >= H`, it means we have successfully paved the entire floor. Return cost 0, all block counts 0, and 1 way.
    *   **Moving to the Next Cell:** For a recursive call from `(r, c)` to `(next_r, next_c)`, the masks need to be updated.
        *   If `c == W - 1` (end of row): `next_r = r + 1`, `next_c = 0`. The `mask_next` (which contained cells for `(r+1, c)` to `(r+1, c+3)`) becomes the new `mask_curr` (for `(r+1, 0)` to `(r+1, 3)`). The new `mask_next` becomes `0` (as row `r+2` starts empty).
        *   If `c < W - 1` (move to next column): `next_r = r`, `next_c = c + 1`. Both `mask_curr` and `mask_next` are shifted left by one bit (`<< 1`) and then masked (`& 0b1111`) to remove the leftmost bit (which corresponded to the cell just processed) and make space for a new cell on the right.

    *   **Handling Current Cell `(r, c)`:**
        1.  **Wall (`#`):** If `floorGrid[r][c] === '#'`: This cell is already occupied. We simply move to `(next_r, next_c)` with the updated masks.
        2.  **Already Covered by Mask:** If `floorGrid[r][c] === '.'` AND `(mask_curr & 0b1000) !== 0` (meaning the bit for `(r,c)` in `mask_curr` is set): This cell is covered by a block placed at `(r, c-1)` or earlier. We simply move to `(next_r, next_c)` with the updated masks.
        3.  **Empty and Uncovered (`.`):** If `floorGrid[r][c] === '.'` AND `(mask_curr & 0b1000) === 0`: This cell must be covered by a new block starting at `(r, c)`.
            *   Iterate through all 7 block types and their unique rotations/orientations.
            *   For each `block_orientation`:
                *   **Validate Placement:** Check if placing this block at `(r, c)` is valid:
                    *   All 4 cells of the block must be within grid bounds.
                    *   All 4 cells must be empty (`.`) in `floorGrid`.
                    *   No cell of the block can be already covered by the *current* `mask_curr` or `mask_next`. (This prevents overlapping with blocks originating earlier but extending into this cell's window).
                *   **Update Next Masks:** If valid, calculate `effective_next_mask_curr` and `effective_next_mask_next`. These are initialized with the `new_mask_curr_for_next_call` and `new_mask_next_for_next_call` (from the shift operation) and then have bits set for any cells covered by *this* block that fall into the `(next_r, next_c)`'s mask window.
                *   **Recursive Call:** Make a recursive call `solve(next_r, next_c, effective_next_mask_curr, effective_next_mask_next)`.
                *   **Combine Results:** Add the current block's price to the recursive call's cost. Increment the count for the current block type.
                *   **Update Minima:** Compare the `current_total_cost` with the `min_cost` found so far for this state:
                    *   If `current_total_cost` is strictly less than `min_cost` (using `EPSILON` for float comparison): This is a new, cheaper solution. Update `min_cost`, `min_counts`, and set `total_ways` to `recursive_res.ways`.
                    *   If `current_total_cost` is effectively equal to `min_cost`: Add `recursive_res.ways` to `total_ways`. The problem states "The set of blocks with the cheapest price will be unique", so we don't need to worry about multiple block count combinations for the same minimum cost.

4.  **Block Orientations Pre-computation:** Before starting the DP, generate all unique shapes for each of the 7 Tetris block types by rotating them 0, 90, 180, and 270 degrees. Normalize each shape (move its top-leftmost point to (0,0)) to identify unique orientations.

**Floating Point Precision:** Prices are floats. When comparing costs, use a small `EPSILON` (e.g., `1e-7`) to account for floating point inaccuracies. Output should be `toFixed(2)`.

**Complexity:**
*   **State:** `W * H * 256`
*   **Transitions:** For each state, we iterate through roughly 19 unique block orientations. For each orientation, we iterate through its 4 cells to check validity and update masks.
*   Total operations: `W * H * 256 * 19 * 4` operations, which is roughly `100 * 100 * 256 * 19 * 4` = `1.94 * 10^8`. This might be borderline for typical competitive programming time limits (usually `10^8` ops/sec), but with efficient language features and memoization, it often passes. TypeScript/JavaScript might be slower, but the average case could be better due to walls or already-covered cells.