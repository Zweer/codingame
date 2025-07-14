// Define global functions for CodinGame environment
declare function readline(): string;
declare function print(message: any): void; // Using console.log typically works for TypeScript

// --- Helper functions for coordinate conversion ---

const BOARD_SIZE = 8;
const WHITE = 0; // Represents a white piece on the board
const BLACK = 1; // Represents a black piece on the board

/**
 * Converts a column character ('a' to 'h') to its 0-indexed equivalent (0 to 7).
 * 'a' -> 0, 'b' -> 1, ..., 'h' -> 7.
 * @param char The column character (e.g., 'a').
 * @returns The 0-indexed column.
 */
function colCharToIndex(char: string): number {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

/**
 * Converts a row number ('1' to '8') to its 0-indexed equivalent (7 to 0).
 * This maps '8' (the top row in chess algebraic notation) to index 0,
 * and '1' (the bottom row) to index 7, consistent with typical 2D array indexing
 * where [0][0] is top-left.
 * @param num The row number string (e.g., '8').
 * @returns The 0-indexed row.
 */
function rowNumToIndex(num: string): number {
    return BOARD_SIZE - parseInt(num, 10);
}

/**
 * Converts a 0-indexed column (0 to 7) to its character equivalent ('a' to 'h').
 * @param index The 0-indexed column (e.g., 0).
 * @returns The column character (e.g., 'a').
 */
function colIndexToChar(index: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + index);
}

/**
 * Converts a 0-indexed row (0 to 7) to its number equivalent ('8' to '1').
 * @param index The 0-indexed row (e.g., 0).
 * @returns The row number string (e.g., '8').
 */
function rowIndexToNum(index: number): string {
    return (BOARD_SIZE - index).toString();
}

/**
 * Converts an algebraic chessboard position (e.g., 'd5') to 0-indexed [row, col] coordinates.
 * 'a8' -> [0,0], 'h1' -> [7,7].
 * @param position The algebraic position string (e.g., 'd5').
 * @returns A tuple [row, col].
 */
function algebraicToCoords(position: string): [number, number] {
    const col = colCharToIndex(position[0]);
    const row = rowNumToIndex(position[1]);
    return [row, col];
}

/**
 * Converts 0-indexed [row, col] coordinates to an algebraic chessboard position (e.g., 'd5').
 * @param row The 0-indexed row.
 * @param col The 0-indexed column.
 * @returns The algebraic position string.
 */
function coordsToAlgebraic(row: number, col: number): string {
    const colChar = colIndexToChar(col);
    const rowNum = rowIndexToNum(row);
    return colChar + rowNum;
}

// --- Main puzzle logic ---

function solve() {
    // Read the white rook's initial position (e.g., "d5")
    const rookPosStr: string = readline();
    const [rookRow, rookCol] = algebraicToCoords(rookPosStr);

    // Initialize the chessboard:
    // null represents an empty square.
    // 0 represents a white piece.
    // 1 represents a black piece.
    const board: (number | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    // Place the white rook on the board. The rook itself is a white piece.
    board[rookRow][rookCol] = WHITE;

    // Read the number of other pieces on the board
    const P: number = parseInt(readline(), 10);

    // Place the other pieces on the board
    for (let i = 0; i < P; i++) {
        const line: string[] = readline().split(' ');
        const color: number = parseInt(line[0], 10); // 0 for WHITE, 1 for BLACK
        const position: string = line[1];
        const [row, col] = algebraicToCoords(position);
        
        // Place the piece. If multiple pieces are at the same spot (invalid input),
        // the last one placed will be recorded. For this puzzle, the rook's
        // starting square being covered by another piece won't break the logic,
        // as the problem implies the first given position *is* the rook.
        board[row][col] = color;
    }

    const possibleMoves: string[] = [];

    // Define the four cardinal directions a rook can move: [delta_row, delta_column]
    const directions: [number, number][] = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    // Iterate through each possible direction
    for (const [dr, dc] of directions) {
        // Iterate outwards from the rook's current position, step by step
        // A rook can move up to BOARD_SIZE - 1 steps in any direction.
        for (let step = 1; step < BOARD_SIZE; step++) {
            const targetRow = rookRow + dr * step;
            const targetCol = rookCol + dc * step;

            // 1. Check if the target square is within the chessboard boundaries
            if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) {
                break; // If out of bounds, stop exploring further in this direction
            }

            const pieceAtTarget = board[targetRow][targetCol];
            const targetAlgebraic = coordsToAlgebraic(targetRow, targetCol);
            let moveString = `R${rookPosStr}`; // Start of the move string (e.g., "Rd5")

            if (pieceAtTarget === null) {
                // 2. The target square is empty: This is a valid non-capture move.
                moveString += `-${targetAlgebraic}`; // Add action and destination (e.g., "-d6")
                possibleMoves.push(moveString);
                // Continue to the next step in this direction
            } else if (pieceAtTarget === BLACK) {
                // 3. The target square contains an opponent (black) piece: This is a valid capture move.
                moveString += `x${targetAlgebraic}`; // Add action and destination (e.g., "xe3")
                possibleMoves.push(moveString);
                // A rook cannot move past a captured piece, so stop exploring further in this direction
                break; 
            } else if (pieceAtTarget === WHITE) {
                // 4. The target square contains an ally (white) piece: The rook is blocked.
                // It cannot move to or past an ally.
                break; // Stop exploring further in this direction
            }
        }
    }

    // Sort the collected moves lexicographically (ASCII order) as required
    possibleMoves.sort();

    // Print the sorted moves, space-separated
    console.log(possibleMoves.join(' '));
}

// Call the main solve function to execute the puzzle logic
solve();