The problem asks us to rearrange the digits of an input string `S` into two numbers, `A` and `B`, such that `A` is minimized, and then `B` is minimized. Several rules apply: `0 <= A, B <= 10^18`, no leading zeros (unless the number itself is `0`), and all digits from `S` must be used.

**Constraints Analysis and Initial Checks:**

1.  **Length of S:** `1 <= length of S <= 50`.
2.  **Value of A, B:** `0 <= A, B <= 10^18`.
    *   The number `10^18` has 19 digits. This means `A` and `B` can have at most 19 digits.
    *   If `length of S` is greater than `19 + 19 = 38`, it's impossible to form two numbers each within the `10^18` constraint. So, if `L > 38`, output `-1 -1`.
3.  **Minimum digits for two numbers:** If `L < 2`, it's impossible to form two numbers. Output `-1 -1`.

**Special Case: All Zeros:**

*   If `S` consists only of '0's (e.g., "0", "00", "000").
    *   If `S = "00"` (L=2): The only way to form two valid numbers using both '0's is `A=0, B=0`. Output `0 0`.
    *   If `S = "0"` (L=1): Already covered by `L < 2`, so `-1 -1`.
    *   If `S = "000"` or more zeros (L > 2): It's impossible to use all digits. You can form `A=0, B=0` (using two '0's), but the remaining '0's cannot be placed to form valid numbers (e.g., "00" is invalid). So, output `-1 -1`.

**General Strategy: Iterating Lengths and Greedy Construction**

To minimize `A` then `B`, we employ a systematic search for the best `(A, B)` pair. The key insight is that for fixed lengths of `A` and `B` and a given set of available digits, the smallest possible number is formed by picking the smallest allowed digit for the first position, then filling the remaining positions with the smallest available digits in ascending order.

The algorithm proceeds as follows:

1.  **Count Digits:** Parse the input string `S` to get a frequency map of each digit ('0' through '9'). Let this be `initialCounts`.
2.  **Initialize Best Result:** Keep track of the best `(A, B)` pair found so far. Initialize `bestValA` and `bestValB` to a very large `BigInt` value (e.g., `10^20`) and `finalA_str`, `finalB_str` to `null`.
3.  **Iterate `lenA`:** Loop through all possible lengths for number `A`, from `1` to `L-1` (where `L` is `S.length`). For each `lenA`, the length of `B` will be `lenB = L - lenA`.
4.  **Construct `A` and `B`:**
    *   For the current `lenA`, attempt to construct the lexicographically smallest number `candidateA_str` using `lenA` digits from `initialCounts`. This is done using a helper function `buildMinNumberAndRemaining`. This function ensures valid leading digits and returns the `candidateA_str` along with the `remainingCounts` (digits not used for `A`).
    *   If `candidateA_str` is successfully formed and valid (not null), then attempt to construct the lexicographically smallest number `candidateB_str` using `lenB` digits from the `remainingCounts` (from step 4a).
    *   If both `candidateA_str` and `candidateB_str` are successfully formed and valid, and all digits from the original `S` have been used (checked by verifying `finalRemainingCounts` from `buildMinNumberAndRemaining` for `B` are all zero):
        *   Convert `candidateA_str` and `candidateB_str` to `BigInt` values (`currentValA`, `currentValB`).
        *   Compare `(currentValA, currentValB)` with `(bestValA, bestValB)`.
        *   If `currentValA < bestValA`, or if `currentValA === bestValA` and `currentValB < bestValB`, then this is a better pair. Update `bestValA`, `bestValB`, `finalA_str`, `finalB_str`.
5.  **Output Result:** After checking all possible `lenA` values, if a valid `(A, B)` pair was found, print `finalA_str` and `finalB_str`. Otherwise, print `-1 -1`.

**Helper Function `buildMinNumberAndRemaining(digitCounts, length)`:**

This function is crucial. It takes a map of available `digitCounts` and a `length` and tries to construct the smallest possible number string. It also returns the updated `digitCounts` representing the digits consumed.

*   **Leading Zero Rule:**
    *   If `length === 1` and a '0' is available, the number can be "0". This is the smallest single-digit number.
    *   Otherwise (if `length > 1`, or if `length === 1` but no '0' is available), the first digit must be the smallest available non-zero digit. If no non-zero digit is available, it's impossible to form a valid number, so it returns `null`.
*   **Filling Remaining Digits:** After determining the first digit, the remaining `length - 1` digits are picked greedily by appending the smallest available digits (from '0' to '9') in increasing order.
*   **Validation:** After construction, it checks if the actual length matches `length` (ensuring enough digits were available) and if the resulting `BigInt` value exceeds `10^18`. If any rule is violated, it returns `null`.

**Complexity:**
The main loop runs `L-1` times (at most 37 times). Inside the loop, `buildMinNumberAndRemaining` involves iterating through digit counts (at most 10 digits) and building strings of length up to `L`. This is approximately `O(L)`. Therefore, the overall complexity is `O(L^2)`, which for `L=38` (`38^2 = 1444`) is very efficient and well within typical time limits.