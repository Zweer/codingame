// Define types for better readability and safety
type Point = { x: number; y: number; };

class Zone {
    id: number;
    center: Point;
    controllerId: number = -1; // -1 if unowned, otherwise player ID
    myDronesInside: number = 0; // Number of my drones currently within the zone's radius
    enemyDronesInside: number = 0; // Number of enemy drones currently within the zone's radius

    constructor(id: number, x: number, y: number) {
        this.id = id;
        this.center = { x, y };
    }

    /**
     * Checks if a given point is within the zone's capture radius (100 units).
     * Uses squared distance for performance as exact distance isn't needed for comparison.
     */
    isPointInside(p: Point): boolean {
        return distanceSq(p, this.center) <= 100 * 100;
    }
}

class Drone {
    id: number; // Unique ID for this drone within its owner's team (0 to D-1)
    ownerId: number; // Player ID of the drone's owner
    position: Point;

    constructor(id: number, ownerId: number, x: number, y: number) {
        this.id = id;
        this.ownerId = ownerId;
        this.position = { x, y };
    }
}

// --- Utility Functions ---

/** Calculates the squared Euclidean distance between two points. */
function distanceSq(p1: Point, p2: Point): number {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

// --- Global Game State Variables ---
let P: number; // Number of players in the game
let MY_ID: number; // My player ID
let D: number; // Number of drones in each team
let Z: number; // Number of zones on the map
const zones: Zone[] = []; // Stores all zones with their fixed centers
let myDrones: Drone[] = []; // Stores my drones, updated each turn
let opponentDrones: Drone[] = []; // Stores opponent drones, updated each turn

// --- Initialization Phase (executed once) ---

// Read initial game parameters from standard input
const inputs = readline().split(' ').map(Number);
P = inputs[0];
MY_ID = inputs[1];
D = inputs[2];
Z = inputs[3];

// Read zone positions and initialize Zone objects
for (let i = 0; i < Z; i++) {
    const [x, y] = readline().split(' ').map(Number);
    zones.push(new Zone(i, x, y));
}

// --- Game Loop (executed each turn) ---
while (true) {
    // 1. Reset and Read Turn Data

    // Reset drone counts inside zones for the current turn's calculations
    zones.forEach(zone => {
        zone.myDronesInside = 0;
        zone.enemyDronesInside = 0;
    });

    // Read current controller for each zone
    for (let i = 0; i < Z; i++) {
        zones[i].controllerId = Number(readline());
    }

    // Read all drone positions (P players * D drones each)
    const allDrones: Drone[] = [];
    for (let i = 0; i < P; i++) { // For each player
        for (let j = 0; j < D; j++) { // For each drone of that player
            const [x, y] = readline().split(' ').map(Number);
            // Drone ID 'j' is specific to the player (0 to D-1).
            allDrones.push(new Drone(j, i, x, y));
        }
    }

    // Separate my drones from opponent drones for easier processing
    myDrones = allDrones.filter(drone => drone.ownerId === MY_ID);
    opponentDrones = allDrones.filter(drone => drone.ownerId !== MY_ID);

    // Update drone counts inside zones based on current positions
    myDrones.forEach(drone => {
        zones.forEach(zone => {
            if (zone.isPointInside(drone.position)) {
                zone.myDronesInside++;
            }
        });
    });

    opponentDrones.forEach(drone => {
        zones.forEach(zone => {
            if (zone.isPointInside(drone.position)) {
                zone.enemyDronesInside++;
            }
        });
    });

    // --- Decision Logic: Assign Targets to My Drones ---

    // Map to store the chosen target point for each of my drones. Key: drone.id, Value: target Point.
    const droneTargets: Map<number, Point> = new Map();
    // Keep track of which of my drones are still available for assignment
    const availableMyDrones = new Set(myDrones.map(drone => drone.id));

    // Calculate an approximate "center" of my drone group to help sort zones by proximity.
    let myAveragePosX = 0;
    let myAveragePosY = 0;
    if (myDrones.length > 0) {
        myDrones.forEach(d => {
            myAveragePosX += d.position.x;
            myAveragePosY += d.position.y;
        });
        myAveragePosX /= myDrones.length;
        myAveragePosY /= myDrones.length;
    }
    const myAveragePos: Point = { x: myAveragePosX, y: myAveragePosY };

    // 1. Prioritize Zones for Assignment
    let prioritizedZones: Zone[] = [];

    // Add unowned zones (highest priority for capture)
    zones.filter(z => z.controllerId === -1)
         .forEach(z => prioritizedZones.push(z));

    // Add my zones under attack (second highest priority for defense)
    zones.filter(z => z.controllerId === MY_ID && z.enemyDronesInside > 0)
         .forEach(z => prioritizedZones.push(z));

    // Add enemy-controlled zones (third highest priority for capturing new points)
    zones.filter(z => z.controllerId !== MY_ID && z.controllerId !== -1)
         .forEach(z => prioritizedZones.push(z));

    // Sort prioritized zones:
    // This sorting aims to:
    // a) Prioritize uncontrolled zones (easiest points).
    // b) Then prioritize my zones currently contested by enemies (critical defense).
    // c) Then prioritize enemy-controlled zones (offensive expansion).
    // d) Within these groups, sort by distance to the average position of my drones.
    //    This heuristic helps focus drones on objectives "closer" to my main drone cluster,
    //    improving efficiency of travel.
    prioritizedZones.sort((a, b) => {
        // Unowned zones come first
        if (a.controllerId === -1 && b.controllerId !== -1) return -1;
        if (a.controllerId !== -1 && b.controllerId === -1) return 1;

        // My contested zones come next
        const aIsMyContested = (a.controllerId === MY_ID && a.enemyDronesInside > 0);
        const bIsMyContested = (b.controllerId === MY_ID && b.enemyDronesInside > 0);
        if (aIsMyContested && !bIsMyContested) return -1;
        if (!aIsMyContested && bIsMyContested) return 1;

        // Finally, sort by squared distance to my average drone position for proximity
        return distanceSq(a.center, myAveragePos) - distanceSq(b.center, myAveragePos);
    });

    // 2. First Pass Assignment: Assign one closest drone to each prioritized zone
    // This ensures that every critical or high-priority zone gets at least one drone heading towards it.
    for (const zone of prioritizedZones) {
        if (availableMyDrones.size === 0) break; // No more drones left to assign

        let closestDrone: Drone | null = null;
        let minDistanceSq = Infinity;

        // Find the closest available drone for the current zone
        for (const droneId of availableMyDrones) {
            const drone = myDrones.find(d => d.id === droneId); // Retrieve the full Drone object by ID
            if (!drone) continue; // Should not happen if `availableMyDrones` is populated correctly

            const distSq = distanceSq(drone.position, zone.center);
            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                closestDrone = drone;
            }
        }

        if (closestDrone) {
            // Assign this drone to the zone's center as its target
            droneTargets.set(closestDrone.id, zone.center);
            // Mark the drone as assigned by removing it from the available set
            availableMyDrones.delete(closestDrone.id);
        }
    }

    // 3. Second Pass Assignment: Assign remaining drones
    // These drones will serve as reinforcements, heading to the closest available objectives.
    // This provides numerical superiority for contested zones or ensures all zones are covered
    // if there are more drones than unique high-priority targets.
    for (const droneId of availableMyDrones) {
        const drone = myDrones.find(d => d.id === droneId);
        if (!drone) continue;

        let targetZone: Zone | null = null;
        let minDistanceSq = Infinity;

        // Try to find the closest *unowned or enemy-controlled* zone for reinforcement/capture.
        const unownedOrEnemyZones = zones.filter(z => z.controllerId !== MY_ID);

        if (unownedOrEnemyZones.length > 0) {
            // If there are still unowned or enemy zones, send the drone to the closest one.
            for (const zone of unownedOrEnemyZones) {
                const distSq = distanceSq(drone.position, zone.center);
                if (distSq < minDistanceSq) {
                    minDistanceSq = distSq;
                    targetZone = zone;
                }
            }
        } else {
            // If ALL zones are currently controlled by me (and potentially safe),
            // send the remaining drones to reinforce any of my zones.
            // This acts as a defensive default, spreading drones to "guard" existing territory.
            for (const zone of zones) { // Iterate through all zones, which are all mine at this point
                const distSq = distanceSq(drone.position, zone.center);
                if (distSq < minDistanceSq) {
                    minDistanceSq = distSq;
                    targetZone = zone;
                }
            }
        }

        if (targetZone) {
            droneTargets.set(drone.id, targetZone.center);
        } else {
            // Fallback: This case should theoretically not be reached given puzzle constraints
            // (always 4-8 zones, and at least 2 players).
            // However, as a failsafe, send the drone to a default location like the map origin.
            console.error(`Warning: No specific target zone found for drone ${drone.id}. Sending to (0,0) as fallback.`);
            droneTargets.set(drone.id, { x: 0, y: 0 });
        }
    }

    // --- Output Commands ---
    // The output for drones must be in the same order as they were provided in the input.
    // My `myDrones` array maintains this original order (as it's populated from the sorted input lines).
    for (let i = 0; i < D; i++) {
        const drone = myDrones[i];
        const target = droneTargets.get(drone.id);
        if (target) {
            console.log(`${target.x} ${target.y}`);
        } else {
            // This indicates an unassigned drone, which should not happen with the current logic.
            // As a failsafe, if a drone somehow has no target, send it to its current position.
            console.error(`Error: Drone ${drone.id} has no target assigned. Staying put.`);
            console.log(`${drone.position.x} ${drone.position.y}`);
        }
    }
}