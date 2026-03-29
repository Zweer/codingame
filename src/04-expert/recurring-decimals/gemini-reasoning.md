The problem asks us to compute the decimal representation of `1/N` for a given integer `N`, and enclose any repeating part of the decimal in parentheses.

**Understanding Repeating Decimals**

A fraction `1/N` can result in a terminating decimal or a repeating decimal.
*   **Terminating decimals** occur when the prime factors of the denominator `N` (after simplification of the fraction, which is not applicable here as the numerator is 1) are only 2 and 5.
*   **Repeating decimals** occur when the denominator `N` has prime factors other than 2 or 5.

The key to identifying repeating decimals lies in simulating the long division process. During long division, we repeatedly divide a numerator (initially 1, then the remainder multiplied by 10) by the denominator `N`. The digits of the decimal are the quotients, and the remainders are used to compute the next digit. If a remainder repeats, it means the sequence of subsequent digits will also repeat indefinitely.

**Algorithm**

1.  **Initialization**:
    *   Start with `numerator = 1`.
    *   Maintain an array, `decimalDigits`, to store the digits of the decimal part.
    *   Use a `Map`, `remainderToIndex`, to store `(remainder -> index)`. This map will store the first index in `decimalDigits` where a particular remainder was encountered.
    *   `currentPosition` keeps track of the current length of `decimalDigits`, which is also the index for the next digit.

2.  **Long Division Simulation Loop**:
    *   In each iteration, consider the current `numerator` (which is effectively the remainder from the previous step, possibly multiplied by powers of 10 for subsequent decimal places).
    *   **Check for Termination**: If the `numerator` becomes `0`, the decimal terminates. Break the loop.
    *   **Check for Repetition**: If the current `numerator` (acting as a remainder) is already present in `remainderToIndex`, it means we've entered a repeating cycle.
        *   Retrieve the `startIndex` of the repeating block from `remainderToIndex.get(numerator)`.
        *   Set a flag `isRepeating = true` and store `repeatStartIndex`.
        *   Break the loop.
    *   **Store Remainder**: If it's a new remainder, store it in `remainderToIndex` along with its `currentPosition`.
    *   **Calculate Next Digit**:
        *   Multiply the `numerator` by 10 to simulate bringing down the next zero in long division.
        *   Calculate the `digit` by integer dividing the `numerator` by `N` (`Math.floor(numerator / N)`).
        *   Add this `digit` to `decimalDigits`.
    *   **Update Numerator (Remainder)**: Update the `numerator` to be the remainder of the current division (`numerator %= N`). This remainder will be used for the next iteration.
    *   Increment `currentPosition`.

3.  **Construct Output String**:
    *   The result always starts with "0.".
    *   If `isRepeating` is `true`:
        *   The non-repeating part is `decimalDigits[0]` to `decimalDigits[repeatStartIndex - 1]`.
        *   The repeating part is `decimalDigits[repeatStartIndex]` to the end of `decimalDigits`.
        *   Concatenate these parts as `0.nonRepeatingPart(repeatingPart)`.
    *   If `isRepeating` is `false` (terminating decimal):
        *   Concatenate all digits in `decimalDigits` to "0.".

**Example: 1/7**

1.  `N = 7`, `numerator = 1`, `decimalDigits = []`, `remainderToIndex = {}`, `currentPosition = 0`.
2.  **Iteration 1**:
    *   `numerator` (remainder) is `1`. Not in map.
    *   `remainderToIndex.set(1, 0)`.
    *   `numerator = 1 * 10 = 10`. `digit = floor(10/7) = 1`. `decimalDigits = [1]`.
    *   `numerator = 10 % 7 = 3`. `currentPosition = 1`.
3.  **Iteration 2**:
    *   `numerator` (remainder) is `3`. Not in map.
    *   `remainderToIndex.set(3, 1)`.
    *   `numerator = 3 * 10 = 30`. `digit = floor(30/7) = 4`. `decimalDigits = [1, 4]`.
    *   `numerator = 30 % 7 = 2`. `currentPosition = 2`.
4.  ... (continues for 2, 6, 4, 5) ...
5.  **Iteration 7**:
    *   `numerator` (remainder) is `1`. This is in `remainderToIndex` at index `0`.
    *   `isRepeating = true`, `repeatStartIndex = 0`. Break loop.

**Result Construction**:
*   `nonRepeatingPart` is empty (from index 0 to -1).
*   `repeatingPart` is `142857` (from index 0 to end of `decimalDigits`).
*   Output: `0.(142857)`.

**Constraints and Performance**:
*   `1 < N < 2^31`. JavaScript's `number` type can safely handle integers up to `2^53 - 1`, so `N` and `numerator` will fit.
*   The loop runs at most `N` times because there are at most `N` distinct remainders (0 to N-1).
*   For very large `N` (e.g., `N` close to `2^31`), the number of decimal digits can also be very large (up to `N-1`). Storing billions of digits in memory or printing them would exceed typical CodinGame limits. However, this is a standard algorithm for this problem, and it's expected that test cases will not push these extreme limits.