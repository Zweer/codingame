The problem asks us to find the minimum number of egg drops required in the worst case to determine the highest floor `F` (from 0 to `N`) from which an egg will not break, given `N` floors and `X` eggs.

Let `dp[e][k]` be the maximum number of floors in a building that can be successfully tested (i.e., the critical floor can be found) using `e` eggs and `k` drops.

Consider dropping an egg from a chosen floor, say floor `f`.
There are two possible outcomes:

1.  **The egg breaks:**
    *   We now know the critical floor `F` must be somewhere below `f` (i.e., `0 <= F < f`).
    *   We have `e-1` eggs remaining and `k-1` drops remaining.
    *   The maximum number of floors we can test below `f` is `dp[e-1][k-1]`.
    *   To minimize drops in the worst case, we must choose `f` such that `f-1 = dp[e-1][k-1]`. So, `f = dp[e-1][k-1] + 1`. This means we are testing `dp[e-1][k-1]` floors (from `1` to `dp[e-1][k-1]`) plus handling the case where `F=0`.

2.  **The egg does not break:**
    *   We now know the critical floor `F` must be at or above `f` (i.e., `f <= F <= N`).
    *   We have `e` eggs remaining and `k-1` drops remaining.
    *   The maximum number of *additional* floors we can test above `f` is `dp[e][k-1]`.

Combining these two cases, the total number of floors `dp[e][k]` that can be covered (or for which `F` can be identified) is:
`dp[e][k] = dp[e-1][k-1] (floors below f) + 1 (the floor f itself) + dp[e][k-1] (floors above f)`
So, the recurrence relation is:
`dp[e][k] = dp[e][k-1] + dp[e-1][k-1] + 1`

**Base Cases:**
*   `dp[e][0] = 0` for any `e` (With 0 drops, no floors can be tested beyond knowing `F=0` by definition, but `dp` counts floors from `1` upwards, so it's `0`).
*   `dp[0][k] = 0` for any `k` (With 0 eggs, no drops can be made from floor 1 or higher, so only `F=0` is effectively known; again, `dp` counts floors from `1` upwards, so it's `0`).
*   `dp[1][k] = k` (With 1 egg, you must test floor by floor from 1 up. In `k` drops, you can test `k` floors. If the egg breaks at floor `i`, `F=i-1`. If it never breaks up to floor `k`, `F=k`).

**Goal:**
We need to find the smallest `k` such that `dp[X][k] >= N`. The problem states `F` can be from `0` to `N`. `dp[e][k]` represents the maximum `M` such that we can identify `F` in `0..M`. If `N` floors are provided, we need `dp[X][k] >= N`. The example `N=100, X=1` outputting `100` confirms this interpretation.

**Implementation Strategy:**
We can build up the `dp` table iteratively. Since `dp[e][k]` only depends on values from `k-1` drops, we only need to store the previous row's values. This optimizes space complexity to `O(X)`.

1.  Initialize two arrays, `dp_current_k` and `dp_prev_k`, both of size `X+1` and filled with zeros.
2.  Initialize `k = 0` (number of drops).
3.  Loop while `dp_current_k[X]` (maximum floors testable with `X` eggs and `k` drops) is less than `N`.
    a.  Increment `k`.
    b.  Copy `dp_current_k` values to `dp_prev_k`.
    c.  Calculate new `dp_current_k` values using the recurrence `dp_current_k[e] = dp_prev_k[e] + dp_prev_k[e-1] + 1` for `e` from `1` to `X`. (Note: `dp_current_k[0]` remains `0`).
4.  Once the loop terminates, `k` will hold the minimal number of drops required.

**Constraints Analysis:**
*   `1 <= N <= 1,000,000`
*   `1 <= X <= 20`

The maximum value `k` can take is `N` (when `X=1`). So the outer loop runs at most `N` times. The inner loop runs `X` times. Total time complexity is `O(N * X)` in the worst case (e.g., `N=1,000,000, X=1`). `1,000,000 * 20 = 20,000,000` operations, which is efficient enough for typical time limits.
Space complexity is `O(X)`, which is `O(20)`, constant and minimal.