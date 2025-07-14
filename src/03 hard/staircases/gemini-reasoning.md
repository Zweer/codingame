The problem asks us to find the number of ways to build a staircase using exactly `N` bricks. A staircase must have:
1.  Steps of different sizes.
2.  Steps in a strictly increasing order.
3.  A minimum of 2 steps.
4.  Each step has at least 1 brick.

This is a classic dynamic programming problem that can be modeled as finding the number of partitions of `N` into distinct positive integers, with the additional constraint that the number of parts (steps) must be at least 2.

Let `dp[i][j]` be the number of ways to partition the integer `i` into distinct positive integers, where the smallest integer used in the partition is at least `j`.

**Recurrence Relation:**
To calculate `dp[i][j]`, we have two possibilities for forming a partition of `i` where the smallest part is at least `j`:

1.  **Do not use `j` as the smallest part:** This means all parts in the partition must be strictly greater than `j`, i.e., at least `j+1`. The number of ways to do this is `dp[i][j+1]`.
2.  **Use `j` as the smallest part:** If we use `j` as the smallest step, then the remaining sum is `i - j`. The subsequent steps must be strictly greater than `j` (to maintain distinct and strictly increasing order), meaning the new minimum step size for the remaining sum `i - j` becomes `j+1`. The number of ways to do this is `dp[i-j][j+1]`.

Combining these, the recurrence is:
`dp[i][j] = dp[i][j+1] + dp[i-j][j+1]` (provided `i - j >= 0`)

**Base Cases:**
*   `dp[0][j] = 1` for any `j`. This represents one way to form a sum of 0, which is by using an empty set of parts (the empty partition).
*   `dp[i][j] = 0` if `i < j`. You cannot form a sum `i` if the smallest allowed part `j` is already greater than `i`.

**Filling the DP Table:**
We need to calculate `dp[N][1]`. This will give the total number of ways to partition `N` into distinct positive integers, where the smallest part is at least 1 (i.e., any distinct positive partition).

The DP table should be filled bottom-up.
The outer loop for `j` (minimum step size) should go from `N` down to `1` to ensure that `dp[i][j+1]` is already computed.
The inner loop for `i` (current sum) should go from `1` up to `N`.

**Final Result:**
The value `dp[N][1]` gives the total number of partitions of `N` into distinct parts. This includes partitions with only one part (e.g., for `N=5`, it includes the partition `5`). However, the problem specifies a "minimum of 2 steps".
Therefore, we must subtract the case where `N` is partitioned into a single step. There is only one such case: the partition `N` itself.

So, the final answer is `dp[N][1] - 1`.

**Example (N=5):**
Partitions of 5 into distinct parts:
*   `5` (1 step)
*   `1 + 4` (2 steps)
*   `2 + 3` (2 steps)

`dp[5][1]` should yield 3. After subtracting 1 for the `5` partition, the result is `3 - 1 = 2`, which matches the example.

**Constraints Analysis (N <= 500):**
*   **Time Complexity:** The DP table has `(N+1) x (N+2)` cells. Each cell takes constant time to compute. So, the total time complexity is `O(N^2)`. For `N=500`, this is `500 * 500 = 250,000` operations, which is efficient enough.
*   **Space Complexity:** The DP table requires `O(N^2)` space. For `N=500`, this is `501 * 502` integers. The maximum value for `dp[N][1]` (number of partitions of 500 into distinct parts) is `p_d(500) = 108,398,492,067`. This value fits within JavaScript's standard `number` type (which can safely represent integers up to `2^53 - 1`, approximately `9 * 10^15`).