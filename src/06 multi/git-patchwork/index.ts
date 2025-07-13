// The `readline` function is provided by the CodinGame environment.
// For local testing, you might need to mock it.
// For example:
// let inputLines: string[] = [];
// let currentLine = 0;
// function readline(): string {
//     return inputLines[currentLine++];
// }
// function print(message: string): void {
//     console.log(message);
// }

// Define constants
const BOARD_SIZE = 9;
const MAX_TIME = 19;
// STARTING_SCORE and EMPTY_SQUARE_PENALTY are for final game scoring, not direct turn evaluation in this league.
// const STARTING_SCORE = 200;
// const EMPTY_SQUARE_PENALTY = 2;
const MAX_PLAYABLE_PATCHES = 3;

// --- Data Structures ---

interface Patch {
    id: number;
    earning: number; // Ignored for this league
    buttonPrice: number;
    timePrice: number;
    originalShape: boolean[][];
    orientations: boolean[][][]; // All unique rotations and flips
}

// --- Utility Functions ---

/**
 * Parses the board string array into a 2D boolean array.
 * @param lines Array of strings representing board rows. 'O' is taken, '.' is empty.
 * @returns 2D boolean array where true means taken, false means empty.
 */
function parseBoard(lines: string[]): boolean[][] {
    const board: boolean[][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = lines[r][c] === 'O';
        }
    }
    return board;
}

/**
 * Parses a patch shape string into a 2D boolean array.
 * Example: "O.O|OOO|O.O"
 * @param shapeStr The string representation of the patch shape.
 * @returns 2D boolean array where true means part of the patch, false means empty.
 */
function parsePatchShape(shapeStr: string): boolean[][] {
    const rows = shapeStr.split('|');
    const shape: boolean[][] = [];
    for (let r = 0; r < rows.length; r++) {
        shape[r] = [];
        for (let c = 0; c < rows[r].length; c++) {
            shape[r][c] = rows[r][c] === 'O';
        }
    }
    return shape;
}

/**
 * Gets the dimensions (height and width) of a patch shape.
 * @param shape The 2D boolean array representing the patch.
 * @returns Object with height and width.
 */
function getPatchDimensions(shape: boolean[][]): { width: number, height: number } {
    if (shape.length === 0) return { width: 0, height: 0 };
    return { height: shape.length, width: shape[0].length };
}

/**
 * Normalizes a patch shape by cropping it to its minimal bounding box of 'O' cells.
 * This ensures the top-leftmost 'O' is always at (0,0) in the normalized shape.
 * @param shape The 2D boolean array representing the patch.
 * @returns The normalized 2D boolean array.
 */
function normalizePatchShape(shape: boolean[][]): boolean[][] {
    if (shape.length === 0 || shape[0].length === 0) return [[]];

    let minR = shape.length, maxR = -1, minC = shape[0].length, maxC = -1;
    let hasOccupied = false;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                hasOccupied = true;
                minR = Math.min(minR, r);
                maxR = Math.max(maxR, r);
                minC = Math.min(minC, c);
                maxC = Math.max(maxC, c);
            }
        }
    }

    if (!hasOccupied) return [[false]]; // Handle cases with no 'O's, although unlikely for valid patches

    const normalizedShape: boolean[][] = Array(maxR - minR + 1)
        .fill(0)
        .map(() => Array(maxC - minC + 1).fill(false));

    for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
            normalizedShape[r - minR][c - minC] = shape[r][c];
        }
    }
    return normalizedShape;
}

/**
 * Rotates a patch shape 90 degrees clockwise.
 * @param shape The 2D boolean array representing the patch.
 * @returns The rotated 2D boolean array.
 */
function rotatePatch(shape: boolean[][]): boolean[][] {
    if (shape.length === 0 || shape[0].length === 0) return [[]];
    const { height, width } = getPatchDimensions(shape);
    const newShape: boolean[][] = Array(width).fill(0).map(() => Array(height).fill(false));
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            newShape[c][height - 1 - r] = shape[r][c];
        }
    }
    return newShape;
}

