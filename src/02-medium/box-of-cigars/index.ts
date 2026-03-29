/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const N: number = parseInt(readline());
const cigars: number[] = [];
for (let i = 0; i < N; i++) {
    const LNT: number = parseInt(readline());
    cigars.push(LNT);
}

// According to constraints: 2 <= N <= 1000.
// This means there are always at least two cigars.
// Any two cigars can form an arithmetic progression of length 2.
// So, the minimum possible answer is 2.
let maxLen: number = 2;

// dp[i][diff] stores the length of the longest arithmetic progression
// ending at cigars[i] with a common difference of `diff`.
// The maximum possible difference between two cigar lengths is 1000 (max LNT) - 1 (min LNT) = 999.
// So, the `diff` can range from 0 (for identical cigars) to 999.
// We need an array size of 1000 for the difference dimension to cover indices 0 to 999.
const MAX_POSSIBLE_DIFF = 1000; 

// Initialize dp table. Each cigar itself forms an AP of length 1.
// When calculating dp[i][diff], if cigars[j] is the previous element
// that forms an AP with cigars[i] and difference `diff`,
// the new length is 1 (for cigars[i]) + dp[j][diff].
// If dp[j][diff] was 1, it means cigars[j] was only part of an AP of length 1 (itself).
// Then, cigars[j] and cigars[i] form an AP of length 2.
// This makes the initialization of dp[i][diff] to 1 a good base.
const dp: number[][] = Array(N).fill(0).map(() => Array(MAX_POSSIBLE_DIFF).fill(1));

// Iterate through each cigar to consider it as the potential last element of an AP.
for (let i = 0; i < N; i++) {
    // Iterate through all previous cigars to find potential preceding elements in an AP.
    for (let j = 0; j < i; j++) {
        // Calculate the difference between the current cigar and the previous one.
        const diff = cigars[i] - cigars[j];

        // Since the input cigars are sorted in ascending order, `diff` will always be >= 0.
        // The problem states cigar lengths "may not be unique", implying that
        // an arithmetic progression can have a common difference of 0 (e.g., 5, 5, 5).

        // Update dp[i][diff]: The length of the AP ending at cigars[i] with this `diff`
        // is 1 (for cigars[i] itself) plus the length of the AP ending at cigars[j]
        // with the same `diff`. We take Math.max to ensure we store the longest AP
        // if multiple paths lead to the same (i, diff) state.
        dp[i][diff] = Math.max(dp[i][diff], 1 + dp[j][diff]);

        // Update the overall maximum length found so far.
        maxLen = Math.max(maxLen, dp[i][diff]);
    }
}

// Output the maximum length of an arithmetic progression found.
console.log(maxLen);