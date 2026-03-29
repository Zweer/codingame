/**
 * Reads a line of input. In CodinGame environments, this is typically provided.
 * For local testing, you might need to mock this or provide input differently.
 */
declare function readline(): string;

/**
 * Represents a single hexagonal depot.
 */
class Depot {
    id: number;
    walls: string[]; // Current rotation of walls (0-5 clockwise from top)

    constructor(id: number, initialWalls: string[]) {
        this.id = id;
        this.walls = [...initialWalls]; // Create a copy to allow rotation
    }

    /**
     * Rotates the depot's walls clockwise by one position.
     * E.g., [W0, W1, W2, W3, W4, W5] becomes [W5, W0, W1, W2, W3, W4]
     */
    rotateClockwise(): void {
        const lastWall = this.walls.pop();
        if (lastWall !== undefined) {
            this.walls.unshift(lastWall);
        }
    }

    /**
     * Returns the texture on the 'right' wall (which is at wall index 1).
     * This is used for both the center depot's orientation rule and the final output.
     */
    getRightWallTexture(): string {
        return this.walls[1];
    }

    /**
     * Orients the depot such that its alphabetically lowest character is on the 'right' wall (index 1).
     * This method is specifically for the center depot, which has this unique orientation rule.
     * Assumes the lowest character appears only once in the depot, as per problem constraints.
     */
    orientForCenterDepot(): void {
        let lowestChar = 'Z'; // Initialize with a character guaranteed to be higher than any possible wall texture
        for (const wall of this.walls) {
            if (wall < lowestChar) {
                lowestChar = wall;
            }
        }

        // Rotate until the lowest character is at wall index 1 (the 'right' wall)
        for (let i = 0; i < 6; i++) { // Max 6 rotations needed to check all orientations
            if (this.walls[1] === lowestChar) {
                return; // Correctly oriented
            }
            this.rotateClockwise();
        }
        // This point should not be reached given the problem constraints (unique solution, lowest char appears once).
        throw new Error("Failed to orient center depot to lowest char on right wall.");
    }
}

/**
 * Defines the connections between layout positions (0-6) and their respective walls.
 * Each connection is an array: [pos1_idx, wall1_idx, pos2_idx, wall2_idx].
 * Wall indices: 0 (Top), 1 (Top-Right), 2 (Bottom-Right), 3 (Bottom), 4 (Bottom-Left), 5 (Top-Left).
 *
 * Layout positions mapping (corresponds to output order):
 * P0: Top-Left
 * P1: Top-Right
 * P2: Middle-Left
 * P3: Center
 * P4: Middle-Right
 * P5: Bottom-Left
 * P6: Bottom-Right
 */
const CONNECTIONS: Array<[number, number, number, number]> = [
    // Connections involving the center depot (P3) and its direct neighbors
    [3, 0, 1, 3], // P3's Top wall (0) connects to P1's Bottom wall (3)
    [3, 1, 4, 4], // P3's Top-Right wall (1) connects to P4's Bottom-Left wall (4)
    [3, 2, 6, 5], // P3's Bottom-Right wall (2) connects to P6's Top-Left wall (5)
    [3, 3, 5, 0], // P3's Bottom wall (3) connects to P5's Top wall (0)
    [3, 4, 2, 1], // P3's Bottom-Left wall (4) connects to P2's Top-Right wall (1)
    [3, 5, 0, 2], // P3's Top-Left wall (5) connects to P0's Bottom-Right wall (2)

    // Connections between outer depots
    [0, 1, 1, 5], // P0's Top-Right wall (1) connects to P1's Top-Left wall (5)
    [0, 3, 2, 0], // P0's Bottom wall (3) connects to P2's Top wall (0)
    [1, 2, 4, 5], // P1's Bottom-Right wall (2) connects to P4's Top-Left wall (5)
    [2, 2, 5, 5], // P2's Bottom-Right wall (2) connects to P5's Top-Left wall (5)
    [4, 3, 6, 0], // P4's Bottom wall (3) connects to P6's Top wall (0)
    [5, 1, 6, 4]  // P5's Top-Right wall (1) connects to P6's Bottom-Left wall (4)
];

// Global state variables for the backtracking algorithm
let board: Array<Depot | null> = new Array(7).fill(null); // Stores Depot objects at layout positions
let usedDepotIds: boolean[] = new Array(7).fill(false); // Tracks which original depots have been used

// The sequence of layout positions to fill by the backtracking algorithm,
// excluding the center (P3) which is pre-filled.
const positionsToFill = [0, 1, 2, 4, 5, 6]; 

/**
 * Checks if the connections involving the depot at `currentPosIndex` are valid.
 * This function only verifies connections where the other depot in the pair is already placed on the board.
 *
 * @param currentPosIndex The layout position where a depot was just placed.
 * @returns True if all relevant connections checked so far match, false otherwise.
 */
