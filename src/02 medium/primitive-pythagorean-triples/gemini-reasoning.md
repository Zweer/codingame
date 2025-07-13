To solve this problem, we need to find the number of **primitive Pythagorean triples** `(a, b, c)` such that `0 < a < b < c <= N`. A primitive Pythagorean triple is one where `a`, `b`, and `c` are coprime (their greatest common divisor is 1).

We can generate all primitive Pythagorean triples using **Euclid's formula**. Given two positive integers `m` and `n` such that:
1. `m > n`
2. `m` and `n` are coprime (i.e., `gcd(m, n) = 1`)
3. `m` and `n` have opposite parity (one is even and the other is odd)

Then the triple `(a, b, c)` defined as:
`a = m^2 - n^2`
`b = 2mn`
`c = m^2 + n^2`
will be a primitive Pythagorean triple. The value `c` is always the hypotenuse, and `a` and `b` are the two legs. To satisfy the `a < b < c` condition in the problem, we effectively treat `a` as `min(m^2 - n^2, 2mn)` and `b` as `max(m^2 - n^2, 2mn)`. However, for counting purposes, we only need to ensure that the generated `c` value is `c <= N`. Each valid pair `(m, n)` generates a unique primitive triple (up to swapping `a` and `b`), so we simply count these.

**Algorithm:**

1.  Initialize a `count` variable to 0.
2.  The constraint `c <= N` implies `m^2 + n^2 <= N`. Since `n >= 1`, we know `m^2 < m^2 + n^2 <= N`, which means `m < sqrt(N)`. Therefore, `m` can iterate up to `floor(sqrt(N))`.
3.  Iterate `m` starting from `2` (the smallest `m` that can form a triple, e.g., `(3, 4, 5)` for `m=2, n=1`).
4.  For each `m`, iterate `n` from `1` up to `m-1`.
5.  Inside the inner loop, check the conditions for `m` and `n`:
    *   **Coprimality:** `gcd(m, n) === 1`. A Greatest Common Divisor (GCD) function will be needed.
    *   **Opposite Parity:** `(m % 2) !== (n % 2)`. This ensures one is even and the other is odd.
6.  If both conditions are met, calculate `c = m^2 + n^2`.
7.  Check if `c <= N`. If it is, increment `count`.
8.  **Optimization:** Since `c = m^2 + n^2` increases as `n` increases (for a fixed `m`), if `c` already exceeds `N` for the current `(m, n)` pair, then any subsequent `n'` (where `n' > n`) for the same `m` will also result in `c' > N`. Thus, we can `break` out of the inner `n` loop and move to the next `m`.
9.  After the loops complete, `count` will hold the total number of primitive Pythagorean triples satisfying the criteria.

**Constraints:** `0 < N <= 10^6`.
The maximum value for `m` will be `sqrt(10^6) = 1000`. The number of iterations will be approximately `sum(m)` for `m` from `2` to `1000`, which is roughly `(1000^2)/2 = 500,000` pairs. Each iteration involves a GCD calculation (logarithmic time complexity), making the overall solution efficient enough for the given constraints.