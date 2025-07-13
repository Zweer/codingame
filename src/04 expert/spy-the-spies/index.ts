// Define the readline function for CodinGame environment
declare function readline(): string;

// --- Data Structures ---

// Represents a suspect with their name, enemy status, and attributes.
interface Suspect {
    name: string;
    isEnemy: boolean;
    attributes: Set<string>;
}

// Represents a state in the BFS search space.
interface State {
    potentialSuspectNames: Set<string>; // Names of suspects still under consideration
    identifiedSpyNames: Set<string>;   // Names of suspects identified as spies
    commands: string[];             // List of commands issued to reach this state
}

// --- Input Parsing ---

// Read the list of enemy names
const enemyNamesLine: string = readline();
const enemyNames: Set<string> = new Set(enemyNamesLine.split(' '));

// Store all suspect data in a Map for quick lookup by name
const allSuspectsMap = new Map<string, Suspect>();
const allSuspectNames: string[] = []; // Used to initialize the set of all potential suspects

for (let i = 0; i < 15; i++) {
    const line = readline();
    const parts = line.split(' ');
    const name = parts[0];
    const attributeCount = parseInt(parts[1]);
    const attributes = new Set(parts.slice(2, 2 + attributeCount));

    allSuspectsMap.set(name, {
        name,
        isEnemy: enemyNames.has(name),
        attributes,
    });
    allSuspectNames.push(name);
}

// --- BFS Helper Functions ---

/**
 * Generates a unique string key for a state to be used in the 'visited' set.
 * Ensures consistent ordering regardless of Set internal representation.
 * @param state The state object.
 * @returns A unique string key for the state.
 */
function getStateKey(state: State): string {
    const sortedPotential = Array.from(state.potentialSuspectNames).sort().join(',');
    const sortedIdentified = Array.from(state.identifiedSpyNames).sort().join(',');
    return `P:${sortedPotential}|I:${sortedIdentified}`;
}

// --- BFS Implementation ---

const queue: State[] = []; // BFS queue
const visited = new Set<string>(); // Set to store visited state keys

// Initialize the BFS with the starting state
const initialPotential = new Set(allSuspectNames);
const initialState: State = {
    potentialSuspectNames: initialPotential,
    identifiedSpyNames: new Set(),
    commands: [],
};

queue.push(initialState);
visited.add(getStateKey(initialState));

let solutionCommands: string[] | null = null; // Stores the commands for the shortest solution

while (queue.length > 0) {
    const currentState = queue.shift()!; // Dequeue the next state

    // --- Goal Check ---
    // A state is a goal if:
    // 1. All original 6 enemy spies are in `identifiedSpyNames`.
    // 2. ONLY enemy spies are in `identifiedSpyNames` (i.e., no innocents).
    
    let allEnemiesIdentified = true;
    for (const enemyName of enemyNames) {
        if (!currentState.identifiedSpyNames.has(enemyName)) {
            allEnemiesIdentified = false;
            break;
        }
    }

    if (allEnemiesIdentified) {
        let onlyEnemiesIdentified = true;
        for (const identifiedName of currentState.identifiedSpyNames) {
            if (!allSuspectsMap.get(identifiedName)!.isEnemy) {
                onlyEnemiesIdentified = false;
                break;
            }
        }

        if (onlyEnemiesIdentified) {
            // Found a valid solution. Since it's BFS, this is guaranteed to be the shortest.
            solutionCommands = currentState.commands;
            break; // Exit the BFS loop
        }
    }

    // --- Generate Possible Next Commands ---

    // Collect all unique attributes present among the current potential suspects
    const relevantAttributes = new Set<string>();
    for (const name of currentState.potentialSuspectNames) {
        for (const attr of allSuspectsMap.get(name)!.attributes) {
            relevantAttributes.add(attr);
        }
    }

    for (const attribute of relevantAttributes) {
        // --- Option 1: Apply the "attribute" command ---
        // Suspects with 'attribute' are moved from potential to identified.
        const nextPotential1 = new Set(currentState.potentialSuspectNames);
        const nextIdentified1 = new Set(currentState.identifiedSpyNames);

        let commandApplied1 = false; // Flag to check if this command had any effect
        const suspectsToMove: string[] = []; // Temporarily store names to avoid modifying set during iteration

        for (const suspectName of nextPotential1) {
            if (allSuspectsMap.get(suspectName)!.attributes.has(attribute)) {
                suspectsToMove.push(suspectName);
                commandApplied1 = true;
            }
        }
        
        for (const suspectName of suspectsToMove) {
            nextPotential1.delete(suspectName);
            nextIdentified1.add(suspectName);
        }

        if (commandApplied1) { // Only enqueue if the command actually changed the state
            const nextState1: State = {
                potentialSuspectNames: nextPotential1,
                identifiedSpyNames: nextIdentified1,
                commands: [...currentState.commands, attribute],
            };
            const key1 = getStateKey(nextState1);
            if (!visited.has(key1)) {
                queue.push(nextState1);
                visited.add(key1);
            }
        }

        // --- Option 2: Apply the "NOT attribute" command ---
        // Suspects with 'attribute' are removed (absolved) from potential.
        const nextPotential2 = new Set(currentState.potentialSuspectNames);
        const nextIdentified2 = new Set(currentState.identifiedSpyNames); // Identified spies are not affected by NOT

        let commandApplied2 = false; // Flag to check if this command had any effect
        const suspectsToAbsolve: string[] = [];

        for (const suspectName of nextPotential2) {
            if (allSuspectsMap.get(suspectName)!.attributes.has(attribute)) {
                suspectsToAbsolve.push(suspectName);
                commandApplied2 = true;
            }
        }

        for (const suspectName of suspectsToAbsolve) {
            nextPotential2.delete(suspectName); // Absolved
        }
        
        if (commandApplied2) { // Only enqueue if the command actually changed the state
            const nextState2: State = {
                potentialSuspectNames: nextPotential2,
                identifiedSpyNames: nextIdentified2,
                commands: [...currentState.commands, `NOT ${attribute}`],
            };
            const key2 = getStateKey(nextState2);
            if (!visited.has(key2)) {
                queue.push(nextState2);
                visited.add(key2);
            }
        }
    }
}

// --- Output Result ---
if (solutionCommands) {
    solutionCommands.forEach(cmd => console.log(cmd));
}