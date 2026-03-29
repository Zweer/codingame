/**
 * The `readline` function is provided by the CodinGame environment for input.
 * The `console.log` function is used for output.
 * No need to declare them explicitly in the final solution for CodinGame.
 */

/**
 * Maps integer values to their standard Roman numeral symbols.
 * Ordered from largest to smallest, including subtractive forms
 * (e.g., 900 for CM, 400 for CD) to ensure correct conversion.
 */
const romanMap = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
];

/**
 * Converts an integer to its standard-form Roman numeral representation.
 * This function handles numbers from 1 to 3999 according to standard rules,
 * including subtractive notation (e.g., IV for 4, CM for 900).
 *
 * @param num The integer to convert.
 * @returns The Roman numeral string.
 */
function toRoman(num: number): string {
    let result = "";
    // Iterate through the romanMap from largest value to smallest.
    for (const { value, symbol } of romanMap) {
        // While the current number is greater than or equal to the map's value,
        // append the corresponding symbol to the result and subtract the value from num.
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
}

/**
 * Interface to represent an integer along with its Roman numeral conversion.
 * This helps in pairing the original number with its Roman form for sorting.
 */
interface NumeralInfo {
    original: number;
    roman: string;
}

// Read the total number of integers to be sorted from the first line of input.
const n: number = parseInt(readline());

// Initialize an array to store the NumeralInfo objects.
const numbersToSort: NumeralInfo[] = [];

// Loop 'n' times to read each integer, convert it, and store it.
for (let i = 0; i < n; i++) {
    const x: number = parseInt(readline());
    numbersToSort.push({
        original: x,
        roman: toRoman(x), // Convert the integer to its Roman numeral representation.
    });
}

// Sort the array of NumeralInfo objects.
// The sorting is based on the 'roman' string property using standard alphabetical comparison.
// localeCompare() is used for robust string comparison.
numbersToSort.sort((a, b) => a.roman.localeCompare(b.roman));

// After sorting, map the array back to just the original integer values.
// Then, join these numbers with a single space to form the final output string.
const sortedOutput: string = numbersToSort.map(item => item.original).join(' ');

// Print the final sorted string to the console.
console.log(sortedOutput);