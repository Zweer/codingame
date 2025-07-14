// Define a Point interface for better readability and type safety
interface Point {
    x: number;
    y: number;
}

/**
 * Calculates the 2D cross product (or twice the signed area) of vectors V1V2 and V1P.
 * The sign indicates the orientation of point P relative to the directed line V1V2.
 * - Positive: P is to the left of V1V2.
 * - Negative: P is to the right of V1V2.
 * - Zero: P is collinear with V1 and V2.
 *
 * @param V1 The start point of the reference vector (V1V2).
 * @param V2 The end point of the reference vector (V1V2).
 * @param P The point to check its orientation relative to V1V2.
 * @returns A number representing the signed cross product value.
 */
function crossProduct(V1: Point, V2: Point, P: Point): number {
    // Vector V1V2: (V2.x - V1.x, V2.y - V1.y)
    // Vector V1P: (P.x - V1.x, P.y - V1.y)
    // 2D Cross Product Formula: (Ax * By) - (Ay * Bx)
    return (V2.x - V1.x) * (P.y - V1.y) - (V2.y - V1.y) * (P.x - V1.x);
}

// Read N, the number of corners of the polygon
const N: number = parseInt(readline());

// Read the N polygon corners and store them in an array
const polygonCorners: Point[] = [];
for (let i = 0; i < N; i++) {
    const lineParts: string[] = readline().split(' ');
    polygonCorners.push({
        x: parseInt(lineParts[0]),
        y: parseInt(lineParts[1])
    });
}

// Read M, the number of shots
const M: number = parseInt(readline());

// Process each shot
for (let i = 0; i < M; i++) {
    const lineParts: string[] = readline().split(' ');
    const shot: Point = {
        x: parseInt(lineParts[0]),
        y: parseInt(lineParts[1])
    };

    let isHit: boolean = true; // Assume the shot is a hit until proven otherwise

    // Check the shot against each edge of the polygon.
    // For a convex polygon with vertices ordered counter-clockwise (CCW),
    // a point is inside or on the boundary if it lies to the left of or is collinear
    // with respect to *all* directed edges.
    for (let j = 0; j < N; j++) {
        // Define the current edge using two consecutive polygon corners
        const V1 = polygonCorners[j];
        // The next vertex, wrapping around to the first vertex for the last edge
        const V2 = polygonCorners[(j + 1) % N]; 

        // Calculate the cross product for the current edge and the shot point
        const cp = crossProduct(V1, V2, shot);

        // If the cross product is negative, the shot point is to the right of the directed edge.
        // This means it's outside the polygon for a CCW-ordered convex polygon.
        if (cp < 0) {
            isHit = false; // Mark as a miss
            break;         // No need to check further edges, it's definitely a miss
        }
    }

    // Output the result for the current shot
    if (isHit) {
        console.log("hit");
    } else {
        console.log("miss");
    }
}