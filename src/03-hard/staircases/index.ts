import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let N_bricks: number;

rl.on('line', (line: string) => {
    N_bricks = parseInt(line, 10);
});

rl.on('close', () => {
    // dp[i][j] will store the number of ways to partition 'i' bricks into distinct parts,
    // where the smallest part considered (or used) in the partition is at least 'j'.
    //
    // Dimensions:
    // 'i' (current sum of bricks) ranges from 0 to N_bricks. So, N_bricks + 1 rows.
    // 'j' (minimum allowed step size) ranges from 0 to N_bricks + 1 (because of j+1 in recurrence).
    // So, N_bricks + 2 columns.
    const dp: number[][] = Array(N_bricks + 1).fill(0).map(() => Array(N_bricks + 2).fill(0));

    // Base case: There is one way to form a sum of 0, which is by using no bricks (the empty partition).
    // This is true regardless of the minimum step size constraint 'j'.
    for (let j = 0; j <= N_bricks + 1; j++) {
        dp[0][j] = 1;
    }

    // Fill the DP table using a bottom-up approach.
    // Iterate 'j' (minimum allowed step size) downwards from N_bricks to 1.
    // This order ensures that dp[i][j+1] and dp[i-j][j+1] (which depend on larger 'j' values)
    // are already computed when we calculate dp[i][j].
    for (let j = N_bricks; j >= 1; j--) {
        // Iterate 'i' (current sum of bricks) upwards from 1 to N_bricks.
        for (let i = 1; i <= N_bricks; i++) {
            // Case 1: The current partition of 'i' does NOT use 'j' as its smallest part.
            // In this case, all parts in the partition must be at least 'j + 1'.
            // The number of ways is dp[i][j+1].
            dp[i][j] = dp[i][j + 1];

            // Case 2: The current partition of 'i' DOES use 'j' as its smallest part.
            // If we use 'j' bricks for the first step, the remaining sum is 'i - j'.
            // The next step must be strictly greater than 'j' to maintain the distinct and
            // strictly increasing order. So, the minimum step size for the remaining
            // 'i - j' bricks becomes 'j + 1'.
            // We only consider this if 'i - j' is non-negative.
            if (i - j >= 0) {
                dp[i][j] += dp[i - j][j + 1];
            }
        }
    }

    // The value dp[N_bricks][1] represents the total number of ways to partition N_bricks
    // into distinct positive integer parts (where the smallest part is at least 1).
    //
    // The problem states that a staircase must have a "minimum of 2 steps".
    // The calculated dp[N_bricks][1] includes partitions with only one step (i.e., N_bricks itself).
    // For example, for N=5, dp[5][1] counts partitions {5}, {1,4}, {2,3}.
    // The partition {5} has only 1 step and must be excluded.
    //
    // So, we subtract 1 from dp[N_bricks][1] to exclude this single-step case.
    const numberOfStaircases = dp[N_bricks][1] - 1;

    console.log(numberOfStaircases);
});