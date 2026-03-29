// Define Point type for clarity
type Point = { x: number; y: number; };

// Epsilon for floating point comparisons to handle precision issues
const EPSILON = 1e-9;

/**
 * Calculates the 2D cross product (a-o) x (b-o).
 * The sign indicates the turn direction:
 *  - Positive: (o, a, b) form a counter-clockwise turn.
 *  - Negative: (o, a, b) form a clockwise turn.
 *  - Zero: (o, a, b) are collinear.
 */
function crossProduct(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Orders the vertices of a convex polygon in counter-clockwise (CCW) order.
 * This is crucial for algorithms like Sutherland-Hodgman and the Shoelace formula.
 * It uses a modified Graham Scan approach:
 * 1. Finds the lowest-y, then lowest-x point (p0).
 * 2. Sorts all other points by their polar angle relative to p0.
 * 3. Removes redundant collinear points that lie between other vertices on an edge.
 */
function orderPolygonVertices(vertices: Point[]): Point[] {
    if (vertices.length < 3) {
        // A polygon needs at least 3 vertices. Degenerate case.
        return [];
    }

    // Step 1: Find the pivot point (p0) - lowest y, then lowest x.
    let p0 = vertices[0];
    for (let i = 1; i < vertices.length; i++) {
        if (vertices[i].y < p0.y || (vertices[i].y === p0.y && vertices[i].x < p0.x)) {
            p0 = vertices[i];
        }
    }

    // Step 2: Sort points by polar angle with respect to p0.
    // Points with smaller polar angle come first. If angles are equal (collinear),
    // the point closer to p0 comes first.
    const sorted = [...vertices].sort((p1, p2) => {
        if (p1 === p0) return -1; // p0 should always be the first element
        if (p2 === p0) return 1;

        const cp = crossProduct(p0, p1, p2);
        if (Math.abs(cp) < EPSILON) { // Points p0, p1, p2 are collinear
            // Sort by distance from p0 if collinear
            const dist1 = (p1.x - p0.x)**2 + (p1.y - p0.y)**2;
            const dist2 = (p2.x - p0.x)**2 + (p2.y - p0.y)**2;
            return dist1 - dist2;
        }
        // For CCW order, we want positive cross product for a left turn.
        // Sorting in ascending order of angle means smaller angle first.
        // If cp > 0, p2 is CCW from p1 relative to p0, so p1 should come before p2.
        // If cp < 0, p2 is CW from p1 relative to p0, so p2 should come before p1.
        // Thus, -cp achieves this (smaller angle means larger -cp for negative, smaller for positive).
        return -cp;
    });

    // Step 3: Remove redundant collinear points.
    // If P1, P2, P3 are collinear and P2 is between P1 and P3, P2 is redundant.
    const result: Point[] = [sorted[0]]; // Start with p0
    for (let i = 1; i < sorted.length; i++) {
        // While there are at least two points in result and the last three points
        // (second-to-last in result, last in result, current sorted point) are collinear
        while (result.length >= 2 && Math.abs(crossProduct(result[result.length - 2], result[result.length - 1], sorted[i])) < EPSILON) {
            result.pop(); // Remove the middle point (last in result)
        }
        result.push(sorted[i]);
    }
    return result;
}

/**
 * Calculates the intersection point of two line segments (p1, p2) and (p3, p4).
 * Returns the intersection point if it lies on both segments, null otherwise.
 * This is a standard line-segment intersection formula, adapted for floating point robustness.
 */
function getSegmentIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
    const s1x = p2.x - p1.x;
    const s1y = p2.y - p1.y;
    const s2x = p4.x - p3.x;
    const s2y = p4.y - p3.y;

    const denom = (-s2x * s1y + s1x * s2y); // Denominator (cross product of direction vectors)

    // If denominator is zero, lines are parallel or collinear. No unique intersection.
    if (Math.abs(denom) < EPSILON) {
        return null;
    }

    // Parameters s and t represent where the intersection point lies on each line.
    // Intersection point is p1 + t*(p2-p1) and p3 + s*(p4-p3)
    const s = (-s1y * (p1.x - p3.x) + s1x * (p1.y - p3.y)) / denom;
    const t = (s2x * (p1.y - p3.y) - s2y * (p1.x - p3.x)) / denom;

    // If s and t are both between 0 and 1 (inclusive), the intersection lies on both segments.
    // Use EPSILON for robustness against floating point errors at boundaries.
    if (s >= -EPSILON && s <= 1 + EPSILON && t >= -EPSILON && t <= 1 + EPSILON) {
        return {
            x: p1.x + (t * s1x),
            y: p1.y + (t * s1y)
        };
    }

    return null; // Intersection point is outside one or both segments
}

/**
 * Checks if a point `p` is "inside" the half-plane defined by the directed edge `e1` to `e2`.
 * For a counter-clockwise ordered polygon, "inside" means to the left of the edge or on the edge itself.
 */
