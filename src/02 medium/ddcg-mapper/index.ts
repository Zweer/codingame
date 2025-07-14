/**
 * Reads a line from standard input. In a CodinGame environment, this function is typically provided.
 * If running locally without a polyfill, this would need to be defined (e.g., using `require('readline')`).
 */
declare function readline(): string;

/**
 * Prints a string to standard output, followed by a newline. In a CodinGame environment, this function is typically provided.
 */
declare function print(message: any): void; // CodinGame usually uses print() but console.log() also works.

// Read the length of the map (L)
const L: number = parseInt(readline());

// Read the number of pattern-tempo pairs (N)
const N: number = parseInt(readline());

// Store pattern and tempo information
const patterns: { pattern: string; tempo: number }[] = [];
for (let i = 0; i < N; i++) {
    const inputs: string[] = readline().split(' ');
    const pattern: string = inputs[0];
    const tempo: number = parseInt(inputs[1]);
    patterns.push({ pattern, tempo });
}

// Initialize the map lines.
// map_lines[0] represents the bottom-most line, map_lines[L-1] the top-most line.
const map_lines: string[] = new Array(L).fill("0000");

// Calculate each line of the map from bottom to top (0-indexed k, 1-indexed k+1)
for (let k = 0; k < L; k++) {
    // currentLineNumber is the 1-indexed conceptual line number, starting from 1 at the bottom.
    const currentLineNumber = k + 1; 
    let currentCalculatedLine = map_lines[k]; // Get the initial "0000" or previous accumulated pattern for this line

    for (const p of patterns) {
        // If the current 1-indexed line number is a multiple of the pattern's tempo
        if (currentLineNumber % p.tempo === 0) {
            // Accumulate crosses for the current line
            let newLineChars: string[] = [];
            for (let charIdx = 0; charIdx < 4; charIdx++) {
                // If 'X' in current line OR 'X' in pattern, then 'X', else '0'
                if (currentCalculatedLine[charIdx] === 'X' || p.pattern[charIdx] === 'X') {
                    newLineChars[charIdx] = 'X';
                } else {
                    newLineChars[charIdx] = '0';
                }
            }
            currentCalculatedLine = newLineChars.join('');
        }
    }
    // Store the final calculated line back into the map array at its 0-indexed position
    map_lines[k] = currentCalculatedLine;
}

// Print the map from top to bottom.
// Since map_lines[L-1] is the top-most line and map_lines[0] is the bottom-most,
// we iterate downwards from L-1 to 0 to print in the required order.
for (let k = L - 1; k >= 0; k--) {
    console.log(map_lines[k]);
}