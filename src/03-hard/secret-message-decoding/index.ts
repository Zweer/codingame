import * as readline from 'readline';

// Define the Galois Field characteristic (modulus)
const P = 127;

// Function for modular arithmetic, ensuring a positive result
function mod(n: number, m: number): number {
    return (n % m + m) % m;
}

// Function for modular exponentiation (base^exp % mod)
// Used for calculating modular inverse using Fermat's Little Theorem
function power(base: number, exp: number, m: number): number {
    let res = 1;
    base = mod(base, m); // Ensure base is within [0, m-1]
    while (exp > 0) {
        if (exp % 2 === 1) { // If exponent is odd, multiply result by base
            res = mod(res * base, m);
        }
        base = mod(base * base, m); // Square the base
        exp = Math.floor(exp / 2); // Halve the exponent
    }
    return res;
}

// Function to find the modular multiplicative inverse of n modulo m
// Uses Fermat's Little Theorem: n^(m-2) % m for prime m
function modInverse(n: number, m: number): number {
    if (n === 0) {
        throw new Error("Modular inverse of 0 does not exist.");
    }
    return power(n, m - 2, m);
}

let hs: number; // Size of the encoding header (number of message parts)
let ms: number; // Number of encoded characters in each part (length of each original message part)
let inputLines: string[] = []; // Stores the input strings

// Read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input: string) => {
    if (typeof hs === 'undefined') {
        hs = parseInt(input);
    } else if (typeof ms === 'undefined') {
        ms = parseInt(input);
    } else {
        inputLines.push(input);
    }
});

rl.on('close', () => {
    // Initialize the augmented matrix.
    // It will be hs rows by (hs + ms) columns.
    // The first hs columns are for the encoded header, the last ms for the encoded message characters.
    const augmentedMatrix: number[][] = Array(hs).fill(0).map(() => Array(hs + ms).fill(0));

    // Populate the augmented matrix with ASCII values from input strings
    for (let i = 0; i < hs; i++) {
        const lineChars = inputLines[i].split('');
        for (let j = 0; j < hs + ms; j++) {
            augmentedMatrix[i][j] = lineChars[j].charCodeAt(0);
        }
    }

    // Perform Gaussian Elimination
    for (let j = 0; j < hs; j++) { // Iterate through pivot columns (from 0 to hs-1)
        // Find pivot row: find a row 'k' (from current row 'j' downwards) with a non-zero element in column 'j'
        let pivotRow = j;
        for (let i = j + 1; i < hs; i++) {
            // We look for a non-zero element. For numerical stability in floating-point,
            // one might pick the largest absolute value, but for GF(P) any non-zero works.
            if (augmentedMatrix[i][j] !== 0) { // Simple check for non-zero pivot
                pivotRow = i;
                break; // Found a suitable pivot, break and use this row
            }
        }
        // If the current pivot at augmentedMatrix[j][j] is 0 but we found a non-zero pivot below, swap.
        if (augmentedMatrix[j][j] === 0 && pivotRow !== j) {
             [augmentedMatrix[j], augmentedMatrix[pivotRow]] = [augmentedMatrix[pivotRow], augmentedMatrix[j]];
        }
        // If augmentedMatrix[j][j] is still 0 after potential swap, and we couldn't find a non-zero pivot
        // in this column (shouldn't happen for valid, invertible matrices in CodinGame contexts).
        if (augmentedMatrix[j][j] === 0) {
            // This indicates a singular matrix or an issue with the input.
            // In a competitive programming context, this case is usually not reached for valid test cases.
            // For robustness, could throw an error or handle accordingly.
            // console.error("Matrix is singular or system is unsolvable.");
            // process.exit(1);
        }


        // Make the pivot element (augmentedMatrix[j][j]) equal to 1
        const pivotVal = augmentedMatrix[j][j];
        const pivotInv = modInverse(pivotVal, P);
        for (let col = j; col < hs + ms; col++) {
            augmentedMatrix[j][col] = mod(augmentedMatrix[j][col] * pivotInv, P);
        }

        // Eliminate other rows: make all other elements in column 'j' zero
        for (let i = 0; i < hs; i++) {
            if (i !== j) { // For every row except the current pivot row
                const factor = augmentedMatrix[i][j]; // This is the value to eliminate
                for (let col = j; col < hs + ms; col++) {
                    const termToSubtract = mod(factor * augmentedMatrix[j][col], P);
                    augmentedMatrix[i][col] = mod(augmentedMatrix[i][col] - termToSubtract, P);
                }
            }
        }
    }

    // Extract the decoded message
    // The decoded message parts are now in the columns from 'hs' to 'hs + ms - 1'
    let decodedMessage = '';
    for (let i = 0; i < hs; i++) { // Iterate through each decoded original message part (rows)
        for (let k = 0; k < ms; k++) { // Iterate through characters within each part (columns)
            const charCode = augmentedMatrix[i][hs + k];
            decodedMessage += String.fromCharCode(charCode);
        }
    }

    console.log(decodedMessage);
});