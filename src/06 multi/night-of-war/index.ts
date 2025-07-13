// Define constants for directions
enum Direction {
    UP = 0,
    LEFT = 1,
    DOWN = 2,
    RIGHT = 3
}

// Map direction enum to string for output
const DirectionName = {
    [Direction.UP]: "UP",
    [Direction.LEFT]: "LEFT",
    [Direction.DOWN]: "DOWN",
    [Direction.RIGHT]: "RIGHT"
};

// Delta coordinates for each direction [dx, dy]
const DirectionDelta = {
    [Direction.UP]: { dx: 0, dy: -1 },
    [Direction.LEFT]: { dx: -1, dy: 0 },
    [Direction.DOWN]: { dx: 0, dy: 1 },
    [Direction.RIGHT]: { dx: 1, dy: 0 }
};

// Opposite direction for each direction
const OppositeDirection = {
    [Direction.UP]: Direction.DOWN,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.DOWN]: Direction.UP,
    [Direction.RIGHT]: Direction.LEFT
};

// Interface for Block
interface Block {
    ownerId: number;
    x: number;
    y: number;
}

// Interface for Soldier
interface Soldier {
    ownerId: number;
    x: number;
    y: number;
    soldierId: number;
    level: number;
    direction: Direction;
}

let myId: number;
let mapSize: number;

// Helper function to calculate Manhattan distance
function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Checks if a move from the soldier's current position to a target (newX, newY) is valid.
 * A move is valid if:
 * - The target is within map bounds.
 * - The target is adjacent (Manhattan distance 1).
 * - The target is NOT in the opposite direction of the soldier's facing.
 */
function isValidMove(soldier: Soldier, targetX: number, targetY: number): boolean {
    // Check bounds
    if (targetX < 0 || targetX >= mapSize || targetY < 0 || targetY >= mapSize) {
        return false;
    }

    const dist = manhattanDistance(soldier.x, soldier.y, targetX, targetY);
    if (dist !== 1) { // Must be an adjacent cell
        return false;
    }

    // Check if the target is in the opposite direction
    const dx = targetX - soldier.x;
    const dy = targetY - soldier.y;

    const oppDir = OppositeDirection[soldier.direction];
    const oppDelta = DirectionDelta[oppDir];

    if (dx === oppDelta.dx && dy === oppDelta.dy) {
        return false; // Cannot move in the opposite direction
    }

    return true;
}

/**
 * Checks if a soldier can attack a target soldier.
 * An attack is valid if:
 * - The target is within Manhattan distance 2.
 * - The target is NOT in the "back side" of the attacking soldier's facing direction.
 * - The target's level is less than or equal to the attacker's level (always true for level 0 in this league).
 */
function isValidAttack(mySoldier: Soldier, targetSoldier: Soldier): boolean {
    // Distance check
    const dist = manhattanDistance(mySoldier.x, mySoldier.y, targetSoldier.x, targetSoldier.y);
    if (dist > 2) {
        return false;
    }

    // "Not in back side of direction" check
    const dx = targetSoldier.x - mySoldier.x;
    const dy = targetSoldier.y - mySoldier.y;

    switch (mySoldier.direction) {
        case Direction.UP:
            if (dy > 0) return false; // Target is below (back side)
            break;
        case Direction.LEFT:
            if (dx > 0) return false; // Target is right (back side)
            break;
        case Direction.DOWN:
            if (dy < 0) return false; // Target is above (back side)
            break;
        case Direction.RIGHT:
            if (dx < 0) return false; // Target is left (back side)
            break;
    }

    // Level check: In Wood 4, level is always 0, so this condition is always met if both are 0.
    // if (targetSoldier.level > mySoldier.level) return false; 

    return true;
}

// Read initial input
myId = parseInt(readline());
mapSize = parseInt(readline());

