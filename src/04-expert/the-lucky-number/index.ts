// The 'readline' function is typically provided by the CodinGame environment for reading input.
// If running locally without a CodinGame runner, you might need to mock it or use Node.js 'readline' module.
declare function readline(): string;

// Memoization table to store results of DFS states.
// It's declared globally (or within the scope of countLuckyNumbersUpToN) and reset for each new calculation.
let memo: Map<string, number>;

// Global variables to hold the string representation of the number and its length for DFS.
// These are set once per call to countLuckyNumbersUpToN to avoid passing them as arguments.
let S_global: string;
let len_global: number;

/**
 * Counts the number of lucky numbers from 1 up to a given number N (inclusive).
 * A lucky number contains a '6' OR an '8', but NOT both.
 * @param num The upper bound (BigInt) for counting lucky numbers.
 * @returns The total count of lucky numbers.
 */
function countLuckyNumbersUpToN(num: BigInt): number {
    S_global = num.toString(); // Convert BigInt to string for digit processing
    len_global = S_global.length; // Get the number of digits
    memo = new Map<string, number>(); // Reset memoization table for each new 'num'

    /**
     * Recursive function for digit DP.
     * @param index Current digit position being processed (0-indexed from left).
     * @param tight A boolean. True if we are restricted by the digits of `S_global` at this position.
     * @param has6 A boolean. True if a '6' has been encountered in the current number's prefix.
     * @param has8 A boolean. True if an '8' has been encountered in the current number's prefix.
     * @param isStarted A boolean. True if a non-zero digit has been placed, indicating the number has started.
     * @returns The count of valid number suffixes that can be formed from `index` onwards.
     */
    function dfs(index: number, tight: boolean, has6: boolean, has8: boolean, isStarted: boolean): number {
        // Create a unique key for memoization from the current state.
        // Booleans are converted to 0/1 for a more compact key.
        const key = `${index}-${tight ? 1 : 0}-${has6 ? 1 : 0}-${has8 ? 1 : 0}-${isStarted ? 1 : 0}`;
        if (memo.has(key)) {
            return memo.get(key)!; // Return memoized result if available
        }

        // Base case: All digits have been placed.
        if (index === len_global) {
            // If `isStarted` is false, it means the number formed was effectively 0 (e.g., "0", "00").
            // Since the problem range starts from 1, these numbers are not counted.
            if (!isStarted) {
                return 0;
            }
            // Check if the number is lucky: has '6' XOR has '8'.
            // (has6 && !has8) means it has '6' but no '8'.
            // (!has6 && has8) means it has '8' but no '6'.
            return (has6 && !has8) || (!has6 && has8) ? 1 : 0;
        }

        let ans = 0;
        // Determine the upper limit for the current digit.
        // If `tight` is true, the digit cannot exceed the corresponding digit in `S_global`.
        // Otherwise, any digit from 0 to 9 is allowed.
        const upperBound = tight ? parseInt(S_global[index]) : 9;

        for (let digit = 0; digit <= upperBound; digit++) {
            // `newTight` remains true only if `tight` was true AND the chosen `digit` is the `upperBound`.
            const newTight = tight && (digit === upperBound);

            if (!isStarted && digit === 0) {
                // If we are currently placing leading zeros (e.g., forming "0", "00", "007"):
                // `has6` and `has8` flags should not be updated by these zeros.
                // `isStarted` remains false as a non-zero digit hasn't been placed yet.
                ans += dfs(index + 1, newTight, false, false, false);
            } else {
                // We are either placing the first non-zero digit OR we are past leading zeros.
                // Update `has6` and `has8` based on the current `digit`.
                const newHas6 = has6 || (digit === 6);
                const newHas8 = has8 || (digit === 8);
                // `isStarted` becomes true because a non-zero digit has now been placed (or was already).
                ans += dfs(index + 1, newTight, newHas6, newHas8, true);
            }
        }

        memo.set(key, ans); // Memoize the result before returning
        return ans;
    }

    // Initiate the DFS process from the first digit (index 0).
    // Initially, `tight` is true (constrained by `num`), no '6' or '8' seen yet, and number hasn't started.
    return dfs(0, true, false, false, false);
}

// --- Main execution logic for CodinGame environment ---
// Read the single line of input containing L and R, separated by a space.
const inputs = readline().split(' ');

// Parse L and R as BigInts as they can exceed standard number precision.
const L_bigint = BigInt(inputs[0]);
const R_bigint = BigInt(inputs[1]);

// The count of lucky numbers in range [L, R] is count(R) - count(L-1).
// `L - 1n` correctly handles the lower bound, even if L is 1 (1 - 1n = 0n).
const result = countLuckyNumbersUpToN(R_bigint) - countLuckyNumbersUpToN(L_bigint - 1n);

// Output the final result.
console.log(result);