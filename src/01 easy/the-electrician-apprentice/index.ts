// The `_readline()` function is provided by the CodinGame environment.
declare function _readline(): string;

/**
 * Helper function to read a line from standard input.
 */
const readline = (): string => {
    return _readline();
};

/**
 * Represents a single clause (a group of switches connected in series or parallel).
 */
interface Clause {
    type: 'series' | 'parallel';
    switches: string[]; // List of switch labels in this clause
}

/**
 * Represents an electrical circuit for a piece of equipment.
 */
interface Circuit {
    name: string;     // Name of the equipment (e.g., "TV", "LIGHTS")
    clauses: Clause[]; // Ordered list of clauses forming the circuit
}

// Array to store all parsed circuit definitions in the order they appear in input.
const circuits: Circuit[] = [];

// Map to store the current state of each switch (true for ON, false for OFF).
// All switches are initially OFF.
const switchStates = new Map<string, boolean>();

// Read the total number of circuits (C)
const C: number = parseInt(readline());

// Parse each circuit description line
for (let i = 0; i < C; i++) {
    const line = readline();
    const parts = line.split(' ');
    const equipmentName = parts[0];       // The first part is the equipment name
    const wiringParts = parts.slice(1); // The rest of the parts define the wiring

    const currentCircuit: Circuit = {
        name: equipmentName,
        clauses: []
    };

    let currentClause: Clause | null = null;

    // Iterate through the wiring parts to construct clauses
    for (const part of wiringParts) {
        if (part === '-') {
            // If a previous clause was being built, push it to the current circuit
            if (currentClause) {
                currentCircuit.clauses.push(currentClause);
            }
            // Start a new series clause
            currentClause = { type: 'series', switches: [] };
        } else if (part === '=') {
            // If a previous clause was being built, push it
            if (currentClause) {
                currentCircuit.clauses.push(currentClause);
            }
            // Start a new parallel clause
            currentClause = { type: 'parallel', switches: [] };
        } else { // This part is a switch label
            // The problem statement implies wiring always starts with '-' or '='.
            // So 'currentClause' should always be initialized by this point.
            if (currentClause) {
                currentClause.switches.push(part);
            }
            // Add the switch to our 'switchStates' map if it's new, initializing to OFF.
            if (!switchStates.has(part)) {
                switchStates.set(part, false);
            }
        }
    }
    // After the loop, ensure the very last clause is added to the circuit
    if (currentClause) {
        currentCircuit.clauses.push(currentClause);
    }
    circuits.push(currentCircuit);
}

// Read the number of Tom's actions (A)
const A: number = parseInt(readline());

// Process each of Tom's switch toggles
for (let i = 0; i < A; i++) {
    const switchLabel: string = readline();
    // Get the current state of the switch. If for some reason it's not in the map,
    // assume it was OFF (false) before toggling.
    const currentState = switchStates.get(switchLabel) ?? false;
    // Toggle the state and update the map
    switchStates.set(switchLabel, !currentState);
}

// Evaluate the state of each equipment and print the result
for (const circuit of circuits) {
    let isEquipmentOn = true; // Assume equipment is ON until proven otherwise

    // The entire circuit for an equipment is ON only if ALL its clauses are ON.
    for (const clause of circuit.clauses) {
        let clauseResult = false; // This will store the ON/OFF state of the current clause

        if (clause.type === 'parallel') {
            // For a parallel clause, it's ON if AT LEAST ONE of its switches is ON.
            clauseResult = false; // Start by assuming it's OFF
            for (const s of clause.switches) {
                if (switchStates.get(s)) { // If this switch 's' is ON
                    clauseResult = true; // This parallel clause is ON
                    break;               // No need to check other switches in this parallel group
                }
            }
        } else { // clause.type === 'series'
            // For a series clause, it's ON if ALL of its switches are ON.
            clauseResult = true; // Start by assuming it's ON
            for (const s of clause.switches) {
                if (!switchStates.get(s)) { // If this switch 's' is OFF
                    clauseResult = false; // This series clause is OFF
                    break;                // No need to check other switches in this series group
                }
            }
        }

        // If any clause evaluates to OFF, the entire equipment is OFF.
        // This is because the top-level connection between clauses is implicitly in series.
        if (!clauseResult) {
            isEquipmentOn = false;
            break; // Equipment is already determined to be OFF, no need to check further clauses
        }
    }

    // Output the final state for the current equipment
    if (isEquipmentOn) {
        console.log(`${circuit.name} is ON`);
    } else {
        console.log(`${circuit.name} is OFF`);
    }
}