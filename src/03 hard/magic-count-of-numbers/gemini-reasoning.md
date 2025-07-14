The problem asks us to count natural numbers up to `n` that are divisible by at least one of `k` given prime numbers. The constraints are `n <= 10^13`, `k <= 10`, and primes `p_i < 40`.

This is a classic problem that can be solved using the **Principle of Inclusion-Exclusion (PIE)**.

Let `P = {p_1, p_2, ..., p_k}` be the set of given prime numbers. We want to find the count of numbers `x` (where `1 <= x <= n`) such that `x` is divisible by `p_1` OR `p_2` OR ... OR `p_k`.

Let `S_i` be the set of numbers `x` (where `1 <= x <= n`) divisible by `p_i`. The size of `S_i` is `floor(n / p_i)`.

According to PIE, the total count `|S_1 U S_2 U ... U S_k|` is:
1. Sum of counts of numbers divisible by individual primes: `Sum(floor(n / p_i))` for all `i`.
2. Subtract sum of counts of numbers divisible by products of two distinct primes: `Sum(floor(n / (p_i * p_j)))` for all distinct `i, j`.
3. Add sum of counts of numbers divisible by products of three distinct primes: `Sum(floor(n / (p_i * p_j * p_l)))` for all distinct `i, j, l`.
4. Continue this pattern, alternating between adding and subtracting, until considering the product of all `k` primes.

In general, for any non-empty subset of primes `{q_1, q_2, ..., q_m}`, the count of numbers divisible by `q_1 * q_2 * ... * q_m` is `floor(n / (q_1 * q_2 * ... * q_m))`. If `m` is odd, we add this count. If `m` is even, we subtract this count.

**Algorithm Steps:**

1.  **Read Input**: Read `n` and `k`. Since `n` can be up to `10^13`, it must be stored as a `BigInt` in TypeScript. Read the `k` primes into an array.
2.  **Iterate Subsets**: Use a bitmask to iterate through all `2^k - 1` non-empty subsets of the given primes. For each mask `i` from `1` to `(1 << k) - 1`:
    *   Initialize `currentProduct = 1n` (BigInt one) and `numElementsInSubset = 0`.
    *   Initialize `productExceedsN = false`.
3.  **Calculate Product for Subset**: Iterate through the primes `p_j` (from `j = 0` to `k-1`). If the `j`-th bit of the current mask `i` is set, it means `p_j` is part of the current subset:
    *   Increment `numElementsInSubset`.
    *   Convert `p_j` to a `BigInt`.
    *   **Optimization/Safety**: Before multiplying `currentProduct` by `p_j`, check if `currentProduct` is already greater than `n / p_j`. If it is, then `currentProduct * p_j` would definitely be greater than `n`. In this case, `floor(n / (currentProduct * p_j))` would be `0`, so this term won't contribute to the sum. Set `productExceedsN = true` and `break` from the inner loop to avoid unnecessary calculations or large BigInt operations.
    *   Otherwise, multiply `currentProduct` by `p_j`.
4.  **Apply Inclusion-Exclusion**: After iterating through all primes for the current subset (or breaking early):
    *   If `productExceedsN` is `false` (meaning `currentProduct <= n`):
        *   Calculate `countForProduct = n / currentProduct`.
        *   If `numElementsInSubset` is odd, add `countForProduct` to `totalCount`.
        *   If `numElementsInSubset` is even, subtract `countForProduct` from `totalCount`.
5.  **Output**: Print the final `totalCount`.

**Constraints Analysis:**
*   `n <= 10^13`: `BigInt` is essential for `n` and `totalCount`, and intermediate `currentProduct`.
*   `k <= 10`: The number of subsets `2^10 = 1024` is very small, making the exponential complexity feasible.
*   `p_i < 40`: Primes are small. The product of `k` primes can exceed `n` (e.g., product of largest 10 primes). The `productExceedsN` check correctly handles this, preventing unnecessary large `BigInt` multiplications and ensuring `floor(n / product)` is effectively 0 when needed.

**Example Walkthrough (n=25, k=2, p={2, 5}):**
*   `n = 25n`, `primes = [2, 5]`
*   **Subset {2} (mask 01)**:
    *   `currentProduct = 2n`, `numElements = 1`.
    *   Add `25n / 2n = 12n` to `totalCount`. (`totalCount = 12n`)
*   **Subset {5} (mask 10)**:
    *   `currentProduct = 5n`, `numElements = 1`.
    *   Add `25n / 5n = 5n` to `totalCount`. (`totalCount = 12n + 5n = 17n`)
*   **Subset {2, 5} (mask 11)**:
    *   `currentProduct = 10n`, `numElements = 2`.
    *   Subtract `25n / 10n = 2n` from `totalCount`. (`totalCount = 17n - 2n = 15n`)
*   Final `totalCount = 15`.