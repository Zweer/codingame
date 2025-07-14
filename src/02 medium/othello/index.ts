// In a CodinGame environment, readline() and print() (or console.log()) are typically pre-defined.
// These 'declare' statements are for local TypeScript compilation and type checking.
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the Othello puzzle.
 */
function solveOthelloPuzzle() {
    // 1. Input Reading: Read the 8x8 board
    const board: string[][] = [];
    for (let i = 0; i < 8; i++) {
        const line = readline();
        board.push(line.split(''));
    }

    // Read the move line (e.g., "B c4")
    const moveLineParts = readline().split(' ');
    const playerColor = moveLineParts[0];
    const opponentColor = playerColor === 'B' ? 'W' : 'B';
    const moveStr = moveLineParts[1];

    // 2. Parse Move Coordinates from chess-like notation (e.g., "c4" -> { r: 3, c: 2 })
    const colChar = moveStr[0];
    const rowNum = parseInt(moveStr[1]);

    const moveC = colChar.charCodeAt(0) - 'a'.charCodeAt(0); // 'a' is col 0, 'b' is col 1, etc.
    const moveR = rowNum - 1;                               // '1' is row 0, '2' is row 1, etc.

    // 3. Initial Validation: Is the cell already occupied?
    if (board[moveR][moveC] !== '-') {
        console.log('NOPE');
        return; // Exit if the cell is already filled
    }

    // 4. Check for Sandwiches and collect tokens to flip
    // Directions for checking (dr, dc): [row_change, col_change]
    const directions = [
        [-1, 0], [1, 0],   // Vertical: Up, Down
        [0, -1], [0, 1],   // Horizontal: Left, Right
        [-1, -1], [-1, 1], // Diagonals: Up-Left, Up-Right
        [1, -1], [1, 1]    // Diagonals: Down-Left, Down-Right
    ];

    let tokensToFlip: { r: number, c: number }[] = [];
    let isLegalMove = false; // Flag to determine if at least one sandwich is formed

    // Iterate through all 8 directions
    for (const [dr, dc] of directions) {
        let currentR = moveR + dr;
        let currentC = moveC + dc;
        const currentDirectionFlipped: { r: number, c: number }[] = []; // Tokens to flip in this specific direction

        // Traverse in the current direction as long as we are within board bounds
        while (currentR >= 0 && currentR < 8 && currentC >= 0 && currentC < 8) {
            const cellContent = board[currentR][currentC];

            if (cellContent === opponentColor) {
                // Found an opponent's token, potentially part of a sandwich. Add it to temp list.
                currentDirectionFlipped.push({ r: currentR, c: currentC });
            } else if (cellContent === playerColor) {
                // Found player's own token. Check if a sandwich was formed.
                if (currentDirectionFlipped.length > 0) {
                    // A sandwich is formed! Add all collected opponent tokens to the global flip list.
                    tokensToFlip.push(...currentDirectionFlipped);
                    isLegalMove = true; // The move is legal because at least one sandwich was found.
                }
                break; // Stop traversing in this direction (either sandwich found or path blocked by own piece).
            } else if (cellContent === '-') {
                // Found an empty cell. No sandwich possible in this direction.
                break; // Stop traversing in this direction.
            }
            
            // Move to the next cell in the current direction
            currentR += dr;
            currentC += dc;
        }
    }

    // 5. Output based on legality
    if (!isLegalMove) {
        console.log('NULL'); // No sandwich was formed in any direction
    } else {
        // The move is legal. Apply changes to a new board for final counting.
        const newBoard = board.map(row => [...row]); // Create a deep copy of the board

        // Place the new token
        newBoard[moveR][moveC] = playerColor; 

        // Flip the captured opponent tokens
        for (const { r, c } of tokensToFlip) {
            newBoard[r][c] = playerColor;
        }

        // Count 'W' and 'B' tokens on the final board
        let countW = 0;
        let countB = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (newBoard[r][c] === 'W') {
                    countW++;
                } else if (newBoard[r][c] === 'B') {
                    countB++;
                }
            }
        }
        console.log(`${countW} ${countB}`);
    }
}

// Call the main function to solve the puzzle
solveOthelloPuzzle();