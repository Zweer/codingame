The problem asks us to find the largest integer `X` such that `A^X` divides `B!`. Here `B!` denotes the factorial of `B` (i.e., `B * (B-1) * ... * 2 * 1`).

To solve this, we need to understand how prime factors contribute to `A` and `B!`.

1.  **Prime Factorization of A**:
    First, we decompose `A` into its prime factors. Let `A = p1^a1 * p2^a2 * ... * pk^ak`, where `p1, p2, ..., pk` are distinct prime numbers, and `a1, a2, ..., ak` are their respective exponents.

2.  **Counting Prime Factors in B! (Legendre's Formula)**:
    Legendre's formula provides a way to calculate the exponent of a prime `p` in the prime factorization of `n!`. It is given by:
    `E_p(n!) = floor(n/p) + floor(n/p^2) + floor(n/p^3) + ...`
    This sum is finite because eventually `p^k` will become greater than `n`, making `floor(n/p^k)` equal to zero.

3.  **Combining the Counts**:
    For `A^X` to divide `B!`, for each prime factor `pi` of `A` (with exponent `ai`), the total count of `pi` in `B!` (which is `E_pi(B!)`) must be at least `X * ai`.
    Therefore, `X * ai <= E_pi(B!)`, which implies `X <= floor(E_pi(B!) / ai)`.
    Since this condition must hold true for *all* prime factors `pi` of `A`, `X` must be the minimum of `floor(E_pi(B!) / ai)` across all `i`.
    So, `X = min(floor(E_pi(B!) / ai))` for `i = 1 to k`.

**Algorithm Steps:**

1.  **Read Input**: Read the integers `A` and `B`.
2.  **Prime Factorize A**:
    *   Iterate through potential prime factors `p` starting from 2.
    *   For each `p` that divides `A`, count how many times it divides `A` (let this be `countA`). Store `p` and `countA` (e.g., in a `Map`).
    *   Divide `A` by `p` repeatedly until it's no longer divisible.
    *   Optimize for factor 2, then check odd factors up to `sqrt(A)`. If `A` remains greater than 1 after the loop, the remaining `A` is itself a prime factor.
3.  **Calculate X**:
    *   Initialize `minX` to `Infinity`.
    *   For each prime factor `p` (with its count `countA`) identified in step 2:
        *   Calculate `E_p(B!)` using Legendre's formula:
            *   Initialize `exponentB_p = 0`.
            *   Initialize `currentPowerOfP = p`.
            *   Loop while `currentPowerOfP <= B`:
                *   Add `floor(B / currentPowerOfP)` to `exponentB_p`.
                *   Check if `currentPowerOfP` multiplied by `p` would exceed `B` (or `Number.MAX_SAFE_INTEGER`, though not an issue here due to `B <= 10^7`). If so, break the loop as subsequent terms will be zero.
                *   Update `currentPowerOfP` to `currentPowerOfP * p`.
        *   Calculate the candidate `X` for this prime factor: `currentX = floor(exponentB_p / countA)`.
        *   Update `minX = min(minX, currentX)`.
4.  **Output Result**: Print `minX`.

**Example: A=7, B=14**

1.  `A = 7`, `B = 14`.
2.  Prime factorization of `A=7`: It's `7^1`. So, `p=7`, `countA=1`.
3.  Calculate `E_7(14!)`:
    *   `currentPowerOfP = 7`: `exponentB_p += floor(14/7) = 2`.
    *   `currentPowerOfP = 7 * 7 = 49`. Since `49 > 14`, the loop terminates.
    *   `E_7(14!) = 2`.
4.  Calculate `currentX = floor(E_7(14!) / countA) = floor(2 / 1) = 2`.
5.  `minX` becomes `2`.
6.  Output: `2`.

**Constraints and Efficiency:**
*   `A, B <= 10^7`.
*   Prime factorization of `A`: Iterating up to `sqrt(A)` (approx `sqrt(10^7) = 3162`) is very efficient.
*   Legendre's formula: For `p=2`, `currentPowerOfP` goes `2, 4, ..., 2^23` (approx `8 * 10^6`), which is about 23 iterations. For larger `p`, it takes even fewer iterations. This is also very efficient.
*   The `Number` type in TypeScript (JavaScript) can safely represent integers up to `2^53 - 1` (approx `9 * 10^15`). Products like `currentPowerOfP * p` will not exceed this limit given `B <= 10^7`.