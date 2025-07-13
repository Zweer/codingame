// Helper functions and constants
type PlayerColor = 'r' | 'g' | 'b';
type CellState = '.' | '#' | 'r' | 'g' | 'b';
type Coord = [number, number]; // [row, col]

const BOARD_SIZE = 8;
const KNIGHT_MOVES = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
];

// Chess notation mapping
const COL_TO_IDX: { [key: string]: number } = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
const ROW_TO_IDX: { [key: string]: number } = { '8': 0, '7': 1, '6': 2, '5': 3, '4': 4, '3': 5, '2': 6, '1': 7 };
const IDX_TO_COL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const IDX_TO_ROW = ['8', '7', '6', '5', '4', '3', '2', '1'];

function toChessNotation(row: number, col: number): string {
    return IDX_TO_COL[col] + IDX_TO_ROW[row];
}

function fromChessNotation(moveStr: string): Coord {
    const col = COL_TO_IDX[moveStr[0]];
    const row = ROW_TO_IDX[moveStr[1]];
    return [row, col];
}

// Player information class
class PlayerInfo {
    constructor(
        public color: PlayerColor,
        public status: number, // 0 for lost, 1 for alive
        public position: Coord | null // current position on the board
    ) {}
}

// Game state representation
class GameState {
    board: CellState[][];
    players: PlayerInfo[]; // Ordered R, G, B for consistent indexing (0:R, 1:G, 2:B)
    currentPlayerIndex: number; // Index of the player whose turn it is
    numAlivePlayers: number;

    constructor(
        board: CellState[][],
        players: PlayerInfo[],
        currentPlayerIndex: number,
        numAlivePlayers: number
    ) {
        this.board = board.map(row => [...row]); // Deep copy board
        // Deep copy players info including their positions
        this.players = players.map(p => new PlayerInfo(p.color, p.status, p.position ? [...p.position] : null)); 
        this.currentPlayerIndex = currentPlayerIndex;
        this.numAlivePlayers = numAlivePlayers;
    }

    clone(): GameState {
        return new GameState(this.board, this.players, this.currentPlayerIndex, this.numAlivePlayers);
    }

