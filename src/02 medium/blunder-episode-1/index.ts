// Define interfaces and enums for better readability and type safety
enum Direction {
    SOUTH = 'SOUTH',
    EAST = 'EAST',
    NORTH = 'NORTH',
    WEST = 'WEST'
}

// Maps directions to their corresponding row/column deltas
const DELTAS: Record<Direction, [number, number]> = {
    [Direction.SOUTH]: [1, 0],
    [Direction.EAST]: [0, 1],
    [Direction.NORTH]: [-1, 0],
    [Direction.WEST]: [0, -1]
};

// Maps character modifiers on the map to Direction enum values
const DIRECTION_CHARS: Record<string, Direction> = {
    'S': Direction.SOUTH,
    'E': Direction.EAST,
    'N': Direction.NORTH,
    'W': Direction.WEST
};

// Priority lists for changing direction when encountering an obstacle
const NORMAL_PRIORITY_DIRS: Direction[] = [
    Direction.SOUTH,
    Direction.EAST,
    Direction.NORTH,
    Direction.WEST
];

const INVERSE_PRIORITY_DIRS: Direction[] = [
    Direction.WEST,
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH
];

// --- Input Reading (CodinGame specific) ---
// readline() and print() are global functions provided by CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

const [L, C] = readline().split(' ').map(Number); // L = lines, C = columns

// grid stores the map characters, mutable for 'X' destruction
const grid: string[][] = [];
// teleporters stores the coordinates of 'T' cells
const teleporters: { r: number, c: number }[] = [];
// startRow, startCol stores Blunder's initial position
let startRow: number = -1;
let startCol: number = -1;

// Read map line by line and populate grid, find start and teleporter positions
for (let r = 0; r < L; r++) {
    const line = readline();
    grid.push(line.split(''));
    for (let c = 0; c < C; c++) {
        if (grid[r][c] === '@') {
            startRow = r;
            startCol = c;
        } else if (grid[r][c] === 'T') {
            teleporters.push({ r, c });
        }
    }
}

// --- Blunder's Initial State ---
let currentRow: number = startRow;
let currentCol: number = startCol;
let currentDirection: Direction = Direction.SOUTH; // Rule 1: Starts SOUTH
let isBreakerMode: boolean = false; // Rule 7: Starts off
let isInversePriority: boolean = false; // Rule 6: Priorities start normal

// path stores the sequence of successful moves
const path: Direction[] = [];
// visitedStates is a Set to detect infinite loops.
// Key format: "${row},${col},${direction},${isBreakerMode ? 1 : 0},${isInversePriority ? 1 : 0}"
const visitedStates: Set<string> = new Set(); 

// Maximum number of simulation steps to detect a loop.
// This is based on the total possible unique states (L * C * 4 directions * 2 breaker modes * 2 inverse priorities).
// Adding a small buffer for safety.
const MAX_SIMULATION_STEPS = L * C * 4 * 2 * 2 + 5; 

let loopDetected = false;
let targetReached = false;

// --- Main Simulation Loop ---
for (let step = 0; step < MAX_SIMULATION_STEPS; step++) {
    // 1. Check for loop
    const stateKey = `${currentRow},${currentCol},${currentDirection},${isBreakerMode ? 1 : 0},${isInversePriority ? 1 : 0}`;
    if (visitedStates.has(stateKey)) {
        loopDetected = true;
        break; // Infinite loop detected
    }
    visitedStates.add(stateKey);

    // 2. Determine potential next position based on current direction
    const [dr, dc] = DELTAS[currentDirection];
    let nextRow = currentRow + dr;
    let nextCol = currentCol + dc;
    let nextCellChar = grid[nextRow][nextCol]; // Get character at potential next position

    // 3. Check if the next cell is an obstacle (Rule 3)
    // An 'X' is an obstacle only if Blunder is NOT in breaker mode.
    const isObstacle = nextCellChar === '#' || (nextCellChar === 'X' && !isBreakerMode);

    if (isObstacle) {
        // Rule 4: Blunder encountered an obstacle. He does NOT move into the obstacle.
        // Instead, he stays in his current position and changes direction based on priorities.
        const priorityDirs = isInversePriority ? INVERSE_PRIORITY_DIRS : NORMAL_PRIORITY_DIRS;
        
        for (const pDir of priorityDirs) {
            const [testDr, testDc] = DELTAS[pDir];
            const testNextRow = currentRow + testDr;
            const testNextCol = currentCol + testDc;
            const testNextChar = grid[testNextRow][testNextCol];

            // Check if this test direction leads to a non-obstacle cell
            const testIsObstacle = testNextChar === '#' || (testNextChar === 'X' && !isBreakerMode);

            if (!testIsObstacle) {
                currentDirection = pDir; // Found a valid direction
                break; // Stop checking priorities
            }
        }
        // No move is recorded in `path` for this turn, as Blunder did not change position.
        // The loop continues to the next step with the new `currentDirection`.

    } else {
        // Blunder can move to the next cell (it's not an obstacle)
        currentRow = nextRow;
        currentCol = nextCol;
        path.push(currentDirection); // Record the successful move

        // Apply effects of the cell Blunder just landed on
        switch (nextCellChar) {
            case '$': // Rule 2: Suicide Booth - Journey ends
                targetReached = true;
                break; // Exit the switch, then the main loop
            case 'X': // Rule 7: Breaker mode destruction
                // This case is only reached if Blunder is in breaker mode,
                // as 'X' would otherwise be an obstacle.
                grid[currentRow][currentCol] = ' '; // Permanently destroy 'X' by changing to space
                // Direction and breaker mode properties are maintained.
                break;
            case 'T': // Rule 8: Teleporter
                // Find the *other* teleporter (assuming two are always present if any).
                const otherT = teleporters.find(t => t.r !== currentRow || t.c !== currentCol);
                if (otherT) { 
                    currentRow = otherT.r;
                    currentCol = otherT.c;
                }
                // Direction and breaker mode properties are retained.
                break;
            case 'B': // Rule 7: Beer
                isBreakerMode = !isBreakerMode; // Toggle breaker mode
                // Beer remains in place.
                break;
            case 'I': // Rule 6: Circuit Inverter
                isInversePriority = !isInversePriority; // Toggle priority inversion
                // If Blunder returns to 'I', priorities are reset to original state (toggle acts as reset)
                break;
            case 'S':
            case 'E':
            case 'N':
            case 'W': // Rule 5: Path modifiers - instantaneously change direction
                currentDirection = DIRECTION_CHARS[nextCellChar]; 
                break;
            case ' ': // Rule 9: Empty space - no special behavior
                // Blunder just moves through.
                break;
            // No default case needed, all specified characters are handled.
        }
    }

    if (targetReached) {
        break; // Exit the main simulation loop if '$' was reached
    }
}

// --- Output Result ---
if (loopDetected) {
    print('LOOP');
} else if (targetReached) {
    for (const move of path) {
        print(move);
    }
} else {
    // This case should ideally not be reached if MAX_SIMULATION_STEPS is large enough
    // to guarantee either target reach or loop detection. If reached, it implies an
    // undetectable loop or a very long path; for contest purposes, treat as a loop.
    print('LOOP');
}