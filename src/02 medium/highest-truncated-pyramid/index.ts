/**
 * Reads an integer N from standard input and prints the highest truncated pyramid.
 * In the CodinGame environment, `readline()` is a global function.
 */
function solvePyramid(): void {
    // Read N from input. In CodinGame, readline() reads a line from stdin.
    const N: number = parseInt(readline());

    let optimalK: number = 0; // Represents the number of floors (height of the pyramid)

    // Step 1: Find the maximum possible height (optimalK)
    // We iterate k upwards, calculating the minimum bricks needed for k floors (assuming f1=1).
    // The first k for which min_bricks_for_k > N means the previous k was the optimal height.
    for (let k = 1; ; k++) {
        // Calculate the minimum bricks required for 'k' floors if the first floor has 1 brick.
        // This is the sum of an arithmetic series: 1 + 2 + ... + k = k * (k + 1) / 2
        const minBricksForK = k * (k + 1) / 2;

        if (minBricksForK <= N) {
            // 'k' floors are possible, so this is a candidate for optimalK.
            optimalK = k;
        } else {
            // 'k' floors are not possible even with f1=1, so we've found the highest 'optimalK'
            // which was the value from the previous iteration.
            break;
        }
    }

    // Step 2: Calculate the starting number of bricks for the first floor (f1)
    // The total number of bricks S_k = k * f1 + k * (k - 1) / 2
    // The term k * (k - 1) / 2 represents the sum of increments (0, 1, ..., k-1) added to each floor.
    const bricksForIncrements = optimalK * (optimalK - 1) / 2;

    // The remaining bricks from N (after accounting for the increments) must be distributed
    // equally among all 'optimalK' floors to determine the base 'f1'.
    const nRemainingForBase = N - bricksForIncrements;

    // f1 must be an integer. Since we want to use as many bricks as possible for 'f1'
    // without exceeding N, we take the floor of the division.
    const f1 = Math.floor(nRemainingForBase / optimalK);

    // Step 3: Draw the pyramid
    // Iterate from 0 to optimalK - 1 to represent each floor.
    for (let i = 0; i < optimalK; i++) {
        // The number of bricks on the current floor is f1 plus its increment 'i'.
        const bricksOnCurrentFloor = f1 + i;
        // Use String.prototype.repeat() to print the asterisks efficiently.
        // console.log() automatically adds a newline.
        console.log("*".repeat(bricksOnCurrentFloor));
    }
}

// Call the main function to solve the puzzle.
// In the CodinGame environment, this function call would be at the top level.
solvePyramid();