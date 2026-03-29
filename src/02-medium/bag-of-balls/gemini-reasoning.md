To solve the "Bag of Balls" puzzle, we need to calculate the probability of a specific event and express it as a ratio of its probability to the probability of its complement.

**Problem Analysis:**

*   **N**: Total balls in the bag.
*   **W**: White balls in the bag.
*   **B**: Black balls in the bag (`B = N - W`).
*   **s**: Number of balls extracted (sample size).
*   **k**: Desired number of white balls in the sample.

We need to find the ratio `P(A) : P(!A)`, where:
*   `A`: The event of drawing exactly `k` white balls and `(s-k)` black balls.
*   `!A`: The event of *not* drawing exactly `k` white balls.

This is a classic problem involving the **Hypergeometric Distribution**.
The number of ways to choose `k` white balls from `W` white balls is `C(W, k)`.
The number of ways to choose `(s-k)` black balls from `(N-W)` black balls is `C(N-W, s-k)`.
So, the number of ways to achieve event `A` (let's call it `ways_A`) is:
`ways_A = C(W, k) * C(N-W, s-k)`

The total number of ways to choose `s` balls from `N` balls (let's call it `total_ways`) is:
`total_ways = C(N, s)`

The probability of event `A` is `P(A) = ways_A / total_ways`.
The probability of event `!A` is `P(!A) = 1 - P(A) = 1 - (ways_A / total_ways) = (total_ways - ways_A) / total_ways`.

The desired ratio `P(A) : P(!A)` can then be simplified to `ways_A : (total_ways - ways_A)`. This avoids floating-point precision issues by working directly with counts of ways.

**Handling Large Numbers:**

The constraint `N <= 60` means that intermediate values for combinations (e.g., `C(60, 30)` is approximately 1.18 * 10^17) can exceed JavaScript's `Number.MAX_SAFE_INTEGER` (9.007 * 10^15). Therefore, we must use `BigInt` for calculations involving combinations.

**Steps:**

1.  **Combinations Function (`combinations(n, r)`):** Implement a function to calculate "n choose r" using `BigInt`. An iterative approach is best to avoid large factorials.
    *   `C(n, r) = n! / (r! * (n-r)!)`
    *   `C(n, r) = (n * (n-1) * ... * (n-r+1)) / (r * (r-1) * ... * 1)`
    *   Handle edge cases: `r < 0` or `r > n` (result is 0), `r = 0` or `r = n` (result is 1).
    *   Optimization: `C(n, r) = C(n, n-r)`, so calculate for the smaller `r`.

2.  **GCD Function (`gcd(a, b)`):** Implement the Euclidean algorithm to find the greatest common divisor of two `BigInt` numbers. This is used to reduce the ratio to its lowest terms.

3.  **Calculate `ways_A`:**
    *   Calculate `C(W, k)`.
    *   Calculate `C(N-W, s-k)`.
    *   Multiply these two results.

4.  **Calculate `total_ways`:**
    *   Calculate `C(N, s)`.

5.  **Form the Ratio:** Let `A_part = ways_A` and `B_part = total_ways - ways_A`.

6.  **Simplify and Output:**
    *   If `A_part` is 0, the ratio is `0:1`.
    *   If `B_part` is 0, the ratio is `1:0`.
    *   Otherwise, calculate `g = gcd(A_part, B_part)`. The reduced ratio is `(A_part / g) : (B_part / g)`. Print the result in `A:B` format.

**Example Walkthrough (from problem description):**
N = 3, W = 2, s = 2, k = 2

1.  `B = N - W = 3 - 2 = 1`.
2.  `ways_A = C(W, k) * C(B, s-k) = C(2, 2) * C(1, 0) = 1 * 1 = 1n`.
3.  `total_ways = C(N, s) = C(3, 2) = 3n`.
4.  `A_part = 1n`.
5.  `B_part = total_ways - ways_A = 3n - 1n = 2n`.
6.  `gcd(1n, 2n) = 1n`.
7.  Reduced ratio: `(1n / 1n) : (2n / 1n) = 1 : 2`.

This matches the example output.