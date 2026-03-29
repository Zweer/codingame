// Standard input/output for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

const GRID_SIZE = 5;

// Directions for neighbors (8 directions: horizontal, vertical, diagonal)
// DR and DC represent changes in row and column indices respectively.
const DR = [-1, -1, -1, 0, 0, 1, 1, 1];
const DC = [-1, 0, 1, -1, 1, -1, 0, 1];

// Global variable to store the unique solution once it's found.
// Initialized to null, will hold number[][] when a solution is confirmed.
let solutionGrid: number[][] | null = null;

/**
 * Gets the coordinates of all direct neighbors (horizontal, vertical, diagonal) of a given cell.
 * Handles grid boundaries, ensuring neighbors are within the 5x5 grid.
 * @param r The row index of the cell.
 * @param c The column index of the cell.
 * @returns An array of {r: number, c: number} objects representing neighbor coordinates.
 */
function getNeighbors(r: number, c: number): { r: number, c: number }[] {
    const neighbors: { r: number, c: number }[] = [];
    for (let i = 0; i < DR.length; i++) {
        const nr = r + DR[i]; // Neighbor row
        const nc = c + DC[i]; // Neighbor column
        // Check if neighbor coordinates are within grid boundaries (0 to GRID_SIZE-1)
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            neighbors.push({ r: nr, c: nc });
        }
    }
    return neighbors;
}

/**
 * Recursive backtracking function to solve the Neighbor-Sum Grid puzzle.
 * It attempts to fill the grid cell by cell, respecting the rules.
 * @param grid The current state of the 5x5 grid. Cells with 0 are empty.
 * @param usedNumbers A boolean array tracking which numbers (1-25) have already been placed in the grid.
 *                    usedNumbers[0] is unused, indices 1-25 correspond to the numbers.
 * @returns true if a solution is found during this path of exploration, false otherwise.
 */
