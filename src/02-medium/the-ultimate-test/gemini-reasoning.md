The problem asks us to insert `+`, `-`, or nothing (concatenation) between the digits of a given number `N` to form an expression that evaluates to a target number `K`. We need to output all such expressions. The digits of `N` must remain in their original order. A crucial rule is the operator precedence: `nothing` (concatenation) > `+` > `-`. This implies that concatenation forms numbers first, and then these numbers are added or subtracted from left to right. For example, `1+23-4` is evaluated as `(1) + (23) - (4)`.

This problem is a classic application of **recursion** or **backtracking**. We can explore all possible ways to place operators (or no operator) between consecutive digits.

Let `N` be represented as a string of digits, `N_str`. If `N_str` has `L` digits, there are `L-1` positions where an operator can be placed. At each position, we have 3 choices: `+`, `-`, or nothing. This gives `3^(L-1)` total combinations. Given `N` up to `10^10`, `L` can be at most 10 (e.g., `9999999999`). `3^9` is `19683`, which is a small number of combinations, making an exhaustive search feasible.

### Recursive Approach

We can define a recursive function that processes the digits one by one. The key challenge is handling the "nothing" operator correctly, which implies forming multi-digit numbers. To do this, we need to keep track of:
1.  The `currentSum`: The sum of all numbers processed so far, excluding the very last number segment that is currently being built.
2.  The `currentNum`: The numerical value of the last number segment being formed by concatenation (e.g., if we are processing `123` and have decided to form `12`, `currentNum` would be `12`).
3.  The `sign`: The sign (`+1` for addition, `-1` for subtraction) that applies to `currentNum` when it's eventually added to `currentSum`. This is essential because `currentNum` might be extended by concatenation, but its overall contribution to the sum (positive or negative) remains fixed until a `+` or `-` operator is introduced.

Let's define our recursive function: `findExpressions(idx, currentExpr, currentSum, currentNum, sign)`.

*   `idx`: The index of the digit in `N_str` that we are currently considering.
*   `currentExpr`: The string representation of the expression built so far.
*   `currentSum`: The accumulated sum of all terms that have been finalized (i.e., not including `currentNum`).
*   `currentNum`: The numerical value of the last number segment. This segment can be extended by concatenating more digits.
*   `sign`: The sign (`+1` or `-1`) that `currentNum` will have when it's finally added to `currentSum`.

**Base Case:**
When `idx` reaches `N_len` (meaning all digits have been processed), we calculate the total sum by adding `currentNum` (with its `sign`) to `currentSum`. If this total equals `K`, we add `currentExpr` to our `results` list.

**Recursive Step (for each digit `N_str[idx]`):**
For each digit `digit_char = N_str[idx]` and its numerical value `digit_val = parseInt(digit_char)`, we explore three possibilities:

1.  **Append (Nothing operator):**
    *   This means `digit_val` is appended to `currentNum`.
    *   `newCurrentNum = currentNum * 10 + digit_val`.
    *   The `currentSum` and `sign` remain unchanged because we are still building the same number segment.
    *   Recursive call: `findExpressions(idx + 1, currentExpr + digit_char, currentSum, newCurrentNum, sign)`

2.  **Add (`+` operator):**
    *   The `currentNum` (with its `sign`) is now finalized and added to `currentSum`. This forms the `newCurrentSum`.
    *   `newCurrentSum = currentSum + (sign * currentNum)`.
    *   A new number segment begins with `digit_val`, and it will be added, so its `sign` is `+1`.
    *   Recursive call: `findExpressions(idx + 1, currentExpr + '+' + digit_char, newCurrentSum, digit_val, 1)`

3.  **Subtract (`-` operator):**
    *   Similar to addition, but the new number segment will be subtracted.
    *   `newCurrentSum = currentSum + (sign * currentNum)`.
    *   A new number segment begins with `digit_val`, and it will be subtracted, so its `sign` is `-1`.
    *   Recursive call: `findExpressions(idx + 1, currentExpr + '-' + digit_char, newCurrentSum, digit_val, -1)`

**Initial Call:**
The process starts with the first digit `N_str[0]`.
*   `idx` starts at `1` (as `N_str[0]` is already processed).
*   `currentExpr` is `N_str[0]`.
*   `currentSum` is `0` (nothing accumulated yet).
*   `currentNum` is `parseInt(N_str[0])`.
*   `sign` is `1` (the first number segment is always positive).

The `Number` type in TypeScript/JavaScript can safely handle integers up to `2^53 - 1` (approx. `9 * 10^15`). Since `N` is at most `10^10` and `K` is `10^8`, intermediate `currentNum` and `currentSum` values will easily fit within this limit.

### Example Trace: `N = "123"`, `K = 6`

1.  **Initial Call:** `findExpressions(1, "1", 0, 1, 1)` (processing '2')

2.  **Inside `findExpressions(1, "1", 0, 1, 1)`:** `digit_char = '2'`, `digit_val = 2`
    *   **Append:** Call `findExpressions(2, "12", 0, 12, 1)` (processing '3')
    *   **Add:** Call `findExpressions(2, "1+2", 1, 2, 1)` (processing '3')
    *   **Subtract:** Call `findExpressions(2, "1-2", 1, 2, -1)` (processing '3')

3.  **Path: `findExpressions(2, "1+2", 1, 2, 1)`:** `digit_char = '3'`, `digit_val = 3`
    *   **Append:** Call `findExpressions(3, "1+23", 1, 23, 1)`
        *   Base Case (`idx = 3 == N_len`): `currentSum + (sign * currentNum) = 1 + (1 * 23) = 24`. `24 != 6`. Return.
    *   **Add:** Call `findExpressions(3, "1+2+3", 1 + (1 * 2) = 3, 3, 1)`
        *   Base Case (`idx = 3 == N_len`): `currentSum + (sign * currentNum) = 3 + (1 * 3) = 6`. `6 == 6`. **Add "1+2+3" to `results`.** Return.
    *   **Subtract:** Call `findExpressions(3, "1+2-3", 1 + (1 * 2) = 3, 3, -1)`
        *   Base Case (`idx = 3 == N_len`): `currentSum + (sign * currentNum) = 3 + (-1 * 3) = 0`. `0 != 6`. Return.

This shows how `1+2+3` is found. Other paths would be explored similarly until all combinations are exhausted.