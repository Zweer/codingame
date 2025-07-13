// Standard input/output handling for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

/**
 * Represents a point with x and y coordinates.
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Represents a single duck in the game.
 */
interface Duck {
    id: number;
    initialPos: Point; // Position at Turn 1
    turn2Pos: Point;   // Position at Turn 2
    currentPos: Point; // Current position in simulation (updates each turn, reflects position *after* movement for current turn)
    velocity: Point;   // Velocity vector (vx, vy)
    isAlive: boolean;  // True if the duck has not been shot and is still within bounds
}

function solve() {
    // Read W (width) and H (height) of the field of view
    const [W, H] = readline().split(' ').map(Number);

    // Read the grid for Turn 1
    const grid1: string[] = [];
    for (let i = 0; i < H; i++) {
        grid1.push(readline());
    }

    // Read the grid for Turn 2
    const grid2: string[] = [];
    for (let i = 0; i < H; i++) {
        grid2.push(readline());
    }

    // Maps to store duck positions for Turn 1 and Turn 2.
    // This helps in identifying which ducks are present in both turns for velocity calculation.
    const positionsTurn1: Map<number, Point> = new Map();
    const positionsTurn2: Map<number, Point> = new Map();

    // Populate position maps for both turns
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const char1 = grid1[y][x];
            if (char1 !== '.') {
                const id = parseInt(char1);
                positionsTurn1.set(id, { x, y });
            }
            const char2 = grid2[y][x];
            if (char2 !== '.') {
                const id = parseInt(char2);
                positionsTurn2.set(id, { x, y });
            }
        }
    }

    // Initialize the main ducks map. Only ducks present in both turns can have their velocity determined.
    const ducks: Map<number, Duck> = new Map();
    for (const [id, pos1] of positionsTurn1.entries()) {
        const pos2 = positionsTurn2.get(id);
        if (pos2) { // Duck present in both turns
            const velocity = { x: pos2.x - pos1.x, y: pos2.y - pos1.y };
            ducks.set(id, {
                id: id,
                initialPos: pos1,
                turn2Pos: pos2,
                currentPos: { ...pos2 }, // Initialize currentPos to the Turn 2 position.
                                          // This means for Turn 3, ducks will move from this point.
                velocity: velocity,
                isAlive: true,
            });
        }
    }

    // Array to store the ducks shot and their coordinates, in chronological order.
    const shotDucks: { id: number, x: number, y: number }[] = [];

    // Simulation starts from Turn 3, as we can only shoot from this turn.
    let currentTurn = 3;

    // The simulation continues as long as there are active (not shot, not out of bounds) ducks.
    while (true) {
        // --- Phase 1: Advance all alive ducks for the current turn ---
        for (const duck of ducks.values()) {
            if (!duck.isAlive) continue; // Skip ducks that are already shot or out of bounds

            // Update the duck's position based on its velocity.
            // For Turn 3, this moves the duck from its Turn 2 position to its Turn 3 position.
            // For subsequent turns, it moves from its previous turn's `currentPos` to the new `currentPos`.
            duck.currentPos.x += duck.velocity.x;
            duck.currentPos.y += duck.velocity.y;

            // Check if the duck is now out of the field of view.
            // If it is, it cannot be shot this turn or any future turn.
            if (duck.currentPos.x < 0 || duck.currentPos.x >= W || duck.currentPos.y < 0 || duck.currentPos.y >= H) {
                duck.isAlive = false; // Mark as gone
            }
        }

        // --- Phase 2: Filter active ducks and check for simulation end ---
        const activeDucks = Array.from(ducks.values()).filter(d => d.isAlive);

        // If no ducks are left (all shot or out of bounds), end the simulation.
        if (activeDucks.length === 0) {
            break;
        }

        // --- Phase 3: Identify vulnerable ducks (those that will leave the field on the *next* turn) ---
        let vulnerableDucks: Duck[] = [];
        for (const duck of activeDucks) {
            // Calculate the duck's projected position for the next turn.
            const nextX = duck.currentPos.x + duck.velocity.x;
            const nextY = duck.currentPos.y + duck.velocity.y;

            // If the duck's next position is out of bounds, it is vulnerable.
            if (nextX < 0 || nextX >= W || nextY < 0 || nextY >= H) {
                vulnerableDucks.push(duck);
            }
        }

        // --- Phase 4: Shoot one duck if possible ---
        if (vulnerableDucks.length > 0) {
            // To ensure a unique and consistent solution (as implied by the problem),
            // we sort vulnerable ducks by ID and always shoot the one with the smallest ID.
            vulnerableDucks.sort((a, b) => a.id - b.id);

            const duckToShoot = vulnerableDucks[0];
            
            // Record the shot duck's ID and its coordinates on the *current* turn.
            shotDucks.push({
                id: duckToShoot.id,
                x: duckToShoot.currentPos.x,
                y: duckToShoot.currentPos.y,
            });
            
            duckToShoot.isAlive = false; // Mark the duck as shot.
        }
        
        // Advance to the next turn.
        currentTurn++;
    }

    // --- Output the results ---
    for (const shot of shotDucks) {
        print(`${shot.id} ${shot.x} ${shot.y}`);
    }
}

// Call the solve function to run the puzzle logic
solve();