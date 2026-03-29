The puzzle asks us to perform arithmetic operations on numbers represented in the Balanced Ternary system. In this system, digits can be `1` (+1), `0` (0), or `T` (-1), and the base is 3.

**Understanding Balanced Ternary:**

*   **Conversion from Balanced Ternary to Decimal:**
    A Balanced Ternary number like `d_n d_{n-1} ... d_1 d_0` is converted to decimal as:
    `d_n * 3^n + d_{n-1} * 3^{n-1} + ... + d_1 * 3^1 + d_0 * 3^0`
    where `d_i` is `1`, `0`, or `-1` (for `T`).
    *Example:* `1T01T` = `1*3^4 + (-1)*3^3 + 0*3^2 + 1*3^1 + (-1)*3^0`
    = `81 - 27 + 0 + 3 - 1 = 56`.

*   **Conversion from Decimal to Balanced Ternary:**
    This is the most complex part. A common algorithm involves repeatedly dividing by 3 and handling remainders:
    1.  If the number `n` is 0, the result is "0".
    2.  Handle negative numbers: Convert the absolute value of `n`, then negate each digit (1 becomes T, T becomes 1, 0 remains 0).
    3.  For positive `n`:
        *   Initialize an empty list for digits.
        *   While `n > 0`:
            *   Calculate `remainder = n % 3`.
            *   If `remainder` is `0`, append '0' and set `n = n / 3`.
            *   If `remainder` is `1`, append '1' and set `n = (n - 1) / 3`.
            *   If `remainder` is `2`, this is where Balanced Ternary differs from standard ternary. A remainder of 2 is equivalent to -1 with a "carry" of +1 to the next higher ternary digit. So, append 'T' and set `n = (n + 1) / 3`.
            *   Ensure `n` is truncated to an integer after division.
        *   Reverse the collected digits to get the correct order.

**Operations:**

The puzzle requires five binary operators: `+`, `-`, `*`, `<<` (left shift), `>>` (right shift).
The most straightforward approach, given the decimal value constraints and the nature of arithmetic, is to:
1.  Convert both Balanced Ternary operands (`lhs`, `rhs`) to their decimal integer equivalents.
2.  Perform the arithmetic operation in decimal.
3.  Convert the decimal result back to Balanced Ternary.

*   **Addition (`+`), Subtraction (`-`), Multiplication (`*`):**
    These are standard arithmetic operations on the decimal values.

*   **Shift Operators (`<<`, `>>`):**
    The description and examples for shift operators can be slightly ambiguous. However, standard definitions of arithmetic shifts in a base-N system mean multiplying or dividing by `N^K`, where `K` is the shift amount.
    *   `A << K`: `A * 3^K` (left shift by K positions is multiplication by 3^K)
    *   `A >> K`: `Math.trunc(A / 3^K)` (right shift by K positions is division by 3^K, truncating towards zero)

    The `rhs` operand for shifts represents `K`. The puzzle's examples, when analyzed carefully with `1T` = 2, `1` = 1, show consistency with this arithmetic interpretation:
    *   `1T0 << 1` (9 << 1): `9 * 3^1 = 27`. `27` in BT is `100`. Matches example.
    *   `1T0 >> 1T` (9 >> 2): `Math.trunc(9 / 3^2) = Math.trunc(9 / 9) = 1`. `1` in BT is `1`. Matches example.
    *   `1T1 + 1 = 10T`: `7 + 1 = 8`. `8` in BT is `10T`. Matches example.

    Note: Some examples provided in the problem description text (`1T0 >> 1 = 1T` and `1T0 + 1 = 1T1`) seem to be inconsistent with standard arithmetic and the system's definition. However, the structured example at the very end (`1T1 + 11 = 11T`) and the shift examples when `1T` is correctly interpreted as `2` align with the arithmetic approach. Therefore, the arithmetic interpretation is chosen as the most robust and mathematically consistent solution.

**Implementation Steps:**

1.  **`balancedTernaryToDecimal(bt: string)` function:** Iterates through the input string from right to left, calculating the decimal sum based on powers of 3 and digit values (`1`, `0`, `-1` for `T`).
2.  **`decimalToBalancedTernary(n: number)` function:** Implements the algorithm described above for converting a decimal integer `n` to its Balanced Ternary string representation. It handles zero, positive, and negative numbers.
3.  **Main Logic:**
    *   Read the three input lines: `lhsString`, `op`, `rhsString`.
    *   Convert `lhsString` and `rhsString` to `lhsDecimal` and `rhsDecimal` using `balancedTernaryToDecimal`.
    *   Use a `switch` statement on `op` to perform the correct arithmetic operation (`+`, `-`, `*`, `<<`, `>>`). For shifts, use `Math.pow(3, rhsDecimal)` and `Math.trunc()` for integer results.
    *   Convert the `resultDecimal` back to `resultBalancedTernary` using `decimalToBalancedTernary`.
    *   Print the `resultBalancedTernary`.