// Define standard input/output functions for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;
declare function printErr(message: string): void;

// --- Utility types and constants ---

type Direction = "TOP" | "RIGHT" | "BOTTOM" | "LEFT";

const DX: { [key in Direction]: number } = { TOP: 0, BOTTOM: 0, LEFT: -1, RIGHT: 1 };
const DY: { [key in Direction]: number } = { TOP: -1, BOTTOM: 1, LEFT: 0, RIGHT: 0 };

const OPPOSITE_DIRECTION: { [key in Direction]: Direction } = {
    TOP: "BOTTOM",
    RIGHT: "LEFT",
    BOTTOM: "TOP",
    LEFT: "RIGHT",
};

const CW_ROTATION: { [key in Direction]: Direction } = {
    TOP: "RIGHT",
    RIGHT: "BOTTOM",
    BOTTOM: "LEFT",
    LEFT: "TOP",
};

const CCW_ROTATION: { [key in Direction]: Direction } = {
    TOP: "LEFT",
    LEFT: "BOTTOM",
    BOTTOM: "RIGHT",
    RIGHT: "TOP",
};

// --- Room Configuration ---

interface RoomPath {
    [entry: string]: Direction; // Maps entry direction to exit direction
}

const ROOM_TEMPLATES_BY_TYPE: { [key: number]: RoomPath } = {
    0: {}, // Blocked
    1: { TOP: "BOTTOM", LEFT: "BOTTOM", RIGHT: "BOTTOM" },
    2: { TOP: "RIGHT", RIGHT: "BOTTOM" },
    3: { TOP: "LEFT", LEFT: "BOTTOM" },
    4: { TOP: "LEFT", LEFT: "BOTTOM" },
    5: { TOP: "RIGHT", RIGHT: "BOTTOM" },
    6: { TOP: "RIGHT", LEFT: "BOTTOM" },
    7: { TOP: "LEFT", RIGHT: "BOTTOM" },
    8: { LEFT: "BOTTOM", RIGHT: "TOP" },
    9: { RIGHT: "BOTTOM", LEFT: "TOP" },
    10: { LEFT: "RIGHT", RIGHT: "LEFT" },
    11: { TOP: "BOTTOM", BOTTOM: "TOP" },
    12: { TOP: "RIGHT", RIGHT: "TOP", LEFT: "BOTTOM", BOTTOM: "LEFT" },
    13: { TOP: "LEFT", LEFT: "TOP", RIGHT: "BOTTOM", BOTTOM: "RIGHT" },
};

// --- Room Class ---

class Room {
    type: number; // The original type from input (e.g., 2, 3, 4, etc.)
    isRotatable: boolean;
    currentRotation: number; // 0 (0 deg), 1 (90 deg CW), 2 (180 deg CW), 3 (270 deg CW)

    constructor(initialType: number) {
        this.type = Math.abs(initialType);
        this.isRotatable = initialType >= 0;
        this.currentRotation = 0; // All rooms start in their standard orientation
    }

    // Creates a deep copy of the room
    clone(): Room {
        const clonedRoom = new Room(this.type * (this.isRotatable ? 1 : -1)); // Reconstruct initialType based on isRotatable
        clonedRoom.currentRotation = this.currentRotation;
        return clonedRoom;
    }

    // Rotates the room clockwise or counter-clockwise
    rotate(direction: 'LEFT' | 'RIGHT') {
        if (!this.isRotatable) {
            return;
        }
        if (direction === 'RIGHT') {
            this.currentRotation = (this.currentRotation + 1) % 4;
        } else { // LEFT (counter-clockwise)
            this.currentRotation = (this.currentRotation + 3) % 4; // Equivalent to -1 mod 4
        }
    }

