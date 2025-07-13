// Standard input/output in CodinGame.
// These declarations are for TypeScript's type checking and won't be in the final transpiled JS.
declare function readline(): string;
declare function print(message: any): void; // Though console.log is usually fine in TS puzzles.

// Define roll transitions based on current face and direction.
// This object describes how the '6' face changes its orientation when the die is rolled.
const rollTransitions: { [direction: string]: { [currentFace: string]: string } } = {
    'LEFT': {
        'TOP': 'WEST', 'WEST': 'BOTTOM', 'BOTTOM': 'EAST', 'EAST': 'TOP',
        'NORTH': 'NORTH', 'SOUTH': 'SOUTH' // Faces perpendicular to the roll axis remain unchanged
    },
    'RIGHT': {
        'TOP': 'EAST', 'EAST': 'BOTTOM', 'BOTTOM': 'WEST', 'WEST': 'TOP',
        'NORTH': 'NORTH', 'SOUTH': 'SOUTH'
    },
    'UP': {
        'TOP': 'SOUTH', 'SOUTH': 'BOTTOM', 'BOTTOM': 'NORTH', 'NORTH': 'TOP',
        'EAST': 'EAST', 'WEST': 'WEST'
    },
    'DOWN': {
        'TOP': 'NORTH', 'NORTH': 'BOTTOM', 'BOTTOM': 'SOUTH', 'SOUTH': 'TOP',
        'EAST': 'EAST', 'WEST': 'WEST'
    }
};

// Interface for a single die's properties
interface Die {
    id: number; // Unique identifier for the die (0 to N-1)
    x: number; // Current X coordinate on the 4x4 grid
    y: number; // Current Y coordinate on the 4x4 grid
    face6: string; // Current orientation of the '6' face ("TOP", "BOTTOM", etc.)
    isIron: boolean; // True if the die is an unrollable IRON die
}

// Interface for a single roll action in the solution path
interface RollAction {
    dieId: number; // The ID of the die that was rolled
    direction: string; // The direction it was rolled ("LEFT", "RIGHT", "UP", "DOWN")
}

// Interface for a game state in the BFS search
interface State {
    dice: Die[]; // Array of Die objects, implicitly ordered by their 'id'
    path: RollAction[]; // The sequence of rolls performed to reach this state
}

/**
 * Serializes a game state into a unique string. This is used as a key
 * in the `visited` Set to avoid re-processing identical states.
 * We rely on the `dice` array being consistently sorted by `id`.
 */
function serializeState(state: State): string {
    // Only positions (x,y) and the 6-face orientation (face6) are state-defining for a die.
    // The 'id' is included to ensure uniqueness if two dice coincidentally have the same
    // (x,y,face6) values (though highly unlikely for specific puzzles).
    const serializedDice = state.dice.map(d => ({
        id: d.id,
        x: d.x,
        y: d.y,
        face6: d.face6
    }));
    return JSON.stringify(serializedDice);
}

/**
 * Creates a deep clone of a State object. This is crucial for BFS to ensure
 * that when exploring new paths, we don't modify previously enqueued states.
 */
function cloneState(state: State): State {
    return {
        // Deep copy each Die object within the dice array
        dice: state.dice.map(d => ({ ...d })),
        // Shallow copy the path array, as RollAction objects are simple and don't need deep cloning
        path: [...state.path]
    };
}

/**
 * Checks if all dice on the board currently form a single connected group.
 * Connectivity is defined by adjacent (non-diagonal) placement.
 */
function isGroupConnected(dice: Die[], N: number): boolean {
    if (N === 0) return true; // If there are no dice, they are trivially connected.

    // Create a 4x4 grid representation of the current board state.
    // Each cell contains the ID of the die occupying it, or null if empty.
    const grid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    let startX = -1, startY = -1; // To find a starting point for BFS/DFS

    for (const die of dice) {
        grid[die.y][die.x] = die.id;
        // Set the starting point for BFS/DFS to the first die encountered.
        if (startX === -1) {
            startX = die.x;
            startY = die.y;
        }
    }

    // If no dice are found (should not happen with N >= 2 constraint), return false.
    if (startX === -1) return false;

    // BFS setup
    const queue: [number, number][] = [[startX, startY]]; // Queue stores [x, y] coordinates
    const visitedCoords = new Set<string>(); // Tracks visited grid cells (e.g., "x,y")
    const visitedDiceIds = new Set<number>(); // Tracks unique die IDs found in the current component

    visitedCoords.add(`${startX},${startY}`);
    visitedDiceIds.add(grid[startY][startX]!); // Add the ID of the die at the starting point

    // Directions for moving to adjacent cells (Up, Down, Right, Left)
    const dx = [0, 0, 1, -1];
    const dy = [-1, 1, 0, 0];

    let head = 0; // Manual queue head for efficient BFS (avoids `Array.shift()`)
    while (head < queue.length) {
        const [cx, cy] = queue[head++]; // Dequeue current coordinates

        // Explore all 4 adjacent cells
        for (let i = 0; i < 4; i++) {
            const nx = cx + dx[i];
            const ny = cy + dy[i];
            const coordKey = `${nx},${ny}`;

            // Check if new coordinates are within bounds and haven't been visited
            if (nx >= 0 && nx < 4 && ny >= 0 && ny < 4 && !visitedCoords.has(coordKey)) {
                // If the adjacent cell contains a die
                if (grid[ny][nx] !== null) {
                    visitedCoords.add(coordKey);
                    visitedDiceIds.add(grid[ny][nx]!); // Add the die's ID to the set of connected dice
                    queue.push([nx, ny]); // Enqueue the new coordinates
                }
            }
        }
    }

    // If the number of unique dice IDs found in the connected component equals
    // the total number of dice (N), then all dice form a single connected group.
    return visitedDiceIds.size === N;
}

