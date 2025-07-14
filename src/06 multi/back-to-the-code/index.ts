// Define constants for grid dimensions
const GRID_WIDTH = 35;
const GRID_HEIGHT = 20;

/**
 * Helper function to check if coordinates are within grid bounds.
 * @param x The X coordinate.
 * @param y The Y coordinate.
 * @returns True if coordinates are valid, false otherwise.
 */
function isValidCoord(x: number, y: number): boolean {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

/**
 * Calculates the number of neutral cells that would be enclosed if `ownerId` cells were walls.
 * This is done using a BFS from the grid's boundaries.
 * @param tempGrid The simulated grid state.
 * @param ownerId The ID of the player whose cells form "walls" (e.g., '0' for self).
 * @returns The count of enclosed neutral cells.
 */
function getEnclosedCellsCount(tempGrid: string[][], ownerId: string): number {
    const visited: boolean[][] = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(false));
    const queue: [number, number][] = [];
    // Directions for BFS: [dx, dy] for Down, Up, Right, Left
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // Initialize BFS by adding all border cells that are NOT owned by `ownerId`
    // These cells represent paths to the "outside" of the enclosed area.
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Check if it's a border cell
            if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
                // If the cell is not owned by `ownerId` and not yet visited, add it to queue
                if (tempGrid[y][x] !== ownerId && !visited[y][x]) {
                    queue.push([x, y]);
                    visited[y][x] = true;
                }
            }
        }
    }

    let head = 0; // Pointer for queue (optimizes array shifts)
    while(head < queue.length) {
        const [currX, currY] = queue[head++];

        for (const [dx, dy] of directions) {
            const nextX = currX + dx;
            const nextY = currY + dy;

            // If neighbor is valid and not visited
            if (isValidCoord(nextX, nextY) && !visited[nextY][nextX]) {
                // We can traverse through neutral cells ('.') and opponent cells ('1', '2', '3')
                // but we cannot traverse through cells owned by `ownerId` (which act as walls).
                if (tempGrid[nextY][nextX] !== ownerId) {
                    visited[nextY][nextX] = true;
                    queue.push([nextX, nextY]);
                }
            }
        }
    }

    let enclosedCount = 0;
    // After the BFS, iterate through the grid to find neutral cells ('.')
    // that were NOT visited. These are the cells truly enclosed by `ownerId`'s territory.
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (tempGrid[y][x] === '.' && !visited[y][x]) {
                enclosedCount++;
            }
        }
    }
    return enclosedCount;
}

// Global variables to store the long-term target coordinates for our bot.
// This allows the bot to continue moving towards a target over multiple turns.
let currentTargetX: number = -1;
let currentTargetY: number = -1;

// Read initialization data: number of opponents.
const opponentCount: number = parseInt(readline());

// Main game loop, runs indefinitely for each game turn.
while (true) {
    // Read current game round.
    const gameRound: number = parseInt(readline());

    // Read my player's coordinates and 'back in time' ability status.
    const [myPlayerX, myPlayerY, myBackInTimeLeft] = readline().split(' ').map(Number);
    const myPlayer = { x: myPlayerX, y: myPlayerY, backInTimeLeft: myBackInTimeLeft, id: 0 };

    // Read opponent data.
    const opponents: { x: number, y: number, backInTimeLeft: number, id: number }[] = [];
    for (let i = 0; i < opponentCount; i++) {
        const [opponentX, opponentY, opponentBackInTimeLeft] = readline().split(' ').map(Number);
        // Opponent IDs are 1, 2, 3 based on input order.
        opponents.push({ x: opponentX, y: opponentY, backInTimeLeft: opponentBackInTimeLeft, id: i + 1 });
    }

    // Read the grid state (20 rows of 35 characters).
    const grid: string[][] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
        grid.push(readline().split('')); // Split string into array of characters.
    }

    // Check if my player has reached the previously set target.
    if (myPlayer.x === currentTargetX && myPlayer.y === currentTargetY) {
        // If target reached, reset it to -1 to indicate a new target needs to be found.
        currentTargetX = -1;
        currentTargetY = -1;
    }

    // If no current target, or if the previous target was reached, find the best new one.
    if (currentTargetX === -1) {
        let bestTarget: { x: number, y: number } | null = null;
        let maxScore = -Infinity; // Initialize with a very low score to ensure any valid target is chosen.

        // Iterate through all cells on the grid to evaluate them as potential targets.
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                // Only consider neutral cells ('.') as potential targets.
                if (grid[y][x] === '.') {
                    // Check if any opponent is currently occupying this neutral cell.
                    // It's generally not useful or allowed to move onto an opponent's current spot.
                    let isOpponentOccupying = false;
                    for (const opp of opponents) {
                        // Check if opponent is still in game (x !== -1 means they are playing).
                        if (opp.x === x && opp.y === y && opp.x !== -1) { 
                            isOpponentOccupying = true;
                            break;
                        }
                    }

                    if (!isOpponentOccupying) {
                        // Calculate Manhattan distance to the potential target.
                        const dist = Math.abs(x - myPlayer.x) + Math.abs(y - myPlayer.y);
                        
                        // Base score for directly claiming a neutral cell.
                        let currentCellScore = 1;

                        // Simulate claiming this cell to check for enclosure bonus.
                        // Create a deep copy of the grid to avoid modifying the actual game state for simulation.
                        const tempGrid = grid.map(row => [...row]); 
                        tempGrid[y][x] = '0'; // Simulate our player claiming this cell.

                        // Define a weight for enclosed cells. A higher weight makes enclosure more prioritized.
                        const ENCLOSURE_WEIGHT = 100; // Tune this value (e.g., 100 means 1 enclosed cell is worth 100 direct claims).
                        // Calculate the bonus from potential enclosures.
                        const enclosureBonus = getEnclosedCellsCount(tempGrid, '0') * ENCLOSURE_WEIGHT;

                        // Calculate total score:
                        // - Higher for directly claiming a cell.
                        // - Higher for more enclosed cells (weighted).
                        // - Lower for greater distance (penalty).
                        const score = currentCellScore + enclosureBonus - dist;

                        // If this target has a better score, update `bestTarget`.
                        if (score > maxScore) {
                            maxScore = score;
                            bestTarget = { x, y };
                        }
                    }
                }
            }
        }

        if (bestTarget) {
            // Set the chosen best target as the current long-term target.
            currentTargetX = bestTarget.x;
            currentTargetY = bestTarget.y;
        } else {
            // Fallback: If no valid neutral cells are found (e.g., board is full, or all neutral cells are blocked).
            // In this scenario, the game is likely nearing its end or stuck.
            // Move to an arbitrary safe location like (0,0).
            console.error("No valid neutral target found. Falling back to (0,0).");
            currentTargetX = 0;
            currentTargetY = 0;
        }
    }

    // Output the chosen target coordinates. The game engine handles the step-by-step movement towards this target.
    console.log(`${currentTargetX} ${currentTargetY}`);
}