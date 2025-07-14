/**
 * Global variables for game state and map information.
 */
let playerCount: number; // Total number of players in the game
let myId: number; // Our player ID (0, 1, 2, or 3)
let zoneCount: number; // Total number of zones on the map
let linkCount: number; // Total number of links between zones

/**
 * Interface representing a single hexagonal zone on the map.
 */
interface Zone {
    id: number; // Unique identifier for the zone
    platinumSource: number; // Amount of platinum this zone produces per round (initial value)
    ownerId: number; // Current owner of the zone (-1 for neutral) (updated per round)
    pods: number[]; // Array of POD counts for each player on this zone (updated per round)
    neighbors: number[]; // Array of zone IDs that are adjacent to this zone (initial value)
}

/**
 * Global array to store all zone objects, indexed by their ID.
 */
const zones: Zone[] = [];

/**
 * Adjacency list representing the graph of zones. Maps zone ID to an array of its neighbor IDs.
 */
const adj: Map<number, number[]> = new Map();

/**
 * Current amount of platinum we have in stock (updated per round).
 */
let myPlatinum: number;

/**
 * Interface for a movement command.
 */
interface MoveCommand {
    count: number; // Number of PODs to move
    from: number; // Origin zone ID
    to: number; // Destination zone ID
}

/**
 * Interface for a purchase command.
 */
interface BuyCommand {
    count: number; // Number of PODs to buy
    to: number; // Destination zone ID where PODs will be placed
}

/**
 * Constants for game mechanics and AI heuristics.
 */
const POD_COST = 20; // Platinum cost per War POD
const MIN_DEFENSE_PODS = 1; // Minimum PODs to keep on a source zone when moving others
const MIN_SAFE_PODS_ON_DEFENDED_ZONE = 5; // Target POD count for valuable owned zones (platinum source or border)
const EXCESS_PODS_THRESHOLD = 5; // Pods above this amount on a zone are considered 'excess' for consolidation

/**
 * Reads the initial game data (map structure).
 * This function is called only once at the start of the game.
 */
function readInitialInput(): void {
    // Read the first line: playerCount, myId, zoneCount, linkCount
    const inputs = readline().split(' ').map(Number);
    playerCount = inputs[0];
    myId = inputs[1];
    zoneCount = inputs[2];
    linkCount = inputs[3];

    // Read zone details: zoneId, platinumSource
    for (let i = 0; i < zoneCount; i++) {
        const zoneInputs = readline().split(' ').map(Number);
        const zoneId = zoneInputs[0];
        const platinumSource = zoneInputs[1];
        zones[zoneId] = {
            id: zoneId,
            platinumSource: platinumSource,
            ownerId: -1, // Default owner is neutral, updated in game loop
            pods: Array(playerCount).fill(0), // POD counts initialized to 0, updated in game loop
            neighbors: [],
        };
    }

    // Read link details: zone1, zone2 (connections between zones)
    for (let i = 0; i < linkCount; i++) {
        const linkInputs = readline().split(' ').map(Number);
        const zone1 = linkInputs[0];
        const zone2 = linkInputs[1];
        zones[zone1].neighbors.push(zone2);
        zones[zone2].neighbors.push(zone1);

        // Populate the adjacency list for BFS
        if (!adj.has(zone1)) adj.set(zone1, []);
        if (!adj.has(zone2)) adj.set(zone2, []);
        adj.get(zone1)!.push(zone2);
        adj.get(zone2)!.push(zone1);
    }
}

/**
 * Reads per-round game data (current platinum, zone ownership, POD locations).
 * This function is called at the beginning of each game round.
 */
function readRoundInput(): void {
    myPlatinum = Number(readline()); // Our current platinum balance

    // Update zone information for the current round
    for (let i = 0; i < zoneCount; i++) {
        const zoneInputs = readline().split(' ').map(Number);
        const zId = zoneInputs[0];
        zones[zId].ownerId = zoneInputs[1]; // Current owner
        zones[zId].pods[0] = zoneInputs[2]; // PODs for player 0
        zones[zId].pods[1] = zoneInputs[3]; // PODs for player 1
        if (playerCount > 2) zones[zId].pods[2] = zoneInputs[4]; // PODs for player 2 (if exists)
        if (playerCount > 3) zones[zId].pods[3] = zoneInputs[5]; // PODs for player 3 (if exists)
    }
}

/**
 * Performs a multi-source Breadth-First Search (BFS) to find the shortest path
 * from any of the given source zones to all other reachable zones.
 * @param sourceZoneIds An array of zone IDs from which to start the BFS.
 * @returns A Map where keys are target zone IDs and values are objects
 *          containing the shortest distance and the path (array of zone IDs)
 *          from the source zone to the target zone. The path starts with the source zone ID.
 */
