// Assuming readline function is globally available in CodinGame environment
declare function readline(): string;

/**
 * Checks if a number is a "Buzzle" according to Level 4 rules.
 * @param value The number to check (decimal).
 * @param n The base for digit-based rules.
 * @param specialNums An array of special numbers.
 * @returns True if value is a Buzzle, false otherwise.
 */
function isBuzzle(value: number, n: number, specialNums: number[]): boolean {
    // Iterate through all special numbers provided. If any rule is met for any special number, it's a Buzzle.
    for (const specialNum of specialNums) {
        // Rule 1: Number is a multiple of specialNum (this rule uses decimal value of 'value')
        if (value % specialNum === 0) {
            return true;
        }

        // Rule 2: Last digit of number in base n is specialNum
        // The last digit of 'value' in base 'n' is simply 'value % n'.
        if (value % n === specialNum) {
            return true;
        }

        // Rule 3: Sum of digits (in base n) is a Buzzle.
        // This implies finding the digital root of the number in base n,
        // and then checking if that digital root itself satisfies Rule 1 or Rule 2 (for single digit).

        let sumOfDigitsBaseN = 0;
        let tempValueForSum = value;

        // Calculate the initial sum of digits of 'value' when represented in base 'n'.
        // Since 'a' is at least 1, 'value' will always be >= 1, so tempValueForSum starts > 0.
        while (tempValueForSum > 0) {
            sumOfDigitsBaseN += tempValueForSum % n; // Add the last digit in base n
            tempValueForSum = Math.floor(tempValueForSum / n); // Remove the last digit
        }
        
        // Find the digital root of 'sumOfDigitsBaseN' in base 'n'.
        // This involves repeatedly summing its digits in base 'n' until it becomes a single digit in base 'n'
        // (i.e., a number less than 'n').
        let digitalRoot = sumOfDigitsBaseN;
        while (digitalRoot >= n) {
            let nextSum = 0;
            let tempDigitalRoot = digitalRoot;
            // Calculate sum of digits for the current 'digitalRoot' in base 'n'
            while (tempDigitalRoot > 0) {
                nextSum += tempDigitalRoot % n;
                tempDigitalRoot = Math.floor(tempDigitalRoot / n);
            }
            digitalRoot = nextSum; // Update digitalRoot for the next iteration
        }
        
        // Check if this 'digitalRoot' meets the criteria for being a Buzzle,
        // specifically rules for multiples and ending with specialNum.
        // Since 'digitalRoot' is a single digit in base 'n' (a value from 0 to n-1),
        // 'digitalRoot % n' is 'digitalRoot' itself.
        // And for a single-digit number, "ends with specialNum" is equivalent to "is equal to specialNum".
        if (digitalRoot % specialNum === 0 || digitalRoot === specialNum) {
            return true;
        }
    }
    // If none of the rules were met for any special number, it's not a Buzzle.
    return false;
}

// Main execution function
function solve() {
    // Read the first line: n, a, b
    const [n, a, b] = readline().split(' ').map(Number);

    // Read the second line: k (number of special values)
    const k = Number(readline());

    // Read the third line: k space-separated integers for the special numbers
    const specialNums = readline().split(' ').map(Number);

    // Iterate from 'a' to 'b' (inclusive) and print the result for each number
    for (let i = a; i <= b; i++) {
        if (isBuzzle(i, n, specialNums)) {
            console.log("Buzzle");
        } else {
            console.log(i);
        }
    }
}

// Call the solve function to run the puzzle logic
solve();