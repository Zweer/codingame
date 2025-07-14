// Standard input/output functions (provided by CodinGame environment)
declare function readline(): string;
declare function print(message: string): void;
declare function console.error(message: any): void;

// Global variables for grid dimensions and initial map (read once at the start)
let GRID_WIDTH: number;
let GRID_HEIGHT: number;
let INITIAL_GRID_MAP: string[][]; // Stores the original static map layout

// Represents a bomb placed on the map
interface PlacedBomb {
    x: number;
    y: number;
    countdown: number; // Turns until natural explosion (3 -> 2 -> 1 -> explodes)
}

// Represents a state in the BFS search
interface GameState {
    grid: string[][];       // Current state of the grid
    placedBombs: PlacedBomb[]; // Bombs currently on the map with their countdowns
    bombsLeft: number;      // Number of bombs available to place
    turnsLeft: number;      // Number of turns remaining in the game
    history: (string | {x: number, y: number})[]; // Sequence of actions to reach this state (for BFS path)
}

/**
 * Counts the number of surveillance nodes ('@') remaining on the grid.
 */
function count_surveillance_nodes(grid: string[][]): number {
    let count = 0;
    for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            if (grid[r][c] === '@') {
                count++;
            }
        }
    }
    return count;
}

/**
 * Creates a deep copy of a 2D grid of strings.
 */
function deep_copy_grid(grid: string[][]): string[][] {
    return grid.map(row => [...row]);
}

/**
 * Creates a unique string representation of a game state for visited set hashing.
 * Includes grid content and sorted bomb positions with countdowns to ensure consistency.
 */
function grid_to_string(grid: string[][], bombs: PlacedBomb[]): string {
    // Flatten grid into a single string
    let gridString = grid.map(row => row.join('')).join('');

    // Sort bombs for consistent hashing regardless of insertion order
    const sortedBombs = bombs.slice().sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return a.countdown - b.countdown;
    });
    // Create a string representation of bombs
    const bombsString = sortedBombs.map(b => `${b.x},${b.y},${b.countdown}`).join('|');

    return `${gridString}|${bombsString}`;
}

/**
 * Simulates bomb explosions and chain reactions.
 * Modifies the grid and list of bombs internally (on deep copies).
 * @param initialGrid The grid state *before* explosions happen.
 * @param initialBombsToExplode Bombs that are set to explode this turn (countdown 1 or triggered).
 * @param currentBombsOnMap Bombs currently on the map whose countdowns have already been decremented.
 * @returns An object containing the new grid state and the updated list of bombs.
 */
function simulate_explosions(
    initialGrid: string[][],
    initialBombsToExplode: PlacedBomb[],
    currentBombsOnMap: PlacedBomb[]
): { grid: string[][], bombs: PlacedBomb[] } {

    let grid = deep_copy_grid(initialGrid); // Work on a copy of the grid
    let bombs = currentBombsOnMap.map(b => ({...b})); // Work on a copy of the bombs list

    let q: {x: number, y: number}[] = []; // Queue for bomb centers that need to explode
    let explodedBombCoords = new Set<string>(); // Tracks bombs that have been added to the queue or already detonated

    // Add initially exploding bombs to the queue
    for (const b of initialBombsToExplode) {
        const bombCoordKey = `${b.x},${b.y}`;
        if (!explodedBombCoords.has(bombCoordKey)) {
            q.push({x: b.x, y: b.y});
            explodedBombCoords.add(bombCoordKey);
        }
    }

    while (q.length > 0) {
        const {x: bx, y: by} = q.shift()!; // Get the bomb's center

        // Cells affected by this bomb's explosion (including the center itself)
        const affectedCells: {x: number, y: number}[] = [{x: bx, y: by}];

        // Directions for cross shape: Up, Down, Left, Right
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // dy, dx

        for (const [dy, dx] of dirs) {
            for (let i = 1; i <= 3; i++) { // Explosion range is 3 cells
                const cx = bx + dx * i;
                const cy = by + dy * i;

                // Check bounds
                if (cx < 0 || cx >= GRID_WIDTH || cy < 0 || cy >= GRID_HEIGHT) {
                    break; // Out of bounds, stop extending in this direction
                }
                // Check for passive nodes blocking explosion
                if (grid[cy][cx] === '#') {
                    break; // Explosion blocked, stop extending in this direction
                }
                affectedCells.push({x: cx, y: cy});
            }
        }

        // Process all cells affected by the current bomb's explosion
        for (const {x: cx, y: cy} of affectedCells) {
            // Destroy surveillance nodes
            if (grid[cy][cx] === '@') {
                grid[cy][cx] = '.';
            }

            // Check if another bomb is triggered by this explosion
            const triggeredBombIndex = bombs.findIndex(b => b.x === cx && b.y === cy);
            if (triggeredBombIndex !== -1) {
                const triggeredBomb = bombs[triggeredBombIndex];
                const triggeredBombCoordKey = `${triggeredBomb.x},${triggeredBomb.y}`;
                if (!explodedBombCoords.has(triggeredBombCoordKey)) { // Only trigger if not already processed/queued
                    bombs.splice(triggeredBombIndex, 1); // Remove from list of bombs on map as it explodes immediately
                    q.push({x: triggeredBomb.x, y: triggeredBomb.y}); // Add to queue for its explosion to be processed
                    explodedBombCoords.add(triggeredBombCoordKey);
                }
            }
        }
    }
    return { grid, bombs };
}

