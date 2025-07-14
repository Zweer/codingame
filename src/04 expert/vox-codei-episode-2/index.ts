// Initial read for width and height (fixed for the entire game)
const inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);

// Interface for a surveillance node
interface NodeState {
    id: number;
    x: number;
    y: number;
    dx: number; // -1, 0, or 1 (movement along X-axis)
    dy: number; // -1, 0, or 1 (movement along Y-axis)
}

// Global variables, persisted across turns
let globalTrackedNodes: NodeState[] = []; // List of all currently active surveillance nodes
let nextGlobalNodeId = 0; // Counter for assigning unique IDs to new nodes
let roundNumber = 0; // Tracks the current game round (0-indexed)

// Stores the static elements of the grid (walls '#', empty spaces '.').
// This doesn't change after the first round, as only '@' nodes move.
const staticGrid: string[][] = Array(height).fill(null).map(() => Array(width).fill('.'));

/**
 * Simulates a single node's movement for one turn.
 * Updates the node's position and direction based on grid boundaries and passive nodes.
 * This function modifies the node object directly.
 * Assumes that a node will always find a valid next position after a potential bounce.
 * @param node The node to simulate.
 * @param currentGrid The static grid with walls.
 */
function simulateSingleNodeMove(node: NodeState, currentGrid: string[][]) {
    let nextX = node.x + node.dx;
    let nextY = node.y + node.dy;

    // Check for collision with boundaries or passive nodes at the *attempted* next position
    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height || currentGrid[nextY][nextX] === '#') {
        // Collision detected, reverse direction
        node.dx *= -1;
        node.dy *= -1;
        // Recalculate next position with the new (reversed) direction
        nextX = node.x + node.dx;
        nextY = node.y + node.dy;
        // It's assumed that this 'bounced' position will always be valid,
        // preventing a node from being stuck or moving outside the grid.
    }

    // Update node's position to the (possibly new) nextX, nextY
    node.x = nextX;
    node.y = nextY;
}

/**
 * Gets the coordinates affected by a bomb explosion.
 * @param bombX Bomb X coordinate.
 * @param bombY Bomb Y coordinate.
 * @param currentGrid The static grid with walls, used to check explosion blockage.
 * @returns A Set of "x,y" strings representing affected cells.
 */
function getBlastRadius(bombX: number, bombY: number, currentGrid: string[][]): Set<string> {
    const affectedCells = new Set<string>();
    affectedCells.add(`${bombX},${bombY}`); // The bomb's own location is affected

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Down, Up, Right, Left
    const range = 3; // Explosion range

    for (const [dx, dy] of directions) {
        for (let r = 1; r <= range; r++) {
            const currentX = bombX + dx * r;
            const currentY = bombY + dy * r;

            // Check if out of bounds
            if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) {
                break;
            }
            // Check if blocked by a passive node
            if (currentGrid[currentY][currentX] === '#') {
                break;
            }
            affectedCells.add(`${currentX},${currentY}`);
        }
    }
    return affectedCells;
}

