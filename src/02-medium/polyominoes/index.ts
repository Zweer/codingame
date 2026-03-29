// For CodinGame environment, these are implicitly available.
// declare function readline(): string;
// declare function print(message: string): void;

// Define the structure for a point (cell offset)
interface Point {
    r: number;
    c: number;
}

// Polyomino definitions.
// Each shape is a list of relative coordinates {r, c} from its top-leftmost cell (0,0) in its base orientation,
// as interpreted from the provided image.
const POLYOMINO_SHAPES: Record<string, Point[]> = {
    // A: L-tetromino (4 cells)
    'A': [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:2,c:1}],
    // B: T-tetromino (4 cells)
    'B': [{r:0,c:1}, {r:1,c:0}, {r:1,c:1}, {r:1,c:2}],
    // C: O-tetromino (square, 4 cells)
    'C': [{r:0,c:0}, {r:0,c:1}, {r:1,c:0}, {r:1,c:1}],
    // D: I-tromino (3 cells, straight line)
    'D': [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}],
    // E: Z-tetromino (4 cells)
    'E': [{r:0,c:0}, {r:0,c:1}, {r:1,c:1}, {r:1,c:2}],
    // F: S-tetromino (4 cells)
    'F': [{r:0,c:1}, {r:0,c:2}, {r:1,c:0}, {r:1,c:1}],
    // G: Custom L-pentomino (5 cells) from image
    'G': [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:2,c:1}, {r:3,c:0}],
    // H: T-pentomino (5 cells)
    'H': [{r:0,c:1}, {r:1,c:0}, {r:1,c:1}, {r:1,c:2}, {r:2,c:1}],
    // I: I-tetromino (4 cells, straight line)
    'I': [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}, {r:0,c:3}],
    // J: P-pentomino (5 cells)
    'J': [{r:0,c:0}, {r:0,c:1}, {r:1,c:0}, {r:1,c:1}, {r:2,c:0}],
    // K: F-pentomino (5 cells)
    'K': [{r:0,c:1}, {r:0,c:2}, {r:1,c:0}, {r:1,c:1}, {r:2,c:1}],
    // L: Custom N-pentomino (5 cells) from image
    'L': [{r:0,c:1}, {r:1,c:0}, {r:1,c:1}, {r:2,c:1}, {r:2,c:2}],
    // M: Custom Y-pentomino (5 cells) from image
    'M': [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}, {r:1,c:1}, {r:2,c:1}],
    // N: L-tromino (3 cells) from image
    'N': [{r:0,c:0}, {r:1,c:0}, {r:1,c:1}],
};

// Global storage for all unique orientations of all polyominoes.
// Maps a polyomino ID to an array of its unique orientations, where each orientation is an array of Points.
const ALL_ORIENTATIONS: Map<string, Point[][]> = new Map();

/**
 * Normalizes a shape by shifting its cells so the top-most, left-most cell is at (0,0).
 * Also sorts the cells for consistent string representation, which is crucial for identifying unique shapes.
 * @param shape The polyomino shape as an array of Points.
 * @returns The normalized and sorted shape.
 */
function normalizeShape(shape: Point[]): Point[] {
    if (shape.length === 0) return [];
    let minR = Infinity;
    let minC = Infinity;
    for (const { r, c } of shape) {
        minR = Math.min(minR, r);
        minC = Math.min(minC, c);
    }
    const normalized = shape.map(p => ({ r: p.r - minR, c: p.c - minC }));
    // Sort for consistent string representation (important for Set uniqueness)
    return normalized.sort((a, b) => a.r - b.r || a.c - b.c);
}

/**
 * Converts a shape (list of points) to a unique string representation.
 * Used to store and check for unique orientations in a Set.
 * @param shape The polyomino shape.
 * @returns A string representation of the shape.
 */
function shapeToString(shape: Point[]): string {
    return shape.map(p => `${p.r},${p.c}`).join(';');
}

/**
 * Rotates a shape 90 degrees clockwise around the origin (then normalizes).
 * A point (r, c) becomes (c, -r) after rotation.
 * @param shape The polyomino shape to rotate.
 * @returns The rotated and normalized shape.
 */
function rotateShape(shape: Point[]): Point[] {
    const rotated = shape.map(p => ({ r: p.c, c: -p.r }));
    return normalizeShape(rotated);
}

