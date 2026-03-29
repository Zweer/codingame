// Define a type for a single action
type Action = {
    write: number;       // Symbol to write
    move: 'L' | 'R';     // Direction to move ('L' for left, 'R' for right)
    nextState: string;   // Name of the next state, or 'HALT'
};

// --- Input Reading and Parsing ---

// Line 1: S T X
// S: number of symbols (0 to S-1)
// T: tape length
// X: initial head position
const line1 = readline().split(' ').map(Number);
const S: number = line1[0];
const T: number = line1[1];
let headPos: number = line1[2]; // headPos will be updated during simulation

// Line 2: START - initial state
let currentState: string = readline();

// Line 3: N - number of states
const N: number = parseInt(readline());

// Next N lines: STATE: ACTIONS
// Store state rules in a Map for quick lookup by state name.
// Each state maps to an array of Actions, where the array index corresponds to the symbol read.
const stateRules = new Map<string, Action[]>();

for (let i = 0; i < N; i++) {
    const line = readline();
    const parts = line.split(':');
    const stateName = parts[0];
    
    // Actions are semicolon-separated, then each action is space-separated (W M NEXT)
    const actionsStr = parts[1].trim().split(';');

    const actionsForState: Action[] = [];
    for (const actionStr of actionsStr) {
        const [writeStr, moveStr, nextStateStr] = actionStr.trim().split(' ');
        actionsForState.push({
            write: parseInt(writeStr),
            move: moveStr as 'L' | 'R', // Type assertion for 'L' | 'R'
            nextState: nextStateStr
        });
    }
    stateRules.set(stateName, actionsForState);
}

// --- Initialization ---

// Initialize the tape with T cells, all containing symbol 0.
const tape: number[] = new Array(T).fill(0);

// Counter for the number of actions performed
let actionsPerformed: number = 0;

// A constant to represent the halting state, as specified in the problem
const HALT_STATE: string = 'HALT';

// --- Simulation Loop ---

// The machine continues to operate as long as it's not in the HALT_STATE
// and the head remains within the tape boundaries.
while (currentState !== HALT_STATE) {
    // 1. Check for out-of-bounds condition BEFORE reading/writing/moving in the current step.
    // If headPos becomes invalid from the previous move, the simulation stops here.
    if (headPos < 0) {
        headPos = -1; // Special value for left out-of-bounds output
        break;
    }
    if (headPos >= T) {
        headPos = T; // Special value for right out-of-bounds output
        break;
    }

    // 2. Read the current symbol from the tape at the head's position.
    const currentSymbol: number = tape[headPos];

    // 3. Retrieve the actions defined for the current state.
    const actionsForCurrentState = stateRules.get(currentState);

    // This should ideally not happen with valid puzzle inputs, as all states are defined.
    if (!actionsForCurrentState) {
        // console.error(`Error: No rules found for state "${currentState}". Stopping simulation.`);
        break; 
    }

    // Get the specific action to perform based on the symbol read.
    // The problem states that the symbol directly maps to the action's index.
    const actionToPerform: Action = actionsForCurrentState[currentSymbol];

    // 4. Perform the action specified by the rule:

    // Increment the counter for performed actions.
    actionsPerformed++;

    // Write the new symbol to the current tape cell.
    tape[headPos] = actionToPerform.write;

    // Move the head left or right.
    if (actionToPerform.move === 'L') {
        headPos--;
    } else { // actionToPerform.move === 'R'
        headPos++;
    }

    // Transition to the next state for the next iteration.
    currentState = actionToPerform.nextState;
}

// --- Output Results ---

// Line 1: The total number of actions performed.
console.log(actionsPerformed);

// Line 2: The final position of the head, or -1/T if out of bounds.
console.log(headPos);

// Line 3: The final content of the tape, as a string.
console.log(tape.join(''));