function solve() {
    const N: number = parseInt(readline()); // N is read but not strictly used in this approach
    const chars: string[] = readline().split(' ');

    let hasMinus: boolean = false;
    let hasDot: boolean = false;
    const digits: string[] = [];

    // Parse input characters
    for (const char of chars) {
        if (char === '-') {
            hasMinus = true;
        } else if (char === '.') {
            hasDot = true;
        } else if (char >= '0' && char <= '9') {
            digits.push(char);
        }
    }

    // Special case: If all digits are '0', the number is simply '0'.
    if (digits.every(d => d === '0')) {
        console.log('0');
        return;
    }

    let resultParts: string[] = [];

    if (hasMinus) {
        // For negative numbers, we want the greatest value, which means the smallest absolute value.
        // Sort digits in ascending order to achieve the smallest number.
        digits.sort((a, b) => a.localeCompare(b)); // Ascending sort

        resultParts.push('-');

        // Find the index of the first non-zero digit.
        const nonZeroIndex = digits.findIndex(d => d !== '0');

        if (hasDot) {
            // If there's a dot, the structure is typically -[integer_part].[fractional_part]
            // For smallest absolute value:
            // If there's a non-zero digit: -[smallest_non_zero_digit].[remaining_digits_ascending]
            // If all digits are zero (handled by initial check), or if '0' is the smallest and leads the number like -0.123
            if (nonZeroIndex !== -1) {
                // Take the smallest non-zero digit as the integer part.
                resultParts.push(digits[nonZeroIndex]);
                digits.splice(nonZeroIndex, 1); // Remove it from the array
            } else {
                // This case should theoretically not be reached if the initial `digits.every` check works.
                // However, for robustness, if we end up here with only zeros left after some complex path.
                // It means digits are all '0's and `hasDot` is true. `0` should be the integer part.
                resultParts.push('0');
                digits.shift(); // Remove the '0'
            }
            resultParts.push('.');
            resultParts.push(...digits); // All remaining digits form the fractional part
        } else {
            // No dot for negative numbers.
            // Form the smallest absolute value integer: -[smallest_non_zero][all_zeros][rest_ascending]
            if (nonZeroIndex !== -1) {
                resultParts.push(digits[nonZeroIndex]); // Smallest non-zero digit
                digits.splice(nonZeroIndex, 1); // Remove it
                resultParts.push(...digits); // Append all other digits (already sorted ascending)
            } else {
                // This case should be handled by the initial `digits.every` check.
            }
        }
    } else {
        // For positive numbers, we want the greatest value.
        // Sort digits in descending order to achieve the largest number.
        digits.sort((a, b) => b.localeCompare(a)); // Descending sort

        if (hasDot) {
            // "98742. is refused, write 9874.2 instead."
            // This rule implies that if a dot is present, it must be used and not be trailing.
            // To maximize value and satisfy the rule: place the dot just before the last digit.
            if (digits.length > 0) { // Ensure there are digits to prevent out-of-bounds
                resultParts.push(...digits.slice(0, digits.length - 1)); // All but the last digit
                resultParts.push('.');
                resultParts.push(digits[digits.length - 1]); // The last digit
            } else {
                // Should not be reached due to initial `digits.every` check.
            }
        } else {
            // No dot for positive numbers. Simply concatenate digits in descending order.
            resultParts.push(...digits);
        }
    }

    let finalNum = resultParts.join('');

    // --- Post-processing: Apply formatting rules for zeros and dot ---

    // 1. Remove trailing zeros after the decimal point and the dot if fractional part becomes empty.
    if (finalNum.includes('.')) {
        const parts = finalNum.split('.');
        const integerPart = parts[0];
        let fractionalPart = parts[1] || ''; // Use empty string if no fractional part (shouldn't happen with hasDot logic)

        // Remove trailing zeros from the fractional part
        fractionalPart = fractionalPart.replace(/0+$/, '');

        if (fractionalPart === '') {
            // If fractional part becomes empty (e.g., "12.00" -> "12"), remove the dot.
            finalNum = integerPart;
        } else {
            finalNum = integerPart + '.' + fractionalPart;
        }
    }

    // 2. Remove leading zeros (e.g., "0123" becomes "123", "-0123" becomes "-123").
    // But keep "0" itself or "0.something".
    finalNum = finalNum.replace(/^(-)?0+(?=\d)/, '$1');

    // 3. Handle cases where string might become empty or just "-" due to zero removal, should be "0".
    if (finalNum === '' || finalNum === '-') {
        finalNum = '0';
    }

    console.log(finalNum);
}

// CodinGame platform provides `readline()` function.
// If testing locally, you might need to mock `readline()`:
/*
const inputLines: string[] = [
    "8",
    "4 9 8 . 8 5 2 -", // Example test case
    // "6",
    // "9 8 7 4 2 .", // Hypothetical test case for 9874.2
    // "4",
    // "1 0 0 .", // Test case for 100
    // "4",
    // "0 0 1 -", // Test case for -100
    // "4",
    // "0 0 1 . -", // Test case for -1
    // "3",
    // "0 . -" // Test case for 0
];
let currentLine = 0;
const readline = () => inputLines[currentLine++];
*/

// Call the function to execute the solution
// solve();