// Main game loop
while (true) {
    const inputs: string[] = readline().split(' ');
    const rounds: number = parseInt(inputs[0]); // Remaining turns before detection
    const bombs: number = parseInt(inputs[1]); // Number of bombs available

    const currentInputGrid: string[][] = []; // The grid as provided in the current turn's input
    const currentMapAtPositions: { [key: string]: boolean } = {}; // Map of "x,y" strings for current '@' locations

    // Read the current map and populate currentInputGrid, currentMapAtPositions, and staticGrid (on round 0)
    for (let y = 0; y < height; y++) {
        const row = readline();
        currentInputGrid.push(row.split(''));
        for (let x = 0; x < width; x++) {
            if (row[x] === '@') {
                currentMapAtPositions[`${x},${y}`] = true;
            }
            // Populate staticGrid on the very first round only
            if (roundNumber === 0 && row[x] === '#') {
                staticGrid[y][x] = '#';
            }
        }
    }

    // --- Node Tracking and Reconciliation ---
    // This section updates `globalTrackedNodes` based on the new map input.
    const newGlobalTrackedNodes: NodeState[] = [];
    
    // Create a copy of tracked nodes from the previous turn for matching
    const nodesFromPreviousTurn: NodeState[] = globalTrackedNodes.map(node => ({ ...node }));

    // Keep track of which current map '@' positions have been matched to old nodes
    const unmatchedCurrentAtPositions: { [key: string]: boolean } = { ...currentMapAtPositions };

    // Attempt to match nodes from previous turn to current map positions
    // We prioritize matching based on predicted forward movement, then bounced movement.
    for (const oldNode of nodesFromPreviousTurn) {
        let matched = false;

        // 1. Try a direct move: check if the node appears at its (currentX + dx, currentY + dy) position
        let predictedX = oldNode.x + oldNode.dx;
        let predictedY = oldNode.y + oldNode.dy;
        let predictedKey = `${predictedX},${predictedY}`;

        if (unmatchedCurrentAtPositions[predictedKey]) {
            oldNode.x = predictedX;
            oldNode.y = predictedY;
            newGlobalTrackedNodes.push(oldNode);
            delete unmatchedCurrentAtPositions[predictedKey]; // Mark this position as used
            matched = true;
        } else {
            // 2. If direct move failed, try a bounced move: check if it appears at (currentX - dx, currentY - dy)
            let bouncedX = oldNode.x - oldNode.dx;
            let bouncedY = oldNode.y - oldNode.dy;
            let bouncedKey = `${bouncedX},${bouncedY}`;

            if (unmatchedCurrentAtPositions[bouncedKey]) {
                oldNode.x = bouncedX;
                oldNode.y = bouncedY;
                oldNode.dx *= -1; // Reverse direction
                oldNode.dy *= -1;
                newGlobalTrackedNodes.push(oldNode);
                delete unmatchedCurrentAtPositions[bouncedKey]; // Mark this position as used
                matched = true;
            }
        }
        // If `matched` is false after these checks, it implies the `oldNode` was likely destroyed
        // (e.g., by a bomb from a previous turn) and thus is not added to `newGlobalTrackedNodes`.
    }

    // For the very first round, we initialize all `@` nodes and their initial directions.
    // In subsequent rounds, any `@` in `unmatchedCurrentAtPositions` would imply a new node appeared
    // or an existing one moved unpredictably. For this puzzle, we expect nodes to be tracked or destroyed.
    if (roundNumber === 0) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (currentInputGrid[y][x] === '@') {
                    // This is an initial '@' from the first map. Assign an ID and an initial direction.
                    // Heuristic for initial direction: try right, then left, then down, then up.
                    // This assumes movement is along a single axis.
                    let dx = 0;
                    let dy = 0;

                    // Try to move right
                    if (x + 1 < width && staticGrid[y][x + 1] !== '#') { dx = 1; dy = 0; }
                    // Else, try to move left
                    else if (x - 1 >= 0 && staticGrid[y][x - 1] !== '#') { dx = -1; dy = 0; }
                    // Else, try to move down
                    else if (y + 1 < height && staticGrid[y + 1][x] !== '#') { dx = 0; dy = 1; }
                    // Else, try to move up
                    else if (y - 1 >= 0 && staticGrid[y - 1][x] !== '#') { dx = 0; dy = -1; }
                    else {
                        // If the node is completely surrounded (unlikely for solvable cases based on constraints)
                        // or has no clear path, assign a default direction. It will immediately bounce if blocked.
                        dx = 1; 
                        dy = 0;
                    }
                    newGlobalTrackedNodes.push({ id: nextGlobalNodeId++, x: x, y: y, dx: dx, dy: dy });
                }
            }
        }
    }
    // Update the global list of active, tracked nodes for the current turn.
    globalTrackedNodes = newGlobalTrackedNodes;

    // --- DECISION LOGIC: Find Best Bomb Placement ---
    let bestBombX = -1;
    let bestBombY = -1;
    let maxNodesDestroyed = -1;

    // If no bombs are available or all surveillance nodes are already destroyed, WAIT.
    if (bombs === 0 || globalTrackedNodes.length === 0) {
        console.log("WAIT");
        roundNumber++;
        continue;
    }
    
    // Iterate over all possible bomb placement locations on the grid
    for (let by = 0; by < height; by++) {
        for (let bx = 0; bx < width; bx++) {
            // A bomb can only be placed on an empty cell ('.') in the *current* map.
            // It cannot be placed on a surveillance node ('@') or a passive node ('#').
            if (currentInputGrid[by][bx] !== '.') {
                continue;
            }

            // Simulate the movement of all currently tracked nodes for 3 turns into the future
            // Create deep copies of nodes to avoid modifying the actual `globalTrackedNodes`
            const simulatedNodesIn3Turns: NodeState[] = globalTrackedNodes.map(node => ({ ...node }));

            for (let i = 0; i < 3; i++) { // Simulate 3 turns (bomb fuse duration)
                for (const node of simulatedNodesIn3Turns) {
                    simulateSingleNodeMove(node, staticGrid);
                }
            }

            // Calculate the blast radius for this potential bomb placement
            const blastRadiusCells = getBlastRadius(bx, by, staticGrid);

            let currentNodesDestroyed = 0;
            // Check how many of the simulated nodes (at their 3-turn future positions) would be hit
            for (const node of simulatedNodesIn3Turns) {
                if (blastRadiusCells.has(`${node.x},${node.y}`)) {
                    currentNodesDestroyed++;
                }
            }

            // If this placement destroys more nodes than the current best, update best.
            // Prioritize higher destruction count. If counts are equal, any is fine.
            if (currentNodesDestroyed > maxNodesDestroyed) {
                maxNodesDestroyed = currentNodesDestroyed;
                bestBombX = bx;
                bestBombY = by;
            }
        }
    }

    // Output the chosen action: place a bomb or WAIT.
    if (maxNodesDestroyed > 0) {
        console.log(`${bestBombX} ${bestBombY}`);
        // Nodes hit by this bomb will be automatically excluded from `globalTrackedNodes`
        // in subsequent rounds when they no longer appear in the `currentInputGrid`.
    } else {
        // No effective bomb placement found for this turn (or no nodes to hit by any bomb).
        console.log("WAIT");
    }

    roundNumber++; // Increment turn counter for the next iteration of the loop
}