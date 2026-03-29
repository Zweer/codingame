The problem asks us to find the meeting point of two "digital rivers". A digital river is a sequence of numbers where each number `N` is followed by `N` plus the sum of its digits. For example, 123 is followed by 123 + (1+2+3) = 129. We are given the starting values `r1` and `r2` for two rivers, and we are guaranteed that they will meet. We need to print the first common value they share.

**Reasoning:**

1.  **Digital River Progression:** Each number `N` in a digital river is followed by `N + sumDigits(N)`. Since `sumDigits(N)` is always positive for `N > 0`, the numbers in a digital river always strictly increase.

2.  **Meeting Point Logic:** Since both rivers always generate increasing sequences, if they are guaranteed to meet, they will eventually converge to the same value.
    Consider the current values of the two rivers, `current_r1` and `current_r2`.
    *   If `current_r1` equals `current_r2`, we have found the meeting point.
    *   If `current_r1` is less than `current_r2`, then `current_r1` needs to "catch up" or `current_r2` needs to "wait". To make progress towards a meeting, it's more efficient to advance the smaller value. By advancing `current_r1`, we bring it closer to `current_r2`.
    *   If `current_r2` is less than `current_r1`, we similarly advance `current_r2`.

3.  **Algorithm:**
    *   Create a helper function `sumDigits(n)` that calculates the sum of the digits of a given number `n`. This can be done by repeatedly taking `n % 10` (the last digit) and adding it to a sum, then dividing `n` by 10 (integer division) until `n` becomes 0.
    *   Initialize `r1` and `r2` with the input values.
    *   Enter a loop that continues as long as `r1` is not equal to `r2`.
        *   Inside the loop, compare `r1` and `r2`:
            *   If `r1 < r2`, update `r1 = r1 + sumDigits(r1)`.
            *   If `r2 < r1`, update `r2 = r2 + sumDigits(r2)`.
    *   Once the loop terminates (i.e., `r1 === r2`), print `r1` (or `r2`, as they are the same).

4.  **Efficiency:** The constraints `r1, r2 <= 20,000,000` for initial values are important. While the numbers can grow beyond this, `sumDigits(N)` adds a relatively small value (maximum around 55 for numbers up to 20 million). This means the numbers increase steadily but not explosively. The described algorithm ensures that in each step, the "gap" between `r1` and `r2` either closes or shrinks (or if they are equal, it terminates). This guarantees that they will eventually meet within a reasonable number of iterations.

**Example Walkthrough (32, 47):**

*   Initial: `r1 = 32`, `r2 = 47`
*   Loop 1: `r1 < r2` (32 < 47).
    *   `sumDigits(32) = 3 + 2 = 5`
    *   `r1 = 32 + 5 = 37`
*   Current: `r1 = 37`, `r2 = 47`
*   Loop 2: `r1 < r2` (37 < 47).
    *   `sumDigits(37) = 3 + 7 = 10`
    *   `r1 = 37 + 10 = 47`
*   Current: `r1 = 47`, `r2 = 47`
*   Loop 3: `r1 === r2`. Loop terminates.
*   Print `r1` (which is 47).

This approach is correct and efficient enough for the given constraints.