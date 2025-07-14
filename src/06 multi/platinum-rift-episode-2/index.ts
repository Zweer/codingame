// Define global variables and constants
let playerCount: number;
let myId: number;
let zoneCount: number;
let linkCount: number;

let myHQId: number = -1;
let enemyHQId: number = -1;
let enemyId: number;

/**
 * Represents a single hexagonal zone on the game map.
 */
class Zone {
    id: number;
    neighbors: number[] = []; // IDs of adjacent zones
    ownerId: number = -1; // -1 for neutral, myId or enemyId
    myPods: number = 0; // Number of my PODs on this zone
    enemyPods: number = 0; // Number of enemy PODs on this zone
    visible: boolean = false; // Is this zone currently visible to my PODs?
    currentPlatinumIncome: number = 0; // Platinum bars produced this turn (0 if not visible)
    knownPlatinum: number = 0; // The last known platinum amount if it was visible and had platinum

    constructor(id: number) {
        this.id = id;
    }
}

const zones: Zone[] = [];
let currentPlatinum: number = 0; // My current platinum stock

// --- Initialization Phase ---
{
    const inputs = readline().split(' ');
    playerCount = parseInt(inputs[0]);
    myId = parseInt(inputs[1]);
    zoneCount = parseInt(inputs[2]);
    linkCount = parseInt(inputs[3]);

    enemyId = 1 - myId; // Determine enemy player ID

    // Read zone initial data (zoneId, platinumSource - platinumSource is always 0 due to fog, so discard)
    for (let i = 0; i < zoneCount; i++) {
        const inputs = readline().split(' ');
        const zoneId = parseInt(inputs[0]);
        // const platinumSource = parseInt(inputs[1]); // Discarded as per puzzle rules
        zones.push(new Zone(zoneId));
    }

    // Read zone links and populate neighbors for each zone
    for (let i = 0; i < linkCount; i++) {
        const inputs = readline().split(' ');
        const zone1 = parseInt(inputs[0]);
        const zone2 = parseInt(inputs[1]);
        zones[zone1].neighbors.push(zone2);
        zones[zone2].neighbors.push(zone1);
    }
}

