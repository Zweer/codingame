/**
 * Reads a line of input from stdin.
 * In the CodinGame environment, this function is typically provided globally.
 * If running locally, you might need to mock or implement it (e.g., using 'readline' module).
 */
declare function readline(): string;

const n: number = parseInt(readline());

let totalSumOfDivisors: number = 0;

// The trick is to iterate through each potential divisor 'd' from 1 to 'n'.
// For each 'd', count how many times it appears as a divisor for numbers
// between 1 and 'n'.
// A number 'd' is a divisor for its multiples: d*1, d*2, d*3, ...
// We need to find how many multiples of 'd' are less than or equal to 'n'.
// This count is simply floor(n / d).
// Each time 'd' is a divisor, it contributes 'd' to the sum.
// So, the total contribution of 'd' to the grand sum is 'd * floor(n / d)'.
for (let d = 1; d <= n; d++) {
    totalSumOfDivisors += d * Math.floor(n / d);
}

// Print the final calculated sum.
console.log(totalSumOfDivisors);