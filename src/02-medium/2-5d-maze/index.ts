/**
 * Global readline and console.log are provided by CodinGame.
 * No need to import them explicitly.
 */

// Define state as a tuple [y, x, height_index]
type State = [number, number, number];

// Map actual heights to array indices for easy lookup
const HEIGHT_FLOOR = 0; // Represents ground level
const HEIGHT_RAISED = 1; // Represents walking over short walls/bridges
const HEIGHT_UNDERGROUND = -1; // Represents walking under bridges/tunnels

const HEIGHT_TO_IDX: Record<number, number> = {
    [HEIGHT_FLOOR]: 0,
    [HEIGHT_RAISED]: 1,
    [HEIGHT_UNDERGROUND]: 2,
};

const IDX_TO_HEIGHT: Record<number, number> = {
    0: HEIGHT_FLOOR,
    1: HEIGHT_RAISED,
    2: HEIGHT_UNDERGROUND,
};

// Movement directions for cardinal moves (Up, Down, Left, Right)
const DY = [-1, 1, 0, 0];
const DX = [0, 0, -1, 1];

// Read input
const startCoords = readline().split(' ').map(Number);
const endCoords = readline().split(' ').map(Number);
const mazeSize = readline().split(' ').map(Number);

const startY = startCoords[0];
const startX = startCoords[1];
const endY = endCoords[0];
const endX = endCoords[1];
const H = mazeSize[0]; // Height of the maze
const W = mazeSize[1]; // Width of the maze

// Read the maze grid
const maze: string[][] = [];
for (let i = 0; i < H; i++) {
    maze.push(readline().split(''));
}

// Distance array: dist[y][x][height_idx] stores the minimum steps to reach (y, x) at that height
// Initialize all distances to Infinity
const dist: number[][][] = Array(H).fill(0).map(() =>
    Array(W).fill(0).map(() => Array(3).fill(Infinity))
);

// Use two queues for 0-1 BFS:
// q0 for states reachable with 0-cost (vertical transitions)
// q1 for states reachable with 1-cost (horizontal movements)
let q0: State[] = [];
let q1: State[] = [];

// Starting state: Link always starts on the floor (height 0)
dist[startY][startX][HEIGHT_TO_IDX[HEIGHT_FLOOR]] = 0;
q0.push([startY, startX, HEIGHT_TO_IDX[HEIGHT_FLOOR]]);

// Main BFS loop
while (q0.length > 0 || q1.length > 0) {
    let currentBatch: State[];
    let batchHead = 0;

    // Process all 0-cost transitions first (current level)
    if (q0.length > 0) {
        currentBatch = q0;
        q0 = []; // Clear q0 for the next set of 0-cost additions
    } else {
        // If q0 is empty, move to the next "level" of 1-cost steps
        currentBatch = q1;
        q1 = []; // Clear q1 for the next set of 1-cost additions
    }

    // Process all states in the current batch
    while (batchHead < currentBatch.length) {
        const [currY, currX, currHeightIdx] = currentBatch[batchHead++]; // Dequeue using pointer
        const currentSteps = dist[currY][currX][currHeightIdx];
        const currChar = maze[currY][currX];
        const currHeight = IDX_TO_HEIGHT[currHeightIdx];

        // --- 1. Vertical transitions at the current cell (cost 0) ---
        // Only slopes allow changing height at the same (y,x) coordinates
        if (currChar === '|' || currChar === '-') {
            // Helper function to add 0-cost neighbors to q0
            const tryAdd0Cost = (ny: number, nx: number, nh: number) => {
                const nhIdx = HEIGHT_TO_IDX[nh];
                if (dist[ny][nx][nhIdx] > currentSteps) {
                    dist[ny][nx][nhIdx] = currentSteps;
                    q0.push([ny, nx, nhIdx]);
                }
            };

            if (currHeight === HEIGHT_FLOOR) {
                // From floor level slope, can go to raised or underground
                tryAdd0Cost(currY, currX, HEIGHT_RAISED);
                tryAdd0Cost(currY, currX, HEIGHT_UNDERGROUND);
            } else {
                // From raised or underground slope, can go back to floor level
                tryAdd0Cost(currY, currX, HEIGHT_FLOOR);
            }
        }

        // --- 2. Horizontal movements to adjacent cells (cost 1) ---
        for (let i = 0; i < 4; i++) { // Iterate over 4 cardinal directions
            const nextY = currY + DY[i];
            const nextX = currX + DX[i];

            // Check if next coordinates are within maze bounds
            if (nextY < 0 || nextY >= H || nextX < 0 || nextX >= W) continue;

            const nextChar = maze[nextY][nextX];
            if (nextChar === '#') continue; // High wall is always impassable

            // Helper function to add 1-cost neighbors to q1
            const tryAdd1Cost = (ny: number, nx: number, nh: number) => {
                const nhIdx = HEIGHT_TO_IDX[nh];
                if (dist[ny][nx][nhIdx] > currentSteps + 1) {
                    dist[ny][nx][nhIdx] = currentSteps + 1;
                    q1.push([ny, nx, nhIdx]);
                }
            };

            // Define allowed transitions based on current height and cell type
            if (currHeight === HEIGHT_FLOOR) {
                if (currChar === '.') {
                    // From floor tile (.), can only move to floor (.) or slope (|/-) at floor level
                    if (nextChar === '.') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR);
                    else if (nextChar === '|' || nextChar === '-') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR);
                } else if (currChar === '|' || currChar === '-') {
                    // From slope tile at floor level, can move to various types and heights
                    if (nextChar === '.') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR);
                    else if (nextChar === '|' || nextChar === '-') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR);
                    else if (nextChar === '+') tryAdd1Cost(nextY, nextX, HEIGHT_RAISED); // To short wall (over)
                    else if (nextChar === 'X') {
                        tryAdd1Cost(nextY, nextX, HEIGHT_RAISED); // To bridge (over)
                        tryAdd1Cost(nextY, nextX, HEIGHT_UNDERGROUND); // To bridge (under)
                    }
                    else if (nextChar === 'O') tryAdd1Cost(nextY, nextX, HEIGHT_UNDERGROUND); // To tunnel (under)
                }
            } else if (currHeight === HEIGHT_RAISED) {
                if (currChar === '+' || currChar === 'X') {
                    // From raised platform (+ or X), can move to other raised platforms or to a slope to descend
                    if (nextChar === '+' || nextChar === 'X') tryAdd1Cost(nextY, nextX, HEIGHT_RAISED);
                    else if (nextChar === '|' || nextChar === '-') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR); // Descend via slope
                }
            } else if (currHeight === HEIGHT_UNDERGROUND) {
                if (currChar === 'X' || currChar === 'O') {
                    // From underground (X or O), can move to other underground paths or to a slope to ascend
                    if (nextChar === 'X' || nextChar === 'O') tryAdd1Cost(nextY, nextX, HEIGHT_UNDERGROUND);
                    else if (nextChar === '|' || nextChar === '-') tryAdd1Cost(nextY, nextX, HEIGHT_FLOOR); // Ascend via slope
                }
            }
        }
    }
}

// The problem states that the exit is on the floor, so we check the distance at floor level.
const result = dist[endY][endX][HEIGHT_TO_IDX[HEIGHT_FLOOR]];

console.log(result);