    isValidCoord(row: number, col: number): boolean {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    getLegalMoves(playerIndex: number): Coord[] {
        const player = this.players[playerIndex];
        if (player.status === 0 || !player.position) {
            return [];
        }

        const [r, c] = player.position;
        const moves: Coord[] = [];

        for (const [dr, dc] of KNIGHT_MOVES) {
            const newR = r + dr;
            const newC = c + dc;

            if (this.isValidCoord(newR, newC) && this.board[newR][newC] === '.') {
                moves.push([newR, newC]);
            }
        }
        return moves;
    }

    applyMove(playerIndex: number, newPos: Coord): void {
        const player = this.players[playerIndex];
        if (player.status === 0 || !player.position) {
            return; 
        }

        const [oldR, oldC] = player.position;
        
        // Mark old position as blocked
        this.board[oldR][oldC] = '#';

        // Update board with new position for the knight's color
        this.board[newPos[0]][newPos[1]] = player.color; 

        // Update player's position
        player.position = newPos;

        // Advance to next living player
        let nextPlayerIdx = (playerIndex + 1) % this.players.length;
        while (this.players[nextPlayerIdx].status === 0 && nextPlayerIdx !== playerIndex) {
            nextPlayerIdx = (nextPlayerIdx + 1) % this.players.length;
        }
        this.currentPlayerIndex = nextPlayerIdx;
    }

    isGameOver(): boolean {
        return this.numAlivePlayers <= 1;
    }

    getWinner(): PlayerColor | null {
        if (this.isGameOver()) {
            const alivePlayers = this.players.filter(p => p.status === 1);
            return alivePlayers.length === 1 ? alivePlayers[0].color : null;
        }
        return null;
    }
}

// Global variables for our bot's player
let MY_COLOR: PlayerColor;
const PLAYER_COLORS_ORDER: PlayerColor[] = ['r', 'g', 'b']; // Fixed order: Red (0), Green (1), Blue (2)
let MY_PLAYER_INDEX: number; // Index of our player in the `players` array within GameState

/**
 * Evaluates a game state from `myBotColor`'s perspective.
 * Returns a numerical score: higher is better for `myBotColor`.
 */
function evaluate(gameState: GameState, myBotColor: PlayerColor): number {
    // If the game is over, assign extreme scores
    if (gameState.isGameOver()) {
        const winner = gameState.getWinner();
        if (winner === myBotColor) {
            return Infinity; // My bot wins
        } else if (winner === null) {
            return -Infinity; // No winner implies my bot lost (e.g., all players trapped)
        } else {
            return -Infinity; // An opponent won
        }
    }

    const myPlayer = gameState.players.find(p => p.color === myBotColor)!;
    // Calculate liberties for my bot
    const myLiberties = myPlayer.status === 1 ? gameState.getLegalMoves(gameState.players.indexOf(myPlayer)).length : 0;

    let opponentLibertiesSum = 0;
    // Calculate total liberties for opponents
    for (const p of gameState.players) {
        if (p.color !== myBotColor && p.status === 1) {
            opponentLibertiesSum += gameState.getLegalMoves(gameState.players.indexOf(p)).length;
        }
    }

    // Heuristic: Maximize my liberties, minimize opponents' liberties.
    // My liberties are weighted higher to prioritize my mobility.
    return myLiberties * 10 - opponentLibertiesSum;
}

/**
 * Minimax search function with Alpha-Beta Pruning.
 * Returns the best score achievable from the current state for `myBotColor`.
 */
function solve(gameState: GameState, depth: number, alpha: number, beta: number, myBotColor: PlayerColor): number {
    // Base case: max depth reached or game over
    if (depth === 0 || gameState.isGameOver()) {
        return evaluate(gameState, myBotColor);
    }

    const currentPlayerIndex = gameState.currentPlayerIndex;
    const currentPlayer = gameState.players[currentPlayerIndex];

    // If current player in the simulation is already lost (status 0), they cannot move.
    // Skip their turn and advance to the next living player.
    if (currentPlayer.status === 0) {
        const nextState = gameState.clone();
        let nextPlayerIdx = (currentPlayerIndex + 1) % nextState.players.length;
        while (nextState.players[nextPlayerIdx].status === 0 && nextPlayerIdx !== currentPlayerIndex) {
            nextPlayerIdx = (nextPlayerIdx + 1) % nextState.players.length;
        }
        nextState.currentPlayerIndex = nextPlayerIdx; // Update to the next active player
        // Recursively call with the same depth, as no move was effectively made by the lost player
        return solve(nextState, depth, alpha, beta, myBotColor);
    }
    
    const legalMoves = gameState.getLegalMoves(currentPlayerIndex);

    // If current player has no legal moves, they lose the game.
    if (legalMoves.length === 0) {
        const nextState = gameState.clone();
        nextState.players[currentPlayerIndex].status = 0; // Mark current player as lost
        nextState.numAlivePlayers--; // Decrement alive count
        
        // If my bot is the current player and has no moves, it's a loss for my bot.
        if (currentPlayer.color === myBotColor) {
            return -Infinity;
        } else {
            // An opponent lost. This is a favorable outcome for my bot.
            // Advance to the next living player, and continue evaluating.
            let nextPlayerIdx = (currentPlayerIndex + 1) % nextState.players.length;
            while (nextState.players[nextPlayerIdx].status === 0 && nextPlayerIdx !== currentPlayerIndex) {
                nextPlayerIdx = (nextPlayerIdx + 1) % nextState.players.length;
            }
            nextState.currentPlayerIndex = nextPlayerIdx;
            // The score is directly from myBotColor's perspective, so no negation needed here.
            return solve(nextState, depth, alpha, beta, myBotColor);
        }
    }
    
    // If it's my bot's turn, we maximize the score.
    if (currentPlayer.color === myBotColor) { 
        let maxEval = -Infinity;
        for (const move of legalMoves) {
            const nextState = gameState.clone();
            nextState.applyMove(currentPlayerIndex, move); // Apply my move in the simulated state
            
            // Recursively call for the next player's turn. The value returned is always for myBotColor.
            const evalScore = solve(nextState, depth - 1, alpha, beta, myBotColor);
            
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) {
                break; // Beta cut-off
            }
        }
        return maxEval;
    } else { // If it's an opponent's turn, they will try to maximize their OWN score, which implies minimizing my bot's score.
        let minEval = Infinity;
        for (const move of legalMoves) {
            const nextState = gameState.clone();
            nextState.applyMove(currentPlayerIndex, move); // Apply opponent's move in the simulated state
            
            // Recursively call for the next player's turn. The value returned is for myBotColor.
            const evalScore = solve(nextState, depth - 1, alpha, beta, myBotColor);
            
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) {
                break; // Alpha cut-off
            }
        }
        return minEval;
    }
}

