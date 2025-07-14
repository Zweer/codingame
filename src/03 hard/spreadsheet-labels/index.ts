// Required for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

/**
 * Converts a 1-indexed number to its corresponding spreadsheet alphabetic label.
 * (e.g., 1 -> A, 26 -> Z, 27 -> AA, 52 -> AZ, 53 -> BA)
 * @param num The 1-indexed number.
 * @returns The alphabetic label string.
 */
function numberToAlpha(num: number): string {
    let result = "";
    while (num > 0) {
        // Excel column conversion is a base-26 system but without a zero-digit concept.
        // Instead of 0-25, it uses 1-26 (A-Z).
        // This means when the remainder is 0, it actually corresponds to 'Z' (26th letter).
        // In such cases, we also need to adjust 'num' downwards for the next iteration
        // because 'Z' effectively 'consumes' a full 26, rather than being a 0-value digit
        // that would just result in `num = num / 26`.
        let remainder = num % 26;
        if (remainder === 0) {
            result = 'Z' + result;
            num = (num / 26) - 1; // Correctly reduces the number for the next higher place value.
        } else {
            // For remainders 1-25, map directly to A-Y.
            result = String.fromCharCode('A'.charCodeAt(0) + remainder - 1) + result;
            num = Math.floor(num / 26);
        }
    }
    return result;
}

/**
 * Converts a spreadsheet alphabetic label to its corresponding 1-indexed number.
 * (e.g., A -> 1, Z -> 26, AA -> 27, AZ -> 52, BA -> 53)
 * @param label The alphabetic label string.
 * @returns The 1-indexed number.
 */
function alphaToNumber(label: string): number {
    let result = 0;
    // Iterate through the label from left to right.
    // Each character represents a digit in a base-26 system where A=1, B=2, ..., Z=26.
    for (let i = 0; i < label.length; i++) {
        const char = label[i];
        // Get the numeric value of the character (A=1, B=2, ..., Z=26)
        const value = char.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        // Multiply the current result by 26 (base) and add the new digit's value.
        result = result * 26 + value;
    }
    return result;
}

// Read the number of labels
const N: number = parseInt(readline());

// Read the space-separated labels into an array
const labels: string[] = readline().split(' ');

const convertedLabels: string[] = [];

// Process each label in the input array
for (const label of labels) {
    // Determine if the label is purely numeric using a regular expression.
    if (/^\d+$/.test(label)) {
        // If it's a number, convert it to an alphabetic label.
        const num = parseInt(label);
        convertedLabels.push(numberToAlpha(num));
    } else {
        // If it's an alphabetic label, convert it to a number (and then to string for output).
        convertedLabels.push(alphaToNumber(label).toString());
    }
}

// Output the converted labels, space-separated, as required.
print(convertedLabels.join(' '));