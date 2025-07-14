The problem asks us to determine the turning direction of the last gear in a system, given that the first gear turns clockwise. Gears are placed on a grid and transmit motion only if they are touching.

**Problem Analysis:**

1.  **Gears and Motion Propagation:** Gears are essentially nodes in a graph. An edge exists between two gears if they touch. When two gears touch, they always turn in opposite directions. For example, if gear A turns clockwise (CW), and it touches gear B, then gear B must turn counter-clockwise (CCW).
2.  **Starting Point:** The first gear (index 0) is given to be `CW`. All other gears initially have no determined direction.
3.  **Contradictions/Locked State:** If a gear is forced to move in two conflicting directions by different neighbors (e.g., CW by neighbor X and CCW by neighbor Y, or CW by neighbor X and CW by neighbor Z, where Z is also a neighbor), the system, or at least that part of it, is locked. In such a scenario, the involved gears, and consequently any gears that rely on them for motion, will not move. The problem simplifies this by stating "NOT MOVING if the gear doesn't move at all." This implies if *any* contradiction arises in the connected component that includes the last gear, the last gear will not move.
4.  **Output:** `CW`, `CCW`, or `NOT MOVING`.

**Algorithm:**

This problem can be modeled as a graph traversal problem, specifically using Breadth-First Search (BFS) or Depth-First Search (DFS).

1.  **Data Structure for Gears:** Each gear needs to store its `x`, `y`, `r` coordinates and radius, and its `direction`. We can represent `CW` as `1`, `CCW` as `-1`, and `NOT_MOVING` as `0`.

    typescript
// Standard input reading setup for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Define enums and interfaces for better readability and type safety
enum Direction {
    NOT_MOVING = 0,
    CW = 1,  // Clockwise
    CCW = -1, // Counter-clockwise
}

interface Gear {
    id: number;
    x: number;
    y: number;
    r: number;
    direction: Direction;
}

// Read the total number of gears
const N: number = parseInt(readline());

// Create an array to store gear properties
const gears: Gear[] = [];
for (let i = 0; i < N; i++) {
    const inputs = readline().split(' ').map(Number);
    gears.push({
        id: i,
        x: inputs[0],
        y: inputs[1],
        r: inputs[2],
        direction: Direction.NOT_MOVING, // All gears initially not moving
    });
}

// The first gear is driven in a clockwise direction
gears[0].direction = Direction.CW;

// Build the adjacency list (graph) representing which gears touch
// adj[i] will contain the IDs of gears that touch gear `i`
const adj: number[][] = Array.from({ length: N }, () => []);

for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) { // Only check each pair once (i.e., gear[i] with gear[j] where j > i)
        const g1 = gears[i];
        const g2 = gears[j];

        // Calculate squared distance between centers to avoid Math.sqrt and potential floating point issues
        const dx = g1.x - g2.x;
        const dy = g1.y - g2.y;
        const distSq = dx * dx + dy * dy;

        // Calculate squared sum of radii
        const sumRadii = g1.r + g2.r;
        const sumRadiiSq = sumRadii * sumRadii;

        // If squared distance equals squared sum of radii, they touch and transmit motion
        if (distSq === sumRadiiSq) {
            adj[i].push(j);
            adj[j].push(i); // Add edges in both directions as relationships are bidirectional
        }
    }
}

// Use a Breadth-First Search (BFS) to propagate gear movements through the connected components
const queue: number[] = [0]; // Initialize the queue with the ID of the first gear
const visited: boolean[] = new Array(N).fill(false); // To keep track of gears already processed or enqueued
visited[0] = true; // Mark the starting gear as visited

let isSystemLocked: boolean = false; // Flag to indicate if a contradiction (system locked) is found

while (queue.length > 0) {
    const currentGearId = queue.shift()!; // Dequeue the next gear to process
    const currentGear = gears[currentGearId];

    // Iterate through all neighbors of the current gear
    // If adj[currentGearId] is undefined (no neighbors), the loop simply won't run.
    for (const neighborId of adj[currentGearId] || []) { 
        const neighborGear = gears[neighborId];

        if (neighborGear.direction === Direction.NOT_MOVING) {
            // If the neighbor gear's direction has not yet been determined
            // It must rotate in the opposite direction of the current gear
            neighborGear.direction = -currentGear.direction as Direction; // Flip the direction (1 becomes -1, -1 becomes 1)
            
            // Add the neighbor to the queue for further processing if it hasn't been visited yet
            // This check prevents redundant processing in cycles and ensures each gear is processed once per BFS path.
            if (!visited[neighborId]) {
                queue.push(neighborId);
                visited[neighborId] = true;
            }
        } else {
            // If the neighbor gear is already moving, check for a contradiction
            // A contradiction occurs if two touching gears are forced to move in the same direction
            if (neighborGear.direction === currentGear.direction) {
                isSystemLocked = true; // Set the flag indicating the system is locked
                // If a contradiction is found, the entire system (or at least the chain to the last gear)
                // is considered locked, and the last gear will not move.
                // We can continue the BFS to fully explore the graph, but this flag guarantees the output.
            }
        }
    }
}

// Determine and print the final direction of the last gear (gears[N-1])
if (isSystemLocked) {
    // If any contradiction was found during the movement propagation
    print("NOT MOVING");
} else if (gears[N - 1].direction === Direction.CW) {
    // If the last gear is determined to be moving clockwise
    print("CW");
} else if (gears[N - 1].direction === Direction.CCW) {
    // If the last gear is determined to be moving counter-clockwise
    print("CCW");
} else { // gears[N-1].direction === Direction.NOT_MOVING
    // This case covers scenarios where the last gear was never reached by the movement propagation
    // (i.e., it's in a disconnected component from the first gear)
    print("NOT MOVING");
}
```