// Read input from stdin
const inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);
const cx: number = parseFloat(inputs[2]);
const cy: number = parseFloat(inputs[3]);
const ro: number = parseFloat(inputs[4]);
const ri: number = parseFloat(inputs[5]);
const samples: number = parseInt(inputs[6]);

// Pre-calculate squared radii for efficiency, as the ring condition uses squared distances.
const ro_sq: number = ro * ro;
const ri_sq: number = ri * ri;

// Pre-calculate 1.0 / samples to avoid repeated division in the inner loops.
const one_over_samples: number = 1.0 / samples;

/**
 * Checks if a given point (px, py) is inside the defined annulus (ring).
 * @param px The x-coordinate of the point.
 * @param py The y-coordinate of the point.
 * @returns True if the point is inside the ring, false otherwise.
 */
function isInsideRing(px: number, py: number): boolean {
    // Calculate the squared distance from the point to the center of the ring.
    const dist_sq: number = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    // A point is on the ring if its squared distance from the center
    // is between ri_sq (inclusive) and ro_sq (inclusive).
    return dist_sq >= ri_sq && dist_sq <= ro_sq;
}

/**
 * Determines the ASCII character to use based on the coverage percentage.
 * @param coverage The coverage value (0.0 to 1.0) representing the portion of a character cell covered by the ring.
 * @returns The ASCII character corresponding to the coverage.
 */
function getChar(coverage: number): string {
    // The order of checks is important here.
    // Each condition checks for a range inclusive of its lower bound
    // and exclusive of its upper bound due to the 'if-else if' structure.
    if (coverage >= 0.9) return '@'; // 90% or more
    if (coverage >= 0.8) return '%'; // 80% to 90% (exclusive)
    if (coverage >= 0.7) return '#'; // 70% to 80% (exclusive)
    if (coverage >= 0.6) return '*'; // 60% to 70% (exclusive)
    if (coverage >= 0.5) return '+'; // 50% to 60% (exclusive)
    if (coverage >= 0.4) return '='; // 40% to 50% (exclusive)
    if (coverage >= 0.3) return '-'; // 30% to 40% (exclusive)
    if (coverage >= 0.2) return ':'; // 20% to 30% (exclusive)
    if (coverage >= 0.1) return '.'; // 10% to 20% (exclusive)
    return ' ';                       // 0% to 10% (exclusive)
}

// Create a 2D array to store the calculated characters for the drawing area.
// It's initialized with spaces.
const charGrid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));

// Iterate over each character cell in the drawing area (excluding the frame).
for (let y_char_idx = 0; y_char_idx < height; y_char_idx++) {
    for (let x_char_idx = 0; x_char_idx < width; x_char_idx++) {
        let pointsInsideRing: number = 0;
        const totalSamples: number = samples * samples;

        // Perform supersampling for the current character cell.
        // Loop through each sample point within the character cell.
        for (let i = 0; i < samples; i++) {
            for (let j = 0; j < samples; j++) {
                // Calculate the fractional offset of the sample point within the 1x1 character cell.
                // (e.g., for samples=2, offsets are 0.25 and 0.75)
                const sub_cell_x_offset: number = (i + 0.5) * one_over_samples;
                const sub_cell_y_offset: number = (j + 0.5) * one_over_samples;

                // Calculate the sample point's coordinates in the "character grid system".
                // This is (character_column_index + sub_cell_x_offset, character_row_index + sub_cell_y_offset).
                const charGrid_sample_x: number = x_char_idx + sub_cell_x_offset;
                const charGrid_sample_y: number = y_char_idx + sub_cell_y_offset;

                // Convert the character grid coordinates to "world coordinates"
                // based on the problem's aspect ratio (character is 0.5 units wide, 1.0 unit tall).
                const world_x: number = charGrid_sample_x * 0.5;
                const world_y: number = charGrid_sample_y * 1.0; // Multiplying by 1.0 for clarity, effectively just charGrid_sample_y

                // Check if this world coordinate sample point is inside the ring.
                if (isInsideRing(world_x, world_y)) {
                    pointsInsideRing++;
                }
            }
        }

        // Calculate the coverage for the current character cell.
        const coverage: number = pointsInsideRing / totalSamples;
        // Store the determined character in the grid.
        charGrid[y_char_idx][x_char_idx] = getChar(coverage);
    }
}

// Print the final ASCII art, including the frame.

// Print the top frame line.
console.log('+' + '-'.repeat(width) + '+');

// Print the middle rows with the calculated characters and vertical frame.
for (let y = 0; y < height; y++) {
    // Join the characters for the current row into a single string.
    console.log('|' + charGrid[y].join('') + '|');
}

// Print the bottom frame line.
console.log('+' + '-'.repeat(width) + '+');