function isInside(p: Point, e1: Point, e2: Point): boolean {
    // A point is "inside" if the cross product of (e2-e1) and (p-e1) is non-negative.
    // This implies p is to the left of or on the directed line from e1 to e2.
    // Use EPSILON for robustness.
    return crossProduct(e1, e2, p) >= -EPSILON;
}

/**
 * Clips a subject polygon against a clip polygon using the Sutherland-Hodgman algorithm.
 * Both polygons must be convex and ordered counter-clockwise.
 * The output is the polygon representing their intersection.
 */
function clipPolygon(subjectPolygon: Point[], clipPolygon: Point[]): Point[] {
    let outputList = [...subjectPolygon]; // Start with the subject polygon's vertices

    // Iterate over each edge of the clip polygon
    for (let i = 0; i < clipPolygon.length; i++) {
        const clipEdgeP1 = clipPolygon[i];
        const clipEdgeP2 = clipPolygon[(i + 1) % clipPolygon.length]; // Next vertex for the clip edge

        let inputList = outputList; // The result from the previous clip becomes the input for the current
        outputList = []; // Reset output list for the current clip edge

        // If the polygon became empty in a previous clipping step, no further clipping is needed.
        if (inputList.length === 0) {
            break;
        }

        // Iterate over each edge of the current subject polygon (inputList)
        for (let j = 0; j < inputList.length; j++) {
            const subjectEdgeP1 = inputList[j];
            const subjectEdgeP2 = inputList[(j + 1) % inputList.length];

            const s1Inside = isInside(subjectEdgeP1, clipEdgeP1, clipEdgeP2);
            const s2Inside = isInside(subjectEdgeP2, clipEdgeP1, clipEdgeP2);

            if (s2Inside) {
                // Case 1: S2 is inside (or on the boundary of) the current clip half-plane.
                if (!s1Inside) {
                    // S1 is outside, S2 is inside: Add the intersection point.
                    const intersect = getSegmentIntersection(subjectEdgeP1, subjectEdgeP2, clipEdgeP1, clipEdgeP2);
                    if (intersect) outputList.push(intersect);
                }
                // S1 inside, S2 inside: Add S2.
                // S1 outside, S2 inside: Add S2 (after adding intersection point).
                outputList.push(subjectEdgeP2);
            } else {
                // Case 2: S2 is outside the current clip half-plane.
                if (s1Inside) {
                    // S1 is inside, S2 is outside: Add the intersection point.
                    const intersect = getSegmentIntersection(subjectEdgeP1, subjectEdgeP2, clipEdgeP1, clipEdgeP2);
                    if (intersect) outputList.push(intersect);
                }
                // S1 outside, S2 outside: Add nothing.
            }
        }
    }
    return outputList;
}

/**
 * Calculates the area of a polygon using the Shoelace formula.
 * The vertices must be ordered (e.g., counter-clockwise or clockwise).
 */
function polygonArea(vertices: Point[]): number {
    let area = 0;
    const n = vertices.length;

    if (n < 3) {
        // A polygon must have at least 3 vertices; otherwise, its area is 0.
        return 0;
    }

    // Sum (x_i * y_{i+1} - x_{i+1} * y_i) for all vertices
    for (let i = 0; i < n; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % n]; // Wrap around to the first vertex for the last edge
        area += (p1.x * p2.y - p1.y * p2.x);
    }
    // The formula gives twice the signed area. Take absolute value for non-signed area.
    return Math.abs(area / 2.0);
}

// --- Main execution logic for CodinGame ---

// Declare readline and print functions as they are provided by the CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

function solve() {
    // Read polygon 1 vertices
    const n = parseInt(readline());
    const polygon1Vertices: Point[] = [];
    for (let i = 0; i < n; i++) {
        const [x, y] = readline().split(' ').map(Number);
        polygon1Vertices.push({ x, y });
    }

    // Read polygon 2 vertices
    const m = parseInt(readline());
    const polygon2Vertices: Point[] = [];
    for (let i = 0; i < m; i++) {
        const [x, y] = readline().split(' ').map(Number);
        polygon2Vertices.push({ x, y });
    }

    // 1. Order the vertices of both polygons to ensure counter-clockwise winding.
    // This is a prerequisite for Sutherland-Hodgman and ensures area calculation is correct.
    const orderedP1 = orderPolygonVertices(polygon1Vertices);
    const orderedP2 = orderPolygonVertices(polygon2Vertices);

    // If either input polygon is degenerate (less than 3 effective vertices after ordering),
    // their intersection area must be zero.
    if (orderedP1.length < 3 || orderedP2.length < 3) {
        print(0);
        return;
    }

    // 2. Clip polygon 1 by polygon 2 using the Sutherland-Hodgman algorithm.
    // The result `intersectionPolygon` will be the polygon representing the overlap area.
    const intersectionPolygon = clipPolygon(orderedP1, orderedP2);

    // 3. Calculate the area of the resulting intersection polygon.
    let area = polygonArea(intersectionPolygon);

    // 4. Round up the area to the nearest integer and print the result.
    print(Math.ceil(area));
}

// Execute the solver function
solve();