// --- Main game loop ---

// Read initial input: your piece color
MY_COLOR = readline() as PlayerColor;
MY_PLAYER_INDEX = PLAYER_COLORS_ORDER.indexOf(MY_COLOR);

while (true) {
    // Temporary storage for player info as parsed from input lines (not yet linked to board positions)
    const playersInput: { color: PlayerColor, status: number, lastMove: string }[] = [];
    for (let i = 0; i < 3; i++) {
        const [playerColorStr, statusStr] = readline().split(' '); // lastMoveStr is ignored for current pos
        playersInput.push({ color: playerColorStr as PlayerColor, status: parseInt(statusStr), lastMove: "" }); // lastMove is not used
    }

    const board: CellState[][] = [];
    const currentKnightPositions: Map<PlayerColor, Coord> = new Map();

    // Read board state and identify current knight positions
    for (let i = 0; i < BOARD_SIZE; i++) {
        const line = readline();
        const row: CellState[] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = line[j] as CellState;
            row.push(cell);
            if (cell === 'r' || cell === 'g' || cell === 'b') {
                currentKnightPositions.set(cell, [i, j]);
            }
        }
        board.push(row);
    }

    // Read legal moves provided for THIS turn (which is my bot's turn)
    let moveCount = parseInt(readline());
    const myLegalMovesFromInput: string[] = [];
    for (let i = 0; i < moveCount; i++) {
        myLegalMovesFromInput.push(readline());
    }

    // Construct the initial GameState for the search algorithm
    // Players are ordered Red, Green, Blue for consistent internal indexing (0, 1, 2)
    const initialPlayers: PlayerInfo[] = [];
    let numAlivePlayers = 0;
    for (const pColor of PLAYER_COLORS_ORDER) {
        const playerInput = playersInput.find(p => p.color === pColor)!;
        const currentPos = currentKnightPositions.get(pColor) || null;
        
        const playerInfo = new PlayerInfo(pColor, playerInput.status, currentPos);
        initialPlayers.push(playerInfo);
        if (playerInfo.status === 1) {
            numAlivePlayers++;
        }
    }
    
    // It is MY_PLAYER_INDEX's turn according to the problem setup (my bot receives its moves)
    const currentGameState = new GameState(board, initialPlayers, MY_PLAYER_INDEX, numAlivePlayers);

    let bestMove: string | null = null;

    if (myLegalMovesFromInput.length === 0) {
        // If no legal moves are provided, it means my bot has lost. Output 'random' as a safe fallback.
        console.log('random'); 
    } else if (myLegalMovesFromInput.length === 1) {
        // If there's only one move, just take it. No need for complex search.
        bestMove = myLegalMovesFromInput[0];
        console.log(bestMove);
    } else {
        // Perform Minimax search to find the best move
        // A depth of 4 balances performance and strategic play for this game.
        let maxDepth = 4; 

        let bestScore = -Infinity;
        bestMove = myLegalMovesFromInput[0]; // Initialize with the first available move

        // Iterate through all my possible legal moves to find the best one
        for (const moveStr of myLegalMovesFromInput) {
            const moveCoord = fromChessNotation(moveStr);

            const nextState = currentGameState.clone();
            nextState.applyMove(MY_PLAYER_INDEX, moveCoord); // Apply my current move in the simulated state

            // Call the solve function for the next state.
            // The score returned is always from `MY_COLOR`'s perspective.
            // Alpha and beta bounds are initialized to their widest possible range.
            const score = solve(nextState, maxDepth - 1, -Infinity, Infinity, MY_COLOR);

            if (score > bestScore) {
                bestScore = score;
                bestMove = moveStr;
            }
        }
        console.log(bestMove);
    }
}