// Define global readline for CodinGame environment
declare function readline(): string;
// declare function print(message: any): void; // console.log usually works as print

/**
 * Represents a specific orientation of a shape (e.g., Q00, Q13).
 */
class OrientedShape {
    constructor(
        public shapeId: string, // Original shape letter (e.g., 'Q')
        public flip: number,     // 0 for no flip, 1 for horizontal flip
        public rotate: number,   // 0 for 0deg, 1 for 90deg, 2 for 180deg, 3 for 270deg clockwise
        public size: number,     // Number of cells in this shape (constant across orientations)
        // Map from 1-indexed cell ID to its relative (dx, dy) coordinate within THIS oriented shape's bounding box
        public cellsById: Map<number, { dx: number; dy: number }>,
        // List of all cells as {dx, dy}, relative to THIS oriented shape's bounding box (normalized to 0,0)
        public cells: { dx: number; dy: number }[]
    ) {}
}

/**
 * Represents a base shape and all its possible orientations.
 */
class Shape {
    id: string;
    size: number;
    // The original base shape's cells, mapping 1-indexed ID to (dx, dy)
    // relative to its bounding box (normalized to 0,0)
    baseCellsMap: Map<number, { dx: number; dy: number }>;

    // Map from oriented shape key (e.g., "Q00") to its OrientedShape object
    orientations: Map<string, OrientedShape>;

    constructor(letter: string, refCol: number, refRow: number, patternLines: string[]) {
        this.id = letter;
        this.baseCellsMap = new Map();
        let currentCellId = 1;

        let initialMaxX = -Infinity; // max X coord of original pattern (for its bounding box)
        let initialMaxY = -Infinity; // max Y coord of original pattern (for its bounding box)

        // Parse initial pattern to get baseCells and calculate initial bounding box
        for (let y = 0; y < patternLines.length; y++) {
            for (let x = 0; x < patternLines[y].length; x++) {
                if (patternLines[y][x] === '#') {
                    this.baseCellsMap.set(currentCellId, { dx: x, dy: y });
                    initialMaxX = Math.max(initialMaxX, x);
                    initialMaxY = Math.max(initialMaxY, y);
                    currentCellId++;
                }
            }
        }
        this.size = this.baseCellsMap.size; // Total number of '#' cells

        this.orientations = new Map();

        // Generate all 8 orientations (2 flips * 4 rotations)
        for (let flip = 0; flip <= 1; flip++) {
            // `cellsAfterFlip` stores cells for the current flip state (0 or 1), 
            // mapping cellId to {dx, dy}
            let cellsAfterFlip = new Map(this.baseCellsMap);
            let currentFlippedMaxX = initialMaxX; // Max X of the currently flipped shape's bounding box
            let currentFlippedMaxY = initialMaxY; // Max Y of the currently flipped shape's bounding box

            // Apply horizontal flip if flip === 1
            if (flip === 1) {
                const transformedPoints: { dx: number; dy: number; id: number }[] = [];
                for (const [id, { dx, dy }] of cellsAfterFlip.entries()) {
                    // Flip relative to original shape's width (initialMaxX represents max coord)
                    transformedPoints.push({ dx: initialMaxX - dx, dy: dy, id: id });
                }

                // Re-normalize after flip (to ensure top-left is 0,0) and update max coords
                let minX = Infinity,
                    minY = Infinity;
                currentFlippedMaxX = -Infinity; // Reset to recalculate for the flipped shape
                currentFlippedMaxY = -Infinity;

                for (const p of transformedPoints) {
                    minX = Math.min(minX, p.dx);
                    minY = Math.min(minY, p.dy);
                }
                cellsAfterFlip.clear(); // Clear old coordinates
                for (const p of transformedPoints) {
                    const normalizedX = p.dx - minX;
                    const normalizedY = p.dy - minY;
                    cellsAfterFlip.set(p.id, { dx: normalizedX, dy: normalizedY });
                    currentFlippedMaxX = Math.max(currentFlippedMaxX, normalizedX);
                    currentFlippedMaxY = Math.max(currentFlippedMaxY, normalizedY);
                }
            }

            for (let rotate = 0; rotate <= 3; rotate++) {
                // `cellsAfterRotate` starts with the `cellsAfterFlip` state for each rotation series
                let cellsAfterRotate = new Map(cellsAfterFlip);
                let currentRotatedMaxX = currentFlippedMaxX; // Max X of the shape BEFORE this specific rotation step
                let currentRotatedMaxY = currentFlippedMaxY; // Max Y of the shape BEFORE this specific rotation step

                // Apply rotations (`rotate` times)
                for (let r = 0; r < rotate; r++) {
                    const transformedPoints: { dx: number; dy: number; id: number }[] = [];
                    for (const [id, { dx, dy }] of cellsAfterRotate.entries()) {
                        // Rotate 90 degrees clockwise: (x,y) -> (y, (currentMaxX) - x)
                        // currentRotatedMaxX is the max X of the shape *before* this individual rotation step.
                        transformedPoints.push({ dx: dy, dy: currentRotatedMaxX - dx, id: id });
                    }

                    // Re-normalize after rotation and update max coords for next rotation step (if any)
                    let minX = Infinity,
                        minY = Infinity;
                    currentRotatedMaxX = -Infinity; // Reset to recalculate for the newly rotated shape
                    currentRotatedMaxY = -Infinity;

                    for (const p of transformedPoints) {
                        minX = Math.min(minX, p.dx);
                        minY = Math.min(minY, p.dy);
                    }
                    cellsAfterRotate.clear(); // Clear old coordinates
                    for (const p of transformedPoints) {
                        const normalizedX = p.dx - minX;
                        const normalizedY = p.dy - minY;
                        cellsAfterRotate.set(p.id, { dx: normalizedX, dy: normalizedY });
                        currentRotatedMaxX = Math.max(currentRotatedMaxX, normalizedX);
                        currentRotatedMaxY = Math.max(currentRotatedMaxY, normalizedY);
                    }
                }

                // Create and store the OrientedShape object
                const orientedShapeKey = `${this.id}${flip}${rotate}`;
                const orientedCells: { dx: number; dy: number }[] = Array.from(cellsAfterRotate.values());

                this.orientations.set(
                    orientedShapeKey,
                    new OrientedShape(
                        this.id,
                        flip,
                        rotate,
                        this.size, // Size (number of cells) remains constant for all orientations
                        cellsAfterRotate, // Map from ID to (dx,dy) for this specific orientation
                        orientedCells     // List of all cells for easy iteration
                    )
                );
            }
        }
    }
}

