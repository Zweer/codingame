/**
 * Auto-generated code below aims at helping you parse the standard input
 * according to the problem statement.
 **/

// Helper definitions for coordinates and cell states
interface Point {
    r: number; // Row (Y-coordinate)
    c: number; // Column (X-coordinate)
}

type PlayerColor = 'B' | 'W';
type CellState = PlayerColor | '.'; // '.' for empty

// --- Board Class ---
// Manages the Go board grid and basic operations.
class Board {
    grid: CellState[][];
    size: number;

    /**
     * Initializes a new Board instance.
     * @param size The size of the square board (e.g., 9 for 9x9).
     * @param initialGrid Optional 2D array to initialize the grid (for cloning).
     */
    constructor(size: number, initialGrid?: CellState[][]) {
        this.size = size;
        if (initialGrid) {
            // Deep copy the initial grid if provided
            this.grid = initialGrid.map(row => [...row]);
        } else {
            // Initialize with empty cells
            this.grid = Array(size).fill(0).map(() => Array(size).fill('.'));
        }
    }

    /**
     * Creates a deep copy of the current board.
     * @returns A new Board instance with the same state.
     */
    clone(): Board {
        return new Board(this.size, this.grid);
    }

    /**
     * Sets the state of a cell at specific coordinates.
     * @param r Row index.
     * @param c Column index.
     * @param value The new state for the cell ('.', 'B', or 'W').
     */
    set(r: number, c: number, value: CellState) {
        if (this.isValid(r, c)) {
            this.grid[r][c] = value;
        }
    }

    /**
     * Gets the state of a cell at specific coordinates.
     * @param r Row index.
     * @param c Column index.
     * @returns The cell state or null if coordinates are invalid.
     */
    get(r: number, c: number): CellState {
        if (this.isValid(r, c)) {
            return this.grid[r][c];
        }
        return null; // Should ideally be checked with isValid before calling get
    }

    /**
     * Checks if the given coordinates are within the board boundaries.
     * @param r Row index.
     * @param c Column index.
     * @returns True if coordinates are valid, false otherwise.
     */
    isValid(r: number, c: number): boolean {
        return r >= 0 && r < this.size && c >= 0 && c < this.size;
    }
}

// --- Go Game Logic Helpers ---
// These functions perform operations related to group discovery and liberty counting.

// Relative coordinates for adjacent cells (Up, Down, Left, Right)
const ADJACENT_DELTAS = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
];

// Interface for group information: stones belonging to the group and its liberties
interface GroupInfo {
    stones: Set<string>; // Stores "r,c" strings for unique stone identification
    liberties: Set<string>; // Stores "r,c" strings for unique liberty identification
}

/**
 * Converts a Point object to a string representation "r,c".
 * Useful for using Points as keys in Sets or Maps.
 * @param p The Point to convert.
 * @returns String representation of the point.
 */
function pointToString(p: Point): string {
    return `${p.r},${p.c}`;
}

/**
 * Converts a string representation "r,c" back to a Point object.
 * @param s The string to convert.
 * @returns Point object.
 */
function stringToPoint(s: string): Point {
    const parts = s.split(',').map(Number);
    return { r: parts[0], c: parts[1] };
}

/**
 * Finds a group of stones of a given color starting from (startR, startC)
 * and calculates its liberties using a Breadth-First Search (BFS) approach.
 * @param startR Row of the starting stone.
 * @param startC Column of the starting stone.
 * @param color The color of the stones to find in the group.
 * @param board The current board state.
 * @param visited A set of "r,c" strings used to track stones already visited during group discovery (prevents redundant processing in outer loops).
 * @returns An object containing the set of stone coordinates and liberties coordinates of the group.
 */
