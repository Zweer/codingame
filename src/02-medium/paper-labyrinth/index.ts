// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

/**
 * Performs a Breadth-First Search (BFS) to find the shortest path in a labyrinth.
 * @param startX X-coordinate of the starting cell.
 * @param startY Y-coordinate of the starting cell.
 * @param targetX X-coordinate of the target cell.
 * @param targetY Y-coordinate of the target cell.
 * @param maze The labyrinth grid, where each cell contains a wall configuration number.
 * @param w Width of the labyrinth.
 * @param h Height of the labyrinth.
 * @returns The shortest distance (number of steps) from start to target, or -1 if no path found.
 */
function bfs(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    maze: number[][],
    w: number,
    h: number
): number {
    // Queue for BFS, storing [x, y] coordinates
    const queue: [number, number][] = [];
    // Distance array, initialized with -1 (unvisited)
    // dist[y][x] stores the minimum steps to reach (x, y)
    const dist: number[][] = Array(h)
        .fill(0)
        .map(() => Array(w).fill(-1));

    // Start BFS from the initial position
    queue.push([startX, startY]);
    dist[startY][startX] = 0;

    // Relative coordinates for movement (Down, Up, Left, Right)
    const dx = [0, 0, -1, 1];
    const dy = [1, -1, 0, 0];

    while (queue.length > 0) {
        // Dequeue the current cell
        const [currX, currY] = queue.shift()!; // '!' asserts that queue.shift() won't be undefined

        // If the target is reached, return the distance
        if (currX === targetX && currY === targetY) {
            return dist[currY][currX];
        }

        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nextX = currX + dx[i];
            const nextY = currY + dy[i];

            // 1. Check if the next cell is within labyrinth bounds
            if (nextX < 0 || nextX >= w || nextY < 0 || nextY >= h) {
                continue;
            }

            // 2. Check if the next cell has already been visited
            if (dist[nextY][nextX] !== -1) {
                continue;
            }

            // --- 3. Wall checking logic ---
            const currentCellVal = maze[currY][currX];
            const nextCellVal = maze[nextY][nextX];
            let canMoveToNext = false;

            if (dy[i] === 1) { // Moving Down (from (currX, currY) to (currX, currY+1))
                // Current cell must not have a down wall (bit 1)
                // Next cell must not have a top wall (bit 4)
                canMoveToNext = !(currentCellVal & 1) && !(nextCellVal & 4);
            } else if (dy[i] === -1) { // Moving Up (from (currX, currY) to (currX, currY-1))
                // Current cell must not have a top wall (bit 4)
                // Next cell must not have a down wall (bit 1)
                canMoveToNext = !(currentCellVal & 4) && !(nextCellVal & 1);
            } else if (dx[i] === -1) { // Moving Left (from (currX, currY) to (currX-1, currY))
                // Current cell must not have a left wall (bit 2)
                // Next cell must not have a right wall (bit 8)
                canMoveToNext = !(currentCellVal & 2) && !(nextCellVal & 8);
            } else if (dx[i] === 1) { // Moving Right (from (currX, currY) to (currX+1, currY))
                // Current cell must not have a right wall (bit 8)
                // Next cell must not have a left wall (bit 2)
                canMoveToNext = !(currentCellVal & 8) && !(nextCellVal & 2);
            }

            // If movement is possible, update distance and enqueue the next cell
            if (canMoveToNext) {
                dist[nextY][nextX] = dist[currY][currX] + 1;
                queue.push([nextX, nextY]);
            }
        }
    }

    // This part should theoretically not be reached if a path always exists,
    // as per typical competitive programming puzzle assumptions.
    return -1;
}

// --- Main Program Logic ---

// Read start coordinates (Alice's position)
const [xs, ys] = readline().split(' ').map(Number);

// Read rabbit coordinates
const [xr, yr] = readline().split(' ').map(Number);

// Read labyrinth dimensions
const [w, h] = readline().split(' ').map(Number);

// Read labyrinth data
const maze: number[][] = [];
for (let i = 0; i < h; i++) {
    const hexRow = readline();
    const row: number[] = [];
    for (let j = 0; j < w; j++) {
        // Convert each hexadecimal character to its integer value (0-15)
        row.push(parseInt(hexRow[j], 16));
    }
    maze.push(row);
}

// Calculate the path from Alice to the Rabbit
const distAliceToRabbit = bfs(xs, ys, xr, yr, maze, w, h);

// Calculate the path from the Rabbit back to Alice
const distRabbitToAlice = bfs(xr, yr, xs, ys, maze, w, h);

// Output the results as requested
print(`${distAliceToRabbit} ${distRabbitToAlice}`);