// CodinGame environment specific declarations
declare function readline(): string;
declare function print(message: any): void;

/**
 * Represents a 2D point with integer x and y coordinates.
 */
class Point {
    constructor(public x: number, public y: number) {}
}

/**
 * Main function to solve the Drawing Polygons puzzle.
 */
function solve() {
    // Read the number of points (N).
    const N: number = parseInt(readline());

    // Create an array to store the polygon's vertices.
    const points: Point[] = [];
    for (let i = 0; i < N; i++) {
        // Read each line for X and Y coordinates.
        const inputs: number[] = readline().split(' ').map(Number);
        const x: number = inputs[0];
        const y: number = inputs[1];
        points.push(new Point(x, y));
    }

    // Calculate the sum of the signed areas for consecutive segments.
    // This value, effectively 2 times the signed area of the polygon,
    // determines its orientation.
    let signedAreaSum: number = 0;

    for (let i = 0; i < N; i++) {
        const currentPoint = points[i];
        // The next point in the sequence. For the last point (index N-1),
        // the next point wraps around to the first point (index 0).
        const nextPoint = points[(i + 1) % N];

        // Add the cross product component (x_i * y_{i+1} - x_{i+1} * y_i) to the sum.
        signedAreaSum += (currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y);
    }

    // Determine the polygon's orientation based on the sign of the sum.
    // As derived from the problem's examples:
    // A negative sum indicates a CLOCKWISE direction.
    // A positive sum indicates a COUNTERCLOCKWISE direction.
    if (signedAreaSum < 0) {
        print('CLOCKWISE');
    } else { // signedAreaSum > 0 (problem constraints imply non-degenerate polygons)
        print('COUNTERCLOCKWISE');
    }
}

// Execute the solve function to run the solution.
solve();