    // Determines the exit direction based on entry direction and current rotation
    getExitDirection(entryDirection: Direction): Direction | null {
        // Calculate the entry direction relative to the room's *initial* orientation
        let relativeEntry = entryDirection;
        for (let i = 0; i < this.currentRotation; i++) {
            relativeEntry = CCW_ROTATION[relativeEntry];
        }

        const initialPaths = ROOM_TEMPLATES_BY_TYPE[this.type];
        const relativeExit = initialPaths[relativeEntry];

        if (!relativeExit) {
            return null; // Entry is blocked in this room's initial orientation
        }

        // Rotate the relative exit direction to get the actual exit direction
        let actualExit = relativeExit;
        for (let i = 0; i < this.currentRotation; i++) {
            actualExit = CW_ROTATION[actualExit];
        }
        return actualExit;
    }
}

// --- GameState Class ---

class GameState {
    W: number;
    H: number;
    grid: Room[][];
    EX: number; // Exit X coordinate at the bottom (Y = H-1)
    indyX: number;
    indyY: number;
    indyEntryPos: Direction;
    rocks: { x: number; y: number; entryPos: Direction }[];

    constructor(W: number, H: number, initialRoomTypes: number[][], EX: number) {
        this.W = W;
        this.H = H;
        this.grid = initialRoomTypes.map(row => row.map(type => new Room(type)));
        this.EX = EX;
        this.indyX = -1; // Will be updated each turn
        this.indyY = -1;
        this.indyEntryPos = "TOP";
        this.rocks = [];
    }

    // Creates a deep copy of the game state
    clone(): GameState {
        const clonedState = new GameState(this.W, this.H, [], this.EX); // Pass dummy grid, will be overwritten
        clonedState.grid = this.grid.map(row => row.map(room => room.clone()));
        clonedState.indyX = this.indyX;
        clonedState.indyY = this.indyY;
        clonedState.indyEntryPos = this.indyEntryPos;
        clonedState.rocks = this.rocks.map(rock => ({ ...rock })); // Shallow copy of rock objects is fine
        return clonedState;
    }

    // Updates Indy's position for the current turn
    updateIndy(x: number, y: number, pos: Direction) {
        this.indyX = x;
        this.indyY = y;
        this.indyEntryPos = pos;
    }

    // Updates rock positions for the current turn
    updateRocks(rocksData: { x: number; y: number; entryPos: Direction }[]) {
        this.rocks = rocksData;
    }

    // Helper to calculate one entity's next move (Indy or a rock)
    // Returns { valid: boolean; x: number; y: number; entryPos: Direction }
    // `valid` is false if entity hits a wall or goes off-grid (unless it's the exit)
    private calculateNextMove(currentX: number, currentY: number, entryPos: Direction): { valid: boolean; x: number; y: number; entryPos: Direction } {
        if (currentX < 0 || currentX >= this.W || currentY < 0 || currentY >= this.H) {
            return { valid: false, x: -1, y: -1, entryPos: "TOP" }; // Entity already off grid
        }

        const room = this.grid[currentY][currentX];
        const exitDirection = room.getExitDirection(entryPos);

        if (!exitDirection) {
            return { valid: false, x: -1, y: -1, entryPos: "TOP" }; // Hits a wall / stuck
        }

        const nextX = currentX + DX[exitDirection];
        const nextY = currentY + DY[exitDirection];
        const nextEntryPos = OPPOSITE_DIRECTION[exitDirection];

        // Check if next position is off-grid (Indy can exit here)
        if (nextX < 0 || nextX >= this.W || nextY < 0 || nextY >= this.H) {
            // If Indy reaches the exit (EX, H-1), he goes off-grid. This is a win.
            // For rocks, going off-grid means they are destroyed.
            // The validity here means "could move to the next logical cell".
            return { valid: true, x: nextX, y: nextY, entryPos: nextEntryPos };
        }
        
        // Check if the next room is Type 0 (impassable). Indy would get stuck entering it.
        const nextRoom = this.grid[nextY][nextX];
        if (nextRoom.type === 0) {
            return { valid: false, x: -1, y: -1, entryPos: "TOP" }; // Cannot move into a type 0 room
        }

        return { valid: true, x: nextX, y: nextY, entryPos: nextEntryPos };
    }

