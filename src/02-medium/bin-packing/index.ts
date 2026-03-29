// Helper function to read a line from stdin
declare const readline: () => string;
// Helper function to print to stdout
declare const print: (message: string) => void;

function solve() {
    const n = parseInt(readline()); // Number of test cases

    for (let i = 0; i < n; i++) {
        const line = readline().split(' ').map(Number);
        const b = line[0]; // Number of bins
        const m = line[1]; // Number of items
        const weights = line.slice(2); // Weights of items

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        // Pre-check 1: If total weight is not divisible by the number of bins,
        // even distribution is impossible.
        if (totalWeight % b !== 0) {
            print('no');
            continue;
        }

        const targetWeightPerBin = totalWeight / b;

        // Pre-check 2: If any item is heavier than the target weight per bin,
        // it cannot be placed into any bin without exceeding the target.
        let impossibleDueToLargeItem = false;
        for (const w of weights) {
            if (w > targetWeightPerBin) {
                impossibleDueToLargeItem = true;
                break;
            }
        }
        if (impossibleDueToLargeItem) {
            print('no');
            continue;
        }

        // Sort weights in descending order. This is a common heuristic for
        // partition problems to improve pruning and find solutions faster.
        weights.sort((a, b) => b - a);

        // Memoization map: Stores results for (itemIndex, sorted_bin_weights_string_key)
        // Key: `${itemIndex}-${sortedBinWeights.join(',')}`
        // Value: boolean (true if partition is possible from this state, false otherwise)
        const memo = new Map<string, boolean>();

        /**
         * Recursive function to determine if items can be partitioned evenly.
         * @param itemIndex The index of the current item (from `weights` array) to place.
         * @param currentBinWeights An array representing the current total weight in each of the 'b' bins.
         * @returns True if a valid partition is found from this state, false otherwise.
         */
        function canPartition(itemIndex: number, currentBinWeights: number[]): boolean {
            // Base case: All items have been successfully placed.
            // If we reach this point, it means all items were placed without exceeding
            // any bin's target weight. Since the total weight equals (b * targetWeightPerBin),
            // this implies all bins must have exactly targetWeightPerBin.
            if (itemIndex === m) {
                return true;
            }

            // Canonicalize the current bin weights to create a unique key for memoization.
            // Sorting the bin weights ensures that permutations of bin weights (e.g., [10, 20] vs [20, 10])
            // are treated as the same state, as the bins are identical.
            const sortedBinWeights = [...currentBinWeights].sort((a, b) => a - b);
            const stateKey = `${itemIndex}-${sortedBinWeights.join(',')}`;

            // Check memoization table: if this state has been computed before, return the stored result.
            if (memo.has(stateKey)) {
                return memo.get(stateKey)!;
            }

            const currentItemWeight = weights[itemIndex];

            // Try placing the current item into each bin
            for (let binIdx = 0; binIdx < b; binIdx++) {
                // Check if the item fits in the current bin without exceeding the target weight
                if (currentBinWeights[binIdx] + currentItemWeight <= targetWeightPerBin) {
                    // Create a new array for the next state to avoid modifying the current one directly
                    const nextBinWeights = [...currentBinWeights];
                    nextBinWeights[binIdx] += currentItemWeight;

                    // Recursively try to place the next item
                    if (canPartition(itemIndex + 1, nextBinWeights)) {
                        // If a solution is found down this path, memoize and return true
                        memo.set(stateKey, true);
                        return true;
                    }
                }
            }

            // If no placement led to a solution after trying all bins,
            // memoize and return false for this state.
            memo.set(stateKey, false);
            return false;
        }

        // Start the recursive process from the first item (index 0) and all bins empty (filled with 0s).
        const result = canPartition(0, Array(b).fill(0));
        print(result ? 'yes' : 'no');
    }
}

// Call the solve function to execute the puzzle logic
solve();