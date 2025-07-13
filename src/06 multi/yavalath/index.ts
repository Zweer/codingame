declare function readline(): string;
declare function print(message: string): void;

// Score values for minimax
const WIN_SCORE = 1000000; // Large value to ensure wins/losses are always prioritized
const LOSE_SCORE = -WIN_SCORE;

class Board {
    private grid: number[][]; // 0: empty, 1: player 0's piece, 2: player 1's piece
    private readonly min_x_per_y = [0, 0, 0, 0, 0, 1, 2, 3];
    private readonly max_x_per_y = [7, 8, 9, 9, 9, 9, 9, 9];
    public readonly rows: number = 8; // Y coordinates from 0 to 7
    public readonly cols: number = 10; // X coordinates from 0 to 9 (max X is 9)

    constructor(initialGridStrings: string[]) {
        // Initialize an 8x10 grid with 0s (empty)
        this.grid = new Array(this.rows).fill(null).map(() => new Array(this.cols).fill(0));

        // Populate the grid based on input strings
        for (let y = 0; y < this.rows; y++) {
            const rowString = initialGridStrings[y];
            for (let x = 0; x < this.cols; x++) {
                // Parse integer value for cells within the string's length
                // The input strings might be shorter than `this.cols` for rows with fewer cells
                // or padded with '0's for non-hex cells.
                // Assuming consistent string length for all rows (10 chars), or parsing up to string length.
                if (x < rowString.length) {
                    this.grid[y][x] = parseInt(rowString[x], 10);
                }
            }
        }
    }

    // Helper to get my piece value based on myId (0 or 1)
    public getMyPiece(myId: number): number {
        return myId === 0 ? 1 : 2;
    }

    // Helper to get opponent's piece value based on myId
    public getOpponentPiece(myId: number): number {
        return myId === 0 ? 2 : 1;
    }

    public isValidCoordinate(x: number, y: number): boolean {
        if (y < 0 || y >= this.rows) return false;
        if (x < this.min_x_per_y[y] || x > this.max_x_per_y[y]) return false;
        return true;
    }

    public getCell(x: number, y: number): number {
        if (!this.isValidCoordinate(x, y)) {
            return 0; // Treat out-of-bounds as empty
        }
        return this.grid[y][x];
    }

    public setCell(x: number, y: number, value: number): void {
        if (!this.isValidCoordinate(x, y)) {
            // Should not happen for valid moves during game play, but a safeguard
            return;
        }
        this.grid[y][x] = value;
    }

    // Creates a deep copy of the board for minimax exploration
    public clone(): Board {
        const newBoard = new Board([]); // Create an empty board instance
        newBoard.grid = this.grid.map(row => [...row]); // Deep copy the grid state
        return newBoard;
    }

    // Directions for checking lines (dx, dy)
    // These represent the 4 axes in a hexagonal grid based on the given coordinate system
    private readonly directions = [
        { dx: 1, dy: 0 },   // Horizontal: (x,y) to (x+k,y)
        { dx: 0, dy: 1 },   // Vertical: (x,y) to (x,y+k)
        { dx: 1, dy: 1 },   // Diagonal: (x,y) to (x+k,y+k) (top-left to bottom-right)
        { dx: 1, dy: -1 }   // Diagonal: (x,y) to (x+k,y-k) (bottom-left to top-right)
    ];

    // Helper to count consecutive pieces of `playerColor` starting from `startX, startY`
    // in the given `dx, dy` direction.
    private countConsecutive(startX: number, startY: number, playerColor: number, dx: number, dy: number): number {
        let count = 0;
        let x = startX;
        let y = startY;
        while (this.isValidCoordinate(x, y) && this.getCell(x, y) === playerColor) {
            count++;
            x += dx;
            y += dy;
        }
        return count;
    }