// --- Game Loop ---
while (true) {
    currentPlatinum = parseInt(readline()); // Update my current platinum stock

    // Reset turn-specific dynamic zone data for all zones
    for (let i = 0; i < zoneCount; i++) {
        zones[i].ownerId = -1;
        zones[i].myPods = 0;
        zones[i].enemyPods = 0;
        zones[i].visible = false;
        zones[i].currentPlatinumIncome = 0;
    }

    // Read and update zone states for the current turn
    for (let i = 0; i < zoneCount; i++) {
        const inputs = readline().split(' ');
        const zId = parseInt(inputs[0]);
        const ownerId = parseInt(inputs[1]);
        const podsP0 = parseInt(inputs[2]);
        const podsP1 = parseInt(inputs[3]);
        const visible = parseInt(inputs[4]);
        const platinum = parseInt(inputs[5]);

        const zone = zones[zId];
        zone.ownerId = ownerId;
        zone.myPods = (myId === 0) ? podsP0 : podsP1;
        zone.enemyPods = (myId === 0) ? podsP1 : podsP0;
        zone.visible = (visible === 1);
        zone.currentPlatinumIncome = platinum;

        // Update known platinum if the zone is visible and produces platinum
        if (zone.visible && platinum > 0) {
            zone.knownPlatinum = platinum;
        }

        // Identify HQs based on ownership. HQs are always visible.
        if (myHQId === -1 && zone.ownerId === myId) {
            myHQId = zId;
        }
        if (enemyHQId === -1 && zone.ownerId === enemyId) {
            enemyHQId = zId;
        }
    }

    const moves: string[] = []; // Stores the movement commands for this turn
    // Tracks PODs already committed to a move from a specific zone to avoid over-committing
    const podsCommitted: Map<number, number> = new Map(); 

    // --- BFS to calculate distances from all zones to the enemy HQ ---
    const distanceToEnemyHQ: number[] = new Array(zoneCount).fill(Infinity);
    const queue: number[] = [];
    if (enemyHQId !== -1) { // Ensure enemy HQ is known
        queue.push(enemyHQId);
        distanceToEnemyHQ[enemyHQId] = 0;
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            for (const neighborId of zones[currentId].neighbors) {
                if (distanceToEnemyHQ[neighborId] === Infinity) {
                    distanceToEnemyHQ[neighborId] = distanceToEnemyHQ[currentId] + 1;
                    queue.push(neighborId);
                }
            }
        }
    }
    
    // Get all zones currently owned by me
    // Sort them by proximity to enemy HQ to prioritize front-line operations
    const myOwnedZones = zones.filter(z => z.ownerId === myId)
                               .sort((a, b) => distanceToEnemyHQ[a.id] - distanceToEnemyHQ[b.id]);

    // Iterate through my owned zones to determine movements
    for (const sourceZone of myOwnedZones) {
        // Calculate currently available PODs, accounting for those already committed
        let currentAvailablePods = sourceZone.myPods - (podsCommitted.get(sourceZone.id) || 0);

        if (currentAvailablePods <= 0) {
            continue; // No PODs available for action from this zone
        }

        // --- Priority 1: Retreat if losing a fight ---
        // If my PODs are outnumbered or equal to enemy PODs on this zone, and there are enemy PODs
        if (sourceZone.enemyPods > 0 && currentAvailablePods <= sourceZone.enemyPods) {
            const retreatTargets = sourceZone.neighbors.filter(nId => {
                const targetZone = zones[nId];
                // PODs in combat can only retreat to owned or neutral zones
                return targetZone.ownerId === myId || targetZone.ownerId === -1;
            });
            if (retreatTargets.length > 0) {
                const targetId = retreatTargets[0]; // Simply pick the first available safe target
                const podsToRetreat = currentAvailablePods; // Retreat all available PODs
                moves.push(`${podsToRetreat} ${sourceZone.id} ${targetId}`);
                podsCommitted.set(sourceZone.id, (podsCommitted.get(sourceZone.id) || 0) + podsToRetreat);
                continue; // All PODs from this zone committed to retreat, move to next source zone
            }
        }

        // --- Priority 2: Direct Attack on Enemy HQ ---
        // If enemy HQ is known and adjacent to the current zone
        if (enemyHQId !== -1 && sourceZone.neighbors.includes(enemyHQId)) {
            const enemyHQ = zones[enemyHQId];
            // To guarantee capture of an enemy zone with E pods, we need E+1 pods (to eliminate their pods and have 1 remaining).
            const podsNeededForHQ = enemyHQ.enemyPods + 1; 
            
            if (currentAvailablePods >= podsNeededForHQ) {
                moves.push(`${currentAvailablePods} ${sourceZone.id} ${enemyHQId}`);
                podsCommitted.set(sourceZone.id, (podsCommitted.get(sourceZone.id) || 0) + currentAvailablePods);
                continue; // PODs committed to HQ attack, move to next source zone
            }
        }

        // --- Priority 3: Capture Visible Neutral Platinum Zones ---
        // Find adjacent, neutral, visible zones with known platinum sources
        const adjacentNeutralPlatinumTargets = sourceZone.neighbors
            .filter(nId => {
                const targetZone = zones[nId];
                return targetZone.ownerId === -1 && targetZone.visible && targetZone.knownPlatinum > 0;
            })
            .sort((a, b) => zones[b].knownPlatinum - zones[a].knownPlatinum); // Prioritize higher platinum income

        if (adjacentNeutralPlatinumTargets.length > 0 && currentAvailablePods > 0) {
            const targetId = adjacentNeutralPlatinumTargets[0];
            const podsToSend = 1; // Only 1 POD is needed to capture a neutral zone
            if (currentAvailablePods >= podsToSend) {
                moves.push(`${podsToSend} ${sourceZone.id} ${targetId}`);
                podsCommitted.set(sourceZone.id, (podsCommitted.get(sourceZone.id) || 0) + podsToSend);
                currentAvailablePods -= podsToSend; // Deduct used pods; remaining can be used for lower priorities
            }
        }

        // --- Priority 4: Strategic Movement towards Enemy HQ / General Expansion ---
        // If PODs are still available and enemy HQ is reachable
        if (currentAvailablePods > 0 && distanceToEnemyHQ[sourceZone.id] !== Infinity) {
            let targetDestinationId: number = -1;
            let minDistToHQ = distanceToEnemyHQ[sourceZone.id];

            // Find an adjacent zone that brings us closer to the enemy HQ
            for (const neighborId of sourceZone.neighbors) {
                const neighborZone = zones[neighborId];
                
                // If the current zone is in combat, its PODs cannot move to an enemy-owned neighbor.
                if (sourceZone.enemyPods > 0 && neighborZone.ownerId === enemyId) continue;

                // Check if the neighbor is indeed closer to enemy HQ
                if (distanceToEnemyHQ[neighborId] < minDistToHQ) {
                    // If the target is an enemy zone, ensure we have enough PODs to capture it this turn
                    if (neighborZone.ownerId === enemyId) {
                        const podsNeeded = neighborZone.enemyPods + 1;
                        if (currentAvailablePods < podsNeeded) {
                            continue; // Not enough PODs to capture this specific enemy zone, skip it for now
                        }
                    }
                    minDistToHQ = distanceToEnemyHQ[neighborId];
                    targetDestinationId = neighborId;
                }
            }

            if (targetDestinationId !== -1) { // If a strategic target (closer to HQ) was found
                let podsToMove = currentAvailablePods;
                // If the source is my HQ, leave some PODs for its defense (e.g., 5).
                // For other owned zones, leave 1 POD to maintain ownership if there's more than 1 pod.
                if (sourceZone.id === myHQId) {
                    podsToMove = Math.max(0, currentAvailablePods - 5); 
                } else if (sourceZone.ownerId === myId && sourceZone.myPods > 1) { 
                    podsToMove = Math.max(0, currentAvailablePods - 1);
                }
                
                if (podsToMove > 0) {
                    moves.push(`${podsToMove} ${sourceZone.id} ${targetDestinationId}`);
                    podsCommitted.set(sourceZone.id, (podsCommitted.get(sourceZone.id) || 0) + podsToMove);
                    currentAvailablePods -= podsToMove; // Deduct used pods
                }
            } else if (currentAvailablePods > 0 && sourceZone.enemyPods === 0) {
                // If no strategic move towards HQ is feasible (or HQ is unreachable),
                // and the current zone is not in combat, try to expand to any adjacent neutral zone.
                const adjNeutral = sourceZone.neighbors.find(nId => zones[nId].ownerId === -1);
                if (adjNeutral !== undefined) {
                    const podsToMove = 1; // Just one pod to claim a neutral zone
                    if (currentAvailablePods >= podsToMove) {
                        moves.push(`${podsToMove} ${sourceZone.id} ${adjNeutral}`);
                        podsCommitted.set(sourceZone.id, (podsCommitted.get(sourceZone.id) || 0) + podsToMove);
                    }
                }
            }
        }
    }
    
    // --- Output Movements ---
    if (moves.length === 0) {
        console.log('WAIT'); // If no moves were decided, print WAIT
    } else {
        console.log(moves.join(' ')); // Print all combined movement commands
    }

    // --- Output for Buying Phase ---
    // As per puzzle rules update, always output WAIT for the buying phase.
    console.log('WAIT');
}