The problem asks us to count the number of visible buildings from the center of an `n x n` city grid. The city center itself does not have a building. Buildings are located at the center of every other cell. The key rule for visibility is that buildings in the same direction block each other, meaning only the closest building in a given direction is visible. Buildings are described as "circular and very very small width-wise," implying they behave like points, and visibility is determined by the line of sight.

**Problem Analysis and Mathematical Formulation:**

1.  **Coordinate System:**
    Let the city grid cells be represented by coordinates `(x, y)` where `0 <= x, y < n`.
    Since `n` is an odd number, the exact center cell is at `( (n-1)/2, (n-1)/2 )`. Let `center_x = (n-1)/2` and `center_y = (n-1)/2`.
    We are observing from `(center_x, center_y)`.
    A building is located at `(x, y)`. Its relative position from the center is `(dx, dy) = (x - center_x, y - center_y)`.
    The possible values for `dx` and `dy` range from `0 - (n-1)/2` to `(n-1) - (n-1)/2`. This means `dx, dy` are integers from `-(n-1)/2` to `(n-1)/2`.
    Let `M = (n-1)/2`. So `dx, dy` range from `-M` to `M`.

2.  **Visibility Condition:**
    A building at `(dx, dy)` (relative to the center) is visible if and only if `gcd(abs(dx), abs(dy)) == 1`.
    *   If `gcd(abs(dx), abs(dy)) = k > 1`, then `dx = k * dx'` and `dy = k * dy'`. This implies there's another building at `(dx', dy')` which is in the same direction but closer to the center, thus blocking the view to `(dx, dy)`.
    *   If `gcd(abs(dx), abs(dy)) = 1`, then `(dx, dy)` represents the shortest non-zero integer vector in that direction, meaning no other building blocks it.

3.  **Excluding the Center:**
    The center `(0, 0)` itself doesn't have a building, so `(dx, dy) = (0, 0)` must be excluded from the count.

4.  **Counting Visible Buildings:**
    We need to count pairs `(dx, dy)` such that:
    *   `-M <= dx <= M`
    *   `-M <= dy <= M`
    *   `(dx, dy) != (0, 0)`
    *   `gcd(abs(dx), abs(dy)) == 1`

    Let's break this down into cases:

    *   **Buildings on Axes (`dx = 0` or `dy = 0`):**
        *   If `dx = 0`: We need `gcd(0, abs(dy)) == 1`. This means `abs(dy) == 1`. So `(0, 1)` and `(0, -1)` are visible.
        *   If `dy = 0`: We need `gcd(abs(dx), 0) == 1`. This means `abs(dx) == 1`. So `(1, 0)` and `(-1, 0)` are visible.
        *   In total, there are **4** visible buildings on the axes (cardinal directions).

    *   **Buildings in Quadrants (`dx != 0` and `dy != 0`):**
        Due to symmetry, we can count the visible buildings in one quadrant (e.g., `dx > 0, dy > 0`) and multiply by 4.
        For `dx > 0, dy > 0`, we need to count pairs `(dx, dy)` such that `1 <= dx <= M`, `1 <= dy <= M`, and `gcd(dx, dy) == 1`.
        Let `f(M)` be this count.

        The problem of counting coprime pairs `(x, y)` where `1 <= x <= N` and `1 <= y <= N` is a known result in number theory, given by the formula:
        `f(N) = Sum_{d=1 to N} mu(d) * floor(N/d)^2`
        where `mu(d)` is the **Mobius function**:
        *   `mu(1) = 1`
        *   `mu(n) = 0` if `n` has a squared prime factor (e.g., `mu(4)=0, mu(12)=0`).
        *   `mu(n) = (-1)^k` if `n` is a product of `k` distinct prime factors (e.g., `mu(2)=-1, mu(6)=1`).

5.  **Algorithm for `f(M)`:**
    To calculate `f(M)` efficiently for `M` up to `(10^7 - 1)/2` (approx `5 * 10^6`), we need to precompute `mu(d)` for all `d` from `1` to `M` using a **linear sieve** algorithm (similar to a Sieve of Eratosthenes).
    The linear sieve calculates `mu` and `lp` (least prime factor) for all numbers up to `M` in `O(M)` time.
    After `mu` values are precomputed, calculating `f(M)` involves a single loop from `d=1` to `M`, which also takes `O(M)` time.
    The total time complexity will be `O(M)`, and space complexity `O(M)`.

**Example `n = 7`:**
*   `M = (7-1)/2 = 3`.
*   **Axes:** 4 visible buildings.
*   **Quadrants (`f(3)`):** We need `(dx, dy)` pairs where `1 <= dx, dy <= 3` and `gcd(dx, dy) == 1`.
    *   `mu` values needed up to 3: `mu[1]=1, mu[2]=-1, mu[3]=-1`.
    *   `f(3) = mu[1]*floor(3/1)^2 + mu[2]*floor(3/2)^2 + mu[3]*floor(3/3)^2`
    *   `f(3) = 1 * 3^2 + (-1) * 1^2 + (-1) * 1^2`
    *   `f(3) = 9 - 1 - 1 = 7`.
    *   This matches our manual count for `M=3`: `(1,1), (1,2), (1,3), (2,1), (2,3), (3,1), (3,2)`.
*   **Total:** `4 (axes) + 4 * f(3) (quadrants) = 4 + 4 * 7 = 4 + 28 = 32`. This matches the example.

**Example `n = 3`:**
*   `M = (3-1)/2 = 1`.
*   **Axes:** 4 visible buildings.
*   **Quadrants (`f(1)`):**
    *   `f(1) = mu[1]*floor(1/1)^2 = 1 * 1^2 = 1`.
    *   This matches `(1,1)` as the only pair for `M=1`.
*   **Total:** `4 (axes) + 4 * f(1) (quadrants) = 4 + 4 * 1 = 8`. This matches the example.

**TypeScript Implementation Details:**

*   Use `parseInt(readline())` to read the input `n`.
*   Calculate `M = (n - 1) / 2`.
*   Initialize `mu` and `lp` arrays of size `M + 1`.
*   Implement the linear sieve for `mu` up to `M`.
*   Compute `f_M` using the Mobius inversion formula.
*   Return `4 + 4 * f_M`.