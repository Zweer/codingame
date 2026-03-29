// Standard CodinGame input/output functions (will be provided by the environment)
declare function readline(): string;
declare function print(message: any): void; // CodinGame usually maps console.log to print

/**
 * Type alias for a 3D position [x, y, z]
 */
type Position = [number, number, number];

/**
 * Type alias for a 3D direction vector [dx, dy, dz]
 */
type DirectionVector = [number, number, number];

/**
 * Maps direction characters to their corresponding 3D vectors.
 */
const DIRECTIONS: { [key: string]: DirectionVector } = {
    'U': [0, 1, 0],  // Up (+y)
    'D': [0, -1, 0], // Down (-y)
    'R': [1, 0, 0],  // Right (+x)
    'L': [-1, 0, 0], // Left (-x)
    'F': [0, 0, 1],  // Front (+z)
    'B': [0, 0, -1]  // Back (-z)
};

/**
 * Array of all possible direction characters. Used for iterating through choices.
 * The order doesn't strictly matter for correctness, as solutions are sorted at the end.
 */
const DIRECTION_CHARS = ['U', 'D', 'R', 'L', 'F', 'B'];

// Global variables to store puzzle state and results.
// Using global variables can simplify parameter passing in recursive functions
// for competitive programming contexts.
let N_GLOBAL: number; // Side length of the cube
let BLOCKS_GLOBAL: number[]; // Parsed array of segment lengths
let SOLUTIONS_GLOBAL: string[]; // List to store all found valid solutions
let TARGET_POS_GLOBAL: Position; // The target end position (N, N, N)

/**
 * 3D grid to keep track of visited cells.
 * Indices are (x-1, y-1, z-1) for coordinates (x,y,z) which range from 1 to N.
 */
let VISITED_GRID_GLOBAL: boolean[][][];

/**
 * Checks if a given position [x, y, z] is within the N x N x N cube boundaries.
 * Coordinates are 1-indexed (from 1 to N).
 */
function isValidPos(p: Position): boolean {
    return p[0] >= 1 && p[0] <= N_GLOBAL &&
           p[1] >= 1 && p[1] <= N_GLOBAL &&
           p[2] >= 1 && p[2] <= N_GLOBAL;
}

/**
 * Checks if a cell at a given position is already marked as visited.
 * Converts 1-indexed coordinates to 0-indexed array access.
 */
function isCellVisited(p: Position): boolean {
    return VISITED_GRID_GLOBAL[p[0] - 1][p[1] - 1][p[2] - 1];
}

/**
 * Marks or unmarks a cell at a given position in the visited grid.
 * Converts 1-indexed coordinates to 0-indexed array access.
 * @param p The position to mark/unmark.
 * @param value True to mark as visited, false to unmark.
 */
function markCellVisited(p: Position, value: boolean): void {
    VISITED_GRID_GLOBAL[p[0] - 1][p[1] - 1][p[2] - 1] = value;
}

/**
 * Checks if two direction vectors are opposite (e.g., R and L).
 */
function isOpposite(v1: DirectionVector, v2: DirectionVector): boolean {
    return v1[0] === -v2[0] && v1[1] === -v2[1] && v1[2] === -v2[2];
}

/**
 * Checks if two direction vectors are orthogonal (at a 90-degree angle).
 * This is determined by their dot product being 0.
 */
function isOrthogonal(v1: DirectionVector, v2: DirectionVector): boolean {
    return (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) === 0;
}

/**
 * Main Depth-First Search (DFS) function to explore possible Cubax foldings.
 *
 * @param currentPos The (x,y,z) coordinates of the *starting block* of the current segment.
 *                   This block is assumed to be already marked as visited (either by the
 *                   initial setup or by the end of the previous segment).
 * @param segmentDir The direction vector chosen for the *current* segment being laid out.
 * @param segmentIndex The index of the current segment in the BLOCKS_GLOBAL array.
 * @param path The string of direction characters accumulated so far for segments
 *             *prior* to the current one. The direction for the current segment
 *             will be appended when making recursive calls.
 */
