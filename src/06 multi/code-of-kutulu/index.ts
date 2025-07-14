// The `readline()` function is provided by the CodinGame environment.
// For local testing, you might need to mock it.
// Example mock for local testing:
/*
const mockInput = [
    "10", "10",
    "##########",
    "#........#",
    "#........#",
    "#...w....#",
    "#........#",
    "#........#",
    "#........#",
    "#........#",
    "#........#",
    "##########",
    "0 0 0 0", // Dummy line for future leagues
    "2", // entityCount for turn 1
    "EXPLORER 0 1 1 250 0 0", // My explorer
    "EXPLORER 1 8 8 250 0 0", // Other explorer
    "3", // entityCount for turn 2
    "EXPLORER 0 1 1 247 0 0",
    "EXPLORER 1 8 8 247 0 0",
    "WANDERER 100 1 2 5 1 0", // Wanderer targeting explorer 0 (me) at 1,2
    "3", // entityCount for turn 3
    "EXPLORER 0 1 1 246 0 0",
    "EXPLORER 1 8 8 246 0 0",
    "WANDERER 100 1 2 5 1 0", // Wanderer still at 1,2 (moved there)
];
let mockInputIndex = 0;
const readline = () => mockInput[mockInputIndex++];
const print = console.log; // In CodinGame, use console.log for output.
*/

interface Point {
    x: number;
    y: number;
}

interface Entity extends Point {
    type: string; // EXPLORER | WANDERER
    id: number;
    param0: number; // For EXPLORER: sanity; For WANDERER (SPAWNING): time before spawn; For WANDERER (WANDERING): time before recall
    param1: number; // For EXPLORER: ignore; For WANDERER: state (0=SPAWNING, 1=WANDERING)
    param2: number; // For EXPLORER: ignore; For WANDERER: target explorer ID (-1 if no explicit target)
}

let width: number;
let height: number;
let grid: string[][] = []; // Map grid: '#' for wall, '.' for empty, 'w' for wanderer spawn
let myExplorerId: number = -1; // My explorer's unique ID

// Helper to calculate Manhattan distance between two points
function manhattanDistance(p1: Point, p2: Point): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

/**
 * Performs a Breadth-First Search (BFS) to find the shortest path from a start point to a target point on the grid.
 * Returns the first step to take on the shortest path and the distance to the target.
 *
 * @param start - The starting point {x, y}.
 * @param target - The target point {x, y}.
 * @param mapGrid - The 2D array representing the game map.
 * @param mapWidth - The width of the map.
 * @param mapHeight - The height of the map.
 * @returns An object containing `nextStep` (the next Point to move to, or null if already at target or unreachable) and `distance` (the path length, or -1 if unreachable).
 */
function bfs(start: Point, target: Point, mapGrid: string[][], mapWidth: number, mapHeight: number): { nextStep: Point | null, distance: number } {
    if (start.x === target.x && start.y === target.y) {
        return { nextStep: null, distance: 0 }; // Already at target
    }

    const queue: { pos: Point, dist: number }[] = [];
    const parentMap: Map<string, Point> = new Map(); // Stores parent of each visited cell to reconstruct path
    const visited: Set<string> = new Set(); // Stores "x,y" strings of visited cells

    queue.push({ pos: start, dist: 0 });
    visited.add(`${start.x},${start.y}`);

    const dx = [0, 0, 1, -1]; // Directions for movement (up, down, right, left)
    const dy = [1, -1, 0, 0];

    let targetFoundNode: { pos: Point, dist: number } | null = null;

    while (queue.length > 0) {
        const current = queue.shift()!; // Dequeue the first element

        if (current.pos.x === target.x && current.pos.y === target.y) {
            targetFoundNode = current;
            break; // Target found, exit BFS
        }

        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nx = current.pos.x + dx[i];
            const ny = current.pos.y + dy[i];
            const nextKey = `${nx},${ny}`; // Unique key for visited set and parentMap

            // Check if neighbor is within bounds, not a wall, and not visited
            if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight && mapGrid[ny][nx] !== '#' && !visited.has(nextKey)) {
                visited.add(nextKey);
                parentMap.set(nextKey, current.pos); // Store current as parent of neighbor
                queue.push({ pos: { x: nx, y: ny }, dist: current.dist + 1 });
            }
        }
    }

    if (targetFoundNode) {
        let currentPos = targetFoundNode.pos;
        let nextStepToTarget: Point | null = null;

        // Path reconstruction: Traverse back from target to find the step immediately after start
        while (currentPos.x !== start.x || currentPos.y !== start.y) {
            const parent = parentMap.get(`${currentPos.x},${currentPos.y}`);
            if (!parent) { // Should not happen if path was correctly found
                nextStepToTarget = null;
                break;
            }
            if (parent.x === start.x && parent.y === start.y) {
                nextStepToTarget = currentPos; // This is the actual first step from start to target
                break;
            }
            currentPos = parent; // Move to parent to continue path reconstruction
        }
        
        return { nextStep: nextStepToTarget, distance: targetFoundNode.dist };
    } else {
        return { nextStep: null, distance: -1 }; // Target is unreachable
    }
}

