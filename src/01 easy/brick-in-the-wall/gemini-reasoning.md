The problem asks us to minimize the total work required to build a wall using `N` bricks of different weights. The wall is built from the bottom up. The key rules are:
1.  A row can have at most `X` bricks.
2.  A row `L` (from the bottom) can have no more bricks than the row `L-1` below it.
3.  The work done for a brick in the `L`-th row is `W = ((L-1) * 6.5 / 100) * g * m`, where `g = 10 m/s^2` and `m` is the brick's mass.

Let's simplify the work formula:
`W = ((L-1) * 6.5 / 100) * 10 * m`
`W = (L-1) * (6.5 / 10) * m`
`W = (L-1) * 0.65 * m`

To minimize the total work `Sum(W_i)`, we need to minimize `Sum((L_i - 1) * m_i)` across all bricks. Since `0.65` is a positive constant, we can multiply by it at the end.

**Key Insight for Minimization:**
To minimize the sum of products `Sum(A_i * B_i)`, where `A` and `B` are two sets of numbers, we should pair the smallest values from one set with the largest values from the other set. In our case, the sets are `(L-1)` factors and `m` (masses). So, we should pair the smallest `(L-1)` values with the largest brick masses, and vice-versa.

**Optimal Wall Structure (Generating `(L-1)` factors):**
The constraint "in every row can be no more bricks than in the row below it" dictates the shape of the wall. To minimize work, we want as many bricks as possible to have a `(L-1)` factor of 0 (L=1), then as many as possible with a factor of 1 (L=2), and so on.

The optimal strategy to achieve this while respecting the `X` and "pyramid" constraints is to:
1.  Fill the first row (L=1) with `X` bricks (or `N` if `N < X`), contributing a `(L-1)` factor of 0 for each.
2.  For subsequent rows (L=2, L=3, ...), place as many bricks as possible, up to `X`, but also limited by the number of bricks placed in the *immediately preceding row*. This ensures the "pyramid" constraint is met with the widest possible base at each effective layer.

Let's track the number of bricks we can place at each `(L-1)` level.
We start with `current_level = 0` (for L=1).
The "width" of the previous row is initially `X` (representing the base of the wall before any bricks are placed).
In each step, we place `min(remaining_bricks, bricks_in_prev_row)` bricks at the `current_level`. After placing these bricks, `bricks_in_prev_row` for the *next* level becomes `num_bricks_placed_this_level`.

**Algorithm Steps:**

1.  **Read Input:** Get `X`, `N`, and the array of brick weights `M`.
2.  **Sort Bricks:** Sort the `M` array in ascending order. This puts the lightest bricks at the beginning and the heaviest at the end.
3.  **Generate Height Factors:**
    *   Initialize an empty array `heightFactors`.
    *   Initialize `bricksPlaced = 0`.
    *   Initialize `currentLevel = 0` (this represents `L-1`).
    *   Initialize `bricksInPrevRow = X` (this is the maximum width for the current level, representing the 'base').
    *   Loop `while (bricksPlaced < N)`:
        *   Calculate `numBricksThisLevel = Math.min(N - bricksPlaced, bricksInPrevPrevRow)`. This determines how many bricks can be placed at the current `(L-1)` level, respecting `N` and the pyramid rule.
        *   Add `currentLevel` to `heightFactors` `numBricksThisLevel` times.
        *   Update `bricksPlaced += numBricksThisLevel`.
        *   Update `bricksInPrevRow = numBricksThisLevel`. This sets the maximum width for the *next* row, ensuring the pyramid constraint.
        *   Increment `currentLevel`.
    The `heightFactors` array will now contain `N` values, sorted in ascending order (many 0s, then many 1s, etc.).
4.  **Calculate Total Work:**
    *   Initialize `totalWork = 0`.
    *   The `factorConstant` is `0.65`.
    *   Iterate `i` from `0` to `N-1`:
        *   Pair `heightFactors[i]` (the smallest available `(L-1)` factor) with `M[N-1-i]` (the largest available mass).
        *   `totalWork += heightFactors[i] * M[N - 1 - i]`.
    *   Finally, `totalWork *= factorConstant`.
5.  **Print Output:** Print `totalWork` formatted to 3 decimal places using `toFixed(3)`.

**Example Walkthrough (X=2, N=3, M=[100, 10, 150]):**

1.  `X=2, N=3, M=[100, 10, 150]`
2.  Sorted `M`: `[10, 100, 150]`
3.  Generate `heightFactors`:
    *   `heightFactors = [], bricksPlaced = 0, currentLevel = 0, bricksInPrevRow = 2`
    *   **Loop 1 (L=1):** `min(3-0, 2) = 2` bricks.
        *   `heightFactors` becomes `[0, 0]`.
        *   `bricksPlaced = 2`.
        *   `bricksInPrevRow = 2`.
        *   `currentLevel = 1`.
    *   **Loop 2 (L=2):** `min(3-2, 2) = 1` brick.
        *   `heightFactors` becomes `[0, 0, 1]`.
        *   `bricksPlaced = 3`.
        *   `bricksInPrevRow = 1`.
        *   `currentLevel = 2`.
    *   Loop ends (`bricksPlaced == N`).
    *   `heightFactors` is `[0, 0, 1]`.
4.  Calculate `totalWork`:
    *   `factorConstant = 0.65`.
    *   `totalWork = 0`.
    *   `i=0`: `heightFactors[0]=0`, `M[2]=150`. `totalWork += 0 * 150 = 0`.
    *   `i=1`: `heightFactors[1]=0`, `M[1]=100`. `totalWork += 0 * 100 = 0`.
    *   `i=2`: `heightFactors[2]=1`, `M[0]=10`. `totalWork += 1 * 10 = 10`.
    *   `totalWork` (intermediate) = `10`.
    *   Final `totalWork = 10 * 0.65 = 6.5`.
5.  Print `6.500`.