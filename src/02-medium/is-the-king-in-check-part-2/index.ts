/**
 * Checks if a given coordinate (r, c) is within the 8x8 board boundaries.
 * @param r Row index.
 * @param c Column index.
 * @returns True if within bounds, false otherwise.
 */
function isSafe(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/**
 * Interface to represent a chess piece with its type and position.
 */
interface Piece {
    type: string;
    r: number;
    c: number;
}

/**
 * Determines if an attacker piece can attack the King, considering the other enemy piece
 * as a potential blocker.
 * @param attacker The attacking piece (type and position).
 * @param kingPos The King's position.
 * @param otherEnemyPos The position of the second enemy piece (potential blocker).
 * @param board The 8x8 chessboard represented as a 2D array of strings.
 * @returns True if the King is under attack by the attacker, false otherwise.
 */
function isAttacking(
    attacker: Piece,
    kingPos: { r: number; c: number },
    otherEnemyPos: { r: number; c: number },
    board: string[][]
): boolean {
    const attackerType = attacker.type;
    const attackerR = attacker.r;
    const attackerC = attacker.c;
    const kingR = kingPos.r;
    const kingC = kingPos.c;

    if (attackerType === 'N') {
        // Knight attacks: L-shapes, not blocked by other pieces.
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of knightMoves) {
            const targetR = attackerR + dr;
            const targetC = attackerC + dc;

            // Check if the target square is within bounds and is the King's position
            if (isSafe(targetR, targetC) && targetR === kingR && targetC === kingC) {
                return true;
            }
        }
    } else {
        // Linear pieces: Rook, Bishop, Queen. Their attacks are blocked by other pieces.
        let directions: [number, number][] = [];

        if (attackerType === 'R' || attackerType === 'Q') {
            // Rook moves: horizontal and vertical
            directions.push([0, 1], [0, -1], [1, 0], [-1, 0]); // Right, Left, Down, Up
        }
        if (attackerType === 'B' || attackerType === 'Q') {
            // Bishop moves: diagonal
            directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]); // Down-Right, Down-Left, Up-Right, Up-Left
        }

        // Iterate through each possible direction
        for (const [dr, dc] of directions) {
            let currR = attackerR + dr; // Start one step away from the attacker
            let currC = attackerC + dc;

            // Continue in this direction as long as we are within board boundaries
            while (isSafe(currR, currC)) {
                // If the current square is the King's position, the King is in check
                if (currR === kingR && currC === kingC) {
                    return true;
                }

                // If the current square is occupied by the *other* enemy piece, this line of attack is blocked.
                // Based on problem constraints ("Always three pieces on the board... one 'k' and two of B/N/R/Q."),
                // if it's not the King and not '_', it must be the other enemy piece.
                if (currR === otherEnemyPos.r && currC === otherEnemyPos.c) {
                    break; // Path blocked, move to the next direction
                }
                
                // If the square is occupied by any piece other than the King or the other enemy,
                // it would also block the path. Given the constraints, this scenario implies
                // an empty square ('_') if not 'k' or 'otherEnemyPos'.
                // So, if it's not empty, and not the king, and not the other enemy (which we check for explicitly),
                // then it must be an invalid board state for this problem, but we'd still block the path.
                if (board[currR][currC] !== '_') {
                    // This implies some unexpected third blocking piece, or the otherEnemyPos check
                    // didn't catch it for some reason. The explicit check above is more precise for this problem.
                    // This 'break' is an additional safeguard.
                    break; 
                }

                // Move to the next square in the current direction
                currR += dr;
                currC += dc;
            }
        }
    }
    return false; // No attack found for this piece
}

// --- Main Program Execution ---

// Initialize the chessboard, King's position, and a list for enemy pieces
const board: string[][] = [];
let kingPos: { r: number, c: number } | null = null;
const enemyPieces: Piece[] = [];

// Read 8 lines of input to populate the board and find piece positions
for (let r = 0; r < 8; r++) {
    // Each line is space-separated characters, so split them
    const line = readline().split(' ');
    board.push(line);

    // Iterate through the columns to identify pieces
    for (let c = 0; c < 8; c++) {
        const char = line[c];
        if (char === 'k') {
            kingPos = { r, c };
        } else if (char !== '_') {
            // Any non-underscore character that isn't 'k' is an enemy piece
            enemyPieces.push({ type: char, r, c });
        }
    }
}

// Basic validation (though constraints guarantee these conditions)
if (!kingPos) {
    // This case should ideally not be hit based on problem constraints
    // but good practice for robustness.
    throw new Error("King not found on the board.");
}
if (enemyPieces.length !== 2) {
    // This case should ideally not be hit based on problem constraints
    throw new Error(`Expected 2 enemy pieces, found ${enemyPieces.length}.`);
}

// Assign the two enemy pieces for clarity
const piece1 = enemyPieces[0];
const piece2 = enemyPieces[1];

let isKingInCheck = false;

// Check if the first enemy piece attacks the King
// The other enemy piece (piece2) acts as a potential blocker
if (isAttacking(piece1, kingPos, piece2, board)) {
    isKingInCheck = true;
}

// If the King is not yet in check, check if the second enemy piece attacks it
// The first enemy piece (piece1) acts as a potential blocker for piece2
if (!isKingInCheck) {
    if (isAttacking(piece2, kingPos, piece1, board)) {
        isKingInCheck = true;
    }
}

// Print the final result
if (isKingInCheck) {
    console.log("Check");
} else {
    console.log("No Check");
}