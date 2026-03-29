// Standard input reading in CodinGame environment
declare function readline(): string;
declare function printErr(message: any): void;

const W: number = parseInt(readline());
const H: number = parseInt(readline());
const grid: string[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(readline().split(''));
}

// Class to uniquely identify each starting tower location
class TowerOrigin {
    id: string; // The character ID (e.g., 'A', 'B')
    startR: number;
    startC: number;
    uniqueKey: string; // A unique string identifier, e.g., "A_0_0"

    constructor(id: string, startR: number, startC: number) {
        this.id = id;
        this.startR = startR;
        this.startC = startC;
        this.uniqueKey = `${id}_${startR}_${startC}`;
    }
}

// Class to represent an item in the BFS queue
class CellQueueItem {
    row: number;
    col: number;
    dist: number;
    origin: TowerOrigin; // Reference to the unique TowerOrigin that reached this cell

    constructor(row: number, col: number, dist: number, origin: TowerOrigin) {
        this.row = row;
        this.col = col;
        this.dist = dist;
        this.origin = origin;
    }
}

// BFS queue (implemented as an array with a head pointer for efficiency)
const queue: CellQueueItem[] = [];

// 2D array to store the minimum distance from any tower to a cell
const minDist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));

// 2D array to store sets of unique origin keys that reached a cell at its minDist
// This helps determine ties (multiple origins reaching at the same time)
const reachedByOrigins: Set<string>[][] = Array(H).fill(0).map(() => Array(W).fill(null).map(() => new Set<string>()));

// Map to quickly retrieve TowerOrigin objects using their unique keys
const towerOriginMap = new Map<string, TowerOrigin>();

// Directions for movement (UP, DOWN, LEFT, RIGHT)
const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];

// 1. Initialization: Identify all initial towers and set up their starting BFS state
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const char = grid[r][c];
        // A character is considered a tower if it's not '.', '#', or '+'
        if (char !== '.' && char !== '#' && char !== '+') {
            const origin = new TowerOrigin(char, r, c);
            towerOriginMap.set(origin.uniqueKey, origin);

            // Add the initial tower cell to the queue
            queue.push(new CellQueueItem(r, c, 0, origin));
            // Initialize its distance to 0
            minDist[r][c] = 0;
            // Record that this origin reached this cell
            reachedByOrigins[r][c].add(origin.uniqueKey);
        }
    }
}

// 2. BFS Traversal
let head = 0;
while (head < queue.length) {
    const { row, col, dist, origin } = queue[head++]; // Dequeue the current cell

    // Explore neighbors
    for (let i = 0; i < 4; i++) {
        const nr = row + dr[i];
        const nc = col + dc[i];
        const newDist = dist + 1;

        // Check boundary conditions and if the neighbor is an obstacle
        if (nr < 0 || nr >= H || nc < 0 || nc >= W || grid[nr][nc] === '#') {
            continue;
        }

        // Case 1: This origin reaches the neighbor faster than any previously recorded path
        if (newDist < minDist[nr][nc]) {
            minDist[nr][nc] = newDist; // Update minimum distance
            reachedByOrigins[nr][nc].clear(); // Clear previous origins (they are no longer the fastest)
            reachedByOrigins[nr][nc].add(origin.uniqueKey); // Add the new fastest origin
            queue.push(new CellQueueItem(nr, nc, newDist, origin)); // Enqueue to continue propagation
        }
        // Case 2: This origin reaches the neighbor at the exact same minimum distance
        else if (newDist === minDist[nr][nc]) {
            // Add this origin to the set of those reaching at this distance,
            // but only if it's a new origin for this cell at this distance.
            if (!reachedByOrigins[nr][nc].has(origin.uniqueKey)) {
                reachedByOrigins[nr][nc].add(origin.uniqueKey);
                // Even if it's a tie, the wave from this origin still propagates.
                queue.push(new CellQueueItem(nr, nc, newDist, origin));
            }
        }
    }
}

// 3. Construct the final result grid
const resultGrid: string[][] = Array(H).fill(0).map(() => Array(W).fill(''));

for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const originalChar = grid[r][c];

        if (originalChar === '#') {
            // Obstacles remain as '#'
            resultGrid[r][c] = '#';
        } else if (minDist[r][c] === Infinity) {
            // If the cell was never reached by any tower (e.g., isolated '.'),
            // or if it was an initial tower surrounded by '#' and couldn't expand,
            // it retains its original character.
            resultGrid[r][c] = originalChar;
        } else {
            // The cell was reached by at least one tower origin
            if (reachedByOrigins[r][c].size > 1) {
                // If multiple distinct tower origins reached it at the same minimum distance, mark '+'
                resultGrid[r][c] = '+';
            } else if (reachedByOrigins[r][c].size === 1) {
                // If exactly one unique tower origin claimed it, mark with that tower's ID
                const uniqueOriginKey = reachedByOrigins[r][c].values().next().value;
                const winningOrigin = towerOriginMap.get(uniqueOriginKey);
                // This check should always pass if logic is correct
                if (winningOrigin) {
                    resultGrid[r][c] = winningOrigin.id;
                } else {
                    // Fallback in case of unexpected state
                    resultGrid[r][c] = originalChar;
                }
            } else {
                // This case (`minDist` is finite but `reachedByOrigins` is empty)
                // indicates a logic error, but as a safeguard, retain original character.
                resultGrid[r][c] = originalChar;
            }
        }
    }
}

// 4. Print the result grid
for (let r = 0; r < H; r++) {
    console.log(resultGrid[r].join(''));
}