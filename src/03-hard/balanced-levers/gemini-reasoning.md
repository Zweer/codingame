The problem asks us to find the maximum possible width of a hanging mobile that can be constructed using a given set of weights and an unlimited supply of identical rods of length 1. All rods must be balanced horizontally, and the total width of the mobile must not exceed a given classroom width `L`.

**1. Understanding the Mobile Structure and Width Calculation**

A mobile is defined recursively:
*   A weight hung by a string (base case).
*   A rod with two sub-mobiles at both ends (recursive case).

Key rules:
*   All rods have a length of 1 unit.
*   Rods must be horizontally balanced: `a * n = b * m`, where `a` and `b` are distances from the pivot to the left (`n`) and right (`m`) sub-mobiles, respectively. Since the full rod length (1 unit) must be used, `a + b = 1`.
    Combining these, we get:
    `a * n = (1 - a) * m`
    `a * n = m - a * m`
    `a * (n + m) = m`
    `a = m / (n + m)`
    And `b = n / (n + m)`.
    Here, `n` and `m` are the total weights of the left and right sub-mobiles.
*   Rods and strings are weightless.
*   Width of weights is ignored (i.e., a single weight mobile has a width of 0).

**Width Calculation Logic:**

Let's define a `Mobile` object with the following properties:
*   `weight`: The total weight of this mobile structure (sum of all weights it contains).
*   `totalWidth`: The total horizontal span of the mobile, from its leftmost point to its rightmost point.
*   `leftExtent`: The maximum horizontal distance from the mobile's pivot point to its leftmost point.
*   `rightExtent`: The maximum horizontal distance from the mobile's pivot point to its rightmost point.

1.  **Base Case: A single weight mobile**
    If a mobile consists of a single weight `w`:
    *   `weight = w`
    *   `totalWidth = 0` (as per problem: "Ignore the width of the weights")
    *   `leftExtent = 0`
    *   `rightExtent = 0`

2.  **Recursive Case: A rod mobile with left sub-mobile `M_L` and right sub-mobile `M_R`**
    Let `W_L = M_L.weight` and `W_R = M_R.weight`.
    *   `weight = W_L + W_R`
    *   Calculate pivot distances:
        `a = W_R / (W_L + W_R)` (distance from pivot to `M_L` attachment point)
        `b = W_L / (W_L + W_R)` (distance from pivot to `M_R` attachment point)
        Note that `a + b = 1` always holds.
    *   Imagine the main rod's pivot is at coordinate `0`.
        The attachment point for `M_L` is at `-a`.
        The attachment point for `M_R` is at `b`.
    *   The leftmost point of `M_L` (relative to the main pivot) is `-a - M_L.leftExtent`.
    *   The rightmost point of `M_L` (relative to the main pivot) is `-a + M_L.rightExtent`.
    *   The leftmost point of `M_R` (relative to the main pivot) is `b - M_R.leftExtent`.
    *   The rightmost point of `M_R` (relative to the main pivot) is `b + M_R.rightExtent`.
    *   The overall leftmost coordinate of the combined mobile: `min( (-a - M_L.leftExtent), (b - M_R.leftExtent) )`
    *   The overall rightmost coordinate of the combined mobile: `max( (-a + M_L.rightExtent), (b + M_R.rightExtent) )`
    *   `totalWidth = overall_rightmost_coordinate - overall_leftmost_coordinate`
    *   `leftExtent = -overall_leftmost_coordinate`
    *   `rightExtent = overall_rightmost_coordinate`

This calculation method correctly reproduces the example `1.8000` for weights `[1,2,4]`. For example, `( (1,4), 2)` where `(1,4)` is itself a rod mobile with weight 1 on left and 4 on right.

**2. Algorithm: Dynamic Programming with Bitmask**

Since the number of weights `N` is very small (1 to 6), this problem can be solved using dynamic programming with bitmasks.

*   **DP State:** `dp[mask]` will store an array of all unique `Mobile` objects that can be formed using the set of weights represented by the `mask`. Each bit in the `mask` corresponds to a weight in the input array. For example, if `N=3` and `weights = [w0, w1, w2]`, `mask = 5 (binary 101)` means weights `w0` and `w2` are used.

*   **Initialization:**
    For each single weight `weights[i]`, initialize `dp[1 << i]` with a `Mobile` object representing just that weight (totalWidth 0, leftExtent 0, rightExtent 0).

*   **Iteration:**
    Iterate `mask` from `1` to `(1 << N) - 1`.
    For each `mask` (representing a set of weights):
    *   If `mask` represents a single weight (i.e., `mask` is a power of 2), skip it as it's already handled in initialization.
    *   Iterate through all possible `submask` values which represent a non-empty proper subset of `mask`. `submask` represents the weights used for the left sub-mobile (`M_L`).
    *   The remaining weights `(mask ^ submask)` will be used for the right sub-mobile (`M_R`). Let `S_R_mask = mask ^ submask`.
    *   For every `m_L` in `dp[submask]` and every `m_R` in `dp[S_R_mask]`:
        *   Construct a new rod `Mobile` object using `m_L` and `m_R` and calculate its `weight`, `totalWidth`, `leftExtent`, and `rightExtent` using the formulas described above.
        *   Add this new `Mobile` object to `dp[mask]`. (It's important to allow both `(M_L, M_R)` and `(M_R, M_L)` combinations, as their `a` and `b` values, and thus `leftExtent` and `rightExtent`, will be different). The loop structure naturally generates these.

*   **Final Result:**
    After filling the `dp` table for all masks, the `dp[(1 << N) - 1]` array will contain all possible `Mobile` structures that use all `N` given weights. Iterate through these final mobiles to find the `maxOverallWidth` that satisfies `totalWidth <= L`.

**3. Floating Point Precision:**
The problem explicitly states that a design `2.00001` with `L=2` should be rejected. This means strict comparison. However, due to floating-point inaccuracies, a small epsilon is often used in comparisons: `mobile.totalWidth <= L + EPSILON`. A common `EPSILON` like `1e-9` is typically sufficient.
The final output should be rounded to 4 decimal places. `toFixed(4)` is appropriate for this.

**Complexity:**
*   There are `2^N` masks.
*   For each mask, iterating through submasks takes `O(2^N)` time (roughly).
*   For each partition, iterating through combinations of `m_L` and `m_R` mobiles. The number of mobiles for a given mask is complex but manageable for `N=6`. Worst case, this can lead to `O(N * 3^N)` or higher.
*   For `N=6`, `6 * 3^6 = 6 * 729 = 4374` operations, plus `M_L.length * M_R.length` combinations. The number of distinct mobile structures is related to Catalan numbers (but with permutations of weights, it's larger). For N=6, this is well within typical time limits.