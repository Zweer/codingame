// Define readline and print for CodinGame environment.
// These are usually provided by the CodinGame platform.
declare function readline(): string;
declare function print(s: any): void;

// Global variables to store L, H, and the Mayan numeral mappings.
// Making them global simplifies access from helper functions without passing them around.
let L: number;
let H: number;
// Stores the ASCII glyphs for each decimal number (0-19).
// E.g., decimalToMayanGlyphs[0] would be ["line1_of_0", "line2_of_0", ...].
let decimalToMayanGlyphs: string[][];
// Maps the joined ASCII string of a glyph (e.g., "o...\n....\n....\n....") to its decimal value (0-19).
let mayanNumeralMap: Map<string, number>;

/**
 * Main function to orchestrate the puzzle solution.
 * Reads input, performs calculations, and prints the result.
 */
function main() {
    // 1. Read L and H (width and height of Mayan numerals).
    const L_H = readline().split(' ').map(Number);
    L = L_H[0];
    H = L_H[1];

    // 2. Initialize mapping data structures.
    decimalToMayanGlyphs = Array(20).fill(null).map(() => []);
    mayanNumeralMap = new Map<string, number>();

    // 3. Read the ASCII representations of the 20 Mayan numerals (0-19).
    // Each of the H lines contains 20 glyphs concatenated horizontally.
    for (let i = 0; i < H; i++) {
        const numeralRow = readline();
        for (let j = 0; j < 20; j++) { // For each of the 20 numerals
            // Extract the L-character segment for the current numeral and line.
            decimalToMayanGlyphs[j].push(numeralRow.substring(j * L, (j + 1) * L));
        }
    }

    // 4. Populate the mayanNumeralMap for quick lookup from glyph string to decimal value.
    // Each glyph's H lines are joined by '\n' to form a unique string key.
    for (let i = 0; i < 20; i++) {
        mayanNumeralMap.set(decimalToMayanGlyphs[i].join('\n'), i);
    }

    // 5. Read the first Mayan number.
    const S1 = Number(readline()); // Number of lines for the first number
    const num1Lines: string[] = [];
    for (let i = 0; i < S1; i++) {
        num1Lines.push(readline());
    }

    // 6. Read the second Mayan number.
    const S2 = Number(readline()); // Number of lines for the second number
    const num2Lines: string[] = [];
    for (let i = 0; i < S2; i++) {
        num2Lines.push(readline());
    }

    // 7. Read the operation to perform.
    const operation = readline();

    // 8. Convert both Mayan numbers to their decimal (BigInt) equivalents.
    const decNum1 = mayanToDecimal(num1Lines);
    const decNum2 = mayanToDecimal(num2Lines);

    // 9. Perform the arithmetic operation.
    let result: bigint;
    switch (operation) {
        case '+':
            result = decNum1 + decNum2;
            break;
        case '-':
            result = decNum1 - decNum2;
            break;
        case '*':
            result = decNum1 * decNum2;
            break;
        case '/':
            // The problem statement guarantees that division will always have a remainder of 0
            // and implies that division by zero won't occur for valid test cases.
            result = decNum1 / decNum2;
            break;
        default:
            // This case should ideally not be reached given the problem constraints on operations.
            throw new Error('Unknown operation: ' + operation);
    }

    // 10. Convert the decimal result back to Mayan representation and print each line.
    const resultMayanLines = decimalToMayan(result);
    resultMayanLines.forEach(line => print(line));
}

/**
 * Converts a Mayan number (represented as an array of ASCII lines) to its decimal BigInt equivalent.
 * Mayan numbers are read from top (most significant digit) to bottom (least significant digit).
 *
 * @param mayanNumberLines An array of strings, where each string is a line of the Mayan number's ASCII representation.
 * @returns The decimal BigInt value of the Mayan number.
 */
function mayanToDecimal(mayanNumberLines: string[]): bigint {
    // The number of Mayan digits is the total number of lines divided by the height of one glyph.
    const numDigits = mayanNumberLines.length / H;
    let decimalValue = 0n; // Use BigInt for large numbers (up to 2^63).

    // Iterate through each Mayan digit from the most significant (topmost) to the least significant (bottommost).
    for (let i = 0; i < numDigits; i++) {
        // Extract the H lines that make up the current Mayan digit's glyph.
        const glyphLines = mayanNumberLines.slice(i * H, (i + 1) * H);
        // Join these lines to form a string that can be used as a key in the map.
        const glyphString = glyphLines.join('\n');
        
        // Look up the decimal value of this Mayan glyph.
        const digit = mayanNumeralMap.get(glyphString);
        if (digit === undefined) {
            // This error indicates an invalid Mayan numeral in the input, which shouldn't happen with valid test cases.
            throw new Error('Could not find Mayan numeral for glyph: \n' + glyphString);
        }
        
        // Apply the base-20 conversion logic: current_value * 20 + next_digit_value.
        decimalValue = decimalValue * 20n + BigInt(digit);
    }
    return decimalValue;
}

/**
 * Converts a decimal BigInt number to its Mayan representation (an array of ASCII lines).
 * Mayan numbers are displayed with the most significant digit at the top.
 *
 * @param decimalValue The decimal BigInt value to convert.
 * @returns An array of strings representing the Mayan number, ready for printing.
 */
function decimalToMayan(decimalValue: bigint): string[] {
    const mayanLines: string[] = [];

    // Special case: If the decimal value is 0, return the glyph for '0'.
    if (decimalValue === 0n) {
        return decimalToMayanGlyphs[0];
    }

    const tempDigits: number[] = [];
    // Convert the decimal value to its base-20 digits.
    // The modulo operation gives the least significant digit, then divide by 20.
    while (decimalValue > 0n) {
        const remainder = Number(decimalValue % 20n); // Get the current base-20 digit.
        tempDigits.push(remainder); // Store it. Digits are stored in reverse order (LSB first).
        decimalValue /= 20n; // Prepare for the next digit.
    }

    // Mayan numbers are displayed with the most significant digit at the top.
    // The `tempDigits` array contains digits from least significant to most significant.
    // So, iterate backwards through `tempDigits` to get the correct display order.
    for (let i = tempDigits.length - 1; i >= 0; i--) {
        const digit = tempDigits[i];
        // Append all H lines for this Mayan digit's glyph to the result array.
        mayanLines.push(...decimalToMayanGlyphs[digit]);
    }

    return mayanLines;
}

// Call the main function to start the program execution.
main();