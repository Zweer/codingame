// Global variables for the grid size and the grids themselves.
// These are declared globally to be accessible by all functions in the solution.
let n: number; // Stores the size of the square grid
let originalGrid: number[][]; // Stores the initial numbers from the input
let solutionGrid: (number | '*')[][]; // Stores the current state of the grid during backtracking,
                                     // where cells can be numbers or '*' for shaded.

/**
 * Main function to solve the Hitori puzzle.
 * Reads input, initializes the grid, calls the backtracking solver, and prints the result.
 */
function solveHitoriPuzzle(): string[] {
    // Read the size of the grid from the first line of input.
    n = parseInt(readline());

    // Read the content of the original grid.
    // Each line is split into characters, and each character is converted to a number.
    originalGrid = [];
    for (let i = 0; i < n; i++) {
        originalGrid.push(readline().split('').map(Number));
    }

    // Initialize the solution grid with the numbers from the original grid.
    // By default, all cells are considered unshaded initially.
    // This grid will be modified by the backtracking algorithm.
    solutionGrid = Array(n).fill(0).map((_, r) => Array(n).fill(0).map((_, c) => originalGrid[r][c]));

    // Start the backtracking process from the top-left cell (0, 0).
    // If a solution is found, the `backtrack` function will return true.
    if (backtrack(0, 0)) {
        // If a solution is found, convert the `solutionGrid` to an array of strings
        // where each row is joined to form a string, and return it.
        return solutionGrid.map(row => row.join(''));
    } else {
        // This case should ideally not be reached for valid Hitori puzzles provided by CodinGame,
        // as a solution is always expected to exist.
        return ["No solution found"];
    }
}

/**
 * Recursive backtracking function to explore possible solutions for the Hitori puzzle.
 * It tries two options for each cell: keep it unshaded or shade it.
 *
 * @param r The current row index being processed.
 * @param c The current column index being processed.
 * @returns True if a valid solution is found from this state onward, false otherwise.
 */
function backtrack(r: number, c: number): boolean {
    // Base Case: If we have processed all cells (i.e., 'r' has gone beyond the last row index 'n-1').
    if (r === n) {
        // A complete grid configuration has been formed. Now, validate it against all Hitori rules.
        return isValidSolution();
    }

    // Calculate the coordinates of the next cell to process.
    // If at the end of the current row, move to the beginning of the next row.
    // Otherwise, move to the next column in the current row.
    const nextR = (c === n - 1) ? r + 1 : r;
    const nextC = (c === n - 1) ? 0 : c + 1;

    // --- Option 1: Keep the current cell (r, c) unshaded ---
    // The `solutionGrid[r][c]` already holds its `originalGrid[r][c]` value from initialization
    // or from a previous backtracking step that restored it. No explicit change is needed here.
    // Recursively call `backtrack` for the next cell.
    if (backtrack(nextR, nextC)) {
        return true; // If a solution is found down this path, propagate true upwards.
    }

    // --- Option 2: Shade the current cell (r, c) with '*' ---
    // Pruning Optimization (Rule 2: No Adjacent Shaded Squares):
    // Before actually shading the cell, check if placing a '*' at (r, c) would
    // immediately violate Rule 2 with any already shaded (top or left) neighbors.
    // We only check top (r-1, c) and left (r, c-1) because those are the only cells
    // that would have been processed and potentially shaded *before* the current cell (r,c)
    // in our row-by-row, column-by-column traversal order.
    if (
        (r > 0 && solutionGrid[r - 1][c] === '*') || // Check top neighbor
        (c > 0 && solutionGrid[r][c - 1] === '*')    // Check left neighbor
    ) {
        // If shading this cell violates Rule 2 with an already placed shaded neighbor,
        // this path is invalid. Do not proceed with this option.
        // At this point, `solutionGrid[r][c]` is still its original number from Option 1's failure,
        // so no restoration is needed before returning.
        return false;
    }

    // If it's safe to shade based on immediate (already processed) neighbors:
    // 1. Store the original value of the current cell. This is crucial for backtracking later.
    const originalValueAtCell = solutionGrid[r][c];
    // 2. Make the choice: shade this cell.
    solutionGrid[r][c] = '*';

    // 3. Recursively call `backtrack` for the next cell.
    if (backtrack(nextR, nextC)) {
        return true; // If a solution is found down this path, propagate true upwards.
    }

    // Backtrack Step: If Option 2 (shading the cell) did not lead to a solution,
    // we must undo this choice. Restore the cell state back to its original (unshaded) number.
    solutionGrid[r][c] = originalValueAtCell;

    // If neither Option 1 nor Option 2 led to a solution from this cell's state,
    // return false to signal failure to the previous recursive call.
    return false;
}

