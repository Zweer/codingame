/**
 * Represents a coordinate on the game board.
 */
type Point = { x: number; y: number; };

/**
 * Enum for different unit types.
 */
enum UnitType {
    CULTIST = 0,
    CULT_LEADER = 1,
}

/**
 * Enum for unit ownership.
 */
enum OwnerType {
    ME = 0,
    OPPONENT = 1,
    NEUTRAL = 2,
}

/**
 * Represents a single unit on the game board.
 */
class Unit {
    constructor(
        public id: number,
        public type: UnitType,
        public hp: number,
        public x: number,
        public y: number,
        public owner: OwnerType
    ) {}

    get pos(): Point {
        return { x: this.x, y: this.y };
    }
}

/**
 * Main game class to manage game state and logic.
 */
class Game {
    myId: number;
    width: number;
    height: number;
    initialGrid: string[][]; // Stores 'x' for obstacles, '.' for empty tiles
    currentGrid: (Unit | null)[][]; // Stores current unit positions on the grid, null for empty, dummy unit for obstacles
    units: Unit[]; // List of all units on the board
    myUnits: Unit[];
    opponentUnits: Unit[];
    neutralUnits: Unit[];
    myCultLeader: Unit | null = null;
    turn: number = 0; // Tracks current turn number

    constructor() {
        this.units = [];
        this.myUnits = [];
        this.opponentUnits = [];
        this.neutralUnits = [];
    }

    /**
     * Reads initial game input (player ID, board dimensions, obstacle layout).
     */
    readInitialInput(): void {
        this.myId = parseInt(readline());
        [this.width, this.height] = readline().split(' ').map(Number);
        this.initialGrid = Array(this.height).fill(null).map(() => readline().split(''));
    }