/**
 * Flips a shape horizontally across the Y-axis (then normalizes).
 * A point (r, c) becomes (r, -c) after horizontal flip.
 * @param shape The polyomino shape to flip.
 * @returns The flipped and normalized shape.
 */
function flipShape(shape: Point[]): Point[] {
    const flipped = shape.map(p => ({ r: p.r, c: -p.c }));
    return normalizeShape(flipped);
}

/**
 * Precomputes all unique orientations (rotations and flips) for each polyomino defined in POLYOMINO_SHAPES.
 * Stores them in the global ALL_ORIENTATIONS map.
 */
function precomputeAllOrientations() {
    for (const id in POLYOMINO_SHAPES) {
        const baseShape = normalizeShape(POLYOMINO_SHAPES[id]);
        const uniqueOrientationStrings = new Set<string>();
        const orientationsList: Point[][] = [];

        let currentShape = baseShape;
        for (let i = 0; i < 4; i++) { // Generate 4 rotations (0, 90, 180, 270 degrees)
            // Add current shape if unique
            let shapeStr = shapeToString(currentShape);
            if (!uniqueOrientationStrings.has(shapeStr)) {
                uniqueOrientationStrings.add(shapeStr);
                orientationsList.push(currentShape);
            }

            // Add flipped version of current shape if unique
            let flippedShape = flipShape(currentShape);
            let flippedShapeStr = shapeToString(flippedShape);
            if (!uniqueOrientationStrings.has(flippedShapeStr)) {
                uniqueOrientationStrings.add(flippedShapeStr);
                orientationsList.push(flippedShape);
            }
            
            currentShape = rotateShape(currentShape); // Prepare for the next rotation
        }
        ALL_ORIENTATIONS.set(id, orientationsList);
    }
}

// Global variables to store board dimensions, current board state, and the final solution.
let H_BOARD: number;
let W_BOARD: number;
let BOARD: string[][]; // The mutable board state during the recursive search.
let solutionFound = false; // Flag to stop the search once a solution is found.
let finalBoard: string[][] | null = null; // Stores the deep copy of the board when a solution is found.

/**
 * Checks if a given polyomino piece (in a specific orientation) can be placed on the board
 * at a given anchor position (top-leftmost cell of the piece's bounding box).
 * @param piece The array of Points defining the polyomino's current orientation.
 * @param anchorR The row coordinate for the piece's anchor point.
 * @param anchorC The column coordinate for the piece's anchor point.
 * @returns True if the piece can be placed, false otherwise.
 */
function canPlace(piece: Point[], anchorR: number, anchorC: number): boolean {
    for (const { r, c } of piece) {
        const boardR = anchorR + r;
        const boardC = anchorC + c;

        // Check if the cell is within board boundaries.
        if (boardR < 0 || boardR >= H_BOARD || boardC < 0 || boardC >= W_BOARD) {
            return false;
        }
        // Check if the cell on the board must be occupied ('O').
        // If it's a '.' (must remain unoccupied) or already covered by another piece (char other than 'O'), it's an invalid placement.
        if (BOARD[boardR][boardC] !== 'O') {
            return false;
        }
    }
    return true;
}

/**
 * Places a polyomino piece onto the global BOARD.
 * @param piece The array of Points defining the polyomino's current orientation.
 * @param anchorR The row coordinate for the piece's anchor point.
 * @param anchorC The column coordinate for the piece's anchor point.
 * @param id The ID of the polyomino (e.g., 'A', 'B') to mark the occupied cells.
 */
function placePiece(piece: Point[], anchorR: number, anchorC: number, id: string) {
    for (const { r, c } of piece) {
        BOARD[anchorR + r][anchorC + c] = id;
    }
}

/**
 * Removes a polyomino piece from the global BOARD (used for backtracking).
 * Cells covered by the piece are reverted to 'O'.
 * @param piece The array of Points defining the polyomino's current orientation.
 * @param anchorR The row coordinate for the piece's anchor point.
 * @param anchorC The column coordinate for the piece's anchor point.
 */
function unplacePiece(piece: Point[], anchorR: number, anchorC: number) {
    for (const { r, c } of piece) {
        BOARD[anchorR + r][anchorC + c] = 'O'; // Restore the cell to 'O' for other placements.
    }
}

