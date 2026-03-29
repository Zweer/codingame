// Read input N
const N: number = parseInt(readline());

// Array to store digits (in reverse order initially)
let balancedTernaryDigits: string[] = [];
// Use a mutable variable for the number being processed
let currentN: number = N;

// Handle the special case for N = 0
if (currentN === 0) {
    console.log('0');
} else {
    // Loop until the number becomes 0
    while (currentN !== 0) {
        let remainder: number = currentN % 3;

        if (remainder === 0) {
            balancedTernaryDigits.push('0');
            currentN /= 3;
        } else if (remainder === 1 || remainder === -2) {
            // If remainder is 1 (e.g., 1, 4, 7)
            // Or if remainder is -2 (e.g., -2, -5, -8). -2 means number is 3k+1 for some k.
            // In both cases, the balanced ternary digit is 1.
            balancedTernaryDigits.push('1');
            currentN = (currentN - 1) / 3;
        } else { // remainder === -1 or remainder === 2
            // If remainder is -1 (e.g., -1, -4, -7)
            // Or if remainder is 2 (e.g., 2, 5, 8). 2 means number is 3k-1 for some k.
            // In both cases, the balanced ternary digit is -1 ('T').
            balancedTernaryDigits.push('T');
            currentN = (currentN + 1) / 3;
        }
    }

    // The digits were collected from least significant to most significant.
    // Reverse the array and join to get the correct string representation.
    console.log(balancedTernaryDigits.reverse().join(''));
}