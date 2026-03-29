The problem asks us to find all possible combinations of rugby scoring events that sum up to a given total score. We need to output these combinations in a specific order: first by increasing number of tries, then transformations, then penalties/drops.

Here's a breakdown of the scoring rules:
-   **Try (T)**: 5 points
-   **Transformation Kick (K)**: 2 points. This can only occur *after* a try, meaning the number of transformations (`k`) cannot exceed the number of tries (`t`).
-   **Penalty Kick / Drop Goal (P)**: 3 points.

Let the given total score be `S`. We are looking for non-negative integers `t`, `k`, and `p` such that:
`S = (t * 5) + (k * 2) + (p * 3)`
and `k <= t`.

We can solve this problem using a brute-force approach with nested loops. Since the maximum possible score isn't specified but typically remains within reasonable bounds for such puzzles (e.g., a few hundreds), the number of possible tries or penalties will also be limited.

**Algorithm:**

1.  **Initialize an empty list** to store the valid combinations.
2.  **Loop for `t` (number of tries):**
    *   The minimum value for `t` is 0.
    *   The maximum value for `t` is `S / 5` (if all points came from tries). So, `t` will go from `0` up to `floor(S / 5)`.
3.  **Inside the `t` loop, loop for `k` (number of transformations):**
    *   The minimum value for `k` is 0.
    *   The maximum value for `k` is `t` (because you can't have more transformations than tries).
    *   Calculate the points accumulated so far: `currentPoints = (t * 5) + (k * 2)`.
    *   **Optimization:** If `currentPoints` already exceeds `S`, then this `k` (and any larger `k` for the current `t`) cannot be part of a valid combination. We can `break` out of the inner `k` loop.
4.  **Calculate remaining points:**
    *   `remainingPoints = S - currentPoints`.
5.  **Check for `p` (number of penalties/drops):**
    *   If `remainingPoints` is non-negative and is perfectly divisible by 3 (i.e., `remainingPoints % 3 === 0`), then we have found a valid `p`.
    *   `p = remainingPoints / 3`.
    *   Add the combination `[t, k, p]` to our list of combinations.
6.  **Output:** After the loops complete, iterate through the list of combinations and print each one in the required format (`t k p`, separated by spaces, each on a new line).

**Ordering:**
The problem requires combinations to be ordered by increasing tries, then transformations, then penalties/drops. Our nested loop structure naturally generates combinations in this order:
-   The outermost loop iterates `t` in increasing order.
-   The middle loop iterates `k` in increasing order for each `t`.
-   The value of `p` is derived from `S`, `t`, and `k`. As `t` or `k` increase, `currentPoints` increases, which means `remainingPoints` decreases, and thus `p` decreases. This ensures the correct sorting criteria for `p` as well, given the fixed `t` and `k`.

**Example (S = 12):**

*   **t = 0**:
    *   **k = 0**: `points = (0*5) + (0*2) = 0`. `remaining = 12 - 0 = 12`. `12 % 3 == 0`, so `p = 4`. Add `[0, 0, 4]`.
*   **t = 1**:
    *   **k = 0**: `points = (1*5) + (0*2) = 5`. `remaining = 12 - 5 = 7`. `7 % 3 != 0`.
    *   **k = 1**: `points = (1*5) + (1*2) = 7`. `remaining = 12 - 7 = 5`. `5 % 3 != 0`.
*   **t = 2**:
    *   **k = 0**: `points = (2*5) + (0*2) = 10`. `remaining = 12 - 10 = 2`. `2 % 3 != 0`.
    *   **k = 1**: `points = (2*5) + (1*2) = 12`. `remaining = 12 - 12 = 0`. `0 % 3 == 0`, so `p = 0`. Add `[2, 1, 0]`.
    *   **k = 2**: `points = (2*5) + (2*2) = 14`. `14 > 12`, so break the `k` loop for `t=2`.

The collected combinations are `[0, 0, 4]` and `[2, 1, 0]`, which are printed in the correct order.