    // Simulates one full game turn (including action)
    // Returns { outcome: 'WIN' | 'LOSE' | 'CONTINUE', nextIndyX, nextIndyY, nextIndyEntry, finalRocks }
    simulateTurn(action: { type: 'WAIT' } | { type: 'ROTATE'; x: number; y: number; rot: 'LEFT' | 'RIGHT' }, isDryRun: boolean = false): { outcome: 'WIN' | 'LOSE' | 'CONTINUE'; nextIndyX?: number; nextIndyY?: number; nextIndyEntry?: Direction; finalRocks?: { x: number; y: number; entryPos: Direction }[] } {
        const stateToSimulate = isDryRun ? this.clone() : this;

        // 1. Apply rotation if specified and valid
        if (action.type === 'ROTATE') {
            const { x, y, rot } = action;
            const room = stateToSimulate.grid[y][x];

            // Ensure room is rotatable and not occupied/exit
            if (room.isRotatable &&
                !(x === stateToSimulate.indyX && y === stateToSimulate.indyY) &&
                !(x === stateToSimulate.EX && y === stateToSimulate.H - 1) &&
                !stateToSimulate.rocks.some(r => r.x === x && r.y === y)
            ) {
                room.rotate(rot);
            }
        }

        // 2. Calculate next positions for Indy and all rocks
        const nextIndyMove = stateToSimulate.calculateNextMove(stateToSimulate.indyX, stateToSimulate.indyY, stateToSimulate.indyEntryPos);
        const nextRockMoves = stateToSimulate.rocks.map(r => stateToSimulate.calculateNextMove(r.x, r.y, r.entryPos));

        // 3. Check for Indy's immediate fate
        if (!nextIndyMove.valid) {
            // Indy hit wall/stuck
            return { outcome: 'LOSE' };
        }
        // Indy reached the exit
        if (nextIndyMove.x === stateToSimulate.EX && nextIndyMove.y === stateToSimulate.H - 1) {
            return { outcome: 'WIN', nextIndyX: nextIndyMove.x, nextIndyY: nextIndyMove.y, nextIndyEntry: nextIndyMove.entryPos };
        }

        // 4. Determine final rock positions after collisions
        const newRocks: { x: number; y: number; entryPos: Direction }[] = [];
        const rockLandingSpots: Map<string, { x: number; y: number; entryPos: Direction }[]> = new Map();

        nextRockMoves.forEach(move => {
            if (move.valid) { // Only consider rocks that moved to a valid grid cell
                const posKey = `${move.x},${move.y}`;
                if (!rockLandingSpots.has(posKey)) {
                    rockLandingSpots.set(posKey, []);
                }
                rockLandingSpots.get(posKey)!.push({ x: move.x, y: move.y, entryPos: move.entryPos });
            }
        });

        for (const [posKey, rocksAtSpot] of rockLandingSpots.entries()) {
            if (rocksAtSpot.length === 1) {
                newRocks.push(rocksAtSpot[0]); // Only one rock landed here, it survives
            }
            // else: multiple rocks landed here, all are destroyed
        }
        
        // 5. Check Indy-Rock collision
        // Indy dies if he lands in the same room as a *surviving* rock.
        for (const rock of newRocks) {
            if (rock.x === nextIndyMove.x && rock.y === nextIndyMove.y) {
                return { outcome: 'LOSE' };
            }
        }

        // If not a dry run, update the actual game state
        if (!isDryRun) {
            this.indyX = nextIndyMove.x;
            this.indyY = nextIndyMove.y;
            this.indyEntryPos = nextIndyMove.entryPos;
            this.rocks = newRocks;
        }

        return {
            outcome: 'CONTINUE',
            nextIndyX: nextIndyMove.x,
            nextIndyY: nextIndyMove.y,
            nextIndyEntry: nextIndyMove.entryPos,
            finalRocks: newRocks
        };
    }
}

// --- Search Algorithm and Heuristic ---

// Max search depth for the minimax-like evaluation. 1 is typically a good balance for speed.
const MAX_SEARCH_DEPTH = 1; 

