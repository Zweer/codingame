import * as readline from 'readline';

// Mapping of Roman numeral characters to their integer values.
const romanToIntMap: { [key: string]: number } = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
};

/**
 * Converts a Roman numeral string to an integer.
 * Handles standard Roman numeral rules including subtractive notation (e.g., IV=4, IX=9).
 *
 * @param s The Roman numeral string.
 * @returns The integer value.
 */
function romanToInteger(s: string): number {
    let total = 0;
    for (let i = 0; i < s.length; i++) {
        const currentVal = romanToIntMap[s[i]];
        // Get the value of the next character, or 0 if it's the last character
        const nextVal = (i + 1 < s.length) ? romanToIntMap[s[i + 1]] : 0;

        if (nextVal > currentVal) {
            // This is a subtractive case (e.g., IV, IX, XL, XC, CD, CM)
            // Subtract the current value as it precedes a larger value.
            total -= currentVal;
        } else {
            // This is an additive case (e.g., V, VI, M, MM)
            // Add the current value to the total.
            total += currentVal;
        }
    }
    return total;
}

/**
 * Converts an integer to a Roman numeral string.
 * Uses a greedy approach with pre-defined Roman numeral values including subtractive forms.
 * The values are ordered from largest to smallest.
 *
 * @param num The integer to convert.
 * @returns The Roman numeral string.
 */
function integerToRoman(num: number): string {
    // List of Roman numeral values and their symbols, ordered from largest to smallest.
    // This order is crucial for the greedy conversion algorithm.
    // Subtractive forms (CM, CD, XC, XL, IX, IV) must be included here to ensure correctness.
    const romanNumerals: Array<{ value: number, symbol: string }> = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' }
    ];

    let result = '';
    // Iterate through the romanNumerals array.
    for (const numeral of romanNumerals) {
        // While the current number is greater than or equal to the numeral's value,
        // append its symbol to the result and subtract its value from the number.
        while (num >= numeral.value) {
            result += numeral.symbol;
            num -= numeral.value;
        }
    }
    return result;
}

// Setup readline for input/output.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let rom1: string;
let rom2: string;
let lineCount = 0;

// Read input lines.
rl.on('line', (line) => {
    if (lineCount === 0) {
        rom1 = line;
    } else if (lineCount === 1) {
        rom2 = line;
        rl.close(); // Close readline after reading both inputs
    }
    lineCount++;
});

// Process inputs once all lines are read.
rl.on('close', () => {
    // Convert Roman numerals to integers.
    const int1 = romanToInteger(rom1);
    const int2 = romanToInteger(rom2);

    // Sum the integers.
    const sum = int1 + int2;

    // Convert the sum back to Roman numeral.
    const romanSum = integerToRoman(sum);

    // Print the result.
    console.log(romanSum);
});