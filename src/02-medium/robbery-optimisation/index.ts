/**
 * Reads an integer from stdin. Assumes `readline()` is provided by the environment.
 * @returns The parsed integer.
 */
function readInt(): number {
    return parseInt(readline());
}

/**
 * Reads a house value from stdin. Uses `parseInt` which is sufficient for numbers up to 10^13
 * as they fit within JavaScript's safe integer range.
 * Assumes `readline()` is provided by the environment.
 * @returns The parsed house value.
 */
function readHouseValue(): number {
    return parseInt(readline());
}

const N: number = readInt();

const values: number[] = [];
for (let i = 0; i < N; i++) {
    values.push(readHouseValue());
}

// dp[i] will store the maximum money obtained considering houses from index 0 to i.
const dp: number[] = new Array(N);

// Handle small N values as base cases.
if (N === 0) {
    // Constraints specify N >= 1, but this handles the theoretical case.
    console.log(0);
} else if (N === 1) {
    // If only one house, Rob takes it.
    console.log(values[0]);
} else if (N === 2) {
    // If two houses, Rob can only take one due to the "skip 2 houses aside" rule.
    // Taking values[0] forbids values[1] (and values[2] if it existed).
    // Taking values[1] forbids values[0] (and values[2], values[3] if they existed).
    // So, he picks the maximum of the two.
    console.log(Math.max(values[0], values[1]));
} else { // N >= 3, apply dynamic programming
    // Initialize base cases for the DP array:
    // dp[0]: Max money considering only house 0.
    dp[0] = values[0];

    // dp[1]: Max money considering houses 0 and 1.
    // As per rule, if v0 is taken, v1 is forbidden. If v1 is taken, v0 is forbidden.
    // So, it's the maximum of taking v0 alone or v1 alone.
    dp[1] = Math.max(values[0], values[1]);

    // dp[2]: Max money considering houses 0, 1, and 2.
    // Options:
    // 1. Rob house 2 alone: `values[2]` (since `values[0]` and `values[1]` are skipped).
    // 2. Rob house 0 and house 2: `values[0] + values[2]` (valid because `v2` is 3 positions away from `v0`).
    // 3. Don't rob house 2: Maximum from `values[0]` and `values[1]`, which is `dp[1]`.
    // The `Math.max` covers all valid non-mutually exclusive combinations up to index 2.
    dp[2] = Math.max(values[2], values[0] + values[2], dp[1]);

    // Fill the rest of the dp table for i >= 3
    for (let i = 3; i < N; i++) {
        // Option 1: Rob house `i`.
        // If house `i` is robbed, houses `i-1` and `i-2` must be skipped.
        // The maximum money from previous houses comes from the optimal solution up to house `i-3`.
        const robCurrent = values[i] + dp[i-3];

        // Option 2: Do not rob house `i`.
        // The maximum money is whatever was optimal considering houses up to `i-1`.
        const skipCurrent = dp[i-1];
        
        // Take the maximum of the two options
        dp[i] = Math.max(robCurrent, skipCurrent);
    }

    // The result is the maximum money achievable considering all N houses.
    console.log(dp[N-1]);
}