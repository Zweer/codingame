The problem asks us to determine if two points, A and B, have the same "color" on a plane divided by several lines. The coloring scheme is based on a "strange chess board", which typically implies that regions alternate colors as you cross a line. If either point A or B lies directly on any of the given lines, a special "ON A LINE" message should be printed.

Here's a breakdown of the solution approach:

1.  **Input Reading:**
    *   Read the coordinates of points A (`xA`, `yA`) and B (`xB`, `yB`).
    *   Read the total number of lines, `n`.
    *   Read `n` sets of `a`, `b`, `c` coefficients for each line `ax + by + c = 0`.

2.  **Line Normalization and Uniqueness:**
    *   The problem states that lines like `2x + 4y + 6 = 0` and `x + 2y + 3 = 0` represent the same line. This means we need to normalize each line equation to a canonical form and only consider unique lines.
    *   **Normalization Steps:** For each line `(a, b, c)`:
        1.  Calculate the Greatest Common Divisor (GCD) of the absolute values of `a`, `b`, and `c`. Let this be `g`.
        2.  Divide `a`, `b`, and `c` by `g`. This reduces the coefficients to their smallest integer representation.
        3.  To ensure a unique sign convention, if `a` is negative, or if `a` is zero and `b` is negative, multiply all three coefficients `(a, b, c)` by -1. This ensures the first non-zero coefficient is always positive (e.g., `x+2y+3=0` instead of `-x-2y-3=0`).
    *   Store these normalized, unique line representations (e.g., as a string `"${a},${b},${c}"`) in a `Set` data structure to automatically handle duplicates.
    *   After processing all input lines, convert the `Set` back into an array of coefficient tuples for easy iteration.

3.  **Check if Points are on a Line:**
    *   For each point `(x, y)` and each normalized line `(a, b, c)`, evaluate the expression `ax + by + c`.
    *   If `ax + by + c` evaluates to `0`, the point lies on that line. Since the input coordinates and coefficients are integers, we can use exact equality (`=== 0`).
    *   Iterate through all unique normalized lines and check if A or B lies on any of them. If at least one point is found to be on a line, print "ON A LINE" and terminate.

4.  **Determine Colors (if points are not on lines):**
    *   If neither A nor B is on any line, we need to determine their colors. A common approach for this "chess board" coloring is based on the parity of the number of lines a point is on one specific "side" of.
    *   For a point `(x, y)` and a line `ax + by + c = 0`, if `ax + by + c > 0`, we consider it to be on the "positive side" of the line. If `ax + by + c < 0`, it's on the "negative side".
    *   For each point (A and B):
        1.  Initialize a counter `positiveSideCount = 0`.
        2.  Iterate through all unique normalized lines.
        3.  For each line, if the point lies on its "positive side" (i.e., `ax + by + c > 0`), increment `positiveSideCount`.
        4.  The "color parity" of the point is `positiveSideCount % 2`.
    *   Compare the color parities of A and B. If they are the same (`parityA === parityB`), print "YES". Otherwise, print "NO".

**Helper Functions:**

*   `gcd(a, b)`: Implements the Euclidean algorithm to find the greatest common divisor of two numbers.
*   `gcdTriple(a, b, c)`: Uses `gcd(a, gcd(b, c))` to find the GCD of three numbers.

**Example Trace (from problem description):**
Input:
`1 1 0 0` (A=(1,1), B=(0,0))
`1` (n=1)
`1 2 3` (Line L1: `x + 2y + 3 = 0`)

1.  **Line Normalization:**
    *   L1: `(a=1, b=2, c=3)`.
    *   `gcdTriple(1, 2, 3)` = 1. Coefficients remain `(1, 2, 3)`.
    *   `a` is not negative.
    *   `uniqueLines` contains `{"1,2,3"}`.
    *   `finalLines` is `[[1, 2, 3]]`.

2.  **Check on Line:**
    *   For A (1,1): `1*(1) + 2*(1) + 3 = 1 + 2 + 3 = 6`. `6 !== 0`. A is not on L1.
    *   For B (0,0): `1*(0) + 2*(0) + 3 = 0 + 0 + 3 = 3`. `3 !== 0`. B is not on L1.
    *   Neither A nor B is on a line.

3.  **Determine Colors:**
    *   **Point A (1,1):**
        *   For L1 `(1,2,3)`: `1*(1) + 2*(1) + 3 = 6`. Since `6 > 0`, `positiveSideCount` for A becomes 1.
        *   `parityA = 1 % 2 = 1`.
    *   **Point B (0,0):**
        *   For L1 `(1,2,3)`: `1*(0) + 2*(0) + 3 = 3`. Since `3 > 0`, `positiveSideCount` for B becomes 1.
        *   `parityB = 1 % 2 = 1`.
    *   `parityA === parityB` (1 === 1). Print "YES". This matches the example output.