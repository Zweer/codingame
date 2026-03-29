/**
 * Calculates the sum of the digits of a given number.
 * @param num The number for which to calculate the digit sum.
 * @returns The sum of the digits.
 */
function getDigitSum(num: number): number {
    let sum = 0;
    // Numbers up to 10^10 fit accurately in JavaScript's standard 'number' type (double-precision float),
    // which can represent integers accurately up to 2^53 - 1 (approximately 9 * 10^15).
    // So direct arithmetic operations (modulo and floor division) are safe and efficient.
    while (num > 0) {
        sum += num % 10;
        num = Math.floor(num / 10);
    }
    return sum;
}

// In CodinGame, `readline()` is used to read input from stdin.
// Parse the input string to an integer.
const N: number = parseInt(readline());

// Calculate the target digit sum that the successor number must have.
const originalSum: number = getDigitSum(N);

// Convert N to an array of its digits for easy manipulation.
// Example: 19 becomes [1, 9]
let digits: number[] = N.toString().split('').map(Number);
let len: number = digits.length;

// Loop from the rightmost digit (least significant, index `len-1`)
// towards the leftmost digit (most significant, index `0`).
// This loop attempts to find the smallest number greater than N
// by modifying digits within the same number of digits as N.
// `i` represents the index of the digit we are attempting to increment.
for (let i = len - 1; i >= 0; i--) {
    // We can only increment a digit if its current value is less than 9.
    // If it's 9, incrementing it would cause a carry-over that's handled
    // by moving to the next digit to the left.
    if (digits[i] < 9) {
        // Calculate the sum of digits to the left of `digits[i]`.
        // These digits (`digits[0]` to `digits[i-1]`) will remain unchanged
        // in the potential new number.
        let prefixSum = 0;
        for (let j = 0; j < i; j++) {
            prefixSum += digits[j];
        }

        // Calculate the tentative new value for `digits[i]` after incrementing.
        let tentativeCurrentDigit = digits[i] + 1;
        
        // Calculate the sum of the fixed prefix and the new tentative current digit.
        let sumAfterPrefixAndIncrement = prefixSum + tentativeCurrentDigit;
        
        // Determine the remaining sum that needs to be distributed among the digits
        // to the right of `digits[i]` (positions `i+1` to `len-1`)
        // to achieve the `originalSum`.
        let sumToDistribute = originalSum - sumAfterPrefixAndIncrement;
        
        // Calculate the number of available positions to the right of `digits[i]`.
        // These are `len - 1 - i` positions (e.g., if i=0, len-1 positions remain).
        let numAvailablePositions = len - 1 - i;
        
        // Calculate the maximum possible sum that can be formed by filling all
        // `numAvailablePositions` with the digit 9.
        let maxDistributableSum = numAvailablePositions * 9;
        
        // Check if `sumToDistribute` can be achieved using the available positions:
        // 1. It must be non-negative (we can't subtract from sum using positive digits).
        // 2. It must not exceed the `maxDistributableSum` (we can't sum more than all 9s).
        if (sumToDistribute >= 0 && sumToDistribute <= maxDistributableSum) {
            // If we reach here, we've found the "pivot" digit `digits[i]`
            // that can be incremented to form the smallest valid successor.

            // Initialize an array for the result digits.
            // It will have the same length as the original number.
            let resultDigits: number[] = new Array(len).fill(0);
            
            // Copy the unchanged prefix digits from the original number.
            for (let k = 0; k < i; k++) {
                resultDigits[k] = digits[k];
            }
            
            // Set the incremented pivot digit in the result.
            resultDigits[i] = tentativeCurrentDigit;
            
            // Distribute the `sumToDistribute` to the rightmost positions (`len-1` down to `i+1`).
            // We fill these positions with as many 9s as possible from the right.
            // This greedy placement ensures the resulting number is the smallest.
            for (let k = len - 1; k > i; k--) {
                const val = Math.min(9, sumToDistribute); // Take up to 9, or remaining sum if less
                resultDigits[k] = val;
                sumToDistribute -= val; // Reduce the sum to be distributed
            }
            
            // Convert the array of digits back to a number string and then parse it to an integer.
            // Print the result to stdout.
            console.log(parseInt(resultDigits.join('')));
            // Exit the program as the solution is found.
            return;
        }
    }
}

// If the loop completes without finding a solution within the same number of digits,
// it means the smallest successor number must have one more digit than N.
// This scenario occurs when N consists primarily of 9s (e.g., 9, 99, 199, etc.)
// and incrementing any digit within the same length results in an invalid sum distribution.

// The new number will have `len + 1` digits.
// To make it the smallest possible, it will start with '1'.
let newResultDigits: number[] = new Array(len + 1).fill(0);
newResultDigits[0] = 1; // The new leading digit (to make the number smallest)

// The remaining `len` digits (at indices 1 to `len`) must sum to `originalSum - 1`
// (since the leading '1' contributes 1 to the total sum).
let sumToDistributeForNewLength = originalSum - 1;

// Distribute this `sumToDistributeForNewLength` among the remaining `len` positions.
// We fill these positions from right to left (from index `len` down to `1`) with 9s.
// This ensures the smallest numerical value for the overall number.
for (let k = len; k >= 1; k--) {
    const val = Math.min(9, sumToDistributeForNewLength);
    newResultDigits[k] = val;
    sumToDistributeForNewLength -= val;
}

// Convert the new array of digits (now `len+1` long) to a number string and parse to integer.
// Print the final result.
console.log(parseInt(newResultDigits.join('')));