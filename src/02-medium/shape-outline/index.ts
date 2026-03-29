// Standard input reading boilerplate for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Read input
const H: number = parseInt(readline());
const W: number = parseInt(readline());
const S: number = parseInt(readline());
const grid: string[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(readline().split(''));
}

// Helper function to check if a cell is part of the shape and within bounds
function isShape(r: number, c: number): boolean {
    return r >= 0 && r < H && c >= 0 && c < W && grid[r][c] === '#';
}

// Find the top-leftmost '#' cell to determine the starting pixel for traversal
let startR = -1;
let startC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === '#') {
            startR = r;
            startC = c;
            break;
        }
    }
    if (startR !== -1) {
        break;
    }
}

// Define direction vectors for moving in the grid (R, D, L, U)
// pixel_dr: change in row index
// pixel_dc: change in column index
const pixel_dr = [0, 1, 0, -1]; // For directions: Right, Down, Left, Up
const pixel_dc = [1, 0, -1, 0]; // For directions: Right, Down, Left, Up

// Define vertex coordinate changes based on the direction of movement
// dx_vertex: change in X coordinate (scaled by S)
// dy_vertex: change in Y coordinate (scaled by S)
const dx_vertex = [S, 0, -S, 0]; // For directions: Right, Down, Left, Up
const dy_vertex = [0, S, 0, -S]; // For directions: Right, Down, Left, Up

// Initialize the walker's current vertex position
let curr_x = startC * S;
let curr_y = startR * S;

// Initialize the grid coordinates of the shape pixel that the walker is "hugging"
// This pixel is always to the right of the walker's path (Right-Hand Rule)
let cell_on_right_r = startR;
let cell_on_right_c = startC;

// Initialize the walker's current direction (0: Right, 1: Down, 2: Left, 3: Up)
let curr_dir: number;

// Determine the initial direction to ensure clockwise traversal:
// If the cell to the left of the starting pixel is also part of the shape,
// the walker must initially move DOWN to keep the shape on its right.
// Otherwise, the walker moves RIGHT along the top edge of the starting pixel.
if (isShape(startR, startC - 1)) {
    curr_dir = 1; // Move Down
} else {
    curr_dir = 0; // Move Right
}

// Store the initial state (position and direction) to detect loop completion
const first_x = curr_x;
const first_y = curr_y;
const first_dir = curr_dir;

// Array to store the sequence of vertices
const path: [number, number][] = [];

// Helper function to add a vertex to the path, preventing consecutive duplicate vertices
// (Although for this algorithm's logic, consecutive vertices should always be different)
function addVertex(x: number, y: number) {
    if (path.length === 0 || path[path.length - 1][0] !== x || path[path.length - 1][1] !== y) {
        path.push([x, y]);
    }
}

// Add the initial starting vertex to the path
addVertex(curr_x, curr_y);

// Main boundary tracing loop using the Right-Hand Rule
do {
    // 1. Attempt to turn Right: Check the cell that would be immediately to the right of our current path.
    //    `try_dir` is the direction obtained by turning `curr_dir` 90 degrees clockwise.
    //    `check_cell_r_right`, `check_cell_c_right` are the coordinates of the cell that would be to our right
    //    if we were to turn in `try_dir`, relative to `cell_on_right_r, cell_on_right_c`.
    const try_dir = (curr_dir + 1) % 4;
    const check_cell_r_right = cell_on_right_r + pixel_dr[try_dir];
    const check_cell_c_right = cell_on_right_c + pixel_dc[try_dir];

    if (isShape(check_cell_r_right, check_cell_c_right)) {
        // A shape pixel is to our right. Turn right.
        curr_dir = try_dir;
        // The new `cell_on_right` is the pixel we just turned into.
        cell_on_right_r = check_cell_r_right;
        cell_on_right_c = check_cell_c_right;
    } else {
        // 2. Cannot turn right. Attempt to go Straight: Check the cell straight ahead.
        //    `check_cell_r_straight`, `check_cell_c_straight` are the coordinates of the cell straight ahead
        //    of our current `cell_on_right`, in `curr_dir`.
        const check_cell_r_straight = cell_on_right_r + pixel_dr[curr_dir];
        const check_cell_c_straight = cell_on_right_c + pixel_dc[curr_dir];

        if (isShape(check_cell_r_straight, check_cell_c_straight)) {
            // A shape pixel is straight ahead. Go straight.
            // `curr_dir` remains the same.
            // The new `cell_on_right` is the pixel that was straight ahead of the old one.
            cell_on_right_r = check_cell_r_straight;
            cell_on_right_c = check_cell_c_straight;
        } else {
            // 3. Cannot go straight. Turn Left.
            curr_dir = (curr_dir + 3) % 4; // Turn left (90 degrees counter-clockwise)
            // `cell_on_right_r` and `cell_on_right_c` remain the same, as the walker turned away from it.
        }
    }

    // Update the walker's current vertex coordinates based on the decided direction
    curr_x += dx_vertex[curr_dir];
    curr_y += dy_vertex[curr_dir];

    // Add the new vertex to the path
    addVertex(curr_x, curr_y);

    // Loop termination condition:
    // The loop continues until the walker returns to its *initial vertex position*
    // AND is moving in the *initial direction*. This ensures a full loop closure.
} while (!(curr_x === first_x && curr_y === first_y && curr_dir === first_dir));

// Output all recorded vertices
path.forEach(vertex => {
    print(`${vertex[0]} ${vertex[1]}`);
});