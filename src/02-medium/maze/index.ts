// Read maze dimensions
const [W, H] = readline().split(' ').map(Number);
// Read starting coordinates
const [startX, startY] = readline().split(' ').map(Number);

// Read maze rows into a 2D array
const maze: string[][] = [];
for (let i = 0; i < H; i++) {
    maze.push(readline().split('')); // Split string into an array of characters
}

// Initialize a 2D array to keep track of visited cells
// visited[y][x] corresponds to maze[y][x]
const visited: boolean[][] = Array(H).fill(0).map(() => Array(W).fill(false));

// Queue for BFS. Stores [x, y] coordinates.
const queue: [number, number][] = [];

// Set to store unique exit coordinates as "x y" strings
const exitSet: Set<string> = new Set();

// Define direction vectors for 4-directional movement (Right, Left, Down, Up)
const dx = [1, -1, 0, 0]; // Change in X
const dy = [0, 0, 1, -1]; // Change in Y

// Start BFS from the initial position
// The problem implies (startX, startY) is always a traversable cell.
queue.push([startX, startY]);
visited[startY][startX] = true;

// Perform BFS traversal
while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!; // Dequeue current cell. '!' asserts it's not undefined.

    // Check if the current cell is an exit
    // An exit is a traversable cell on any of the maze borders.
    if (currentX === 0 || currentX === W - 1 || currentY === 0 || currentY === H - 1) {
        exitSet.add(`${currentX} ${currentY}`);
    }

    // Explore all four neighbors
    for (let i = 0; i < 4; i++) {
        const nextX = currentX + dx[i];
        const nextY = currentY + dy[i];

        // Check if the neighbor is within maze boundaries
        if (nextX >= 0 && nextX < W && nextY >= 0 && nextY < H) {
            // Check if the neighbor is a path ('.') and has not been visited yet
            if (maze[nextY][nextX] === '.' && !visited[nextY][nextX]) {
                visited[nextY][nextX] = true; // Mark as visited
                queue.push([nextX, nextY]);   // Enqueue for further exploration
            }
        }
    }
}

// Convert the Set of unique exit strings into an array of [number, number] tuples
const exits: [number, number][] = Array.from(exitSet).map(s => {
    const parts = s.split(' ').map(Number);
    return [parts[0], parts[1]];
});

// Sort the exits: first by X coordinate, then by Y coordinate
exits.sort((a, b) => {
    if (a[0] !== b[0]) {
        return a[0] - b[0]; // Sort by EX (x-coordinate)
    }
    return a[1] - b[1];     // Then by EY (y-coordinate)
});

// Output the total number of exits
print(exits.length);

// Output each exit's coordinates
for (const [ex, ey] of exits) {
    print(`${ex} ${ey}`);
}