// Helper functions for grid access and boundary checks
let mapGrid: string[][];
let mapWidth: number;
let mapHeight: number;

/**
 * Checks if a cell (r, c) is within map bounds and is an open tile ('.').
 * @param r The row index.
 * @param c The column index.
 * @returns True if the cell is valid and open, false otherwise.
 */
function isValid(r: number, c: number): boolean {
    return r >= 0 && r < mapHeight && c >= 0 && c < mapWidth && mapGrid[r][c] === '.';
}

/**
 * Checks if a cell (r, c) is blocked (out of bounds or a wall '#').
 * @param r The row index.
 * @param c The column index.
 * @returns True if the cell is blocked, false otherwise.
 */
function isBlocked(r: number, c: number): boolean {
    return !isValid(r, c); // Includes out of bounds and '#'
}

// Directions array: N, NE, E, SE, S, SW, W, NW
// dr: row change, dc: column change
const DIRS = [
    { dr: -1, dc: 0 },   // N (0)
    { dr: -1, dc: 1 },   // NE (1)
    { dr: 0, dc: 1 },    // E (2)
    { dr: 1, dc: 1 },    // SE (3)
    { dr: 1, dc: 0 },    // S (4)
    { dr: 1, dc: -1 },   // SW (5)
    { dr: 0, dc: -1 },   // W (6)
    { dr: -1, dc: -1 }    // NW (7)
];

// Map (dr, dc) to direction index for quick lookup
const DIR_TO_IDX = new Map<string, number>();
DIRS.forEach((dir, idx) => {
    DIR_TO_IDX.set(`${dir.dr},${dir.dc}`, idx);
});

/**
 * Gets the index of a direction vector.
 * @param dr Row change.
 * @param dc Column change.
 * @returns The integer index corresponding to the direction.
 */
function getDirIdx(dr: number, dc: number): number {
    return DIR_TO_IDX.get(`${dr},${dc}`)!;
}

// Precomputed distances: distances[dirIdx][row][col]
// Value is distance from (row, col) to its next pruned neighbor in 'dirIdx' direction.
// A value of 0 means (row, col) itself is a wall/pruned neighbor (used for DP base case).
// MAX_DIST indicates no pruned neighbor within the map bounds.
const MAX_DIST = 1000; 

let distances: number[][][]; // [dirIdx][row][col]

/**
 * Checks if a cell (currR, currC) is a Jump Point (JP) when approached from (prevR, prevC).
 * This function implements the forced neighbor conditions and recursive conditions as per JPS+ paper (Section 14.2).
 * @param currR Current row.
 * @param currC Current column.
 * @param prevR Previous row (parent in the path).
 * @param prevC Previous column (parent in the path).
 * @returns true if (currR, currC) is a jump point, false otherwise.
 */
