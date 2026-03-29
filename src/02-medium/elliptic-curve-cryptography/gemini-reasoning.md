Elliptic Curve Cryptography (ECC) relies on the mathematical properties of elliptic curves over finite fields. The core operations are point addition and point doubling, which allow for efficient scalar multiplication (computing `k*G`, where `G` is a base point and `k` is a scalar). This puzzle requires implementing these operations and the "double-and-add" algorithm to calculate `k*G` for given `k` values.

**Key Components and Implementation Details:**

1.  **BigInt for Large Numbers:** The coordinates and modulus `P` are 62-bit numbers. Standard JavaScript `number` type cannot handle these without loss of precision. Therefore, all calculations involving these values must use JavaScript's `BigInt` type. `n` suffix is used for BigInt literals (e.g., `0x3fddbf07bb3bc551n`).

2.  **Modular Arithmetic:**
    *   `mod(n, m)`: A helper function to ensure that the result of a modulo operation is always positive, even if `n` is negative.
    *   `power(base, exp, modVal)`: Implements modular exponentiation (binary exponentiation or exponentiation by squaring). This is crucial for calculating modular inverses.
    *   `modInverse(a, m)`: Computes the modular multiplicative inverse of `a` modulo `m`. Since `m` (which is `P`) is a prime number, Fermat's Little Theorem can be used: `a^(m-2) % m` is the inverse of `a` modulo `m`.

3.  **Point Representation:** A `Point` class is used to store the `x` and `y` coordinates as `BigInt`. A special `isInfinity` flag is added to represent the point at infinity, which acts as the additive identity in ECC.

4.  **ECC Point Operations:**
    *   **`pointDouble(C)`:** Calculates `2*C`.
        *   If `C` is the point at infinity, `2*C` is still the point at infinity.
        *   If `C.y` is `0` (modulo `P`), the tangent at `C` is vertical, and `2*C` is the point at infinity.
        *   Otherwise, it uses the formula `L = (3*Xc^2 + A) / (2*Yc) mod P`. Since `A = 0` for secp256k1, this simplifies to `L = (3*Xc^2) / (2*Yc) mod P`. The division is performed using modular inverse.
        *   The new coordinates are `Xs = L^2 - 2*Xc mod P` and `Ys = L * (Xc - Xs) - Yc mod P`.
    *   **`pointAdd(C, D)`:** Calculates `C+D` for two distinct points `C` and `D`.
        *   Handles cases where `C` or `D` is the point at infinity.
        *   If `C.x === D.x` and `C.y === D.y`, it's effectively a doubling operation, so `pointDouble(C)` is called.
        *   If `C.x === D.x` but `C.y === -D.y mod P`, the line connecting `C` and `D` is vertical, and their sum is the point at infinity.
        *   Otherwise, it uses the formula `L = (Yd - Yc) / (Xd - Xc) mod P`.
        *   The new coordinates are `Xs = L^2 - Xc - Xd mod P` and `Ys = L * (Xc - Xs) - Yc mod P`.

5.  **Scalar Multiplication (`scalarMultiply(k, G)`):** Implements the "double-and-add" algorithm.
    *   Initializes `result` to the point at infinity (`O`) and `current` to the base point `G`.
    *   It iterates through the bits of `k` from least significant to most significant:
        *   If the current bit of `k` is `1`, `current` is added to `result`.
        *   `current` is always doubled for the next iteration.
        *   `k` is right-shifted (integer divided by 2).
    *   This method efficiently computes `k*G` by combining doublings and additions.

**Input/Output:**
The program reads `N` and then `N` hexadecimal values for `k`. For each `k`, it computes `k*G` and prints the X-coordinate of the resulting point in hexadecimal format, prefixed with `0x`.