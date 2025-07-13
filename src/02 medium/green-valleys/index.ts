// Read H, the height of the snow line
const H: number = parseInt(readline());

// Read N, the length of one side of the map
const N: number = parseInt(readline());

// Read the map data into a 2D array
const heightMap: number[][] = [];
for (let i = 0; i < N; i++) {
    heightMap.push(readline().split(' ').map(Number));
}

// A 2D array to keep track of visited green tiles during graph traversal
// This prevents reprocessing cells and ensures each valley is counted once.
const visited: boolean[][] = Array(N).fill(null).map(() => Array(N).fill(false));

let maxValleySize: number = 0;
// Initialize to 0. If no valleys are found, 0 is the required output.
let deepestPointOverall: number = 0; 

// Define directions for moving to adjacent cells (up, down, left, right)
// dr: row changes, dc: column changes
const dr = [-1, 1, 0, 0]; 
const dc = [0, 0, -1, 1]; 

// Iterate through each cell of the map
for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
        // If the current cell is green (height <= H) AND has not been visited yet,
        // it means we've found the starting point of a new, uncounted valley.
        if (heightMap[r][c] <= H && !visited[r][c]) {
            let currentValleySize: number = 0;
            // Initialize with Infinity to ensure the first height encountered becomes the minimum.
            let currentValleyDeepestPoint: number = Infinity; 

            // Use a queue for Breadth-First Search (BFS) to find all connected green tiles
            const queue: [number, number][] = [];
            queue.push([r, c]); // Add the starting green tile to the queue
            visited[r][c] = true; // Mark it as visited

            // Process the queue until it's empty, exploring all connected green tiles
            while (queue.length > 0) {
                const [currR, currC] = queue.shift()!; // Get the next tile from the queue

                currentValleySize++; // Increment the size of the current valley
                // Update the deepest point found within the current valley
                currentValleyDeepestPoint = Math.min(currentValleyDeepestPoint, heightMap[currR][currC]);

                // Explore all four (horizontal and vertical) neighbors
                for (let i = 0; i < 4; i++) {
                    const nextR = currR + dr[i];
                    const nextC = currC + dc[i];

                    // Check if the neighbor is within the map boundaries (0 to N-1 for both row and column)
                    if (nextR >= 0 && nextR < N && nextC >= 0 && nextC < N) {
                        // Check if the neighbor is green AND has not been visited yet
                        if (heightMap[nextR][nextC] <= H && !visited[nextR][nextC]) {
                            visited[nextR][nextC] = true; // Mark as visited
                            queue.push([nextR, nextC]); // Add to the queue for further exploration
                        }
                    }
                }
            }

            // After the BFS completes, 'currentValleySize' and 'currentValleyDeepestPoint'
            // hold the properties of the valley just discovered.
            // Compare this valley with the largest one found so far.
            if (currentValleySize > maxValleySize) {
                // If this valley is larger than any found before, it becomes the new largest.
                maxValleySize = currentValleySize;
                deepestPointOverall = currentValleyDeepestPoint;
            } else if (currentValleySize === maxValleySize) {
                // If this valley has the same size as the current largest,
                // we apply the tie-breaking rule: choose the one with the deepest point (minimum height).
                deepestPointOverall = Math.min(deepestPointOverall, currentValleyDeepestPoint);
            }
        }
    }
}

// Output the final result: the deepest point of the largest valley.
console.log(deepestPointOverall);