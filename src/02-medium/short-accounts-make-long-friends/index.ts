// For local TypeScript development, you might need to declare readline.
// In the CodinGame environment, readline() is globally available.
declare const readline: () => string;

/**
 * Solves the "Short accounts make long friends" CodinGame puzzle.
 */
function solve(): void {
    // Read the target Result and the six initial numbers.
    const Result: number = parseInt(readline());
    const initialNumbers: number[] = readline().split(' ').map(Number);

    // Initialize variables to track the best outcome.
    let minOperations: number = Infinity; // Stores the minimum operations if Result is achievable.
    let possible: boolean = false;        // Flag indicating if Result is achievable.
    let minDistance: number = Infinity;   // Stores the minimum absolute difference to Result if impossible.

    // BFS Queue: Stores states as [currentNumbers: number[], operationsCount: number].
    const queue: [number[], number][] = [];

    // Visited Map: Stores canonical string representations of number sets
    // and the minimum operations count to reach that set. This prevents
    // redundant computations and infinite loops.
    const visited = new Map<string, number>();

    /**
     * Generates a canonical string key for a set of numbers by sorting and joining them.
     * This ensures that different permutations of the same numbers map to the same key.
     * @param nums The array of numbers.
     * @returns A sorted string representation of the numbers.
     */
    const getNumbersKey = (nums: number[]): string => {
        return [...nums].sort((a, b) => a - b).join(',');
    };

    // --- Initialization ---
    // Add the initial state to the queue and mark it as visited.
    const initialKey: string = getNumbersKey(initialNumbers);
    queue.push([initialNumbers, 0]);
    visited.set(initialKey, 0);

    // Check if the Result is already present in the initial numbers (0 operations).
    // Also, update the minimum distance found so far.
    for (const num of initialNumbers) {
        const diff = Math.abs(num - Result);
        if (diff < minDistance) {
            minDistance = diff;
        }
        if (num === Result) {
            possible = true;
            minOperations = 0; // 0 operations is the absolute minimum.
            // No need to break; BFS will naturally prioritize 0 operations.
        }
    }

    let head: number = 0; // Pointer for efficient queue de-queuing (avoids Array.shift()).
    while (head < queue.length) {
        const [currentNumbers, currentOps] = queue[head++];

        // --- Pruning Conditions ---
        // 1. If we've already found a solution (possible = true) and the current path
        //    is already longer or equal to the best found solution, prune this branch.
        if (possible && currentOps >= minOperations) {
            continue;
        }
        // 2. The maximum number of operations for 6 numbers is 5 (6 -> 5 -> 4 -> 3 -> 2 -> 1 number).
        //    If we exceed this, prune.
        if (currentOps >= 5) {
            continue;
        }

        // --- Explore Next States ---
        // Iterate over all unique pairs of numbers in the current state.
        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = i + 1; j < currentNumbers.length; j++) {
                const num1 = currentNumbers[i];
                const num2 = currentNumbers[j];

                // Create a new array with num1 and num2 removed.
                const remainingNumbers = currentNumbers.filter((_, idx) => idx !== i && idx !== j);

                // Define all possible arithmetic operations on num1 and num2.
                const operationsToPerform: number[] = [];

                // Addition
                operationsToPerform.push(num1 + num2);
                // Multiplication
                operationsToPerform.push(num1 * num2);

                // Subtraction (only if the result is positive)
                if (num1 > num2) {
                    operationsToPerform.push(num1 - num2);
                }
                if (num2 > num1) {
                    operationsToPerform.push(num2 - num1);
                }

                // Division (only if the result is an integer and the divisor is not zero)
                if (num2 !== 0 && num1 % num2 === 0) {
                    operationsToPerform.push(num1 / num2);
                }
                if (num1 !== 0 && num2 % num1 === 0) {
                    operationsToPerform.push(num2 / num1);
                }

                // Process each potential result from the operations
                for (const resultValue of operationsToPerform) {
                    // Filter out invalid or excessively large intermediate values.
                    // Results must be positive. Numbers greater than 1,000,000 are
                    // unlikely to lead to the target (100-999) efficiently.
                    // This heuristic helps to manage the search space.
                    if (resultValue <= 0 || resultValue > 1000000) {
                        continue;
                    }

                    // Create the new set of numbers for the next state.
                    const nextNumbers: number[] = [...remainingNumbers, resultValue];
                    const nextKey: string = getNumbersKey(nextNumbers);
                    const nextOps: number = currentOps + 1;

                    // Update the overall minimum distance found to the Result.
                    const diff: number = Math.abs(resultValue - Result);
                    if (diff < minDistance) {
                        minDistance = diff;
                    }

                    // If the target Result is found, update 'possible' and 'minOperations'.
                    if (resultValue === Result) {
                        // Update only if this path is shorter than previous solutions.
                        if (!possible || nextOps < minOperations) {
                            possible = true;
                            minOperations = nextOps;
                        }
                    }

                    // If this set of numbers has not been visited before,
                    // or if we found a shorter path to reach this set of numbers,
                    // add it to the queue for further exploration.
                    if (!visited.has(nextKey) || visited.get(nextKey)! > nextOps) {
                        visited.set(nextKey, nextOps);
                        queue.push([nextNumbers, nextOps]);
                    }
                }
            }
        }
    }

    // --- Output Results ---
    if (possible) {
        console.log("POSSIBLE");
        console.log(minOperations);
    } else {
        console.log("IMPOSSIBLE");
        console.log(minDistance);
    }
}