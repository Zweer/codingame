/**
 * Represents a point in 2D space.
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Represents a 2D vector.
 */
interface Vector {
    x: number;
    y: number;
}

/**
 * Creates a vector from point p1 to p2.
 * @param p1 The starting point.
 * @param p2 The ending point.
 * @returns A vector representing (p2.x - p1.x, p2.y - p1.y).
 */
function createVector(p1: Point, p2: Point): Vector {
    return { x: p2.x - p1.x, y: p2.y - p1.y };
}

/**
 * Calculates the dot product of two 2D vectors.
 * If the dot product is 0, the vectors are perpendicular.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The dot product (v1.x * v2.x + v1.y * v2.y).
 */
function dotProduct(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculates the 2D cross product (or Z-component of 3D cross product) of two vectors.
 * For 2D vectors v1(x1, y1) and v2(x2, y2), this is x1*y2 - x2*y1.
 * If the result is 0, the vectors are parallel.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The cross product value.
 */
function crossProduct(v1: Vector, v2: Vector): number {
    return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Calculates the squared length (magnitude) of a vector.
 * Using squared length avoids floating-point issues with `Math.sqrt`.
 * @param v The vector.
 * @returns The squared length (v.x^2 + v.y^2).
 */
function vectorLengthSq(v: Vector): number {
    return v.x * v.x + v.y * v.y;
}

/**
 * Checks if two vectors are parallel.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns True if the vectors are parallel (cross product is 0), false otherwise.
 */
function areParallel(v1: Vector, v2: Vector): boolean {
    return crossProduct(v1, v2) === 0;
}

/**
 * Checks if two vectors are perpendicular.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns True if the vectors are perpendicular (dot product is 0), false otherwise.
 */
function arePerpendicular(v1: Vector, v2: Vector): boolean {
    return dotProduct(v1, v2) === 0;
}

/**
 * Determines the nature of a quadrilateral given its four vertices in order.
 * @param name The name of the quadrilateral (e.g., "ABCD").
 * @param pA Vertex A.
 * @param pB Vertex B.
 * @param pC Vertex C.
 * @param pD Vertex D.
 * @returns A string describing the quadrilateral's nature.
 */
function getQuadrilateralNature(name: string, pA: Point, pB: Point, pC: Point, pD: Point): string {
    // Create vectors representing the sides of the quadrilateral in order
    const vecAB = createVector(pA, pB);
    const vecBC = createVector(pB, pC);
    const vecCD = createVector(pC, pD);
    const vecDA = createVector(pD, pA);

    // Calculate squared lengths of sides
    const lenSqAB = vectorLengthSq(vecAB);
    const lenSqBC = vectorLengthSq(vecBC);
    const lenSqCD = vectorLengthSq(vecCD);
    const lenSqDA = vectorLengthSq(vecDA);

    // Check properties based on definitions
    // A parallelogram has opposite sides parallel.
    // Note: vecCD (from C to D) is opposite to vecAB (from A to B).
    // Note: vecDA (from D to A) is opposite to vecBC (from B to C).
    const isParallelogram = areParallel(vecAB, vecCD) && areParallel(vecBC, vecDA);

    // A rhombus has all four sides equal in length.
    const isRhombus = (lenSqAB === lenSqBC && lenSqBC === lenSqCD && lenSqCD === lenSqDA);

    // A rectangle has all four angles as right angles.
    // This means adjacent sides are perpendicular.
    const isRectangle = arePerpendicular(vecAB, vecBC) &&
                        arePerpendicular(vecBC, vecCD) &&
                        arePerpendicular(vecCD, vecDA) &&
                        arePerpendicular(vecDA, vecAB);

    // Classify based on hierarchy (most specific to least specific)
    if (isRectangle && isRhombus) {
        return `${name} is a square.`;
    } else if (isRectangle) {
        return `${name} is a rectangle.`;
    } else if (isRhombus) {
        return `${name} is a rhombus.`;
    } else if (isParallelogram) {
        return `${name} is a parallelogram.`;
    } else {
        return `${name} is a quadrilateral.`;
    }
}

// Read the number of quadrilaterals from input
const n: number = parseInt(readline());

// Process each quadrilateral
for (let i = 0; i < n; i++) {
    const inputs = readline().split(' ');

    // Parse vertex names and coordinates from the input line
    const nameA = inputs[0];
    const pA: Point = { x: parseInt(inputs[1]), y: parseInt(inputs[2]) };

    const nameB = inputs[3];
    const pB: Point = { x: parseInt(inputs[4]), y: parseInt(inputs[5]) };

    const nameC = inputs[6];
    const pC: Point = { x: parseInt(inputs[7]), y: parseInt(inputs[8]) };

    const nameD = inputs[9];
    const pD: Point = { x: parseInt(inputs[10]), y: parseInt(inputs[11]) };

    // Combine individual vertex names to form the quadrilateral's full name
    const quadName = nameA + nameB + nameC + nameD;

    // Determine and print the nature of the quadrilateral
    print(getQuadrilateralNature(quadName, pA, pB, pC, pD));
}