function findGroup(startR: number, startC: number, color: PlayerColor, board: Board, visited: Set<string>): GroupInfo {
    const queue: Point[] = [];
    const groupStones = new Set<string>();
    const groupLiberties = new Set<string>();
    const localVisited = new Set<string>(); // Visited for this specific group search to avoid infinite loops within one BFS

    const startPoint: Point = { r: startR, c: startC };
    const startPointStr = pointToString(startPoint);

    // If starting point is not of the correct color, return an empty group
    if (board.get(startR, startC) !== color) {
        return { stones: groupStones, liberties: groupLiberties };
    }

    queue.push(startPoint);
    localVisited.add(startPointStr);
    visited.add(startPointStr); // Add to the global visited set
    groupStones.add(startPointStr);

    while (queue.length > 0) {
        const { r, c } = queue.shift();

        for (const [dr, dc] of ADJACENT_DELTAS) {
            const nr = r + dr;
            const nc = c + dc;

            if (board.isValid(nr, nc)) {
                const neighborCell = board.get(nr, nc);
                const neighborPointStr = pointToString({ r: nr, c: nc });

                if (neighborCell === color && !localVisited.has(neighborPointStr)) {
                    // If neighbor is same color and not yet visited in this group search
                    localVisited.add(neighborPointStr);
                    visited.add(neighborPointStr); // Also mark in the global visited set
                    groupStones.add(neighborPointStr);
                    queue.push({ r: nr, c: nc });
                } else if (neighborCell === '.' && !groupLiberties.has(neighborPointStr)) {
                    // If neighbor is empty, it's a liberty
                    groupLiberties.add(neighborPointStr);
                }
            }
        }
    }

    return { stones: groupStones, liberties: groupLiberties };
}

/**
 * Calculates the number of liberties for the group that the stone at (r, c) belongs to.
 * This function initiates a fresh group discovery from (r, c).
 * @param r Row of the stone.
 * @param c Column of the stone.
 * @param color The color of the stone (and its group).
 * @param board The board state.
 * @returns The number of liberties for the group. Returns 0 if the stone is not of the specified color.
 */
function getLiberties(r: number, c: number, color: PlayerColor, board: Board): number {
    if (board.get(r, c) !== color) {
        return 0; // Stone at (r, c) is not of the specified color, or is empty
    }
    const visited = new Set<string>(); // Fresh visited set for each getLiberties call
    const group = findGroup(r, c, color, board, visited);
    return group.liberties.size;
}

// --- GameState Class ---
// Manages the current state of the Go game, including board, scores, and historical data for Ko.
class GameState {
    board: Board;
    myColor: PlayerColor;
    opponentColor: PlayerColor;
    myScore: number;
    opponentScore: number;
    private previousBoardState: CellState[][] | null; // Board state *after my last move* for Ko rule

    /**
     * Initializes a new GameState.
     * @param myColor The player's assigned color ('B' or 'W').
     * @param boardSize The size of the board.
     */
    constructor(myColor: PlayerColor, boardSize: number) {
        this.myColor = myColor;
        this.opponentColor = myColor === 'B' ? 'W' : 'B';
        this.board = new Board(boardSize);
        this.myScore = 0;
        this.opponentScore = 0;
        this.previousBoardState = null;
    }

    /**
     * Updates the game state with new input from the referee. This function
     * is called at the beginning of each turn.
     * @param lastOpponentX X-coordinate of opponent's last move (-1 for first turn).
     * @param lastOpponentY Y-coordinate of opponent's last move (-1 for first turn).
     * @param myScore Current score of my player.
     * @param opponentScore Current score of opponent.
     * @param boardLines Array of strings representing the current board (after opponent's move).
     */
    update(lastOpponentX: number, lastOpponentY: number, myScore: number, opponentScore: number, boardLines: string[]) {
        // IMPORTANT: Store the *current* board state (which is after my last move / initial state)
        // BEFORE updating the board with the opponent's new move.
        // This 'previousBoardState' is used for the Ko rule.
        this.previousBoardState = this.board.grid.map(row => [...row]); 

        // Update scores
        this.myScore = myScore;
        this.opponentScore = opponentScore;

        // Update the board grid based on the input lines
        for (let r = 0; r < this.board.size; r++) {
            for (let c = 0; c < this.board.size; c++) {
                this.board.grid[r][c] = boardLines[r][c] as CellState;
            }
        }
    }

