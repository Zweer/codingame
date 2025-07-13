// Standard input/output declarations for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the Elevator puzzle using Breadth-First Search (BFS).
 * Finds the minimum number of button presses required to move an elevator
 * from a starting floor `k` to a target floor `m`.
 *
 * @param n Total number of floors in the building (1 to n).
 * @param a Floors moved up by pressing the UP button.
 * @param b Floors moved down by pressing the DOWN button.
 * @param k Starting floor.
 * @param m Target floor.
 */
function solve(): void {
    // Read the single line of input and parse the space-separated integers.
    const inputs = readline().split(' ').map(Number);

    // Destructure the parsed inputs into named variables for clarity.
    const n = inputs[0]; // Total floors in the building (1-indexed)
    const a = inputs[1]; // Floors moved up per UP button press
    const b = inputs[2]; // Floors moved down per DOWN button press
    const k = inputs[3]; // Starting floor
    const m = inputs[4]; // Target floor

    // `visited` array to store the minimum steps taken to reach each floor.
    // Initialized with `Infinity` for all floors, indicating they are unreached.
    // The array is 1-indexed (floor 1 to n), so its size is `n + 1`.
    const visited: number[] = new Array(n + 1).fill(Infinity);

    // The BFS queue. Each element is a tuple `[floor, steps]`.
    // Represents the current floor and the total button presses to reach it.
    const queue: [number, number][] = [];

    // Initialize the BFS: Start at floor `k` with 0 steps.
    queue.push([k, 0]);
    visited[k] = 0; // Mark the starting floor as visited with 0 steps.

    // `head` pointer for efficient queue operations.
    // This avoids the `O(N)` performance of `Array.prototype.shift()` by
    // treating the array as a circular buffer or by simply advancing a pointer.
    let head = 0;

    // Perform BFS as long as there are elements in the queue to process.
    while (head < queue.length) {
        // Dequeue the current state: `currentFloor` and `steps` taken to reach it.
        const [currentFloor, steps] = queue[head++];

        // If the current floor is the target floor `m`, we've found the shortest path.
        // Print the number of steps and exit the function.
        if (currentFloor === m) {
            print(steps);
            return;
        }

        // --- Explore moving UP ---
        const nextFloorUp = currentFloor + a;
        // Check if `nextFloorUp` is within the building bounds (1 to n).
        // And, crucially, check if this path (`steps + 1`) is shorter than any previously found
        // path to `nextFloorUp` (`visited[nextFloorUp]`). This ensures we find the minimum steps.
        if (nextFloorUp <= n && steps + 1 < visited[nextFloorUp]) {
            // Update the minimum steps required to reach `nextFloorUp`.
            visited[nextFloorUp] = steps + 1;
            // Enqueue the new state for further exploration.
            queue.push([nextFloorUp, steps + 1]);
        }

        // --- Explore moving DOWN ---
        const nextFloorDown = currentFloor - b;
        // Check if `nextFloorDown` is within the building bounds (1 to n).
        // And check if this path is shorter than any previously found path to `nextFloorDown`.
        if (nextFloorDown >= 1 && steps + 1 < visited[nextFloorDown]) {
            // Update the minimum steps required to reach `nextFloorDown`.
            visited[nextFloorDown] = steps + 1;
            // Enqueue the new state.
            queue.push([nextFloorDown, steps + 1]);
        }
    }

    // If the loop completes (queue becomes empty) and the target floor `m` was never reached,
    // it means it's impossible to move the elevator to floor `m`.
    print("IMPOSSIBLE");
}

// Call the main solve function to execute the puzzle logic.
solve();