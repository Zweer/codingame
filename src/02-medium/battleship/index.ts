// For CodinGame environment, `readline` and `print` are usually globally available.
// In TypeScript, these might need to be declared.
declare function readline(): string;
declare function print(message: any): void; // CodinGame usually uses print() for output

// Define an interface for a Ship object to store its properties
interface Ship {
    cells: [number, number][]; // Coordinates of all cells belonging to this ship
    size: number;           // Total length of the ship (intact + destroyed parts)
    intactCount: number;    // Number of '+' cells in the ship
    destroyedCount: number; // Number of '_' cells in the ship
}

// --- Input Parsing ---

// Read the shot coordinates (e.g., "A1", "J10")
const shotInput = readline();
const shotColChar = shotInput[0];
const shotRowStr = shotInput.substring(1);

// Convert shot coordinates to 0-indexed values
const shotR = parseInt(shotRowStr) - 1; // Row: '1' -> 0, '10' -> 9
const shotC = shotColChar.charCodeAt(0) - 'A'.charCodeAt(0); // Column: 'A' -> 0, 'J' -> 9

// Read the 10x10 grid
const grid: string[][] = [];
for (let i = 0; i < 10; i++) {
    grid.push(readline().split('')); // Split each line into an array of characters
}

// --- Data Structures for Ship Identification ---
const ships: Ship[] = []; // Array to store all identified ships
// 2D array to keep track of visited cells during BFS/DFS, preventing re-processing
const visited: boolean[][] = Array(10).fill(null).map(() => Array(10).fill(false));

// --- Helper Function ---
// Checks if given row and column coordinates are within the 10x10 grid bounds
function isInBounds(r: number, c: number): boolean {
    return r >= 0 && r < 10 && c >= 0 && c < 10;
}

// --- Grid Validation (Part 1: Diagonal Adjacency Check) ---
// Ships cannot touch each other diagonally. This means if any cell (intact or destroyed)
// is part of a ship, its diagonal neighbors cannot also be part of a ship.
const DR_DIAGONAL = [-1, -1, 1, 1]; // Relative row changes for diagonal neighbors
const DC_DIAGONAL = [-1, 1, -1, 1]; // Relative column changes for diagonal neighbors

for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
        // If the current cell is part of a ship (either intact '+' or destroyed '_')
        if (grid[r][c] === '+' || grid[r][c] === '_') {
            // Check all 4 diagonal neighbors
            for (let i = 0; i < DR_DIAGONAL.length; i++) {
                const nr = r + DR_DIAGONAL[i];
                const nc = c + DC_DIAGONAL[i];
                // If a diagonal neighbor is within bounds AND is also a ship part
                if (isInBounds(nr, nc) && (grid[nr][nc] === '+' || grid[nr][nc] === '_')) {
                    console.log("INVALID"); // Found invalid diagonal adjacency
                    // In CodinGame, console.log followed by process.exit(0) is a common way to terminate.
                    // If not using Node.js, simply returning after print might be sufficient.
                    process.exit(0);
                }
            }
        }
    }
}

// --- Grid Validation (Part 2: Ship Identification using BFS/DFS) ---
// Identify ships by grouping cardinally connected '+' or '_' cells.
const DR_CARDINAL = [-1, 1, 0, 0]; // Relative row changes for cardinal (horizontal/vertical) neighbors
const DC_CARDINAL = [0, 0, -1, 1]; // Relative column changes for cardinal neighbors

for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
        // If we find an unvisited cell that is part of a ship (intact or destroyed)
        // it means we've found the starting point of a new, unidentified ship.
        if ((grid[r][c] === '+' || grid[r][c] === '_') && !visited[r][c]) {
            const currentShipCells: [number, number][] = []; // To store cells of the current ship
            const queue: [number, number][] = [[r, c]]; // BFS queue, starting with the current cell
            visited[r][c] = true; // Mark the starting cell as visited
            let intactCount = 0;
            let destroyedCount = 0;

            // Perform BFS to find all connected parts of this ship
            while (queue.length > 0) {
                const [currR, currC] = queue.shift()!; // Dequeue the current cell
                currentShipCells.push([currR, currC]); // Add it to the ship's cells list

                // Update intact/destroyed counts based on the cell's status
                if (grid[currR][currC] === '+') {
                    intactCount++;
                } else if (grid[currR][currC] === '_') {
                    destroyedCount++;
                }

                // Explore all 4 cardinal neighbors
                for (let i = 0; i < DR_CARDINAL.length; i++) {
                    const nextR = currR + DR_CARDINAL[i];
                    const nextC = currC + DC_CARDINAL[i];

                    // If a neighbor is within bounds, is a ship part, and hasn't been visited yet
                    if (isInBounds(nextR, nextC) && (grid[nextR][nextC] === '+' || grid[nextR][nextC] === '_') && !visited[nextR][nextC]) {
                        visited[nextR][nextC] = true; // Mark the neighbor as visited
                        queue.push([nextR, nextC]); // Enqueue the neighbor for further exploration
                    }
                }
            }
            // After BFS completes, all connected cells of this ship have been found.
            const shipSize = intactCount + destroyedCount; // Total size of the ship
            ships.push({
                cells: currentShipCells,
                size: shipSize,
                intactCount: intactCount,
                destroyedCount: destroyedCount
            });
        }
    }
}

