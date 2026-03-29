// Define readline for CodinGame environment. This is typically provided by the CodinGame runner.
declare function readLine(): string;

// Read the spiral size N
const n: number = parseInt(readLine());

// Read the starting point: v (top 't' / bottom 'b'), h (left 'l' / right 'r')
const [v, h] = readLine().split(' ');

// Read the order of numbers (ascending '+' / descending '-'), and direction of spiral (clockwise 'c' / counter-clockwise 'cc')
const [order, direction] = readLine().split(' ');

// Initialize the grid with zeros. A 2D array of size n x n.
// Using `fill(0).map(() => new Array(n).fill(0))` ensures deep initialization for rows.
const grid: number[][] = new Array(n).fill(0).map(() => new Array(n).fill(0));

// Determine the starting number and the increment/decrement value for numbers
let currentNum: number;
let numIncrement: number;

if (order === '+') {
    currentNum = 1;
    numIncrement = 1;
} else { // order === '-' (descending)
    currentNum = n * n; // Descending order starts with n*n at the specified corner
    numIncrement = -1;
}

// Determine the initial row and column based on the starting point (v, h)
let currentRow: number;
let currentCol: number;

if (v === 't') {
    currentRow = 0;
} else { // v === 'b'
    currentRow = n - 1;
}

if (h === 'l') {
    currentCol = 0;
} else { // h === 'r'
    currentCol = n - 1;
}

// Define direction vectors for (Right, Down, Left, Up) movements
// dr: delta row, dc: delta column
// These arrays define the change in (row, col) for each of the four cardinal directions.
// Index 0: Right (0, +1)
// Index 1: Down (+1, 0)
// Index 2: Left (0, -1)
// Index 3: Up (-1, 0)
const dr: number[] = [0, 1, 0, -1]; // Row changes for: Right, Down, Left, Up
const dc: number[] = [1, 0, -1, 0]; // Column changes for: Right, Down, Left, Up

// Determine the initial direction index (0:Right, 1:Down, 2:Left, 3:Up)
let dirIndex: number;

// The initial direction depends on the starting corner and the overall spiral direction.
// This logic ensures the first step taken by the spiral is correct for the given configuration.
if (direction === 'c') { // Clockwise spiral
    if (v === 't' && h === 'l') { // Top-Left corner
        dirIndex = 0; // Start moving Right (R -> D -> L -> U)
    } else if (v === 't' && h === 'r') { // Top-Right corner
        dirIndex = 1; // Start moving Down (D -> L -> U -> R)
    } else if (v === 'b' && h === 'l') { // Bottom-Left corner
        dirIndex = 3; // Start moving Up (U -> R -> D -> L)
    } else { // Bottom-Right corner
        dirIndex = 2; // Start moving Left (L -> U -> R -> D)
    }
} else { // Counter-clockwise spiral
    if (v === 't' && h === 'l') { // Top-Left corner
        dirIndex = 1; // Start moving Down (D -> R -> U -> L)
    } else if (v === 't' && h === 'r') { // Top-Right corner
        dirIndex = 2; // Start moving Left (L -> D -> R -> U)
    } else if (v === 'b' && h === 'l') { // Bottom-Left corner
        dirIndex = 0; // Start moving Right (R -> U -> L -> D)
    } else { // Bottom-Right corner
        dirIndex = 3; // Start moving Up (U -> L -> D -> R)
    }
}

// Fill the spiral grid
// Loop n*n times to fill all cells in the grid.
for (let i = 0; i < n * n; i++) {
    // Place the current number in the current cell.
    grid[currentRow][currentCol] = currentNum;
    // Move to the next number in sequence for the next cell.
    currentNum += numIncrement;

    // Calculate the potential next position based on the current direction.
    let nextRow = currentRow + dr[dirIndex];
    let nextCol = currentCol + dc[dirIndex];

    // Check if the potential next position is out of bounds OR if the cell is already filled.
    // If either condition is true, it means we've hit a boundary or a visited cell,
    // so we need to change direction (perform a turn).
    if (nextRow < 0 || nextRow >= n || nextCol < 0 || nextCol >= n || grid[nextRow][nextCol] !== 0) {
        // Change direction based on clockwise or counter-clockwise rules.
        if (direction === 'c') {
            dirIndex = (dirIndex + 1) % 4; // Clockwise turn (e.g., Right -> Down)
        } else {
            dirIndex = (dirIndex + 3) % 4; // Counter-clockwise turn (e.g., Right -> Up).
                                          // (dirIndex + 3) % 4 is equivalent to (dirIndex - 1 + 4) % 4.
        }
        // Recalculate the next position with the new direction, as the previous one was invalid.
        nextRow = currentRow + dr[dirIndex];
        nextCol = currentCol + dc[dirIndex];
    }

    // Update the current position to the (potentially new) next position for the next iteration.
    currentRow = nextRow;
    currentCol = nextCol;
}

// Print the filled grid.
// Each row is joined by a tab character and printed on a new line.
for (let r = 0; r < n; r++) {
    console.log(grid[r].join('\t'));
}