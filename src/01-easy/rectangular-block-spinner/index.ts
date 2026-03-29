/**
 * Reads a line from standard input. In a CodinGame environment, `readline()` is globally available.
 * @returns {string} The read line.
 */
declare function readline(): string;

/**
 * Prints a line to standard output. In a CodinGame environment, `console.log()` works.
 * @param {any} message The message to log.
 */
declare function print(message: any): void; // Or console.log

// Read input
const size: number = parseInt(readline());
const angle: number = parseInt(readline());

const inputGrid: string[][] = [];
for (let i = 0; i < size; i++) {
    inputGrid.push(readline().split(' '));
}

// Calculate the effective rotation steps (each step is 45 degrees counter-clockwise)
// The problem guarantees angle is an odd multiple of 45.
// An odd number modulo 8 will always be 1, 3, 5, or 7.
const numRot45Deg: number = angle / 45;
const effectiveRotations: number = numRot45Deg % 8;

// Output grid dimensions
// The diamond shape has a width and height of (2 * size - 1) characters.
const outputDim: number = 2 * size - 1;
const outputGrid: string[][] = Array(outputDim).fill(null).map(() => Array(outputDim).fill(' '));

// Iterate over the input grid and place characters into the output grid
for (let r_orig = 0; r_orig < size; r_orig++) {
    for (let c_orig = 0; c_orig < size; c_orig++) {
        const char = inputGrid[r_orig][c_orig];

        let r_temp: number; // Intermediate row coordinate after 90-degree pre-rotation
        let c_temp: number; // Intermediate column coordinate after 90-degree pre-rotation

        // Determine (r_temp, c_temp) based on the effective number of 90-degree CCW rotations
        // that precede the final 45-degree diamond transform.
        // The mapping (r_prime, c_prime) to (newR, newC) for 45 deg is defined below.
        // effectiveRotations 1 corresponds to 0x90deg + 45deg
        // effectiveRotations 3 corresponds to 1x90deg + 45deg
        // effectiveRotations 5 corresponds to 2x90deg + 45deg
        // effectiveRotations 7 corresponds to 3x90deg + 45deg
        
        switch (effectiveRotations) {
            case 1: // Net 45 degrees CCW (0x90deg CCW + 45deg CCW)
                r_temp = r_orig;
                c_temp = c_orig;
                break;
            case 3: // Net 135 degrees CCW (1x90deg CCW + 45deg CCW)
                // 90 deg CCW transform: (r, c) -> (c, size-1-r)
                r_temp = c_orig;
                c_temp = (size - 1) - r_orig;
                break;
            case 5: // Net 225 degrees CCW (2x90deg CCW + 45deg CCW)
                // 180 deg CCW transform: (r, c) -> (size-1-r, size-1-c)
                r_temp = (size - 1) - r_orig;
                c_temp = (size - 1) - c_orig;
                break;
            case 7: // Net 315 degrees CCW (3x90deg CCW + 45deg CCW)
                // 270 deg CCW transform: (r, c) -> (size-1-c, r)
                r_temp = (size - 1) - c_orig;
                c_temp = r_orig;
                break;
            // No default needed as effectiveRotations will always be 1, 3, 5, or 7.
        }

        // Apply the base 45-degree transformation to the (r_temp, c_temp) coordinates
        // This is the common (r+c, r-c+offset) mapping for diamond rotations.
        const newR = r_temp + c_temp;
        const newC = r_temp - c_temp + (size - 1);
        
        outputGrid[newR][newC] = char;
    }
}

// Print the output grid
for (let r = 0; r < outputDim; r++) {
    console.log(outputGrid[r].join(' '));
}