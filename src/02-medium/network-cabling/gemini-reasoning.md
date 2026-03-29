The problem asks us to calculate the minimum total length of optical fiber cable required to connect all buildings in a business park. We are given `N` buildings, each with `(x, y)` coordinates.

The cabling structure has two components:
1.  **A main cable:** This cable runs horizontally (from West to East) across the park. Its length is determined by the most westerly and most easterly buildings. Specifically, it spans from `min(x)` to `max(x)` among all buildings. Its length is therefore `maxX - minX`.
2.  **Dedicated cables:** Each building connects to the main cable via a dedicated cable. This connection must be a minimal path, meaning it runs directly North or South from the building to the main cable. If a building is at `(x_i, y_i)` and the main cable is laid at a `y`-coordinate of `y_main`, the length of its dedicated cable will be `|y_i - y_main|`.

Our goal is to minimize the total length `L = (length of main cable) + (sum of lengths of dedicated cables)`.

Let's analyze each part:

1.  **Length of the Main Cable:**
    This part is fixed once we know all `x` coordinates. It is simply the difference between the maximum `x` coordinate (`maxX`) and the minimum `x` coordinate (`minX`) among all buildings. This length is `maxX - minX`. This component is independent of the `y_main` chosen for the main cable.

2.  **Sum of Lengths of Dedicated Cables:**
    For each building `i` at `(x_i, y_i)`, its dedicated cable length is `|y_i - y_main|`. We need to choose a `y_main` such that the sum `sum(|y_i - y_main|)` for all buildings is minimized.
    This is a classic problem: the sum of absolute differences `sum(|value - K|)` is minimized when `K` is the **median** of the `value`s.
    Therefore, to minimize `sum(|y_i - y_main|)`, `y_main` should be the median of all `y` coordinates of the buildings.

    To find the median:
    *   Collect all `y` coordinates into an array.
    *   Sort the array in ascending order.
    *   If `N` (the number of buildings) is odd, the median is the element at the middle index `Math.floor(N / 2)` (or `Math.floor((N-1)/2)`).
    *   If `N` is even, any value between the two middle elements (inclusive) will minimize the sum. For simplicity, we can choose the lower of the two middle elements, at index `Math.floor((N - 1) / 2)`. This choice covers both odd and even `N` correctly for finding a median that minimizes the sum of absolute differences.

**Algorithm:**

1.  Read the number of buildings, `N`.
2.  Initialize `minX` to a very large number (e.g., `Number.MAX_SAFE_INTEGER`) and `maxX` to a very small number (e.g., `Number.MIN_SAFE_INTEGER`).
3.  Create an empty array `yCoords` to store all `y` coordinates.
4.  Loop `N` times to read each building's coordinates:
    *   Read `x` and `y`.
    *   Update `minX = Math.min(minX, x)`.
    *   Update `maxX = Math.max(maxX, x)`.
    *   Add `y` to the `yCoords` array.
5.  Calculate the `mainCableLength = maxX - minX`.
6.  Sort the `yCoords` array in ascending order.
7.  Determine `y_main`, the median `y`-coordinate. For `N` elements (0-indexed), the median can be found at `yCoords[Math.floor((N - 1) / 2)]`.
8.  Initialize `dedicatedCablesLength = 0`.
9.  Iterate through each `y_i` in the sorted `yCoords` array:
    *   Add `Math.abs(y_i - y_main)` to `dedicatedCablesLength`.
10. The total minimum length `L = mainCableLength + dedicatedCablesLength`.
11. Print `L`.

**Data Type Considerations:**
The problem states that `L` can be up to `2^63`. In JavaScript, standard `number`s are 64-bit floating-point numbers, which can represent integers exactly up to `2^53 - 1`.
*   `maxX - minX` will be at most `2^30 - (-2^30) = 2^31`, which fits easily.
*   The sum of `|y_i - y_main|`: Each `|y_i - y_main|` can be at most `2^30 - (-2^30) = 2^31`. With `N` up to `100,000`, the maximum sum would be `100,000 * 2^31 = 10^5 * 2,147,483,648 = 214,748,364,800,000`. This value is approximately `2.14 * 10^14`.
*   `Number.MAX_SAFE_INTEGER` is `9,007,199,254,740,991` (approx `9 * 10^15`).
Since `2.14 * 10^14` is less than `9 * 10^15`, a standard JavaScript `number` is sufficient to store `dedicatedCablesLength` and the final `totalLength`. `BigInt` is not necessary.