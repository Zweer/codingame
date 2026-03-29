/**
 * Global constants for board dimensions.
 */
const ROWS = 7;
const COLS = 9;

/**
 * Type alias for representing a chip on the board:
 * '0' for player 0, '1' for player 1, '.' for empty.
 */
type PlayerChip = '0' | '1' | '.';

/**
 * Global variables to store player IDs.
 */
let myId: string; // '0' or '1'
let oppId: string; // '0' or '1'

/**
 * Creates a deep copy of the game board.
 * This is crucial for simulating moves without altering the original board state.
 * @param board The current game board (2D array of PlayerChip).
 * @returns A new 2D array representing the copied board.
 */
function copyBoard(board: PlayerChip[][]): PlayerChip[][] {
    return board.map(row => [...row]);
}

/**
 * Simulates dropping a chip into a specified column.
 * The chip falls to the lowest available position in that column.
 * @param board The board on which to drop the chip (a mutable copy).
 * @param col The column index (0-8) where the chip is to be dropped.
 * @param player The ID of the player whose chip is being dropped ('0' or '1').
 * @returns An array [row, col] indicating where the chip landed, or null if the move is invalid (column full or out of bounds).
 */
function dropChip(board: PlayerChip[][], col: number, player: PlayerChip): [number, number] | null {
    // Check if the column is out of bounds or already full (top cell is not empty)
    if (col < 0 || col >= COLS || board[0][col] !== '.') {
        return null;
    }

    // Iterate from the bottom row upwards to find the first empty cell
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === '.') {
            board[r][col] = player; // Place the chip
            return [r, col]; // Return the landing position
        }
    }
    // This return should theoretically not be reached if board[0][col] was initially '.',
    // as there must be an empty spot if the column isn't full.
    return null; 
}

/**
 * Checks if a player has achieved a 4-in-a-row victory condition.
 * This function is optimized to check only around the last placed chip (r, c).
 * @param board The current game board.
 * @param player The ID of the player to check for a win ('0' or '1').
 * @param r The row of the last placed chip.
 * @param c The column of the last placed chip.
 * @returns True if the player has 4 consecutive chips, false otherwise.
 */
function checkWin(board: PlayerChip[][], player: PlayerChip, r: number, c: number): boolean {
    // Helper to check a line of cells
    const checkLine = (deltaR: number, deltaC: number): boolean => {
        let count = 0;
        // Iterate up to 3 positions away in both directions from the (r, c) chip
        // This ensures checking all 4-in-a-row possibilities passing through (r, c)
        for (let i = -3; i <= 3; i++) {
            const curR = r + i * deltaR;
            const curC = c + i * deltaC;

            // Check if the current position is within board boundaries
            if (curR >= 0 && curR < ROWS && curC >= 0 && curC < COLS && board[curR][curC] === player) {
                count++;
                if (count >= 4) {
                    return true; // Found 4 in a row
                }
            } else {
                count = 0; // Reset count if an opponent chip or empty cell is encountered
            }
        }
        return false;
    };

    // Check all four directions:
    // 1. Horizontal (deltaR=0, deltaC=1)
    if (checkLine(0, 1)) return true;
    // 2. Vertical (deltaR=1, deltaC=0)
    if (checkLine(1, 0)) return true;
    // 3. Diagonal (top-left to bottom-right, deltaR=1, deltaC=1)
    if (checkLine(1, 1)) return true;
    // 4. Diagonal (top-right to bottom-left, deltaR=1, deltaC=-1)
    if (checkLine(1, -1)) return true;

    return false;
}

// --- Main Program Logic ---

// Read initial input: myId and oppId
const initLine = readline().split(' ');
myId = initLine[0];
oppId = initLine[1];

