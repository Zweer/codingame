// Enable strict type checking and other configurations if needed, usually done via tsconfig.json
// For CodinGame, direct script execution might not use a tsconfig, so rely on explicit types.

// --- Interfaces and Classes for Game Entities ---

/**
 * Represents a 2D point with X and Y coordinates.
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Enum to clearly define different types of entities in the game.
 */
enum EntityType {
    MyCar = 0,
    OpponentCar = 1,
    Prisoner = 2,
}

/**
 * Base class for all entities in the game (Cars and Prisoners).
 * Contains common properties like ID, position, velocity, and type.
 */
class Entity {
    id: number;
    type: EntityType;
    x: number;
    y: number;
    vx: number; // Velocity X
    vy: number; // Velocity Y
    angle: number; // Heading angle for cars, -1 for prisoners
    prisonerId: number; // -1 if not holding a prisoner, or ID of the held prisoner

    constructor(
        id: number,
        type: EntityType,
        x: number,
        y: number,
        vx: number,
        vy: number,
        angle: number,
        prisonerId: number
    ) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.angle = angle;
        this.prisonerId = prisonerId;
    }

    /**
     * Returns the current position of the entity as a Point object.
     */
    get pos(): Point {
        return { x: this.x, y: this.y };
    }
}

/**
 * Represents a Car entity.
 * Extends the base Entity class and adds car-specific logic.
 */
class Car extends Entity {
    // Car radius is fixed at 400 units, as per game rules.
    // This value is not strictly used in this basic strategy, but is good for documentation.
    // radius: number = 400; 

    /**
     * Checks if this car is currently holding a prisoner.
     * A car holds a prisoner if its `prisonerId` is not -1.
     */
    hasPrisoner(): boolean {
        return this.prisonerId !== -1;
    }
}

/**
 * Represents a Prisoner entity.
 * Extends the base Entity class. For Prisoners, `prisonerId` from input is always -1.
 */
class Prisoner extends Entity {
    // Prisoner radius is fixed at 100 units, as per game rules.
    // radius: number = 100;
}

// --- Global Game Parameters ---
// These are initialized once at the beginning of the game.
let MAP_RADIUS: number;
let CENTER_RADIUS: number;
let MIN_SWAP_IMPULSE: number;
let CAR_COUNT: number; // Always 2 for this puzzle

// --- Helper Functions ---

/**
 * Calculates the Euclidean distance between two 2D points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The distance between p1 and p2.
 */
function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// --- Main Game Loop ---

/**
 * This function encapsulates the entire game logic, from reading initial parameters
 * to processing each turn's input and providing output.
 */
function gameLoop() {
    // 1. Read Initialization Input:
    // These values remain constant throughout the game.
    MAP_RADIUS = parseInt(readline());
    CENTER_RADIUS = parseInt(readline());
    MIN_SWAP_IMPULSE = parseInt(readline());
    CAR_COUNT = parseInt(readline()); // Confirmed to be 2 for this puzzle

    // 2. Game Turns Loop:
    // The game proceeds turn by turn until victory/loss conditions are met.
    while (true) {
        // Read turn-specific input data.
        const myScore: number = parseInt(readline());
        const oppScore: number = parseInt(readline());
        const currentWinner: number = parseInt(readline()); // -1: lose, 0: draw, 1: win (not used in this strategy)

        const entitiesCount: number = parseInt(readline());

        // Arrays to categorize and store all entities for the current turn.
        const myCars: Car[] = [];
        const opponentCars: Car[] = [];
        const prisoners: Prisoner[] = [];
        const allEntities: Entity[] = []; // A comprehensive list for easy lookups

        // Parse each entity's data line.
        for (let i = 0; i < entitiesCount; i++) {
            const inputs = readline().split(' ');
            const entityId: number = parseInt(inputs[0]);
            const entityType: EntityType = parseInt(inputs[1]);
            const x: number = parseInt(inputs[2]);
            const y: number = parseInt(inputs[3]);
            const vx: number = parseInt(inputs[4]);
            const vy: number = parseInt(inputs[5]);
            const angle: number = parseInt(inputs[6]);
            const prisonerId: number = parseInt(inputs[7]);

            let entity: Entity;
            if (entityType === EntityType.MyCar || entityType === EntityType.OpponentCar) {
                // If the entity is a car (either ours or opponent's)
                entity = new Car(entityId, entityType, x, y, vx, vy, angle, prisonerId);
                if (entityType === EntityType.MyCar) {
                    myCars.push(entity as Car);
                } else {
                    opponentCars.push(entity as Car);
                }
            } else { // EntityType.Prisoner
                // If the entity is a prisoner
                entity = new Prisoner(entityId, entityType, x, y, vx, vy, angle, prisonerId);
                prisoners.push(entity as Prisoner);
            }
            allEntities.push(entity); // Add to the comprehensive list
        }

        // Sort our cars by their ID. This ensures consistent behavior if car order affects decision-making,
        // especially when assigning unique targets to multiple cars.
        myCars.sort((a, b) => a.id - b.id);

        // A set to keep track of prisoners that have already been assigned to one of our cars in this turn.
        // This prevents multiple cars from trying to grab the same prisoner.
        const assignedPrisoners = new Set<number>(); 

        // 3. Determine Actions for Each of My Cars:
        for (const myCar of myCars) {
            let targetX: number;
            let targetY: number;
            const thrust: number = 200; // Always use maximum thrust for aggressive movement

            if (myCar.hasPrisoner()) {
                // If the car is currently holding a prisoner, its priority is to score.
                // It drives directly towards the manhole, which is at the center (0,0).
                targetX = 0;
                targetY = 0;
            } else {
                // If the car does not have a prisoner, it needs to acquire one.
                let closestUnheldPrisoner: Prisoner | null = null;
                let minDistance = Infinity;

                // Iterate through all observed prisoners to find the best target.
                for (const prisoner of prisoners) {
                    // A prisoner is "held" if its ID matches the `prisonerId` of any car (ours or opponent's).
                    const isHeldByAnyCar = allEntities.some(e =>
                        (e.type === EntityType.MyCar || e.type === EntityType.OpponentCar) &&
                        e.prisonerId === prisoner.id
                    );

                    // Also, check if this prisoner has already been assigned to another one of our cars this turn.
                    const isAlreadyAssigned = assignedPrisoners.has(prisoner.id);

                    // If the prisoner is neither held by anyone nor already targeted by another one of our cars,
                    // consider it as a potential target.
                    if (!isHeldByAnyCar && !isAlreadyAssigned) {
                        const dist = distance(myCar.pos, prisoner.pos);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestUnheldPrisoner = prisoner;
                        }
                    }
                }

                if (closestUnheldPrisoner) {
                    // If an unheld and unassigned prisoner is found, target it.
                    targetX = closestUnheldPrisoner.x;
                    targetY = closestUnheldPrisoner.y;
                    assignedPrisoners.add(closestUnheldPrisoner.id); // Mark this prisoner as assigned to prevent re-targeting
                } else {
                    // Fallback: If no suitable unheld prisoner is found.
                    // This can happen if all prisoners are either already held by our team (by the other car)
                    // or are held by the opponent. In this situation, a safe default is to send the car to the center.
                    // This positions it strategically for a new prisoner spawn or potential interception.
                    targetX = 0;
                    targetY = 0;
                }
            }
            // 4. Output the chosen action for the current car.
            console.log(`${targetX} ${targetY} ${thrust}`);
        }
    }
}

// Start the game by calling the main game loop function.
gameLoop();