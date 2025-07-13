The problem asks us to determine the drawing direction (CLOCKWISE or COUNTERCLOCKWISE) of a polygon given a sequence of its vertices. The polygon is formed by connecting consecutive points, with the last point connecting back to the first.

## Reasoning

The orientation of a polygon can be determined by calculating the sum of the "signed areas" of its edges. This is a common technique in computational geometry, often derived from a variation of the Shoelace Formula.

For a polygon with vertices `P_0, P_1, ..., P_{N-1}` (where `P_i = (x_i, y_i)`), the sum `S` is calculated as:

`S = Σ (x_i * y_{i+1} - x_{i+1} * y_i)` for `i` from `0` to `N-1`.
Here, `P_N` is considered `P_0` (i.e., `x_N = x_0` and `y_N = y_0`).

The sign of this sum `S` tells us the orientation:

1.  **Coordinate System Consideration**: In a standard Cartesian coordinate system (where Y increases upwards), `S > 0` typically means COUNTERCLOCKWISE, and `S < 0` means CLOCKWISE. However, in many computer graphics contexts (and often in CodinGame problems), the Y-axis might increase downwards.

2.  **Determining the Rule from Examples**: Let's test this formula with the provided examples to establish the correct mapping between the sign of `S` and the desired output ("CLOCKWISE" or "COUNTERCLOCKWISE").

    *   **Example 1**: P1(6,5), P2(11,5), P3(11,2), P4(3,2)
        *   (6\*5 - 11\*5) = 30 - 55 = -25
        *   (11\*2 - 11\*5) = 22 - 55 = -33
        *   (11\*2 - 3\*2) = 22 - 6 = 16
        *   (3\*5 - 6\*2) = 15 - 12 = 3
        *   `S = -25 - 33 + 16 + 3 = -39`
        The output for this example is `CLOCKWISE`. So, `S < 0` maps to `CLOCKWISE`.

    *   **Example 2**: P1(6,5), P2(11,5), P3(11,2), P4(16,7)
        *   (6\*5 - 11\*5) = 30 - 55 = -25
        *   (11\*2 - 11\*5) = 22 - 55 = -33
        *   (11\*7 - 16\*2) = 77 - 32 = 45
        *   (16\*5 - 6\*7) = 80 - 42 = 38
        *   `S = -25 - 33 + 45 + 38 = 25`
        The output for this example is `COUNTERCLOCKWISE`. So, `S > 0` maps to `COUNTERCLOCKWISE`.

    From these examples, we deduce the rule:
    *   If `S < 0`, print `CLOCKWISE`.
    *   If `S > 0`, print `COUNTERCLOCKWISE`.

    (A sum of `S = 0` would imply a degenerate polygon, e.g., all points are collinear, but the constraints `N >= 4` usually imply a non-degenerate polygon in such problems.)

### Algorithm:

1.  Read the number of points, `N`.
2.  Create an array to store the points.
3.  Loop `N` times to read each point's `X` and `Y` coordinates and add it to the array.
4.  Initialize a variable `signedAreaSum` to `0`.
5.  Loop from `i = 0` to `N - 1`:
    *   Get the current point `P_i`.
    *   Get the next point `P_{i+1}`. If `i` is `N-1`, the next point is `P_0` (handle this with `(i + 1) % N`).
    *   Add `(P_i.x * P_{i+1}.y - P_{i+1}.x * P_i.y)` to `signedAreaSum`.
6.  After the loop, check the value of `signedAreaSum`:
    *   If `signedAreaSum < 0`, print `CLOCKWISE`.
    *   Else (if `signedAreaSum > 0`), print `COUNTERCLOCKWISE`.

## Code