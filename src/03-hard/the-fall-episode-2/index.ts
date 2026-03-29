// Helper function to read a line from standard input (provided by CodinGame environment)
declare function readline(): string;

// Enum for room ports (directions relative to the room)
enum Port {
    TOP = 0,
    RIGHT = 1,
    BOTTOM = 2,
    LEFT = 3,
}

// Maps string input (POSI, e.g., "TOP") to Port enum
const POSI_TO_PORT: Record<string, Port> = {
    "TOP": Port.TOP,
    "RIGHT": Port.RIGHT,
    "LEFT": Port.LEFT,
};

// Delta coordinates for moving from a cell through a specific port
// Index corresponds to Port enum: [TOP, RIGHT, BOTTOM, LEFT]
const PORT_DELTA_X = [0, 1, 0, -1];
const PORT_DELTA_Y = [-1, 0, 1, 0];

// Map a port to its opposite port (used to determine the entry point into the next room)
// e.g., if Indy exits TOP, the next room is entered from BOTTOM
const PORT_OPPOSITE = [Port.BOTTOM, Port.LEFT, Port.TOP, Port.RIGHT]; // TOP <-> BOTTOM, RIGHT <-> LEFT

// Defines the base connections for each room type (before any rotation)
// This is a mapping from roomType (number) to an inner Map.
// The inner Map maps an entryPort (Port) to an array of possible exitPorts (Port[]).
const ROOM_BASE_CONNECTIONS: Record<number, Map<Port, Port[]>> = {
    0: new Map(), // Type 0: Impassable, no connections
    1: new Map([ // Type 1: Cross-shaped, all ports connect to all other 3
        [Port.TOP, [Port.RIGHT, Port.BOTTOM, Port.LEFT]],
        [Port.RIGHT, [Port.TOP, Port.BOTTOM, Port.LEFT]],
        [Port.BOTTOM, [Port.TOP, Port.RIGHT, Port.LEFT]],
        [Port.LEFT, [Port.TOP, Port.RIGHT, Port.BOTTOM]],
    ]),
    2: new Map([ // Type 2: T-shaped (from image, TOP, LEFT, RIGHT lead to BOTTOM)
        [Port.TOP, [Port.BOTTOM]],
        [Port.LEFT, [Port.BOTTOM]],
        [Port.RIGHT, [Port.BOTTOM]],
    ]),
    3: new Map([ // Type 3: T-shaped (rotated 90deg CW from Type 2)
        // Original Type 2: (0->2), (3->2), (1->2)
        // Rotated 90 CW: (0+1->2+1) -> (1->3), (3+1->2+1) -> (0->3), (1+1->2+1) -> (2->3)
        // Which is: RIGHT->LEFT, TOP->LEFT, BOTTOM->LEFT
        [Port.TOP, [Port.LEFT]],
        [Port.RIGHT, [Port.BOTTOM]],
        [Port.BOTTOM, [Port.RIGHT]],
    ]),
    4: new Map([ // Type 4: L-bend (from image, TOP leads to LEFT or RIGHT)
        [Port.TOP, [Port.LEFT, Port.RIGHT]],
    ]),
    5: new Map([ // Type 5: L-bend (rotated 90deg CW from Type 4)
        // Original Type 4: (0->3), (0->1)
        // Rotated 90 CW: (0+1->3+1) -> (1->0), (0+1->1+1) -> (1->2)
        // Which is: RIGHT->TOP, RIGHT->BOTTOM
        [Port.RIGHT, [Port.TOP, Port.BOTTOM]],
    ]),
    6: new Map([ // Type 6: Straight pipes (Vertical and Horizontal)
        [Port.TOP, [Port.BOTTOM]],
        [Port.BOTTOM, [Port.TOP]],
        [Port.LEFT, [Port.RIGHT]],
        [Port.RIGHT, [Port.LEFT]],
    ]),
    7: new Map([ // Type 7: L-bend (TOP <-> RIGHT, BOTTOM <-> LEFT)
        [Port.TOP, [Port.RIGHT]],
        [Port.RIGHT, [Port.TOP]],
        [Port.BOTTOM, [Port.LEFT]],
        [Port.LEFT, [Port.BOTTOM]],
    ]),
    8: new Map([ // Type 8: L-bend (TOP <-> LEFT, BOTTOM <-> RIGHT)
        [Port.TOP, [Port.LEFT]],
        [Port.LEFT, [Port.TOP]],
        [Port.BOTTOM, [Port.RIGHT]],
        [Port.RIGHT, [Port.BOTTOM]],
    ]),
    9: new Map([ // Type 9: L-bend (LEFT <-> BOTTOM, RIGHT <-> TOP) - Corrected based on detailed image analysis
        [Port.LEFT, [Port.BOTTOM]],
        [Port.RIGHT, [Port.TOP]],
    ]),
    10: new Map([ // Type 10: Single turn (TOP -> LEFT)
        [Port.TOP, [Port.LEFT]],
    ]),
    11: new Map([ // Type 11: Single turn (TOP -> RIGHT)
        [Port.TOP, [Port.RIGHT]],
    ]),
    12: new Map([ // Type 12: Single turn (RIGHT -> BOTTOM)
        [Port.RIGHT, [Port.BOTTOM]],
    ]),
    13: new Map([ // Type 13: Single turn (LEFT -> BOTTOM)
        [Port.LEFT, [Port.BOTTOM]],
    ]),
};


