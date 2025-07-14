// Define Factory and Troop classes to hold entity information
class Factory {
    id: number;
    owner: number; // 1: me, -1: opponent, 0: neutral
    cyborgs: number;
    production: number;

    constructor(id: number, owner: number, cyborgs: number, production: number) {
        this.id = id;
        this.owner = owner;
        this.cyborgs = cyborgs;
        this.production = production;
    }
}

class Troop {
    id: number;
    owner: number; // 1: me, -1: opponent
    source: number;
    destination: number;
    cyborgs: number;
    turnsLeft: number;

    constructor(id: number, owner: number, source: number, destination: number, cyborgs: number, turnsLeft: number) {
        this.id = id;
        this.owner = owner;
        this.source = source;
        this.destination = destination;
        this.cyborgs = cyborgs;
        this.turnsLeft = turnsLeft;
    }
}

// --- Initialization Phase ---
// Read initial game parameters
const factoryCount: number = parseInt(readline());
const linkCount: number = parseInt(readline());

// Initialize distances matrix. All distances are initially Infinity,
// except for distance from a factory to itself, which is 0.
const distances: number[][] = Array(factoryCount).fill(0).map(() => Array(factoryCount).fill(Infinity));
for (let i = 0; i < factoryCount; i++) {
    distances[i][i] = 0;
}

// Read and populate direct link distances from input
for (let i = 0; i < linkCount; i++) {
    const inputs: number[] = readline().split(' ').map(Number);
    const factory1: number = inputs[0];
    const factory2: number = inputs[1];
    const distance: number = inputs[2];
    distances[factory1][factory2] = distance;
    distances[factory2][factory1] = distance; // Links are bidirectional
}

// Apply Floyd-Warshall algorithm to compute all-pairs shortest paths.
// This ensures we always know the minimum travel time between any two factories.
for (let k = 0; k < factoryCount; k++) {
    for (let i = 0; i < factoryCount; i++) {
        for (let j = 0; j < factoryCount; j++) {
            if (distances[i][j] > distances[i][k] + distances[k][j]) {
                distances[i][j] = distances[i][k] + distances[k][j];
            }
        }
    }
}

