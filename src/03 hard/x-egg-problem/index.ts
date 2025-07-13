// Read N (number of floors) from standard input
const N: number = parseInt(readline());
// Read X (number of eggs) from standard input
const X: number = parseInt(readline());

// dp_current_k[e] stores the maximum number of floors that can be tested
// with 'e' eggs using the current number of drops 'k'.
let dp_current_k: number[] = new Array(X + 1).fill(0);

// dp_prev_k[e] stores the maximum number of floors that can be tested
// with 'e' eggs using 'k-1' drops (from the previous iteration).
let dp_prev_k: number[] = new Array(X + 1).fill(0);

let k = 0; // Initialize the number of drops to 0

// The loop continues as long as we cannot cover all N floors with X eggs and 'k' drops.
// dp_current_k[X] represents the total floors covered by X eggs in 'k' drops.
while (dp_current_k[X] < N) {
    k++; // Increment the number of drops for the current iteration

    // Before calculating values for the current 'k', copy the values from 'k-1'
    // (which are currently in dp_current_k) into dp_prev_k.
    for (let e = 0; e <= X; e++) {
        dp_prev_k[e] = dp_current_k[e];
    }

    // Calculate dp_current_k[e] for the new 'k'
    // dp_current_k[0] (meaning 0 eggs) always remains 0 floors covered, so we start 'e' from 1.
    for (let e = 1; e <= X; e++) {
        // The core recurrence relation:
        // dp[e][k] = dp[e][k-1] (if egg doesn't break, continue with 'e' eggs, 'k-1' drops for floors above)
        //          + dp[e-1][k-1] (if egg breaks, use 'e-1' eggs, 'k-1' drops for floors below)
        //          + 1 (accounts for the current floor being tested)
        
        // In terms of our arrays:
        dp_current_k[e] = dp_prev_k[e] + dp_prev_k[e-1] + 1;
    }
}

// Once the loop terminates, dp_current_k[X] is >= N, meaning we have found
// the minimal 'k' required to test all N floors.
console.log(k);