function checkCurrentConnections(currentPosIndex: number): boolean {
    const depotAtCurrentPos = board[currentPosIndex];
    if (depotAtCurrentPos === null) {
        // This case indicates an internal error if `checkCurrentConnections` is called correctly.
        return false; 
    }

    for (const connection of CONNECTIONS) {
        let pos1 = connection[0];
        let wall1 = connection[1];
        let pos2 = connection[2];
        let wall2 = connection[3];

        let d1: Depot | null = null;
        let w1: number = -1; // Wall index for d1
        let d2: Depot | null = null;
        let w2: number = -1; // Wall index for d2

        // Determine which depot in the connection pair is the `currentPosIndex`
        if (pos1 === currentPosIndex) {
            d1 = depotAtCurrentPos;
            w1 = wall1;
            d2 = board[pos2];
            w2 = wall2;
        } else if (pos2 === currentPosIndex) {
            d1 = depotAtCurrentPos;
            w1 = wall2; // If currentPosIndex is pos2, its wall corresponds to wall2 from the connection definition
            d2 = board[pos1];
            w2 = wall1; // And the other depot's wall corresponds to wall1
        } else {
            // This connection does not involve the current depot, skip it
            continue;
        }

        // Only check if the neighboring depot (`d2`) is already placed on the board
        if (d2 !== null) {
            if (d1.walls[w1] !== d2.walls[w2]) {
                return false; // Mismatch found: this placement/rotation is invalid
            }
        }
    }
    return true; // All relevant connections match so far
}

/**
 * The main backtracking function to find the solution arrangement of depots.
 *
 * @param positionIdxInList The index within `positionsToFill` array that we are currently trying to fill.
 *                          This determines which of the 6 outer layout positions is being considered.
 * @param initialDepots An array containing all 7 Depot objects, indexed by their input order (0-6).
 * @returns True if a complete and valid solution is found, false otherwise.
 */
function findSolution(positionIdxInList: number, initialDepots: Depot[]): boolean {
    // Base case: If all positions in positionsToFill have been successfully filled.
    if (positionIdxInList === positionsToFill.length) {
        // All depots are placed and orientations are set correctly.
        // Since `checkCurrentConnections` validates incrementally, if we reach here,
        // it means a valid arrangement has been found.
        return true; 
    }

    const currentBoardPosition = positionsToFill[positionIdxInList];

    // Iterate through all initial depots to find one that has not been used yet
    for (let depotId = 0; depotId < 7; depotId++) {
        if (!usedDepotIds[depotId]) {
            const depotToPlace = initialDepots[depotId];
            usedDepotIds[depotId] = true; // Mark depot as used for the current path

            // Save the current wall state for backtracking.
            // This is crucial because `depotToPlace` is a shared object.
            const originalWallsState = [...depotToPlace.walls]; 

            // Try all 6 possible rotations for the current depot
            for (let rotation = 0; rotation < 6; rotation++) {
                board[currentBoardPosition] = depotToPlace; // Place the depot on the board

                // Check if this placement and rotation is valid with already placed depots
                if (checkCurrentConnections(currentBoardPosition)) {
                    // If valid, recursively call `findSolution` for the next position
                    if (findSolution(positionIdxInList + 1, initialDepots)) {
                        return true; // Solution found! Propagate 'true' up the call stack.
                    }
                }
                // If not valid, or if the recursive call failed to find a solution,
                // backtrack: rotate the depot for the next attempt.
                depotToPlace.rotateClockwise();
            }

            // All rotations for this `depotToPlace` failed for the `currentBoardPosition`
            // or subsequent positions. Backtrack: remove the depot from the board,
            // mark it as unused, and restore its original wall state.
            board[currentBoardPosition] = null;
            usedDepotIds[depotId] = false;
            depotToPlace.walls = originalWallsState; // Restore walls to state before this depot was tried
        }
    }

    return false; // No solution found from this path
}

// --- Main execution flow ---

// 1. Read input lines (7 lines, each representing a depot's walls)
const inputLines: string[] = [];
for (let i = 0; i < 7; i++) {
    inputLines.push(readline());
}

// 2. Initialize all depots with their IDs (input index) and original wall textures
const initialDepots: Depot[] = [];
for (let i = 0; i < 7; i++) {
    initialDepots.push(new Depot(i, inputLines[i].split(' ')));
}

// 3. Pre-process the center depot (Rule 3):
//    The problem implies initialDepots[6] (the 7th line of input) is the center depot,
//    as seen in the example output mapping '6C' to the center position.
const centerDepot = initialDepots[6];
centerDepot.orientForCenterDepot(); // Apply the specific orientation rule for the center
board[3] = centerDepot; // Place the oriented center depot at its position (P3)
usedDepotIds[centerDepot.id] = true; // Mark it as used

// 4. Start the backtracking search for the remaining 6 outer positions
findSolution(0, initialDepots);

// 5. Format and print the output
const result: string[] = [];
for (let i = 0; i < 7; i++) {
    const depot = board[i];
    // A solution is guaranteed by constraints, so `depot` should not be null here.
    if (depot === null) { 
        throw new Error(`Error: Depot at position ${i} is null after solution was supposedly found.`);
    }
    result.push(`${depot.id}${depot.getRightWallTexture()}`);
}

console.log(result.join(' '));