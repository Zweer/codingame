/**
 * Auto-generated code below aims at helping you parse the standard input
 * according to the problem statement.
 **/

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * Handles negative inputs by taking their absolute values.
 * GCD(a, 0) = |a|.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The GCD of a and b.
 */
function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Read the number of vertices
const N: number = parseInt(readline());

// Store the vertices as an array of objects { x, y }
const vertices: { x: number, y: number }[] = [];
for (let i = 0; i < N; i++) {
    const inputs: string[] = readline().split(' ');
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
    vertices.push({ x, y });
}

// Calculate the double of the polygon's area (2A) using the Shoelace Formula.
// The Shoelace Formula for area A is 0.5 * sum((x_i * y_{i+1}) - (y_i * x_{i+1}))
// We calculate 2A to avoid floating point issues until the very end.
let doubleArea: number = 0;
for (let i = 0; i < N; i++) {
    const p1 = vertices[i];
    // Use modulo N to wrap around for the last vertex connecting to the first.
    const p2 = vertices[(i + 1) % N];
    doubleArea += (p1.x * p2.y - p1.y * p2.x);
}
// The absolute value ensures a positive area, regardless of vertex winding order (clockwise/counter-clockwise).
doubleArea = Math.abs(doubleArea);

// Calculate the number of integer points on the boundary (B) of the polygon.
// For each segment (p1, p2), the number of integer points on it (including p1 but not p2, for sum) is gcd(|x2-x1|, |y2-y1|).
// Summing these for all segments gives the total number of unique integer points on the boundary.
let boundaryPoints: number = 0;
for (let i = 0; i < N; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % N]; // Wrap around for the last vertex to the first.
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    boundaryPoints += gcd(dx, dy);
}

// Apply Pick's Theorem to find the number of interior integer points (I).
// Pick's Theorem: A = I + B/2 - 1
// Where A is the area, I is the number of interior integer points, and B is the number of boundary integer points.
// Rearranging for I: I = A - B/2 + 1
// Substituting A with doubleArea / 2:
// I = (doubleArea / 2) - (boundaryPoints / 2) + 1
// All values in Pick's theorem will result in an integer value for I when coordinates are integers.
const interiorPoints: number = (doubleArea / 2) - (boundaryPoints / 2) + 1;

// Output the result
console.log(interiorPoints);