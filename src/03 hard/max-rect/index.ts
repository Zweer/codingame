// Required for CodinGame TypeScript environment to recognize readline()
declare function readline(): string;

/**
 * Kadane's algorithm to find the maximum sum subarray in a 1D array.
 * @param arr The 1D array of numbers.
 * @returns The maximum sum of any contiguous subarray.
 */
const kadane = (arr: number[]): number => {
    // Constraints (W >= 1) ensure arr will always have at least one element.
    // Initialize maxSoFar and currentMax with the first element of the array.
    // This handles cases where all numbers are negative correctly.
    let maxSoFar = arr[0];
    let currentMax = arr[0];

    // Iterate from the second element
    for (let i = 1; i < arr.length; i++) {
        // For each element, decide whether to extend the current subarray
        // by adding arr[i] to currentMax, or start a new subarray from arr[i].
        currentMax = Math.max(arr[i], currentMax + arr[i]);
        // Update the overall maximum sum found so far.
        maxSoFar = Math.max(maxSoFar, currentMax);
    }
    return maxSoFar;
};

// The main function to solve the puzzle
function solve(): void {
    // Read the width (W) and height (H) from the first line
    const [W, H] = readline().split(' ').map(Number);

    // Read the grid data into a 2D array
    const grid: number[][] = [];
    for (let i = 0; i < H; i++) {
        grid.push(readline().split(' ').map(Number));
    }

    // Initialize the maximum sum found so far to the smallest possible safe integer.
    // This ensures correct results even if all sub-rectangle sums are negative.
    let maxOverallSum = Number.MIN_SAFE_INTEGER;

    // Iterate over all possible top rows (r1) of the sub-rectangle
    for (let r1 = 0; r1 < H; r1++) {
        // `currentColumnSums` will act as the 1D array for Kadane's algorithm.
        // It stores the sum of elements for each column from row `r1` to `r2`.
        // It's reset to zeros for each new `r1` (new top boundary).
        const currentColumnSums: number[] = new Array(W).fill(0);

        // Iterate over all possible bottom rows (r2) of the sub-rectangle, starting from r1
        for (let r2 = r1; r2 < H; r2++) {
            // For the current sub-rectangle defined by rows `r1` to `r2`,
            // update `currentColumnSums` by adding the elements of row `r2`.
            // This effectively 'compresses' the rows r1...r2 into a single 1D array.
            for (let c = 0; c < W; c++) {
                currentColumnSums[c] += grid[r2][c];
            }

            // At this point, `currentColumnSums` is a 1D array where `currentColumnSums[c]`
            // is the sum of `grid[row][c]` for all `row` from `r1` to `r2`.
            // Apply Kadane's algorithm to this 1D array to find the maximum sum sub-array.
            // This maximum sum corresponds to the maximum sum of a sub-rectangle whose
            // top row is `r1`, bottom row is `r2`, and column span `(c1, c2)` is determined by Kadane's.
            const currentMaxRectSum = kadane(currentColumnSums);

            // Update the overall maximum sum found across all `r1` and `r2` combinations.
            maxOverallSum = Math.max(maxOverallSum, currentMaxRectSum);
        }
    }

    // Output the final maximum sum
    console.log(maxOverallSum);
}

// Call the solve function to execute the program logic
solve();