// Global storage for all shape definitions, mapped by their letter ('A' to 'U')
const allShapes = new Map<string, Shape>();

// --- Initial Input Parsing (executed once at the start of the game) ---
const numberOfShapes = parseInt(readline()); // Number of shapes available to each player
for (let i = 0; i < numberOfShapes; i++) {
    const inputs = readline().split(' ');
    const letter = inputs[0];
    const refCol = parseInt(inputs[1]); // Reference column, not directly used by this strategy
    const refRow = parseInt(inputs[2]); // Reference row, not directly used by this strategy
    // Remaining parts form the multi-line shape definition
    const definition = inputs.slice(3).join('\n'); 
    const patternLines = definition.split('\n');

    allShapes.set(letter, new Shape(letter, refCol, refRow, patternLines));
}

const numberOfPlayers = parseInt(readline()); // Total number of players
const myPlayerId = parseInt(readline());     // Current player's ID
const BOARD_SIZE = parseInt(readline());     // Size of the board (N, usually 13)
const authorizedShapeLetters = readline(); // String containing letters of shapes allowed for this game. Not used by this strategy as possible moves are given.

// --- Game Loop (executed for each turn) ---
while (true) {
    // Read current board state
    // The board characters can be '0'-'3' for occupied cells, '.' for free, 'x' for free and well-connected for current player.
    const board: string[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push(readline().split('')); 
    }

    // Read opponent moves (not used by this simple strategy)
    const numberOfOpponentMoves = parseInt(readline());
    for (let i = 0; i < numberOfOpponentMoves; i++) {
        readline(); // Format: playerID col row orientedShapeString
    }

    // Read possible moves for the current player
    const numberOfPossibleMoves = parseInt(readline());
    let bestMove: string = "";
    let maxCells = -1; // Keep track of the maximum number of cells covered by a move

    for (let i = 0; i < numberOfPossibleMoves; i++) {
        const move = readline(); // Format: "col row orientedShapeString" (e.g., "0 0 Q001")
        const parts = move.split(' ');
        const orientedShapeString = parts[2]; // e.g., "Q001"

        const shapeLetter = orientedShapeString[0];
        // The orientedShapeKey is the first 3 characters (e.g., "Q00" for flip 0, rotate 0)
        const orientedShapeKey = orientedShapeString.substring(0, 3);

        const shape = allShapes.get(shapeLetter);
        if (!shape) {
            // This error indicates an unexpected shape letter in the input
            console.error(`Error: Unknown shape letter '${shapeLetter}' from move '${move}'`);
            continue;
        }

        const orientedShape = shape.orientations.get(orientedShapeKey);
        if (!orientedShape) {
            // This error indicates an unexpected oriented shape key in the input
            console.error(`Error: Unknown oriented shape '${orientedShapeKey}' for move '${move}'`);
            continue;
        }

        const currentMoveCells = orientedShape.size; // Get the number of cells this piece covers

        // Greedy strategy: choose the move that covers the most cells
        if (currentMoveCells > maxCells) {
            maxCells = currentMoveCells;
            bestMove = move;
        }
        // For tie-breaking (if two moves have the same maxCells), the one read first wins,
        // which is an arbitrary but acceptable tie-breaker for this simple strategy.
    }

    // Output the chosen move.
    // If numberOfPossibleMoves was 0, bestMove would remain an empty string.
    // In CodinGame, if no valid move is found (or if it's the player's turn to pass), "PASS" is sometimes expected.
    // However, for this puzzle, it's generally expected that a move is always chosen if options are provided.
    if (bestMove === "") {
        console.log("PASS"); // Fallback for no moves, typically means the player cannot play
    } else {
        console.log(bestMove);
    }
}