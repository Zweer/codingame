// Standard input/output functions provided by CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Mappings for the custom base-12 system.
 * Jan = 0, Feb = 1, ..., Dec = 11.
 */
const MONTHS: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Map month abbreviation to its integer value (e.g., "Jan" -> 0)
const monthToInt = new Map<string, number>();
MONTHS.forEach((month, index) => {
    monthToInt.set(month, index);
});

// The MONTHS array itself serves as the mapping from integer value to month abbreviation (e.g., 0 -> "Jan")
const intToMonth: string[] = MONTHS;

/**
 * Converts a base-12 string (using month abbreviations) to a decimal (base-10) number.
 * Each month abbreviation represents a digit in base-12.
 *
 * @param monthString The number in base-12 represented by concatenated month abbreviations (e.g., "FebSepDec").
 * @returns The equivalent decimal (base-10) number.
 */
function base12ToDecimal(monthString: string): number {
    let decimalValue: number = 0;
    // Each month abbreviation is 3 characters long.
    const numDigits: number = monthString.length / 3;

    for (let i = 0; i < numDigits; i++) {
        // Extract the 3-character month abbreviation
        const monthAbbr: string = monthString.substring(i * 3, (i * 3) + 3);
        const digit: number | undefined = monthToInt.get(monthAbbr);

        // Basic validation, though puzzle constraints usually guarantee valid input
        if (digit === undefined) {
            throw new Error(`Invalid month abbreviation found: ${monthAbbr}`);
        }

        // Calculate the power of 12 for the current digit.
        // The leftmost digit (at index 0) has the highest power (numDigits - 1).
        // The rightmost digit (at index numDigits - 1) has the lowest power (0).
        const power: number = numDigits - 1 - i;
        decimalValue += digit * Math.pow(12, power);
    }
    return decimalValue;
}

/**
 * Converts a decimal (base-10) number to a base-12 string (using month abbreviations).
 * Uses repeated division by 12 to find remainders, which are the base-12 digits.
 *
 * @param decimalNumber The decimal (base-10) number to convert.
 * @returns The equivalent base-12 string using concatenated month abbreviations (e.g., "JulNovDec").
 */
function decimalToBase12(decimalNumber: number): string {
    // Special case: If the decimal number is 0, it directly maps to "Jan".
    if (decimalNumber === 0) {
        return "Jan";
    }

    const resultMonths: string[] = [];
    let currentNumber: number = decimalNumber;

    // Perform repeated division by 12 until the number becomes 0.
    while (currentNumber > 0) {
        const remainder: number = currentNumber % 12;
        // The remainders are generated in reverse order of significance.
        // Prepend the month abbreviation to the result array to build the string correctly.
        resultMonths.unshift(intToMonth[remainder]);
        currentNumber = Math.floor(currentNumber / 12);
    }

    // Join the array of month abbreviations to form the final base-12 string.
    return resultMonths.join('');
}

// --- Main Program Logic ---

// Read the number of dates (N) from the first line of input.
const N: number = parseInt(readline());

// Initialize a variable to store the total sum in decimal (base-10).
let totalSumDecimal: number = 0;

// Loop N times to read each base-12 number and add its decimal equivalent to the total sum.
for (let i = 0; i < N; i++) {
    const base12String: string = readline();
    totalSumDecimal += base12ToDecimal(base12String);
}

// Convert the final decimal sum back to the base-12 month string format.
const finalResultBase12: string = decimalToBase12(totalSumDecimal);

// Print the result to standard output.
print(finalResultBase12);