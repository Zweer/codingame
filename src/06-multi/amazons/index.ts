// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: string): void;
declare function console.error(message: any): void;

// Interfaces for better type safety and readability
interface Pos {
    r: number; // row index (0 to BOARD_SIZE-1)
    c: number; // column index (0 to BOARD_SIZE-1)
}

interface Move {
    from: Pos;
    to: Pos;
    wall: Pos;
}

// Global board size (always 8 for this puzzle)
let BOARD_SIZE: number;

// Helper to check if a position is on the board
function isValidPos(p: Pos, boardSize: number): boolean {
    return p.r >= 0 && p.r < boardSize && p.c >= 0 && p.c < boardSize;
}

// Converts internal {r,c} position to CodinGame string format (e.g., {r:0, c:3} -> "d8")
function posToStr(p: Pos): string {
    const colChar = String.fromCharCode('a'.charCodeAt(0) + p.c);
    const rowNum = BOARD_SIZE - p.r; // Rows are 1-8 from bottom to top, so 8-row for 0-indexed
    return `${colChar}${rowNum}`;
}

// Converts CodinGame string format to internal {r,c} position (e.g., "d8" -> {r:0, c:3})
function strToPos(s: string): Pos {
    const c = s.charCodeAt(0) - 'a'.charCodeAt(0);
    const r = BOARD_SIZE - parseInt(s[1], 10);
    return { r, c };
}

// Calculates the number of legal moves for a given player on a given board state.
// This function modifies the board temporarily and reverts changes.
function countLegalMoves(board: string[][], playerColor: string): number {
    let count = 0;
    
    const myPieces: Pos[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === playerColor) {
                myPieces.push({ r, c });
            }
        }
    }

    // All 8 possible queen movement directions
    const directions = [
        { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 },
    ];

    // Iterate through each of the player's pieces
    for (const startPos of myPieces) {
        const possibleEndPositions: Pos[] = [];

        // Find all squares the current piece can move TO
        for (const dir of directions) {
            let r_curr = startPos.r;
            let c_curr = startPos.c;
            for (let k = 1; k < BOARD_SIZE; k++) { // Max 7 steps on an 8x8 board
                r_curr += dir.dr;
                c_curr += dir.dc;

                // Check if new position is valid and empty
                if (!isValidPos({ r: r_curr, c: c_curr }, BOARD_SIZE)) break; // Out of bounds
                if (board[r_curr][c_curr] !== '.') break; // Blocked by another piece or wall

                possibleEndPositions.push({ r: r_curr, c: c_curr });
            }
        }

        // For each valid 'to' position, find all valid 'wall' placements
        for (const endPos of possibleEndPositions) {
            // Temporarily move the piece on the board to simulate the turn
            // Store original chars to revert later, ensuring board state consistency
            const originalStartChar = board[startPos.r][startPos.c]; // Should be playerColor
            const originalEndChar = board[endPos.r][endPos.c];     // Should be '.'

            board[startPos.r][startPos.c] = '.';      // Original position becomes empty
            board[endPos.r][endPos.c] = playerColor; // New position holds the piece

            // Find all squares the wall can be placed ON from the new piece position
            for (const dir of directions) {
                let r_wall_curr = endPos.r;
                let c_wall_curr = endPos.c;
                for (let k = 1; k < BOARD_SIZE; k++) { // Max 7 steps
                    r_wall_curr += dir.dr;
                    c_wall_curr += dir.dc;

                    // Check if new wall position is valid and empty
                    if (!isValidPos({ r: r_wall_curr, c: c_wall_curr }, BOARD_SIZE)) break; // Out of bounds
                    if (board[r_wall_curr][c_wall_curr] !== '.') break; // Blocked by another piece or wall

                    count++; // Valid wall placement found
                }
            }
            
            // The original start position is also a valid wall placement if it's empty (which it is)
            // This is a special rule for Amazons, "it may place a wall in the direction the piece moved from"
            // Interpreted as the original square itself is an option.
            if (board[startPos.r][startPos.c] === '.') { // Double check it's empty, though it should be.
                count++; 
            }

            // Revert board state for the next move simulation
            board[startPos.r][startPos.c] = originalStartChar;
            board[endPos.r][endPos.c] = originalEndChar;
        }
    }
    return count;
}