function getReachableZonesInfo(sourceZoneIds: number[]): Map<number, { distance: number, path: number[] }> {
    const queue: { id: number, dist: number, path: number[] }[] = [];
    // visited map stores the shortest path found so far to each zone.
    const visited = new Map<number, { distance: number, path: number[] }>();

    // Initialize the queue with all source zones.
    for (const startId of sourceZoneIds) {
        queue.push({ id: startId, dist: 0, path: [startId] });
        visited.set(startId, { dist: 0, path: [startId] });
    }

    let head = 0;
    while (head < queue.length) {
        const { id, dist, path } = queue[head++];

        // Explore neighbors
        for (const neighborId of adj.get(id) || []) {
            // If neighbor not visited or a shorter path is found
            if (!visited.has(neighborId) || visited.get(neighborId)!.dist > dist + 1) {
                visited.set(neighborId, { dist: dist + 1, path: [...path, neighborId] });
                queue.push({ id: neighborId, dist: dist + 1, path: [...path, neighborId] });
            }
        }
    }
    return visited;
}

/**
 * Performs a single-source BFS to find the shortest path from a given start zone
 * to any zone that satisfies the target predicate.
 * @param startId The zone ID from which to start the BFS.
 * @param targetPredicate A function that returns true if a zone is a target.
 * @returns An object containing the shortest distance and path, or null if no target is reachable.
 */
function BFS_single_source(startId: number, targetPredicate: (zoneId: number) => boolean): { distance: number, path: number[] } | null {
    const queue: { id: number, dist: number, path: number[] }[] = [{ id: startId, dist: 0, path: [startId] }];
    const visited = new Set<number>();
    visited.add(startId);

    while (queue.length > 0) {
        const { id, dist, path } = queue.shift()!;

        // If the current zone is a target (and not the starting zone itself)
        if (targetPredicate(id) && id !== startId) {
            return { distance: dist, path: path };
        }

        // Explore neighbors
        for (const neighborId of adj.get(id) || []) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, dist: dist + 1, path: [...path, neighborId] });
            }
        }
    }
    return null; // No path found
}

/**
 * Main function to execute the AI logic for a single game round.
 */
