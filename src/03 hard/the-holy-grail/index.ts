// The 'readline()' function is provided by the CodinGame environment.
// It reads a line from the standard input.
// Example:
// declare function readline(): string; // This declaration is typically not needed in CG, but for local type checking it's helpful.

/**
 * Solves the "The Holy Grail" puzzle.
 * Detects when a path is formed between (0,0) and (W-1, H-1) using newly appearing tiles.
 * Outputs the number of new tiles added when the path is first complete.
 */
function solve() {
    // Read the width (W) and height (H) of the room from the first line of input.
    const [W_str, H_str] = readline().split(' ');
    const W = parseInt(W_str);
    const H = parseInt(H_str);

    // Define the coordinates of the Holy Grail (target position).
    const targetX = W - 1;
    const targetY = H - 1;

    // Initialize a 2D boolean array to keep track of visible tiles.
    // `visibleTiles[x][y]` will be true if the tile at (x,y) is currently visible.
    // Dimensions are W (columns) x H (rows).
    const visibleTiles: boolean[][] = Array(W).fill(0).map(() => Array(H).fill(false));

    // Initially, the bot's position (0,0) and the Grail's position (W-1, H-1) are visible.
    visibleTiles[0][0] = true;
    visibleTiles[targetX][targetY] = true;

    // Counter for the number of new tiles received.
    let newTilesCount = 0;

    /**
     * Performs a Breadth-First Search (BFS) to check if the target (Grail) is reachable from (0,0).
     * @returns {boolean} True if a path exists, false otherwise.
     */
    function canReachTarget(): boolean {
        // Initialize a 2D boolean array to keep track of visited tiles for the current BFS.
        // This must be reset for each path check.
        const visited: boolean[][] = Array(W).fill(0).map(() => Array(H).fill(false));
        
        // Initialize a queue for BFS. Stores coordinates as objects {x, y}.
        const queue: { x: number, y: number }[] = [];

        // Start BFS from the bot's position (0,0).
        queue.push({ x: 0, y: 0 });
        visited[0][0] = true;

        // Define possible movements: up, down, left, right.
        const dx = [-1, 1, 0, 0]; // Change in x-coordinate
        const dy = [0, 0, -1, 1]; // Change in y-coordinate

        // `head` acts as a pointer to the front of the queue, optimizing dequeue operations.
        let head = 0; 
        while (head < queue.length) {
            const { x, y } = queue[head++]; // Dequeue the current tile

            // If the current tile is the target, a path is found.
            if (x === targetX && y === targetY) {
                return true;
            }

            // Explore all four possible neighbors (horizontal and vertical).
            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];

                // Check if the neighbor is within the room boundaries.
                if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                    // Check if the neighbor tile is visible AND has not been visited in this BFS.
                    if (visibleTiles[nx][ny] && !visited[nx][ny]) {
                        visited[nx][ny] = true; // Mark as visited
                        queue.push({ x: nx, y: ny }); // Enqueue for further exploration
                    }
                }
            }
        }
        // If the queue becomes empty and the target was not reached, no path exists.
        return false;
    }

    // Main loop: Continuously read new tile coordinates until a path is found.
    while (true) {
        const line = readline(); // Read the next line, which contains new tile coordinates.
        
        // Parse the coordinates of the new tile.
        const [tileX_str, tileY_str] = line.split(' ');
        const tileX = parseInt(tileX_str);
        const tileY = parseInt(tileY_str);

        // Increment the count of new tiles processed.
        newTilesCount++;

        // Mark the newly appeared tile as visible.
        visibleTiles[tileX][tileY] = true;

        // After adding the new tile, check if a complete path from (0,0) to (W-1, H-1) now exists.
        if (canReachTarget()) {
            // If a path is found, output the total number of new tiles processed
            // (including the current one that completed the path) and terminate.
            console.log(newTilesCount);
            break; 
        }
    }
}

// Call the solve function to begin execution of the program.
solve();