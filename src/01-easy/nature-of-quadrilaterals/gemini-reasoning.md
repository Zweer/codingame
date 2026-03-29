The puzzle requires determining the specific type of a quadrilateral given its four vertices. The classification hierarchy is important: `square`, `rectangle`, `rhombus`, `parallelogram`, and finally `quadrilateral` if none of the more specific types apply.

**Geometric Principles Used:**

1.  **Points and Vectors:** We represent vertices as `Point` objects (x, y coordinates). Sides are represented as `Vector` objects (differences in coordinates between two points).
2.  **Squared Length:** To compare side lengths without dealing with floating-point inaccuracies of square roots, we compare their squared lengths (`vector.x^2 + vector.y^2`).
3.  **Parallelism:** Two vectors are parallel if their 2D cross product (which is `v1.x * v2.y - v1.y * v2.x`) is zero.
4.  **Perpendicularity (Right Angles):** Two vectors are perpendicular if their dot product (`v1.x * v2.x + v1.y * v2.y`) is zero. This is used to check for right angles.

**Quadrilateral Classifications:**

Let the vertices be A, B, C, D in the given order.
We derive four side vectors: `vecAB` (from A to B), `vecBC` (from B to C), `vecCD` (from C to D), and `vecDA` (from D to A).

*   **Parallelogram:** Opposite sides are parallel. This means `vecAB` is parallel to `vecCD`, AND `vecBC` is parallel to `vecDA`.
*   **Rhombus:** All four sides have equal length. This means `lengthSq(vecAB) == lengthSq(vecBC) == lengthSq(vecCD) == lengthSq(vecDA)`.
*   **Rectangle:** All four internal angles are right angles. This means adjacent sides are perpendicular: `vecAB` is perpendicular to `vecBC`, `vecBC` to `vecCD`, `vecCD` to `vecDA`, and `vecDA` to `vecAB`.
*   **Square:** It is both a Rectangle AND a Rhombus.

**Solution Structure:**

1.  **Helper Data Structures:** Define `Point` and `Vector` interfaces.
2.  **Geometric Utility Functions:**
    *   `createVector(p1, p2)`: Calculates the vector from `p1` to `p2`.
    *   `dotProduct(v1, v2)`: Calculates the dot product of two vectors.
    *   `crossProduct(v1, v2)`: Calculates the 2D cross product of two vectors.
    *   `vectorLengthSq(v)`: Calculates the squared length of a vector.
    *   `areParallel(v1, v2)`: Checks if two vectors are parallel using `crossProduct`.
    *   `arePerpendicular(v1, v2)`: Checks if two vectors are perpendicular using `dotProduct`.
3.  **`getQuadrilateralNature` Function:**
    *   Takes the quadrilateral's name and its four `Point` objects as input.
    *   Calculates the four side vectors and their squared lengths.
    *   Applies the geometric checks for `isParallelogram`, `isRhombus`, and `isRectangle`.
    *   Uses an `if-else if` chain to classify the quadrilateral from most specific (`square`) to most general (`quadrilateral`). The order ensures that a square (which is also a rectangle, rhombus, and parallelogram) is correctly identified as a "square" first.
4.  **Main Loop:**
    *   Reads the number of quadrilaterals `n`.
    *   Loops `n` times:
        *   Reads each line of input, splitting it by spaces.
        *   Parses the vertex names and coordinates into `Point` objects.
        *   Constructs the full quadrilateral name (e.g., "ABCD").
        *   Calls `getQuadrilateralNature` and prints the result.

**Example Walkthrough:**

For `A -14 -3 B 5 -9 C 11 4 D -7 13`:
*   `pA=(-14,-3), pB=(5,-9), pC=(11,4), pD=(-7,13)`
*   `vecAB = (19, -6)`, `vecBC = (6, 13)`, `vecCD = (-18, 9)`, `vecDA = (-7, -16)`
*   `lenSqAB = 397`, `lenSqBC = 205`, `lenSqCD = 405`, `lenSqDA = 305`
    *   Not a rhombus (side lengths not equal).
*   `crossProduct(vecAB, vecCD) = (19*9) - (-6*-18) = 171 - 108 = 63`
    *   Since 63 != 0, `vecAB` is not parallel to `vecCD`.
    *   Therefore, it's not a parallelogram.
*   Since it's not a parallelogram, it cannot be a rectangle or a square by definition.
*   The function will correctly identify it as a `quadrilateral`.