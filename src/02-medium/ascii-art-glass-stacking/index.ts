// CodinGame setup for input/output functions (these are usually provided by the platform)
declare function readline(): string;
declare function print(message: any): void;

// Define the ASCII art pattern for a single glass within its effective block
const GLASS_LINES: string[] = [
    "  ***  ", // Line 0: The top portion of the glass, 7 characters wide
    "  * *  ", // Line 1: 7 characters wide
    "  * *  ", // Line 2: 7 characters wide
    " ***** ", // Line 3: The base of the glass, 7 characters wide (5 stars + 1 space on each side)
];
const GLASS_HEIGHT: number = GLASS_LINES.length;          // Height of one glass block (4 lines)
const GLASS_WIDTH_EFFECTIVE: number = GLASS_LINES[0].length; // Effective width of one glass block (7 characters)
const GLASS_SPACING: number = 1;                         // Horizontal space between two adjacent glass blocks in a row

// Read N from input
const N: number = parseInt(readline());

// Step 1: Calculate the maximum pyramid height (maxR) that can be built with N glasses
let maxR: number = 0; // maxR will be the number of rows in the largest pyramid
// Iterate through possible pyramid heights (r)
for (let r = 1; ; r++) {
    // Calculate the total number of glasses required for a pyramid of 'r' rows
    // Sum of arithmetic series: 1 + 2 + ... + r = r * (r + 1) / 2
    const glassesRequiredForRRows: number = r * (r + 1) / 2;

    // If we have enough glasses for 'r' rows, update maxR and continue
    if (glassesRequiredForRRows <= N) {
        maxR = r;
    } else {
        // If we don't have enough glasses for 'r' rows, then 'r-1' was the max
        break;
    }
}

// Step 2: Determine total dimensions of the final ASCII art grid
let totalHeight: number = maxR * GLASS_HEIGHT;
let baseWidth: number; // The width of the widest (bottom-most) row of the pyramid

// Calculate base width based on maxR. If maxR is 0, baseWidth is 0.
// Constraints (0 < N < 30) ensure N is at least 1, so maxR will always be at least 1.
// If N=1, maxR=1, then baseWidth = 1 * 7 + (1-1)*1 = 7.
if (maxR === 0) {
    baseWidth = 0;
} else {
    baseWidth = maxR * GLASS_WIDTH_EFFECTIVE + (maxR - 1) * GLASS_SPACING;
}

// Step 3: Initialize the output grid with spaces
// We use an array of strings, where each string represents a line of the ASCII art
// Each line is initialized with 'baseWidth' number of spaces
const outputGrid: string[] = Array(totalHeight).fill('').map(() => ' '.repeat(baseWidth));

// Step 4: Populate the output grid with the ASCII art of glasses
// Iterate through each row of the pyramid, from top (pyramidRow = 0) to bottom (pyramidRow = maxR - 1)
for (let pyramidRow = 0; pyramidRow < maxR; pyramidRow++) {
    // Number of glasses in the current pyramid row (1 for top, 2 for second, etc.)
    const numGlassesInCurrentRow: number = pyramidRow + 1;

    // Calculate the total width occupied by glasses in the current pyramid row
    // (numGlasses * effective glass width) + (numGlasses-1 * spacing between glasses)
    const currentRowWidth: number = numGlassesInCurrentRow * GLASS_WIDTH_EFFECTIVE + (numGlassesInCurrentRow - 1) * GLASS_SPACING;

    // Calculate the horizontal offset needed to center the current row within the base width
    // Integer division is used, which is fine as (baseWidth - currentRowWidth) will always be even
    const x_offset: number = (baseWidth - currentRowWidth) / 2;

    // Calculate the vertical offset for the current pyramid row within the total height
    const y_offset: number = pyramidRow * GLASS_HEIGHT;

    // Place each individual glass in the current pyramid row
    for (let glassIndex = 0; glassIndex < numGlassesInCurrentRow; glassIndex++) {
        // Calculate the starting X-coordinate for the current glass block
        // This is the row's x_offset + (glass index * (effective glass width + spacing))
        const currentGlassX: number = x_offset + glassIndex * (GLASS_WIDTH_EFFECTIVE + GLASS_SPACING);

        // Copy each line of the glass's ASCII art pattern into the corresponding lines of the output grid
        for (let lineNum = 0; lineNum < GLASS_HEIGHT; lineNum++) {
            const targetY: number = y_offset + lineNum;           // The target Y-coordinate in the output grid
            const patternLine: string = GLASS_LINES[lineNum];     // The ASCII pattern for this specific line of the glass

            // To modify a string in TypeScript, it's often easiest to convert it to a character array,
            // modify the array, and then join it back into a string.
            const currentOutputLineChars = outputGrid[targetY].split('');

            // Copy characters from the pattern line to the output grid line
            for (let i = 0; i < GLASS_WIDTH_EFFECTIVE; i++) {
                currentOutputLineChars[currentGlassX + i] = patternLine[i];
            }
            outputGrid[targetY] = currentOutputLineChars.join('');
        }
    }
}

// Step 5: Print the final ASCII pyramid
// Join all lines in the output grid with a newline character to form the complete ASCII art
print(outputGrid.join('\n'));