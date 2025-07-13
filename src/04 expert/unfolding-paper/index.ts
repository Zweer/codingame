// Define a type for the grid
type Grid = string[][];

/**
 * Performs a down-to-up unfold operation on the given grid.
 * The original grid becomes the bottom half, and its vertical mirror becomes the top half.
 *
 * @param grid The input grid (current state of the folded paper).
 * @returns A new grid representing the paper after the vertical unfold.
 */
function unfoldVertical(grid: Grid): Grid {
    const H_old = grid.length;
    const W_old = grid[0].length;
    const H_new = 2 * H_old;

    // Initialize the new grid with empty strings
    const newGrid: Grid = Array(H_new).fill(0).map(() => Array(W_old).fill(''));

    for (let r = 0; r < H_old; r++) {
        for (let c = 0; c < W_old; c++) {
            // Copy the original grid to the bottom half of the new grid
            newGrid[H_old + r][c] = grid[r][c];
            // Copy the vertically mirrored content to the top half of the new grid
            // Row r in the original grid corresponds to row (H_old - 1 - r) in the mirrored top half.
            newGrid[H_old - 1 - r][c] = grid[r][c];
        }
    }
    return newGrid;
}

/**
 * Performs a right-to-left unfold operation on the given grid.
 * The original grid becomes the right half, and its horizontal mirror becomes the left half.
 *
 * @param grid The input grid (result of the vertical unfold).
 * @returns A new grid representing the paper after the horizontal unfold.
 */
function unfoldHorizontal(grid: Grid): Grid {
    const H_old = grid.length;
    const W_old = grid[0].length;
    const W_new = 2 * W_old;

    // Initialize the new grid with empty strings
    const newGrid: Grid = Array(H_old).fill(0).map(() => Array(W_new).fill(''));

    for (let r = 0; r < H_old; r++) {
        for (let c = 0; c < W_old; c++) {
            // Copy the original grid to the right half of the new grid
            newGrid[r][W_old + c] = grid[r][c];
            // Copy the horizontally mirrored content to the left half of the new grid
            // Column c in the original grid corresponds to column (W_old - 1 - c) in the mirrored left half.
            newGrid[r][W_old - 1 - c] = grid[r][c];
        }
    }
    return newGrid;
}

/**
 * Counts the number of connected components of '#' characters in a grid using BFS.
 * Cells are connected if they are horizontally or vertically adjacent.
 *
 * @param grid The grid to analyze.
 * @returns The total number of connected components.
 */
function countComponents(grid: Grid): number {
    const H = grid.length;
    if (H === 0) return 0; // Handle empty grid case
    const W = grid[0].length;
    if (W === 0) return 0; // Handle empty row case

    let components = 0;
    // Visited array to keep track of processed cells
    const visited: boolean[][] = Array(H).fill(0).map(() => Array(W).fill(false));

    // Directions for BFS (up, down, left, right)
    const dr = [-1, 1, 0, 0]; 
    const dc = [0, 0, -1, 1];

    // Iterate through each cell in the grid
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            // If the cell is paper ('#') and has not been visited yet, start a new BFS
            if (grid[r][c] === '#' && !visited[r][c]) {
                components++; // Found a new component
                const q: [number, number][] = []; // Queue for BFS
                q.push([r, c]);
                visited[r][c] = true;

                let head = 0; // Pointer for queue (more efficient than array.shift())
                while (head < q.length) {
                    const [currR, currC] = q[head++];

                    // Check all 4 adjacent neighbors
                    for (let i = 0; i < 4; i++) {
                        const newR = currR + dr[i];
                        const newC = currC + dc[i];

                        // Check if the neighbor is within grid bounds, is paper, and not visited
                        if (
                            newR >= 0 && newR < H &&
                            newC >= 0 && newC < W &&
                            grid[newR][newC] === '#' &&
                            !visited[newR][newC]
                        ) {
                            visited[newR][newC] = true;
                            q.push([newR, newC]); // Add to queue for further exploration
                        }
                    }
                }
            }
        }
    }

    return components;
}

// Read input N
const N: number = parseInt(readline());
// Read input W and H
const [W, H]: number[] = readline().split(' ').map(Number);

// Read the initial grid rows
let grid: Grid = [];
for (let i = 0; i < H; i++) {
    grid.push(readline().split(''));
}

// Determine the maximum number of unfolds to simulate.
// W, H are up to 100.
// 2^6 = 64, 2^7 = 128.
// If N is greater than or equal to 7, the grid dimensions (W*2^N, H*2^N) will be at least
// 100 * 128 = 12800. A 12800x12800 grid is about 160MB, which is manageable for simulation.
// For N > 7, the connectivity patterns are assumed to stabilize, meaning further unfolds
// will not change the number of components.
const N_simulate = Math.min(N, 7); 

// Perform the unfolding operations
for (let i = 0; i < N_simulate; i++) {
    grid = unfoldVertical(grid);
    grid = unfoldHorizontal(grid);
}

// Count and print the number of connected components in the final (or stabilized) grid
console.log(countComponents(grid));