/**
 * Flips a patch shape horizontally.
 * @param shape The 2D boolean array representing the patch.
 * @returns The flipped 2D boolean array.
 */
function flipPatch(shape: boolean[][]): boolean[][] {
    if (shape.length === 0 || shape[0].length === 0) return [[]];
    const { height, width } = getPatchDimensions(shape);
    const newShape: boolean[][] = Array(height).fill(0).map(() => Array(width).fill(false));
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            newShape[r][width - 1 - c] = shape[r][c];
        }
    }
    return newShape;
}

/**
 * Converts a 2D boolean shape array back to its string representation for hashing.
 * @param shape The 2D boolean array.
 * @returns A unique string representation of the shape.
 */
function shapeToString(shape: boolean[][]): string {
    return shape.map(row => row.map(cell => (cell ? 'O' : '.')).join('')).join('|');
}

/**
 * Generates all unique orientations (rotations and flips) for a given patch shape.
 * @param originalShape The initial 2D boolean array of the patch.
 * @returns An array of unique 2D boolean arrays, each representing an orientation.
 */
function getUniqueOrientations(originalShape: boolean[][]): boolean[][][] {
    const uniqueShapes = new Map<string, boolean[][]>();
    let currentShape = normalizePatchShape(originalShape);

    for (let i = 0; i < 4; i++) { // 4 rotations (0, 90, 180, 270 degrees)
        // Add current shape
        const s1 = shapeToString(currentShape);
        if (!uniqueShapes.has(s1)) {
            uniqueShapes.set(s1, currentShape);
        }

        // Add flipped shape
        const flippedShape = flipPatch(currentShape);
        const s2 = shapeToString(flippedShape);
        if (!uniqueShapes.has(s2)) {
            uniqueShapes.set(s2, flippedShape);
        }
        
        currentShape = rotatePatch(currentShape); // Rotate for next iteration
        currentShape = normalizePatchShape(currentShape); // Normalize after rotation
    }
    return Array.from(uniqueShapes.values());
}

/**
 * Checks if a patch can be placed at a given (x, y) on the board without overlap or going out of bounds.
 * @param board The current game board.
 * @param patchShape The patch orientation to place.
 * @param x The column (0-indexed) for the top-left corner of the patch.
 * @param y The row (0-indexed) for the top-left corner of the patch.
 * @returns True if placement is valid, false otherwise.
 */