// --- Grid Validation (Part 3: Ship Count and Size Check) ---
const shipCounts: Record<number, number> = {}; // Map to store counts of each ship size found
for (const ship of ships) {
    shipCounts[ship.size] = (shipCounts[ship.size] || 0) + 1;
}

// Define the expected types of ships and their required counts
const expectedShipCounts: Map<number, number> = new Map([
    [5, 1], // Aircraft carrier (size 5, 1 copy)
    [4, 1], // Cruiser (size 4, 1 copy)
    [3, 2], // Counter-torpedoist and Submarine (both size 3, total 2 copies)
    [2, 1]  // Torpedoist (size 2, 1 copy)
]);

let isValidGrid = true;

// Check if all required ship sizes are present with their correct counts
for (const [size, count] of expectedShipCounts.entries()) {
    if (shipCounts[size] !== count) {
        isValidGrid = false;
        break; // Found a mismatch, grid is invalid
    }
}

// Additionally, verify that the total number of ships identified matches the total expected ships.
// This catches cases where there might be extra ships of sizes not explicitly listed in `expectedShipCounts`.
let totalExpectedShips = 0;
for (const count of expectedShipCounts.values()) {
    totalExpectedShips += count;
}
if (ships.length !== totalExpectedShips) {
    isValidGrid = false;
}

// If the grid is invalid based on ship counts or sizes, print "INVALID" and exit.
if (!isValidGrid) {
    console.log("INVALID");
    process.exit(0);
}

// --- Analyze the Sister's Shot (Only if grid is valid) ---
let output = ""; // This string will store the final output message
let hitShip: Ship | undefined = undefined; // Reference to the ship that was hit/touched

// Get the type of cell at the shot coordinates
const shotCellType = grid[shotR][shotC];

if (shotCellType === '.') {
    // If the shot hits water
    output = "MISSED";
} else { // The shot hit a ship part (either '+' or '_')
    // Find the specific ship object that contains the shot coordinates
    for (const ship of ships) {
        if (ship.cells.some(cell => cell[0] === shotR && cell[1] === shotC)) {
            hitShip = ship;
            break; // Found the ship
        }
    }

    // This should ideally always find a ship if shotCellType is '+' or '_',
    // as all ship parts were identified and stored during grid validation.
    if (!hitShip) {
        // Fallback for an unexpected state or logic error (should not be reached in a valid game)
        console.error("Error: Shot landed on a ship cell but no corresponding ship object was found.");
        console.log("INVALID"); // Treat as an invalid game state
        process.exit(0);
    }

    if (shotCellType === '+') {
        // The shot hit an intact part of a ship, which is a new hit.
        hitShip.intactCount--;     // Decrement the count of intact cells for this ship
        hitShip.destroyedCount++;  // Increment the count of destroyed cells

        output = "TOUCHE"; // The ship was touched
        if (hitShip.intactCount === 0) {
            // If all parts of this ship are now destroyed, it's sunk.
            output = `TOUCHE COULE ${hitShip.size}`;
        }
    } else { // shotCellType === '_' (The shot landed on an already destroyed part of a ship)
        // According to the rules: "if it touches one of your ships, return TOUCHE."
        // An '_' cell is still considered part of a ship, so it's a "touch."
        // However, it doesn't change the ship's state (intact/destroyed counts) or cause sinking.
        output = "TOUCHE";
    }
}

// --- Check for Game Over (LOSE condition) ---
let allShipsSunk = true;
for (const ship of ships) {
    if (ship.intactCount > 0) { // If any ship still has intact parts, the game is not over
        allShipsSunk = false;
        break;
    }
}

// If all ships are sunk after the current shot, append " THEN LOSE" to the output
if (allShipsSunk) {
    output += " THEN LOSE";
}

// --- Final Output ---
console.log(output);