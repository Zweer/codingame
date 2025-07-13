// Required for CodinGame environment, usually provided implicitly or via global type definitions.
// In a local TS environment, you might need to mock these or handle input/output differently.
declare function readline(): string;
declare function print(message: string): void;

/**
 * A memoization cache to store computed cycle lengths.
 * Using a Map to handle arbitrary positive integer keys, as intermediate numbers
 * in a sequence can exceed the initial A/B bounds (e.g., 3n+1).
 * The base case: the cycle length of 1 is 1.
 */
const cycleLengthCache: Map<number, number> = new Map();
cycleLengthCache.set(1, 1);

/**
 * Calculates the cycle length for a given positive integer `n` based on the
 * Syracuse Conjecture rules. It uses memoization to store and retrieve previously
 * computed cycle lengths, significantly optimizing performance for ranges.
 *
 * @param n The starting positive integer for which to calculate the cycle length.
 * @returns The number of terms in the sequence, including the terminating 1.
 */
function calculateCycleLength(n: number): number {
    // If the cycle length for 'n' is already in the cache, return it directly.
    if (cycleLengthCache.has(n)) {
        return cycleLengthCache.get(n)!;
    }

    let currentN = n;
    let steps = 0;
    // 'path' stores the sequence of numbers encountered on the way to a known cycle length.
    // These numbers will be cached once the total length is determined.
    const path: number[] = [];

    // Simulate the Syracuse sequence until we reach a number whose cycle length is known.
    while (true) {
        // If we hit a number that is already in our cache, we can use its pre-calculated length.
        if (cycleLengthCache.has(currentN)) {
            steps += cycleLengthCache.get(currentN)!;
            break; // Stop calculation, we have the total steps.
        }

        // Add the current number to the path and increment steps.
        path.push(currentN);
        steps++;

        // Apply the Syracuse rules to get the next term.
        if (currentN % 2 === 0) {
            currentN /= 2;
        } else {
            // It's safe to use `number` type for `3 * currentN + 1` as per problem constraints
            // ("You can assume that no operation overflows a 32-bit integer").
            // JavaScript numbers (double-precision floats) can represent integers up to 2^53 - 1 exactly.
            // Max Collatz value for start < 10^5 is well within this limit.
            currentN = 3 * currentN + 1;
        }
    }

    // After determining the total `steps`, cache the cycle lengths for all numbers in the `path`.
    // The cycle length for a number `path[i]` is `total_steps - i`.
    // (Because `path[i]` is `i` steps into the sequence from `n`.)
    for (let i = 0; i < path.length; i++) {
        cycleLengthCache.set(path[i], steps - i);
    }

    return steps;
}

// Read N, the number of ranges to compute.
const N: number = parseInt(readline());

// Process each range [A, B].
for (let i = 0; i < N; i++) {
    // Read the lower (A) and upper (B) bounds for the current range.
    const [A, B] = readline().split(' ').map(Number);

    let maxCycleLength = 0;
    // Initialize startNumForMaxCycle with A. This ensures that if multiple numbers
    // have the same maximum cycle length, the lowest such number (first encountered)
    // will be correctly identified.
    let startNumForMaxCycle = A; 

    // Iterate through all numbers in the range [A, B] (inclusive).
    for (let j = A; j <= B; j++) {
        const currentLength = calculateCycleLength(j);

        // If the current number's cycle length is strictly greater than the maximum found so far,
        // update the maximum length and the corresponding starting number.
        if (currentLength > maxCycleLength) {
            maxCycleLength = currentLength;
            startNumForMaxCycle = j;
        }
        // If currentLength == maxCycleLength, we do not update startNumForMaxCycle
        // because we want the *lowest* integer. Since we iterate from A to B,
        // the first one found with that max length will be the lowest.
    }

    // Print the lowest integer that leads to the longest cycle length and the length itself.
    print(`${startNumForMaxCycle} ${maxCycleLength}`);
}