// Generates all legal moves for a given player on a given board state.
// This function modifies the board temporarily and reverts changes.
function getLegalMoves(board: string[][], playerColor: string): Move[] {
    const legalMoves: Move[] = [];
    
    const myPieces: Pos[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === playerColor) {
                myPieces.push({ r, c });
            }
        }
    }

    const directions = [
        { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 },
    ];

    for (const startPos of myPieces) {
        const possibleEndPositions: Pos[] = [];
        for (const dir of directions) {
            let r_curr = startPos.r;
            let c_curr = startPos.c;
            for (let k = 1; k < BOARD_SIZE; k++) { 
                r_curr += dir.dr;
                c_curr += dir.dc;
                if (!isValidPos({ r: r_curr, c: c_curr }, BOARD_SIZE)) break;
                if (board[r_curr][c_curr] !== '.') break;
                
                possibleEndPositions.push({ r: r_curr, c: c_curr });
            }
        }

        for (const endPos of possibleEndPositions) {
            const originalStartChar = board[startPos.r][startPos.c];
            const originalEndChar = board[endPos.r][endPos.c];

            board[startPos.r][startPos.c] = '.';
            board[endPos.r][endPos.c] = playerColor;

            for (const dir of directions) {
                let r_wall_curr = endPos.r;
                let c_wall_curr = endPos.c;
                for (let k = 1; k < BOARD_SIZE; k++) { 
                    r_wall_curr += dir.dr;
                    c_wall_curr += dir.dc;
                    if (!isValidPos({ r: r_wall_curr, c: c_wall_curr }, BOARD_SIZE)) break;
                    if (board[r_wall_curr][c_wall_curr] !== '.') break;

                    legalMoves.push({ from: startPos, to: endPos, wall: { r: r_wall_curr, c: c_wall_curr } });
                }
            }
            if (board[startPos.r][startPos.c] === '.') {
                legalMoves.push({ from: startPos, to: endPos, wall: startPos });
            }

            board[startPos.r][startPos.c] = originalStartChar;
            board[endPos.r][endPos.c] = originalEndChar;
        }
    }
    return legalMoves;
}

// Main game loop
function main() {
    BOARD_SIZE = parseInt(readline());
    const MY_COLOR = readline();
    const OPPONENT_COLOR = MY_COLOR === 'w' ? 'b' : 'w';

    const board: string[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push(readline().split(''));
    }

    // These inputs are read but not directly used by this simple bot's strategy.
    const lastAction = readline(); 
    const actionsCount = parseInt(readline()); 

    // Get all legal moves for the current player
    // A deep copy of the board is passed to ensure `getLegalMoves` does not modify the original
    // board state that we need for subsequent move simulations.
    const myLegalMoves = getLegalMoves(board.map(row => [...row]), MY_COLOR);

    if (myLegalMoves.length === 0) {
        // This case should ideally not be reached if the game logic is correctly followed
        // by the referee (the game ends when a player has no legal moves).
        // It's a fallback to prevent crashing.
        print("a1a2a3 msg No legal moves found, I lose!");
        return;
    }

    let bestMove: Move = myLegalMoves[0]; // Initialize with first legal move as a default
    let bestScore = -Infinity;

    // Evaluate each possible move to find the best one
    for (const myMove of myLegalMoves) {
        // Create a deep copy of the board for this specific move's simulation.
        // This ensures each evaluation starts from a clean original board state.
        const simulatedBoard = board.map(row => [...row]);

        // Apply my chosen move to the simulated board
        simulatedBoard[myMove.from.r][myMove.from.c] = '.';
        simulatedBoard[myMove.to.r][myMove.to.c] = MY_COLOR;
        simulatedBoard[myMove.wall.r][myMove.wall.c] = '-';

        // Evaluate the resulting board state using a mobility heuristic
        // This calculates the number of moves available to me and the opponent after my move.
        const myMobility = countLegalMoves(simulatedBoard, MY_COLOR);
        const opponentMobility = countLegalMoves(simulatedBoard, OPPONENT_COLOR);

        // Score: Maximize my future moves, minimize opponent's future moves
        const currentScore = myMobility - opponentMobility; 
        
        // Update best move if current move yields a higher score
        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = myMove;
        }
    }

    // Output the chosen best move in the required format
    const outputString = `${posToStr(bestMove.from)}${posToStr(bestMove.to)}${posToStr(bestMove.wall)}`;
    print(outputString);
}

// Call the main function to start the bot
main();