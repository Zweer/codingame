// Required for readline input
import * as readline from 'readline';

// Class to represent an apple with its properties
class Apple {
    x: number;
    y: number;
    z: number;
    r: number;

    constructor(x: number, y: number, z: number, r: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
    }
}

/**
 * Calculates the squared Euclidean distance between the XY projections of two apples' centers.
 * Using squared distance avoids `Math.sqrt()` and potential floating-point precision issues
 * while comparing distances, and is computationally faster.
 * @param apple1 The first apple.
 * @param apple2 The second apple.
 * @returns The squared distance in the XY plane.
 */
function distSqXY(apple1: Apple, apple2: Apple): number {
    const dx = apple1.x - apple2.x;
    const dy = apple1.y - apple2.y;
    return dx * dx + dy * dy;
}

/**
 * Main function to solve the Apple Tree puzzle.
 * Reads input, simulates the apple falling process, and prints the result.
 */
async function solve() {
    // Setup readline interface for input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let inputLines: string[] = [];
    // Read all input lines asynchronously
    for await (const line of rl) {
        inputLines.push(line);
    }
    rl.close(); // Close the readline interface after all input is read

    let lineIndex = 0;

    // Parse the first line: N (number of apples) and initialFallingAppleIndex
    const [N_str, initialFallingAppleIndex_str] = inputLines[lineIndex++].split(' ');
    const N = parseInt(N_str, 10);
    const initialFallingAppleIndex = parseInt(initialFallingAppleIndex_str, 10);

    // Read details for each apple
    const apples: Apple[] = [];
    for (let i = 0; i < N; i++) {
        const [x_str, y_str, z_str, r_str] = inputLines[lineIndex++].split(' ');
        apples.push(new Apple(
            parseInt(x_str, 10),
            parseInt(y_str, 10),
            parseInt(z_str, 10),
            parseInt(r_str, 10)
        ));
    }

    // `isFalling` array tracks which apples have started falling.
    // Initialized to false for all apples.
    const isFalling: boolean[] = new Array(N).fill(false);

    // A queue for BFS (Breadth-First Search) to process falling apples
    // and propagate the "falling" state.
    const queue: number[] = [];

    // The initial apple specified by `initialFallingAppleIndex` starts falling.
    queue.push(initialFallingAppleIndex);
    isFalling[initialFallingAppleIndex] = true;

    // Use a `head` pointer for the queue to simulate `shift()` efficiently,
    // avoiding array re-indexing which can be slow for large queues.
    let head = 0;
    while (head < queue.length) {
        const currentFallingIndex = queue[head++];
        const currentFallingApple = apples[currentFallingIndex];

        // Iterate through all other apples to check for potential collisions.
        for (let staticAppleIndex = 0; staticAppleIndex < N; staticAppleIndex++) {
            // Skip if it's the same apple or if the apple is already marked as falling.
            if (staticAppleIndex === currentFallingIndex || isFalling[staticAppleIndex]) {
                continue;
            }

            const staticApple = apples[staticAppleIndex];

            // Collision Condition 1: Horizontal Overlap
            // Calculate the squared sum of radii. If the horizontal distance between centers
            // is greater than this, their XY projections do not overlap enough to touch.
            const rSum = currentFallingApple.r + staticApple.r;
            const rSumSq = rSum * rSum;
            const horizontalDistSq = distSqXY(currentFallingApple, staticApple);

            if (horizontalDistSq > rSumSq) {
                continue; // No horizontal overlap, they cannot collide.
            }

            // Collision Condition 2: Vertical Reachability
            // The falling apple (currentFallingApple) moves straight down.
            // It can hit staticApple if its highest point (currentFallingApple.z + currentFallingApple.r)
            // is at or above the lowest point of the staticApple (staticApple.z - staticApple.r).
            // This ensures that the falling apple's path intersects the static apple's vertical range.
            if (currentFallingApple.z + currentFallingApple.r >= staticApple.z - staticApple.r) {
                // Collision detected! The static apple is hit and starts falling.
                isFalling[staticAppleIndex] = true;
                queue.push(staticAppleIndex); // Add it to the queue to process its chain reaction.
            }
        }
    }

    // After the BFS loop completes, count how many apples are still on the tree (i.e., not falling).
    let remainingApplesCount = 0;
    for (let i = 0; i < N; i++) {
        if (!isFalling[i]) {
            remainingApplesCount++;
        }
    }

    // Print the final result
    console.log(remainingApplesCount);
}

// Execute the solve function
solve();