    /**
     * Reads turn-specific input (unit positions, HP, etc.) and updates game state.
     */
    readTurnInput(): void {
        this.turn++; // Increment turn counter for each new turn input

        // Clear previous turn's unit data
        this.units = [];
        this.myUnits = [];
        this.opponentUnits = [];
        this.neutralUnits = [];
        this.myCultLeader = null;

        // Re-initialize currentGrid with obstacles
        this.currentGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.initialGrid[y][x] === 'x') {
                    // Mark obstacles with a dummy unit ID -2 to distinguish from real units
                    this.currentGrid[y][x] = { id: -2, type: -1, hp: -1, x, y, owner: -1 } as Unit;
                }
            }
        }

        // Read and parse all unit data for the current turn
        const numOfUnits = parseInt(readline());
        for (let i = 0; i < numOfUnits; i++) {
            const [unitId, type, hp, x, y, owner] = readline().split(' ').map(Number);
            const unit = new Unit(unitId, type, hp, x, y, owner);
            this.units.push(unit);
            this.currentGrid[y][x] = unit; // Place the unit on the grid

            // Categorize units by owner
            if (unit.owner === this.myId) {
                this.myUnits.push(unit);
                if (unit.type === UnitType.CULT_LEADER) {
                    this.myCultLeader = unit;
                }
            } else if (unit.owner === (1 - this.myId)) {
                this.opponentUnits.push(unit);
            } else { // Neutral
                this.neutralUnits.push(unit);
            }
        }
    }

    /**
     * Calculates the Manhattan distance between two points.
     * @param p1 The first point.
     * @param p2 The second point.
     * @returns The Manhattan distance.
     */
    manhattanDistance(p1: Point, p2: Point): number {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }

    /**
     * Implements Bresenham's Line Algorithm to get points on a line.
     * The rule states: "always drawing the line from lower Y towards higher Y."
     * @param p1 The starting point.
     * @param p2 The ending point.
     * @returns An array of points on the line, excluding the start point.
     */
    getLinePath(p1: Point, p2: Point): Point[] {
        const points: Point[] = [];
        let x0 = p1.x;
        let y0 = p1.y;
        let x1 = p2.x;
        let y1 = p2.y;

        // Ensure y0 <= y1 as per the rule "from lower Y towards higher Y"
        if (y0 > y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy; // Initial error term for Bresenham's

        while (true) {
            points.push({ x: x0, y: y0 });
            if (x0 === x1 && y0 === y1) break; // Reached the end point

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        // Remove the starting point, as we are interested in points *between* shooter and target.
        points.shift();
        return points;
    }

    /**
     * Checks if there's an obstacle or another unit blocking the path between two points.
     * @param shooterPos The position of the unit shooting.
     * @param targetPos The position of the intended target.
     * @returns A Unit object if another unit is blocking, 'obstacle' string if an obstacle is blocking, or null if the path is clear.
     */
    getBlockingEntity(shooterPos: Point, targetPos: Point): Unit | 'obstacle' | null {
        const path = this.getLinePath(shooterPos, targetPos);
        for (const p of path) {
            // Do not check the target's own tile for blocking
            if (p.x === targetPos.x && p.y === targetPos.y) continue;

            // Check for obstacles
            if (this.initialGrid[p.y][p.x] === 'x') {
                return 'obstacle';
            }
            // Check for other units
            const unitOnPath = this.currentGrid[p.y][p.x];
            if (unitOnPath && unitOnPath.id !== -2) { // Ensure it's a real unit, not the dummy obstacle marker
                return unitOnPath;
            }
        }
        return null; // Path is clear
    }

    /**
     * Calculates the effective damage a shooter will deal to a target, considering range and line of sight.
     * @param shooter The unit attempting to shoot.
     * @param target The intended target unit.
     * @returns The damage dealt (0 if out of range or path is blocked to target).
     */
    getEffectiveDamage(shooter: Unit, target: Unit): number {
        const dist = this.manhattanDistance(shooter.pos, target.pos);
        if (dist === 0 || dist > 6) return 0; // Out of shooting range (max 6) or shooting self

        const blockingEntity = this.getBlockingEntity(shooter.pos, target.pos);

        // If there's a blocking entity that is NOT the target itself, the target is not hit.
        if (blockingEntity !== null && blockingEntity !== target) {
            return 0; // Something else was hit instead
        }

        return 7 - dist; // Damage calculation: 7 - distance
    }

    /**
     * Finds the nearest unit from a given source position within a list of units.
     * @param sourcePos The starting point for distance calculation.
     * @param units The array of units to search within.
     * @returns The nearest unit or null if the list is empty.
     */
    findNearestUnit(sourcePos: Point, units: Unit[]): Unit | null {
        let nearest: Unit | null = null;
        let minDist = Infinity;
        for (const unit of units) {
            const dist = this.manhattanDistance(sourcePos, unit.pos);
            if (dist < minDist) {
                minDist = dist;
                nearest = unit;
            }
        }
        return nearest;
    }

    /**
     * Determines and returns the best action for the current turn based on a scoring system.
     * @returns The action command string (e.g., "ID MOVE X Y").
     */
    playTurn(): string {
        let bestActionCommand: string = "WAIT";
        let bestActionScore: number = -1; // Initialize with a low score, so any action is better than WAIT

        // --- Evaluate Cult Leader Actions ---
        if (this.myCultLeader) {
            const cl = this.myCultLeader;

            // 1. Prioritize CONVERT adjacent units (neutral > enemy cultist)
            const adjCells = [
                { x: cl.x + 1, y: cl.y }, { x: cl.x - 1, y: cl.y },
                { x: cl.x, y: cl.y + 1 }, { x: cl.x, y: cl.y - 1 },
            ];
            for (const p of adjCells) {
                if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
                    const targetUnit = this.currentGrid[p.y][p.x];
                    // Check if it's a real unit (not obstacle) and not the leader itself
                    if (targetUnit && targetUnit.id !== -2 && targetUnit !== cl) {
                        if (targetUnit.owner === OwnerType.NEUTRAL) {
                            // Highest priority: converting a neutral unit
                            if (10000 > bestActionScore) {
                                bestActionScore = 10000;
                                bestActionCommand = `${cl.id} CONVERT ${targetUnit.id}`;
                            }
                        } else if (targetUnit.owner === OwnerType.OPPONENT && targetUnit.type === UnitType.CULTIST) {
                            // High priority: converting an enemy cultist
                            if (9500 > bestActionScore) {
                                bestActionScore = 9500;
                                bestActionCommand = `${cl.id} CONVERT ${targetUnit.id}`;
                            }
                        }
                    }
                }
            }

            // 2. If no adjacent convert, evaluate MOVE Cult Leader towards nearest convertable unit
            // This ensures leader tries to reach targets if not immediately convertable.
            // Only consider if no higher-priority action (like an adjacent convert) has been found.
            if (bestActionScore < 9900) { // Check if no adjacent convert action was selected
                let targetToMoveTo: Unit | null = null;
                let minMoveDist = Infinity;

                // First, check for nearest neutral unit
                const nearestNeutral = this.findNearestUnit(cl.pos, this.neutralUnits);
                if (nearestNeutral) {
                    minMoveDist = this.manhattanDistance(cl.pos, nearestNeutral.pos);
                    targetToMoveTo = nearestNeutral;
                }

                // Then, check for nearest enemy cultist (cannot convert enemy leader)
                const convertableEnemyCultists = this.opponentUnits.filter(u => u.type === UnitType.CULTIST);
                const nearestEnemyCultist = this.findNearestUnit(cl.pos, convertableEnemyCultists);
                if (nearestEnemyCultist) {
                    const dist = this.manhattanDistance(cl.pos, nearestEnemyCultist.pos);
                    // If enemy cultist is closer, or if no neutral target was found yet, target it.
                    if (dist < minMoveDist) {
                        minMoveDist = dist;
                        targetToMoveTo = nearestEnemyCultist;
                    }
                }

                if (targetToMoveTo) {
                    // Score for moving leader: higher if closer to target
                    const currentMoveScore = 4000 - minMoveDist;
                    if (currentMoveScore > bestActionScore) {
                        bestActionScore = currentMoveScore;
                        bestActionCommand = `${cl.id} MOVE ${targetToMoveTo.x} ${targetToMoveTo.y}`;
                    }
                }
            }
        }

        // --- Evaluate Cultist Actions (Shooting) ---
        // Iterate through all my cultists to find the single best shooting opportunity.
        for (const cultist of this.myUnits) {
            if (cultist.type !== UnitType.CULTIST) continue; // Only cultists can shoot

            for (const enemy of this.opponentUnits) {
                const currentDamage = this.getEffectiveDamage(cultist, enemy);
                if (currentDamage > 0) {
                    let currentShootingScore = currentDamage; // Base score is damage dealt

                    if (enemy.hp <= currentDamage) { // This shot kills the target
                        currentShootingScore += 5000; // Large bonus for a kill
                        if (enemy.type === UnitType.CULTIST) {
                            currentShootingScore += 100; // Small bonus for killing a cultist (reduces enemy unit count)
                        }
                    } else {
                        // If no kill, still better to deal damage than move randomly
                        currentShootingScore += 100; // Base for damage without a kill
                    }

                    if (currentShootingScore > bestActionScore) {
                        bestActionScore = currentShootingScore;
                        bestActionCommand = `${cultist.id} SHOOT ${enemy.id}`;
                    }
                }
            }
        }

        // --- Evaluate Cultist Actions (Moving) ---
        // This is a fallback action if no high-priority conversion or shooting action was found.
        // Only consider if the best score found so far is still relatively low (e.g., no kills, no adjacent converts).
        if (bestActionScore < 1000) { // A threshold to allow moving cultists if no strong offensive action
            let cultistToMove: Unit | null = null;
            let moveTargetX: number = -1;
            let moveTargetY: number = -1;
            let minMoveToEnemyDist = Infinity;

            for (const cultist of this.myUnits) {
                if (cultist.type !== UnitType.CULTIST) continue;

                // Find the nearest enemy for this cultist to move towards
                const nearestEnemy = this.findNearestUnit(cultist.pos, this.opponentUnits);
                if (nearestEnemy) {
                    const dist = this.manhattanDistance(cultist.pos, nearestEnemy.pos);
                    // Choose the cultist that is currently closest to an enemy, aiming to get into shooting range faster.
                    if (dist < minMoveToEnemyDist) {
                        minMoveToEnemyDist = dist;
                        cultistToMove = cultist;
                        moveTargetX = nearestEnemy.x;
                        moveTargetY = nearestEnemy.y;
                    }
                }
            }

            if (cultistToMove) {
                // Score for moving cultist: better if closer to target
                const currentMoveScore = 50 - minMoveToEnemyDist;
                if (currentMoveScore > bestActionScore) {
                    bestActionScore = currentMoveScore;
                    bestActionCommand = `${cultistToMove.id} MOVE ${moveTargetX} ${moveTargetY}`;
                }
            }
        }
        
        return bestActionCommand;
    }
}

// Main game loop
const game = new Game();
game.readInitialInput(); // Read initial setup (player ID, board size, obstacles)

// Game loop, runs for each turn
while (true) {
    game.readTurnInput(); // Read current turn's unit data
    console.log(game.playTurn()); // Determine and output the best action
}