The problem asks us to find the smallest number greater than a given integer `N` that has the same digit sum as `N`. The input `N` can be up to `10^10`.

**Reasoning:**

A naive approach would be to iterate `num` starting from `N + 1`, calculate the digit sum for each `num`, and stop when a number with the same digit sum as `N` is found. However, `N` can be as large as `10^10`. The gap between `N` and the next number with the same digit sum can be very large (e.g., for `N = 10^10`, its digit sum is `1`. The next number with digit sum `1` is `10^11`. This means iterating `9 * 10^10` numbers). This brute-force approach would be too slow given typical time limits (usually 1 second for `10^8` operations).

Therefore, a more efficient, direct construction method based on digit manipulation is required. This problem is similar to finding the "next lexicographical permutation" but with an additional sum constraint.

The strategy involves two main cases:

1.  **Finding a successor with the same number of digits:**
    To find the smallest number `M > N` with the same digit sum, we want to change `N` as little as possible, starting from the rightmost (least significant) digit.
    We iterate through the digits of `N` from right to left (from `d_k` to `d_0`). Let's say we are at digit `d_i`.
    *   If `d_i` is less than 9, we try to increment it (`d_i' = d_i + 1`).
    *   The digits to the left of `d_i` (i.e., `d_{k-1} ... d_{i+1}`) remain unchanged. Let their sum be `prefixSum`.
    *   The new digit sum contributed by the changed parts would be `prefixSum + d_i'`.
    *   We need the total sum to be `originalSum`. So, the remaining digits to the right of `d_i` (i.e., `d_{i-1} ... d_0`) must sum up to `originalSum - (prefixSum + d_i')`. Let this be `sumToDistribute`.
    *   We have `i` positions (from `0` to `i-1`) to place digits that sum to `sumToDistribute`. The maximum sum these `i` digits can form is `i * 9`.
    *   If `sumToDistribute` is non-negative and less than or equal to `i * 9`, then a valid number can be constructed. To make this number the smallest possible:
        *   Keep the prefix digits `d_k ... d_{i+1}` as they are.
        *   Set `d_i` to `d_i'`.
        *   Fill the remaining `i` positions (`d_{i-1} ... d_0`) from right to left (from `d_0` to `d_{i-1}`) by placing as many 9s as possible, until `sumToDistribute` is exhausted. This makes the suffix part of the number as small as possible.
        *   Once such a digit `d_i` is found and the number constructed, we have our answer, and we can stop.

2.  **Finding a successor with more digits:**
    If the loop in step 1 completes without finding a solution, it means no valid number with the same number of digits as `N` can be formed using the described greedy approach. This typically happens when `N` consists of many trailing 9s, or incrementing any digit always results in a sum that cannot be compensated by the remaining digits.
    In this case, the smallest successor number *must* have one more digit than `N`. To make it the smallest, it will start with a `1`.
    *   The new number will have `len + 1` digits (where `len` is the number of digits in `N`).
    *   The first digit will be `1`. This contributes `1` to the digit sum.
    *   The remaining `len` digits must sum to `originalSum - 1`.
    *   To make the number smallest, these `len` digits should be filled from right to left with as many 9s as possible, and the remaining sum (if any) as a single digit, and then zeros. This ensures the smallest number.

**Example Walkthrough (N = 19, originalSum = 10):**
1.  `digits = [1, 9]`, `len = 2`.
2.  Iterate `i` from `len-1` (1) down to `0`.
    *   `i = 1`: `digits[1]` is `9`. `9 < 9` is false. Skip.
    *   `i = 0`: `digits[0]` is `1`. `1 < 9` is true.
        *   `prefixSum` for `i=0` is `0` (no digits to the left).
        *   `tentativeCurrentDigit = digits[0] + 1 = 1 + 1 = 2`.
        *   `sumAfterPrefixAndIncrement = 0 + 2 = 2`.
        *   `sumToDistribute = originalSum - sumAfterPrefixAndIncrement = 10 - 2 = 8`.
        *   `numAvailablePositions = len - 1 - i = 2 - 1 - 0 = 1` (for `digits[1]`).
        *   `maxDistributableSum = 1 * 9 = 9`.
        *   Check condition: `8 >= 0` (true) AND `8 <= 9` (true). Both true.
        *   Construct `resultDigits`: `[0, 0]` (initially).
        *   Set prefix: None.
        *   Set `resultDigits[0] = 2`. `resultDigits` is now `[2, 0]`.
        *   Distribute `sumToDistribute = 8` to `k` from `len-1` (1) down to `i+1` (1).
            *   `k = 1`: `val = min(9, 8) = 8`. `resultDigits[1] = 8`. `sumToDistribute = 8 - 8 = 0`.
        *   `resultDigits` is `[2, 8]`.
        *   Convert to number: `parseInt("28")` -> `28`. Print `28` and exit.

**Example Walkthrough (N = 99, originalSum = 18):**
1.  `digits = [9, 9]`, `len = 2`.
2.  Iterate `i` from `len-1` (1) down to `0`.
    *   `i = 1`: `digits[1]` is `9`. `9 < 9` is false. Skip.
    *   `i = 0`: `digits[0]` is `9`. `9 < 9` is false. Skip.
3.  Loop ends. No solution found with same number of digits.
4.  Go to "more digits" case. New number will have `len+1 = 3` digits.
    *   `newResultDigits = [0, 0, 0]` (initially). `newResultDigits[0] = 1`. `newResultDigits` is `[1, 0, 0]`.
    *   `sumToDistributeForNewLength = originalSum - 1 = 18 - 1 = 17`.
    *   Distribute `17` to `k` from `len` (2) down to `1`.
        *   `k = 2`: `val = min(9, 17) = 9`. `newResultDigits[2] = 9`. `sumToDistributeForNewLength = 17 - 9 = 8`.
        *   `k = 1`: `val = min(9, 8) = 8`. `newResultDigits[1] = 8`. `sumToDistributeForNewLength = 8 - 8 = 0`.
    *   `newResultDigits` is `[1, 8, 9]`.
    *   Convert to number: `parseInt("189")` -> `189`. Print `189`.

This approach ensures efficiency as it performs a fixed number of operations based on the number of digits (max 11 for `10^10`), not the value of `N`.