// No imports needed for CodinGame environment

/**
 * Type definition for the game board, represented as a 2D array of numbers.
 * 0: empty, 1: white marble, 2: black marble.
 */
type Board = number[][];

/**
 * Type definition for a cell on the board, with row (r) and column (c) coordinates.
 */
type Cell = { r: number; c: number };

/**
 * Type definition for a player's move.
 * r1, c1: Row and column of the first marble in the selected group.
 * r2, c2: Row and column of the last marble in the selected group.
 * dir: The direction of the move (0-5).
 */
type Move = { r1: number; c1: number; r2: number; c2: number; dir: number };

// Board dimensions and column ranges for validity checks.
// The board is a jagged array, representing an "odd-r horizontal" hexagonal grid.
const BOARD_ROWS = 9;
// Minimum valid column index for each row.
const BOARD_MIN_COLS = [0, 0, 0, 0, 0, 1, 2, 3, 4];
// Maximum valid column index for each row.
const BOARD_MAX_COLS = [4, 5, 6, 7, 8, 8, 8, 8, 8];

/**
 * Checks if a cell (r, c) is within the valid board boundaries.
 * @param r The row index.
 * @param c The column index.
 * @returns True if the cell is valid, false otherwise.
 */
function isValid(r: number, c: number): boolean {
    return r >= 0 && r < BOARD_ROWS && c >= BOARD_MIN_COLS[r] && c <= BOARD_MAX_COLS[r];
}

// Delta Row (DR) and Delta Column (DC) arrays for "odd-r" horizontal offset coordinates.
// These arrays map CodinGame's direction labels (0-5) to coordinate changes (dr, dc).
// The inner arrays [even_row_delta, odd_row_delta] specify the deltas based on row parity.

// DR_ODD_R[direction][row_parity]
const DR_ODD_R = [
    [-1, -1], // 0: NE (Up-right)
    [0, 0],   // 1: E (Right)
    [1, 1],   // 2: SE (Down-right)
    [1, 1],   // 3: SW (Down-left)
    [0, 0],   // 4: W (Left)
    [-1, -1]  // 5: NW (Up-left)
];
// DC_ODD_R[direction][row_parity]
const DC_ODD_R = [
    [0, 1],   // 0: NE (Up-right)
    [1, 1],   // 1: E (Right)
    [0, 1],   // 2: SE (Down-right)
    [-1, 0],  // 3: SW (Down-left)
    [-1, -1], // 4: W (Left)
    [-1, 0]   // 5: NW (Up-left)
];

/**
 * Returns the neighbor cell in a given direction, or null if the neighbor is off-board.
 * @param r The current row index.
 * @param c The current column index.
 * @param dir The direction (0-5).
 * @returns The neighbor cell as { r: number, c: number } or null.
 */
function getNeighbor(r: number, c: number, dir: number): Cell | null {
    const parity = r % 2; // 0 for even rows, 1 for odd rows
    const newR = r + DR_ODD_R[dir][parity];
    const newC = c + DC_ODD_R[dir][parity];
    if (isValid(newR, newC)) {
        return { r: newR, c: newC };
    }
    return null;
}

/**
 * Returns the opposite direction of a given direction (e.g., 0 becomes 3, 1 becomes 4).
 * @param dir The original direction (0-5).
 * @returns The opposite direction.
 */
function getOppositeDirection(dir: number): number {
    return (dir + 3) % 6;
}

/**
 * Given two adjacent cells, returns the direction from `fromCell` to `toCell`.
 * Assumes `toCell` is a direct neighbor of `fromCell`.
 * @param fromCell The starting cell.
 * @param toCell The target cell.
 * @returns The direction (0-5) or -1 if they are not direct neighbors.
 */
function getDirection(fromCell: Cell, toCell: Cell): number {
    for (let dir = 0; dir < 6; dir++) {
        const neighbor = getNeighbor(fromCell.r, fromCell.c, dir);
        if (neighbor && neighbor.r === toCell.r && neighbor.c === toCell.c) {
            return dir;
        }
    }
    return -1; // Should not happen for valid adjacent cells
}

