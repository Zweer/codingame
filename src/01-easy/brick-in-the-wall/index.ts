/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

/**
 * Solves the "Brick in the Wall" puzzle.
 */
function solve() {
    // Read input values
    const X: number = parseInt(readline()); // Max bricks per row
    const N: number = parseInt(readline()); // Total number of bricks
    const M: number[] = readline().split(' ').map(Number); // Weights of bricks

    // Step 1: Sort brick weights in ascending order.
    // This allows us to easily pick the heaviest (last element) and lightest (first element).
    M.sort((a, b) => a - b);

    // Step 2: Generate the (L-1) height factors for each brick position.
    // We want to create a wall structure that minimizes height for all bricks.
    // This involves filling rows as wide as possible (up to X) and then reducing width
    // only if the total number of bricks dictates it or the previous row's count requires it.
    const heightFactors: number[] = [];
    let bricksPlaced = 0;
    let currentLevel = 0; // Represents (L-1), where L is the 1-indexed row number
    let bricksInPrevRow = X; // Represents the maximum number of bricks that can be placed in the current row (based on the conceptual row below it, or X for the very first row)

    while (bricksPlaced < N) {
        // Determine how many bricks can be placed at the current level.
        // It's the minimum of:
        // 1. The remaining number of bricks needed (`N - bricksPlaced`).
        // 2. The maximum capacity of a row (`X`), but also constrained by the number of bricks in the row below it (`bricksInPrevRow`).
        //    Since `bricksInPrevRow` is already updated to `min(X, actual_bricks_in_prev_row)`,
        //    we just use `bricksInPrevRow` here.
        const numBricksThisLevel = Math.min(N - bricksPlaced, bricksInPrevRow);

        // Add the current level's factor for each brick placed at this level
        for (let i = 0; i < numBricksThisLevel; i++) {
            heightFactors.push(currentLevel);
        }

        // Update counts for the next iteration
        bricksPlaced += numBricksThisLevel;
        // The number of bricks in the current row now dictates the maximum for the next row.
        bricksInPrevRow = numBricksThisLevel;
        currentLevel++; // Move to the next higher level
    }

    // At this point, `heightFactors` contains `N` values, sorted in ascending order.
    // (e.g., [0, 0, 1, 1, 2] for X=2, N=5)

    // Step 3: Calculate the total minimum work.
    // The work formula for one brick is W = (L-1) * 0.65 * m.
    // To minimize the sum of W for all bricks, we must minimize Sum((L-1) * m).
    // This is achieved by pairing the smallest (L-1) factors with the largest masses.
    // `heightFactors` is sorted ascending. `M` is sorted ascending.
    // So, we pair `heightFactors[i]` with `M[N - 1 - i]`.
    const factorConstant = 0.65; // (6.5 / 100) * 10
    let totalWork = 0;

    for (let i = 0; i < N; i++) {
        totalWork += heightFactors[i] * M[N - 1 - i];
    }

    // Apply the constant factor to the sum
    totalWork *= factorConstant;

    // Step 4: Print the result formatted to 3 decimal places.
    console.log(totalWork.toFixed(3));
}

// Call the solve function to execute the puzzle logic
solve();