// Standard input/output functions provided by CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

// 1. Read W and H (width and height of the grid)
const [W, H] = readline().split(' ').map(Number);

// 2. Read initial ant coordinates (x, y)
// These variables will be updated during the simulation
let [antX, antY] = readline().split(' ').map(Number);

// 3. Read initial ant direction (N, E, S, W)
const initialAntDirChar = readline();

// Map character directions to numerical representation for easier rotation and movement.
// N=0 (Up), E=1 (Right), S=2 (Down), W=3 (Left)
const dirMap: { [key: string]: number } = {
    'N': 0, 
    'E': 1, 
    'S': 2, 
    'W': 3  
};
// Initialize ant's direction as a number
let antDir = dirMap[initialAntDirChar];

// 4. Read the number of turns (T)
const T = parseInt(readline());

// 5. Read the initial grid state
const grid: string[][] = [];
for (let i = 0; i < H; i++) {
    // Split each line into an array of characters
    grid.push(readline().split(''));
}

// Define movement deltas for each numerical direction:
// dx[dir]: change in x coordinate (horizontal movement)
// dy[dir]: change in y coordinate (vertical movement)
// Indexes: 0=N, 1=E, 2=S, 3=W
const dx = [0, 1, 0, -1]; // N: no x, E: +x, S: no x, W: -x
const dy = [-1, 0, 1, 0]; // N: -y, E: no y, S: +y, W: no y

// 6. Simulate the ant's movement for T turns
for (let turn = 0; turn < T; turn++) {
    // Get the color of the square the ant is currently on
    const currentColor = grid[antY][antX];

    // Rule 1: Rotate 90 degrees
    if (currentColor === '.') { // If on a white square ('.')
        // Rotate 90 degrees left (counter-clockwise)
        // (currentDir - 1 + 4) % 4 ensures the result is always positive and wraps correctly
        antDir = (antDir - 1 + 4) % 4; 
    } else { // If on a black square ('#')
        // Rotate 90 degrees right (clockwise)
        antDir = (antDir + 1) % 4;
    }

    // Rule 2: Invert the color of the current square
    grid[antY][antX] = (currentColor === '.') ? '#' : '.';

    // Rule 3: Move 1 square forward in the new direction
    antX += dx[antDir];
    antY += dy[antDir];
}

// 7. Print the final state of the grid
for (let r = 0; r < H; r++) {
    // Join the characters in each row array to form a string and print it
    print(grid[r].join(''));
}