/**
 * Simulates a given move on the board and returns the new board state
 * and the number of opponent marbles pushed off the board.
 * This function assumes that the input `move` is legal, as it comes from the game engine.
 * @param currentBoard The current state of the game board.
 * @param move The move to simulate.
 * @param playerColor The color of the player making the move (1 for white, 2 for black).
 * @returns An object containing the new board state and the count of pushed opponent marbles.
 */
function simulateMove(currentBoard: Board, move: Move, playerColor: number): { newBoard: Board; pushedCount: number } {
    // Create a deep copy of the board to avoid modifying the original state.
    const newBoard: Board = currentBoard.map(row => [...row]);
    let pushedCount = 0; // Counter for opponent marbles pushed off board.
    const opponentColor = 3 - playerColor; // Determine opponent's color.

    // 1. Determine the exact marbles selected for the move.
    const marblesInLine: Cell[] = [];
    const startCell: Cell = { r: move.r1, c: move.c1 };
    const endCell: Cell = { r: move.r2, c: move.c2 };

    if (startCell.r === endCell.r && startCell.c === endCell.c) {
        // If start and end cells are the same, it's a single marble move.
        marblesInLine.push(startCell);
    } else {
        // For multiple marbles, reconstruct the line by stepping from start to end.
        const lineDir = getDirection(startCell, endCell); // Direction that defines the line of marbles.
        let current: Cell | null = startCell;
        while (current && (current.r !== endCell.r || current.c !== endCell.c)) {
            marblesInLine.push(current);
            current = getNeighbor(current.r, current.c, lineDir)!; // Guaranteed valid as it's part of the line.
        }
        marblesInLine.push(endCell); // Add the end marble.
    }
    const numMarbles = marblesInLine.length;

    // 2. Determine if it's an "in-line" move or a "side-step" move.
    // An in-line move requires more than one marble and the move direction must be parallel
    // to the line of marbles.
    let lineDirectionOfMarbles = -1;
    if (numMarbles > 1) {
        lineDirectionOfMarbles = getDirection(marblesInLine[0], marblesInLine[1]);
    }
    const isInlineMove = numMarbles > 1 && (move.dir === lineDirectionOfMarbles || move.dir === getOppositeDirection(lineDirectionOfMarbles));

    if (isInlineMove) {
        // Logic for in-line moves (which can include Sumito).
        let firstPushTarget: Cell | null;

        // Determine which marble is at the "front" of the push.
        if (move.dir === lineDirectionOfMarbles) {
            // Moving "forward" (in the same direction as the line of marbles).
            firstPushTarget = getNeighbor(marblesInLine[numMarbles - 1].r, marblesInLine[numMarbles - 1].c, move.dir);
        } else {
            // Moving "backward" (in the opposite direction of the line of marbles).
            firstPushTarget = getNeighbor(marblesInLine[0].r, marblesInLine[0].c, move.dir);
        }

        const pushedOpponentMarbles: Cell[] = [];
        let currentCheck = firstPushTarget;

        // Identify all consecutive opponent marbles that would be pushed.
        while (currentCheck && newBoard[currentCheck.r][currentCheck.c] === opponentColor) {
            pushedOpponentMarbles.push(currentCheck);
            currentCheck = getNeighbor(currentCheck.r, currentCheck.c, move.dir);
        }

        const numOpponentsPushed = pushedOpponentMarbles.length;

        // Apply pushes if Sumito conditions are met (guaranteed by legalActions).
        if (numOpponentsPushed > 0) {
            // Move opponent marbles starting from the one farthest from the pushing player marbles
            // to avoid overwriting marbles before they are moved.
            for (let i = numOpponentsPushed - 1; i >= 0; i--) {
                const marble = pushedOpponentMarbles[i];
                const nextCell = getNeighbor(marble.r, marble.c, move.dir);
                if (nextCell) {
                    newBoard[nextCell.r][nextCell.c] = newBoard[marble.r][marble.c];
                } else {
                    // Marble pushed off the board.
                    pushedCount++;
                }
                newBoard[marble.r][marble.c] = 0; // Clear the original position of the opponent marble.
            }
        }
        
        // Move player marbles.
        // The order of moving player marbles also matters to avoid overwriting.
        if (move.dir === lineDirectionOfMarbles) {
            // Forward push: move from the last marble in line to the first.
            for (let i = numMarbles - 1; i >= 0; i--) {
                const marble = marblesInLine[i];
                const nextCell = getNeighbor(marble.r, marble.c, move.dir)!; // Player marbles never pushed off.
                newBoard[nextCell.r][nextCell.c] = newBoard[marble.r][marble.c];
                newBoard[marble.r][marble.c] = 0; // Clear original position.
            }
        } else {
            // Backward push: move from the first marble in line to the last.
            for (let i = 0; i < numMarbles; i++) {
                const marble = marblesInLine[i];
                const nextCell = getNeighbor(marble.r, marble.c, move.dir)!; // Player marbles never pushed off.
                newBoard[nextCell.r][nextCell.c] = newBoard[marble.r][marble.c];
                newBoard[marble.r][marble.c] = 0; // Clear original position.
            }
        }

    } else {
        // Logic for side-step moves.
        // For side-step moves, all target cells are guaranteed to be empty by game rules
        // (as the move is given as legal by the engine).
        for (const marble of marblesInLine) {
            const target = getNeighbor(marble.r, marble.c, move.dir)!; // Target cell exists and is empty.
            newBoard[target.r][target.c] = newBoard[marble.r][marble.c];
            newBoard[marble.r][marble.c] = 0; // Clear original position.
        }
    }

    return { newBoard, pushedCount };
}

