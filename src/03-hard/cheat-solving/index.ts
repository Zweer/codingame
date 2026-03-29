// Read input: Standard CodinGame setup for TypeScript
const inputLines: string[] = [];
require('readline')
    .createInterface({ input: process.stdin })
    .on('line', (line: string) => {
        inputLines.push(line);
    })
    .on('close', () => {
        solve();
    });

// Declare grid as a global-like variable to be accessible by getSticker
let grid: string[][];

/**
 * Retrieves the character (sticker) at a specific face coordinate from the global grid.
 * The cube pattern is laid out as a 2D grid in `inputLines`.
 * This function maps (face name, row index within 3x3 face, column index within 3x3 face)
 * to (global row index, global column index) in the `grid` array.
 *
 * @param face The face name ('U', 'L', 'F', 'R', 'B', 'D').
 * @param r The row index within the 3x3 face (0-2).
 * @param c The column index within the 3x3 face (0-2).
 * @returns The character representing the sticker at the specified position.
 * @throws Error if an invalid face name is provided.
 */
function getSticker(face: string, r: number, c: number): string {
    switch (face) {
        case 'U': // Up face: global rows 0-2, global columns 4-6
            return grid[r][4 + c];
        case 'L': // Left face: global rows 4-6, global columns 0-2
            return grid[4 + r][c];
        case 'F': // Front face: global rows 4-6, global columns 4-6
            return grid[4 + r][4 + c];
        case 'R': // Right face: global rows 4-6, global columns 8-10
            return grid[4 + r][8 + c];
        case 'B': // Back face: global rows 4-6, global columns 12-14
            return grid[4 + r][12 + c];
        case 'D': // Down face: global rows 8-10, global columns 4-6
            return grid[8 + r][4 + c];
        default:
            // This case indicates an error in the piece definitions if reached during execution.
            throw new Error(`Invalid face specified: ${face}`);
    }
}

/**
 * Main solver function.
 * It parses the input, defines the sticker locations for all edge and corner pieces,
 * and then checks if any piece has stickers of the same "color" (face type),
 * which would render the cube unsolvable by reassembly.
 */
function solve() {
    // Convert input lines into a 2D character array for easy access to individual stickers
    grid = inputLines.map(line => line.split(''));

    // Define all 12 edge pieces by the coordinates of their two stickers.
    // Each sub-array represents an edge piece's sticker locations:
    // [face1_name, row1_in_face, col1_in_face, face2_name, row2_in_face, col2_in_face]
    const edgePieces: [string, number, number, string, number, number][] = [
        // Edges connecting U face to middle layer faces
        ['U', 2, 1, 'F', 0, 1], // UF: U-bottom-middle and F-top-middle
        ['U', 1, 0, 'L', 0, 1], // UL: U-middle-left and L-top-middle
        ['U', 1, 2, 'R', 0, 1], // UR: U-middle-right and R-top-middle
        ['U', 0, 1, 'B', 0, 1], // UB: U-top-middle and B-top-middle

        // Edges within the middle layer (connecting L, F, R, B faces)
        ['F', 1, 0, 'L', 1, 2], // FL: F-middle-left and L-middle-right
        ['F', 1, 2, 'R', 1, 0], // FR: F-middle-right and R-middle-left
        ['R', 1, 2, 'B', 1, 0], // RB: R-middle-right and B-middle-left
        ['B', 1, 2, 'L', 1, 0], // BL: B-middle-right and L-middle-left

        // Edges connecting D face to middle layer faces
        ['D', 0, 1, 'F', 2, 1], // DF: D-top-middle and F-bottom-middle
        ['D', 1, 2, 'R', 2, 1], // DR: D-middle-right and R-bottom-middle
        ['D', 2, 1, 'B', 2, 1], // DB: D-bottom-middle and B-bottom-middle
        ['D', 1, 0, 'L', 2, 1], // DL: D-middle-left and L-bottom-middle
    ];

    // Define all 8 corner pieces by the coordinates of their three stickers.
    // Each sub-array represents a corner piece's sticker locations:
    // [face1_name, r1_in_face, c1_in_face, face2_name, r2_in_face, c2_in_face, face3_name, r3_in_face, c3_in_face]
    const cornerPieces: [string, number, number, string, number, number, string, number, number][] = [
        // Corners connecting U face to two middle layer faces
        ['U', 2, 0, 'L', 0, 0, 'F', 0, 0], // ULF: U-bottom-left, L-top-left, F-top-left
        ['U', 2, 2, 'F', 0, 2, 'R', 0, 0], // UFR: U-bottom-right, F-top-right, R-top-left
        ['U', 0, 2, 'R', 0, 2, 'B', 0, 0], // URB: U-top-right, R-top-right, B-top-left
        ['U', 0, 0, 'B', 0, 2, 'L', 0, 0], // UBL: U-top-left, B-top-right, L-top-left

        // Corners connecting D face to two middle layer faces
        ['D', 0, 0, 'L', 2, 0, 'F', 2, 0], // DLF: D-top-left, L-bottom-left, F-bottom-left
        ['D', 0, 2, 'F', 2, 2, 'R', 2, 0], // DFR: D-top-right, F-bottom-right, R-bottom-left
        ['D', 2, 2, 'R', 2, 2, 'B', 2, 0], // DRB: D-bottom-right, R-bottom-right, B-bottom-left
        ['D', 2, 0, 'B', 2, 2, 'L', 2, 0], // DBL: D-bottom-left, B-bottom-right, L-bottom-left
    ];

    let solvable = true; // Assume the cube is solvable until a rule is violated

    // Check all edge pieces
    for (const pieceDef of edgePieces) {
        // Extract the two sticker characters for the current edge piece using their defined positions
        const s1 = getSticker(pieceDef[0], pieceDef[1], pieceDef[2]);
        const s2 = getSticker(pieceDef[3], pieceDef[4], pieceDef[5]);

        // Rule for edges: Both stickers on an edge piece must belong to different faces
        if (s1 === s2) {
            solvable = false;
            break; // Found an unsolvable condition, no need to check further pieces
        }
    }

    // Only proceed to check corner pieces if the cube is still considered solvable
    if (solvable) {
        // Check all corner pieces
        for (const pieceDef of cornerPieces) {
            // Extract the three sticker characters for the current corner piece
            const s1 = getSticker(pieceDef[0], pieceDef[1], pieceDef[2]);
            const s2 = getSticker(pieceDef[3], pieceDef[4], pieceDef[5]);
            const s3 = getSticker(pieceDef[6], pieceDef[7], pieceDef[8]);

            // Rule for corners: All three stickers on a corner piece must belong to distinct faces
            if (s1 === s2 || s1 === s3 || s2 === s3) {
                solvable = false;
                break; // Found an unsolvable condition
            }
        }
    }

    // Output the final result based on the solvability flag
    if (solvable) {
        console.log("SOLVABLE");
    } else {
        console.log("UNSOLVABLE");
    }
}