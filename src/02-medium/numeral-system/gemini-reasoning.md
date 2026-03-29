The goal is to find the minimal numeral system base `N` (between 2 and 36) for which a given equality `X+Y=Z` holds true.

Here's a breakdown of the approach:

1.  **Parse the input:** The input string `S` is in the format `X+Y=Z`. We need to extract the string representations of `X`, `Y`, and `Z`. This can be done by splitting the string first by `+` and then by `=`.

2.  **Determine the minimum possible base (`minBase`):** A numeral system's base must be strictly greater than the value of its largest digit. Digits '0'-'9' represent values 0-9, and 'A'-'Z' represent values 10-35. To find the `minBase`, we iterate through all characters in `X`, `Y`, and `Z`, convert each character to its numerical value (e.g., 'A' is 10, 'Z' is 35), and find the maximum of these values. The `minBase` will then be `maxDigitValue + 1`. Since the problem states that `N` must be at least 2, we take `Math.max(2, maxDigitValue + 1)`.

3.  **Iterate and test bases:** We iterate through possible bases `N` starting from `minBase` up to the maximum allowed base, which is 36.

4.  **Convert to decimal:** For each `N` in the iteration, we convert `X`, `Y`, and `Z` from base `N` to their equivalent decimal (base 10) values. TypeScript's built-in `parseInt(string, radix)` function is perfect for this purpose. For example, `parseInt("52", 9)` will convert "52" (base 9) to its decimal equivalent (47).

5.  **Check equality:** After converting `X`, `Y`, and `Z` to their decimal values (`valX`, `valY`, `valZ`), we check if `valX + valY === valZ`.

6.  **Output the result:** As soon as we find a base `N` for which the equality holds, that `N` is the minimal possible numeral system because we are iterating in ascending order. We print `N` and stop.

**Example: `52+38=101`**

*   **Parse:** `X="52"`, `Y="38"`, `Z="101"`.
*   **Min Base:**
    *   Digits involved: `5, 2, 3, 8, 1, 0`.
    *   Maximum digit value is `8`.
    *   `minBase = Math.max(2, 8 + 1) = 9`.
*   **Iterate `N` from 9 to 36:**
    *   **`N = 9`:**
        *   `valX = parseInt("52", 9) = 5 * 9 + 2 = 47`
        *   `valY = parseInt("38", 9) = 3 * 9 + 8 = 35`
        *   `valZ = parseInt("101", 9) = 1 * 9^2 + 0 * 9^1 + 1 * 9^0 = 81 + 0 + 1 = 82`
        *   Check: `47 + 35 = 82`. `82 === 82`. The equality holds.
*   **Output:** `9`.

This approach ensures we find the smallest valid base efficiently. JavaScript's `Number` type can safely handle integers up to `2^53 - 1`, which is sufficient for 10-character numbers in base 36 (`36^10` is approx `3.65 * 10^15`, well within limits).