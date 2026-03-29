The problem asks us to find a page number `mid` such that if Alice numbers pages `st` to `mid` and Bob numbers pages `mid + 1` to `ed`, they write a "fair" number of digits. Fairness is defined as Alice's total digit count being as close as possible to Bob's, but not exceeding Bob's. This means we want to find the largest possible `mid` such that `totalDigits(st, mid) <= totalDigits(mid + 1, ed)`.

This problem can be solved efficiently using binary search because of the monotonic property:
As `mid` increases:
1.  The number of digits Alice writes (`totalDigits(st, mid)`) increases or stays the same.
2.  The number of digits Bob writes (`totalDigits(mid + 1, ed)`) decreases or stays the same.

Therefore, the condition `totalDigits(st, mid) <= totalDigits(mid + 1, ed)` will transition from true to false at some point. We are looking for the largest `mid` for which this condition is true.

**Algorithm:**

1.  **Helper Function: `getDigits(n: number)`:**
    This function calculates the total number of digits written if all pages from 1 to `n` (inclusive) were numbered.
    This is not simply `n * countDigits(n)`. For example, numbers 1-9 are 1-digit, 10-99 are 2-digits, etc.
    The function iteratively sums up digits for blocks of numbers with the same digit count (e.g., 1-digit numbers, 2-digit numbers, etc.) and then handles the partial block where `n` falls.
    For example, to calculate digits up to 123:
    *   1-digit numbers (1-9): 9 numbers * 1 digit/number = 9 digits.
    *   2-digit numbers (10-99): 90 numbers * 2 digits/number = 180 digits.
    *   3-digit numbers (100-123): (123 - 100 + 1) numbers * 3 digits/number = 24 * 3 = 72 digits.
    *   Total: 9 + 180 + 72 = 261 digits.

2.  **Helper Function: `getTotalDigitsInRange(start: number, end: number)`:**
    This function calculates the total number of digits written for pages in a specific range `[start, end]`.
    It can be calculated as `getDigits(end) - getDigits(start - 1)`. If `start - 1` is 0 or less, `getDigits(0)` should return 0.

3.  **Binary Search:**
    *   Initialize `low = st` (Alice must number at least the starting page).
    *   Initialize `high = ed` (Alice could potentially number all pages).
    *   Initialize `ans = st` (This will store the best `mid` found that satisfies the condition).
    *   Loop while `low <= high`:
        *   Calculate `mid = floor((low + high) / 2)`.
        *   Calculate `aliceDigits = getTotalDigitsInRange(st, mid)`.
        *   Calculate `bobDigits = getTotalDigitsInRange(mid + 1, ed)`.
        *   **Condition Check:**
            *   If `aliceDigits <= bobDigits`: This `mid` is a valid candidate. Since we want the *largest* such `mid`, we store `mid` in `ans` and try to find a larger `mid` by setting `low = mid + 1`.
            *   If `aliceDigits > bobDigits`: This `mid` makes Alice write too many digits. We need to reduce `mid` by setting `high = mid - 1`.
    *   After the loop, `ans` will hold the largest page number Alice should write to satisfy the condition.

**Constraints Consideration:**
*   `st` and `ed` are up to 10,000,000.
*   The maximum number of digits written for `10,000,000` is `getDigits(10,000,000) = 68,888,897`. This fits comfortably within standard 64-bit floating-point numbers used by JavaScript's `number` type (which can represent integers precisely up to `2^53 - 1`, approximately `9 * 10^15`). The `getDigits` and `getTotalDigitsInRange` functions will handle these values correctly.
*   The binary search will perform `log(ed - st)` iterations, which is very fast (`log(10^7)` is about 23-24 iterations). Each iteration involves constant number of `getDigits` calls, which are also efficient (at most 8-9 iterations for `ed=10^7`).

**Example (1, 200):**
*   Target total digits `getDigits(200) = 492`.
*   We want `aliceDigits` around `492 / 2 = 246`.
*   Binary search iteratively narrows down `mid`.
*   When `mid = 118`:
    *   `aliceDigits = getTotalDigitsInRange(1, 118) = getDigits(118) - getDigits(0) = 246`.
    *   `bobDigits = getTotalDigitsInRange(119, 200) = getDigits(200) - getDigits(118) = 492 - 246 = 246`.
    *   `246 <= 246` is true. `ans` becomes 118, `low` becomes 119.
*   When `mid = 119`:
    *   `aliceDigits = getTotalDigitsInRange(1, 119) = getDigits(119) - getDigits(0) = 249`.
    *   `bobDigits = getTotalDigitsInRange(120, 200) = getDigits(200) - getDigits(119) = 492 - 249 = 243`.
    *   `249 <= 243` is false. `high` becomes 118.
*   Loop terminates as `low (119) > high (118)`. The final `ans` is 118.

This matches the example output.