    // Checks for a win (4-in-a-row) or loss (3-in-a-row) for `playerColor`
    // after a piece is placed at `(x,y)`.
    // Returns an object indicating status: { isWin: boolean, isLoss: boolean }.
    // Rule: If both a 4-line and a 3-line are formed, the 4-line takes precedence (player wins).
    public checkWinLoss(x: number, y: number, playerColor: number): { isWin: boolean, isLoss: boolean } {
        let makesThree = false;
        let makesFour = false;

        // Iterate through all 4 possible line axes
        for (const dir of this.directions) {
            // Count pieces in one direction from (x,y) (including (x,y) itself)
            const count1 = this.countConsecutive(x, y, playerColor, dir.dx, dir.dy);
            // Count pieces in the opposite direction from (x,y)'s adjacent cell (to avoid double-counting (x,y))
            const count2 = this.countConsecutive(x - dir.dx, y - dir.dy, playerColor, -dir.dx, -dir.dy);
            
            // Total length of the line segment passing through (x,y) in this axis
            const currentLineLength = count1 + count2 - 1; // Subtract 1 because (x,y) was counted in both count1 and count2

            if (currentLineLength >= 4) {
                makesFour = true;
            } else if (currentLineLength === 3) {
                makesThree = true;
            }
        }
        
        // As per game rules: a 4-line win overrides a 3-line loss if both occur simultaneously.
        return { isWin: makesFour, isLoss: makesThree && !makesFour };
    }
}

// Heuristic evaluation function for minimax leaf nodes (depth 0).
// It checks potential immediate wins/losses for both players from any empty cell.
function evaluateBoard(board: Board, myPlayerPiece: number, opponentPlayerPiece: number): number {
    let score = 0;

    for (let y = 0; y < board.rows; y++) {
        for (let x = board.min_x_per_y[y]; x <= board.max_x_per_y[y]; x++) {
            if (board.getCell(x, y) === 0) { // Only consider empty cells as potential next moves
                // Simulate placing my piece at (x,y)
                board.setCell(x, y, myPlayerPiece);
                const { isWin: myPotentialWin, isLoss: myPotentialLoss } = board.checkWinLoss(x, y, myPlayerPiece);
                board.setCell(x, y, 0); // Revert the simulated move

                if (myPotentialWin) {
                    score += WIN_SCORE / 2; // High positive score for moves that could lead to my win
                }
                if (myPotentialLoss) {
                    score -= WIN_SCORE / 2; // High negative score for moves that could lead to my loss
                }

                // Simulate placing opponent's piece at (x,y)
                board.setCell(x, y, opponentPlayerPiece);
                const { isWin: oppPotentialWin, isLoss: oppPotentialLoss } = board.checkWinLoss(x, y, opponentPlayerPiece);
                board.setCell(x, y, 0); // Revert the simulated move

                if (oppPotentialWin) {
                    score -= WIN_SCORE / 2; // High negative score if opponent can win here (threat to block)
                }
                if (oppPotentialLoss) {
                    score += WIN_SCORE / 2; // High positive score if opponent can lose here (opportunity to force a loss)
                }
            }
        }
    }
    return score;
}