/**
 * Rotates a given port by a certain number of 90-degree clockwise turns.
 * @param port The original port to rotate.
 * @param rotation The number of 90-degree clockwise turns (0-3).
 * @returns The new port after rotation.
 */
function rotatePort(port: Port, rotation: number): Port {
    return (port + rotation) % 4;
}

/**
 * Un-rotates a given port to find its original position relative to the base room type.
 * Used to translate a current entry port to its equivalent in the base room definition.
 * @param port The current port (after rotation).
 * @param rotation The room's current rotation.
 * @returns The port in the base (unrotated) configuration.
 */
function unrotatePort(port: Port, rotation: number): Port {
    return (port - rotation + 4) % 4; // Add 4 to handle negative results of modulo
}

/**
 * Represents a single room in the tunnel grid.
 */
class Room {
    initialType: number; // The original room type (0-13)
    isRotatable: boolean; // True if the room can be rotated (initialType was non-negative)
    rotation: number; // Current rotation: 0=0deg, 1=90deg CW, 2=180deg, 3=270deg CW

    constructor(initialType: number) {
        this.initialType = Math.abs(initialType);
        this.isRotatable = initialType >= 0;
        this.rotation = 0; // All rooms start with 0 rotation
    }

    /**
     * Rotates the room clockwise or counter-clockwise by a quarter turn.
     * @param direction "LEFT" for counter-clockwise, "RIGHT" for clockwise.
     */
    rotate(direction: "LEFT" | "RIGHT"): void {
        if (direction === "RIGHT") {
            this.rotation = (this.rotation + 1) % 4;
        } else { // "LEFT"
            this.rotation = (this.rotation - 1 + 4) % 4;
        }
    }

    /**
     * Returns a list of possible exit ports from a given entry port, considering the room's current rotation.
     * @param entryPort The port Indy enters the room from.
     * @returns An array of possible exit ports. Returns empty array if no path.
     */
    getExitPorts(entryPort: Port): Port[] {
        // Translate the current entry port back to the base room's perspective
        const baseEntryPort = unrotatePort(entryPort, this.rotation);
        const baseConnections = ROOM_BASE_CONNECTIONS[this.initialType];

        if (!baseConnections) {
            return []; // Should not happen for valid room types 0-13
        }

        const baseExitPorts = baseConnections.get(baseEntryPort);
        if (!baseExitPorts) {
            return []; // No path from this entry in the base configuration
        }

        // Translate the base exit ports back to the current room's perspective
        return baseExitPorts.map(p => rotatePort(p, this.rotation));
    }
}

/**
 * Performs a Breadth-First Search (BFS) to find a path from Indy's current position to the exit.
 * @param startX Indy's current X coordinate.
 * @param startY Indy's current Y coordinate.
 * @param startEntryPort Indy's entry direction into the current room.
 * @param grid The game grid (2D array of Room objects).
 * @param W Grid width.
 * @param H Grid height.
 * @param EX Exit X coordinate (always at Y = H-1).
 * @param rockPositions A set of strings "x,y" representing current rock positions.
 * @returns True if a path to the exit is found, false otherwise.
 */