/**
 * Validates a complete grid configuration against all three Hitori rules.
 * This function is called only when the `backtrack` function successfully assigns a state to all cells.
 *
 * @returns True if the current `solutionGrid` state is a valid Hitori solution, false otherwise.
 */
function isValidSolution(): boolean {
    // --- Rule 1: No number appears more than once in any row or column (for unshaded cells). ---
    // Check rows:
    for (let r = 0; r < n; r++) {
        const rowNumbers = new Set<number>(); // Use a Set to easily check for duplicates.
        for (let c = 0; c < n; c++) {
            if (solutionGrid[r][c] !== '*') { // Only consider unshaded cells for this rule.
                const num = solutionGrid[r][c] as number; // Type assertion: we know it's a number if not '*'.
                if (rowNumbers.has(num)) {
                    return false; // Duplicate found in this row, so the solution is invalid.
                }
                rowNumbers.add(num);
            }
        }
    }

    // Check columns:
    for (let c = 0; c < n; c++) {
        const colNumbers = new Set<number>(); // Use a Set to easily check for duplicates.
        for (let r = 0; r < n; r++) {
            if (solutionGrid[r][c] !== '*') { // Only consider unshaded cells for this rule.
                const num = solutionGrid[r][c] as number;
                if (colNumbers.has(num)) {
                    return false; // Duplicate found in this column, so the solution is invalid.
                }
                colNumbers.add(num);
            }
        }
    }

    // --- Rule 2: Shaded squares do not touch each other vertically or horizontally. ---
    // Iterate through all cells. If a cell is shaded, check all its four cardinal neighbors.
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (solutionGrid[r][c] === '*') { // If the current cell is shaded.
                // Check its top neighbor.
                if (r > 0 && solutionGrid[r - 1][c] === '*') return false;
                // Check its bottom neighbor.
                if (r < n - 1 && solutionGrid[r + 1][c] === '*') return false;
                // Check its left neighbor.
                if (c > 0 && solutionGrid[r][c - 1] === '*') return false;
                // Check its right neighbor.
                if (c < n - 1 && solutionGrid[r][c + 1] === '*') return false;
            }
        }
    }

    // --- Rule 3: All un-shaded squares create a single continuous area. ---
    // First, find any unshaded cell to serve as a starting point for checking connectivity.
    let startR = -1, startC = -1;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (solutionGrid[r][c] !== '*') { // If an unshaded cell is found.
                startR = r;
                startC = c;
                break; // Exit inner loop.
            }
        }
        if (startR !== -1) break; // Exit outer loop once a starting point is found.
    }

    // If no unshaded cells were found in the grid (meaning the entire grid is shaded),
    // it is trivially considered connected.
    if (startR === -1) {
        return true;
    }

    // Perform a Breadth-First Search (BFS) to traverse all reachable unshaded cells.
    const visited = Array(n).fill(0).map(() => Array(n).fill(false)); // Keeps track of visited cells during BFS.
    const queue: [number, number][] = [[startR, startC]]; // BFS queue, storing [row, col] tuples.
    visited[startR][startC] = true; // Mark the starting cell as visited.
    let connectedCount = 0; // Counts the number of unshaded cells reachable from the start.

    // Define directions for moving to adjacent cells (Up, Down, Left, Right).
    const dr = [-1, 1, 0, 0]; // Row offsets
    const dc = [0, 0, -1, 1]; // Column offsets

    while (queue.length > 0) {
        const [currR, currC] = queue.shift()!; // Dequeue the current cell.
        connectedCount++; // Increment count as we process a reachable unshaded cell.

        // Explore all four cardinal neighbors of the current cell.
        for (let i = 0; i < 4; i++) {
            const newR = currR + dr[i];
            const newC = currC + dc[i];

            // Check if the neighbor is within grid boundaries, is unshaded, and has not been visited yet.
            if (newR >= 0 && newR < n && newC >= 0 && newC < n &&
                solutionGrid[newR][newC] !== '*' && !visited[newR][newC]) {
                visited[newR][newC] = true; // Mark neighbor as visited.
                queue.push([newR, newC]); // Enqueue neighbor for future exploration.
            }
        }
    }

    // Count the total number of unshaded cells in the entire `solutionGrid`.
    let totalUnshadedCount = 0;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (solutionGrid[r][c] !== '*') {
                totalUnshadedCount++;
            }
        }
    }

    // The unshaded area is continuous if and only if the count of reachable unshaded cells
    // (from the BFS) equals the total count of unshaded cells in the grid.
    return connectedCount === totalUnshadedCount;
}

// Execute the solver function and print each row of the solved grid.
const solvedGrid = solveHitoriPuzzle();
solvedGrid.forEach(row => console.log(row));