// Minimax algorithm with Alpha-Beta Pruning
function minimax(
    board: Board,
    depth: number,
    isMaximizingPlayer: boolean,
    myPlayerPiece: number,
    opponentPlayerPiece: number,
    alpha: number, // Alpha-beta lower bound (best score for maximizing player)
    beta: number   // Alpha-beta upper bound (best score for minimizing player)
): { score: number, move: { x: number, y: number } | null } {

    const currentPlayerPiece = isMaximizingPlayer ? myPlayerPiece : opponentPlayerPiece;
    
    // Base case: If search depth is reached, evaluate the board heuristically.
    if (depth === 0) {
        return { score: evaluateBoard(board, myPlayerPiece, opponentPlayerPiece), move: null };
    }

    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;
    let bestMove: { x: number, y: number } | null = null;

    const availableMoves: { x: number, y: number }[] = [];
    for (let y = 0; y < board.rows; y++) {
        for (let x = board.min_x_per_y[y]; x <= board.max_x_per_y[y]; x++) {
            if (board.getCell(x, y) === 0) { // If cell is empty, it's a potential move
                availableMoves.push({ x, y });
            }
        }
    }

    // If no moves are available (e.g., board is full or game ended already)
    if (availableMoves.length === 0) {
        return { score: 0, move: null }; // Return a neutral score
    }

    // Sort moves for better alpha-beta pruning effectiveness (explore potentially better moves first)
    // Random sort helps break ties and explore different branches, preventing predictable play.
    availableMoves.sort(() => Math.random() - 0.5); 

    for (const move of availableMoves) {
        const newBoard = board.clone();
        newBoard.setCell(move.x, move.y, currentPlayerPiece);

        // Check if this move results in an immediate win or loss for the current player
        const { isWin, isLoss } = newBoard.checkWinLoss(move.x, move.y, currentPlayerPiece);

        let currentScore: number;
        if (isWin) {
            currentScore = isMaximizingPlayer ? WIN_SCORE : LOSE_SCORE; // Win for current player
        } else if (isLoss) {
            currentScore = isMaximizingPlayer ? LOSE_SCORE : WIN_SCORE; // Loss for current player (win for opponent)
        } else {
            // If no immediate win/loss, recurse to the next depth for the other player
            const result = minimax(newBoard, depth - 1, !isMaximizingPlayer, myPlayerPiece, opponentPlayerPiece, alpha, beta);
            currentScore = result.score;
        }

        if (isMaximizingPlayer) {
            if (currentScore > bestScore) {
                bestScore = currentScore;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore); // Update alpha
        } else { // Minimizing player
            if (currentScore < bestScore) {
                bestScore = currentScore;
                bestMove = move;
            }
            beta = Math.min(beta, bestScore); // Update beta
        }
        
        // Alpha-beta cut-off: if beta is less than or equal to alpha, prune this branch
        if (beta <= alpha) {
            break; 
        }
    }

    return { score: bestScore, move: bestMove };
}

// Global variables for game state
let MY_PLAYER_ID: number; // My ID (0 or 1) as given by game input
let MY_PLAYER_PIECE: number; // My piece value on the board (1 or 2)
let OPPONENT_PLAYER_PIECE: number; // Opponent's piece value on the board (1 or 2)
let CURRENT_TURN = 0; // Tracks the current turn number to handle player 2's first turn special rule