    /**
     * Simulates placing a stone at (r, c) for a given color and applies any resulting captures.
     * This method returns a new board state and does NOT modify the current game state's board.
     * @param initialBoard The board state to start the simulation from.
     * @param r Row to place the stone.
     * @param c Column to place the stone.
     * @param color Color of the stone to place.
     * @returns An object containing the new board state after the move and the number of stones captured.
     */
    private applyMove(initialBoard: Board, r: number, c: number, color: PlayerColor): { newBoard: Board, capturedStones: number } {
        const tempBoard = initialBoard.clone();
        tempBoard.set(r, c, color); // Place the new stone
        let capturedStones = 0;

        const opponentColor = color === 'B' ? 'W' : 'B';
        const visitedGroups = new Set<string>(); // To prevent re-checking parts of the same group for capture

        // Check adjacent opponent stones for captures
        for (const [dr, dc] of ADJACENT_DELTAS) {
            const nr = r + dr;
            const nc = c + dc;

            if (tempBoard.isValid(nr, nc) && tempBoard.get(nr, nc) === opponentColor) {
                const groupRootStr = pointToString({r: nr, c: nc});
                // Ensure we don't process the same group multiple times if it touches the placed stone in multiple places
                if (!visitedGroups.has(groupRootStr)) {
                    // Create a local visited set for findGroup to avoid interference with outer loop's visitedGroups
                    const groupVisitedForSearch = new Set<string>(); 
                    const opponentGroup = findGroup(nr, nc, opponentColor, tempBoard, groupVisitedForSearch);
                    
                    // Add all stones in this group to global visitedGroups to avoid re-processing
                    opponentGroup.stones.forEach(s => visitedGroups.add(s));

                    if (opponentGroup.liberties.size === 0) {
                        // If the opponent group has no liberties, capture it
                        opponentGroup.stones.forEach(stoneStr => {
                            const p = stringToPoint(stoneStr);
                            tempBoard.set(p.r, p.c, '.'); // Remove captured stone from board
                            capturedStones++;
                        });
                    }
                }
            }
        }
        return { newBoard: tempBoard, capturedStones: capturedStones };
    }

    /**
     * Checks if placing a stone at (r, c) for playerColor is a valid move according to Go rules.
     * This includes checks for empty spot, suicidal moves (with capture exception), and Ko rule.
     * @param r Row to check.
     * @param c Column to check.
     * @param playerColor The color of the player attempting the move.
     * @returns True if the move is valid, false otherwise.
     */
    isValidMove(r: number, c: number, playerColor: PlayerColor): boolean {
        // 1. Check if the spot is already occupied
        if (this.board.get(r, c) !== '.') {
            return false;
        }

        // Simulate the move and potential captures to get the board state after the move
        const { newBoard, capturedStones } = this.applyMove(this.board, r, c, playerColor);

        // 2. Check for suicidal move (a move that results in the placed stone/group having no liberties)
        // Exception: A move is valid even if it seems suicidal if it captures opponent stones.
        const newStoneLiberties = getLiberties(r, c, playerColor, newBoard);
        if (newStoneLiberties === 0 && capturedStones === 0) {
            return false; // Suicidal move that doesn't capture any opponent stones
        }

        // 3. Check Ko-rule: Prevents repeating the board state from two turns ago.
        // The Ko rule applies if the board state *after* this proposed move (newBoard)
        // is identical to the board state *after my last move* (this.previousBoardState).
        if (this.previousBoardState) {
            let isKo = true;
            for (let row = 0; row < this.board.size; row++) {
                for (let col = 0; col < this.board.size; col++) {
                    if (newBoard.grid[row][col] !== this.previousBoardState[row][col]) {
                        isKo = false;
                        break;
                    }
                }
                if (!isKo) break;
            }
            if (isKo) {
                return false;
            }
        }
        
        return true;
    }
}

// --- GoAI Class ---
// The main AI logic that interacts with the game state and decides the next move.
class GoAI {
    gameState: GameState;

    constructor(myColor: PlayerColor, boardSize: number) {
        this.gameState = new GameState(myColor, boardSize);
    }

    /**
     * Updates the internal game state at the beginning of each turn.
     */
    updateGameState(lastOpponentX: number, lastOpponentY: number, myScore: number, opponentScore: number, boardLines: string[]) {
        this.gameState.update(lastOpponentX, lastOpponentY, myScore, opponentScore, boardLines);
    }

