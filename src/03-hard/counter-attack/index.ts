// Read N (number of days)
const N: number = parseInt(readline());

// Read a (elements of the counter)
const a: number[] = readline().split(' ').map(Number);

// dp[i][k]: minimum modifications for the prefix a[0...i],
// where day i is a breakage day, and there have been exactly k breakages up to day i.
// i: 0 to N-1 (day index)
// k: 1 to N (number of breakages)
const dp: number[][] = Array(N).fill(0).map(() => Array(N + 1).fill(Number.MAX_SAFE_INTEGER));

// segment_mod_cost[prev_idx][curr_idx]:
// modifications needed for segment a[prev_idx+1 ... curr_idx-1]
// assuming prev_idx was the previous breakage and curr_idx is the next potential breakage.
// prev_idx: 0 to N-1
// curr_idx: prev_idx + 1 to N (N means up to N-1, exclusive of N)
const segment_mod_cost: number[][] = Array(N).fill(0).map(() => Array(N + 1).fill(0));

// --- Precompute segment_mod_cost ---
// segment_mod_cost[prev_idx][curr_idx] stores the cost for the interval
// (prev_idx, curr_idx), i.e., indices prev_idx + 1 up to curr_idx - 1.
for (let prev_idx = 0; prev_idx < N; prev_idx++) {
    let current_cost_for_segment = 0;
    // Iterate curr_idx from prev_idx + 1 up to N (inclusive).
    // curr_idx serves as the exclusive upper bound for the current segment.
    // E.g., for prev_idx=0:
    // curr_idx=1 -> segment (0,1) is empty (a[1...0]), cost=0
    // curr_idx=2 -> segment (0,2) is a[1] (a[prev_idx+1]), cost (a[1] vs 1-0)
    // curr_idx=N -> segment (0,N) is a[1...N-1], cost (a[1] vs 1-0) + ... + (a[N-1] vs N-1-0)
    for (let curr_idx = prev_idx + 1; curr_idx <= N; curr_idx++) {
        // Only consider adding cost if the segment is not empty (i.e., curr_idx-1 >= prev_idx+1)
        // This corresponds to curr_idx > prev_idx + 1
        if (curr_idx > prev_idx + 1) {
            const day_to_check = curr_idx - 1; // The latest day added to the segment
            const actual_val = a[day_to_check];
            const expected_val = day_to_check - prev_idx;

            if (actual_val !== expected_val) {
                current_cost_for_segment += 1;
            }
        }
        segment_mod_cost[prev_idx][curr_idx] = current_cost_for_segment;
    }
}

// --- Fill DP table ---
// Base case: The first breakage must be at day 0 (index 0).
// The cost for 1 breakage ending on day 0 is 0 if a[0] is 0, else 1.
dp[0][1] = (a[0] === 0 ? 0 : 1);

// Iterate through each day 'i' from 1 to N-1 (0-indexed)
for (let i = 1; i < N; i++) {
    // Cost if day 'i' itself is a breakage day (i.e., a[i] should be 0)
    const cost_at_i_is_break = (a[i] === 0 ? 0 : 1);

    // Iterate through 'k' (number of breakages) from 1 up to 'i + 1'
    for (let k = 1; k <= i + 1; k++) {
        // For k = 1 and i > 0, dp[i][1] must remain Infinity,
        // because the first breakage is required to be at day 0.
        // So, if k=1, only dp[0][1] can be non-Infinity.

        // If k > 1, then day 'i' is the k-th breakage.
        // We look for a previous breakage day 'prev_break_day' (k-1)-th breakage.
        if (k > 1) {
            for (let prev_break_day = 0; prev_break_day < i; prev_break_day++) {
                // If dp[prev_break_day][k-1] is not Infinity, it's a valid path.
                if (dp[prev_break_day][k - 1] !== Number.MAX_SAFE_INTEGER) {
                    // Get the precomputed cost for the segment between prev_break_day and i.
                    // This segment is a[prev_break_day+1 ... i-1].
                    const cost_between_breaks = segment_mod_cost[prev_break_day][i];
                    
                    // Update dp[i][k] with the minimum cost
                    dp[i][k] = Math.min(dp[i][k], 
                                        dp[prev_break_day][k - 1] + cost_between_breaks + cost_at_i_is_break);
                }
            }
        }
    }
}

// --- Calculate and print results for each number of breakages ---
// For each possible total number of breakages, from 1 to N
for (let num_breaks = 1; num_breaks <= N; num_breaks++) {
    let min_total_modifications = Number.MAX_SAFE_INTEGER;

    // The last breakage (k-th breakage) could have occurred on any day from num_breaks - 1
    // (minimum index for k breakages, e.g., 1 break must be at index 0) up to N-1.
    for (let last_break_day = num_breaks - 1; last_break_day < N; last_break_day++) {
        // If this DP state is reachable (not Infinity)
        if (dp[last_break_day][num_breaks] !== Number.MAX_SAFE_INTEGER) {
            let current_total_mod = dp[last_break_day][num_breaks];

            // Add the cost for the days after the last breakage until the end of the array (N-1).
            // This segment is a[last_break_day+1 ... N-1].
            // This corresponds to segment_mod_cost[last_break_day][N].
            current_total_mod += segment_mod_cost[last_break_day][N];

            min_total_modifications = Math.min(min_total_modifications, current_total_mod);
        }
    }
    console.log(min_total_modifications);
}