// The 'readline()' and 'console.log()' functions are provided by the CodinGame platform.

/**
 * Solves the water jug riddle using Breadth-First Search (BFS).
 * Finds the minimum number of moves to measure W liters of water.
 */
function solve(): void {
    // Read input: W (target water amount), N (number of containers), and N capacities
    const W: number = parseInt(readline());
    const N: number = parseInt(readline());
    const capacities: number[] = [];
    for (let i = 0; i < N; i++) {
        capacities.push(parseInt(readline()));
    }

    // Queue for BFS: stores [currentVolumes: number[], moves: number]
    // currentVolumes is an array representing the water level in each jug.
    const queue: [number[], number][] = [];

    // Set to keep track of visited states to avoid cycles and redundant computations.
    // States are converted to a comma-separated string (e.g., [1,2,3] -> "1,2,3")
    const visited: Set<string> = new Set();

    // Initial state: all containers empty, 0 moves.
    const initialState = new Array(N).fill(0);
    queue.push([initialState, 0]);
    visited.add(initialState.join(','));

    // Manual head pointer for the queue for performance.
    // Using a pointer avoids the O(N) cost of Array.prototype.shift().
    let head = 0;

    // BFS loop
    while (head < queue.length) {
        const [currentVolumes, currentMoves] = queue[head++];

        // Check if the goal is reached: if any container holds exactly W liters.
        if (currentVolumes.some(vol => vol === W)) {
            console.log(currentMoves);
            // Since BFS finds the shortest path, we can immediately return.
            return;
        }

        // Generate possible next states from the current state

        // 1. Fill each container
        for (let i = 0; i < N; i++) {
            // Only fill if the container is not already at its full capacity
            if (currentVolumes[i] < capacities[i]) {
                const nextVolumes = [...currentVolumes]; // Create a new array to avoid modifying the current state
                nextVolumes[i] = capacities[i];
                const stateStr = nextVolumes.join(',');

                // If this new state has not been visited, add it to the queue and mark as visited
                if (!visited.has(stateStr)) {
                    visited.add(stateStr);
                    queue.push([nextVolumes, currentMoves + 1]);
                }
            }
        }

        // 2. Empty each container
        for (let i = 0; i < N; i++) {
            // Only empty if the container is not already empty
            if (currentVolumes[i] > 0) {
                const nextVolumes = [...currentVolumes];
                nextVolumes[i] = 0;
                const stateStr = nextVolumes.join(',');

                if (!visited.has(stateStr)) {
                    visited.add(stateStr);
                    queue.push([nextVolumes, currentMoves + 1]);
                }
            }
        }

        // 3. Pour water from one container (source_i) to another (target_j)
        for (let source_i = 0; source_i < N; source_i++) {
            for (let target_j = 0; target_j < N; target_j++) {
                if (source_i === target_j) continue; // Cannot pour into the same container

                // Only pour if the source container has water and the target container is not full
                if (currentVolumes[source_i] > 0 && currentVolumes[target_j] < capacities[target_j]) {
                    const nextVolumes = [...currentVolumes];

                    // Calculate the maximum amount of water that can be poured
                    // It's the minimum of:
                    // a) water available in the source jug
                    // b) space available in the target jug
                    const amountToPour = Math.min(nextVolumes[source_i], capacities[target_j] - nextVolumes[target_j]);

                    nextVolumes[source_i] -= amountToPour;
                    nextVolumes[target_j] += amountToPour;

                    const stateStr = nextVolumes.join(',');

                    // If this new state (after pouring) has not been visited, add it to the queue.
                    // Note: 'amountToPour' will always be > 0 due to the `if` condition,
                    // ensuring `nextVolumes` is truly different from `currentVolumes`.
                    if (!visited.has(stateStr)) {
                        visited.add(stateStr);
                        queue.push([nextVolumes, currentMoves + 1]);
                    }
                }
            }
        }
    }

    // According to the problem constraints ("There is always a solution!"),
    // this part of the code should theoretically not be reached.
}

// Call the solve function to execute the program.
solve();