function solve(currentPos: Position, segmentDir: DirectionVector, segmentIndex: number, path: string): void {
    const segmentLength = BLOCKS_GLOBAL[segmentIndex];
    let lastBlockPos: Position = [...currentPos]; // Tracks the end of the *current* segment being laid out
    let pathPointsMarkedByThisSegment: Position[] = []; // Stores new points marked *by THIS segment* for backtracking

    // Lay out the current segment.
    // We need to place 'segmentLength - 1' additional blocks because 'currentPos' is the first block.
    for (let i = 0; i < segmentLength - 1; i++) {
        const nextX = lastBlockPos[0] + segmentDir[0];
        const nextY = lastBlockPos[1] + segmentDir[1];
        const nextZ = lastBlockPos[2] + segmentDir[2];
        const nextBlockPos: Position = [nextX, nextY, nextZ];

        // Validate the next block's position:
        // 1. Must be within the cube boundaries.
        // 2. Must not already be visited (no self-intersections).
        if (!isValidPos(nextBlockPos) || isCellVisited(nextBlockPos)) {
            // Path invalid: out of bounds or collision.
            // Backtrack: Unmark any points that were marked within *this segment's current placement loop*.
            for (const p of pathPointsMarkedByThisSegment) {
                markCellVisited(p, false);
            }
            return; // This path branch is a dead end
        }

        // Mark the new block as visited and add it to the list for backtracking.
        markCellVisited(nextBlockPos, true);
        pathPointsMarkedByThisSegment.push(nextBlockPos);
        lastBlockPos = nextBlockPos; // Move to the newly placed block
    }

    // After successfully placing the current segment, check if this was the last segment.
    if (segmentIndex === BLOCKS_GLOBAL.length - 1) {
        // If it's the last segment, check if its endpoint is the target position.
        if (lastBlockPos[0] === TARGET_POS_GLOBAL[0] &&
            lastBlockPos[1] === TARGET_POS_GLOBAL[1] &&
            lastBlockPos[2] === TARGET_POS_GLOBAL[2]) {
            SOLUTIONS_GLOBAL.push(path); // Found a valid solution path!
        }
        // Whether a solution was found or not, this branch is complete for this path.
        // Backtrack: Unmark all cells that were marked by *this segment*.
        for (const p of pathPointsMarkedByThisSegment) {
            markCellVisited(p, false);
        }
        return; // End of this DFS branch
    }

    // If not the last segment, try to choose a direction for the *next* segment.
    // The starting point for the next segment will be 'lastBlockPos'.
    for (const nextDirChar of DIRECTION_CHARS) {
        const nextDirVector = DIRECTIONS[nextDirChar as keyof typeof DIRECTIONS];

        // Apply turn constraints:
        // 1. The next segment's direction must be orthogonal (90 degrees) to the current segment's direction.
        // 2. No U-turns allowed (the next direction cannot be directly opposite to the current one).
        if (!isOrthogonal(segmentDir, nextDirVector) || isOpposite(segmentDir, nextDirVector)) {
             continue; // Skip invalid turn choices
        }
        
        // Recursively call solve for the next segment.
        // The path string is updated by appending the character for the current segment's direction.
        solve(lastBlockPos, nextDirVector, segmentIndex + 1, path + nextDirChar);
    }

    // Backtrack: After all recursive calls for this segment's choices have returned,
    // unmark all cells that were occupied by the *current* segment. This cleans up
    // the grid for other branches of the DFS.
    for (const p of pathPointsMarkedByThisSegment) {
        markCellVisited(p, false);
    }
}

/**
 * Main function to read input, initialize the puzzle state, and start the DFS.
 */
function main() {
    N_GLOBAL = parseInt(readline());
    BLOCKS_GLOBAL = readline().split('').map(Number); // Convert "222" to [2, 2, 2]

    TARGET_POS_GLOBAL = [N_GLOBAL, N_GLOBAL, N_GLOBAL];
    SOLUTIONS_GLOBAL = [];

    // Initialize the 3D visited grid with all cells set to false (unvisited).
    VISITED_GRID_GLOBAL = Array(N_GLOBAL).fill(0).map(() =>
        Array(N_GLOBAL).fill(0).map(() =>
            Array(N_GLOBAL).fill(false)
        )
    );

    // Mark the very first block of Cubax (at 1,1,1) as visited.
    markCellVisited([1, 1, 1], true);

    // Start the DFS by trying initial directions for the first segment (BLOCKS_GLOBAL[0]).
    // According to the problem statement, "there will be no valid solution starting by D, L or B".
    const initialDirections = ['R', 'U', 'F'];
    for (const dirChar of initialDirections) {
        const initialDirVector = DIRECTIONS[dirChar as keyof typeof DIRECTIONS];
        // The first segment starts at (1,1,1). The path string starts with its chosen direction.
        solve([1, 1, 1], initialDirVector, 0, dirChar);
    }

    // Sort all found solutions alphabetically before printing.
    SOLUTIONS_GLOBAL.sort();
    SOLUTIONS_GLOBAL.forEach(s => console.log(s));
}

// Call the main function to start the program execution.
main();