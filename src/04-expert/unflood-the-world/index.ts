// Standard CodinGame input reading and output functions
declare function readline(): string;
declare function print(message: any): void;

// N: width, M: height
const [N, M] = readline().split(' ').map(Number);

const heights: number[][] = [];
for (let i = 0; i < M; i++) {
    heights.push(readline().split(' ').map(Number));
}

// Define a Cell interface for better type safety and readability
interface Cell {
    r: number; // row index
    c: number; // column index
    h: number; // height of the square at (r, c)
}

// Collect all cells with their coordinates and heights into a single list
const allCells: Cell[] = [];
for (let r = 0; r < M; r++) {
    for (let c = 0; c < N; c++) {
        allCells.push({ r, c, h: heights[r][c] });
    }
}

// Sort cells by height in ascending order.
// This is crucial: by processing lowest cells first, we ensure that the first time
// we encounter an unvisited cell, it's the true lowest point of an undrained basin.
allCells.sort((a, b) => a.h - b.h);

// 2D array to keep track of visited cells.
// A cell is marked 'visited' if it's part of a basin that will be drained by an already placed drain.
const visited: boolean[][] = Array(M).fill(0).map(() => Array(N).fill(false));

let drainsCount = 0;

// Delta arrays for navigating to adjacent cells (up, down, left, right)
const dr = [-1, 1, 0, 0]; // Row changes for neighbors
const dc = [0, 0, -1, 1]; // Column changes for neighbors

// Iterate through the cells, starting from the lowest ones
for (const cell of allCells) {
    const { r, c, h } = cell;

    // If this cell has already been visited, it means it's part of a basin
    // whose lowest point (and thus its drain) has already been processed.
    // So, we can skip it.
    if (visited[r][c]) {
        continue;
    }

    // If we reach an unvisited cell, it implies this cell is the lowest point
    // of a new, previously undrained basin. Therefore, a drain must be placed here.
    drainsCount++;

    // Perform a Breadth-First Search (BFS) to mark all cells belonging to this basin.
    // These are all cells reachable from (r, c) where the path only goes through
    // cells whose heights are greater than or equal to the current basin's lowest height (h).
    const queue: Cell[] = [];
    queue.push(cell);
    visited[r][c] = true; // Mark the starting cell as visited

    // Use a manual head pointer for the queue to achieve O(1) dequeue operations,
    // as Array.shift() can be O(N) in JavaScript.
    let head = 0; 
    while (head < queue.length) {
        const currentCell = queue[head++]; // Dequeue current cell

        // Check all 4 neighbors (up, down, left, right)
        for (let i = 0; i < 4; i++) {
            const nextR = currentCell.r + dr[i];
            const nextC = currentCell.c + dc[i];

            // Check if the neighbor is within the map bounds
            if (nextR >= 0 && nextR < M && nextC >= 0 && nextC < N) {
                // If the neighbor is not yet visited AND its height is
                // greater than or equal to the height of the basin's lowest point (h).
                // Water from cells of equal or higher height can flow towards 'h'.
                if (!visited[nextR][nextC] && heights[nextR][nextC] >= h) {
                    visited[nextR][nextC] = true; // Mark as visited
                    queue.push({ r: nextR, c: nextC, h: heights[nextR][nextC] }); // Add to queue for further exploration
                }
            }
        }
    }
}

// Output the minimum number of drains required
print(drainsCount);