// Evaluates a given action's long-term score using a recursive search
function evaluateAction(state: GameState, action: { type: 'WAIT' } | { type: 'ROTATE'; x: number; y: number; rot: 'LEFT' | 'RIGHT' }, depth: number): number {
    // Simulate the current action
    const simulationResult = state.simulateTurn(action, true); // True for dry run

    if (simulationResult.outcome === 'WIN') {
        return 1000 - depth; // Prioritize winning, faster wins are better
    }
    if (simulationResult.outcome === 'LOSE') {
        return -1000 + depth; // Penalize losing, but slower losses are slightly less bad (might indicate more time)
    }

    // If we've reached the maximum lookahead depth, use a heuristic
    if (depth >= MAX_SEARCH_DEPTH) {
        return findIndyPathHeuristic(state);
    }

    // If 'CONTINUE' and not max depth, recursively evaluate next possible actions
    let maxNextScore = -Infinity;
    
    // Generate possible actions for the next turn's state (current state is `state` after simulation)
    const nextPossibleActions: ({ type: 'WAIT' } | { type: 'ROTATE'; x: number; y: number; rot: 'LEFT' | 'RIGHT' })[] = [{ type: 'WAIT' }];

    // Prepare info about Indy's and rocks' positions for the next turn to filter valid rotations
    const nextIndyX = simulationResult.nextIndyX!;
    const nextIndyY = simulationResult.nextIndyY!;
    const nextRocks = simulationResult.finalRocks!;

    for (let y = 0; y < state.H; y++) {
        for (let x = 0; x < state.W; x++) {
            const room = state.grid[y][x]; // 'state' is already the cloned and updated state from current depth's action
            if (room.isRotatable &&
                !(x === nextIndyX && y === nextIndyY) && // Not Indy's room
                !(x === state.EX && y === state.H - 1) && // Not exit room
                !nextRocks.some(r => r.x === x && r.y === y) // Not a room with a rock
            ) {
                nextPossibleActions.push({ type: 'ROTATE', x, y, rot: 'LEFT' });
                nextPossibleActions.push({ type: 'ROTATE', x, y, rot: 'RIGHT' });
            }
        }
    }

    for (const nextAction of nextPossibleActions) {
        // Recursively evaluate the next action on a clone of the current simulated state
        const score = evaluateAction(state.clone(), nextAction, depth + 1);
        maxNextScore = Math.max(maxNextScore, score);
    }

    return maxNextScore;
}

// Heuristic: Finds the shortest path for Indy to the exit from the current state,
// assuming optimal room rotations and avoiding existing rocks.
// Returns a score based on path length (higher is better).
function findIndyPathHeuristic(state: GameState): number {
    const queue: { x: number; y: number; entryPos: Direction; dist: number }[] = [];
    const visited = new Set<string>(); // "x,y,entryPos" to prevent cycles

    // Create a set of occupied cells by rocks for quick lookup
    const rockPositions = new Set<string>();
    state.rocks.forEach(r => rockPositions.add(`${r.x},${r.y}`));

    queue.push({ x: state.indyX, y: state.indyY, entryPos: state.indyEntryPos, dist: 0 });
    visited.add(`${state.indyX},${state.indyY},${state.indyEntryPos}`);

    while (queue.length > 0) {
        const { x, y, entryPos, dist } = queue.shift()!;

        // Check if Indy reached the exit cell
        if (x === state.EX && y === state.H - 1) {
            return 500 - dist; // Higher score for shorter paths
        }
        
        const roomAtXY = state.grid[y][x];
        const originalRotationOfRoomAtXY = roomAtXY.currentRotation; // Store original to restore later

        // Determine which rotations to check for this specific room (x,y) for optimal pathfinding
        // If the room is rotatable, try all 4 rotations. Otherwise, only its current rotation.
        const rotationsToCheck = roomAtXY.isRotatable ? [0, 1, 2, 3] : [originalRotationOfRoomAtXY];

        for (const rot of rotationsToCheck) {
            if (roomAtXY.isRotatable) {
                roomAtXY.currentRotation = rot; // Temporarily set rotation for pathfinding check
            }
            
            const exitDirection = roomAtXY.getExitDirection(entryPos);
            if (exitDirection) {
                const nextX = x + DX[exitDirection];
                const nextY = y + DY[exitDirection];
                const nextEntryPos = OPPOSITE_DIRECTION[exitDirection];

                // Check if moving off grid
                if (nextX < 0 || nextX >= state.W || nextY < 0 || nextY >= state.H) {
                    continue; // Path goes off grid, not to exit (implicitly losing path)
                }
                
                const nextStateKey = `${nextX},${nextY},${nextEntryPos}`;
                
                // CRITICAL: Cannot path through a room currently occupied by a rock.
                if (rockPositions.has(`${nextX},${nextY}`)) {
                    continue;
                }

                if (!visited.has(nextStateKey)) {
                    const targetRoom = state.grid[nextY][nextX];
                    if (targetRoom.type === 0) { // Type 0 rooms are impassable. Indy gets stuck.
                        continue;
                    }
                    
                    visited.add(nextStateKey);
                    queue.push({ x: nextX, y: nextY, entryPos: nextEntryPos, dist: dist + 1 });
                }
            }
        }
        // Restore room to its state BEFORE heuristic tried different rotations for this cell.
        // This is important because the 'state' object is being passed by reference to other BFS calls.
        roomAtXY.currentRotation = originalRotationOfRoomAtXY; 
    }
    return -500; // Cannot reach exit from this state
}


