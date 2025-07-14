// Important: In a real CodinGame environment, `readline()` and `print()` are globally available.
// For local testing, you might need to mock them or provide a file reader.
// For the submission, these declarations are standard.
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the "Hit the road" puzzle.
 * This problem involves finding a path in a directed graph with time window constraints at junctions.
 * It's modeled as a Breadth-First Search (BFS) on an expanded state space (junction, arrival_time).
 */
function solveHitTheRoad(): void {
    // --- Constants based on problem constraints ---
    // Max number of junctions N (N <= 10). Junctions are 0 to N-1.
    // The `adjList` and `timeWindows` arrays are pre-allocated for N_MAX for simplicity,
    // though only elements up to N-1 will be used based on input.
    const N_MAX = 10;
    
    // The maximum possible arrival time we might need to consider.
    // The maximum `e` value for a time window is 50.
    // The maximum duration `d` for a single road is 25.
    // A path can have at most N_MAX - 1 roads (e.g., from junction 0 to 9).
    // Maximum possible path duration: (N_MAX - 1) * max_d = 9 * 25 = 225.
    // If the last constrained junction is reached at its max time (50),
    // and then there's one more road (max duration 25) to the destination `t`,
    // the arrival time at `t` could be 50 + 25 = 75.
    // To safely cover all possible relevant arrival times for the `visited` array size:
    // A common safe upper bound for total time in such problems is max_e + (N_MAX - 1) * max_d.
    // 50 + (10 - 1) * 25 = 50 + 9 * 25 = 50 + 225 = 275.
    // Using 300 ensures `MAX_TIME_CONSIDERED + 1` fits all relevant times.
    const MAX_TIME_CONSIDERED = 300; 

    // --- Data structures for the graph and problem state ---

    // Type definition for an edge (road) in the graph.
    type Edge = { to: number; duration: number };
    // Type definition for a time window associated with a junction.
    type TimeWindow = { b: number; e: number };

    // Adjacency list to represent the directed graph.
    // `adjList[u]` contains an array of `{to: v, duration: d}` for roads from junction `u` to `v`.
    const adjList: Edge[][] = Array.from({ length: N_MAX }, () => []);

    // Stores time windows for junctions.
    // `timeWindows[v]` is `{b, e}` if junction `v` has a specific time window, otherwise `null`.
    // Junctions not listed explicitly have implicit time window `[0, MAX_TIME_CONSIDERED]`.
    const timeWindows: (TimeWindow | null)[] = Array(N_MAX).fill(null);

    // Visited states for BFS. `visited[v][t]` is `true` if junction `v` has been reached at time `t`.
    // This prevents redundant computations and infinite loops in cycles.
    const visited: boolean[][] = Array.from({ length: N_MAX }, () =>
        Array(MAX_TIME_CONSIDERED + 1).fill(false) // `+1` because time can be 0 up to MAX_TIME_CONSIDERED
    );

    // --- Input Parsing ---

    // Line 1: N (number of junctions), M (number of roads), NTW (number of time windows)
    const [n, m, ntw] = readline().split(' ').map(Number);

    // Line 2: S (start junction), T (destination junction)
    const [s, t] = readline().split(' ').map(Number);

    // NTW next lines: V (junction), B (begin time), E (end time) for time windows
    for (let i = 0; i < ntw; i++) {
        const [v, b, e] = readline().split(' ').map(Number);
        // Store the time window for the given junction V.
        timeWindows[v] = { b, e };
    }

    // M next lines: U (origin), V (destination), D (duration) for roads
    for (let i = 0; i < m; i++) {
        const [u, v, d] = readline().split(' ').map(Number);
        // Add a directed edge from U to V with duration D.
        // Junction indices U and V are guaranteed to be < N (N <= N_MAX), so they are valid indices for adjList.
        adjList[u].push({ to: v, duration: d });
    }

    // --- BFS Algorithm ---

    // Queue for BFS. Each element is a tuple: `[junctionId, arrivalTime]`.
    const queue: [number, number][] = [];

    // Initialize BFS: Start at junction `s` at time `0`.
    queue.push([s, 0]);
    // Mark the initial state as visited.
    visited[s][0] = true;

    let pathFound = false; // Flag to indicate if a valid path to `t` is found.
    let head = 0;           // Manual queue pointer for efficient dequeuing (avoids array.shift() performance overhead).

    // Continue BFS as long as there are states to explore in the queue.
    while (head < queue.length) {
        const [currentJunction, currentArrivalTime] = queue[head++];

        // If the current junction is the destination `t`, we have found a valid path.
        if (currentJunction === t) {
            pathFound = true;
            break; // No need to explore further, we only need to find *any* valid path.
        }

        // Iterate over all outgoing roads (edges) from the `currentJunction`.
        for (const edge of adjList[currentJunction]) {
            const nextJunction = edge.to;
            const travelDuration = edge.duration;

            // Calculate the arrival time at the `nextJunction`.
            // "The driver cannot wait." implies immediate departure.
            const nextArrivalTime = currentArrivalTime + travelDuration;

            // --- Time Window and Bounds Checks ---

            // 1. Check if `nextArrivalTime` exceeds the maximum time we care to track.
            // This also implicitly handles cases where `nextArrivalTime` might exceed valid array bounds for `visited`.
            if (nextArrivalTime > MAX_TIME_CONSIDERED) {
                continue; // This path segment leads to an arrival time too late to be relevant.
            }

            // 2. Determine the time window for the `nextJunction`.
            // If `nextJunction` has a specific time window defined in `timeWindows`, use it.
            // Otherwise, it's a "free" junction, so its window is effectively `[0, MAX_TIME_CONSIDERED]`.
            const window = timeWindows[nextJunction];
            const windowBegin = window ? window.b : 0;
            const windowEnd = window ? window.e : MAX_TIME_CONSIDERED;

            // 3. Check if `nextArrivalTime` falls within the `nextJunction`'s time window.
            // The condition `b <= r <= e` (closed interval) must be satisfied.
            // If `nextArrivalTime` is less than `windowBegin`, the driver would have to wait, which is disallowed.
            // If `nextArrivalTime` is greater than `windowEnd`, the driver arrives too late.
            if (nextArrivalTime >= windowBegin && nextArrivalTime <= windowEnd) {
                // 4. If this particular state (`nextJunction`, `nextArrivalTime`) has not been visited before,
                // add it to the queue for future exploration and mark it as visited.
                if (!visited[nextJunction][nextArrivalTime]) {
                    visited[nextJunction][nextArrivalTime] = true;
                    queue.push([nextJunction, nextArrivalTime]);
                }
            }
        }
    }

    // --- Output Result ---
    // Print "true" if a valid path to `t` was found, "false" otherwise.
    print(pathFound ? "true" : "false");
}

// Execute the solver function.
solveHitTheRoad();