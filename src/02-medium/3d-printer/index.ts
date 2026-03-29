// Standard input reading setup for CodinGame
// declare function readline(): string; // Declared globally by CodinGame environment
// declare class Console { // Declared globally by CodinGame environment
//     static log(message?: any, ...optionalParams: any[]): void;
//     static error(message?: any, ...optionalParams: any[]): void;
// }
// const console = Console; // Assign Console to console variable for use

// The above declarations are for CodinGame's specific environment.
// In a local TypeScript setup, you might use:
// import * as fs from 'fs';
// const inputLines = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
// let currentLineIndex = 0;
// const readline = () => inputLines[currentLineIndex++];
// Or use `process.stdin.on('data', ...)` for real-time input.
// For CodinGame, `readline()` and `console.log()` are implicitly available.


// Read dimensions
const width: number = parseInt(readline());
const height: number = parseInt(readline());
const length: number = parseInt(readline());

// Read front view (X-Z plane projection)
// Input format: 'height' lines, each 'width' characters long.
// frontView[0] is the top row of the front view.
const frontView: string[] = [];
for (let i = 0; i < height; i++) {
    frontView.push(readline());
}

// Read right side view (Y-Z plane projection)
// Input format: 'height' lines, each 'length' characters long.
// rightView[0] is the top row of the right view.
const rightView: string[] = [];
for (let i = 0; i < height; i++) {
    rightView.push(readline());
}

// Read top view (X-Y plane projection)
// Input format: 'length' lines, each 'width' characters long.
// topView[0] is the front row (smallest Y) of the top view.
const topView: string[] = [];
for (let i = 0; i < length; i++) {
    topView.push(readline());
}

// Initialize the 3D model: model[z][y][x]
// z: 0 (bottom layer) to height-1 (top layer)
// y: 0 (front) to length-1 (back)
// x: 0 (left) to width-1 (right)
// Start by assuming all voxels are hollow ('.') as per the rule:
// A voxel becomes '#' only if all views allow it and we "assume solid".
const model: string[][][] = Array(height)
    .fill(0)
    .map(() =>
        Array(length)
            .fill(0)
            .map(() => Array(width).fill('.'))
    );

// Populate the 3D model based on the three views
// A voxel (x, y, z) is solid ('#') if and only if it is consistent with all three views.
// This means:
// 1. The character at (x, z) in the front view projection must be '#'.
//    (frontView[height - 1 - z] adjusts for Z-axis increasing upwards and view indexing from top-to-bottom)
// 2. The character at (y, z) in the right view projection must be '#'.
//    (rightView[height - 1 - z] adjusts for Z-axis increasing upwards and view indexing from top-to-bottom)
// 3. The character at (x, y) in the top view projection must be '#'.
//    (topView[y] maps directly to Y-coordinate)
// If all three conditions are met, the voxel is marked solid ('#'). Otherwise, it remains hollow ('.').
for (let z = 0; z < height; z++) { // Iterate Z from bottom to top
    for (let y = 0; y < length; y++) { // Iterate Y from front to back
        for (let x = 0; x < width; x++) { // Iterate X from left to right
            const frontChar = frontView[height - 1 - z].charAt(x);
            const rightChar = rightView[height - 1 - z].charAt(y);
            const topChar = topView[y].charAt(x);

            if (frontChar === '#' && rightChar === '#' && topChar === '#') {
                model[z][y][x] = '#';
            }
            // If any char is '.', model[z][y][x] remains '.' (hollow)
        }
    }
}

// Generate the output layers
const outputLines: string[] = [];

// Output layers from bottom (z=0) to top (z=height-1)
// Each layer is a string of 'width' characters.
// A character at position 'x' is '#' if any voxel at (x, ?, z) is solid,
// representing a projection of that specific Z-layer onto the X-Z plane.
for (let z = 0; z < height; z++) {
    let currentLayerLine = '';
    for (let x = 0; x < width; x++) { // Iterate across the width (X-axis)
        let foundSolidInColumn = false;
        // Check all 'y' (depth) values for the current (x, z) column
        // If any voxel at this (x,z) position across all depths is solid, the projected output is solid.
        for (let y = 0; y < length; y++) {
            if (model[z][y][x] === '#') {
                foundSolidInColumn = true;
                break; // Found a solid block, no need to check further in this column
            }
        }
        currentLayerLine += foundSolidInColumn ? '#' : '.';
    }
    outputLines.push(currentLayerLine);
    outputLines.push('--'); // Separator between layers
}

// Print the collected output lines
console.log(outputLines.join('\n'));