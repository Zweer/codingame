The problem asks us to find all distinct sequences of positive integers, each not exceeding `K`, that sum up to `N`. This is a classic combinatorial problem that can be efficiently solved using **backtracking** (a form of recursion). The results need to be sorted lexicographically.

## Reasoning

1.  **Understanding the Problem as a Pathfinding:** Imagine we start with 0 candies eaten. At each step, we can eat `x` candies, where `1 <= x <= K`. We continue this process until we have eaten exactly `N` candies. Each sequence of `x` values represents a "path" from 0 to `N`.

2.  **Backtracking Approach:**
    *   We'll define a recursive function, let's call it `findPossibilities(currentSum, currentPath)`.
    *   `currentSum` will track the total number of candies eaten so far in the current sequence.
    *   `currentPath` will be an array storing the sequence of candies eaten in each step (e.g., `[1, 1, 1]` or `[1, 2]`).

3.  **Base Cases for Recursion:**
    *   **Success Condition:** If `currentSum` equals `N`, it means we have found a valid way to eat all `N` candies. We should add a *copy* of `currentPath` to our list of results. It's crucial to add a copy, not a reference, because `currentPath` will continue to be modified as the recursion unwinds.
    *   **Pruning Condition:** If `currentSum` exceeds `N`, it means we've eaten too many candies for this path to be valid. We should stop exploring this path and backtrack.

4.  **Recursive Step:**
    *   For each possible number of candies `nextCandies` that Terry can eat in the current step (from `1` to `K`):
        *   Check if `currentSum + nextCandies` would exceed `N`. If it does, we cannot take this step for this path, so we skip it.
        *   If `currentSum + nextCandies <= N`:
            *   Add `nextCandies` to `currentPath`.
            *   Recursively call `findPossibilities(currentSum + nextCandies, currentPath)`.
            *   **Backtrack:** After the recursive call returns (meaning all possibilities stemming from `nextCandies` have been explored), `remove nextCandies` from `currentPath`. This is vital because we need to clear the way for trying other values for `nextCandies` at the current step.

5.  **Initial Call:** Start the process by calling `findPossibilities(0, [])` (0 candies eaten, empty path).

6.  **Lexicographical Order:** The problem requires the output to be sorted lexicographically. Because our `for` loop iterates `nextCandies` from `1` to `K` (i.e., smaller numbers are tried first), the `possibilities` array will naturally accumulate the results in lexicographical order. Therefore, no explicit sorting step is needed after the recursion finishes.

7.  **Constraints (`N <= 10`, `K <= 10`):** These small constraints ensure that a recursive backtracking solution will be very fast and will not hit stack limits or time limits. The number of possible combinations is relatively small.

## Code Structure



## TypeScript Code

```typescript
// The `readline` and `print` functions are provided by the CodinGame environment.
// For local testing or in environments where they are not globally available,
// you might need to mock them (e.g., in Node.js, `readline` might come from `require('readline')`
// or `process.stdin`, and `print` is typically `console.log`).

function solve() {
    // Read the input line and parse N and K
    const inputLine: string = readline();
    const parts: string[] = inputLine.split(' ');
    const N: number = parseInt(parts[0], 10); // Total number of candies
    const K: number = parseInt(parts[1], 10); // Max candies per mouthful

    // This array will store all valid possibilities found
    const possibilities: number[][] = [];

    /**
     * Recursive backtracking function to find all ways to eat candies.
     * @param currentSum The total number of candies eaten so far in the current path.
     * @param currentPath An array representing the sequence of candies eaten in each step.
     */
    function findPossibilities(currentSum: number, currentPath: number[]): void {
        // Base Case 1: If the current sum exactly equals N, we found a valid way to eat all candies.
        if (currentSum === N) {
            // Add a copy of the currentPath to our results.
            // Using `[...currentPath]` or `currentPath.slice()` creates a new array.
            // This is crucial because `currentPath` will be modified by subsequent pop() calls
            // as the function backtracks to explore other possibilities.
            possibilities.push([...currentPath]);
            return; // Stop exploring this path further, as we've reached the target sum
        }

        // Base Case 2: If the current sum exceeds N, this path is invalid.
        // We've eaten too many candies, so we stop exploring this branch.
        if (currentSum > N) {
            return;
        }

        // Recursive Step: Iterate through all possible numbers of candies Terry can eat next.
        // Terry can eat between 1 and K candies in one go.
        for (let nextCandies = 1; nextCandies <= K; nextCandies++) {
            // Only proceed if adding `nextCandies` to the `currentSum` does not exceed the total `N`.
            if (currentSum + nextCandies <= N) {
                // 1. Choose: Add the current choice (`nextCandies`) to the path
                currentPath.push(nextCandies);

                // 2. Explore: Recursively call the function with the updated sum and path
                findPossibilities(currentSum + nextCandies, currentPath);

                // 3. Unchoose (Backtrack): Remove the last choice from the path.
                // This is essential. After exploring all possibilities stemming from `nextCandies`,
                // we "undo" that choice so that the algorithm can try other options for the current step.
                currentPath.pop();
            }
        }
    }

    // Start the backtracking process.
    // We begin with 0 candies eaten and an empty path.
    findPossibilities(0, []);

    // The problem requires the output to be sorted lexicographically.
    // Our backtracking approach naturally generates possibilities in lexicographical order
    // because we iterate `nextCandies` from 1 to K (smaller numbers first).
    // Therefore, no explicit sorting step is needed here.

    // Print each possibility. Each possibility (an array of numbers) should be
    // converted to a string with numbers separated by spaces, and printed on a new line.
    possibilities.forEach(path => {
        print(path.join(' '));
    });
}

// Call the solve function to execute the puzzle logic
solve();
```