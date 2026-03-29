// Helper function to round a number to 4 decimal places
function roundToFourDecimalPlaces(value: number): number {
    return Math.round(value * 10000) / 10000;
}

// Define the structure for a Mobile
interface Mobile {
    weight: number;
    totalWidth: number;
    leftExtent: number;  // Distance from the mobile's pivot to its leftmost point
    rightExtent: number; // Distance from the mobile's pivot to its rightmost point
}

// Read input
const L: number = parseFloat(readline());
const N: number = parseInt(readline());
const weights: number[] = readline().split(' ').map(Number);

// dp[mask] stores an array of all unique Mobile structures that can be formed
// using the weights represented by the 'mask' (bitmask of used weights).
const dp: Mobile[][] = Array(1 << N).fill(null).map(() => []);

// Epsilon for floating-point comparisons to handle precision issues
// A small value like 1e-9 is generally safe for comparisons where strict inequality
// is intended but floating-point arithmetic introduces tiny errors.
const EPSILON = 1e-9; 

// Base cases: A mobile consisting of a single weight
for (let i = 0; i < N; i++) {
    // A single weight mobile has zero width and zero extent from its attachment point
    dp[1 << i].push({
        weight: weights[i],
        totalWidth: 0,
        leftExtent: 0,
        rightExtent: 0,
    });
}

// Iterate through all possible masks (combinations of weights)
// from the smallest (single weight) up to the mask representing all weights
for (let mask = 1; mask < (1 << N); mask++) {
    // If the mask represents a single weight (power of 2), it's a base case already handled.
    // Continue to the next mask to avoid redundant calculations.
    // Checking if log2(mask) is an integer effectively checks if mask is a power of 2.
    // Math.log2(0) is -Infinity, Math.log2(1) is 0, Math.log2(2) is 1, etc.
    if (Number.isInteger(Math.log2(mask))) {
        continue;
    }

    // Iterate through all possible non-empty proper submasks of the current mask.
    // Each 'submask' represents the set of weights for the left sub-mobile (m_L).
    // The remaining weights (mask ^ submask) will form the right sub-mobile (m_R).
    // The loop `for (let submask = (mask - 1) & mask; submask > 0; submask = (submask - 1) & mask)`
    // iterates efficiently through all proper submasks.
    // For a given 'mask', this loop ensures that for each partition {S_L, S_R},
    // we consider both (S_L, S_R) and (S_R, S_L) as potential configurations, as the left/right assignment
    // of sub-mobiles can lead to different widths/extents.
    for (let submask = (mask - 1) & mask; submask > 0; submask = (submask - 1) & mask) {
        const S_L_mask = submask;
        const S_R_mask = mask ^ submask;

        // Ensure both sub-problems have been computed (i.e., dp arrays are populated)
        // If either submask has no valid mobiles (e.g., if total weight was 0, though not possible here), skip.
        if (dp[S_L_mask].length === 0 || dp[S_R_mask].length === 0) {
            continue;
        }

        // Combine every possible left sub-mobile with every possible right sub-mobile
        for (const m_L of dp[S_L_mask]) {
            for (const m_R of dp[S_R_mask]) {
                const totalWeight = m_L.weight + m_R.weight;

                // This check is a safeguard; with positive weights, totalWeight will always be > 0.
                if (totalWeight === 0) {
                    continue;
                }

                // Calculate pivot distances 'a' and 'b' for a rod of length 1
                // 'a' is the distance from the pivot point to the left attachment point.
                // 'b' is the distance from the pivot point to the right attachment point.
                // Based on lever equilibrium: a * W_L = b * W_R and rod length a + b = 1.
                // Solving these equations gives: a = W_R / (W_L + W_R) and b = W_L / (W_L + W_R).
                const a = m_R.weight / totalWeight; 
                const b = m_L.weight / totalWeight; 

                // Calculate the coordinates of the attachment points relative to the main rod's pivot (which we consider at coordinate 0)
                const leftAttachCoord = -a; // Left sub-mobile hangs at -a
                const rightAttachCoord = b;  // Right sub-mobile hangs at b

                // Calculate the overall leftmost and rightmost coordinates of the combined mobile structure.
                // This accounts for the horizontal span (leftExtent and rightExtent) of the sub-mobiles
                // relative to their own attachment points.
                const minOverallCoord = Math.min(leftAttachCoord - m_L.leftExtent, rightAttachCoord - m_R.leftExtent);
                const maxOverallCoord = Math.max(leftAttachCoord + m_L.rightExtent, rightAttachCoord + m_R.rightExtent);

                // Create the new combined rod mobile with its calculated properties
                const newMobile: Mobile = {
                    weight: totalWeight,
                    totalWidth: maxOverallCoord - minOverallCoord, // Total width is the span from min to max coordinate
                    leftExtent: -minOverallCoord, // The distance from the new mobile's pivot (0) to its own leftmost point
                    rightExtent: maxOverallCoord, // The distance from the new mobile's pivot (0) to its own rightmost point
                };

                // Add the newly created mobile to the dp table for the current mask.
                // For N <= 6, the number of distinct mobile structures is small enough that
                // explicit de-duplication within these loops is not strictly necessary for performance.
                // We'll find the max width among all generated mobiles at the end.
                dp[mask].push(newMobile);
            }
        }
    }
}

// Find the maximum width among all mobiles that use all N weights
// (represented by the mask (1 << N) - 1) and fit within the classroom limit L.
let maxOverallWidth = -1.0; 

// The final set of mobiles using all weights is stored in dp[(1 << N) - 1]
const finalMobiles = dp[(1 << N) - 1];

for (const mobile of finalMobiles) {
    // Check if the mobile's total width is within the classroom limit.
    // The problem states: "Suppose the classroom width is 2 and the width of a mobile design is 2.00001. Although this design width can be rounded to 2.0000, we should still reject this design because it is absolutely longer than the limit."
    // This implies a strict comparison. We use EPSILON to account for potential floating-point inaccuracies
    // that might make a width slightly larger than L (e.g., 1.9999999999999998 becomes 2.0).
    if (mobile.totalWidth <= L + EPSILON) {
        maxOverallWidth = Math.max(maxOverallWidth, mobile.totalWidth);
    }
}

// Output the result
if (maxOverallWidth === -1.0) {
    // If no design fits within the classroom limit, output -1.
    console.log("-1");
} else {
    // Otherwise, round the maximum width to 4 decimal places and format it as a string
    console.log(roundToFourDecimalPlaces(maxOverallWidth).toFixed(4));
}