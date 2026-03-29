The problem asks us to find a permutation of the digits of a given number `M` that results in a new number closest to another given number `N`. If multiple permutations yield the same minimum difference, we should choose the one with the smallest numeric value. `N` and `M` can be very large (up to $10^{1000}$), implying they must be handled as strings or `BigInt`s. The output must omit leading zeros.

**1. Constraint Analysis and Algorithm Choice:**

The most significant constraint is the potential size of `N` and `M`. Standard `number` types cannot hold values up to $10^{1000}$. TypeScript's `BigInt` type can handle arbitrary precision integers, so it's suitable for arithmetic operations with these large numbers.

However, the number of permutations of `k` digits is `k!`. If `M` has a large number of digits (e.g., 15 digits, `15! > 10^12`), generating all permutations becomes computationally infeasible within typical time limits. This implies that the number of digits in `M` (`k`) must be relatively small (likely `k <= 10` or `k <= 11`, for which `k!` is in the millions or tens of millions, respectively). This is a common pattern in competitive programming problems where large number constraints are given for `N`, but the size of the set to be permuted (`M`'s digits) remains small.

Therefore, the core approach will be:
*   Parse `N` and `M` as strings. Convert `N` to `BigInt`.
*   Extract the digits of `M` into an array.
*   Generate all unique permutations of these digits.
*   For each permutation:
    *   Convert the permutation (which is an array of digits) back into a string.
    *   Handle leading zeros: if the string starts with '0' and has multiple digits (e.g., "012"), strip the leading zeros to get the correct numeric value ("12").
    *   Convert this (potentially trimmed) string to a `BigInt`.
    *   Calculate the absolute difference between this `BigInt` and `N` (also a `BigInt`).
    *   Keep track of the permutation that yields the minimum difference.
    *   Implement tie-breaking: If two permutations have the same minimum difference, choose the one with the numerically smaller value.

**2. Detailed Steps:**

1.  **Input Reading**: Read `N` and `M` as strings using `readline()`.
2.  **`N` Conversion**: Convert the `N` string to a `BigInt`.
3.  **`M` Digit Extraction and Sorting**: Convert `M`'s string representation into an array of numeric digits. Crucially, sort this array of digits. Sorting enables an efficient backtracking algorithm to generate only unique permutations, which is vital if `M` contains duplicate digits (e.g., `M=122`).
4.  **Initialization**:
    *   `minDiff`: A `BigInt` initialized to `BigInt(Infinity)` to track the smallest absolute difference found so far.
    *   `closestNumberStr`: A string to store the best permutation found so far, initialized to an empty string. This will hold the result in its final (trimmed) form.
5.  **Permutation Generation (Backtracking)**:
    *   Use a recursive backtracking function, say `generatePermutations(level, digits, used, currentPermutation)`.
        *   `level`: The current index we are trying to fill in the `currentPermutation` array.
        *   `digits`: The sorted array of original digits from `M`.
        *   `used`: A boolean array, same size as `digits`, to keep track of which digits from `digits` have already been used in the `currentPermutation` being built.
        *   `currentPermutation`: An array storing the digits of the permutation currently being constructed.
    *   **Base Case**: When `level` equals the total number of digits (`numDigits`), a complete permutation is formed.
        *   Join `currentPermutation` array elements into a string (`permStr`).
        *   Trim leading zeros: If `permStr` has more than one digit and starts with '0', remove them using `permStr.replace(/^0+/, '')`.
        *   Convert the `trimmedPermStr` to a `BigInt` (`currentBigInt`).
        *   Calculate `currentDiff = abs(currentBigInt - N_big)`.
        *   **Comparison and Update**:
            *   If `currentDiff < minDiff`: update `minDiff = currentDiff` and `closestNumberStr = trimmedPermStr`.
            *   Else if `currentDiff === minDiff`: Convert `closestNumberStr` to `BigInt` (`closestBigInt`). If `currentBigInt < closestBigInt`, update `closestNumberStr = trimmedPermStr` (tie-breaking rule).
    *   **Recursive Step**: Iterate through the `digits` array from `i = 0` to `numDigits - 1`.
        *   **Skip Used Digits**: If `used[i]` is `true`, skip to the next digit as it's already part of the current permutation.
        *   **Handle Duplicates (Pruning)**: If `i > 0` and `digits[i]` is the same as `digits[i-1]`, AND `digits[i-1]` was *not* used (`!used[i-1]`), then skip `digits[i]`. This is crucial for generating unique permutations from a sorted array with duplicates; it prevents exploring redundant branches.
        *   **Place Digit**: Set `currentPermutation[level] = digits[i]`.
        *   **Mark Used**: Set `used[i] = true`.
        *   **Recurse**: Call `generatePermutations(level + 1, digits, used, currentPermutation)`.
        *   **Backtrack**: After the recursive call returns, set `used[i] = false` to allow this digit to be used in other permutations.
6.  **Output**: After all permutations are processed, `closestNumberStr` will hold the final answer. Print it using `console.log()`.

**3. Helper Function:**

A helper function `absBigInt(n: bigint)` is needed since `Math.abs` does not work with `BigInt`.