function findPath(
    startX: number,
    startY: number,
    startEntryPort: Port,
    grid: Room[][],
    W: number,
    H: number,
    EX: number,
    rockPositions: Set<string>
): boolean {
    // Queue for BFS, storing [x, y, entryPort] for each state
    const queue: [number, number, Port][] = [[startX, startY, startEntryPort]];
    // Set to keep track of visited states to prevent cycles and redundant computations
    const visited = new Set<string>();
    visited.add(`${startX},${startY},${startEntryPort}`); // Mark initial state as visited

    while (queue.length > 0) {
        const [currX, currY, currEntryPort] = queue.shift()!; // Get current state from queue

        // Check for exit condition: Indy has reached the bottom row at the exit column
        if (currY === H - 1 && currX === EX) {
            return true; // Path to exit found!
        }

        const currentRoom = grid[currY][currX];
        const possibleExitPorts = currentRoom.getExitPorts(currEntryPort);

        // Explore all possible next steps from the current room
        for (const exitPort of possibleExitPorts) {
            const nextX = currX + PORT_DELTA_X[exitPort];
            const nextY = currY + PORT_DELTA_Y[exitPort];
            // The next room is entered from the opposite direction of the exit port
            const nextEntryPort = PORT_OPPOSITE[exitPort];

            // 1. Check if next coordinates are within grid boundaries
            if (nextX < 0 || nextX >= W || nextY < 0 || nextY >= H) {
                // Indy would slam into a wall - invalid path
                continue;
            }

            // 2. Check if the next room contains a rock
            if (rockPositions.has(`${nextX},${nextY}`)) {
                // Cannot move into a room occupied by a rock - invalid path
                continue;
            }

            const nextRoom = grid[nextY][nextX];
            // 3. Critical check: Ensure the next room can actually lead Indy further,
            //    unless it's the final exit room which doesn't need to lead anywhere.
            if (nextRoom.getExitPorts(nextEntryPort).length === 0 && (nextY !== H - 1 || nextX !== EX)) {
                // This means the next room would be a dead end for Indy; he would stop moving - invalid path
                continue;
            }

            // Create a unique key for the next state to check against visited set
            const nextNodeKey = `${nextX},${nextY},${nextEntryPort}`;
            if (!visited.has(nextNodeKey)) {
                visited.add(nextNodeKey); // Mark as visited
                queue.push([nextX, nextY, nextEntryPort]); // Add to queue for further exploration
            }
        }
    }
    return false; // No path found to the exit after exploring all reachable states
}

// --- Main game loop ---

// Read initial grid dimensions
const [W, H] = readline().split(' ').map(Number);

// Initialize the grid with Room objects based on input types
const grid: Room[][] = [];
for (let i = 0; i < H; i++) {
    const rowTypes = readline().split(' ').map(Number);
    grid.push(rowTypes.map(type => new Room(type)));
}

// Read the exit X coordinate (exit is always at Y = H-1)
const EX = Number(readline());

// Game loop runs indefinitely until the program exits
while (true) {
    // Read Indy's current position and entry point for this turn
    const [XI_str, YI_str, POSI_str] = readline().split(' ');
    const XI = parseInt(XI_str);
    const YI = parseInt(YI_str);
    const POSI: Port = POSI_TO_PORT[POSI_str];

    // Read information about rocks currently in the grid
    const R = Number(readline());
    const rockPositions = new Set<string>(); // Stores "x,y" for quick lookup of rock locations
    for (let i = 0; i < R; i++) {
        const [XR_str, YR_str, POSR_str] = readline().split(' ');
        const XR = parseInt(XR_str);
        const YR = parseInt(YR_str);
        rockPositions.add(`${XR},${YR}`); // Only need the position of the rock for collision checks
    }

    let action = "WAIT"; // Default action: do nothing

    // 1. First, check if a path to the exit already exists with the current grid configuration.
    if (findPath(XI, YI, POSI, grid, W, H, EX, rockPositions)) {
        action = "WAIT"; // A path exists, no rotation is needed
    } else {
        // 2. If no path is found, try rotating one room to create a path.
        let rotationFound = false;
        // Iterate through all possible rooms in the grid
        for (let ry = 0; ry < H; ry++) {
            for (let rx = 0; rx < W; rx++) {
                const roomToRotate = grid[ry][rx];

                // Apply rotation restrictions:
                // - Cannot rotate rooms containing Indy
                if (rx === XI && ry === YI) continue;
                // - Cannot rotate the exit room itself (the destination room)
                if (rx === EX && ry === H - 1) continue;
                // - Cannot rotate rooms that currently contain a rock
                if (rockPositions.has(`${rx},${ry}`)) continue;

                // Only attempt rotation if the room is rotatable
                if (roomToRotate.isRotatable) {
                    // Try rotating the room counter-clockwise (LEFT)
                    roomToRotate.rotate("LEFT");
                    if (findPath(XI, YI, POSI, grid, W, H, EX, rockPositions)) {
                        action = `${rx} ${ry} LEFT`; // Path found, set action
                        rotationFound = true;
                        break; // Stop searching for other rotations
                    }
                    roomToRotate.rotate("RIGHT"); // IMPORTANT: Revert the rotation for the next test

                    // If LEFT didn't work, try rotating the room clockwise (RIGHT)
                    roomToRotate.rotate("RIGHT");
                    if (findPath(XI, YI, POSI, grid, W, H, EX, rockPositions)) {
                        action = `${rx} ${ry} RIGHT`; // Path found, set action
                        rotationFound = true;
                        break; // Stop searching for other rotations
                    }
                    roomToRotate.rotate("LEFT"); // IMPORTANT: Revert the rotation for the next test
                }
            }
            if (rotationFound) break; // Break from outer loop if a rotation was found and applied
        }
    }

    // Output the chosen action for this turn
    console.log(action);
}