// Main game loop logic.
function main() {
    let myId: number; // Stores player ID (1: white, 2: black).

    // Read initial input: player ID.
    myId = parseInt(readline());

    // Continuous game loop for each turn.
    while (true) {
        // Read current scores.
        const inputs = readline().split(' ').map(Number);
        // const myScore = inputs[0]; // Not used in this simple AI.
        // const opponentScore = inputs[1]; // Not used in this simple AI.

        // Read the current board state.
        const board: Board = [];
        for (let i = 0; i < BOARD_ROWS; i++) {
            board.push(readline().split('').map(Number));
        }

        // Read opponent's last move. This AI does not use this information.
        readline(); // Consume the line.

        // Read the number of legal actions and the actions themselves.
        const legalActionsCount = parseInt(readline());
        const legalActions: Move[] = [];
        for (let i = 0; i < legalActionsCount; i++) {
            const actionInputs = readline().split(' ').map(Number);
            legalActions.push({
                r1: actionInputs[0],
                c1: actionInputs[1],
                r2: actionInputs[2],
                c2: actionInputs[3],
                dir: actionInputs[4]
            });
        }

        let bestMove: Move | null = null;
        let maxPushed = -1; // Initialize with -1 to ensure any push (0 or more) is prioritized.

        // Simple AI strategy: Iterate through all legal moves and pick the one
        // that results in pushing the maximum number of opponent marbles off the board.
        for (const move of legalActions) {
            // Simulate the move to get the number of pushed marbles.
            // Note: `newBoard` is returned by simulateMove but not used by this simple AI for evaluation.
            const { pushedCount } = simulateMove(board, move, myId);
            
            // If this move pushes more marbles than previous best, update bestMove.
            if (pushedCount > maxPushed) {
                maxPushed = pushedCount;
                bestMove = move;
            }
        }

        // Fallback: If no moves push any marbles, or if there's no bestMove yet (e.g., if legalActions was empty),
        // choose the first legal action available. The game constraints imply legalActions.length will be > 0
        // if the game is still active.
        if (!bestMove && legalActions.length > 0) {
            bestMove = legalActions[0];
        } else if (!bestMove) {
            // This case should ideally not be reached in a valid game turn as per problem constraints.
            // If it occurs, it means no legal moves were provided, perhaps indicating game end or an error.
            // Print a dummy move to avoid crashing the program, though it might be invalid.
            print("-1 -1 -1 -1 -1"); 
            continue; // Continue to next turn.
        }

        // Output the chosen move in the required format.
        print(`${bestMove.r1} ${bestMove.c1} ${bestMove.r2} ${bestMove.c2} ${bestMove.dir}`);
    }
}

// Call the main function to start the game loop.
main();