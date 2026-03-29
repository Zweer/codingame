## Reasoning

The problem asks us to calculate the sum of divisors for all numbers from 1 to `n`. Let's denote `S(n)` as this total sum.
For example, if `n=4`, we need to sum the divisors of 1, 2, 3, and 4:
* Divisors of 1: {1} -> Sum = 1
* Divisors of 2: {1, 2} -> Sum = 3
* Divisors of 3: {1, 3} -> Sum = 4
* Divisors of 4: {1, 2, 4} -> Sum = 7
Total sum `S(4) = 1 + 3 + 4 + 7 = 15`.

A naive approach would be to iterate from 1 to `n`, and for each number `i`, iterate from 1 to `i` to find its divisors and sum them up. This would be roughly `O(n^2)` or `O(n log n)` if optimized, which might be too slow for `n=100000`. The problem hints at a "trick" for a "superfast" solution.

Let's re-examine the sum for `n=4` by listing all divisors and seeing how many times each number appears as a divisor:
Numbers and their divisors:
* 1: **1**
* 2: **1**, **2**
* 3: **1**, **3**
* 4: **1**, **2**, **4**

Instead of summing `(sum of divisors of 1) + (sum of divisors of 2) + ...`, let's sum based on how many times each number `k` (from 1 to `n`) acts as a divisor.

*   **How many times does '1' appear as a divisor?**
    '1' is a divisor of 1, 2, 3, 4. (4 times)
    Contribution of '1' to the total sum: `1 * 4 = 4`

*   **How many times does '2' appear as a divisor?**
    '2' is a divisor of 2, 4. (2 times)
    Contribution of '2' to the total sum: `2 * 2 = 4`

*   **How many times does '3' appear as a divisor?**
    '3' is a divisor of 3. (1 time)
    Contribution of '3' to the total sum: `3 * 1 = 3`

*   **How many times does '4' appear as a divisor?**
    '4' is a divisor of 4. (1 time)
    Contribution of '4' to the total sum: `4 * 1 = 4`

Total sum = `4 + 4 + 3 + 4 = 15`. This matches the example!

This is the "trick". For any number `d` (from 1 to `n`), its contribution to the total sum is `d` multiplied by the number of times `d` appears as a divisor.
`d` is a divisor of a number `k` if `k` is a multiple of `d`. We are interested in multiples of `d` that are less than or equal to `n`.
These multiples are `d*1`, `d*2`, `d*3`, ..., `d*m` such that `d*m <= n`.
The largest such `m` is `floor(n / d)`.
So, `d` appears as a divisor `floor(n / d)` times among the numbers from 1 to `n`.

Therefore, the total sum `S(n)` can be calculated as:
`S(n) = Sum_{d=1 to n} (d * floor(n / d))`

Let's test with `n=2`:
`S(2) = (1 * floor(2/1)) + (2 * floor(2/2))`
`S(2) = (1 * 2) + (2 * 1)`
`S(2) = 2 + 2 = 4`. This matches the example output for `n=2`.

The constraints are `1 <= n <= 100000`. A loop iterating `n` times will perform `100000` operations, which is efficient enough for these constraints (an `O(n)` solution).
The maximum possible sum would be around `n*n` in the worst case (`Sum_{d=1 to n} d * (n/d) = Sum n = n^2`). For `n=100000`, `n^2 = 10^10`. TypeScript's `number` type uses 64-bit floating-point numbers, which can accurately represent integers up to `2^53 - 1` (approx `9 * 10^15`), so `10^10` will fit without issues.

## Code