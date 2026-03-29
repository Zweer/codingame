The problem asks us to count the number of integer points strictly inside a given polygon, representing a flower bed. The polygon's vertices are given as integer coordinates, and flowers cannot be planted on the boundary.

This is a classic computational geometry problem that can be efficiently solved using **Pick's Theorem**.

Pick's Theorem states that for a simple polygon whose vertices are all integer points on a grid, its area `A` is related to the number of integer points strictly inside it `I` and the number of integer points on its boundary `B` by the formula:
`A = I + B/2 - 1`

Our goal is to find `I`, so we can rearrange the formula to:
`I = A - B/2 + 1`

To use Pick's Theorem, we need to calculate `A` (the area of the polygon) and `B` (the number of integer points on its boundary).

### 1. Calculate the Area (A) using the Shoelace Formula

The area of a polygon with vertices `(x1, y1), (x2, y2), ..., (xN, yN)` can be calculated using the Shoelace Formula:
`A = 0.5 * | (x1*y2 + x2*y3 + ... + xN*y1) - (y1*x2 + y2*x3 + ... + yN*x1) |`

To avoid floating-point arithmetic until the very end, it's common practice to calculate `2A` first:
`2A = | (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + ... + (xN*y1 - yN*x1) |`
The sum is over all edges, treating the last vertex as connected to the first. The `Math.abs()` ensures the area is positive, regardless of the order of vertices (clockwise or counter-clockwise). Since all coordinates are integers, `2A` will always be an integer.

### 2. Calculate the Number of Boundary Points (B)

For any line segment connecting two integer points `(x1, y1)` and `(x2, y2)`, the number of integer points on that segment (including both endpoints) is `gcd(|x2-x1|, |y2-y1|) + 1`.

When calculating `B` for the entire polygon, we need to sum the number of new integer points introduced by each segment. The total number of unique integer points on the boundary `B` can be found by summing `gcd(|x_{i+1}-x_i|, |y_{i+1}-y_i|)` for all segments (including the segment from the last vertex back to the first). This approach correctly counts each unique boundary point exactly once.

We will need a Greatest Common Divisor (GCD) function, which can be implemented using the Euclidean algorithm. `gcd(a, 0)` should return `|a|`.

### 3. Apply Pick's Theorem

Once `2A` and `B` are calculated, we can substitute them into the rearranged Pick's Theorem formula:
`I = (doubleArea / 2) - (boundaryPoints / 2) + 1`

The `number` type in TypeScript (which corresponds to JavaScript's `Number`) is a 64-bit floating-point number. It can precisely represent all integers up to `2^53`. Given the constraints on coordinates (`0 <= x, y <= 10000`) and the number of vertices (`N <= 100`), the maximum possible value for `2A` (which is roughly `2 * (max_coord)^2`) will be around `2 * 10^8`, and `B` will be around `N * max_coord = 100 * 10000 = 10^6`. These values, and the final `I` (which is roughly `10^8`), are well within the safe integer range for `number`. The problem states `F < 2^32`, which also fits within standard integer types.

### Example Walkthrough (from problem description):

Vertices: (2,2), (7,2), (6,5), (7,8), (6,11), (5,11), (4,8), (3,11), (1,5)

**1. Calculate 2A:**
Sum of `(x_i * y_{i+1} - y_i * x_{i+1})` for all edges:
(2*2 - 2*7) = -10
(7*5 - 2*6) = 23
(6*8 - 5*7) = 13
(7*11 - 8*6) = 29
(6*11 - 11*5) = 11
(5*8 - 11*4) = -4
(4*11 - 8*3) = 20
(3*5 - 11*1) = 4
(1*2 - 5*2) = -8
Sum = -10 + 23 + 13 + 29 + 11 - 4 + 20 + 4 - 8 = 78
`doubleArea = |78| = 78`. So, `A = 39`.

**2. Calculate B:**
Using `gcd(|dx|, |dy|)` for each edge:
(2,2)-(7,2): dx=5, dy=0. `gcd(5,0)=5`.
(7,2)-(6,5): dx=1, dy=3. `gcd(1,3)=1`.
(6,5)-(7,8): dx=1, dy=3. `gcd(1,3)=1`.
(7,8)-(6,11): dx=1, dy=3. `gcd(1,3)=1`.
(6,11)-(5,11): dx=1, dy=0. `gcd(1,0)=1`.
(5,11)-(4,8): dx=1, dy=3. `gcd(1,3)=1`.
(4,8)-(3,11): dx=1, dy=3. `gcd(1,3)=1`.
(3,11)-(1,5): dx=2, dy=6. `gcd(2,6)=2`.
(1,5)-(2,2): dx=1, dy=3. `gcd(1,3)=1`.
`boundaryPoints = 5 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 = 14`.

**3. Apply Pick's Theorem:**
`I = A - B/2 + 1`
`I = 39 - 14/2 + 1`
`I = 39 - 7 + 1`
`I = 33`

This matches the example output.