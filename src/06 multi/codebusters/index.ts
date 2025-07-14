/**
 * Global Constants
 */
const MAP_WIDTH = 16001;
const MAP_HEIGHT = 9001;
const MOVE_DISTANCE = 800;
const BUST_MIN_RANGE = 900;
const BUST_MAX_RANGE = 1760;
const RELEASE_RANGE = 1600;
const VISIBILITY_RANGE = 2200; // Not directly used for actions, but for understanding fog of war mechanics.

/**
 * Global Game State Variables
 */
let myTeamId: number;
let myBase: Point;
let opponentBase: Point;
let bustersPerPlayer: number;
let ghostCount: number;

/**
 * Data Structures
 */
interface Point {
    x: number;
    y: number;
}

enum EntityType {
    BUSTERO = 0,
    BUSTER1 = 1,
    GHOST = -1
}

interface GameEntity {
    id: number;
    x: number;
    y: number;
    type: EntityType;
    state: number; // For busters: 0 (no ghost), 1 (carrying); For ghosts: 0
    value: number; // For busters: ghostId if carrying, else -1; For ghosts: 0 or tie count
}

class Buster {
    id: number;
    x: number;
    y: number;
    type: EntityType;
    hasGhost: boolean;
    carryingGhostId: number;
    explorationTargetIndex: number; // For patrol strategy

    constructor(entity: GameEntity, initialExplorationIndex: number) {
        this.id = entity.id;
        this.x = entity.x;
        this.y = entity.y;
        this.type = entity.type;
        this.hasGhost = entity.state === 1;
        this.carryingGhostId = entity.value;
        this.explorationTargetIndex = initialExplorationIndex;
    }

    /**
     * Updates the buster's state based on new game entity data for the current turn.
     * @param entity The GameEntity data for this buster.
     */
    update(entity: GameEntity) {
        this.x = entity.x;
        this.y = entity.y;
        this.hasGhost = entity.state === 1;
        this.carryingGhostId = entity.value;
    }
}

class Ghost {
    id: number;
    x: number;
    y: number;
    isTrapped: boolean = false; // True if carried by any buster or delivered to a base.
    lastSeenTurn: number = -1; // The turn number when this ghost was last visible.

    constructor(entity: GameEntity, currentTurn: number) {
        this.id = entity.id;
        this.x = entity.x;
        this.y = entity.y;
        this.lastSeenTurn = currentTurn;
    }

    /**
     * Updates the ghost's state based on new game entity data for the current turn.
     * If a ghost is visible, it means it's not currently carried by any buster or delivered.
     * @param entity The GameEntity data for this ghost.
     * @param currentTurn The current game turn.
     */
    update(entity: GameEntity, currentTurn: number) {
        this.x = entity.x;
        this.y = entity.y;
        this.lastSeenTurn = currentTurn;
        this.isTrapped = false; // If we see it this turn, it's not trapped or delivered.
    }

    /**
     * Marks the ghost as trapped (e.g., picked up by an opponent buster).
     */
    markTrapped() {
        this.isTrapped = true;
    }
}

/**
 * Game state maps
 */
let myBusters: Map<number, Buster> = new Map(); // Stores my team's buster objects (id -> Buster)
let opponentBusters: Map<number, Buster> = new Map(); // Stores opponent team's buster objects (id -> Buster)
let knownGhosts: Map<number, Ghost> = new Map(); // Stores all ghosts ever seen (visible, unseen, trapped)

let currentTurn: number = 0; // Tracks the current game turn

/**
 * Utility Functions
 */

/**
 * Calculates the Euclidean distance between two points.
 * @param p1 First point.
 * @param p2 Second point.
 * @returns The distance between p1 and p2.
 */
