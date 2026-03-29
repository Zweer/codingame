/**
 * Auto-generated code below aims at helping you parse the standard input
 * according to the problem statement.
 **/

const N: number = parseInt(readline()); // Read the number of urinals
const B: string = readline();          // Read the string representing urinal states

// Initialize variables to keep track of the best urinal found so far
let maxIsolationScore: number = -1; // Stores the maximum minimum distance found. Initialized to -1,
                                    // as distances are non-negative.
let bestUrinalIndex: number = -1;   // Stores the index of the urinal with maxIsolationScore.

// Iterate through each urinal to find the best one
for (let i = 0; i < N; i++) {
    // We only care about unoccupied urinals ('U')
    if (B[i] === 'U') {
        // Initialize distances to N, which acts as an "infinity" value.
        // Any real distance will be less than N (max distance is N-1).
        let leftDistance = N;
        let rightDistance = N;

        // Find the nearest occupied urinal to the left
        // Iterate backwards from the current urinal's left neighbor
        for (let j = i - 1; j >= 0; j--) {
            if (B[j] === '!') { // If an occupied urinal is found
                leftDistance = i - j; // Calculate the distance
                break; // Stop searching, as we found the nearest one
            }
        }

        // Find the nearest occupied urinal to the right
        // Iterate forwards from the current urinal's right neighbor
        for (let j = i + 1; j < N; j++) {
            if (B[j] === '!') { // If an occupied urinal is found
                rightDistance = j - i; // Calculate the distance
                break; // Stop searching, as we found the nearest one
            }
        }

        // The isolation score for the current urinal is the minimum of the two distances
        const currentIsolationScore = Math.min(leftDistance, rightDistance);

        // Check if this urinal is better than the current best one found so far.
        // The condition `currentIsolationScore > maxIsolationScore` ensures that
        // if two urinals have the same maximum isolation score, the one
        // encountered first (which will be the leftmost due to `i`'s iteration order)
        // will be retained as `bestUrinalIndex`.
        if (currentIsolationScore > maxIsolationScore) {
            maxIsolationScore = currentIsolationScore;
            bestUrinalIndex = i;
        }
    }
}

// Output the index of the chosen urinal
console.log(bestUrinalIndex);