The puzzle asks us to simulate a dart game with a unique scoring system based on geometric shapes. The target consists of a square, a circle inscribed within it, and a diamond inscribed within the circle. All shapes are centered at (0,0).

Here's a breakdown of the solution strategy:

1.  **Understand the Geometry and Scoring:**
    *   **Square:** The square has a side length `SIZE`. Its boundaries are `x = +/- SIZE/2` and `y = +/- SIZE/2`. A point `(X, Y)` is within the square if `abs(X) <= SIZE/2` and `abs(Y) <= SIZE/2`. Points awarded: 5.
    *   **Circle:** The circle is inscribed in the square, meaning its diameter is `SIZE`. Its radius `R = SIZE/2`. A point `(X, Y)` is within the circle if `X*X + Y*Y <= R*R`. Points awarded: 10 (if not in diamond).
    *   **Diamond:** The diamond is a square rotated by 45 degrees, inscribed in the circle. Its "radius" (distance from center to a corner on an axis) is also `SIZE/2`. A point `(X, Y)` is within the diamond if `abs(X) + abs(Y) <= SIZE/2`. Points awarded: 15.
    *   **Scoring Priority:** Darts landing on the edge are considered *within* the shape. Points are awarded for the *innermost* shape the dart lands in. This implies a hierarchical check: Diamond (15 pts) > Circle (10 pts) > Square (5 pts). If a dart is outside all shapes, it gets 0 points.

2.  **Input Processing:**
    *   Read `SIZE`.
    *   Read `N` (number of competitors).
    *   Store competitor names along with their initial scores (0) and their original input order. A `Map<string, { score: number, order: number }>` is suitable for this, where the key is the competitor's name. The `order` property is crucial for tie-breaking.
    *   Read `T` (number of throws).
    *   For each of the `T` throws, read the competitor's name and the `(X, Y)` coordinates.

3.  **Scoring Logic Implementation:**
    *   For each throw `(X, Y)`, implement a function `calculatePoints(x, y, size)` that determines the score:
        *   Calculate `halfSize = size / 2`. This value serves as both the half-side length for the square, the radius for the circle, and the "radius" for the diamond.
        *   Check for diamond inclusion: `if (Math.abs(x) + Math.abs(y) <= halfSize) return 15;`
        *   Check for circle inclusion: `if (x * x + y * y <= halfSize * halfSize) return 10;`
        *   Check for square inclusion: `if (Math.abs(x) <= halfSize && Math.abs(y) <= halfSize) return 5;`
        *   If none of the above, return 0.
    *   Add the calculated points to the respective competitor's score in the `players` map.

4.  **Output Generation:**
    *   Convert the `players` map into an array of objects `{ name: string, score: number, order: number }`.
    *   Sort this array:
        *   Primary sort key: `score` in descending order (highest score first).
        *   Secondary sort key (for ties): `order` in ascending order (competitors appearing earlier in the input list first).
    *   Iterate through the sorted array and print each competitor's name and score in the specified format.

This approach ensures correct scoring, proper score accumulation, and adherence to the tie-breaking rules.