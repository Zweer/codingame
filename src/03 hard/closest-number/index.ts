// Define readline for CodinGame environment. This is typically provided by the platform.
declare function readline(): string;

/**
 * Calculates the absolute value of a BigInt.
 * @param n The BigInt number.
 * @returns The absolute value of `n`.
 */
function absBigInt(n: bigint): bigint {
    return n < 0n ? -n : n;
}

// Global variables to store the target number N,
// the minimum difference found, and the string representation of the closest number.
// These are made global to avoid passing them through every recursive call,
// improving readability and slightly performance for deep recursions.
let N_big: bigint;
let minDiff: bigint;
let closestNumberStr: string;

/**
 * Main function to solve the puzzle.
 * Reads input, generates permutations, and finds the closest number.
 */
function solve(): void {
    // Read the input line and split N and M strings
    const line = readline().split(' ');
    N_big = BigInt(line[0]); // Convert N to a BigInt
    const M_str = line[1];   // Keep M as a string initially

    // Convert M_str into an array of its digits (as numbers).
    // Sorting these digits is crucial for the permutation generation algorithm
    // to correctly handle duplicate digits and avoid generating redundant permutations.
    const initialDigits: number[] = M_str.split('').map(d => parseInt(d)).sort((a, b) => a - b);
    const numDigits = initialDigits.length;

    // Initialize the minimum difference to an infinitely large BigInt.
    // This ensures any calculated difference will be smaller initially.
    minDiff = BigInt(Infinity);
    // Initialize the string representation of the closest number found so far.
    // This will hold the final answer, formatted correctly.
    closestNumberStr = "";

    // `used` array tracks which digits from `initialDigits` have been included in the
    // current permutation being built at any given recursive level.
    const used: boolean[] = new Array(numDigits).fill(false);
    // `currentPermutation` stores the digits of the permutation being constructed.
    // Its size is fixed at `numDigits`.
    const currentPermutation: number[] = new Array(numDigits);

    /**
     * Recursive function to generate all unique permutations of `initialDigits` using backtracking.
     * @param level The current depth of the recursion, representing the index in `currentPermutation` to fill.
     * @param digits The sorted array of all available digits (this is effectively `initialDigits`).
     * @param used A boolean array tracking which digits from `digits` are currently in `currentPermutation`.
     * @param currentPerm The array storing the digits of the permutation being built.
     */
    function generatePermutations(level: number, digits: number[], used: boolean[], currentPerm: number[]): void {
        // Base case: If `level` equals `numDigits`, a complete permutation has been formed.
        if (level === numDigits) {
            // Join the digits of the current permutation to form a string.
            let permStr = currentPerm.join('');

            // Special handling for leading zeros:
            // If the permutation string has more than one digit and starts with '0' (e.g., "012"),
            // remove these leading zeros to get the correct numeric value (e.g., "12").
            // The problem states "If the solution has leading zeros, they must be omitted."
            let trimmedPermStr = permStr;
            if (permStr.length > 1 && permStr[0] === '0') {
                trimmedPermStr = permStr.replace(/^0+/, '');
                // Although M is guaranteed positive and never starts with 0,
                // if `M` contains only zeros (e.g., M="000"), `trimmedPermStr` would become "".
                // This specific edge case handling ensures "0" for such scenarios, though
                // not strictly needed for this problem's constraints (M > 0).
                if (trimmedPermStr === '') {
                    trimmedPermStr = '0';
                }
            }

            // Convert the (potentially trimmed) permutation string to a BigInt.
            const currentBigInt = BigInt(trimmedPermStr);
            // Calculate the absolute difference between the current permutation's value and N.
            const currentDiff = absBigInt(currentBigInt - N_big);

            // Compare the current permutation's difference with the minimum difference found so far.
            if (currentDiff < minDiff) {
                // Found a new best solution with a smaller difference.
                minDiff = currentDiff;
                closestNumberStr = trimmedPermStr;
            } else if (currentDiff === minDiff) {
                // Found a solution with the same minimum difference.
                // Apply the tie-breaking rule: choose the one with the lowest numeric value.
                const closestBigInt = BigInt(closestNumberStr);
                if (currentBigInt < closestBigInt) {
                    closestNumberStr = trimmedPermStr;
                }
            }
            return; // Backtrack after processing the permutation.
        }

        // Recursive step: Iterate through all available digits to place one at the current `level`.
        for (let i = 0; i < numDigits; i++) {
            // 1. Skip this digit if it has already been used in the current permutation branch.
            if (used[i]) {
                continue;
            }

            // 2. Pruning for duplicate digits to avoid generating redundant permutations:
            // This condition is crucial when the input `digits` array contains duplicates.
            // If the current digit `digits[i]` is the same as the previous digit `digits[i-1]`,
            // AND the previous digit `digits[i-1]` was NOT used in the current path
            // (meaning we skipped it to avoid a duplicate permutation that would be formed
            // by using `digits[i-1]` at this position), then selecting `digits[i]` now
            // would lead to a permutation identical to one already or about to be generated.
            // This relies on the `digits` array being sorted.
            if (i > 0 && digits[i] === digits[i-1] && !used[i-1]) {
                continue;
            }

            // Place the current digit into the permutation at the current `level`.
            currentPerm[level] = digits[i];
            used[i] = true; // Mark this digit as used for the current branch.

            // Recursively call to fill the next level of the permutation.
            generatePermutations(level + 1, digits, used, currentPerm);

            // Backtrack: Unmark the digit as used. This allows it to be used in other branches
            // of the permutation tree when the recursion unwinds to previous levels.
            used[i] = false;
        }
    }

    // Start the permutation generation process from the first digit (level 0).
    generatePermutations(0, initialDigits, used, currentPermutation);

    // Print the string representation of the closest number found.
    console.log(closestNumberStr);
}

// Call the solve function to execute the puzzle logic.
solve();