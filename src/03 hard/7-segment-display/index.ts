/**
 * Reads a line from standard input. In CodinGame environments, this function is usually provided globally.
 */
declare function readline(): string;

/**
 * Prints a line to standard output. In CodinGame environments, this function is usually provided globally.
 * @param message The message to print.
 */
declare function print(message: any): void;


// Define segment patterns for each digit.
// The indices correspond to the segments as described:
// 0: top (a)
// 1: top-left (f)
// 2: top-right (b)
// 3: middle (g)
// 4: bottom-left (e)
// 5: bottom-right (c)
// 6: bottom (d)
const segmentPatterns: { [key: number]: number[] } = {
    0: [0, 1, 2, 4, 5, 6], // a,f,b,e,c,d
    1: [2, 5],             // b,c
    2: [0, 2, 3, 4, 6],    // a,b,g,e,d
    3: [0, 2, 3, 5, 6],    // a,b,g,c,d
    4: [1, 2, 3, 5],       // f,b,g,c
    5: [0, 1, 3, 5, 6],    // a,f,g,c,d
    6: [0, 1, 3, 4, 5, 6], // a,f,g,e,c,d
    7: [0, 2, 5],          // a,b,c
    8: [0, 1, 2, 3, 4, 5, 6], // All segments active
    9: [0, 1, 2, 3, 5, 6], // a,f,b,g,c,d
};

/**
 * Generates the 7-segment display representation for a single digit.
 * @param digit The digit (0-9) to render.
 * @param char The character to use for drawing the segments.
 * @param S The size of the segment, which determines the height and width of the digit.
 * @returns An array of strings, where each string is a line of the digit's display.
 */
function generateDigitDisplay(digit: number, char: string, S: number): string[] {
    const activeSegments = segmentPatterns[digit];
    const displayLines: string[] = [];

    // Pre-calculate common string parts for efficiency
    const charHorizontal = char.repeat(S);
    const spaceHorizontal = ' '.repeat(S);

    // Helper functions to determine character/segment string based on segment activity
    const getChar = (segmentIndex: number) => activeSegments.includes(segmentIndex) ? char : ' ';
    const getHorizSegment = (segmentIndex: number) => activeSegments.includes(segmentIndex) ? charHorizontal : spaceHorizontal;

    // Line 0: Top segment (a)
    // Format: ' ' + segment_a + ' '
    displayLines.push(' ' + getHorizSegment(0) + ' ');

    // Lines 1 to S: Top-left (f) and Top-right (b) vertical segments
    // Format: segment_f + S_spaces + segment_b
    for (let i = 0; i < S; i++) {
        displayLines.push(getChar(1) + spaceHorizontal + getChar(2));
    }

    // Line S + 1: Middle segment (g)
    // Format: ' ' + segment_g + ' '
    displayLines.push(' ' + getHorizSegment(3) + ' ');

    // Lines S + 2 to 2*S + 1: Bottom-left (e) and Bottom-right (c) vertical segments
    // Format: segment_e + S_spaces + segment_c
    for (let i = 0; i < S; i++) {
        displayLines.push(getChar(4) + spaceHorizontal + getChar(5));
    }

    // Line 2*S + 2: Bottom segment (d)
    // Format: ' ' + segment_d + ' '
    displayLines.push(' ' + getHorizSegment(6) + ' ');

    return displayLines;
}

// --- Main Program Logic ---

// Read input values
const N_str: string = readline(); // Read N as a string to handle very large numbers
const C: string = readline();
const S: number = parseInt(readline());

// Convert the number string N into an array of its individual digits
const digits: number[] = N_str.split('').map(Number);

// Generate the 7-segment display representation for each digit
const allDigitDisplays: string[][] = [];
for (const digit of digits) {
    allDigitDisplays.push(generateDigitDisplay(digit, C, S));
}

// Calculate the total height of the display for a single digit
const totalHeight = (2 * S) + 3;

// Iterate through each line of the display from top to bottom
for (let i = 0; i < totalHeight; i++) {
    const lineParts: string[] = [];
    // For the current line 'i', collect the corresponding line part from each digit's display
    for (let j = 0; j < allDigitDisplays.length; j++) {
        lineParts.push(allDigitDisplays[j][i]);
    }
    // Join the collected line parts with a single space and print the combined line
    console.log(lineParts.join(' '));
}