/**
 * Main recursive backtracking function to solve the polyomino puzzle.
 * It tries to place each piece from the `pieceIds` list sequentially.
 * @param pieceIds An array of polyomino IDs to be placed on the board.
 * @param currentPieceIndex The index of the current piece in `pieceIds` that we are trying to place.
 * @returns True if a solution is found starting from the current state, false otherwise.
 */
function solve(pieceIds: string[], currentPieceIndex: number): boolean {
    // If a solution has already been found in another branch, we can stop exploring further.
    if (solutionFound) {
        return true;
    }

    // Step 1: Find the next top-most, left-most 'O' cell that needs to be filled.
    let nextR = -1;
    let nextC = -1;
    for (let r = 0; r < H_BOARD; r++) {
        for (let c = 0; c < W_BOARD; c++) {
            if (BOARD[r][c] === 'O') {
                nextR = r;
                nextC = c;
                break; // Found the first 'O', break from inner loop
            }
        }
        if (nextR !== -1) break; // Found the first 'O', break from outer loop
    }

    // Base Case 1: If no 'O' cells are left, the board is completely filled.
    if (nextR === -1) {
        // Check if all pieces have been used.
        if (currentPieceIndex === pieceIds.length) {
            // All 'O' cells covered AND all pieces used. Solution found!
            // Deep copy the board state before returning, as BOARD is mutable.
            finalBoard = BOARD.map(row => [...row]);
            solutionFound = true; // Set flag to stop other branches.
            return true;
        } else {
            // Board filled, but some pieces are left over. This is an invalid path.
            return false;
        }
    }

    // Base Case 2: If there are 'O' cells but no pieces left to place.
    if (currentPieceIndex === pieceIds.length) {
        return false; // Cannot fill the board, as no pieces remain.
    }

    // Get the current piece ID to place and its unique orientations.
    const currentPieceId = pieceIds[currentPieceIndex];
    const orientations = ALL_ORIENTATIONS.get(currentPieceId)!;

    // Step 2: Try all possible orientations and positions for the current piece.
    for (const orientation of orientations) {
        // Iterate through each cell within the current orientation of the piece.
        // This effectively tries to align each of the piece's cells with the `nextR, nextC` empty spot.
        for (const { r: pieceR, c: pieceC } of orientation) {
            // Calculate the potential anchor position (top-left of piece's bounding box)
            // if the cell (pieceR, pieceC) of the piece were to cover (nextR, nextC) on the board.
            const anchorR = nextR - pieceR;
            const anchorC = nextC - pieceC;

            // Check if this placement is valid.
            if (canPlace(orientation, anchorR, anchorC)) {
                // Place the piece on the board.
                placePiece(orientation, anchorR, anchorC, currentPieceId);
                
                // Recursively call solve for the next piece.
                if (solve(pieceIds, currentPieceIndex + 1)) {
                    return true; // If a solution is found in the recursive call, propagate it.
                }
                
                // If no solution found with this placement, backtrack: remove the piece.
                unplacePiece(orientation, anchorR, anchorC);
            }
        }
    }

    return false; // If no placement for the current piece leads to a solution, return false.
}

// --- Main execution flow ---

// 1. Precompute all unique orientations for all polyominoes.
precomputeAllOrientations();

// 2. Read input.
const idsInput: string = readline();
const [hStr, wStr] = readline().split(' ');
H_BOARD = parseInt(hStr);
W_BOARD = parseInt(wStr);

BOARD = [];
for (let i = 0; i < H_BOARD; i++) {
    BOARD.push(readline().split(''));
}

// 3. Prepare the list of piece IDs. Sorting them is optional but can help for consistency
//    or potentially for minor performance benefits (e.g., trying smaller pieces first).
const pieceIdsArray = idsInput.split('').sort(); 

// 4. Start the backtracking search.
solve(pieceIdsArray, 0);

// 5. Print the result.
if (finalBoard) {
    for (let r = 0; r < H_BOARD; r++) {
        print(finalBoard[r].join(''));
    }
} else {
    // This case should ideally not be reached based on typical CodinGame puzzle design,
    // where a solution is guaranteed to exist.
    // console.error("No solution found."); 
}