enum Direction {
        NOT_MOVING = 0,
        CW = 1,
        CCW = -1,
    }

    interface Gear {
        id: number;
        x: number;
        y: number;
        r: number;
        direction: Direction;
    }
    ```

2.  **Initialization:**
    *   Read `N` and parse gear properties into an array of `Gear` objects.
    *   Set the `direction` of the first gear (`gears[0]`) to `Direction.CW`. All other gears start with `Direction.NOT_MOVING`.

3.  **Build Adjacency List (Graph):**
    *   Create an adjacency list `adj: number[][]` where `adj[i]` stores the IDs of gears that touch `gear[i]`.
    *   Iterate through all unique pairs of gears `(g1, g2)`.
    *   **Check for Touching:** Two gears `g1` and `g2` touch if the distance between their centers is exactly equal to the sum of their radii. To avoid floating-point issues with `Math.sqrt`, we compare squared distances:
        `((g1.x - g2.x)^2 + (g1.y - g2.y)^2) === (g1.r + g2.r)^2`.
    *   If they touch, add an edge between them in the adjacency list (e.g., `adj[g1.id].push(g2.id)` and `adj[g2.id].push(g1.id)`).

4.  **BFS Traversal:**
    *   Initialize a queue with the ID of the first gear (0).
    *   Maintain a `visited` array or set to prevent redundant processing and infinite loops in cycles. Mark `gears[0]` as visited.
    *   Introduce a global flag `isSystemLocked = false`. This flag will become `true` if any contradiction is detected.

    ```typescript
    while (queue.length > 0) {
        const currentGearId = queue.shift()!;
        const currentGear = gears[currentGearId];

        for (const neighborId of adj[currentGearId]) {
            const neighborGear = gears[neighborId];

            if (neighborGear.direction === Direction.NOT_MOVING) {
                // Neighbor is not yet moving, so determine its direction
                // It must rotate in the opposite direction of the current gear
                neighborGear.direction = -currentGear.direction as Direction; // Flip the direction
                
                // Add to queue for further processing if not already queued/visited
                if (!visited[neighborId]) {
                    queue.push(neighborId);
                    visited[neighborId] = true;
                }
            } else {
                // Neighbor is already moving. Check for contradictions.
                // If the neighbor's current direction is the same as the current gear's direction,
                // and they touch, it's a conflict.
                if (neighborGear.direction === currentGear.direction) {
                    isSystemLocked = true; // Mark the system as locked
                    // We continue the BFS to ensure all reachable gears are assigned a direction
                    // if possible, but the `isSystemLocked` flag will take precedence for the final output.
                }
            }
        }
    }
    ```

5.  **Determine Final Output:**
    *   After the BFS completes:
        *   If `isSystemLocked` is `true`, output `NOT MOVING`.
        *   Else, check `gears[N-1].direction`:
            *   If it's `Direction.CW` (`1`), output `CW`.
            *   If it's `Direction.CCW` (`-1`), output `CCW`.
            *   If it's still `Direction.NOT_MOVING` (`0`), it means the last gear was never reached by the motion from the first gear (i.e., it's in a disconnected component), so output `NOT MOVING`.

This approach handles both disconnected gears and gears that become locked due to rotational conflicts in a consistent manner.

---

## Code