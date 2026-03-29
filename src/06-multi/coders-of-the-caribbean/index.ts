// Define Point class for coordinates and distance calculation
class Point {
    constructor(public x: number, public y: number) {}

    // Calculates Euclidean distance to another Point
    distance(other: Point): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}

// Define Ship class, extending Point for its position
class Ship extends Point {
    constructor(
        public id: number,
        x: number,
        y: number,
        public orientation: number, // arg1: the ship's rotation orientation (0-5)
        public speed: number,       // arg2: the ship's speed (0-2)
        public rum: number,         // arg3: the ship's stock of rum units
        public isMine: boolean      // arg4: 1 if the ship is controlled by you, 0 otherwise
    ) {
        super(x, y);
    }
}

// Define Barrel class, extending Point for its position
class Barrel extends Point {
    constructor(
        public id: number,
        x: number,
        y: number,
        public rum: number // arg1: the amount of rum in this barrel
    ) {
        super(x, y);
    }
}

// Game loop
while (true) {
    // myShipCount is always 1 in Wood 3 league
    const myShipCount: number = parseInt(readline());
    const entityCount: number = parseInt(readline());

    let myShip: Ship | null = null;
    const barrels: Barrel[] = [];

    // Parse all entities on the map
    for (let i = 0; i < entityCount; i++) {
        const inputs: string[] = readline().split(' ');
        const entityId: number = parseInt(inputs[0]);
        const entityType: string = inputs[1];
        const x: number = parseInt(inputs[2]);
        const y: number = parseInt(inputs[3]);
        const arg1: number = parseInt(inputs[4]);
        const arg2: number = parseInt(inputs[5]);
        const arg3: number = parseInt(inputs[6]);
        const arg4: number = parseInt(inputs[7]);

        if (entityType === 'SHIP') {
            const ship = new Ship(entityId, x, y, arg1, arg2, arg3, arg4 === 1);
            if (ship.isMine) {
                myShip = ship; // Found my ship
            }
            // Opponent ships are not relevant for movement in Wood 3
        } else if (entityType === 'BARREL') {
            const barrel = new Barrel(entityId, x, y, arg1);
            barrels.push(barrel); // Add barrel to list
        }
    }

    // Logic for my ship's action
    if (myShip) {
        if (barrels.length > 0) {
            // Find the closest rum barrel
            let closestBarrel: Barrel = barrels[0];
            let minDistance: number = myShip.distance(closestBarrel);

            for (let i = 1; i < barrels.length; i++) {
                const currentDistance = myShip.distance(barrels[i]);
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    closestBarrel = barrels[i];
                }
            }
            // Command the ship to move to the closest barrel's coordinates
            console.log(`MOVE ${closestBarrel.x} ${closestBarrel.y}`);
        } else {
            // No barrels left on the map.
            // This scenario is unlikely to happen in Wood 3 unless all barrels are collected.
            // In that case, simply wait to avoid errors.
            console.log('WAIT');
        }
    } else {
        // My ship was not found among the entities.
        // This should not happen in a normal game flow but is a good fallback.
        console.log('WAIT');
    }
}