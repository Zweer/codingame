// Define types/interfaces for better readability and type safety
type Point = { x: number; y: number; };

interface Player {
    id: number;
    x: number;
    y: number;
    bombsAvailable: number;
    bombRange: number;
}

interface Bomb {
    owner: number;
    x: number;
    y: number;
    timer: number;
    range: number;
}

// Global game dimensions and player ID (initialized once)
let GAME_WIDTH: number;
let GAME_HEIGHT: number;
let MY_ID: number;

// Directions for BFS and bomb explosion propagation (Right, Left, Down, Up)
const DX = [1, -1, 0, 0];
const DY = [0, 0, 1, -1];

/**
 * Checks if a given coordinate is within the game grid boundaries.
 */
function isValid(x: number, y: number): boolean {
    return x >= 0 && x < GAME_WIDTH && y >= 0 && y < GAME_HEIGHT;
}

/**
 * Calculates the number of boxes that would be destroyed and the cells affected by a bomb
 * placed at (bombX, bombY) with a given range.
 * It considers existing bombs as obstructions.
 */
function calculateBombEffect(
    grid: string[][],
    bombX: number,
    bombY: number,
    bombRange: number,
    existingBombs: Bomb[]
): { destroyedBoxes: number, affectedCells: Point[] } {
    let destroyedBoxes = 0;
    const affectedCells: Point[] = [];

    // Center cell (where the bomb is placed)
    if (isValid(bombX, bombY)) {
        if (grid[bombY][bombX] === '0') {
            destroyedBoxes++;
        }
        affectedCells.push({ x: bombX, y: bombY });
    }

    // Propagate explosion in 4 directions
    for (let i = 0; i < 4; i++) {
        const dx = DX[i];
        const dy = DY[i];

        for (let r = 1; r <= bombRange; r++) {
            const currentX = bombX + dx * r;
            const currentY = bombY + dy * r;

            if (!isValid(currentX, currentY)) {
                break; // Out of bounds
            }

            const isExistingBombLocation = existingBombs.some(b => b.x === currentX && b.y === currentY);
            const cellContent = grid[currentY][currentX];

            if (isExistingBombLocation) {
                // An existing bomb blocks the explosion but is included in affected cells.
                affectedCells.push({ x: currentX, y: currentY });
                break; // Stop propagation in this direction
            } else if (cellContent === '0') {
                // A box blocks the explosion, is destroyed, and is included in affected cells.
                destroyedBoxes++;
                affectedCells.push({ x: currentX, y: currentY });
                break; // Stop propagation in this direction
            } else if (cellContent === '.') {
                // Floor cell, explosion continues through it.
                affectedCells.push({ x: currentX, y: currentY });
            } else {
                // Should not happen for this puzzle's grid content, but good for robustness.
                break;
            }
        }
    }
    return { destroyedBoxes, affectedCells };
}

/**
 * Finds the closest walkable cell of a specific type ('0' for box) using BFS.
 * Bombs are considered obstacles for movement.
 * Returns the coordinates of the closest target cell.
 */
