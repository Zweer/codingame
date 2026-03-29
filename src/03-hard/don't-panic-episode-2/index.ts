// Define readline for CodinGame environment
declare function readline(): string;

// Helper to print debug messages (will be ignored in production by CG)
const DEBUG = false; // Set to true to enable console.error logs for debugging
const log = (...args: any[]) => {
    if (DEBUG) {
        console.error(...args);
    }
};

// Global game state variables (initialized from input)
let nbFloors: number;
let width: number;
let nbRounds: number;
let exitFloor: number;
let exitPos: number;
let nbTotalClones: number;
let nbAdditionalElevatorsInitial: number; // The initial count of buildable elevators
let nbElevatorsInitialCount: number;

// Set of all elevators, including initial ones and those we build dynamically
let elevatorsSet: Set<string> = new Set(); // Stores "floor,pos" strings for quick lookup

// Number of additional elevators remaining to build, decreases during game
let nbAdditionalElevatorsRemaining: number;

// Set of positions where clones are currently blocked
let blockedClonesPositions: Set<string> = new Set(); // Stores "floor,pos" strings

// Max turns for simulation to prevent infinite loops.
// A generous upper bound to ensure a clone can traverse the entire map.
// Max width * Max floors * 2 directions * buffer = 100 * 15 * 2 * 2 = 6000 turns.
// This is much larger than max game rounds (200), ensuring termination.
let MAX_SIM_TURNS: number; 

/**
 * Simulates a clone's path and determines its outcome.
 *
 * @param startFloor Current floor of the clone.
 * @param startPos Current position of the clone.
 * @param startDir Current direction of the clone ('LEFT' or 'RIGHT').
 * @param currentElevators Set of elevator positions available for this simulation.
 * @param currentBlockedPositions Set of blocked clone positions for this simulation.
 * @param w Width of the game area.
 * @param ef Exit floor.
 * @param ep Exit position.
 * @param maxTurns Maximum simulation turns to prevent infinite loops.
 * @returns 'SAVED' if clone reaches exit, 'DIED' if falls off, 'TOO_HIGH' if goes too far above exit,
 *          'STUCK' if enters an infinite loop, 'NONE' if path not resolved within maxTurns.
 */
function simulatePathOutcome(
    startFloor: number,
    startPos: number,
    startDir: string,
    currentElevators: Set<string>,
    currentBlockedPositions: Set<string>,
    w: number,
    ef: number,
    ep: number,
    maxTurns: number
): 'SAVED' | 'DIED' | 'STUCK' | 'TOO_HIGH' | 'NONE' {
    let currentF = startFloor;
    let currentP = startPos;
    let currentD = startDir;

    let turns = 0;
    // Use a Set to store visited states (floor, pos, direction) to detect infinite horizontal loops.
    // When changing floors, the context changes, so the visited states for the new floor are independent.
    const visitedStates = new Set<string>(); 

    while (turns < maxTurns) {
        // 1. Check for save condition: clone reached the exit
        if (currentF === ef && currentP === ep) {
            return 'SAVED';
        }

        // 2. Check for falling off the map
        if (currentP < 0 || currentP >= w) {
            return 'DIED';
        }

        // 3. Check for elevator use at the current position
        // A clone uses an elevator if it's at an elevator position AND that position is not blocked by another clone.
        const atElevator = currentElevators.has(`${currentF},${currentP}`);
        const isBlockedAtCurrentPos = currentBlockedPositions.has(`${currentF},${currentP}`);

        if (atElevator && !isBlockedAtCurrentPos) {
            // Clone moves up one floor. This action takes 1 game turn.
            currentF++;
            turns++; 

            // If clone goes significantly above the exit floor, it's considered lost.
            // A buffer of +1 floor is given in case the exit floor is the top-most,
            // or an elevator goes to the floor above the exit floor and then it can move back.
            if (currentF > ef + 1) { 
                return 'TOO_HIGH';
            }
            // Clear visited states because moving to a new floor invalidates previous horizontal loop detection.
            visitedStates.clear();
            // After moving up, the clone does not move horizontally in the same turn.
            continue; // Skip the rest of the loop for this turn and start next turn on the new floor.
        }

        // 4. Record current state before horizontal movement to detect loops
        // This state includes floor, position, and direction.
        const stateKey = `${currentF},${currentP},${currentD}`;
        if (visitedStates.has(stateKey)) {
            // If we've been in this exact state before, it means an infinite loop is detected.
            return 'STUCK'; 
        }
        visitedStates.add(stateKey);

        // 5. Calculate the next horizontal position the clone would attempt to move to
        let nextP = currentP + (currentD === 'RIGHT' ? 1 : -1);

        // 6. Check for collision with a blocked clone at the *next* intended position
        const isBlockedAtNextPos = currentBlockedPositions.has(`${currentF},${nextP}`);
        if (isBlockedAtNextPos) {
            // According to rules: "When a clone moves towards a blocked clone, it changes direction".
            // This implies the clone moves to the blocked position, then immediately turns around.
            // So, for this turn, it moves to `nextP`, and its direction reverses.
            currentD = (currentD === 'RIGHT') ? 'LEFT' : 'RIGHT'; // Reverse direction
            currentP = nextP; // Clone moves to the blocked spot
        } else {
            // No blocked clone in the way, move horizontally normally
            currentP = nextP; 
        }
        
        turns++; // One turn for horizontal movement (or for moving to and turning at a blocked spot)
    }

    // If maxTurns are exceeded, the clone hasn't reached the goal or died,
    // so its path is unresolved or it's stuck in a non-repeating long path.
    return 'NONE'; 
}


// --- Game Initialization ---