/**
 * Main function to solve the CodinDice puzzle.
 * It uses a Breadth-First Search (BFS) to find the shortest sequence of rolls.
 */
function solveCodinDice(): void {
    const N: number = parseInt(readline()); // Read the number of dice

    // Initialize the starting dice configuration from input
    const initialDice: Die[] = [];
    for (let i = 0; i < N; i++) {
        const [xStr, yStr, face] = readline().split(' ');
        const x = parseInt(xStr);
        const y = parseInt(yStr);
        const isIron = face === 'IRON';
        const actualFace = isIron ? 'TOP' : face; // IRON dice explicitly have their 6-face on TOP

        initialDice.push({
            id: i,
            x: x,
            y: y,
            face6: actualFace,
            isIron: isIron
        });
    }

    // BFS setup: queue for states to visit, and a set for already visited states
    const queue: State[] = [];
    const visited = new Set<string>();

    // Add the initial state to the queue and mark as visited
    const initialState: State = { dice: initialDice, path: [] };
    queue.push(initialState);
    visited.add(serializeState(initialState));

    let head = 0; // Manual queue head for efficiency
    while (head < queue.length) {
        const currentState = queue[head++]; // Get the next state from the queue

        // 1. Check if the current state is the goal state
        const allDiceTop = currentState.dice.every(d => d.face6 === 'TOP');
        if (allDiceTop && isGroupConnected(currentState.dice, N)) {
            // Goal reached! Output the sequence of rolls (the path).
            currentState.path.forEach(action => {
                console.log(`${action.dieId} ${action.direction}`);
            });
            return; // Exit the function as the shortest path has been found.
        }

        // 2. Generate next possible states by simulating all valid die rolls from the current state
        // First, create a temporary grid to quickly check for empty spots for rolling
        const currentGrid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
        for (const die of currentState.dice) {
            currentGrid[die.y][die.x] = die.id;
        }

        // Define possible movement vectors and their corresponding direction labels for rolling
        const dx_rolls = [0, 0, 1, -1]; // Change in X for UP, DOWN, RIGHT, LEFT
        const dy_rolls = [-1, 1, 0, 0]; // Change in Y for UP, DOWN, RIGHT, LEFT
        const directions_labels = ['UP', 'DOWN', 'RIGHT', 'LEFT'];

        // Iterate through each die to determine if it can be rolled
        for (const dieToRoll of currentState.dice) {
            if (dieToRoll.isIron) {
                continue; // IRON dice cannot be rolled
            }

            // Try rolling the die in all four cardinal directions
            for (let i = 0; i < 4; i++) {
                const newX = dieToRoll.x + dx_rolls[i];
                const newY = dieToRoll.y + dy_rolls[i];
                const direction = directions_labels[i];

                // Check if the potential new position is within board boundaries (0-3)
                // and if the target cell is currently empty
                if (newX >= 0 && newX < 4 && newY >= 0 && newY < 4 && currentGrid[newY][newX] === null) {
                    // This is a valid roll. Create a new state based on this roll.
                    const newState = cloneState(currentState);
                    // Get the reference to the specific die object *within the cloned state's dice array*
                    // This is crucial to modify the copy, not the original.
                    const movedDie = newState.dice[dieToRoll.id]; 

                    // Update the die's new position and its 6-face orientation
                    movedDie.x = newX;
                    movedDie.y = newY;
                    movedDie.face6 = rollTransitions[direction][movedDie.face6];
                    
                    // Add this roll action to the new state's path
                    newState.path.push({ dieId: dieToRoll.id, direction: direction });

                    // Check if this new state has been visited before to avoid redundant work and cycles
                    const serializedNewState = serializeState(newState);
                    if (!visited.has(serializedNewState)) {
                        visited.add(serializedNewState); // Mark as visited
                        queue.push(newState); // Add to queue for future exploration
                    }
                }
            }
        }
    }
}

// Start the puzzle solver
solveCodinDice();