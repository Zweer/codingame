// Read W and H from the first line
const [W, H] = readline().split(' ').map(Number);

// Read the initial grid configuration
const initialGrid: boolean[][] = [];
for (let i = 0; i < H; i++) {
    initialGrid.push(readline().split('').map(char => char === '#'));
}

/**
 * Converts a 2D boolean grid into a unique string representation.
 * This is used as a key for the history map to detect cycles.
 * @param grid The 2D boolean array representing the game board.
 * @returns A string representation of the grid.
 */
function serializeGrid(grid: boolean[][]): string {
    return grid.map(row => row.map(cell => cell ? '#' : ' ').join('')).join('\n');
}

/**
 * Counts the number of live neighbors for a given cell (r, c).
 * Neighbors include all 8 adjacent cells (horizontal, vertical, and diagonal).
 * Handles boundary conditions: cells on edges/corners have fewer potential neighbors.
 * @param grid The current game board.
 * @param r The row index of the cell.
 * @param c The column index of the cell.
 * @param W The width of the grid.
 * @param H The height of the grid.
 * @returns The number of live neighbors (0-8).
 */
function countLiveNeighbors(grid: boolean[][], r: number, c: number, W: number, H: number): number {
    let count = 0;
    // Iterate through a 3x3 kernel around the cell (r, c)
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            // Skip the cell itself
            if (dr === 0 && dc === 0) continue;

            const nr = r + dr; // Neighbor row
            const nc = c + dc; // Neighbor column

            // Check if the neighbor is within the grid boundaries
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                if (grid[nr][nc]) { // If the neighbor cell is alive
                    count++;
                }
            }
        }
    }
    return count;
}

/**
 * Calculates the next generation of the game board based on Conway's Game of Life rules.
 * @param currentGrid The current game board.
 * @param W The width of the grid.
 * @param H The height of the grid.
 * @returns A new 2D boolean array representing the next generation.
 */
function getNextGeneration(currentGrid: boolean[][], W: number, H: number): boolean[][] {
    // Create a new grid for the next generation, initialized with all dead cells
    const nextGrid: boolean[][] = Array(H).fill(null).map(() => Array(W).fill(false));

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const isAlive = currentGrid[r][c];
            const neighbors = countLiveNeighbors(currentGrid, r, c, W, H);

            if (isAlive) {
                // Rule 1: A live cell with fewer than two live neighbours dies (underpopulation).
                // Rule 2: A live cell with two or three live neighbours lives on to the next generation.
                // Rule 3: A live cell with more than three live neighbours dies (overpopulation).
                if (neighbors === 2 || neighbors === 3) {
                    nextGrid[r][c] = true; // Lives on
                } else {
                    nextGrid[r][c] = false; // Dies
                }
            } else {
                // Rule 4: A dead cell with exactly three live neighbours becomes a live cell (reproduction).
                if (neighbors === 3) {
                    nextGrid[r][c] = true; // Becomes alive
                } else {
                    nextGrid[r][c] = false; // Remains dead
                }
            }
        }
    }
    return nextGrid;
}

/**
 * Checks if the grid contains any live cells.
 * @param grid The game board.
 * @returns True if the grid is empty (no live cells), false otherwise.
 */
function isGridEmpty(grid: boolean[][]): boolean {
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c]) {
                return false; // Found a live cell
            }
        }
    }
    return true; // No live cells found
}

// --- Main Simulation Loop ---
let currentGrid: boolean[][] = initialGrid;
// History map stores serialized grid configurations and the step number they were first seen.
const historyMap = new Map<string, number>(); 
let step = 0; // Represents the current generation number

// Add the initial configuration to history at step 0
historyMap.set(serializeGrid(currentGrid), step);

while (true) {
    step++; // Advance to the next generation step

    // Calculate the next generation
    const nextGrid = getNextGeneration(currentGrid, W, H);
    const nextSerializedGrid = serializeGrid(nextGrid);

    // 1. Check for Death: If the next grid is empty, the game ends in Death.
    if (isGridEmpty(nextGrid)) {
        console.log("Death");
        break; // End simulation
    }

    // 2. Check for Still or Oscillator:
    // If the next configuration has been seen before, it's either Still or an Oscillator.
    if (historyMap.has(nextSerializedGrid)) {
        const prevStep = historyMap.get(nextSerializedGrid)!; // Get the step when this config was first seen
        const period = step - prevStep; // Calculate the period of the cycle

        if (period === 1) {
            // If period is 1, the current configuration is identical to the previous one
            // (i.e., nextGrid is the same as currentGrid was), so it's Still.
            console.log("Still");
        } else {
            // If period is > 1, it's an Oscillator with the calculated period.
            console.log(`Oscillator ${period}`);
        }
        break; // End simulation
    }

    // If no end condition met, update currentGrid and add the new configuration to history
    currentGrid = nextGrid;
    historyMap.set(nextSerializedGrid, step);
}