// --- Game Loop ---
while (true) {
    const entityCount: number = parseInt(readline());
    
    // Create an array to store factories, indexed by their ID for easy access.
    // Use `new Array(factoryCount)` to pre-allocate, as factory IDs are 0 to factoryCount-1.
    const factories: Factory[] = new Array(factoryCount);
    const troops: Troop[] = [];

    // Read entity information for the current turn
    for (let i = 0; i < entityCount; i++) {
        const inputs: (string | number)[] = readline().split(' ');
        const entityId: number = parseInt(inputs[0] as string);
        const entityType: string = inputs[1] as string;

        if (entityType === 'FACTORY') {
            const owner: number = parseInt(inputs[2] as string);
            const cyborgs: number = parseInt(inputs[3] as string);
            const production: number = parseInt(inputs[4] as string);
            factories[entityId] = new Factory(entityId, owner, cyborgs, production);
        } else if (entityType === 'TROOP') {
            const owner: number = parseInt(inputs[2] as string);
            const sourceId: number = parseInt(inputs[3] as string);
            const destinationId: number = parseInt(inputs[4] as string);
            // Corrected indices for cyborgs and turnsLeft
            const cyborgs: number = parseInt(inputs[5] as string); 
            const turnsLeft: number = parseInt(inputs[6] as string);
            troops.push(new Troop(entityId, owner, sourceId, destinationId, cyborgs, turnsLeft));
        }
    }

    // Filter factories by owner for easier processing and strategic decisions
    const myFactories: Factory[] = factories.filter(f => f && f.owner === 1);

    let bestMove: { sourceId: number, targetId: number, cyborgsToSend: number } | null = null;
    let maxScore: number = -Infinity;

    // Iterate through all my factories as potential sources for a new troop
    for (const sourceFactory of myFactories) {
        // A factory with no cyborgs cannot send troops
        if (sourceFactory.cyborgs === 0) continue;

        // Iterate through all other factories (neutral or opponent's) as potential targets
        for (const targetFactory of factories) {
            // Skip if target is the same as source, or if target is already owned by me
            if (sourceFactory.id === targetFactory.id || (targetFactory && targetFactory.owner === 1)) {
                continue;
            }
            
            // Ensure targetFactory is valid (could be null if an ID was skipped in input due to filtering)
            if (!targetFactory) continue;

            const travelTime = distances[sourceFactory.id][targetFactory.id];

            // Calculate the effective defense at the target factory, considering current troops and incoming ones.
            // This is a heuristic to determine how many cyborgs are truly needed.
            let effectiveTargetCyborgs = targetFactory.cyborgs;
            let netIncomingForces = 0; // Net effect of my incoming troops vs. enemy incoming troops

            for (const troop of troops) {
                // Only consider troops that will arrive at or before our new troop.
                // This simplifies the battle resolution for this turn's decision.
                if (troop.destination === targetFactory.id && troop.turnsLeft <= travelTime) {
                    if (troop.owner === 1) { // My existing troop will fight for me
                        netIncomingForces += troop.cyborgs;
                    } else { // Opponent's existing troop will fight against me
                        netIncomingForces -= troop.cyborgs;
                    }
                }
            }
            
            // Adjust the target's current cyborgs by the net effect of these incoming forces.
            // If netIncomingForces is positive, it means my existing troops are weakening the target.
            // If negative, enemy troops are strengthening it.
            effectiveTargetCyborgs -= netIncomingForces;

            // Calculate the base number of cyborgs required to capture the factory.
            // We need at least 1 more than the effective defense.
            let requiredCyborgs = Math.max(1, effectiveTargetCyborgs + 1);

            // If the target is an opponent's factory, they will produce cyborgs during our troop's travel time.
            // Account for this production as additional defense.
            if (targetFactory.owner === -1) {
                requiredCyborgs += targetFactory.production * travelTime;
            }

            // --- Move Feasibility Check ---
            // In this basic strategy, we only consider moves where the source factory has enough cyborgs
            // to guarantee capture based on our calculated `requiredCyborgs`.
            if (sourceFactory.cyborgs < requiredCyborgs) {
                continue; 
            }
            
            // If we reached here, the source factory has enough cyborgs for a guaranteed capture.
            const cyborgsToSend = requiredCyborgs;

            // --- Calculate Score for this potential move ---
            let currentScore = 0;

            // Prioritize capturing factories with high production rates
            currentScore += targetFactory.production * 100;

            // Penalize for the number of cyborgs sent (cost of the attack)
            currentScore -= cyborgsToSend * 1.5; 

            // Penalize for long travel times (delays production gain, gives opponent more time)
            currentScore -= travelTime * 3; 

            // Add a bonus for neutral factories, as they are often easier targets for expansion
            if (targetFactory.owner === 0) {
                currentScore += 50; 
            }
            // Add a slight penalty for opponent factories, as they are typically harder and riskier targets
            else if (targetFactory.owner === -1) {
                currentScore -= 20; 
            }

            // --- Defensive Consideration: Avoid leaving source factory vulnerable ---
            // Apply a heavy penalty if sending these cyborgs would leave the source factory with too few defenders.
            // This is a simple heuristic to prevent self-inflicted vulnerability.
            if (sourceFactory.cyborgs - cyborgsToSend < sourceFactory.production * 2) { 
                 currentScore -= 100; // Heavy penalty if less than 2 turns of production remain
            }
            // Even stronger penalty if a productive factory would be completely emptied.
            if (sourceFactory.production > 0 && sourceFactory.cyborgs - cyborgsToSend < 1) { 
                currentScore -= 200; // Very heavy penalty for emptying a productive factory
            }

            // Update the best move if the current one has a higher score
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestMove = {
                    sourceId: sourceFactory.id,
                    targetId: targetFactory.id,
                    cyborgsToSend: cyborgsToSend
                };
            }
        }
    }

    // Execute the best found move, or WAIT if no beneficial move was identified
    if (bestMove) {
        console.log(`MOVE ${bestMove.sourceId} ${bestMove.targetId} ${bestMove.cyborgsToSend}`);
    } else {
        console.log('WAIT');
    }
}