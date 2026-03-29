/**
 * Applies a spiral permutation to the given array.
 * The permutation takes elements by alternating between the last and first of the remaining elements.
 *
 * Example: [1, 2, 3, 4, 5] becomes [5, 1, 4, 2, 3]
 *
 * @param arr The array to permute.
 * @returns A new array representing the spirally permuted sequence.
 */
function applySpiralPermutation(arr: number[]): number[] {
    // Create a mutable copy of the input array.
    // We use a copy so the original array passed to the function is not modified.
    const tempArr = [...arr];
    
    // This array will store the elements in their new permuted order.
    const resultArr: number[] = [];
    
    // A flag to alternate between taking from the end (pop) and the beginning (shift) of tempArr.
    let takeFromEnd = true;

    // Continue processing until all elements from tempArr have been moved to resultArr.
    while (tempArr.length > 0) {
        if (takeFromEnd) {
            // Take the last element from tempArr and add it to resultArr.
            // The '!' is a non-null assertion, safe here because we check tempArr.length > 0.
            resultArr.push(tempArr.pop()!);
        } else {
            // Take the first element from tempArr and add it to resultArr.
            // The '!' is a non-null assertion, safe here because we check tempArr.length > 0.
            resultArr.push(tempArr.shift()!);
        }
        // Toggle the flag for the next iteration.
        takeFromEnd = !takeFromEnd;
    }
    
    return resultArr;
}

/**
 * Main function to solve the Queneau Numbers puzzle.
 * Reads N, performs N spiral permutations, and determines if N is a Queneau Number.
 */
function solve() {
    // Read the input number N.
    // In a CodinGame environment, `readline()` is provided globally.
    const N: number = parseInt(readline());

    // Create the initial sequence [1, 2, ..., N].
    // This array serves as the target state for a Queneau Number.
    const initialSequence: number[] = Array.from({ length: N }, (_, i) => i + 1);
    
    // The sequence that will be mutated through successive permutations.
    let currentSequence: number[] = [...initialSequence];
    
    // An array to store the state of the sequence after each permutation.
    // This is used for printing the steps if N is a Queneau Number.
    const permutationsHistory: number[][] = [];

    // Perform N spiral permutations.
    // The loop runs N times, applying one permutation in each iteration.
    for (let i = 0; i < N; i++) {
        // Apply the spiral permutation to the current sequence.
        currentSequence = applySpiralPermutation(currentSequence);
        
        // Store a copy of the sequence *after* the permutation.
        // This array will thus contain P_1, P_2, ..., P_N permutations.
        permutationsHistory.push([...currentSequence]); 
    }

    // After N iterations, check if the currentSequence has returned to the initial state.
    // `every()` checks if all elements satisfy the condition (value and index match).
    const isQueneauNumber = currentSequence.every((val, index) => val === initialSequence[index]);

    // Output the result based on the check.
    if (isQueneauNumber) {
        // If N is a Queneau Number, print each step of the permutation,
        // formatted as a comma-separated string.
        permutationsHistory.forEach(perm => {
            // In a CodinGame environment, `console.log` (or `print`) is used for output.
            console.log(perm.join(',')); 
        });
    } else {
        // If N is not a Queneau Number, print "IMPOSSIBLE".
        console.log('IMPOSSIBLE');
    }
}

// Call the main solve function to execute the program logic.
// This is typical for CodinGame puzzles.
solve();

// These declarations are for CodinGame's environment and might not be needed
// if running in a standard Node.js environment where these functions are undefined.
declare function readline(): string;
declare function print(message: any): void;