// --- Main Program Logic ---

function main() {
    // Read initial grid dimensions
    const [W, H] = readline().split(' ').map(Number);

    // Read initial room types
    const initialRoomTypes: number[][] = [];
    for (let i = 0; i < H; i++) {
        initialRoomTypes.push(readline().split(' ').map(Number));
    }

    // Read exit X coordinate
    const EX = Number(readline());

    // Initialize the game state
    const initialGameState = new GameState(W, H, initialRoomTypes, EX);

    // Game loop
    while (true) {
        // Read Indy's current position and entry point
        const [XI_str, YI_str, POSI_str] = readline().split(' ');
        const XI = Number(XI_str);
        const YI = Number(YI_str);
        const POSI = POSI_str as Direction;

        // Read number of rocks and their positions
        const R = Number(readline());
        const rocksData: { x: number; y: number; entryPos: Direction }[] = [];
        for (let i = 0; i < R; i++) {
            const [XR_str, YR_str, POSR_str] = readline().split(' ');
            rocksData.push({ x: Number(XR_str), y: Number(YR_str), entryPos: POSR_str as Direction });
        }

        // Update the current game state with Indy's and rocks' positions
        initialGameState.updateIndy(XI, YI, POSI);
        initialGameState.updateRocks(rocksData);

        let bestAction: string = "WAIT";
        let bestScore = -Infinity;

        // Generate all possible actions for the current turn
        const possibleActions: ({ type: 'WAIT' } | { type: 'ROTATE'; x: number; y: number; rot: 'LEFT' | 'RIGHT' })[] = [{ type: 'WAIT' }];

        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const room = initialGameState.grid[y][x];
                // A rotation is only possible if:
                // 1. The room is rotatable.
                // 2. It's not Indy's current room.
                // 3. It's not the exit room.
                // 4. It does not contain any rock.
                if (room.isRotatable &&
                    !(x === XI && y === YI) &&
                    !(x === EX && y === H - 1) &&
                    !rocksData.some(r => r.x === x && r.y === y)
                ) {
                    possibleActions.push({ type: 'ROTATE', x, y, rot: 'LEFT' });
                    possibleActions.push({ type: 'ROTATE', x, y, rot: 'RIGHT' });
                }
            }
        }

        // Evaluate each possible action to find the best one
        for (const action of possibleActions) {
            // Evaluate this action starting from a cloned initial state at depth 0
            const score = evaluateAction(initialGameState.clone(), action, 0);
            
            if (score > bestScore) {
                bestScore = score;
                if (action.type === 'WAIT') {
                    bestAction = "WAIT";
                } else {
                    bestAction = `${action.x} ${action.y} ${action.rot}`;
                }
            }
        }
        
        // Output the chosen action
        print(bestAction);
    }
}

// Call the main function to start the program
main();