// Game loop
while (true) {
    const myBucks = parseInt(readline());
    const oppBucks = parseInt(readline());

    // Read blocks
    const blocks: Block[][] = Array(mapSize).fill(0).map(() => Array(mapSize).fill(null));
    for (let i = 0; i < mapSize * mapSize; i++) {
        const inputs = readline().split(' ');
        const blockOwner = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        blocks[y][x] = { ownerId: blockOwner, x, y };
    }

    // Read soldiers
    const activeSoldierCount = parseInt(readline());
    const allSoldiers: Soldier[] = [];
    const mySoldiers: Soldier[] = [];
    const oppSoldiers: Soldier[] = [];

    for (let i = 0; i < activeSoldierCount; i++) {
        const inputs = readline().split(' ');
        const ownerId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const soldierId = parseInt(inputs[3]);
        const level = parseInt(inputs[4]);
        const direction = parseInt(inputs[5]) as Direction;

        const soldier: Soldier = { ownerId, x, y, soldierId, level, direction };
        allSoldiers.push(soldier);

        if (ownerId === myId) {
            mySoldiers.push(soldier);
        } else {
            oppSoldiers.push(soldier);
        }
    }

    let actionTaken = false;

    // Iterate through my soldiers to decide an action
    for (const mySoldier of mySoldiers) {
        // Priority 1: Attack an enemy soldier if possible and affordable
        if (myBucks >= 35) {
            let bestTarget: Soldier | null = null;
            let minDistance = Infinity;

            for (const oppSoldier of oppSoldiers) {
                if (isValidAttack(mySoldier, oppSoldier)) {
                    const dist = manhattanDistance(mySoldier.x, mySoldier.y, oppSoldier.x, oppSoldier.y);
                    if (dist < minDistance) { // Prioritize closer targets
                        minDistance = dist;
                        bestTarget = oppSoldier;
                    }
                }
            }

            if (bestTarget) {
                console.log(`ATTACK ${mySoldier.soldierId} ${bestTarget.soldierId}`);
                actionTaken = true;
                break; // One action per turn
            }
        }

        // Priority 2: Move to capture an adjacent unowned or opponent-owned block
        let targetMoveDirection: Direction | null = null;
        let bestMoveTargetX = -1;
        let bestMoveTargetY = -1;
        
        // Check all 4 adjacent cells
        for (const dir of [Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT]) {
            const { dx, dy } = DirectionDelta[dir];
            const newX = mySoldier.x + dx;
            const newY = mySoldier.y + dy;

            if (isValidMove(mySoldier, newX, newY)) {
                const block = blocks[newY][newX];
                // Check if block is unowned or opponent-owned
                if (block.ownerId !== myId) { 
                    // Check if the target block is already occupied by another soldier
                    const isOccupied = allSoldiers.some(s => s.x === newX && s.y === newY);
                    if (!isOccupied) {
                        // Found a valid adjacent target block, take it
                        targetMoveDirection = dir;
                        bestMoveTargetX = newX;
                        bestMoveTargetY = newY;
                        break; // Prioritize this immediate capture
                    }
                }
            }
        }

        if (targetMoveDirection !== null) {
            console.log(`MOVE ${mySoldier.soldierId} ${DirectionName[targetMoveDirection]}`);
            actionTaken = true;
            break; // One action per turn
        }

        // Priority 3: Move towards the closest unowned/opponent-owned block or opponent soldier
        // This is a basic move to explore or get closer to action if no immediate capture/attack.
        let closestStrategicTarget: { x: number, y: number } | null = null;
        let minStrategicDistance = Infinity;

        // Find the closest unowned/opponent-owned block that is not occupied by a soldier
        for (let y = 0; y < mapSize; y++) {
            for (let x = 0; x < mapSize; x++) {
                const block = blocks[y][x];
                if (block.ownerId !== myId) {
                    const isOccupied = allSoldiers.some(s => s.x === x && s.y === y);
                    if (!isOccupied) {
                        const dist = manhattanDistance(mySoldier.x, mySoldier.y, x, y);
                        if (dist < minStrategicDistance) {
                            minStrategicDistance = dist;
                            closestStrategicTarget = { x, y };
                        }
                    }
                }
            }
        }
        
        // Also consider moving towards an opponent soldier if they are closer than any unowned block
        for (const oppSoldier of oppSoldiers) {
            const dist = manhattanDistance(mySoldier.x, mySoldier.y, oppSoldier.x, oppSoldier.y);
            if (dist < minStrategicDistance) {
                minStrategicDistance = dist;
                closestStrategicTarget = { x: oppSoldier.x, y: oppSoldier.y };
            }
        }

        if (closestStrategicTarget) {
            let preferredDirection: Direction | null = null;
            let currentMinDistAfterMove = Infinity;

            // Check all valid move directions (respecting soldier's facing)
            for (const dir of [Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT]) {
                const { dx, dy } = DirectionDelta[dir];
                const newX = mySoldier.x + dx;
                const newY = mySoldier.y + dy;

                if (isValidMove(mySoldier, newX, newY)) {
                    // Avoid moving onto another soldier
                    const isTileOccupiedBySoldier = allSoldiers.some(s => s.x === newX && s.y === newY);
                    if (isTileOccupiedBySoldier) continue;

                    const distToTargetAfterMove = manhattanDistance(newX, newY, closestStrategicTarget.x, closestStrategicTarget.y);
                    if (distToTargetAfterMove < currentMinDistAfterMove) {
                        currentMinDistAfterMove = distToTargetAfterMove;
                        preferredDirection = dir;
                    }
                }
            }

            if (preferredDirection !== null) {
                console.log(`MOVE ${mySoldier.soldierId} ${DirectionName[preferredDirection]}`);
                actionTaken = true;
                break; // One action per turn
            }
        }
    }

    // If no action was taken by any soldier, wait
    if (!actionTaken) {
        console.log("WAIT");
    }
}