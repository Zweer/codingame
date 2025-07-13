/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

/**
 * Calculates the minimum number of clumps for a given number string N and base B.
 * A clump is a contiguous sequence of digits where all digits D have the same D % B value.
 *
 * @param N_string The number N as a string.
 * @param B The base to use for modular congruence.
 * @returns The minimum number of clumps.
 */
function countClumps(N_string: string, B: number): number {
    // According to constraints (N >= 10), N_string will always have at least two digits.
    // If N_string were empty, return 0 clumps.
    if (N_string.length === 0) {
        return 0;
    }

    let clumpCount = 0;
    // Initialize with a value that ensures the first digit always starts a new clump.
    // Any value outside the possible remainder range [0, B-1] works.
    let currentClumpRemainder = -1; 

    // Iterate through each character (digit) of the number string.
    for (let i = 0; i < N_string.length; i++) {
        // Convert the character digit to an integer (base 10).
        const digit = parseInt(N_string[i], 10);
        
        // Calculate the remainder of the current digit when divided by base B.
        const remainder = digit % B;

        // If this is the very first digit being processed (clumpCount is 0),
        // or if the current digit's remainder is different from the remainder of the current clump,
        // then a new clump must be started.
        if (clumpCount === 0 || remainder !== currentClumpRemainder) {
            clumpCount++; // Increment the total number of clumps.
            currentClumpRemainder = remainder; // Set the remainder for this new clump.
        }
        // If the remainder matches `currentClumpRemainder`, the digit belongs to the current clump.
        // No action needed; continue to the next digit.
    }
    return clumpCount; // Return the total count of clumps found.
}

// Read the input number N as a string.
const N: string = readline();

// `previousClumpCount` stores the number of clumps found for the base `B-1`.
// Initialize it to -1 to signify that for B=1, there is no "previous" base,
// thus no deviation can be registered on the first iteration.
let previousClumpCount: number = -1; 

// Iterate through single-digit positive bases B from 1 to 9.
for (let B = 1; B <= 9; B++) {
    // Calculate the number of clumps for the current base B.
    const currentClumpCount = countClumps(N, B);

    // Check for a deviation from normal behavior:
    // A deviation occurs if we have a `previousClumpCount` (i.e., not the B=1 iteration)
    // AND the `currentClumpCount` is less than `previousClumpCount`.
    if (previousClumpCount !== -1 && currentClumpCount < previousClumpCount) {
        // This is the first base B where deviation occurs.
        console.log(B);
        // Terminate the program immediately as per problem requirements.
        // `process.exit(0)` is commonly used in Node.js environments like CodinGame.
        process.exit(0); 
    }
    
    // Update `previousClumpCount` for the next iteration (i.e., for B+1).
    previousClumpCount = currentClumpCount;
}

// If the loop completes, it means no deviation was found for any base from 1 to 9.
// In this case, the number exhibits "Normal" behavior.
console.log("Normal");