function solve(grid: number[][], usedNumbers: boolean[]): boolean {
    // Optimization: If a solution has already been found by another branch,
    // immediately return true to stop further exploration.
    if (solutionGrid !== null) {
        return true;
    }

    let emptyR = -1; // Row of the next empty cell
    let emptyC = -1; // Column of the next empty cell

    // Find the next empty cell (value 0) in row-major order (top-left to bottom-right)
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) {
                emptyR = r;
                emptyC = c;
                break; // Found an empty cell, stop searching
            }
        }
        if (emptyR !== -1) break; // Stop outer loop if an empty cell was found
    }

    // Base Case: If no empty cells are found (emptyR remains -1), the grid is full.
    if (emptyR === -1) {
        // Now, validate the complete grid against the neighbor-sum rule.
        // This is the final and definitive validation step.
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cellValue = grid[r][c];
                // The rule applies only to values that are at least 3.
                if (cellValue >= 3) {
                    const neighbors = getNeighbors(r, c);
                    // Get the actual values of the neighbors from the current grid state.
                    const neighborValues: number[] = neighbors.map(n => grid[n.r][n.c]);

                    let foundSum = false;
                    // Check all distinct pairs of neighbor values (i.e., (val1, val2) where val1 != val2)
                    // We iterate i from 0 to length-1 and j from i+1 to length-1 to get distinct pairs.
                    for (let i = 0; i < neighborValues.length; i++) {
                        for (let j = i + 1; j < neighborValues.length; j++) {
                            if (neighborValues[i] + neighborValues[j] === cellValue) {
                                foundSum = true;
                                break; // Found a valid sum for this cell, move to the next cell.
                            }
                        }
                        if (foundSum) break;
                    }
                    if (!foundSum) {
                        // If no pair of neighbors sums up to cellValue, this complete grid is invalid.
                        return false;
                    }
                }
            }
        }
        // If all cells satisfy the neighbor-sum rule, this is a valid solution.
        // Since a unique solution is guaranteed, this is THE solution.
        solutionGrid = grid.map(row => [...row]); // Store a deep copy of the grid.
        return true;
    }

    // Recursive Step: Try placing numbers in the current empty cell (emptyR, emptyC).
    // Iterate through all possible numbers from 1 to 25.
    for (let val = 1; val <= 25; val++) {
        if (!usedNumbers[val]) { // Check if the number 'val' hasn't been used yet.
            grid[emptyR][emptyC] = val; // Place the number in the current empty cell.
            usedNumbers[val] = true;    // Mark 'val' as used.

            // Pruning Step: Perform an immediate partial validation.
            // Check if placing 'val' makes any currently filled cell (including 'val' itself)
            // invalid IF all its neighbors are now filled.
            let isCurrentStateValid = true;
            // The cells that might need a validity check due to this new placement are:
            // 1. The newly placed cell itself ((emptyR, emptyC)).
            // 2. All its direct neighbors (because their set of neighbors now includes 'val').
            const cellsToPotentiallyCheck = [{ r: emptyR, c: emptyC }, ...getNeighbors(emptyR, emptyC)];

            for (const { r, c } of cellsToPotentiallyCheck) {
                const cellValue = grid[r][c];
                // Skip if the cell is still empty (0) or if the rule doesn't apply (value < 3).
                if (cellValue === 0 || cellValue < 3) continue;

                const neighborsOfCurrentCell = getNeighbors(r, c);
                let allNeighborsFilled = true;
                const neighborValues: number[] = [];

                // Check if ALL neighbors of the current cell (r, c) are now filled.
                for (const { r: nr, c: nc } of neighborsOfCurrentCell) {
                    if (grid[nr][nc] === 0) { // Found an empty neighbor
                        allNeighborsFilled = false;
                        break; // Cannot perform full check for this cell yet.
                    }
                    neighborValues.push(grid[nr][nc]);
                }

                // If all neighbors are filled, we can fully check this cell's rule.
                if (allNeighborsFilled) {
                    let canFormSum = false;
                    // A cell needs at least two distinct neighbors to form a sum.
                    if (neighborValues.length >= 2) {
                        for (let i = 0; i < neighborValues.length; i++) {
                            for (let j = i + 1; j < neighborValues.length; j++) {
                                if (neighborValues[i] + neighborValues[j] === cellValue) {
                                    canFormSum = true;
                                    break;
                                }
                            }
                            if (canFormSum) break;
                        }
                    }
                    if (!canFormSum) {
                        // This cell (r, c) fails the neighbor-sum rule even though all its neighbors are filled.
                        // This means the current path is invalid; prune it.
                        isCurrentStateValid = false;
                        break; // Stop checking other cells in cellsToPotentiallyCheck.
                    }
                }
            }

            if (isCurrentStateValid) {
                // If the current state (after placing 'val' and pruning checks) is valid,
                // proceed with the recursive call for the next empty cell.
                if (solve(grid, usedNumbers)) {
                    return true; // A solution was found down this path.
                }
            }

            // Backtrack: If the recursive call did not find a solution, or if the current
            // state was determined to be invalid by the pruning step, undo the placement.
            grid[emptyR][emptyC] = 0;    // Reset the cell to empty.
            usedNumbers[val] = false; // Mark 'val' as unused again.
        }
    }

    // If no valid number could be placed in (emptyR, emptyC) for this path, return false.
    return false;
}

// Main execution function for CodinGame.
// This function reads input, initializes the state, calls the solver, and prints the output.
function main() {
    const initialGrid: number[][] = [];
    // usedNumbers[0] is not used, indices 1-25 correspond to numbers 1-25.
    const usedNumbers = new Array(26).fill(false);

    // Read the 5 lines of input to build the initial grid.
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = readline().split(' ').map(Number);
        initialGrid.push(row);
        // Mark any pre-filled numbers in the input as used.
        for (const num of row) {
            if (num !== 0) {
                usedNumbers[num] = true;
            }
        }
    }

    // Start the backtracking search from the initial state.
    solve(initialGrid, usedNumbers);

    // Output the found solution.
    // Given the problem constraints, solutionGrid should always be non-null.
    if (solutionGrid) {
        for (let r = 0; r < GRID_SIZE; r++) {
            print(solutionGrid[r].join(' ')); // Print each row space-separated.
        }
    } else {
        // This case should ideally not be reached based on problem guarantees.
        print("Error: No solution found.");
    }
}

// Call the main function to start the program execution in the CodinGame environment.
main();