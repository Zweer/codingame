// Define Point class for coordinates
class Point {
    constructor(public x: number, public y: number) {}
}

// Helper function for Euclidean distance between two Point objects
function calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Define base Entity class
class Entity {
    constructor(
        public id: number,
        public type: string, // WIZARD, OPPONENT_WIZARD, SNAFFLE
        public x: number,
        public y: number,
        public vx: number,
        public vy: number,
        public state: number // 0 for not grabbed, 1 for grabbed
    ) {}

    get position(): Point {
        return new Point(this.x, this.y);
    }
}

// Global variables for game state
let myTeamId: number;
let myGoalX: number;
let myGoalY: number = 3750; // Y-coordinate for goals is always 3750
let opponentGoalX: number;
let opponentGoalY: number = 3750; // Y-coordinate for goals is always 3750

// Read initial input
myTeamId = parseInt(readline());
if (myTeamId === 0) {
    // My goal is on the left (X=0), opponent's goal on the right (X=16000)
    myGoalX = 0;
    opponentGoalX = 16000;
} else {
    // My goal is on the right (X=16000), opponent's goal on the left (X=0)
    myGoalX = 16000;
    opponentGoalX = 0;
}

// Game loop
while (true) {
    // Read scores (not used in Wood 4 logic for actions)
    readline(); // myScore myMagic
    readline(); // opponentScore opponentMagic

    // Read entities
    const entitiesCount = parseInt(readline());
    const myWizards: Entity[] = [];
    const opponentWizards: Entity[] = [];
    const snaffles: Entity[] = [];

    for (let i = 0; i < entitiesCount; i++) {
        const inputs = readline().split(' ');
        const entityId = parseInt(inputs[0]);
        const entityType = inputs[1];
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);
        const vx = parseInt(inputs[4]);
        const vy = parseInt(inputs[5]);
        const state = parseInt(inputs[6]);

        const entity = new Entity(entityId, entityType, x, y, vx, vy, state);

        if (entityType === 'WIZARD') {
            myWizards.push(entity);
        } else if (entityType === 'OPPONENT_WIZARD') {
            opponentWizards.push(entity);
        } else if (entityType === 'SNAFFLE') {
            snaffles.push(entity);
        }
    }

    // Logic for my wizards
    const targetedSnaffleIds: Set<number> = new Set(); // To ensure each wizard targets a unique Snaffle if possible

    for (const wizard of myWizards) {
        if (wizard.state === 1) { // This wizard has grabbed a Snaffle last turn
            // Throw the Snaffle towards the center of the opponent's goal with maximum power
            console.log(`THROW ${opponentGoalX} ${opponentGoalY} 500`);
        } else { // This wizard does not have a Snaffle
            let closestUngrabbedSnaffle: Entity | null = null;
            let minDistanceToSnaffle = Infinity;

            // Find the closest ungrabbed Snaffle that has not been targeted by another one of our wizards this turn
            for (const snaffle of snaffles) {
                if (snaffle.state === 0 && !targetedSnaffleIds.has(snaffle.id)) { // Snaffle is not grabbed and not already assigned
                    const dist = calculateDistance(wizard.position, snaffle.position);
                    if (dist < minDistanceToSnaffle) {
                        minDistanceToSnaffle = dist;
                        closestUngrabbedSnaffle = snaffle;
                    }
                }
            }

            if (closestUngrabbedSnaffle) {
                // Move towards the chosen Snaffle with maximum thrust
                console.log(`MOVE ${closestUngrabbedSnaffle.x} ${closestUngrabbedSnaffle.y} 150`);
                // Mark this Snaffle as targeted so the other wizard doesn't go for it
                targetedSnaffleIds.add(closestUngrabbedSnaffle.id);
            } else {
                // Fallback: If no ungrabbed Snaffles are available (all are grabbed by opponents or my other wizard)
                // Move to a defensive/central position near our goal area.
                // This position is 3000 units from the goal line, vertically centered.
                const defenseX = myTeamId === 0 ? 3000 : 16000 - 3000;
                console.log(`MOVE ${defenseX} ${myGoalY} 150`);
            }
        }
    }
}