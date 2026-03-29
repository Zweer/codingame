/**
 * Calculates the sum of the digits of a given number.
 * @param n The number for which to calculate the sum of digits.
 * @returns The sum of the digits of n.
 */
function sumDigits(n: number): number {
    let sum = 0;
    // Work with a temporary variable to avoid modifying the original number
    let tempN = n;
    while (tempN > 0) {
        // Add the last digit to the sum
        sum += tempN % 10;
        // Remove the last digit
        tempN = Math.floor(tempN / 10);
    }
    return sum;
}

// In CodinGame, `readline()` is a global function used to read input lines.
// We declare it here to satisfy TypeScript's type checking.
declare function readline(): string;

// Read the initial values of the two rivers from standard input.
const r1Str: string = readline();
const r2Str: string = readline();

// Parse the input strings to numbers.
let r1: number = parseInt(r1Str, 10);
let r2: number = parseInt(r2Str, 10);

// Simulate the progression of the rivers until they meet.
// The problem guarantees that they will meet, so this loop will always terminate.
while (r1 !== r2) {
    if (r1 < r2) {
        // If r1 is smaller, advance r1 to try and catch up to r2.
        r1 += sumDigits(r1);
    } else { // r2 < r1
        // If r2 is smaller, advance r2 to try and catch up to r1.
        r2 += sumDigits(r2);
    }
}

// Once the loop finishes, r1 and r2 are equal, which is the meeting point.
// Print the meeting point to standard output.
console.log(r1);