The puzzle asks us to determine if a given number `n` can be expressed as the sum of at least two consecutive positive odd numbers. If it can, we need to output the total number of such ways and the first and last terms of the sequence that has the most terms.

Let a sequence of `T` consecutive positive odd numbers start with `(2k+1)`. The sequence would be `(2k+1), (2k+3), ..., (2k+2T-1)`.
The sum `S` of an arithmetic progression is `T/2 * (first_term + last_term)`.
Here, `first_term = 2k+1` and `last_term = 2k+2T-1`.
So, `n = T/2 * ((2k+1) + (2k+2T-1))`
`n = T/2 * (4k + 2T)`
`n = T/2 * 2 * (2k + T)`
`n = T * (2k + T)`

Let `X = 2k + T`. Then we have the equation `n = T * X`.
From this equation, we can deduce the following conditions for `T` and `X`:
1.  **`T` must be at least 2**: The problem states "at least two consecutive positive odd numbers".
2.  **`T` must be a divisor of `n`**: For `X = n/T` to be an integer.
3.  **`k` must be non-negative**: `k = (X - T) / 2`. This implies `X - T` must be non-negative (so `X >= T`) and `X - T` must be even.
    *   `X >= T`: Since `n = T * X` and `T >= 2`, if `T` is a divisor of `n` and `T <= sqrt(n)`, then `X = n/T` will automatically be `X >= sqrt(n)`, thus `X >= T`. So, we only need to iterate `T` up to `sqrt(n)`.
    *   `X - T` must be even: This means `X` and `T` must have the same parity (both odd or both even).

**Algorithm:**

1.  Initialize `solutionsCount = 0`, `longestFirst = 0`, `longestLast = 0`, and `maxTerms = 0`.
2.  Iterate `T` (representing the number of terms) from `2` up to `Math.floor(Math.sqrt(n))`.
3.  Inside the loop, for each `T`:
    a.  Check if `n` is divisible by `T` (`n % T === 0`).
    b.  If it is, calculate `X = n / T`.
    c.  Check if `(X - T)` is even (`(X - T) % 2 === 0`). This ensures `X` and `T` have the same parity.
    d.  If both conditions (a) and (c) are met:
        i.   A valid solution is found. Increment `solutionsCount`.
        ii.  Calculate `k = (X - T) / 2`.
        iii. The first term of the sequence is `A = 2k + 1`.
        iv.  The last term of the sequence is `L = 2k + 2T - 1`.
        v.   If the current number of terms `T` is greater than `maxTerms`, update `maxTerms` to `T`, `longestFirst` to `A`, and `longestLast` to `L`.
4.  After the loop, print `solutionsCount` on the first line and `longestFirst` followed by `longestLast` on the second line. If no solutions are found, `solutionsCount` will be `0` and `longestFirst`, `longestLast` will remain `0`, which is a common way to indicate no solution in CodinGame puzzles.

**Example `n = 15`:**
-   `sqrt(15)` is approximately `3.87`. The loop for `T` runs from `2` to `3`.
-   **`T = 2`**: `15 % 2 !== 0`. Skip.
-   **`T = 3`**: `15 % 3 === 0`.
    -   `X = 15 / 3 = 5`.
    -   `(X - T) = (5 - 3) = 2`. `2 % 2 === 0`. Parity matches (both odd). Valid solution.
    -   `solutionsCount` becomes `1`.
    -   `k = (5 - 3) / 2 = 1`.
    -   `firstTerm = 2*1 + 1 = 3`.
    -   `lastTerm = 2*1 + 2*3 - 1 = 2 + 6 - 1 = 7`.
    -   `T (3)` is greater than `maxTerms (0)`.
        -   `maxTerms = 3`.
        -   `longestFirst = 3`.
        -   `longestLast = 7`.

The loop finishes.
Output:
`1`
`3 7`

This matches the example.

**Special cases:**
-   If `n` is of the form `2 * (odd number)` (e.g., 2, 6, 10, 14), there will be no solutions. Our condition `(X - T) % 2 === 0` correctly handles this: if `T` is odd, `X` would be even; if `T` is even, `X` would be odd. In both cases, `X` and `T` have different parities.
-   If `n` is small and no solutions exist (e.g., `n=1` or `n=2`), the loop condition `T <= Math.floor(Math.sqrt(n))` will result in the loop not running at all (e.g., for `n=1`, `sqrt(1)=1`, `T` starts at `2`, so loop is skipped). The output will be `0` and `0 0`.

The constraints `n < 2^32` mean `n` fits within a standard 32-bit unsigned integer. TypeScript's `number` type, being a 64-bit floating-point, can precisely represent integers up to `2^53 - 1`, so `n` and all intermediate calculations will be handled accurately. The `sqrt(n)` limit for the loop ensures efficiency, as `2^16` operations are well within typical time limits.