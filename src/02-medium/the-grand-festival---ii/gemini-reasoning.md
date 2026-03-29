The problem asks us to find a sequence of tournaments (weeks) Merry and Pippin should play to maximize their total prize money. The constraint is that they can play at most `R` consecutive tournaments before they *must* rest for a week.

This is a classic dynamic programming problem. We can define the state based on the current week and the number of consecutive tournaments played ending at that week.

**DP State Definition:**
Let `dp[i][j]` be an object storing:
*   `prize`: The maximum prize money obtained by considering tournaments up to week `i+1` (using 0-indexed `prizes` array, so `i` corresponds to `prizes[i]`).
*   `path`: An array of 1-indexed week numbers that lead to this maximum prize.

The index `j` represents the number of consecutive tournaments played ending at week `i+1`.
*   If `j = 0`, it means week `i+1` was a rest week.
*   If `j` is between `1` and `R`, it means week `i+1` was played as part of a `j`-consecutive tournament streak.

**Initialization:**
We initialize all `dp[i][j]` entries with `prize: -Infinity` and an empty path, representing an unreachable state.

For the first week (`i = 0`, corresponding to `prizes[0]`):
*   `dp[0][0] = { prize: 0, path: [] }`: They rest on week 1, getting 0 prize.
*   `dp[0][1] = { prize: prizes[0], path: [1] }`: They play week 1, forming a 1-consecutive streak.

**Transitions:**
For each subsequent week `i` (from `1` to `N-1`):

1.  **Calculate `dp[i][0]` (Week `i+1` is a rest week):**
    If they rest on week `i+1`, they can come from any valid state at week `i` (i.e., `dp[i-1][k_prev]` for `k_prev` from `0` to `R`). We take the maximum prize from all these previous states. The path remains the same as the chosen previous state's path.
    The "must rest" rule implies that if they played `R` consecutive tournaments ending at week `i`, then week `i+1` *must* be a rest. This is naturally handled by taking the maximum, as `dp[i-1][R]` will contribute to the pool of values for `dp[i][0]`.

    typescript
type DPEntry = {
    prize: number;
    path: number[];
};

// Read N and R from input
const N: number = parseInt(readline());
const R: number = parseInt(readline());

// Read prizes for each tournament
const prizes: number[] = [];
for (let i = 0; i < N; i++) {
    prizes.push(parseInt(readline()));
}

// Initialize the DP table
// dp[i][j] will store {prize: max_prize, path: [weeks]}
// i represents the 0-indexed week (so prizes[i]), corresponding to week i+1 in problem statement
// j represents the number of consecutive tournaments played ending at week i+1.
// j = 0 means week i+1 was rested. j = 1 to R means played 1 to R consecutive.
const dp: DPEntry[][] = Array(N)
    .fill(null)
    .map(() =>
        Array(R + 1)
            .fill(null)
            .map(() => ({ prize: -Infinity, path: [] }))
    );

// Base case for the first week (week 1, prizes[0])
if (N > 0) {
    // Option 1: Rest on week 1
    dp[0][0] = { prize: 0, path: [] };

    // Option 2: Play on week 1 (1 consecutive tournament)
    dp[0][1] = { prize: prizes[0], path: [1] };
}

// Fill the DP table for subsequent weeks
for (let i = 1; i < N; i++) {
    // Calculate dp[i][0]: Resting on week i+1
    // They can rest on week i+1 regardless of what happened on week i.
    // So, we take the maximum prize from all possible states at week i (played 0 to R consecutive).
    let maxPrevPrizeForRest = -Infinity;
    let bestPrevPathForRest: number[] = [];

    for (let kPrev = 0; kPrev <= R; kPrev++) {
        if (dp[i - 1][kPrev].prize > maxPrevPrizeForRest) {
            maxPrevPrizeForRest = dp[i - 1][kPrev].prize;
            bestPrevPathForRest = dp[i - 1][kPrev].path;
        }
    }
    dp[i][0] = { prize: maxPrevPrizeForRest, path: [...bestPrevPathForRest] };

    // Calculate dp[i][j] for j=1 to R: Playing on week i+1
    for (let j = 1; j <= R; j++) {
        if (j === 1) {
            // Playing week i+1 as the first in a new streak (1 consecutive).
            // This means week i must have been a rest week (dp[i-1][0]).
            if (dp[i - 1][0].prize !== -Infinity) {
                dp[i][j] = {
                    prize: dp[i - 1][0].prize + prizes[i],
                    path: [...dp[i - 1][0].path, i + 1],
                };
            }
        } else {
            // Playing week i+1 as part of a j-consecutive streak.
            // This means week i must have been played as part of a (j-1)-consecutive streak.
            // Additionally, the streak ending at week i (j-1 consecutive) must not have been R.
            // If j-1 was R, then week i+1 MUST be a rest.
            if (j - 1 < R && dp[i - 1][j - 1].prize !== -Infinity) {
                dp[i][j] = {
                    prize: dp[i - 1][j - 1].prize + prizes[i],
                    path: [...dp[i - 1][j - 1].path, i + 1],
                };
            }
        }
    }
}

// Find the overall maximum prize and its path from the last week's states
let maxOverallPrize = -Infinity;
let finalPath: number[] = [];

if (N === 0) {
    // If N is 0, no tournaments, output empty string.
    console.log("");
} else {
    // The maximum prize can be achieved by ending in any state (rested or played j consecutive).
    for (let j = 0; j <= R; j++) {
        if (dp[N - 1][j].prize > maxOverallPrize) {
            maxOverallPrize = dp[N - 1][j].prize;
            finalPath = dp[N - 1][j].path;
        }
    }
    // Output the path in the required format
    console.log(finalPath.join(">"));
}

```