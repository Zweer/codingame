// Define readline and print functions for CodinGame environment.
// In a typical Node.js environment, readline would come from 'readline' module
// and print would be console.log. CodinGame injects these globally.
declare function readline(): string;
declare function print(message: any): void; // Equivalent to console.log

// Read the highest value N on the dominoes.
const n: number = parseInt(readline());

// Read the height H and width W of the grid.
const [h, w]: number[] = readline().split(' ').map(Number);

// Initialize the grid with input values.
const gridValues: number[][] = [];
for (let i = 0; i < h; i++) {
    gridValues.push(readline().split('').map(Number));
}

// Global state variables used by the recursive solver:

// 'covered' is a 2D boolean array that tracks which grid cells have been covered by a domino.
const covered: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));

// 'solution' is a 2D string array that will store the final orientation of dominoes.
// '=' for horizontal, '|' for vertical.
const solution: string[][] = Array.from({ length: h }, () => Array(w).fill(''));

// 'usedDominoes' is a Set to keep track of which unique domino pairs (e.g., "0-1", "2-2")
// have already been placed on the grid. This ensures each domino type is used exactly once.
const usedDominoes: Set<string> = new Set<string>();

/**
 * Generates a canonical string key for a domino pair (val1, val2).
 * This ensures that pairs like (0,1) and (1,0) always result in the same key ("0-1"),
 * which is crucial for correctly tracking unique dominoes in the `usedDominoes` set.
 * @param val1 The first value of the domino.
 * @param val2 The second value of the domino.
 * @returns A string representing the canonical key for the domino (e.g., "minVal-maxVal").
 */
function getDominoKey(val1: number, val2: number): string {
    return `${Math.min(val1, val2)}-${Math.max(val1, val2)}`;
}

/**
 * Finds the coordinates of the first (top-leftmost) uncovered cell in the grid.
 * This function is used to determine the starting point for placing the next domino
 * in the backtracking search.
 * @returns An array [row, col] of the first uncovered cell, or null if all cells are covered.
 */
function findNextUncoveredCell(): [number, number] | null {
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (!covered[r][c]) {
                return [r, c]; // Found an uncovered cell
            }
        }
    }
    return null; // All cells are covered
}

/**
 * The main recursive backtracking function to solve the domino puzzle.
 * It attempts to place dominoes one by one, exploring possibilities.
 * Since the problem guarantees a unique solution, the first valid arrangement found will be the answer.
 * @returns true if a complete and valid solution is found, false otherwise (triggering backtracking).
 */
function solve(): boolean {
    const nextCell = findNextUncoveredCell();

    // Base case: If no uncovered cells are found, it means all cells are covered
    // by valid dominoes, so a complete solution has been found.
    if (nextCell === null) {
        return true;
    }

    const [r, c] = nextCell; // Current cell to try and place a domino from
    const val1 = gridValues[r][c]; // The numerical value at the current cell

    // --- Attempt to place a domino horizontally ---
    // Check if placing a domino to the right is possible:
    // 1. The cell to the right (c + 1) must be within the grid's width boundary.
    // 2. The cell to the right must not already be covered by another domino.
    if (c + 1 < w && !covered[r][c + 1]) {
        const val2 = gridValues[r][c + 1]; // Value of the cell to the right
        const key = getDominoKey(val1, val2); // Get the canonical key for this potential domino

        // Check if this specific domino type has not been used yet in the solution.
        if (!usedDominoes.has(key)) {
            // Tentatively place the domino:
            covered[r][c] = true;
            covered[r][c + 1] = true;
            solution[r][c] = '='; // Mark horizontal orientation for both cells
            solution[r][c + 1] = '=';
            usedDominoes.add(key); // Add this domino to the set of used ones

            // Recursively call solve for the next uncovered cell.
            if (solve()) {
                return true; // If the recursive call finds a solution, propagate true upwards.
            }

            // Backtrack: If the recursive call did not find a solution down this path,
            // undo the tentative placement to try other options.
            usedDominoes.delete(key); // Remove the domino from the used set
            solution[r][c] = ''; // Clear orientation markers
            solution[r][c + 1] = '';
            covered[r][c] = false; // Mark cells as uncovered again
            covered[r][c + 1] = false;
        }
    }

    // --- Attempt to place a domino vertically ---
    // Check if placing a domino downwards is possible:
    // 1. The cell below (r + 1) must be within the grid's height boundary.
    // 2. The cell below must not already be covered by another domino.
    if (r + 1 < h && !covered[r + 1][c]) {
        const val2 = gridValues[r + 1][c]; // Value of the cell below
        const key = getDominoKey(val1, val2); // Get the canonical key for this potential domino

        // Check if this specific domino type has not been used yet.
        if (!usedDominoes.has(key)) {
            // Tentatively place the domino:
            covered[r][c] = true;
            covered[r + 1][c] = true;
            solution[r][c] = '|'; // Mark vertical orientation for both cells
            solution[r + 1][c] = '|';
            usedDominoes.add(key); // Add this domino to the set of used ones

            // Recursively call solve for the next uncovered cell.
            if (solve()) {
                return true; // If the recursive call finds a solution, propagate true upwards.
            }

            // Backtrack: If the recursive call did not find a solution, undo the placement.
            usedDominoes.delete(key); // Remove the domino from the used set
            solution[r][c] = ''; // Clear orientation markers
            solution[r + 1][c] = '';
            covered[r][c] = false; // Mark cells as uncovered again
            covered[r + 1][c] = false;
        }
    }

    // If neither horizontal nor vertical placement from the current cell leads to a valid solution,
    // this path is invalid. Return false to trigger backtracking in the calling function.
    return false;
}

// Start the domino solving process.
// The `solve()` function will modify the `solution` global array.
solve();

// Output the final solution grid.
// Iterate through each row of the 'solution' array, join the characters to form a string,
// and print it to the console (which is mapped to `print` in CodinGame).
for (let r = 0; r < h; r++) {
    console.log(solution[r].join(''));
}