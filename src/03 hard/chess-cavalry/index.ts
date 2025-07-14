// Assume readline() function is available from CodinGame environment
declare function readline(): string;

// Read board dimensions
const line1 = readline().split(' ').map(Number);
const W = line1[0];
const H = line1[1];

// Initialize board and find start (B) and end (E) coordinates
const board: string[][] = [];
let startR: number = -1; 
let startC: number = -1;
let endR: number = -1;
let endC: number = -1;

for (let r = 0; r < H; r++) {
    const row = readline();
    board.push(row.split(''));
    for (let c = 0; c < W; c++) {
        if (board[r][c] === 'B') {
            startR = r;
            startC = c;
        } else if (board[r][c] === 'E') {
            endR = r;
            endC = c;
        }
    }
}

// Breadth-First Search (BFS) implementation

// Queue stores [row, col, distance] tuples
// Type assertion '!' is used for queue.shift() because our loop condition guarantees non-empty queue.
const queue: [number, number, number][] = [];

// visited[r][c] will be true if the cell (r, c) has been visited
// Initialize all cells as not visited
const visited: boolean[][] = Array(H).fill(0).map(() => Array(W).fill(false));

// Knight's possible moves: 8 directions (dr: change in row, dc: change in column)
const dr = [-2, -2, -1, -1, 1, 1, 2, 2];
const dc = [-1, 1, -2, 2, -2, 2, -1, 1];

// Start BFS from the 'B' position with distance 0
queue.push([startR, startC, 0]);
visited[startR][startC] = true; // Mark starting cell as visited

let minTurns = -1; // Stores the minimum number of turns found
let found = false;  // Flag to indicate if 'E' was reached

// BFS loop
while (queue.length > 0) {
    const [currentRow, currentCol, currentDistance] = queue.shift()!; // Dequeue the first element

    // If we reached the target 'E'
    if (currentRow === endR && currentCol === endC) {
        minTurns = currentDistance;
        found = true;
        break; // Found the shortest path, exit BFS
    }

    // Explore all 8 possible knight moves from the current position
    for (let i = 0; i < 8; i++) {
        const nextRow = currentRow + dr[i];
        const nextCol = currentCol + dc[i];

        // Check if the next position is within the board boundaries
        if (nextRow >= 0 && nextRow < H && nextCol >= 0 && nextCol < W) {
            // Check if the next position has not been visited and is not an obstacle ('#')
            if (!visited[nextRow][nextCol] && board[nextRow][nextCol] !== '#') {
                visited[nextRow][nextCol] = true; // Mark as visited
                queue.push([nextRow, nextCol, currentDistance + 1]); // Enqueue with increased distance
            }
        }
    }
}

// Output the result
if (found) {
    console.log(minTurns);
} else {
    console.log("Impossible");
}