function playRound(): void {
    const moveCommands: MoveCommand[] = [];
    const buyCommands: BuyCommand[] = [];

    // podsAvailableForMove tracks the number of pods we have on each of our zones
    // that are still available for movement in the current round after planning previous moves.
    const podsAvailableForMove = new Map<number, number>();
    for (const zone of zones) {
        if (zone.ownerId === myId) {
            podsAvailableForMove.set(zone.id, zone.pods[myId]);
        }
    }

    // Categorize zones for easier access
    const myZones = zones.filter(z => z.ownerId === myId);
    const neutralZones = zones.filter(z => z.ownerId === -1);
    const enemyZones = zones.filter(z => z.ownerId !== myId && z.ownerId !== -1);

    // Get reachable info from all our owned zones with PODs
    const mySourceZones = myZones.filter(z => (podsAvailableForMove.get(z.id) || 0) > 0).map(z => z.id);
    const reachableInfo = getReachableZonesInfo(mySourceZones);

    // Keep track of zones that were targeted for expansion/attack, to prioritize buying pods for them.
    const targetedZonesForNewPods = new Set<number>();

    // --- Move Planning ---

    // A. Aggressive Platinum Expansion (Neutral Zones)
    const expansionTargets = neutralZones
        .filter(z => z.platinumSource > 0) // Only consider zones with platinum
        .map(z => {
            const info = reachableInfo.get(z.id);
            // Ensure the target is reachable from one of our zones
            return info ? { zone: z, distance: info.distance, sourcePath: info.path } : null;
        })
        .filter(Boolean) as { zone: Zone, distance: number, sourcePath: number[] }[]
        .sort((a, b) => {
            // Prioritize higher platinum source, then closer targets
            if (b.zone.platinumSource !== a.zone.platinumSource) {
                return b.zone.platinumSource - a.zone.platinumSource;
            }
            return a.distance - b.distance;
        });

    for (const target of expansionTargets) {
        const sourceId = target.sourcePath[0]; // The origin zone of the shortest path from our territory
        const nextStepInPath = target.sourcePath[1]; // The next zone to move to along the path

        const currentPodsOnSource = podsAvailableForMove.get(sourceId) || 0;

        // Ensure we have enough pods at the source and can keep MIN_DEFENSE_PODS there.
        if (currentPodsOnSource > MIN_DEFENSE_PODS) {
            const sendCount = 1; // Send 1 POD to claim/advance towards neutral platinum zone
            moveCommands.push({ count: sendCount, from: sourceId, to: nextStepInPath });
            podsAvailableForMove.set(sourceId, currentPodsOnSource - sendCount);
            // If the target is adjacent (distance 1), it's about to be captured, so target it for new pods.
            if (target.distance === 1) {
                targetedZonesForNewPods.add(target.zone.id);
            }
        }
    }

    // B. Attack Weak Enemy Zones
    const attackTargets = enemyZones
        .map(z => {
            const info = reachableInfo.get(z.id);
            return info ? { zone: z, distance: info.distance, sourcePath: info.path } : null;
        })
        .filter(Boolean) as { zone: Zone, distance: number, sourcePath: number[] }[]
        .sort((a, b) => {
            // Prioritize easier targets (fewer enemy pods), then closer ones.
            const enemyPodsA = a.zone.pods[a.zone.ownerId];
            const enemyPodsB = b.zone.pods[b.zone.ownerId];
            if (enemyPodsA !== enemyPodsB) {
                return enemyPodsA - enemyPodsB;
            }
            return a.distance - b.distance;
        });

    for (const target of attackTargets) {
        const sourceId = target.sourcePath[0];
        const nextStepInPath = target.sourcePath[1];

        const currentPodsOnSource = podsAvailableForMove.get(sourceId) || 0;
        const enemyPods = target.zone.pods[target.zone.ownerId];

        // Heuristic: Send (enemy pods + 1) to try to capture the zone in one round of direct combat.
        const podsToSend = enemyPods + 1;

        // Ensure we have enough pods to send and retain MIN_DEFENSE_PODS at the source.
        if (currentPodsOnSource > MIN_DEFENSE_PODS && (currentPodsOnSource - podsToSend) >= MIN_DEFENSE_PODS) {
            moveCommands.push({ count: podsToSend, from: sourceId, to: nextStepInPath });
            podsAvailableForMove.set(sourceId, currentPodsOnSource - podsToSend);
            targetedZonesForNewPods.add(target.zone.id); // Mark for new pods, as we're attacking it.
        }
    }

    // C. Reinforce My Zones
    const reinforcementTargets = myZones
        .filter(z => {
            // A zone needs reinforcement if it's a high-platinum zone or a border zone,
            // and its current POD count is below MIN_SAFE_PODS_ON_DEFENDED_ZONE.
            const isBorder = z.neighbors.some(nId => zones[nId].ownerId !== myId);
            return (z.platinumSource > 0 && z.pods[myId] < MIN_SAFE_PODS_ON_DEFENDED_ZONE) ||
                   (isBorder && z.pods[myId] < MIN_SAFE_PODS_ON_DEFENDED_ZONE);
        })
        .map(z => ({
            zone: z,
            needed: MIN_SAFE_PODS_ON_DEFENDED_ZONE - z.pods[myId], // How many pods it needs
        }))
        .sort((a, b) => b.needed - a.needed); // Prioritize zones needing more pods

    for (const target of reinforcementTargets) {
        // Find the best source zone (closest owned zone with excess pods)
        let bestSourceId: number | null = null;
        let minPathLength = Infinity;

        for (const myZone of myZones) {
            const currentPodsOnSource = podsAvailableForMove.get(myZone.id) || 0;
            // Cannot reinforce itself, and source must have more than MIN_DEFENSE_PODS
            if (myZone.id === target.zone.id || currentPodsOnSource <= MIN_DEFENSE_PODS) continue;

            const info = reachableInfo.get(target.zone.id);
            // Check if this `myZone` is the starting point of the shortest path to the target.
            if (info && info.path[0] === myZone.id) {
                if (info.distance < minPathLength) {
                    minPathLength = info.distance;
                    bestSourceId = myZone.id;
                }
            }
        }

        if (bestSourceId !== null && minPathLength > 0) { // Ensure a valid source and a path exists (not target itself)
            const currentPodsOnSource = podsAvailableForMove.get(bestSourceId)!;
            // Calculate pods to move: send what's needed, but don't drop source below MIN_DEFENSE_PODS
            const podsToMove = Math.min(target.needed, currentPodsOnSource - MIN_DEFENSE_PODS);

            if (podsToMove > 0) {
                const nextStepInPath = reachableInfo.get(target.zone.id)!.path[1];
                moveCommands.push({ count: podsToMove, from: bestSourceId, to: nextStepInPath });
                podsAvailableForMove.set(bestSourceId, currentPodsOnSource - podsToMove);
                target.needed -= podsToMove; // Update remaining needed pods for this target
            }
        }
    }

    // D. Consolidate leftover pods (move excess from interior zones to a 'hub' or front)
    // Find a 'hub' zone: e.g., the owned zone with the highest platinum source.
    let hubZoneId: number | null = null;
    if (myZones.length > 0) {
        hubZoneId = myZones.reduce((prev, curr) =>
            (curr.platinumSource > (zones[prev.id]?.platinumSource || -1)) ? curr : prev,
            myZones[0]).id;
    }

    if (hubZoneId !== null) {
        for (const myZone of myZones) {
            const currentPodsOnSource = podsAvailableForMove.get(myZone.id) || 0;
            if (myZone.id === hubZoneId) continue; // Don't move from hub to hub

            if (currentPodsOnSource > EXCESS_PODS_THRESHOLD) {
                const podsToMove = currentPodsOnSource - MIN_DEFENSE_PODS; // Keep MIN_DEFENSE_PODS for local defense
                if (podsToMove > 0) {
                    // Find a path from this `myZone` to the `hubZoneId` using single-source BFS.
                    const pathFromMeToHub = BFS_single_source(myZone.id, (zId) => zId === hubZoneId);
                    // Ensure a path exists and it's not just the hub zone itself (path length > 1 means it's moving)
                    if (pathFromMeToHub && pathFromMeToHub.path.length > 1) {
                        const nextStep = pathFromMeToHub.path[1]; // The next zone in the path towards the hub
                        moveCommands.push({ count: podsToMove, from: myZone.id, to: nextStep });
                        podsAvailableForMove.set(myZone.id, MIN_DEFENSE_PODS); // Assume only MIN_DEFENSE_PODS left
                    }
                }
            }
        }
    }

    // --- Buy Planning ---
    let podsToBuy = Math.floor(myPlatinum / POD_COST);
    if (podsToBuy > 0) {
        const buyCandidates: { zoneId: number, priority: number }[] = [];

        // 1. Prioritize newly targeted zones (from expansion/attack) if they are now owned or still neutral/contested
        for (const zId of targetedZonesForNewPods) {
            if (zones[zId].ownerId === myId || zones[zId].ownerId === -1) { // If we captured it, or it's still neutral/contested
                buyCandidates.push({ zoneId: zId, priority: 100 + (zones[zId].platinumSource || 0) });
            }
        }

        // 2. Prioritize high platinum owned zones that are under-defended or on the frontline
        for (const myZone of myZones) {
            const isBorder = myZone.neighbors.some(nId => zones[nId].ownerId !== myId);
            if (myZone.platinumSource > 0 || isBorder) {
                if (myZone.pods[myId] < MIN_SAFE_PODS_ON_DEFENDED_ZONE) {
                    buyCandidates.push({ zoneId: myZone.id, priority: 50 + myZone.platinumSource });
                }
            }
        }

        // 3. Fallback: Any owned zone with high platinum source, to boost income security or for future staging.
        for (const myZone of myZones) {
             if (myZone.platinumSource > 0) {
                 buyCandidates.push({ zoneId: myZone.id, priority: myZone.platinumSource });
             }
        }

        // Sort candidates by priority (descending)
        buyCandidates.sort((a, b) => b.priority - a.priority);

        // If no specific candidates, and we own zones, fallback to the highest platinum owned zone.
        if (buyCandidates.length === 0 && myZones.length > 0) {
            const highestPlatinumZone = myZones.reduce((maxZ, currentZ) =>
                (currentZ.platinumSource > maxZ.platinumSource ? currentZ : maxZ),
                myZones[0]);
            buyCandidates.push({ zoneId: highestPlatinumZone.id, priority: 1 });
        }

        // Distribute pods to buy among the chosen candidates
        if (buyCandidates.length > 0) {
            // Try to give at least one pod to each high-priority candidate initially
            const initialPodsPerCandidate = Math.floor(podsToBuy / buyCandidates.length);
            let remainingPods = podsToBuy;

            for (const candidate of buyCandidates) {
                if (remainingPods <= 0) break;
                const buyCount = Math.max(1, Math.min(initialPodsPerCandidate, remainingPods)); // At least 1 pod if possible
                buyCommands.push({ count: buyCount, to: candidate.zoneId });
                remainingPods -= buyCount;
            }

            // Distribute any remaining pods to the first candidate (or randomly)
            if (remainingPods > 0 && buyCommands.length > 0) {
                buyCommands[0].count += remainingPods;
            }
        }
    }

    // --- Output Commands ---
    if (moveCommands.length === 0) {
        print('WAIT');
    } else {
        print(moveCommands.map(m => `${m.count} ${m.from} ${m.to}`).join(' '));
    }

    if (buyCommands.length === 0) {
        print('WAIT');
    } else {
        print(buyCommands.map(b => `${b.count} ${b.to}`).join(' '));
    }
}

// Initial setup: Read map data once
readInitialInput();

// Game loop: Runs for each round
while (true) {
    readRoundInput(); // Read current game state
    playRound(); // Execute AI logic
}