// Define readline for CodinGame environment or mock it for local testing
declare function readline(): string;

function solve(): number {
    const N: number = parseInt(readline());
    const a: number = parseInt(readline());

    // minCounts stores the minimum number of 'a's required to form a given value.
    // Map<value, count_of_a>
    const minCounts = new Map<number, number>();

    // Queue for BFS/Dijkstra: [value, count_of_a]
    // A simple array with a manual head pointer is used for efficiency over `Array.prototype.shift()`.
    const queue: [number, number][] = [];
    let head = 0; // Pointer to the current head of the queue

    // Initialize with 'a' itself: it takes 1 copy of 'a'.
    minCounts.set(a, 1);
    queue.push([a, 1]);

    // Keep track of the best solution found so far.
    // Initialize with Infinity, as we are looking for the minimum.
    let minOverallSolution = Infinity;

    // Define a practical bound for values to store and process.
    // Intermediate values can go above N, especially with multiplication or division.
    // E.g., if N=10000 and a=100, an intermediate (N*a)/a could be (1,000,000)/100.
    // So, a bound of 1,000,000 for absolute values should be sufficient.
    const VALUE_BOUND = 1_000_000;

    // The BFS-like loop continues as long as there are states to explore.
    while (head < queue.length) {
        const [val1, count1] = queue[head++]; // Dequeue the next state

        // Pruning 1: If we've already found a better or equal path to val1, skip this one.
        // This is crucial for Dijkstra's correctness (ensuring we process optimal paths first).
        if (count1 > minCounts.get(val1)!) {
            continue;
        }

        // Pruning 2: If the current path's 'a' count is already worse than or equal to the
        // best solution found so far, or if it exceeds the maximum allowed 'a's (12), stop extending it.
        // If count1 is 12, we can't form new numbers that require more 'a's.
        if (count1 >= minOverallSolution || count1 >= 12) {
            // Note: If val1 === N and count1 === 12, we might have updated minOverallSolution already.
            // If val1 === N and count1 < 12, it will be handled by the goal check.
            if (val1 === N) { // Special case for when N is found exactly at count1 == 12
                 minOverallSolution = Math.min(minOverallSolution, count1);
            }
            continue;
        }

        // --- Core logic: Generate new numbers by combining val1 with other known values (val2) ---
        // Iterate over all entries currently stored in minCounts. This allows combining any two
        // previously found numbers.
        for (const [val2, count2] of minCounts.entries()) {
            const newCount = count1 + count2;

            // Pruning 3: If the combined count exceeds the max allowed (12) or the current best solution, skip.
            if (newCount > 12 || newCount >= minOverallSolution) {
                continue;
            }

            // Define possible arithmetic operations.
            const possibleNewValues: number[] = [];

            // Addition
            possibleNewValues.push(val1 + val2);

            // Subtraction (both orders: val1 - val2 and val2 - val1)
            possibleNewValues.push(val1 - val2);
            possibleNewValues.push(val2 - val1);

            // Multiplication
            possibleNewValues.push(val1 * val2);

            // Division (both orders: val1 / val2 and val2 / val1)
            // Division is valid only if the divisor is non-zero and the result is an integer.
            if (val2 !== 0 && val1 % val2 === 0) {
                possibleNewValues.push(val1 / val2);
            }
            if (val1 !== 0 && val2 % val1 === 0) {
                possibleNewValues.push(val2 / val1);
            }

            // Process each newly generated value
            for (const newVal of possibleNewValues) {
                // Pruning 4: Apply bounds to new values to manage memory and prevent overflow/large state space.
                if (Math.abs(newVal) > VALUE_BOUND) {
                    continue;
                }
                
                // If this `newVal` is not yet discovered OR
                // if we found a new path to `newVal` that uses fewer 'a's (`newCount` is better).
                if (!minCounts.has(newVal) || newCount < minCounts.get(newVal)!) {
                    minCounts.set(newVal, newCount);
                    queue.push([newVal, newCount]); // Enqueue the new state for future exploration
                }
            }
        }
    }

    return minOverallSolution; // The minimum 'a's required to reach N.
}

// In CodinGame environment, `readline()` is provided globally.
// For local testing outside CodinGame, you might need to mock `readline()`.
// Example mock for local testing:
/*
const _inputLines: string[] = [
    "69",
    "3"
    // Add more test cases here for local testing
    // "41", "6", // Ans: 5
    // "888", "8", // Ans: 6
    // "1000", "11", // Ans: 9
    // "666", "7", // Ans: 9
    // "10000", "100", // Ans: 2
    // "1", "1", // Ans: 1
    // "2", "1", // Ans: 2
    // "64", "1", // Ans: 12
];
let _lineIndex = 0;
function readline(): string {
    if (_lineIndex < _inputLines.length) {
        return _inputLines[_lineIndex++];
    }
    throw new Error("No more input lines available.");
}
*/

// Call the solve function and print the result to standard output.
console.log(solve());