/**
 * Reads a line from standard input.
 * In CodinGame, `readline()` is a global function.
 * For local testing, you might need to mock this or provide input through `process.stdin`.
 */
declare function readline(): string;
// declare function print(message: any): void; // CodinGame's print function, console.log usually works too.

/**
 * Parses a line of input for a disk's properties.
 * @returns An object containing the x, y coordinates of the center and the radius.
 */
function parseDiskInput(): { x: number, y: number, r: number } {
    const line = readline();
    const parts = line.split(' ').map(Number);
    // Basic validation, although CodinGame inputs are usually well-formed
    if (parts.length !== 3 || parts.some(isNaN)) {
        throw new Error("Invalid input format. Expected 'x y r'.");
    }
    return { x: parts[0], y: parts[1], r: parts[2] };
}

// Read input for the two disks
const disk1 = parseDiskInput();
const disk2 = parseDiskInput();

const x1 = disk1.x;
const y1 = disk1.y;
const r1 = disk1.r;

const x2 = disk2.x;
const y2 = disk2.y;
const r2 = disk2.r;

// Calculate distance between the centers of the disks
const dx = x2 - x1;
const dy = y2 - y1;
const d = Math.sqrt(dx * dx + dy * dy);

let intersectionArea: number;

// A small epsilon value to handle floating-point inaccuracies when comparing distances
const EPSILON = 1e-9; 

// Pre-calculate sum and absolute difference of radii for cleaner conditions
const rSum = r1 + r2;
const rDiffAbs = Math.abs(r1 - r2);

// Case 1: Disks do not intersect or are externally tangent.
// This happens when the distance between centers is greater than or equal to the sum of their radii.
// According to the problem statement: "intersect in one point (tangency), then the area is 0.00".
if (d >= rSum - EPSILON) {
    intersectionArea = 0.0;
}
// Case 2: One disk completely contains the other, or they are internally tangent.
// This happens when the distance between centers is less than or equal to the absolute difference of their radii.
else if (d <= rDiffAbs + EPSILON) {
    // Sub-case 2a: Internal tangency.
    // The distance is very close to the absolute difference of radii.
    // According to the problem: "intersect in one point, then the area is 0.00".
    if (Math.abs(d - rDiffAbs) < EPSILON) {
        intersectionArea = 0.0;
    } 
    // Sub-case 2b: One disk fully contains the other (not tangent).
    // The smaller disk is fully inside the larger one without touching at a single point.
    // The intersection area is simply the area of the smaller disk.
    else {
        intersectionArea = Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
    }
}
// Case 3: Disks partially overlap.
// This is the general case where the disks intersect at two distinct points.
// Condition: Math.abs(r1 - r2) < d < r1 + r2
else {
    const r1Sq = r1 * r1;
    const r2Sq = r2 * r2;
    const dSq = d * d;

    // Calculate the arguments for Math.acos. These represent the cosine of half the central angle
    // of the circular segment for each disk.
    // h1/r1 and h2/r2, where h1 and h2 are distances from centers to common chord.
    // Using this form directly: h = (d^2 + r^2 - R^2) / (2*d)
    // So h/r = (d^2 + r^2 - R^2) / (2*d*r)
    let arg1 = (dSq + r1Sq - r2Sq) / (2 * d * r1);
    let arg2 = (dSq + r2Sq - r1Sq) / (2 * d * r2);

    // Clamp the arguments to the valid range [-1, 1] to prevent Math.acos from returning NaN
    // due to potential floating-point inaccuracies that might make the value slightly outside this range.
    arg1 = Math.max(-1, Math.min(1, arg1));
    arg2 = Math.max(-1, Math.min(1, arg2));

    // Calculate the distances from each disk's center to the common chord midpoint (h1, h2).
    // This is equivalent to r * cos(angle/2).
    const h1 = r1 * arg1;
    const h2 = r2 * arg2;

    // Calculate the area of each circular segment.
    // Formula for circular segment area: r^2 * arccos(h/r) - h * sqrt(r^2 - h^2)
    const areaSegment1 = r1Sq * Math.acos(arg1) - h1 * Math.sqrt(r1Sq - h1 * h1);
    const areaSegment2 = r2Sq * Math.acos(arg2) - h2 * Math.sqrt(r2Sq - h2 * h2);

    // The total intersection area is the sum of the areas of the two segments.
    intersectionArea = areaSegment1 + areaSegment2;
}

// Output the intersection area, rounded to 2 decimal places.
console.log(intersectionArea.toFixed(2));