// Main function to solve the puzzle
function solve() {
    MY_PLAYER_ID = parseInt(readline()); // Read my player ID
    MY_PLAYER_PIECE = MY_PLAYER_ID === 0 ? 1 : 2; // Determine my piece value (1 if Player 0, 2 if Player 1)
    OPPONENT_PLAYER_PIECE = MY_PLAYER_ID === 0 ? 2 : 1; // Determine opponent's piece value

    // Game loop continues until the game ends
    while (true) {
        const rowCount = parseInt(readline()); // Read number of rows (always 8 for this puzzle)
        const gridStrings: string[] = [];
        for (let i = 0; i < rowCount; i++) {
            gridStrings.push(readline()); // Read each row of the grid
        }
        const opponentX = parseInt(readline()); // Opponent's last move X coordinate (-1 if first turn for Player 0)
        const opponentY = parseInt(readline()); // Opponent's last move Y coordinate (-1 if first turn for Player 0)

        const board = new Board(gridStrings); // Create a Board object from the current grid state

        let bestMove: { x: number, y: number } | null = null;
        let finalMessage = "";

        // Initialize best score to a very low value, so any valid score will be better
        let currentBestScore = LOSE_SCORE - 1; 

        // Determine search depth based on turn number (deeper for first turn)
        const searchDepth = CURRENT_TURN === 0 ? 3 : 2; 

        // 1. Calculate the best move if playing normally (without considering the 'steal' option)
        const normalResult = minimax(board, searchDepth, true, MY_PLAYER_PIECE, OPPONENT_PLAYER_PIECE, -Infinity, Infinity);
        
        currentBestScore = normalResult.score;
        bestMove = normalResult.move;
        finalMessage = `Score: ${normalResult.score}`;

        // 2. If it's Player 2's first turn, evaluate the 'steal' option and compare it to the best normal move
        // Conditions for P2's first turn: My ID is 1, it's turn 0, and opponent has already made a move (X,Y are not -1)
        if (MY_PLAYER_ID === 1 && CURRENT_TURN === 0 && opponentX !== -1 && opponentY !== -1) {
            const stealBoard = board.clone();
            // Simulate the steal: replace opponent's piece at (opponentX, opponentY) with my piece
            stealBoard.setCell(opponentX, opponentY, MY_PLAYER_PIECE);

            // Check if stealing immediately results in a win or loss for me
            const { isWin: stealWin, isLoss: stealLoss } = stealBoard.checkWinLoss(opponentX, opponentY, MY_PLAYER_PIECE);

            let stealScore: number;
            if (stealWin) {
                stealScore = WIN_SCORE; // Stealing leads to an immediate win
            } else if (stealLoss) {
                stealScore = LOSE_SCORE; // Stealing leads to an immediate loss
            } else {
                // If stealing doesn't immediately win or lose, evaluate the resulting board state with minimax
                // Use the same search depth for a fair comparison against the normal move path.
                const stealResult = minimax(stealBoard, searchDepth, true, MY_PLAYER_PIECE, OPPONENT_PLAYER_PIECE, -Infinity, Infinity);
                stealScore = stealResult.score;
            }

            // If the steal option yields a better score than the best normal move, choose to steal
            if (stealScore > currentBestScore) {
                currentBestScore = stealScore;
                bestMove = { x: opponentX, y: opponentY }; // The chosen move is to steal at opponent's previous position
                finalMessage = `Steal! (Score: ${stealScore})`;
            }
        }
        
        // Fallback: If no move was found by minimax (e.g., theoretically, no empty cells, or other edge cases)
        // This scenario should rarely be hit if the `minimax` function correctly explores all `availableMoves`.
        if (!bestMove) {
            let foundSafeMove = false;
            // Iterate through all possible cells to find the first valid, empty cell that doesn't cause an immediate loss
            for (let y = 0; y < board.rows; y++) {
                for (let x = board.min_x_per_y[y]; x <= board.max_x_per_y[y]; x++) {
                    if (board.getCell(x, y) === 0) { // Check if the cell is empty
                        const testBoard = board.clone();
                        testBoard.setCell(x, y, MY_PLAYER_PIECE);
                        const { isLoss } = testBoard.checkWinLoss(x, y, MY_PLAYER_PIECE);
                        if (!isLoss) { // If placing a piece here does not result in an immediate loss
                            bestMove = { x, y };
                            foundSafeMove = true;
                            finalMessage += "/Fallback: First safe empty cell.";
                            break;
                        }
                    }
                }
                if (foundSafeMove) break;
            }
        }

        // Emergency Fallback: If even the previous fallback didn't find a move (e.g., all remaining moves lead to loss)
        // This implies a forced loss or a full board situation. Just pick any valid empty cell.
        if (!bestMove) {
            // Try to pick a central, common cell like (4,3) first, then iterate for any valid empty cell
            let arbitraryX = 4;
            let arbitraryY = 3;
            if (!board.isValidCoordinate(arbitraryX, arbitraryY) || board.getCell(arbitraryX, arbitraryY) !== 0) {
                 // If the default central cell is not valid or already occupied, find the very first valid empty cell
                 for (let y = 0; y < board.rows; y++) {
                    for (let x = board.min_x_per_y[y]; x <= board.max_x_per_y[y]; x++) {
                        if (board.getCell(x,y) === 0) {
                            arbitraryX = x;
                            arbitraryY = y;
                            break;
                        }
                    }
                    if (board.getCell(arbitraryX, arbitraryY) === 0) break; // Found an empty cell
                 }
            }
            bestMove = {x: arbitraryX, y: arbitraryY};
            finalMessage += "/Emergency: All moves lose or board full. Picking arbitrary cell.";
        }

        // Output the chosen move coordinates and any debug messages
        print(`${bestMove.x} ${bestMove.y} ${finalMessage}`);
        CURRENT_TURN++; // Increment the turn counter for the next loop iteration
    }
}