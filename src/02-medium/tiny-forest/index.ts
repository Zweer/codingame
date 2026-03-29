// For CodinGame, readline() is a global function.
// In a local environment, you might need to import it or mock it.
declare function readline(): string;
declare function print(message: any): void; // Equivalent to console.log for CodinGame output

// Read input dimensions
const W: number = parseInt(readline());
const H: number = parseInt(readline());

// Initialize the grid based on input characters.
// -1: Represents a mature tree ('Y').
//  0: Represents an empty grass patch ('.').
//  1-10: Represents a seed ('X'), where the number indicates years remaining until it becomes a tree.
//        10 means it was just planted, 1 means it will mature next year.
const initialGrid: number[][] = [];
for (let i = 0; i < H; i++) {
    const row: string = readline();
    initialGrid.push(row.split('').map(char => (char === 'Y' ? -1 : 0)));
}

// Variable to store the maximum number of trees found across all starting positions
let maxTrees = 0;

/**
 * Creates a deep copy of a 2D number array (grid).
 * This is crucial to avoid modifying the grid for one simulation affecting others.
 * @param grid The 2D array to copy.
 * @returns A new 2D array with identical contents.
 */
function deepCopyGrid(grid: number[][]): number[][] {
    return grid.map(row => [...row]);
}

/**
 * Counts the number of mature trees (-1) in the given grid.
 * @param grid The grid to count trees from.
 * @returns The total count of mature trees.
 */
function countTrees(grid: number[][]): number {
    let count = 0;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === -1) { // -1 represents a mature tree
                count++;
            }
        }
    }
    return count;
}

// Define relative coordinates for checking 4 orthogonal neighbors (Up, Down, Left, Right)
const DR = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

// Iterate through every possible cell (startR, startC) to plant the initial seed
for (let startR = 0; startR < H; startR++) {
    for (let startC = 0; startC < W; startC++) {

        // Rule: A seed cannot be planted on a cell that already contains a mature tree ('Y').
        // If initialGrid[startR][startC] is -1, it means a tree already exists there.
        // Planting a seed there would either be ignored or replace the tree (which is suboptimal).
        // Therefore, we skip this starting position.
        if (initialGrid[startR][startC] === -1) {
            continue;
        }

        // Create a mutable copy of the initial grid for this specific simulation run.
        let currentGrid = deepCopyGrid(initialGrid);

        // Plant the initial seed at the chosen starting position.
        // It's a new seed, so it needs 10 years to mature.
        currentGrid[startR][startC] = 10;

        // Simulate the growth and reproduction over 33 years.
        // The loop runs 33 times, representing transitions from Year 0 to Year 1, ..., Year 32 to Year 33.
        for (let year = 0; year < 33; year++) {
            // This array will temporarily store coordinates where new seeds are produced by trees
            // during the *current* year's tree reproduction phase.
            const seedsToPlantThisTurn: [number, number][] = [];

            // Step 1: Trees produce new seeds. This phase uses the state of the grid at the beginning of the current year.
            for (let r = 0; r < H; r++) {
                for (let c = 0; c < W; c++) {
                    if (currentGrid[r][c] === -1) { // If it's a mature tree
                        // Check all 4 orthogonal neighbors
                        for (let i = 0; i < 4; i++) {
                            const nr = r + DR[i];
                            const nc = c + DC[i];

                            // Ensure the neighbor cell is within the grid boundaries
                            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                                // A new seed can only be planted if the target spot is currently empty (0).
                                // If it's already a seed or another tree, no new seed is placed there.
                                if (currentGrid[nr][nc] === 0) {
                                    seedsToPlantThisTurn.push([nr, nc]);
                                }
                            }
                        }
                    }
                }
            }

            // Create the grid for the *next* year. We start by copying the current year's state.
            const nextGrid = deepCopyGrid(currentGrid);

            // Step 2: Existing seeds age and potentially mature into trees.
            // This happens before any new seeds from Step 1 are actually placed.
            for (let r = 0; r < H; r++) {
                for (let c = 0; c < W; c++) {
                    if (nextGrid[r][c] >= 1 && nextGrid[r][c] <= 10) { // If the cell contains a seed
                        nextGrid[r][c]--; // Decrement the years remaining for this seed
                        if (nextGrid[r][c] === 0) {
                            // If years remaining becomes 0, the seed matures into a tree.
                            nextGrid[r][c] = -1; 
                        }
                    }
                }
            }

            // Step 3: Plant the new seeds identified in Step 1.
            // These seeds are added to the `nextGrid`.
            for (const [r, c] of seedsToPlantThisTurn) {
                // A new seed is planted only if the spot is still empty (0)
                // *after* Step 2 (i.e., after existing seeds have aged or matured).
                // This ensures that a maturing seed takes precedence over a newly generated one.
                if (nextGrid[r][c] === 0) {
                    nextGrid[r][c] = 10; // Plant the new seed (needs 10 years to mature)
                }
            }
            
            // The `currentGrid` for the next iteration of the loop becomes the `nextGrid` we just calculated.
            currentGrid = nextGrid;
        }

        // After 33 years of simulation for this specific starting seed position,
        // count the number of mature trees in the final grid.
        const currentTrees = countTrees(currentGrid);
        
        // Update the overall maximum number of trees if this simulation yielded a better result.
        if (currentTrees > maxTrees) {
            maxTrees = currentTrees;
        }
    }
}

// Output the maximum number of trees found across all possible starting positions.
console.log(maxTrees);