    /**
     * Chooses the best possible move based on a set of heuristics.
     * @returns The chosen move coordinates (Point) or 'PASS' if no valid move is found.
     */
    chooseMove(): Point | 'PASS' {
        // Interface to store evaluation metrics for each possible move
        interface MoveEvaluation {
            point: Point;
            captured: number; // Number of opponent stones captured by this move
            myLibertiesAfter: number; // Liberties of my group (including the new stone) after the move
            opponentAtariThreats: number; // Number of distinct opponent groups put into Atari (1 liberty) by this move
        }

        const possibleMoves: MoveEvaluation[] = [];

        // Iterate through all empty cells on the board to find valid moves
        for (let r = 0; r < this.gameState.board.size; r++) {
            for (let c = 0; c < this.gameState.board.size; c++) {
                if (this.gameState.isValidMove(r, c, this.gameState.myColor)) {
                    // Simulate the move to evaluate its outcome for heuristics
                    // We cast to any to access the private method applyMove for simulation purposes.
                    const { newBoard, capturedStones } = (this.gameState as any).applyMove(this.gameState.board, r, c, this.gameState.myColor);
                    
                    // Calculate liberties of my new stone's group on the simulated board
                    const myNewGroupLiberties = getLiberties(r, c, this.gameState.myColor, newBoard);

                    let opponentAtariThreats = 0;
                    const opponentColor = this.gameState.opponentColor;
                    const visitedGroupsForAtariCheck = new Set<string>(); // Prevent double-counting threats to the same group

                    // Check all adjacent opponent groups for Atari (1 liberty) state after my move
                    for (const [dr, dc] of ADJACENT_DELTAS) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (newBoard.isValid(nr, nc) && newBoard.get(nr, nc) === opponentColor) {
                            const groupRootStr = pointToString({r: nr, c: nc});
                            if (!visitedGroupsForAtariCheck.has(groupRootStr)) {
                                const groupVisitedForSearch = new Set<string>(); // Local visited for this findGroup call
                                const opponentGroup = findGroup(nr, nc, opponentColor, newBoard, groupVisitedForSearch);
                                opponentGroup.stones.forEach(s => visitedGroupsForAtariCheck.add(s)); // Mark stones as visited globally for this threat check

                                if (opponentGroup.liberties.size === 1) { // If opponent group has exactly 1 liberty, it's in Atari
                                    opponentAtariThreats++;
                                }
                            }
                        }
                    }

                    // Add valid move and its evaluations to the list
                    possibleMoves.push({
                        point: { r, c },
                        captured: capturedStones,
                        myLibertiesAfter: myNewGroupLiberties,
                        opponentAtariThreats: opponentAtariThreats
                    });
                }
            }
        }

        // Sort possible moves based on a hierarchy of heuristics:
        // 1. Maximize captured stones (most important for Atari Go).
        // 2. Maximize opponent groups put into Atari.
        // 3. Maximize liberties for my own new group (good for safety/expansion).
        // 4. Default to top-left coordinate for consistent tie-breaking.
        possibleMoves.sort((a, b) => {
            if (a.captured !== b.captured) {
                return b.captured - a.captured; // More captures first (descending)
            }
            if (a.opponentAtariThreats !== b.opponentAtariThreats) {
                return b.opponentAtariThreats - a.opponentAtariThreats; // More Atari threats first (descending)
            }
            if (a.myLibertiesAfter !== b.myLibertiesAfter) {
                return b.myLibertiesAfter - a.myLibertiesAfter; // More liberties for my group (descending)
            }
            // Tie-breaking by coordinates (row then column, ascending)
            if (a.point.r !== b.point.r) {
                return a.point.r - b.point.r;
            }
            return a.point.c - b.point.c;
        });

        // If there are valid moves, return the best one; otherwise, pass.
        if (possibleMoves.length > 0) {
            return possibleMoves[0].point;
        } else {
            return 'PASS'; // No valid moves found, or passing is the only option
        }
    }
}

// --- Main Game Loop ---
// This section handles input/output and drives the GoAI.

// Read initial input
const myColor: PlayerColor = readline() as PlayerColor;
const boardSize: number = parseInt(readline());

// Initialize the AI
const goAI = new GoAI(myColor, boardSize);

// Game loop, runs for each turn
while (true) {
    // Read opponent's last move coordinates
    const inputs: string[] = readline().split(' ');
    const opponentLastMoveX: number = parseInt(inputs[0]);
    const opponentLastMoveY: number = parseInt(inputs[1]);

    // Read scores
    const scores: string[] = readline().split(' ');
    const myScore: number = parseInt(scores[0]);
    const opponentScore: number = parseInt(scores[1]);

    // Read the current board state
    const boardLines: string[] = [];
    for (let i = 0; i < boardSize; i++) {
        boardLines.push(readline());
    }

    // Update the AI's internal game state
    goAI.updateGameState(opponentLastMoveX, opponentLastMoveY, myScore, opponentScore, boardLines);

    // Get the AI's chosen move
    const chosenMove = goAI.chooseMove();

    // Output the chosen move in the required format
    if (chosenMove === 'PASS') {
        console.log('PASS');
    } else {
        // CodinGame expects X Y, where X is column (c) and Y is row (r)
        console.log(`${chosenMove.c} ${chosenMove.r}`);
    }
}