// Read initial input parameters
const initialInputs = readline().split(' ').map(Number);
nbFloors = initialInputs[0];
width = initialInputs[1];
nbRounds = initialInputs[2];
exitFloor = initialInputs[3];
exitPos = initialInputs[4];
nbTotalClones = initialInputs[5];
nbAdditionalElevatorsInitial = initialInputs[6]; // How many we can build
nbElevatorsInitialCount = initialInputs[7]; // Count of elevators already present

nbAdditionalElevatorsRemaining = nbAdditionalElevatorsInitial; // Initialize remaining elevators

// Read existing elevator locations and add them to our set
for (let i = 0; i < nbElevatorsInitialCount; i++) {
    const [ef, ep] = readline().split(' ').map(Number);
    elevatorsSet.add(`${ef},${ep}`);
}

// Calculate MAX_SIM_TURNS. It needs to be sufficiently large for the simulation to explore all viable paths.
// A clone can move at most 'width' steps per floor and 'nbFloors' floors.
// Multiplying by a factor (e.g., 4) accounts for back-and-forth movement and a safety margin.
MAX_SIM_TURNS = width * nbFloors * 4; 


// --- Game Loop ---
// This loop runs indefinitely for each game turn.
while (true) {
    const inputs = readline().split(' ');
    const cloneFloor: number = parseInt(inputs[0]);
    const clonePos: number = parseInt(inputs[1]);
    const direction: string = inputs[2]; // 'LEFT' or 'RIGHT'

    log(`--- New Turn ---`);
    log(`Leading clone: F=${cloneFloor}, P=${clonePos}, D=${direction}`);
    log(`Elevators:`, Array.from(elevatorsSet));
    log(`Blocked:`, Array.from(blockedClonesPositions));
    log(`Additional Elevators Left: ${nbAdditionalElevatorsRemaining}`);


    // If cloneFloor is -1, it means there is no leading unblocked clone.
    // In this case, we simply wait for the next clone to appear or for others to unblock.
    if (cloneFloor === -1) {
        console.log('WAIT');
        continue;
    }

    // --- Decision Logic for the Leading Clone ---

    // Step 1: Simulate the outcome if we do nothing (WAIT)
    // This checks if the current leading clone can reach the exit with the current game state.
    const outcomeIfWait = simulatePathOutcome(
        cloneFloor, clonePos, direction,
        elevatorsSet, blockedClonesPositions, // Use current actual elevators and blocked positions
        width, exitFloor, exitPos, MAX_SIM_TURNS
    );

    log(`Outcome if WAIT: ${outcomeIfWait}`);

    if (outcomeIfWait === 'SAVED') {
        // If the current clone can reach the exit, let it do so. This is the optimal outcome.
        console.log('WAIT');
    } else if (outcomeIfWait === 'DIED' || outcomeIfWait === 'TOO_HIGH') {
        // If the current clone is doomed to fall off or go too high, we *must* BLOCK it.
        // Blocking saves it from destruction and turns its position into a useful turning point for subsequent clones.
        blockedClonesPositions.add(`${cloneFloor},${clonePos}`); // Mark this position as blocked
        console.log('BLOCK');
    } else { // outcomeIfWait is 'STUCK' or 'NONE'
        // The clone is not immediately saved, nor is it immediately doomed.
        // This is where we consider building an elevator if it would help.
        let actionTaken = false; // Flag to indicate if an action (BLOCK or ELEVATOR) was chosen

        // Step 2: Consider building an elevator
        // Conditions for building an elevator:
        // 1. We have additional elevators left to build.
        // 2. There is no elevator already at the current clone's position (no need to build duplicates).
        // 3. The clone is on a floor *below* the exit floor (elevators move clones UP).
        if (nbAdditionalElevatorsRemaining > 0 &&
            !elevatorsSet.has(`${cloneFloor},${clonePos}`) &&
            cloneFloor < exitFloor) {

            // Create a temporary set of elevators for a hypothetical simulation.
            // This set includes all existing elevators plus the potential new one at clone's current position.
            const testElevatorsSet = new Set(elevatorsSet);
            testElevatorsSet.add(`${cloneFloor},${clonePos}`);

            // Simulate if a clone, *hypothetically starting from the current position*
            // and immediately using this *new* elevator, would be saved.
            // This effectively tests if building an elevator here creates a viable path to the exit.
            const outcomeIfElevatorBuilt = simulatePathOutcome(
                cloneFloor, clonePos, direction,
                testElevatorsSet, blockedClonesPositions, // Use the hypothetical elevator set
                width, exitFloor, exitPos, MAX_SIM_TURNS
            );

            log(`Outcome if ELEVATOR at (${cloneFloor},${clonePos}): ${outcomeIfElevatorBuilt}`);

            if (outcomeIfElevatorBuilt === 'SAVED') {
                // If building an elevator here leads to a successful path, then do it.
                // The current clone is sacrificed to build this elevator.
                elevatorsSet.add(`${cloneFloor},${clonePos}`); // Permanently add the new elevator to our global state
                nbAdditionalElevatorsRemaining--; // Consume one of our buildable elevators
                console.log('ELEVATOR');
                actionTaken = true; // Mark that an action has been taken
            }
        }

        // Step 3: If no elevator was built, default to BLOCK
        if (!actionTaken) {
            // If the clone wasn't saved by waiting, and we didn't build an elevator (either not needed,
            // no resources, or building one wouldn't lead to a save), then BLOCK the clone.
            // Blocking prevents it from wandering endlessly or becoming stuck in a loop,
            // and creates a turning point for other clones to utilize.
            blockedClonesPositions.add(`${cloneFloor},${clonePos}`); // Mark this position as blocked
            console.log('BLOCK');
        }
    }
}