/**
 * Reads initial game data (grid dimensions and map layout).
 * This function is called only once at the very beginning of the program.
 */
function readInitialInput() {
    const inputs = readline().split(' ');
    GRID_WIDTH = parseInt(inputs[0]);
    GRID_HEIGHT = parseInt(inputs[1]);

    INITIAL_GRID_MAP = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
        INITIAL_GRID_MAP.push(readline().split(''));
    }
}

/**
 * Reads turn-based input (remaining rounds and available bombs).
 * This function is called at the beginning of each turn.
 */
function readTurnInput(): { rounds: number, bombs: number } {
    const [rounds, bombs] = readline().split(' ').map(Number);
    return { rounds, bombs };
}

/**
 * Main game loop logic. This function is executed repeatedly by the CodinGame engine
 * for each turn of the game.
 */
function runGameLoop() {
    // currentGameState stores the persistent state of the game across turns.
    let currentGameState: GameState = {
        grid: [], // Will be initialized or reset based on game progression
        placedBombs: [], // Bombs remaining from previous turns
        bombsLeft: 0,    // Available bombs for current turn
        turnsLeft: 0,    // Remaining rounds for current turn
        history: []      // Not directly used for output, but for BFS path tracking
    };
    
    // Helper to detect if a new test case/game has started (e.g., rounds reset)
    let previousRounds = -1;

    // The game loop runs indefinitely for CodinGame puzzles.
    while (true) {
        const { rounds, bombs } = readTurnInput();

        // Detect if a new game has started or if it's the very first turn.
        // If 'rounds' increases, it usually means a new test case (game reset).
        if (rounds > previousRounds || previousRounds === -1) {
            // Reset grid to initial map and clear any placed bombs from previous games
            currentGameState.grid = deep_copy_grid(INITIAL_GRID_MAP);
            currentGameState.placedBombs = [];
        }
        previousRounds = rounds; // Update previous rounds for next turn's detection

        // Update current game state with fresh input for the current turn
        currentGameState.bombsLeft = bombs;
        currentGameState.turnsLeft = rounds;

        // --- Step 1: Process events from the *previous* turn before making a new decision ---
        // Bombs placed 3 turns ago explode now, and countdowns for others decrease.
        let bombsToExplodeThisTurn: PlacedBomb[] = [];
        let bombsRemainingOnMap: PlacedBomb[] = [];

        for (const bomb of currentGameState.placedBombs) {
            if (bomb.countdown === 1) { // Bomb explodes this turn
                bombsToExplodeThisTurn.push(bomb);
            } else { // Bomb's countdown decrements
                bombsRemainingOnMap.push({...bomb, countdown: bomb.countdown - 1});
            }
        }

        // Apply explosions to the grid and update the list of active bombs
        const { grid: updatedGrid, bombs: updatedBombs } = simulate_explosions(
            currentGameState.grid, // Grid state *before* this turn's explosions
            bombsToExplodeThisTurn,
            bombsRemainingOnMap
        );
        currentGameState.grid = updatedGrid;
        currentGameState.placedBombs = updatedBombs;

        // --- Step 2: Check if all surveillance nodes are destroyed *after* current turn's explosions ---
        if (count_surveillance_nodes(currentGameState.grid) === 0) {
            print("WAIT"); // All nodes destroyed, nothing left to do.
            continue; // Proceed to the next game turn
        }

        // --- Step 3: Run BFS to find the best immediate action from the *current* game state ---
        const queue: GameState[] = [];
        const visited = new Set<string>();

        // The starting state for our BFS is the current, up-to-date game state.
        const initialStateForBFS: GameState = {
            grid: deep_copy_grid(currentGameState.grid),
            placedBombs: currentGameState.placedBombs.map(b => ({...b})),
            bombsLeft: currentGameState.bombsLeft,
            turnsLeft: currentGameState.turnsLeft,
            history: [] // History starts fresh for this specific BFS run (to find *this* turn's move)
        };

        queue.push(initialStateForBFS);
        visited.add(grid_to_string(initialStateForBFS.grid, initialStateForBFS.placedBombs));

        let bestAction: string = "WAIT"; // Default action if no path to victory is found
        let foundSolution = false;

        let head = 0; // Using a pointer for queue for slight performance improvement over `shift()`
        while (head < queue.length) {
            const state = queue[head++];

            // Check if this state has no surveillance nodes. If so, it's a winning state.
            // Since BFS finds the shortest path, the first winning state found gives the optimal first move.
            if (count_surveillance_nodes(state.grid) === 0) {
                bestAction = typeof state.history[0] === 'string' ? state.history[0] : `${state.history[0].x} ${state.history[0].y}`;
                foundSolution = true;
                break; // Found an optimal path, exit BFS loop
            }

            // If no turns left and nodes still exist, this path is a dead end.
            if (state.turnsLeft <= 0) {
                continue;
            }

            // --- Option A: WAIT this turn ---
            {
                let bombsToExplode: PlacedBomb[] = [];
                let bombsRemaining: PlacedBomb[] = [];
                // Identify bombs that will explode naturally or decrement their countdowns
                for (const bomb of state.placedBombs) {
                    if (bomb.countdown === 1) {
                        bombsToExplode.push(bomb);
                    } else {
                        bombsRemaining.push({...bomb, countdown: bomb.countdown - 1});
                    }
                }

                // Simulate the explosions and grid/bomb updates for this "WAIT" action
                const { grid: nextGrid, bombs: nextPlacedBombs } = simulate_explosions(
                    state.grid, // Grid state before this hypothetical turn's explosions
                    bombsToExplode,
                    bombsRemaining
                );

                const nextState: GameState = {
                    grid: nextGrid,
                    placedBombs: nextPlacedBombs,
                    bombsLeft: state.bombsLeft,
                    turnsLeft: state.turnsLeft - 1, // One less turn remaining
                    history: [...state.history, "WAIT"] // Add "WAIT" to history
                };
                const hash = grid_to_string(nextState.grid, nextState.placedBombs);
                if (!visited.has(hash)) {
                    visited.add(hash);
                    queue.push(nextState);
                }
            }

            // --- Option B: PLACE A BOMB this turn (if bombs are available) ---
            if (state.bombsLeft > 0) {
                for (let r = 0; r < GRID_HEIGHT; r++) {
                    for (let c = 0; c < GRID_WIDTH; c++) {
                        // Can only place a bomb on an empty cell ('.') and not on a cell that already contains a bomb
                        if (state.grid[r][c] === '.' && !state.placedBombs.some(b => b.x === c && b.y === r)) {
                            // This is a candidate action: place bomb at (c, r)
                            const actionCoords = { x: c, y: r };

                            // Create a new list of bombs that includes the newly placed bomb.
                            // The new bomb starts with a countdown of 3.
                            const bombsAfterPlacementAttempt = [...state.placedBombs, { x: c, y: r, countdown: 3 }];

                            // Now, simulate the turn's progress with this new bomb being active.
                            let bombsToExplodeThisTurnWithNewBomb: PlacedBomb[] = [];
                            let bombsRemainingAfterThisTurn: PlacedBomb[] = [];
                            
                            // Determine which bombs will explode and which will decrement their countdown
                            for (const bomb of bombsAfterPlacementAttempt) {
                                if (bomb.countdown === 1) {
                                    bombsToExplodeThisTurnWithNewBomb.push(bomb);
                                } else {
                                    bombsRemainingAfterThisTurn.push({...bomb, countdown: bomb.countdown - 1});
                                }
                            }

                            // Simulate the explosions on the current grid based on this bomb placement
                            const { grid: nextGrid, bombs: nextPlacedBombs } = simulate_explosions(
                                state.grid, // Grid state before this hypothetical turn's explosions
                                bombsToExplodeThisTurnWithNewBomb,
                                bombsRemainingAfterThisTurn
                            );

                            const nextState: GameState = {
                                grid: nextGrid,
                                placedBombs: nextPlacedBombs,
                                bombsLeft: state.bombsLeft - 1, // One less bomb available
                                turnsLeft: state.turnsLeft - 1, // One less turn remaining
                                history: [...state.history, actionCoords] // Add coordinates to history
                            };

                            const hash = grid_to_string(nextState.grid, nextState.placedBombs);
                            if (!visited.has(hash)) {
                                visited.add(hash);
                                queue.push(nextState);
                            }
                        }
                    }
                }
            }
        }
        // Output the best action determined by BFS for the current turn.
        print(bestAction);
    }
}

// Initial setup: Read the static map data once before the game loop begins.
readInitialInput();

// Start the main game loop.
runGameLoop();