/**
 * Reads a line from standard input.
 * In a CodinGame environment, `readline()` is globally available.
 * For local testing, you might need to mock or implement it (e.g., using Node.js 'readline' module).
 */
declare function readline(): string;

/**
 * Prints a string to standard output, followed by a newline.
 * In a CodinGame environment, `console.log()` is globally available.
 */
declare function console: {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
};

function solve() {
    // Read the first line: N1 and N2 (lengths of ant groups)
    const line1 = readline().split(' ');
    const N1 = parseInt(line1[0]); // Length of the first group (S1)
    const N2 = parseInt(line1[1]); // Length of the second group (S2)

    // Read the second line: S1 (first group of ants)
    const S1_str = readline();

    // Read the third line: S2 (second group of ants)
    const S2_str = readline();

    // Read the fourth line: T (number of seconds passed)
    const T = parseInt(readline());

    // Define a type for an ant, which includes its character and its original group.
    // 'S1' ants implicitly move right, 'S2' ants implicitly move left.
    type Ant = [string, 'S1' | 'S2'];

    // Initialize the passage array. This will hold the current order of ants.
    let currentAnts: Ant[] = [];

    // Add ants from group S1. They are moving from left to right,
    // so when they meet, they are effectively in reverse order from their original string.
    for (let i = S1_str.length - 1; i >= 0; i--) {
        currentAnts.push([S1_str[i], 'S1']);
    }

    // Add ants from group S2. They are moving from right to left,
    // so they are added in their original string order.
    for (let i = 0; i < S2_str.length; i++) {
        currentAnts.push([S2_str[i], 'S2']);
    }

    // Simulate the jumping process for T seconds
    for (let t = 0; t < T; t++) {
        // Create a new array for the state after this second.
        // This is important for handling simultaneous swaps: all swaps for the current
        // second are based on the 'currentAnts' state, and then applied to form 'nextAnts'.
        const nextAnts: Ant[] = [...currentAnts];
        
        // Find all indices 'i' where an S1 ant at 'i' is immediately followed by an S2 ant at 'i+1'.
        // These are the pairs that will swap positions.
        const swapIndices: number[] = [];
        for (let i = 0; i < currentAnts.length - 1; i++) {
            const ant1 = currentAnts[i];
            const ant2 = currentAnts[i+1];

            // A swap occurs if ant1 is from S1 (moving right) and ant2 is from S2 (moving left).
            if (ant1[1] === 'S1' && ant2[1] === 'S2') {
                swapIndices.push(i);
            }
        }

        // Apply all identified swaps to the 'nextAnts' array.
        // For each index 'i' in swapIndices, the ant at 'i' and 'i+1' in 'currentAnts'
        // will swap their positions in 'nextAnts'.
        for (const i of swapIndices) {
            nextAnts[i] = currentAnts[i+1];   // The ant from currentAnts[i+1] moves to nextAnts[i]
            nextAnts[i+1] = currentAnts[i];   // The ant from currentAnts[i] moves to nextAnts[i+1]
        }

        // Update the current state for the next second's simulation.
        currentAnts = nextAnts;
    }

    // After T seconds, extract only the characters from the final arrangement of ants.
    const result = currentAnts.map(ant => ant[0]).join('');

    // Print the final order of ants.
    console.log(result);
}

// Call the solve function to run the puzzle logic.
solve();