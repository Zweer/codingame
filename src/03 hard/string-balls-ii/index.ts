/**
 * Reads a line from standard input.
 * In a CodinGame puzzle, this function is usually provided by the environment.
 * For local testing, you might need to mock it.
 */
declare function readline(): string;

/**
 * Helper function to calculate (base^exp) % MOD using modular exponentiation (binary exponentiation).
 * @param base The base number.
 * @param exp The exponent.
 * @returns The result of (base^exp) % MOD.
 */
function power(base: number, exp: number): number {
    const MOD = 1000000007; // Modulo constant
    let res = 1;
    base %= MOD; // Ensure base is within the modulo range from the start

    while (exp > 0) {
        // If exp is odd, multiply result by base
        if (exp % 2 === 1) {
            res = (res * base) % MOD;
        }
        // Square the base for the next iteration
        base = (base * base) % MOD;
        // Halve the exponent
        exp = Math.floor(exp / 2);
    }
    return res;
}

/**
 * Main function to solve the String Balls II puzzle.
 */
function solve() {
    const radius: number = parseInt(readline());
    const center: string = readline();

    const MOD = 1000000007;

    const L = center.length; // Length of the center string
    const maxPossibleSum = L * 25; // Maximum possible sum of distances for a string of length L (e.g., d('a','z') = 25 for each character)

    // Special case: If the radius is greater than or equal to the maximum possible sum of distances,
    // then any string composed of lowercase English letters of length L will satisfy the condition.
    // In this case, each of the L positions can be any of the 26 letters, so the total is 26^L.
    if (radius >= maxPossibleSum) {
        console.log(power(26, L));
        return; // Exit the function as the answer is found
    }

    // Precompute `char_options[pos][diff_val]`:
    // This 2D array stores, for each character position `pos` (0-25 for 'a'-'z'),
    // how many other characters result in a specific `diff_val` (0-25) when their distances are calculated.
    // e.g., char_options[0][1] would be the count of characters 'x' such that d('a', 'x') = 1.
    const char_options: number[][] = new Array(26);
    for (let pos = 0; pos <= 25; pos++) { // Iterate for each character 'a' through 'z' (by their 0-indexed positions)
        char_options[pos] = new Array(26).fill(0); // Initialize counts for distances 0-25 for the current 'pos'
        for (let p_char_idx = 0; p_char_idx <= 25; p_char_idx++) { // Iterate for each possible `other_char` (by its 0-indexed position)
            const diff = Math.abs(pos - p_char_idx); // Calculate the distance between `char_at_pos` and `other_char`
            char_options[pos][diff]++; // Increment the count for this specific distance `diff`
        }
    }

    // Dynamic Programming approach:
    // `dp[r]` will store the number of ways to achieve a total distance of `r`
    // using the characters processed from the `center` string so far.
    // The maximum `r` we need to track is `radius`.
    let dp: number[] = new Array(radius + 1).fill(0);
    dp[0] = 1; // Base case: There is 1 way to achieve a sum of 0 (e.g., by having processed 0 characters, or by choosing characters that sum to 0 distance)

    // Iterate through each character in the `center` string
    for (let i = 0; i < L; i++) {
        const char_code_pos = center.charCodeAt(i) - 'a'.charCodeAt(0); // Get the 0-indexed position of the current character from `center`
        const current_char_opts = char_options[char_code_pos]; // Get the precomputed distance options for this specific character
        
        // Create a new DP array for the current iteration.
        // This is essential for correct DP calculation, ensuring that `next_dp` values
        // are computed using `dp` values from the *previous* character's processing stage,
        // preventing "self-contamination" within the same iteration.
        const next_dp: number[] = new Array(radius + 1).fill(0);

        // Iterate through all possible `current_sum` values (total distances accumulated from previous characters)
        for (let current_sum = 0; current_sum <= radius; current_sum++) {
            if (dp[current_sum] === 0) continue; // Optimization: If there are no ways to achieve `current_sum`, skip this path.

            // Iterate through all possible distance `diff_val` that the current character can contribute
            for (let diff_val = 0; diff_val <= 25; diff_val++) { // Distance can range from 0 to 25
                const count_for_diff = current_char_opts[diff_val];
                if (count_for_diff === 0) continue; // Optimization: If this `diff_val` is not possible for the current character, skip.

                const new_sum = current_sum + diff_val; // Calculate the new total distance after adding `diff_val`

                // Only update `next_dp` if the `new_sum` does not exceed the given `radius`
                if (new_sum <= radius) {
                    // Add the number of ways to reach `current_sum` multiplied by the number of ways
                    // to achieve `diff_val` for the current character.
                    next_dp[new_sum] = (next_dp[new_sum] + (dp[current_sum] * count_for_diff) % MOD) % MOD;
                }
            }
        }
        dp = next_dp; // Update the `dp` array for the next iteration (next character in `center`)
    }

    // Sum up all ways to achieve a total distance `r` where `r` is less than or equal to `radius`.
    let total_points = 0;
    for (let r = 0; r <= radius; r++) {
        total_points = (total_points + dp[r]) % MOD;
    }

    console.log(total_points);
}

// Call the main solve function to execute the puzzle logic
solve();