// Define constants for grid dimensions
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

// Helper interface for coordinates
interface Point {
    x: number;
    y: number;
}

// Helper interface for player data
interface Player {
    x0: number; // Tail X
    y0: number; // Tail Y
    x1: number; // Head X
    y1: number; // Head Y
}

// Enum-like object for directions with their corresponding dx, dy, and string name
const DIRECTIONS = {
    UP: { dx: 0, dy: -1, name: "UP" },
    DOWN: { dx: 0, dy: 1, name: "DOWN" },
    LEFT: { dx: -1, dy: 0, name: "LEFT" },
    RIGHT: { dx: 1, dy: 0, name: "RIGHT" },
};

/**
 * Performs a Breadth-First Search (BFS) to calculate the size of the reachable free area
 * starting from (startX, startY) on a given grid.
 *
 * @param startX X-coordinate to start the BFS from.
 * @param startY Y-coordinate to start the BFS from.
 * @param initialOccupiedGrid The grid representing occupied cells. This grid is deep copied
 *                            before modification to avoid side effects.
 * @returns The number of free cells reachable from (startX, startY), including (startX, startY) itself.
 */
function getReachableAreaSize(startX: number, startY: number, initialOccupiedGrid: boolean[][]): number {
    // Create a deep copy of the grid to simulate moves without affecting the original game state
    const gridCopy = initialOccupiedGrid.map(row => [...row]);

    // If the starting point is already occupied, no area is reachable.
    // This check is crucial for BFS to work correctly on a grid where `startX, startY` might be the player's *next* position.
    if (gridCopy[startY][startX]) {
        return 0;
    }

    const queue: Point[] = [{ x: startX, y: startY }];
    gridCopy[startY][startX] = true; // Mark starting point as visited/occupied for this BFS traversal
    let count = 0; // Initialize count of reachable cells

    while (queue.length > 0) {
        const { x: currX, y: currY } = queue.shift()!; // Dequeue current cell
        count++; // Increment count for the current cell, as it's reachable

        // Explore all four possible directions (UP, DOWN, LEFT, RIGHT)
        for (const dirName of Object.keys(DIRECTIONS)) {
            const dir = DIRECTIONS[dirName as keyof typeof DIRECTIONS]; // Get dx, dy for the direction
            const nextX = currX + dir.dx;
            const nextY = currY + dir.dy;

            // Check if the next cell is within grid boundaries and is not already occupied/visited
            if (nextX >= 0 && nextX < GRID_WIDTH && nextY >= 0 && nextY < GRID_HEIGHT &&
                !gridCopy[nextY][nextX]) {
                gridCopy[nextY][nextX] = true; // Mark as visited to prevent cycles and re-counting
                queue.push({ x: nextX, y: nextY }); // Enqueue the next reachable cell
            }
        }
    }
    return count; // Return the total number of reachable free cells
}

// Game loop - runs for each turn
while (true) {
    // Read N (total number of players) and P (your player ID)
    const [N, P] = readline().split(' ').map(Number);

    const players: Player[] = [];
    // Initialize the game grid, marking all cells as initially free
    const occupiedGrid: boolean[][] = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(false));

    // Read player information and populate the occupied grid
    for (let i = 0; i < N; i++) {
        const [X0, Y0, X1, Y1] = readline().split(' ').map(Number);
        players.push({ x0: X0, y0: Y0, x1: X1, y1: Y1 });

        // If a player is active (coordinates are not -1), mark their trail on the grid
        if (X1 !== -1) {
            // Tron trails are always straight lines (horizontal or vertical)
            if (X0 === X1) { // Vertical trail segment
                for (let y = Math.min(Y0, Y1); y <= Math.max(Y0, Y1); y++) {
                    occupiedGrid[y][X0] = true;
                }
            } else { // Horizontal trail segment (Y0 must be equal to Y1)
                for (let x = Math.min(X0, X1); x <= Math.max(X0, X1); x++) {
                    occupiedGrid[Y0][x] = true;
                }
            }
        }
    }

    // Get your player's current head position
    const myPlayer = players[P];
    const myX = myPlayer.x1;
    const myY = myPlayer.y1;

    let bestMove = "UP"; // Default move, used if no valid move or all moves lead to 0 area
    let maxArea = -1; // Initialize with -1 to ensure any valid area is greater

    // Evaluate each possible direction (UP, DOWN, LEFT, RIGHT)
    for (const dirName of Object.keys(DIRECTIONS)) {
        const dir = DIRECTIONS[dirName as keyof typeof DIRECTIONS];
        const nextX = myX + dir.dx;
        const nextY = myY + dir.dy;

        // Check if the potential next move is within grid boundaries and not already occupied
        if (nextX >= 0 && nextX < GRID_WIDTH && nextY >= 0 && nextY < GRID_HEIGHT &&
            !occupiedGrid[nextY][nextX]) {
            // This move is valid. Calculate the reachable free area if we make this move.
            // The BFS `getReachableAreaSize` will count cells starting from `(nextX, nextY)`
            // assuming `(nextX, nextY)` itself is now occupied by us.
            const area = getReachableAreaSize(nextX, nextY, occupiedGrid);

            // If this move leads to a larger reachable area, choose it as the best move so far
            if (area > maxArea) {
                maxArea = area;
                bestMove = dir.name;
            }
        }
        // If a move is invalid (out of bounds or already occupied), it's not considered.
        // If all moves are invalid (e.g., trapped), `bestMove` will remain the default "UP"
        // and cause an unavoidable loss, which is expected in such a scenario.
    }

    // Output the chosen best move for this turn
    console.log(bestMove);
}