function dist(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Clamps a value between a minimum and maximum.
 * @param value The value to clamp.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns The clamped value.
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

/**
 * Determines the base coordinates for a given team ID.
 * @param teamId The ID of the team (0 or 1).
 * @returns The base coordinates as a Point.
 */
function getBase(teamId: number): Point {
    return teamId === 0 ? { x: 0, y: 0 } : { x: MAP_WIDTH - 1, y: MAP_HEIGHT - 1 };
}

/**
 * Exploration points to guide busters when no ghosts are visible.
 * These points aim to cover the map systematically.
 */
const EXPLORATION_TARGETS: Point[] = [
    { x: 8000, y: 4500 }, // Center
    { x: 4000, y: 2000 },
    { x: 12000, y: 2000 },
    { x: 4000, y: 7000 },
    { x: 12000, y: 7000 },
    { x: 2000, y: 4500 },
    { x: 14000, y: 4500 },
    { x: 8000, y: 1000 },
    { x: 8000, y: 8000 },
    // Additional points for more thorough exploration if needed
    { x: 1000, y: 1000 },
    { x: 15000, y: 1000 },
    { x: 1000, y: 8000 },
    { x: 15000, y: 8000 },
];

/**
 * Initial Game Setup
 */
bustersPerPlayer = parseInt(readline());
ghostCount = parseInt(readline());
myTeamId = parseInt(readline());

myBase = getBase(myTeamId);
opponentBase = getBase(myTeamId === 0 ? 1 : 0);

/**
 * Main Game Loop
 */
while (true) {
    currentTurn++;
    const entitiesCount: number = parseInt(readline());

    // Map to store ghosts that are visible *this* turn.
    const visibleGhostsThisTurn: Map<number, Ghost> = new Map();

    // Process all entities received in the input for the current turn
    for (let i = 0; i < entitiesCount; i++) {
        const inputs = readline().split(' ');
        const entityId: number = parseInt(inputs[0]);
        const x: number = parseInt(inputs[1]);
        const y: number = parseInt(inputs[2]);
        const entityType: EntityType = parseInt(inputs[3]);
        const state: number = parseInt(inputs[4]);
        const value: number = parseInt(inputs[5]);

        const gameEntity: GameEntity = { id: entityId, x, y, type: entityType, state, value };

        if (entityType === myTeamId) { // My team's buster
            if (!myBusters.has(entityId)) {
                // If it's a new buster (first turn), assign an initial exploration index.
                myBusters.set(entityId, new Buster(gameEntity, myBusters.size % EXPLORATION_TARGETS.length));
            } else {
                myBusters.get(entityId)!.update(gameEntity);
            }
        } else if (entityType === (myTeamId === 0 ? 1 : 0)) { // Opponent team's buster
            if (!opponentBusters.has(entityId)) {
                // No need for exploration index for opponent busters.
                opponentBusters.set(entityId, new Buster(gameEntity, 0)); 
            } else {
                opponentBusters.get(entityId)!.update(gameEntity);
            }
            // If an opponent buster is carrying a ghost, mark that ghost as trapped globally.
            if (gameEntity.state === 1 && knownGhosts.has(gameEntity.value)) {
                knownGhosts.get(gameEntity.value)!.markTrapped();
            }
        } else if (entityType === EntityType.GHOST) { // Ghost
            if (!knownGhosts.has(entityId)) {
                knownGhosts.set(entityId, new Ghost(gameEntity, currentTurn));
            } else {
                knownGhosts.get(entityId)!.update(gameEntity, currentTurn);
            }
            // Add to visible ghosts for current turn's decision making.
            visibleGhostsThisTurn.set(entityId, knownGhosts.get(entityId)!);
        }
    }

    // Keep track of ghosts assigned to my busters this turn to avoid redundant targeting.
    const assignedGhostIds: Set<number> = new Set(); 

    // Decision making for each of my busters
    for (const myBuster of myBusters.values()) {
        if (myBuster.hasGhost) {
            // Priority 1: Deliver Ghost to Base
            const d = dist(myBuster, myBase);
            if (d <= RELEASE_RANGE) {
                console.log(`RELEASE`);
            } else {
                console.log(`MOVE ${myBase.x} ${myBase.y}`);
            }
        } else {
            // Priority 2: Bust a Ghost
            let bestGhostToTarget: Ghost | null = null;
            let actionForBestGhost: string = "";
            let targetXForBestGhost: number = -1;
            let targetYForBestGhost: number = -1;

            let minDistForBust: number = Infinity;
            let minDistForTooClose: number = Infinity;
            let minDistForTooFar: number = Infinity;

            let candidateBust: Ghost | null = null;
            let candidateTooClose: Ghost | null = null;
            let candidateTooFar: Ghost | null = null;
            
            // Filter ghosts that are visible, not trapped, and not already assigned to another buster this turn.
            const availableGhosts: Ghost[] = Array.from(visibleGhostsThisTurn.values())
                .filter(ghost => !ghost.isTrapped && !assignedGhostIds.has(ghost.id));

            // Evaluate all available ghosts to find the best candidate.
            for (const ghost of availableGhosts) {
                const d = dist(myBuster, ghost);

                if (d >= BUST_MIN_RANGE && d <= BUST_MAX_RANGE) {
                    if (d < minDistForBust) { // Prefer closer ghost if it's in immediate bust range.
                        minDistForBust = d;
                        candidateBust = ghost;
                    }
                } else if (d < BUST_MIN_RANGE) {
                    // Ghost is too close, need to move away to get into bust range.
                    if (d < minDistForTooClose) { // Prefer the one that's closest amongst 'too close' category.
                        minDistForTooClose = d;
                        candidateTooClose = ghost;
                    }
                } else { // d > BUST_MAX_RANGE
                    // Ghost is too far, need to move closer.
                    if (d < minDistForTooFar) { // Prefer the closest one amongst 'too far' category.
                        minDistForTooFar = d;
                        candidateTooFar = ghost;
                    }
                }
            }

            // Decide which ghost to target based on the collected candidates and priorities.
            if (candidateBust) {
                bestGhostToTarget = candidateBust;
                actionForBestGhost = `BUST ${candidateBust.id}`;
            } else if (candidateTooClose) {
                bestGhostToTarget = candidateTooClose;
                // Calculate a target point BUST_MIN_RANGE away from the ghost, in the direction from the buster.
                const d = dist(myBuster, bestGhostToTarget); // Re-calculate for exact precision
                let targetDX: number;
                let targetDY: number;

                if (d === 0) { // Edge case: buster is exactly on top of the ghost (d=0).
                               // Move a fixed distance in a specific direction (e.g., right) to escape.
                    targetDX = BUST_MIN_RANGE;
                    targetDY = 0;
                } else {
                    const dx = myBuster.x - bestGhostToTarget.x;
                    const dy = myBuster.y - bestGhostToTarget.y;
                    const unitDx = dx / d;
                    const unitDy = dy / d;
                    targetDX = unitDx * BUST_MIN_RANGE;
                    targetDY = unitDy * BUST_MIN_RANGE;
                }
                
                targetXForBestGhost = Math.round(clamp(bestGhostToTarget.x + targetDX, 0, MAP_WIDTH - 1));
                targetYForBestGhost = Math.round(clamp(bestGhostToTarget.y + targetDY, 0, MAP_HEIGHT - 1));
                actionForBestGhost = `MOVE ${targetXForBestGhost} ${targetYForBestGhost}`;
            } else if (candidateTooFar) {
                bestGhostToTarget = candidateTooFar;
                targetXForBestGhost = bestGhostToTarget.x;
                targetYForBestGhost = bestGhostToTarget.y;
                actionForBestGhost = `MOVE ${targetXForBestGhost} ${targetYForBestGhost}`;
            }

            if (bestGhostToTarget) {
                console.log(`${actionForBestGhost}`);
                assignedGhostIds.add(bestGhostToTarget.id); // Mark the ghost as targeted for this turn.
            } else {
                // Priority 3: Explore the Map
                // Move towards the buster's current exploration target.
                let currentExplorationTarget = EXPLORATION_TARGETS[myBuster.explorationTargetIndex];

                // If the buster is close enough to its current target, move to the next one in the sequence.
                if (dist(myBuster, currentExplorationTarget) < MOVE_DISTANCE * 1.5) { // "Close enough" threshold
                    myBuster.explorationTargetIndex = (myBuster.explorationTargetIndex + 1) % EXPLORATION_TARGETS.length;
                    currentExplorationTarget = EXPLORATION_TARGETS[myBuster.explorationTargetIndex];
                }
                
                console.log(`MOVE ${currentExplorationTarget.x} ${currentExplorationTarget.y}`);
            }
        }
    }
}