function findClosestTarget(
    start: Point,
    grid: string[][],
    currentBombs: Bomb[],
    targetCellType: string
): Point | null {
    const queue: Point[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    let targetFound: Point | null = null;

    while (queue.length > 0) {
        const current = queue.shift()!;

        // If the current cell is the target type, we found the closest one.
        // Players are always on floor cells, so `start` won't be a box.
        if (grid[current.y][current.x] === targetCellType) {
            targetFound = current;
            break; // Found the closest target of the specified type
        }

        for (let i = 0; i < 4; i++) {
            const nextX = current.x + DX[i];
            const nextY = current.y + DY[i];
            const nextPoint: Point = { x: nextX, y: nextY };
            const key = `${nextX},${nextY}`;

            if (isValid(nextX, nextY) && !visited.has(key)) {
                const isFloor = grid[nextY][nextX] === '.';
                const hasBomb = currentBombs.some(b => b.x === nextX && b.y === nextY);

                // A cell is walkable for player movement if it's a floor ('.')
                // AND there is no existing bomb on it.
                if (isFloor && !hasBomb) {
                    visited.add(key);
                    queue.push(nextPoint);
                }
            }
        }
    }
    return targetFound;
}

// Main game loop function
function main() {
    // Read initialization input: width, height, and my player ID
    [GAME_WIDTH, GAME_HEIGHT, MY_ID] = readline().split(' ').map(Number);

    // Game loop continues for each turn
    while (true) {
        // Read the current grid state
        const grid: string[][] = [];
        for (let i = 0; i < GAME_HEIGHT; i++) {
            grid.push(readline().split(''));
        }

        // Read the number of entities on the grid
        const entitiesCount = parseInt(readline());
        let myPlayer: Player | null = null;
        const currentBombs: Bomb[] = [];

        // Parse each entity
        for (let i = 0; i < entitiesCount; i++) {
            const [entityType, owner, x, y, param1, param2] = readline().split(' ').map(Number);
            if (entityType === 0) { // Player entity
                const player: Player = { id: owner, x, y, bombsAvailable: param1, bombRange: param2 };
                if (owner === MY_ID) {
                    myPlayer = player; // Store my player's current state
                }
            } else if (entityType === 1) { // Bomb entity
                currentBombs.push({ owner, x, y, timer: param1, range: param2 });
            }
        }

        // --- Decision Logic ---
        if (!myPlayer) {
            // This case should ideally not happen in a typical game.
            // If my player is somehow not found, default to staying put.
            console.log('MOVE 0 0 NO_PLAYER_FOUND');
            continue;
        }

        const myCurrentPosition = { x: myPlayer.x, y: myPlayer.y };
        const myBombRange = myPlayer.bombRange; // In Wood league, this is always 3

        let action = '';
        let targetX = -1;
        let targetY = -1;
        let message = '';

        // Calculate the potential number of boxes destroyed if a bomb is placed at my current spot
        const { destroyedBoxes: currentSpotDamage } = calculateBombEffect(
            grid, myCurrentPosition.x, myCurrentPosition.y, myBombRange, currentBombs
        );

        // Primary decision: Should I place a bomb or move?
        // Place a bomb if I have one available AND it will destroy at least one box.
        if (myPlayer.bombsAvailable > 0 && currentSpotDamage > 0) {
            action = 'BOMB';
            
            // After placing a bomb, the player attempts to move towards the specified (X,Y) target.
            // Since players are immune, staying on the bomb is an option. However, moving to a new
            // area is generally better for continued box destruction.
            // Strategy: Move towards the opposite corner of the map.
            if (myCurrentPosition.x < GAME_WIDTH / 2) { 
                targetX = GAME_WIDTH - 1; // If on left half, move right
            } else {
                targetX = 0; // If on right half, move left
            }
            if (myCurrentPosition.y < GAME_HEIGHT / 2) {
                targetY = GAME_HEIGHT - 1; // If on top half, move down
            } else {
                targetY = 0; // If on bottom half, move up
            }
            message = 'BOOM!';
        } else {
            // Cannot place a bomb effectively (either no bombs available or current spot yields no damage).
            // Therefore, the player must move.
            action = 'MOVE';
            message = 'SEARCHING';

            // Find the closest box ('0') on the map to move towards.
            const closestBox = findClosestTarget(
                myCurrentPosition, grid, currentBombs, '0'
            );

            if (closestBox) {
                targetX = closestBox.x;
                targetY = closestBox.y;
                message = 'TO_BOX';
            } else {
                // If no reachable boxes are found (e.g., all boxes destroyed or blocked),
                // move to a default central location or simply stay put.
                targetX = Math.floor(GAME_WIDTH / 2);
                targetY = Math.floor(GAME_HEIGHT / 2);
                message = 'CENTER_OR_WAIT';
            }
        }

        // Output the chosen action and its target coordinates, with an optional message.
        console.log(`${action} ${targetX} ${targetY} ${message}`);
    }
}

// Call the main function to start the game logic.
// In the CodinGame environment, `readline()` is provided globally.
// If testing locally, you might need to mock `readline` and `console.log`.
main();