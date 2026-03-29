type Coords = [number, number]; // [row, col]

// Global memoization table for minimax
const memo: Map<string, number> = new Map();

// Helper functions (algebraic <-> coords)
function algebraicToCoords(s: string): Coords {
    const col = s.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = parseInt(s[1], 10) - 1;
    return [row, col];
}

function coordsToAlgebraic(coords: Coords): string {
    const [row, col] = coords;
    return String.fromCharCode('a'.charCodeAt(0) + col) + (row + 1);
}

function parseMove(s: string): [Coords, Coords] {
    return [algebraicToCoords(s.substring(0, 2)), algebraicToCoords(s.substring(2, 4))];
}

function formatMove(from: Coords, to: Coords): string {
    return coordsToAlgebraic(from) + coordsToAlgebraic(to);
}

// Board utility functions
function isOnBoard(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isSameSquare(c1: Coords, c2: Coords): boolean {
    return c1[0] === c2[0] && c1[1] === c2[1];
}

// King adjacency check (used for King moves and king attack)
function isKingAdjacent(k1: Coords, k2: Coords): boolean {
    return Math.abs(k1[0] - k2[0]) <= 1 && Math.abs(k1[1] - k2[1]) <= 1;
}

// Check if a path between two squares (straight line) is clear of obstacles.
// Assumes start and end are on the same row or column.
// occupiedSquares is an array of Coords representing all pieces on the board.
function isPathClear(start: Coords, end: Coords, occupiedSquares: Coords[]): boolean {
    const [r1, c1] = start;
    const [r2, c2] = end;

    // Filter out start and end points if they are in occupiedSquares to avoid self-blocking
    const obstacles = occupiedSquares.filter(p => !isSameSquare(p, start) && !isSameSquare(p, end));

    if (r1 === r2) { // Horizontal move
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        for (let c = minCol + 1; c < maxCol; c++) {
            if (obstacles.some(p => p[0] === r1 && p[1] === c)) {
                return false;
            }
        }
    } else if (c1 === c2) { // Vertical move
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        for (let r = minRow + 1; r < maxRow; r++) {
            if (obstacles.some(p => p[0] === r && p[1] === c1)) {
                return false;
            }
        }
    }
    // For non-straight paths or same square, path is vacuously clear (or not a rook move)
    return true;
}

// Check if a target square is attacked by White pieces (WK, WR)
function isAttackedByWhite(target: Coords, wk: Coords, wr: Coords, bk: Coords): boolean {
    // Check White King attack
    if (isKingAdjacent(target, wk)) {
        return true;
    }

    // Check White Rook attack
    // Rook attacks horizontally or vertically
    if (wr[0] === target[0]) { // Same row
        if (isPathClear(wr, target, [wk, bk])) return true;
    } else if (wr[1] === target[1]) { // Same column
        if (isPathClear(wr, target, [wk, bk])) return true;
    }
    return false;
}

// Check if a target square is attacked by Black pieces (BK only)
function isAttackedByBlack(target: Coords, wk: Coords, wr: Coords, bk: Coords): boolean {
    // Check Black King attack
    if (isKingAdjacent(target, bk)) {
        return true;
    }
    return false;
}

// Check if a specific king (white or black) is currently in check
function isInCheck(kingCoords: Coords, wk: Coords, wr: Coords, bk: Coords, isWhiteKing: boolean): boolean {
    if (isWhiteKing) {
        return isAttackedByBlack(kingCoords, wk, wr, bk);
    } else {
        return isAttackedByWhite(kingCoords, wk, wr, bk);
    }
}

// Apply a move and return the new board state
function applyMove(wk: Coords, wr: Coords, bk: Coords, move: [Coords, Coords]): [Coords, Coords, Coords] {
    const [from, to] = move;
    let newWk = wk;
    let newWr = wr;
    let newBk = bk;

    if (isSameSquare(from, wk)) {
        newWk = to;
    } else if (isSameSquare(from, wr)) {
        newWr = to;
    } else if (isSameSquare(from, bk)) {
        newBk = to;
    }
    return [newWk, newWr, newBk];
}

// Generate all legal moves for the current player
function generateLegalMoves(wk: Coords, wr: Coords, bk: Coords, isWhiteTurn: boolean): Array<[Coords, Coords]> {
    const legalMoves: Array<[Coords, Coords]> = [];
    const kingMovesOffsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    if (isWhiteTurn) {
        // White King moves
        for (const [dr, dc] of kingMovesOffsets) {
            const newR = wk[0] + dr;
            const newC = wk[1] + dc;
            const newWk: Coords = [newR, newC];

            if (!isOnBoard(newR, newC)) continue;
            if (isSameSquare(newWk, wr)) continue; // Cannot move to own rook's square
            if (isKingAdjacent(newWk, bk)) continue; // Cannot move adjacent to Black King

            // Check if this move puts White King in check
            if (!isInCheck(newWk, newWk, wr, bk, true)) {
                legalMoves.push([wk, newWk]);
            }
        }

        // White Rook moves
        const rookDirections = [
            [-1, 0], [1, 0], // Vertical
            [0, -1], [0, 1]  // Horizontal
        ];

        for (const [dr, dc] of rookDirections) {
            for (let i = 1; i < 8; i++) {
                const newR = wr[0] + dr * i;
                const newC = wr[1] + dc * i;
                const newWr: Coords = [newR, newC];

                if (!isOnBoard(newR, newC)) break;
                // Cannot move onto own King or Black King (no capture in this simplified endgame).
                if (isSameSquare(newWr, wk) || isSameSquare(newWr, bk)) {
                    break;
                }

                // Check path clearance (obstacles: WK, BK)
                if (!isPathClear(wr, newWr, [wk, bk])) {
                    break; // Path is blocked
                }

                // Check if this move puts White King in check
                if (!isInCheck(wk, wk, newWr, bk, true)) {
                    legalMoves.push([wr, newWr]);
                }
            }
        }
    } else { // Black's turn (King only)
        for (const [dr, dc] of kingMovesOffsets) {
            const newR = bk[0] + dr;
            const newC = bk[1] + dc;
            const newBk: Coords = [newR, newC];

            if (!isOnBoard(newR, newC)) continue;
            // Cannot move adjacent to White King
            if (isKingAdjacent(newBk, wk)) continue;

            // Check if this move puts Black King in check
            if (!isInCheck(newBk, wk, wr, newBk, false)) {
                legalMoves.push([bk, newBk]);
            }
        }
    }
    return legalMoves;
}

// Minimax function with alpha-beta pruning
// Returns the minimum number of White moves to checkmate Black (or Infinity if no mate)
// `currentWhiteMoves` represents the number of white moves made so far to reach this state.
function minimax(wk: Coords, wr: Coords, bk: Coords, currentWhiteMoves: number, isWhiteTurn: boolean, alpha: number, beta: number): number {
    // Transposition table lookup
    const stateKey = `${wk[0]}${wk[1]}${wr[0]}${wr[1]}${bk[0]}${bk[1]}${isWhiteTurn ? 'W' : 'B'}`;
    if (memo.has(stateKey)) {
        return memo.get(stateKey)!;
    }

    // Depth limit: Max 13 White moves.
    // If currentWhiteMoves exceeds 13, it means a mate wasn't found within the limit.
    if (currentWhiteMoves > 13) {
        return Infinity;
    }
    
    // Check game end conditions *before* generating moves for the current player
    const legalMovesForCurrentPlayer = generateLegalMoves(wk, wr, bk, isWhiteTurn);
    const currentPlayerKing = isWhiteTurn ? wk : bk;
    const inCheck = isInCheck(currentPlayerKing, wk, wr, bk, isWhiteTurn);

    if (legalMovesForCurrentPlayer.length === 0) {
        if (inCheck) {
            // Current player is checkmated. The *previous* player won.
            // If it's White's turn, White is checkmated by Black. White loses (Infinity).
            // If it's Black's turn, Black is checkmated by White. White wins (return currentWhiteMoves).
            memo.set(stateKey, isWhiteTurn ? Infinity : currentWhiteMoves);
            return isWhiteTurn ? Infinity : currentWhiteMoves;
        } else {
            // Stalemate. Draw.
            memo.set(stateKey, Infinity);
            return Infinity;
        }
    }

    if (isWhiteTurn) { // White's turn: Minimize mate depth
        let minMateDepth = Infinity;
        for (const move of legalMovesForCurrentPlayer) {
            const [newWk, newWr, newBk] = applyMove(wk, wr, bk, move);
            const score = minimax(newWk, newWr, newBk, currentWhiteMoves + 1, false, alpha, beta);
            minMateDepth = Math.min(minMateDepth, score);
            alpha = Math.max(alpha, minMateDepth);
            if (beta <= alpha) { // Alpha-beta cutoff
                break;
            }
        }
        memo.set(stateKey, minMateDepth);
        return minMateDepth;

    } else { // Black's turn: Maximize mate depth (or prolong game)
        let maxMateDepth = -Infinity;
        for (const move of legalMovesForCurrentPlayer) {
            const [newWk, newWr, newBk] = applyMove(wk, wr, bk, move);
            // Black's move, currentWhiteMoves does not increment
            const score = minimax(newWk, newWr, newBk, currentWhiteMoves, true, alpha, beta);
            maxMateDepth = Math.max(maxMateDepth, score);
            beta = Math.min(beta, maxMateDepth); // Beta is for the maximizing player
            if (beta <= alpha) { // Alpha-beta cutoff
                break;
            }
        }
        memo.set(stateKey, maxMateDepth);
        return maxMateDepth;
    }
}

// Main function to find the best move for White
function findBestWhiteMove(wk: Coords, wr: Coords, bk: Coords): string {
    memo.clear(); // Clear memoization table for each new turn

    let bestMove: [Coords, Coords] | null = null;
    let minOverallMateDepth = Infinity;

    const whiteLegalMoves = generateLegalMoves(wk, wr, bk, true);

    // If no legal moves for white, it's either checkmate or stalemate already.
    // Given puzzle constraints, a mate should always be possible.
    if (whiteLegalMoves.length === 0) {
        if (isInCheck(wk, wk, wr, bk, true)) {
            return "White is checkmated. No legal moves."; // Should not happen for White's turn
        } else {
            return "White is stalemated. No legal moves."; // Should not happen for White's turn
        }
    }

    for (const move of whiteLegalMoves) {
        const [newWk, newWr, newBk] = applyMove(wk, wr, bk, move);
        
        // After White's move, it's Black's turn. We pass currentWhiteMoves as 1 for the first white move.
        const mateDepth = minimax(newWk, newWr, newBk, 1, false, -Infinity, Infinity);
        
        if (mateDepth < minOverallMateDepth) {
            minOverallMateDepth = mateDepth;
            bestMove = move;
        }
    }

    if (bestMove) {
        return formatMove(bestMove[0], bestMove[1]);
    } else {
        // This case should ideally not be reached if a mate is always possible within 13 moves.
        // It implies either an unsolvable position or a bug.
        return "No optimal mate move found."; 
    }
}

// Readline function is provided by CodinGame environment
declare function readline(): string;

let whiteKingPos: Coords;
let whiteRookPos: Coords;
let blackKingPos: Coords;

// Initial input
const initialInput = readline().split(' ');
whiteKingPos = algebraicToCoords(initialInput[0]);
whiteRookPos = algebraicToCoords(initialInput[1]);
blackKingPos = algebraicToCoords(initialInput[2]);

// Game loop
while (true) {
    const opponentMove = readline();

    if (opponentMove !== "NA") { // "NA" means it's the first turn, no opponent move yet
        // Apply opponent's move (Black King move)
        const [from, to] = parseMove(opponentMove);
        // Assuming opponent only moves their Black King
        if (isSameSquare(from, blackKingPos)) {
            blackKingPos = to;
        }
        // No other pieces for black, so no need to check for rook move
    }

    const myMove = findBestWhiteMove(whiteKingPos, whiteRookPos, blackKingPos);
    console.log(myMove);

    // Update board for next turn based on *my* move
    const [fromMyMove, toMyMove] = parseMove(myMove);
    if (isSameSquare(fromMyMove, whiteKingPos)) {
        whiteKingPos = toMyMove;
    } else if (isSameSquare(fromMyMove, whiteRookPos)) {
        whiteRookPos = toMyMove;
    }
    // Black King position is updated by opponentMove input at the start of the loop
}