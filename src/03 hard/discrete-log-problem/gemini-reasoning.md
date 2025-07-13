The problem asks us to find the lowest integer `X` such that `G^X mod Q = H`, given `G`, `H`, and `Q`. This is a classic Discrete Logarithm Problem. The constraints are `1 < G, H < Q`, `1 < X < Q-1`, and `0 < Q < 50,000,000,000`.

A brute-force approach (iterating `X` from 1 to `Q-1`) would be too slow because `Q` can be very large (`5 * 10^10`). We need a more efficient algorithm. The Baby-step Giant-step (BSGS) algorithm is suitable here, as it has a time complexity of `O(sqrt(Q))`, which is feasible for the given constraints (`sqrt(5 * 10^10)` is approximately `2.2 * 10^5`).

**Baby-step Giant-step (BSGS) Algorithm Overview:**

The goal is to find `X` such that `G^X = H (mod Q)`.
1.  **Define `m`**: Choose `m = ceil(sqrt(Q))`.
2.  **Express `X`**: We can write `X = i * m + j`, where `0 <= i < m` and `0 <= j < m`.
3.  **Rearrange the equation**:
    `G^(i*m + j) = H (mod Q)`
    `G^(i*m) * G^j = H (mod Q)`
    `G^j = H * (G^(-m))^i (mod Q)`

The algorithm proceeds in two phases:

**Phase 1: Baby Steps**
*   Compute `G^j mod Q` for `j` ranging from `0` to `m-1`.
*   Store these pairs `(G^j mod Q, j)` in a hash map (or dictionary) for quick lookups. The map will store `value -> j`. Since we iterate `j` from 0 upwards, if multiple `j` values produce the same `G^j mod Q`, the map will naturally store the smallest `j` for that value, which is important for finding the *lowest* `X`.

**Phase 2: Giant Steps**
*   Calculate `G_m_inv = (G^m)^(-1) mod Q`. Since `Q` is a prime number, we can use Fermat's Little Theorem to find the modular inverse: `a^(Q-2) = a^(-1) mod Q`. So `G_m_inv = pow(G^m, Q - 2, Q)`.
*   Iterate `i` from `0` to `m-1`.
*   In each iteration, calculate `current_H_term = H * (G_m_inv)^i mod Q`.
*   Check if `current_H_term` exists as a key in the hash map from the baby steps.
*   If a match is found (`current_H_term = G^j mod Q`), then we have `H * (G^(-m))^i = G^j (mod Q)`. This implies `H = G^j * (G^m)^i = G^(j + i*m) (mod Q)`.
*   The desired exponent `X` is `i * m + j`. Since `i` and `j` are iterated from smallest values upwards, the first `X` found will be the lowest integer solution.

**Important Considerations:**
*   **BigInt**: `G`, `H`, `Q`, and intermediate calculations (especially in modular exponentiation) can exceed the maximum value of standard JavaScript `Number` (2^53 - 1). Therefore, `BigInt` must be used for all calculations involving these values.
*   **Modular Exponentiation**: A `pow(base, exp, mod)` function is necessary to efficiently compute `(base^exp) % mod`. This is typically done using the "exponentiation by squaring" method.
*   **`m` calculation**: `m = Math.ceil(Math.sqrt(Number(Q)))`. `Q` is large, but `sqrt(Q)` will fit in a standard `Number` type, so `Math.sqrt` can be used. The result is then converted to `BigInt` for further computations.
*   **Constraints `1 < X < Q-1`**: This means `H` will not be `1` (which would imply `X=0` or `X=Q-1`). This simplifies finding the "lowest integer X" as we don't need to worry about `X=0` vs `X=Q-1` for `H=1`.

**TypeScript Code Structure:**

1.  Read `G`, `H`, `Q` from input, converting them to `BigInt`.
2.  Implement a `pow(base, exp, mod)` function for modular exponentiation with `BigInt`.
3.  Calculate `m`.
4.  Perform Baby Steps: populate a `Map<BigInt, BigInt>` with `(G^j % Q, j)`.
5.  Perform Giant Steps: calculate `G_m_inv` and iterate, checking `current_H_term` against the map.
6.  When a match is found, calculate `X = i * m + j` and print it.