/**
 * Predicts a wanderer's next position given its current position and its target's position.
 * The wanderer moves one step (Manhattan distance) closer to its target.
 * Ties (e.g., equal X and Y distance) are broken by prioritizing horizontal movement.
 *
 * @param wandererPos - The current position of the wanderer.
 * @param targetPos - The position of the wanderer's target.
 * @returns The predicted next position of the wanderer.
 */
function getWandererPredictedNextPos(wandererPos: Point, targetPos: Point): Point {
    const dx = targetPos.x - wandererPos.x;
    const dy = targetPos.y - wandererPos.y;

    let nextX = wandererPos.x;
    let nextY = wandererPos.y;

    // Prioritize horizontal movement to reduce Manhattan distance, then vertical
    if (dx !== 0) {
        nextX += Math.sign(dx);
    } else if (dy !== 0) {
        nextY += Math.sign(dy);
    }
    return { x: nextX, y: nextY };
}

// --- Initialization Input (read once at the start of the game) ---
width = parseInt(readline());
height = parseInt(readline());

for (let i = 0; i < height; i++) {
    const row = readline();
    grid.push(row.split(''));
    // No need to store 'w' points for this league's strategy, as we react to active wanderers.
    // If future leagues require anticipating spawns, this would be the place to store them.
}
readline(); // Read the 4 integers line (no significance yet for this league, used in higher leagues)