function isJumpPoint(currR: number, currC: number, prevR: number, prevC: number): boolean {
    // A wall or out-of-bounds cell cannot be a jump point
    if (!isValid(currR, currC)) {
        return false;
    }

    const dr_move = currR - prevR; // Row change from prev to curr
    const dc_move = currC - prevC; // Column change from prev to curr

    // Cardinal move (either dr_move or dc_move is 0)
    if (dr_move === 0 || dc_move === 0) {
        // Check for forced neighbors due to orthogonal obstructions
        // These conditions identify if moving straight from 'prev' to 'curr' forces a diagonal detour
        // due to a nearby obstacle and an open diagonal path around it.

        // Orthogonal 1: (currR + dc_move, currC - dr_move) is the location of the orthogonal obstacle.
        // The corresponding diagonal cell from curr is (currR + dc_move + dr_move, currC - dr_move + dc_move).
        const orth1_r = currR + dc_move;
        const orth1_c = currC - dr_move;
        const diag1_r = currR + dc_move + dr_move;
        const diag1_c = currC - dr_move + dc_move;
        if (isBlocked(orth1_r, orth1_c) && isValid(diag1_r, diag1_c)) {
            return true;
        }

        // Orthogonal 2: The other orthogonal obstacle.
        const orth2_r = currR - dc_move;
        const orth2_c = currC + dr_move;
        const diag2_r = currR - dc_move + dr_move;
        const diag2_c = currC + dr_move + dc_move;
        if (isBlocked(orth2_r, orth2_c) && isValid(diag2_r, diag2_c)) {
            return true;
        }
    } 
    // Diagonal move (both dr_move and dc_move are non-zero)
    else {
        // Check for forced neighbors due to cardinal obstructions (relative to 'curr' cell).
        // These identify if moving diagonally to 'curr' forces a path because a cardinal shortcut
        // (if one cardinal component of the diagonal was blocked) would have been suboptimal.

        // Block on one cardinal side (e.g., if moving NE to (currR,currC), check (currR, currC-1) which is West).
        // If (currR, currC - dc_move) is blocked and (currR + dr_move, currC - dc_move) is open.
        if (isBlocked(currR, currC - dc_move) && isValid(currR + dr_move, currC - dc_move)) {
            return true;
        }
        // Block on other cardinal side (e.g., if moving NE to (currR,currC), check (currR+1, currC) which is South).
        // If (currR - dr_move, currC) is blocked and (currR - dr_move, currC + dc_move) is open.
        if (isBlocked(currR - dr_move, currC) && isValid(currR - dr_move, currC + dc_move)) {
            return true;
        }

        // Recursive conditions for diagonal moves:
        // A diagonal node 'curr' is a JP if a cardinal node leading to 'curr' is a JP.
        // This leverages the `distances` table that has already been filled for cardinal directions.
        
        // Check vertical sub-path: (verticalPredecessorR, verticalPredecessorC) is the cell immediately before 'curr'
        // along the vertical component of the diagonal path.
        const verticalPredecessorR = currR - dr_move;
        const verticalPredecessorC = currC;
        if (isValid(verticalPredecessorR, verticalPredecessorC)) { // Only check if the predecessor cell is open
            // The direction from `(verticalPredecessorR, verticalPredecessorC)` TO `(currR, currC)` is `(dr_move, 0)`.
            const verticalDirIdx = getDirIdx(dr_move, 0); 
            // If `distances[verticalDirIdx][verticalPredecessorR][verticalPredecessorC]` is 1, it means
            // `(verticalPredecessorR, verticalPredecessorC)` is a JP when traveling in `(dr_move, 0)` direction.
            if (distances[verticalDirIdx][verticalPredecessorR][verticalPredecessorC] === 1) {
                return true;
            }
        }
        
        // Check horizontal sub-path: (horizontalPredecessorR, horizontalPredecessorC) is the cell immediately before 'curr'
        // along the horizontal component of the diagonal path.
        const horizontalPredecessorR = currR;
        const horizontalPredecessorC = currC - dc_move;
        if (isValid(horizontalPredecessorR, horizontalPredecessorC)) { // Only check if the predecessor cell is open
            // The direction from `(horizontalPredecessorR, horizontalPredecessorC)` TO `(currR, currC)` is `(0, dc_move)`.
            const horizontalDirIdx = getDirIdx(0, dc_move); 
            if (distances[horizontalDirIdx][horizontalPredecessorR][horizontalPredecessorC] === 1) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Performs the JPS+ preprocessing phase by computing distances to the nearest
 * wall or jump point for every open tile in all 8 directions using dynamic programming.
 */
function preprocess(): void {
    // Initialize distances table for all 8 directions.
    // Each cell's distance is initially MAX_DIST (infinity).
    distances = Array(8).fill(0).map(() => 
        Array(mapHeight).fill(0).map(() => 
            Array(mapWidth).fill(MAX_DIST)
        )
    );

    // Phase 1: Initialize distances for wall cells.
    // A wall cell (r,c) is a "pruned neighbor" at distance 0 from itself (for DP purposes).
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            if (mapGrid[r][c] === '#') {
                for (let i = 0; i < 8; i++) {
                    distances[i][r][c] = 0;
                }
            }
        }
    }

    // Phase 2: Propagate distances using dynamic programming.
    // The `scanOrders` define the direction of traversal for DP.
    // `(parent_dr, parent_dc)` is the direction to find the *previous* cell for DP propagation.
    // The `current_dr, current_dc` is the direction for which we are calculating distances (`dirIdx`).
    // Scan order ensures that `distances[dirIdx][prevR][prevC]` is computed before `distances[dirIdx][r][c]`.
    const scanOrders = [
        // Cardinal directions (processed first to resolve recursive dependencies for diagonal passes)
        // [parent_dr, parent_dc, startR, endR, stepR, startC, endC, stepC]
        [1, 0, 0, mapHeight, 1, 0, mapWidth, 1],      // N (current_dr: -1, dc: 0). Parent is (1,0). Scan rows top-to-bottom.
        [-1, 0, mapHeight - 1, -1, -1, 0, mapWidth, 1], // S (current_dr: 1, dc: 0). Parent is (-1,0). Scan rows bottom-to-top.
        [0, 1, 0, mapHeight, 1, 0, mapWidth, 1],      // W (current_dr: 0, dc: -1). Parent is (0,1). Scan cols left-to-right.
        [0, -1, 0, mapHeight, 1, mapWidth - 1, -1, -1], // E (current_dr: 0, dc: 1). Parent is (0,-1). Scan cols right-to-left.
        
        // Diagonal directions (processed second)
        // [parent_dr, parent_dc, startR, endR, stepR, startC, endC, stepC]
        [1, 1, 0, mapHeight, 1, 0, mapWidth, 1],         // NW (current_dr: -1, dc: -1). Parent is (1,1). Scan top-left to bottom-right.
        [1, -1, 0, mapHeight, 1, mapWidth - 1, -1, -1],   // NE (current_dr: -1, dc: 1). Parent is (1,-1). Scan top-right to bottom-left.
        [-1, 1, mapHeight - 1, -1, -1, 0, mapWidth, 1],   // SW (current_dr: 1, dc: -1). Parent is (-1,1). Scan bottom-left to top-right.
        [-1, -1, mapHeight - 1, -1, -1, mapWidth - 1, -1, -1] // SE (current_dr: 1, dc: 1). Parent is (-1,-1). Scan bottom-right to top-left.
    ];

    for (const [parent_dr, parent_dc, startR, endR, stepR, startC, endC, stepC] of scanOrders) {
        // Calculate the direction vector for the current pass (opposite of parent direction)
        const current_dr = -parent_dr;
        const current_dc = -parent_dc;
        const dirIdx = getDirIdx(current_dr, current_dc);

        for (let r = startR; r !== endR; r += stepR) {
            for (let c = startC; c !== endC; c += stepC) {
                if (mapGrid[r][c] === '.') { // Only process open cells
                    // Calculate the coordinates of the cell "behind" (r,c) in the current_dr, current_dc direction
                    // This is the `prevR, prevC` argument for `isJumpPoint` and for DP propagation
                    const prevR = r + parent_dr; 
                    const prevC = c + parent_dc;

                    // If (r,c) is a Jump Point in `current_dr, current_dc` direction from `prevR, prevC`
                    if (isJumpPoint(r, c, prevR, prevC)) {
                        distances[dirIdx][r][c] = 1; // Distance of 1 to itself as a JP
                    } 
                    // If not a JP, then propagate distance from the previous cell if it's valid (open and within bounds)
                    else if (isValid(prevR, prevC)) {
                        // The `distances[dirIdx][prevR][prevC]` already holds the distance from (prevR, prevC)
                        // to its next pruned neighbor in the same `current_dr, current_dc` direction.
                        if (distances[dirIdx][prevR][prevC] !== MAX_DIST) {
                            distances[dirIdx][r][c] = 1 + distances[dirIdx][prevR][prevC];
                        }
                    }
                    // If not a JP and prev cell is not valid (e.g., at map edge or is a wall), 
                    // (r,c) maintains MAX_DIST, indicating no JP/wall in this direction within the map bounds.
                }
            }
        }
    }
}

/**
 * Prints the precomputed distances in the required format.
 * The distance `d` from the `distances` table means the target is `d` steps away.
 * If the target is a wall (including out-of-bounds), output `-d`. Otherwise, output `d`.
 */
function printResults(): void {
    const outputLines: string[] = [];
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            if (mapGrid[r][c] === '.') { // Only output for open tiles
                const currentTileDistances: number[] = [];
                for (let i = 0; i < 8; i++) {
                    const d = distances[i][r][c]; // Get the precomputed distance from (r,c) in direction i
                    
                    // The target is `d` steps away from `(r,c)` in direction `i`.
                    const targetR = r + DIRS[i].dr * d;
                    const targetC = c + DIRS[i].dc * d;

                    let outputVal: number;
                    // The MAX_DIST case should not be reached in valid test scenarios for CodinGame
                    // because the map boundaries and obstacles ensure a path always hits something.
                    // An out-of-bounds cell is considered a wall by `isBlocked`.
                    if (isBlocked(targetR, targetC)) { // If target `d` steps away is a wall (including out of bounds)
                        outputVal = -d;
                    } else { // Target `d` steps away is an open cell, meaning it's a Jump Point
                        outputVal = d;
                    }
                    currentTileDistances.push(outputVal);
                }
                outputLines.push(`${c} ${r} ${currentTileDistances.join(' ')}`);
            }
        }
    }
    outputLines.forEach(line => console.log(line));
}

// --- Main Program Execution ---
// Read input from CodinGame's standard input (global `readline` function)
const inputs: string[] = readline().split(' ');
mapWidth = parseInt(inputs[0]);
mapHeight = parseInt(inputs[1]);

mapGrid = [];
for (let i = 0; i < mapHeight; i++) {
    mapGrid.push(readline().split(''));
}

// Perform the preprocessing
preprocess();

// Print the results
printResults();