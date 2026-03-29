// Standard input/output functions for CodinGame
declare function readline(): string;
declare function print(message: any): void; // console.log is typically available

/**
 * Type alias for a 3-element vector representing a direction (e.g., [x, y, z]).
 */
type Vector3 = [number, number, number];

/**
 * Type alias for a 3x3 matrix.
 */
type Matrix = number[][];

// --- 1. Define Face-Vector Mapping ---
// Maps face names (F, B, U, D, L, R) to their initial 3D vectors in a right-hand coordinate system.
// F: positive Z, B: negative Z, U: positive Y, D: negative Y, R: positive X, L: negative X.
const faceToVector = new Map<string, Vector3>([
    ['F', [0, 0, 1]],  // Front
    ['B', [0, 0, -1]], // Back
    ['U', [0, 1, 0]],  // Up
    ['D', [0, -1, 0]], // Down
    ['R', [1, 0, 0]],  // Right
    ['L', [-1, 0, 0]], // Left
]);

// --- 2. Define Rotation Matrices ---
// These matrices transform a vector by rotating it.
// The problem describes rotating the *cube*. To find where an *original face* ends up,
// we apply the *inverse* of the cube's rotation to its direction vector.
// A clockwise cube rotation corresponds to applying a counter-clockwise vector rotation matrix.
// A counter-clockwise cube rotation corresponds to applying a clockwise vector rotation matrix.

// R_x(-90) degrees (counter-clockwise around X)
const Rx_neg90: Matrix = [
    [1, 0, 0],
    [0, 0, 1],
    [0, -1, 0]
];

// R_x(90) degrees (clockwise around X)
const Rx_pos90: Matrix = [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0]
];

// R_y(-90) degrees (counter-clockwise around Y)
const Ry_neg90: Matrix = [
    [0, 0, -1],
    [0, 1, 0],
    [1, 0, 0]
];

// R_y(90) degrees (clockwise around Y)
const Ry_pos90: Matrix = [
    [0, 0, 1],
    [0, 1, 0],
    [-1, 0, 0]
];

// R_z(-90) degrees (counter-clockwise around Z)
const Rz_neg90: Matrix = [
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 1]
];

// R_z(90) degrees (clockwise around Z)
const Rz_pos90: Matrix = [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1]
];

// Map rotation command strings to their corresponding transformation matrices.
// 'x' (cube clockwise on R) implies applying R_x(-90) to the vectors.
// 'x'' (cube counter-clockwise on R) implies applying R_x(90) to the vectors.
// Same logic applies to y/y' and z/z'.
const rotMatrices = new Map<string, Matrix>([
    ['x', Rx_neg90],    // Rotate cube clockwise around X
    ["x'", Rx_pos90],   // Rotate cube counter-clockwise around X
    ['y', Ry_neg90],    // Rotate cube clockwise around Y
    ["y'", Ry_pos90],   // Rotate cube counter-clockwise around Y
    ['z', Rz_neg90],    // Rotate cube clockwise around Z
    ["z'", Rz_pos90],   // Rotate cube counter-clockwise around Z
]);

// --- 3. Vector-Matrix Multiplication Function ---
/**
 * Multiplies a 3D vector by a 3x3 matrix.
 * @param vec The input vector [x, y, z].
 * @param matrix The 3x3 transformation matrix [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]].
 * @returns The transformed vector [x', y', z'].
 */
function multiplyVectorMatrix(vec: Vector3, matrix: Matrix): Vector3 {
    const [x, y, z] = vec;
    const m = matrix;

    // (x', y', z') = (x, y, z) * M (row vector * matrix)
    // newX = x*m00 + y*m10 + z*m20 for column vectors (matrix * column vector)
    // For row vector * matrix:
    // newX = x*m00 + y*m01 + z*m02 (first row of matrix) -> This is WRONG.
    // Standard matrix-vector multiplication is matrix * column vector.
    // [m00 m01 m02]   [x]   [m00*x + m01*y + m02*z]
    // [m10 m11 m12] * [y] = [m10*x + m11*y + m12*z]
    // [m20 m21 m22]   [z]   [m20*x + m21*y + m22*z]
    const newX = x * m[0][0] + y * m[0][1] + z * m[0][2];
    const newY = x * m[1][0] + y * m[1][1] + z * m[1][2];
    const newZ = x * m[2][0] + y * m[2][1] + z * m[2][2];

    return [newX, newY, newZ];
}

// --- 4. Convert Vector to Face Name ---
/**
 * Converts a 3D unit vector (representing a face's direction along an axis)
 * back to its corresponding face name.
 * @param vec The vector, e.g., [1, 0, 0] for Right.
 * @returns The name of the face (e.g., 'F', 'L', 'U').
 */
function vectorToFaceName(vec: Vector3): string {
    const [x, y, z] = vec;
    if (x === 1) return 'R';
    if (x === -1) return 'L';
    if (y === 1) return 'U';
    if (y === -1) return 'D';
    if (z === 1) return 'F';
    if (z === -1) return 'B';
    
    // This case indicates an unexpected vector, implying an error in logic or input.
    throw new Error(`Invalid vector: [${x}, ${y}, ${z}] does not map to a standard face.`);
}

// --- Main Logic ---

// Read input from CodinGame's readline function
const rotationsInput: string = readline();
const face1Name: string = readline();
const face2Name: string = readline();

// Initialize the current vectors for the queried faces based on their initial names.
// The spread operator `...` is used to create a new array, ensuring that we are
// working with mutable copies of the initial vectors from the map.
let currentFace1Vector: Vector3 = [...faceToVector.get(face1Name)!];
let currentFace2Vector: Vector3 = [...faceToVector.get(face2Name)!];

// Split the input rotation string into individual rotation commands
const rotations = rotationsInput.split(' ');

// Apply each rotation in sequence
for (const rotation of rotations) {
    const matrix = rotMatrices.get(rotation);
    if (!matrix) {
        // This error should ideally not be triggered given the puzzle's constraints
        // on valid rotation commands.
        throw new Error(`Unknown rotation command: ${rotation}`);
    }

    // Transform the current vectors by applying the retrieved rotation matrix
    currentFace1Vector = multiplyVectorMatrix(currentFace1Vector, matrix);
    currentFace2Vector = multiplyVectorMatrix(currentFace2Vector, matrix);
}

// After all rotations, convert the final 3D vectors back to their corresponding face names
const finalFace1Name = vectorToFaceName(currentFace1Vector);
const finalFace2Name = vectorToFaceName(currentFace2Vector);

// Output the results to CodinGame's console (using console.log for TypeScript compatibility)
console.log(finalFace1Name);
console.log(finalFace2Name);