// --- Game Loop (runs every turn) ---
while (true) {
    const entityCount = parseInt(readline());
    let myExplorer: Entity | null = null;
    const explorers: Entity[] = []; // All explorers (including self)
    const activeWanderers: Entity[] = []; // Wanderers in WANDERING state (param1 === 1)
    const spawningMinions: Entity[] = []; // Minions in SPAWNING state (param1 === 0)

    // Read all entities for the current turn
    for (let i = 0; i < entityCount; i++) {
        const inputs = readline().split(' ');
        const entityType = inputs[0];
        const id = parseInt(inputs[1]);
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);
        const param0 = parseInt(inputs[4]);
        const param1 = parseInt(inputs[5]);
        const param2 = parseInt(inputs[6]);

        const entity: Entity = { type: entityType, id, x, y, param0, param1, param2 };

        if (entityType === 'EXPLORER') {
            explorers.push(entity);
            if (myExplorerId === -1) { // On the very first turn, the first EXPLORER entity is "me"
                myExplorerId = id;
                myExplorer = entity;
            } else if (id === myExplorerId) { // In subsequent turns, identify "me" by my stored ID
                myExplorer = entity;
            }
        } else if (entityType === 'WANDERER') {
            if (param1 === 1) { // WANDERING state
                activeWanderers.push(entity);
            } else if (param1 === 0) { // SPAWNING state
                spawningMinions.push(entity);
            }
        }
    }

    // Defensive check: If my explorer data wasn't found (shouldn't happen in a valid game)
    if (!myExplorer) {
        console.error("My explorer data not found for this turn!");
        console.log("WAIT ERROR: EXPLORER_MISSING");
        continue;
    }

    let action: string = "WAIT"; // Default action is WAIT
    let debugMessage: string = "IDLE"; // Message for debugging output

    // --- Step 1: Predict Danger Cells for Next Turn ---
    // These are cells that will be occupied by an active wanderer after it moves.
    const dangerCells: Point[] = [];
    for (const wanderer of activeWanderers) {
        let targetExplorer: Entity | null = null;

        // Try to find the wanderer's explicit target explorer
        if (wanderer.param2 !== -1) {
            // Ensure the target explorer is still alive (sanity > 0)
            targetExplorer = explorers.find(e => e.id === wanderer.param2 && e.param0 > 0) || null;
        }

        // If no explicit target or the target is dead/invalid, find the closest living explorer as target
        if (!targetExplorer) {
            let minTargetDist = Infinity;
            for (const explorer of explorers) {
                if (explorer.param0 > 0) { // Only consider living explorers
                    const dist = manhattanDistance(wanderer, explorer);
                    if (dist < minTargetDist) {
                        minTargetDist = dist;
                        targetExplorer = explorer;
                    }
                }
            }
        }

        // If a target is found, predict where the wanderer will move
        if (targetExplorer) {
            const predictedPos = getWandererPredictedNextPos(wanderer, targetExplorer);
            dangerCells.push(predictedPos);
        }
    }

    // Check if my current position will be dangerous next turn (if I WAIT).
    // Also check if a wanderer is *already* on my cell (meaning I just got spooked and must move off).
    const isMyCurrentPosDangerousNextTurn: boolean = dangerCells.some(dc => dc.x === myExplorer.x && dc.y === myExplorer.y);
    const isWandererOnMyCell: boolean = activeWanderers.some(w => w.x === myExplorer.x && w.y === myExplorer.y);

    let mustMoveToEvade = isMyCurrentPosDangerousNextTurn || isWandererOnMyCell;

    // --- Step 2: Action Decision Based on Priority ---

    if (mustMoveToEvade) {
        // Priority 1: Evade immediate wanderer threat
        debugMessage = isWandererOnMyCell ? "JUST_SPOOKED_EVADE" : "PREDICTED_DANGER_EVADE";

        const possibleNextPositions: Point[] = [];
        const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

        // Generate all valid (non-wall) adjacent cells
        for (const dir of directions) {
            const nx = myExplorer.x + dir.x;
            const ny = myExplorer.y + dir.y;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] !== '#') {
                possibleNextPositions.push({ x: nx, y: ny });
            }
        }

        let bestSafeMove: Point | null = null;
        let maxMinDistToWanderer = -1; // We want to find a safe move that is maximally distant from any wanderer

        for (const move of possibleNextPositions) {
            let isSafe = true;
            // Check if this potential move cell will be a danger cell next turn
            for (const dc of dangerCells) {
                if (dc.x === move.x && dc.y === move.y) {
                    isSafe = false;
                    break;
                }
            }

            if (isSafe) {
                // This move is safe from predicted wanderer positions.
                // Now, evaluate its "quality" by how far it is from current wanderers.
                let currentMinDist = Infinity;
                if (activeWanderers.length === 0) {
                    currentMinDist = 0; // If no wanderers, any safe move is equally good in terms of distance
                } else {
                    for (const wanderer of activeWanderers) {
                        currentMinDist = Math.min(currentMinDist, manhattanDistance(move, wanderer));
                    }
                }

                // Choose the safe move that maximizes the minimum distance to any wanderer.
                // If multiple moves have the same maxMinDist, the first one found is chosen.
                if (bestSafeMove === null || currentMinDist > maxMinDistToWanderer) {
                    maxMinDistToWanderer = currentMinDist;
                    bestSafeMove = move;
                }
            }
        }

        if (bestSafeMove) {
            action = `MOVE ${bestSafeMove.x} ${bestSafeMove.y}`;
        } else {
            // No safe adjacent move found. This means the explorer is trapped by walls/danger.
            // Resort to WAIT, even if it means taking a hit.
            action = `WAIT ${debugMessage}_TRAPPED`;
        }

    } else {
        // Priority 2: Seek reassurance if not in immediate danger
        let reassured = false;
        // Filter for other living explorers (excluding myself)
        const livingOtherExplorers = explorers.filter(e => e.id !== myExplorer!.id && e.param0 > 0);

        // Check if currently reassured (another explorer within 2 Manhattan distance)
        for (const other of livingOtherExplorers) {
            if (manhattanDistance(myExplorer, other) <= 2) {
                reassured = true;
                break;
            }
        }

        if (!reassured && livingOtherExplorers.length > 0) {
            // Not reassured and there are other living explorers, try to move towards the closest one
            let closestExplorer: Entity | null = null;
            let minBfsDist = Infinity;

            // Find the closest other explorer via BFS (respecting walls)
            for (const other of livingOtherExplorers) {
                const bfsResult = bfs(myExplorer, other, grid, width, height);
                // If reachable and closer than previous closest
                if (bfsResult.distance !== -1 && bfsResult.distance < minBfsDist) {
                    minBfsDist = bfsResult.distance;
                    closestExplorer = other;
                }
            }

            // If a reachable closest explorer is found and I'm not already on their cell
            if (closestExplorer && minBfsDist > 0) { 
                const bfsResult = bfs(myExplorer, closestExplorer, grid, width, height);
                if (bfsResult.nextStep) {
                    action = `MOVE ${bfsResult.nextStep.x} ${bfsResult.nextStep.y}`;
                    debugMessage = `SEEK_REASSURE_TO_ID_${closestExplorer.id}`;
                } else {
                    debugMessage = "CANNOT_REACH_ALLY_FOR_REASSURE"; // Should be caught by minBfsDist
                }
            } else {
                debugMessage = "NO_ACCESSIBLE_ALLIES_TO_REASSURE"; // All accessible allies are too far or unreachable
            }
        } else if (reassured) {
            debugMessage = "REASSURED"; // Already reassured, no need to move
        }
        // If not moving for reassurance, the action remains "WAIT" from the default.
    }

    // Output the chosen action and a debug message
    console.log(`${action} ${debugMessage}`);
}