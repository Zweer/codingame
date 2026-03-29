/**
 * Global board state.
 * 0: Empty
 * 1: My mark (arbitrary, 'X' for example)
 * 2: Opponent's mark (arbitrary, 'O' for example)
 */
let board: number[][] = Array(3).fill(null).map(() => Array(3).fill(0));

/**
 * Checks if a player has won on the given board.
 * A player wins if they have three of their marks in a row, column, or diagonal.
 * @param currentBoard The 3x3 game board state.
 * @param player The player (1 for me, 2 for opponent) to check for a win.
 * @returns True if the player has won, false otherwise.
 */
function checkWin(currentBoard: number[][], player: number): boolean {
    // Check rows
    for (let r = 0; r < 3; r++) {
        if (currentBoard[r][0] === player && currentBoard[r][1] === player && currentBoard[r][2] === player) {
            return true;
        }
    }
    // Check columns
    for (let c = 0; c < 3; c++) {
        if (currentBoard[0][c] === player && currentBoard[1][c] === player && currentBoard[2][c] === player) {
            return true;
        }
    }
    // Check diagonals
    if (currentBoard[0][0] === player && currentBoard[1][1] === player && currentBoard[2][2] === player) {
        return true;
    }
    if (currentBoard[0][2] === player && currentBoard[1][1] === player && currentBoard[2][0] === player) {
        return true;
    }
    return false;
}

// Main game loop
while (true) {
    // Read opponent's last action
    // opponentRow and opponentCol are -1 -1 on the first turn.
    const [opponentRow, opponentCol] = readline().split(' ').map(Number);

    // Update the board with the opponent's move if it's not the first turn
    if (opponentRow !== -1 && opponentCol !== -1) {
        board[opponentRow][opponentCol] = 2; // Mark opponent's cell
    }

    // Read the number of valid actions for this turn
    const validActionCount: number = parseInt(readline());
    const validActions: { row: number, col: number }[] = [];
    for (let i = 0; i < validActionCount; i++) {
        const [row, col] = readline().split(' ').map(Number);
        validActions.push({ row, col });
    }

    let bestMove: { row: number, col: number } | null = null;

    // --- Decision Logic ---

    // 1. Check for immediate winning moves for myself
    for (const action of validActions) {
        // Temporarily place my mark on a copy of the board to check for a win
        board[action.row][action.col] = 1;
        if (checkWin(board, 1)) {
            bestMove = action;
            // No need to undo here, as this will be the chosen move
            break;
        }
        // If not a winning move, undo the temporary placement
        board[action.row][action.col] = 0;
    }

    // If a winning move is found, use it and proceed to output
    if (bestMove) {
        console.log(`${bestMove.row} ${bestMove.col}`);
        continue; // Go to the next turn
    }

    // 2. Check for immediate blocking moves (opponent's winning moves)
    for (const action of validActions) {
        // Temporarily place opponent's mark on a copy of the board to check if they would win
        board[action.row][action.col] = 2;
        if (checkWin(board, 2)) {
            bestMove = action;
            // No need to undo here, as this will be the chosen move (I will place my mark here)
            break;
        }
        // If not a blocking move, undo the temporary placement
        board[action.row][action.col] = 0;
    }

    // If a blocking move is found, use it and proceed to output
    if (bestMove) {
        // The move was found by temporarily placing opponent's mark,
        // but I will actually place my mark there.
        board[bestMove.row][bestMove.col] = 1; 
        console.log(`${bestMove.row} ${bestMove.col}`);
        continue; // Go to the next turn
    }

    // 3. Strategic moves (if no immediate win or block is possible)
    // Prioritized list of cells: Center > Corners > Edges
    const prioritizedCells: { row: number, col: number }[] = [
        { row: 1, col: 1 }, // Center
        { row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }, // Corners
        { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 1 }  // Edges
    ];

    for (const cell of prioritizedCells) {
        // Find if this prioritized cell is among the currently valid actions
        const foundValid = validActions.find(action => action.row === cell.row && action.col === cell.col);
        if (foundValid) {
            bestMove = foundValid;
            break; // Found the highest priority valid strategic move
        }
    }

    // Fallback: If for some reason `bestMove` is still null (e.g., all strategic positions are taken,
    // or if the `prioritizedCells` list didn't cover an edge case),
    // pick the first available valid action. This ensures a move is always made if allowed.
    if (!bestMove && validActionCount > 0) {
        bestMove = validActions[0];
    }
    
    // Apply the chosen move permanently and output
    if (bestMove) {
        board[bestMove.row][bestMove.col] = 1; // Mark my chosen cell
        console.log(`${bestMove.row} ${bestMove.col}`);
    }
    // If bestMove is null here, it implies validActionCount was 0, meaning the game has ended
    // (either won/drawn by a previous turn). No output is expected in this scenario,
    // and the game loop will terminate as there's no more input.
}