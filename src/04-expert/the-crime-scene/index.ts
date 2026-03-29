// Helper function to calculate the Euclidean distance between two points.
function dist(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Helper function to determine the orientation of three points (p, q, r).
// It computes the 2D cross product of vectors pq and pr.
// Returns:
//   > 0 if (p, q, r) is a counter-clockwise turn (left turn)
//   < 0 if (p, q, r) is a clockwise turn (right turn)
//   = 0 if (p, q, r) are collinear
function crossProduct(p: Point, q: Point, r: Point): number {
    return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

// Interface to represent a 2D point.
interface Point {
    x: number;
    y: number;
}

/**
 * Computes the convex hull of a set of points using the Monotone Chain (Andrew's Algorithm).
 * The returned points are ordered counter-clockwise.
 *
 * @param points An array of Point objects.
 * @returns An array of Point objects representing the vertices of the convex hull.
 */
function convexHull(points: Point[]): Point[] {
    const n = points.length;

    // Handle edge cases for 0, 1, or 2 points.
    // In these cases, all points are on the hull.
    if (n <= 2) {
        return points.slice(); // Return a shallow copy
    }

    // 1. Sort the points lexicographically (by x-coordinate, then by y-coordinate for ties).
    // This is a crucial first step for the Monotone Chain algorithm.
    points.sort((a, b) => {
        if (a.x === b.x) {
            return a.y - b.y;
        }
        return a.x - b.x;
    });

    const upperHull: Point[] = [];
    // 2. Build the upper hull.
    // Iterate through the sorted points from left to right.
    for (let i = 0; i < n; i++) {
        // While there are at least 2 points in the upperHull stack
        // AND adding the current point `points[i]` results in a non-counter-clockwise turn
        // (i.e., a clockwise turn or collinear with the last two points),
        // pop the last point from the stack. This ensures the stack always forms a
        // "left turn" path (counter-clockwise) and removes "inward" points.
        while (upperHull.length >= 2 && crossProduct(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], points[i]) <= 0) {
            upperHull.pop();
        }
        upperHull.push(points[i]);
    }

    const lowerHull: Point[] = [];
    // 3. Build the lower hull.
    // Iterate through the sorted points from right to left (reverse order).
    // The logic for popping is the same: maintain a counter-clockwise path.
    for (let i = n - 1; i >= 0; i--) {
        while (lowerHull.length >= 2 && crossProduct(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], points[i]) <= 0) {
            lowerHull.pop();
        }
        lowerHull.push(points[i]);
    }

    // 4. Combine the upper and lower hulls to form the complete convex hull.
    // The upper hull goes from the leftmost point to the rightmost point.
    // The lower hull goes from the rightmost point to the leftmost point.
    // We want a single list of points in counter-clockwise order around the perimeter.
    // Start by taking all points from the upper hull.
    const hull: Point[] = upperHull.slice();

    // Add points from the lower hull.
    // We skip the first point of lowerHull (which is the rightmost, already in upperHull)
    // and the last point of lowerHull (which is the leftmost, already in upperHull).
    // This loop adds the intermediate points of the lower hull in the correct CCW order.
    for (let i = lowerHull.length - 2; i >= 1; i--) {
        hull.push(lowerHull[i]);
    }

    return hull;
}

// Main function to read input, compute, and print the result.
function main() {
    // Read the number of clues (N).
    const N: number = parseInt(readline());

    const points: Point[] = [];
    // Read N lines of clue coordinates.
    for (let i = 0; i < N; i++) {
        const inputs: string[] = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]);
        points.push({ x, y });
    }

    let totalPerimeter: number = 0;

    // Calculate the convex hull of the clue points.
    const hullPoints = convexHull(points);

    // Calculate the perimeter of the convex hull.
    // If there's 0 or 1 point, the perimeter of the hull itself is 0.
    // For 2 points, it will be twice the distance between them (going back and forth).
    if (hullPoints.length > 1) {
        for (let i = 0; i < hullPoints.length; i++) {
            const p1 = hullPoints[i];
            const p2 = hullPoints[(i + 1) % hullPoints.length]; // Connect last point to first point
            totalPerimeter += dist(p1, p2);
        }
    }

    // Add the perimeter required for the 3-foot buffer.
    // This is equivalent to the circumference of a circle with radius 3.
    totalPerimeter += 2 * Math.PI * 3; // Which is 6 * PI

    // Calculate the number of 5-foot rolls needed.
    // Use Math.ceil to round up, as whole rolls must be purchased.
    const rolls = Math.ceil(totalPerimeter / 5);

    // Print the final result.
    console.log(rolls);
}

// Call the main function to start execution.
// In CodinGame environment, `readline()` and `console.log()` are globally available.
main();