// Game loop: runs for each turn
while (true) {
    // Read turn-specific input
    const turnIndex = parseInt(readline());
    const board: PlayerChip[][] = [];
    for (let i = 0; i < ROWS; i++) {
        board.push(readline().split('') as PlayerChip[]);
    }
    const numValidActions = parseInt(readline()); // Number of valid actions available
    const validActions: number[] = []; // List of valid column indices or -2 for STEAL
    for (let i = 0; i < numValidActions; i++) {
        validActions.push(parseInt(readline()));
    }
    const oppPreviousAction = parseInt(readline()); // Opponent's last move (not strictly used in this bot)

    let bestMove: number | string = -1; // Variable to store the chosen move

    // 1. STEAL Logic (for the second player on their first turn)
    // If I am player 1 (second player) and it's my first turn, and STEAL is an option, take it.
    if (myId === '1' && turnIndex === 1 && validActions.includes(-2)) {
        bestMove = -2; // Output -2 for STEAL
    }

    // Filter out STEAL from the valid actions to only consider column drops for other logic
    const validColumnActions = validActions.filter(c => c !== -2);

    // Only proceed with column-dropping logic if STEAL wasn't chosen
    if (bestMove === -1) {
        // 2. Check for immediate winning move
        for (const col of validColumnActions) {
            const nextBoard = copyBoard(board);
            const landing = dropChip(nextBoard, col, myId); // Simulate my chip drop
            if (landing && checkWin(nextBoard, myId, landing[0], landing[1])) {
                bestMove = col; // Found a winning move, take it!
                break;
            }
        }
    }

    // 3. Check for immediate opponent winning move and block it
    if (bestMove === -1) {
        for (const col of validColumnActions) {
            const nextBoard = copyBoard(board);
            // Simulate opponent dropping a chip in this column
            // We check if this *would* allow the opponent to win if we don't play there.
            const landing = dropChip(nextBoard, col, oppId); 
            if (landing && checkWin(nextBoard, oppId, landing[0], landing[1])) {
                bestMove = col; // This column blocks opponent's win, so I play here
                break;
            }
        }
    }

    // 4. Evaluate other moves using a simple heuristic (prefer central, avoid direct opponent wins)
    if (bestMove === -1) {
        let bestScore = -Infinity; // Initialize with a very low score
        let candidateMoves: number[] = []; // Store moves with the current best score

        for (const col of validColumnActions) {
            const nextBoard = copyBoard(board);
            const landing = dropChip(nextBoard, col, myId); // Simulate my potential move

            if (landing) { // If the simulated move is valid
                let currentMoveScore = 0;

                // Heuristic: Prefer central columns
                // Column 4 (center) gets highest score (10), decreasing outwards.
                currentMoveScore += 10 - Math.abs(col - Math.floor(COLS / 2));

                // Check if this move allows the opponent to win in their *very next* turn
                // This is a 1-ply lookahead to avoid "suicide" moves.
                let opponentCanForceWin = false;
                // Iterate through all possible columns (0-8) for the opponent's next move
                // on the board state AFTER my proposed move.
                for (let oppPossibleCol = 0; oppPossibleCol < COLS; oppPossibleCol++) {
                    const oppNextBoard = copyBoard(nextBoard); // Copy the board state after my proposed move
                    const oppLanding = dropChip(oppNextBoard, oppPossibleCol, oppId); // Simulate opponent's response

                    if (oppLanding && checkWin(oppNextBoard, oppId, oppLanding[0], oppLanding[1])) {
                        opponentCanForceWin = true; // Opponent has a winning move after my move
                        break; // No need to check other opponent moves for this column
                    }
                }

                if (opponentCanForceWin) {
                    // This move is highly undesirable, penalize it heavily.
                    currentMoveScore = -99999; 
                }

                // Update best score and candidate moves
                if (currentMoveScore > bestScore) {
                    bestScore = currentMoveScore;
                    candidateMoves = [col]; // New best score, reset candidates
                } else if (currentMoveScore === bestScore) {
                    candidateMoves.push(col); // Add to candidates if score is equal
                }
            }
        }

        // Choose a move from the best-scored candidates (randomly if multiple)
        if (candidateMoves.length > 0) {
            bestMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
        } else {
            // Fallback: This case should ideally not be reached if numValidActions > 0 and no logical errors.
            // It means all valid moves led to a massive negative score (opponent forced win).
            // As a last resort, pick the first available column.
            bestMove = validColumnActions[0] !== undefined ? validColumnActions[0] : 0; // Default to column 0 if no valid actions for some reason
        }
    }

    // Output the chosen move to standard output
    console.log(bestMove);
}