function canPlacePatch(board: boolean[][], patchShape: boolean[][], x: number, y: number): boolean {
    const { height, width } = getPatchDimensions(patchShape);
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (patchShape[r][c]) { // If this part of the patch is 'O'
                const boardX = x + c;
                const boardY = y + r;
                // Check bounds and if the spot is already taken
                if (boardX < 0 || boardX >= BOARD_SIZE || boardY < 0 || boardY >= BOARD_SIZE || board[boardY][boardX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Counts the number of 'O' cells in a patch shape.
 * @param patchShape The 2D boolean array representing the patch.
 * @returns The total number of squares covered by the patch.
 */
function countSquaresInPatch(patchShape: boolean[][]): number {
    let count = 0;
    for (let r = 0; r < patchShape.length; r++) {
        for (let c = 0; c < patchShape[r].length; c++) {
            if (patchShape[r][c]) {
                count++;
            }
        }
    }
    return count;
}

// --- Main Logic ---

function solve(): void {
    // Initialization Input (ignored for this league as per problem statement: "always 0 for this league")
    parseInt(readline()); // incomeEvents
    readline(); // incomeTime
    parseInt(readline()); // patchEvents
    readline(); // patchTime

    while (true) {
        // Game Turn Input
        const [myButtons, myTime, myEarning] = readline().split(' ').map(Number);
        const myBoardLines: string[] = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            myBoardLines.push(readline());
        }
        const myBoard = parseBoard(myBoardLines);

        const [opponentButtons, opponentTime, opponentEarning] = readline().split(' ').map(Number);
        // Opponent's board is not directly used for making my move decisions in this simple strategy,
        // but it's part of the input.
        for (let i = 0; i < BOARD_SIZE; i++) {
            readline(); // opponentBoard
        }

        const patchesCount = parseInt(readline());
        const availablePatches: Patch[] = [];
        for (let i = 0; i < patchesCount; i++) {
            const [id, earning, buttonPrice, timePrice, shapeStr] = readline().split(' ');
            const originalShape = parsePatchShape(shapeStr);
            availablePatches.push({
                id: parseInt(id),
                earning: parseInt(earning),
                buttonPrice: parseInt(buttonPrice),
                timePrice: parseInt(timePrice),
                originalShape: originalShape,
                orientations: getUniqueOrientations(originalShape),
            });
        }
        
        // Special patch ID (ignored for this league: "always 0 for this league")
        parseInt(readline());

        // Opponent moves history (ignored for this league)
        const opponentMovesCount = parseInt(readline());
        for (let i = 0; i < opponentMovesCount; i++) {
            readline(); // opponentMove description
        }

        // --- Determine Best Move ---
        let bestScore = -Infinity; // Initialize with a very low score to ensure any valid PLAY is preferred over SKIP if beneficial
        let bestMove: string = "SKIP"; // Default move

        // Heuristic weights for evaluation:
        // SQUARE_VALUE: Value gained per square covered (directly from end-game scoring: 2 buttons saved per square)
        const SQUARE_VALUE = 2;
        // TIME_PENALTY_FACTOR: Penalty per time unit advanced. A small penalty to prefer less time-costly patches,
        // which might allow for more turns or keep turn advantage.
        // A value of 0.5 means 1 time unit is worth 0.5 buttons or 0.25 covered squares.
        const TIME_PENALTY_FACTOR = 0.5; 

        // Iterate through the first MAX_PLAYABLE_PATCHES (3) available patches
        for (let i = 0; i < Math.min(patchesCount, MAX_PLAYABLE_PATCHES); i++) {
            const patch = availablePatches[i];

            // 1. Check if the patch can be afforded
            if (myButtons < patch.buttonPrice) {
                continue; // Cannot afford this patch, skip to the next
            }

            // 2. Iterate through all unique orientations of the patch
            for (const orientation of patch.orientations) {
                const { height, width } = getPatchDimensions(orientation);
                const squaresInPatch = countSquaresInPatch(orientation);

                // 3. Iterate through all possible placement positions (top-left corner) on the board
                for (let r = 0; r <= BOARD_SIZE - height; r++) {
                    for (let c = 0; c <= BOARD_SIZE - width; c++) {
                        // 4. Check if the patch can be placed at (c, r)
                        if (canPlacePatch(myBoard, orientation, c, r)) {
                            // Calculate the score for this specific PLAY move
                            // The score is based on the immediate gain in board coverage and button cost,
                            // plus a penalty for time advanced.
                            // Formula: (squares_covered * SQUARE_VALUE) - button_price - (time_price * TIME_PENALTY_FACTOR)
                            const currentMoveScore = (squaresInPatch * SQUARE_VALUE) - patch.buttonPrice - (patch.timePrice * TIME_PENALTY_FACTOR);

                            // Update best move if this move is better
                            if (currentMoveScore > bestScore) {
                                bestScore = currentMoveScore;
                                bestMove = `PLAY ${patch.id} ${c} ${r}`;
                            }
                        }
                    }
                }
            }
        }
        
        // If the best calculated score for a PLAY move is not positive, it means all possible
        // PLAY moves are either detrimental (negative score) or provide no net benefit relative to SKIP.
        // In such cases, choosing 'SKIP' (which has an implicit score of 0, as it costs nothing and gains nothing
        // in terms of buttons/squares in this league, but consumes a turn) is preferable.
        // If no valid PLAY move was found at all, bestScore remains -Infinity, and SKIP will be chosen.
        if (bestScore <= 0) { 
            bestMove = "SKIP";
        }

        print(bestMove);
    }
}

// Call the main function to start the game loop
solve();