// Standard input reading setup (provided by CodinGame environment)
declare function readline(): string;

// Define enums for clarity and type safety
enum TileState {
    WHITE = 0,
    OUR_COLOR = 1,
    OPPONENT_COLOR = 2 // Used if the ant picks up this color from a tile
}

enum AntColor {
    OUR_COLOR = 1,
    OPPONENT_COLOR = 2
}

enum Direction {
    UP = 0,
    RIGHT = 1,
    DOWN = 2,
    LEFT = 3
}

// Global variables for game parameters
let DIMENSION: number;
let NUMBER_ROUNDS: number;
let PATH_LENGTH: number;

// Global state to track tiles placed by us in the current round
let myPlacedTiles: boolean[][];

/**
 * Initializes or resets the grid for a new round.
 * All cells in `myPlacedTiles` are set to false (no tiles placed yet).
 */
function initializeRoundGrid(): void {
    myPlacedTiles = Array(DIMENSION).fill(0).map(() => Array(DIMENSION).fill(false));
}

/**
 * Simulates the Langton's Ant movement on a grid configuration
 * based on the current `myPlacedTiles` state and returns the score.
 *
 * @returns The number of tiles colored with OUR_COLOR after the simulation.
 */
function simulateCurrentGridConfiguration(): number {
    // Create a deep copy of the current grid state for simulation.
    // Tiles initially placed by us are marked as OUR_COLOR, others are WHITE.
    const simulationGrid: TileState[][] = Array(DIMENSION).fill(0).map(() => Array(DIMENSION).fill(TileState.WHITE));

    for (let r = 0; r < DIMENSION; r++) {
        for (let c = 0; c < DIMENSION; c++) {
            if (myPlacedTiles[r][c]) {
                simulationGrid[r][c] = TileState.OUR_COLOR;
            }
        }
    }

    // Initialize ant's starting position, direction, and color
    let antX = Math.floor(DIMENSION / 2);
    let antY = Math.floor(DIMENSION / 2);
    let antDirection: Direction = Direction.UP;
    let currentAntColor: AntColor = AntColor.OUR_COLOR; // Ant starts with OUR_COLOR

    // Direction vectors: [dx, dy] for UP, RIGHT, DOWN, LEFT
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];

    // Simulate ant movement for PATH_LENGTH steps
    for (let step = 0; step < PATH_LENGTH; step++) {
        // Check if ant has exited the grid
        if (antX < 0 || antX >= DIMENSION || antY < 0 || antY >= DIMENSION) {
            break; // Simulation ends if ant goes off-grid
        }

        const tileColor = simulationGrid[antY][antX];

        if (tileColor !== TileState.WHITE) {
            // Rule: If ant is on a colored tile
            antDirection = (antDirection - 1 + 4) % 4; // Turn left
            currentAntColor = tileColor as AntColor;    // Ant's color becomes the tile's color
            simulationGrid[antY][antX] = TileState.WHITE; // Tile becomes white
        } else {
            // Rule: If ant is on a white tile
            antDirection = (antDirection + 1) % 4; // Turn right
            simulationGrid[antY][antX] = currentAntColor; // Tile becomes of the ant's color
        }

        // Move ant forward in the new direction
        antX += dx[antDirection];
        antY += dy[antDirection];
    }

    // Calculate the score by counting OUR_COLOR tiles on the final grid
    let ourScore = 0;
    for (let r = 0; r < DIMENSION; r++) {
        for (let c = 0; c < DIMENSION; c++) {
            if (simulationGrid[r][c] === TileState.OUR_COLOR) {
                ourScore++;
            }
        }
    }
    return ourScore;
}


// --- Main game logic ---

// Read initial game parameters from input
DIMENSION = parseInt(readline());
NUMBER_ROUNDS = parseInt(readline());
PATH_LENGTH = parseInt(readline());

// Initialize the grid for the first round
initializeRoundGrid();

// Game loop: This loop runs for each placement turn in both rounds
while (true) {
    const inputs = readline().split(' ');
    const opponentRow = parseInt(inputs[0]);
    const opponentCol = parseInt(inputs[1]);

    // Check for the special signal indicating the start of the second round
    if (opponentRow === -2) {
        initializeRoundGrid(); // Reset our placed tiles for the new round
        continue; // Skip to the next turn to process the first placement request of Round 2
    }

    let bestScore = -1;
    let bestCoord: { r: number; c: number } | null = null;

    // Iterate through every possible tile on the grid to find the best placement
    for (let r = 0; r < DIMENSION; r++) {
        for (let c = 0; c < DIMENSION; c++) {
            // Only consider tiles that have not been placed by us in the current round
            if (!myPlacedTiles[r][c]) {
                // Temporarily mark the current tile as placed for simulation
                myPlacedTiles[r][c] = true;
                const currentScore = simulateCurrentGridConfiguration(); // Simulate with this new tile
                myPlacedTiles[r][c] = false; // Revert the temporary change for the next iteration

                // If this placement yields a better score, update our best choice
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestCoord = { r, c };
                }
            }
        }
    }

    // Fallback: If no optimal tile was found (e.g., all tiles are already placed, though unlikely given constraints)
    if (bestCoord === null) {
        // As a safeguard, pick the first available tile
        for (let r = 0; r < DIMENSION; r++) {
            for (let c = 0; c < DIMENSION; c++) {
                if (!myPlacedTiles[r][c]) {
                    bestCoord = { r, c };
                    break;
                }
            }
            if (bestCoord) break;
        }
    }

    // Mark the chosen tile permanently as placed for the current round
    if (bestCoord) {
        myPlacedTiles[bestCoord.r][bestCoord.c] = true;
        console.log(`${bestCoord.r} ${bestCoord.c}`); // Output our chosen coordinates
    } else {
        // Emergency fallback - this case should ideally not be reached under normal game conditions
        console.error("Critical Error: Could not determine a tile to place.");
        console.log("0 0"); // Output a default coordinate to prevent program crash
    }
}