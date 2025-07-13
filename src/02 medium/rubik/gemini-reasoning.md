The problem asks us to calculate the number of "visible" mini-cubes on an N x N x N Rubik's Cube. A mini-cube is considered visible if at least one of its faces is exposed on the surface of the larger cube.

Let's analyze the structure of a Rubik's Cube of size N x N x N:

1.  **Total Mini-Cubes**: An N x N x N cube is composed of N^3 individual mini-cubes.

2.  **Visible vs. Hidden Mini-Cubes**:
    *   Visible mini-cubes are those located on the outer "shell" of the cube.
    *   Hidden mini-cubes are those completely enclosed within the cube, having no faces exposed to the outside. These form a smaller cube in the very center.

3.  **Determining the Hidden Core**:
    *   If you remove the outermost layer of mini-cubes from an N x N x N cube, the remaining inner cube will have dimensions (N-2) x (N-2) x (N-2).
    *   The number of mini-cubes in this inner core is (N-2)^3. These are precisely the hidden mini-cubes.

4.  **Edge Cases for N**:
    *   **N = 1**: A 1x1x1 cube is just a single mini-cube. There are no hidden cubes. The formula (1-2)^3 = (-1)^3 = -1 doesn't make sense for a count. All 1 mini-cube is visible.
    *   **N = 2**: A 2x2x2 cube has 8 mini-cubes. All of them are corner pieces and are visible. The formula (2-2)^3 = 0^3 = 0 correctly indicates 0 hidden cubes.
    *   **N >= 3**: For N=3, the inner core is 1x1x1, so 1^3 = 1 hidden cube. For N=4, the inner core is 2x2x2, so 2^3 = 8 hidden cubes, and so on.

5.  **Unified Formula**:
    To handle all cases (N=1, N=2, and N>=3) uniformly, we can observe that the number of hidden cubes is `0` if `N-2` is less than or equal to `0`, and `(N-2)^3` otherwise. This can be expressed using `Math.max(0, N-2)`.

    The number of hidden mini-cubes is `Math.pow(Math.max(0, N - 2), 3)`.
    *   If N=1, `Math.max(0, 1-2)` = `Math.max(0, -1)` = `0`. So, `0^3 = 0` hidden cubes.
    *   If N=2, `Math.max(0, 2-2)` = `Math.max(0, 0)` = `0`. So, `0^3 = 0` hidden cubes.
    *   If N=3, `Math.max(0, 3-2)` = `Math.max(0, 1)` = `1`. So, `1^3 = 1` hidden cube.
    *   If N=4, `Math.max(0, 4-2)` = `Math.max(0, 2)` = `2`. So, `2^3 = 8` hidden cubes.

    The number of visible mini-cubes is therefore:
    `Total Mini-Cubes - Hidden Mini-Cubes`
    `N^3 - Math.pow(Math.max(0, N - 2), 3)`

This formula correctly calculates the number of visible mini-cubes for all valid inputs of N (0 < N < 100).

**Example for N=2:**
Total mini-cubes = 2^3 = 8
Hidden mini-cubes = `Math.pow(Math.max(0, 2 - 2), 3)` = `Math.pow(Math.max(0, 0), 3)` = `Math.pow(0, 3)` = 0
Visible mini-cubes = 8 - 0 = 8.