// Define a type for a point to include its coordinates and original index
type Point = {
    x: number;
    y: number;
    id: number; // Original index for tie-breaking
};

/**
 * Calculates the Euclidean distance between two points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The Euclidean distance.
 */
function euclideanDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Main function to solve the Travelling Salesman Problem (greedy approximation).
 */
function solve() {
    // Read the number of points
    const N: number = parseInt(readline());

    // Store all points with their original indices
    const points: Point[] = [];
    for (let i = 0; i < N; i++) {
        const inputs = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]);
        points.push({ x, y, id: i });
    }

    let totalDistance: number = 0;
    // Keep track of visited points using a boolean array
    const visited: boolean[] = new Array(N).fill(false);

    // Start at the first point (index 0)
    let currentPointIndex: number = 0;
    const startPoint: Point = points[0];

    // Mark the starting point as visited
    visited[currentPointIndex] = true;

    // Iterate N-1 times to visit all other points
    for (let i = 0; i < N - 1; i++) {
        const currentPoint = points[currentPointIndex];
        let minDistance: number = Infinity;
        let nextPointIndex: number = -1;

        // Find the nearest unvisited point
        for (let j = 0; j < N; j++) {
            if (!visited[j]) { // Only consider unvisited points
                const candidatePoint = points[j];
                const dist = euclideanDistance(currentPoint, candidatePoint);

                // If a closer point is found, or if points are equidistant,
                // and the current candidate point appeared earlier in the input list
                // (which is handled naturally by iterating j from 0 to N-1 and
                // only updating if dist < minDistance, meaning the first
                // equidistant point found will be kept).
                if (dist < minDistance) {
                    minDistance = dist;
                    nextPointIndex = j;
                }
            }
        }

        // Add the distance to the total
        totalDistance += minDistance;

        // Move to the newly chosen point
        currentPointIndex = nextPointIndex;
        visited[currentPointIndex] = true;
    }

    // After visiting all points, return to the origin city (the first point)
    totalDistance += euclideanDistance(points[currentPointIndex], startPoint);

    // Output the total distance, rounded to the nearest integer
    console.log(Math.round(totalDistance));
}

// Call the solve function to execute the logic
solve();