// Helper classes/interfaces for better type safety and organization

interface Point {
    x: number;
    y: number;
}

/**
 * Represents any unit in the game, including Reapers and Wrecks.
 */
class Unit {
    id: number;
    type: number; // 0: Reaper, 4: Wreck
    playerId: number; // 0: Me, 1,2: Opponents, -1: Neutral (Wreck)
    mass: number;
    radius: number;
    pos: Point;
    vel: Point;
    extra: number; // Water for Wrecks, -1 otherwise
    extra2: number; // Always -1 (placeholder)

    constructor(
        id: number, type: number, playerId: number, mass: number, radius: number,
        x: number, y: number, vx: number, vy: number, extra: number, extra2: number
    ) {
        this.id = id;
        this.type = type;
        this.playerId = playerId;
        this.mass = mass;
        this.radius = radius;
        this.pos = { x: x, y: y };
        this.vel = { x: vx, y: vy };
        this.extra = extra;
        this.extra2 = extra2;
    }

    /**
     * Calculates the Euclidean distance from this unit's position to another point.
     * @param other The point to calculate distance to.
     * @returns The distance.
     */
    distanceTo(other: Point): number {
        return Math.sqrt(Math.pow(this.pos.x - other.x, 2) + Math.pow(this.pos.y - other.y, 2));
    }
}

// Game loop - runs for each turn
while (true) {
    // Read player scores
    const scores: number[] = [];
    for (let i = 0; i < 3; i++) {
        scores.push(parseInt(readline()));
    }

    // Skip placeholder lines for higher leagues
    for (let i = 0; i < 3; i++) {
        readline();
    }

    // Read unit count and parse all units
    const unitCount: number = parseInt(readline());
    const units: Unit[] = [];
    for (let i = 0; i < unitCount; i++) {
        const inputs = readline().split(' ');
        const unitId: number = parseInt(inputs[0]);
        const unitType: number = parseInt(inputs[1]);
        const playerId: number = parseInt(inputs[2]);
        const mass: number = parseFloat(inputs[3]); // Mass can be a double
        const radius: number = parseInt(inputs[4]);
        const x: number = parseInt(inputs[5]);
        const y: number = parseInt(inputs[6]);
        const vx: number = parseInt(inputs[7]);
        const vy: number = parseInt(inputs[8]);
        const extra: number = parseInt(inputs[9]);
        const extra2: number = parseInt(inputs[10]);
        units.push(new Unit(unitId, unitType, playerId, mass, radius, x, y, vx, vy, extra, extra2));
    }

    // --- AI Logic ---

    // Find our Reaper (player 0)
    const myReaper = units.find(unit => unit.type === 0 && unit.playerId === 0);

    // Find all Wrecks that still have water
    const availableWrecks = units.filter(unit => unit.type === 4 && unit.extra > 0);

    let targetWreck: Unit | null = null;
    let minDistance = Infinity;

    // Ensure our Reaper exists before trying to move it
    if (myReaper) {
        // Iterate through available Wrecks to find the closest one
        for (const wreck of availableWrecks) {
            const distance = myReaper.distanceTo(wreck.pos);
            if (distance < minDistance) {
                minDistance = distance;
                targetWreck = wreck;
            }
        }

        // Determine the action for our Reaper
        if (targetWreck) {
            // Move towards the closest wreck with maximum throttle
            // THROTTLE can be 0-300. 300 is max acceleration.
            console.log(`${targetWreck.pos.x} ${targetWreck.pos.y} 300`);
        } else {
            // If no wrecks with water are found, simply wait.
            // This might happen near the end of the game or if all wrecks are dry.
            console.log("WAIT");
        }
    } else {
        // Fallback if myReaper is not found (should not happen in a valid game state)
        console.log("WAIT");
    }

    // Output placeholders for other units (Destroyer, Doof) which are present in higher leagues.
    // In Wood 4, these units are not controlled by us, so we just output WAIT.
    console.log("WAIT"); // For Destroyer
    console.log("WAIT"); // For Doof
}