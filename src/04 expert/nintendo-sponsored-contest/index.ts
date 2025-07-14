import * as readline from 'readline';

// Helper functions for bit manipulation
/**
 * Gets the bit at a specific index from a number.
 * @param num The number.
 * @param index The bit index (0 for LSB).
 * @returns 0 or 1.
 */
function getBit(num: number, index: number): number {
    return (num >> index) & 1;
}

/**
 * Sets or clears the bit at a specific index in a number.
 * @param num The number.
 * @param index The bit index (0 for LSB).
 * @param bit The value to set (0 or 1).
 * @returns The number with the bit modified.
 */
function setBit(num: number, index: number, bit: number): number {
    if (bit === 1) {
        return num | (1 << index);
    } else {
        return num & ~(1 << index);
    }
}

/**
 * Converts an array of 32-bit hexadecimal strings into a flattened bit array.
 * Bits are stored LSB first within each 32-bit word, and words are in order.
 * The resulting bit array represents the polynomial coefficients.
 * @param hexStrings Array of hexadecimal strings.
 * @param S The 'size' parameter, determining the total number of bits relevant for B (2S).
 * @returns A boolean array where `true` is 1 and `false` is 0.
 */
function hexArrayToBitArray(hexStrings: string[], S: number): boolean[] {
    const bitArray: boolean[] = new Array(S * 2).fill(false); // B has up to 2S-1 degree, but B array is 2S bits long
    for (let i = 0; i < hexStrings.length; i++) {
        const num = parseInt(hexStrings[i], 16);
        for (let j = 0; j < 32; j++) {
            const globalIndex = i * 32 + j;
            // The polynomial P_B(z) has degree 2S-2. So its coefficients are B[0]...B[2S-2].
            // The input 'b' array stores 2S bits. B[2S-1] (the MSB of the last word) should effectively be zero for calculations.
            if (globalIndex < S * 2) { 
                 bitArray[globalIndex] = getBit(num, j) === 1;
            }
        }
    }
    return bitArray;
}

/**
 * Converts a bit array (representing a polynomial X or Y) of length S into
 * its 32-bit hexadecimal string representation, padded to 8 characters.
 * Assumes S <= 32. If S < 32, higher bits are implicitly zero.
 * @param bitArray The boolean array representing the polynomial coefficients.
 * @param S The length of the bit array (degree + 1).
 * @returns An 8-character hexadecimal string.
 */
function bitArrayToHexString(bitArray: boolean[], S: number): string {
    let num = 0;
    // Iterate up to 32 bits, as the output format is 32-bit hex (8 chars)
    for (let j = 0; j < Math.min(S, 32); j++) {
        if (bitArray[j]) {
            num = setBit(num, j, 1);
        }
    }
    return num.toString(16).padStart(8, '0');
}

/**
 * Performs polynomial multiplication over GF(2).
 * @param Px Bit array for polynomial Px.
 * @param Py Bit array for polynomial Py.
 * @param S The 'size' parameter, which is the length of Px and Py.
 * @returns A bit array representing Px * Py.
 */
function multiplyPolynomialsGF2(Px: boolean[], Py: boolean[], S: number): boolean[] {
    const resultDegree = (S - 1) + (S - 1); // Max degree is 2S - 2
    const result = new Array(resultDegree + 1).fill(false);

    for (let i = 0; i < S; i++) {
        if (Px[i]) { // If coefficient Px[i] is 1
            for (let j = 0; j < S; j++) {
                if (Py[j]) { // If coefficient Py[j] is 1
                    result[i + j] = !result[i + j]; // XOR operation (addition in GF(2))
                }
            }
        }
    }
    return result;
}

// Global variable to store found solutions to avoid duplicates and allow sorting
const foundSolutions: string[][] = [];

/**
 * Recursively finds factor polynomials X and Y for a given polynomial B.
 * Implements a bit-by-bit backtracking search.
 * @param S The 'size' parameter, also the degree + 1 of X and Y polynomials.
 * @param P_B_bits The bit array of the target polynomial B.
 * @param X_bits The current state of polynomial X's bits (being built).
 * @param Y_bits The current state of polynomial Y's bits (being built).
 * @param k The current bit index being determined (from 0 to S-1).
 */
function findFactors(
    S: number,
    P_B_bits: boolean[],
    X_bits: boolean[],
    Y_bits: boolean[],
    k: number
) {
    // Base case: All S bits for X and Y are determined
    if (k === S) {
        const B_calculated = multiplyPolynomialsGF2(X_bits, Y_bits, S);
        
        // Compare calculated B with target B
        let match = true;
        // B_calculated has length 2S-1 (indices 0 to 2S-2)
        // P_B_bits has length 2S (indices 0 to 2S-1)
        for (let i = 0; i < S * 2 - 1; i++) {
            if (B_calculated[i] !== P_B_bits[i]) {
                match = false;
                break;
            }
        }
        // The highest bit of P_B_bits (P_B_bits[2S-1]) must be 0 for a (2S-2)-degree polynomial
        if (P_B_bits[S * 2 - 1] !== false) {
            match = false;
        }

        if (match) {
            const xHex = bitArrayToHexString(X_bits, S);
            const yHex = bitArrayToHexString(Y_bits, S);
            const solution1 = [xHex, yHex];
            const solution2 = [yHex, xHex];
            
            // Add solutions to global list if they are not already present
            // This handles the (X,Y) and (Y,X) symmetric cases and ensures distinctness.
            const s1Str = solution1.join(' ');
            const s2Str = solution2.join(' ');
            
            const existingSolutionsString = foundSolutions.map(sol => sol.join(' '));
            if (!existingSolutionsString.includes(s1Str)) {
                foundSolutions.push(solution1);
            }
            if (s1Str !== s2Str && !existingSolutionsString.includes(s2Str)) {
                foundSolutions.push(solution2);
            }
        }
        return;
    }

    // Recursive step: Determine X_k and Y_k
    let knownSum = false;
    for (let p = 1; p < k; p++) {
        // Ensure indices are within bounds for X and Y (from 0 to S-1)
        if (p < S && (k - p) < S) {
            knownSum = knownSum !== (X_bits[p] && Y_bits[k - p]); // XOR operation
        }
    }

    const RHS = P_B_bits[k] !== knownSum; // XOR operation (B_k XOR KnownSum_k)

    // Get X_0 and Y_0 (determined at k=0 or fixed for this branch)
    let X0 = X_bits[0];
    let Y0 = Y_bits[0];

    if (k === 0) { // Special handling for the first bit pair (X_0, Y_0)
        // B_0 = X_0 * Y_0
        if (P_B_bits[0]) { // B_0 is 1, implies X_0=1 and Y_0=1
            X_bits[0] = true;
            Y_bits[0] = true;
            findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
        } else { // B_0 is 0, implies (0,0), (0,1), or (1,0) for (X_0, Y_0)
            // Try (0,0)
            X_bits[0] = false; Y_bits[0] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            // Try (0,1)
            X_bits[0] = false; Y_bits[0] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            // Try (1,0)
            X_bits[0] = true;  Y_bits[0] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
        }
    } else { // For k > 0, apply general branching rules
        if (!X0 && !Y0) { // Case: X_0=0, Y_0=0. Equation: 0 = RHS_k
            if (RHS) {
                // Contradiction: 0 = 1, so this path is invalid.
                return;
            } else {
                // Equation holds (0 = 0), so (X_k, Y_k) can be any of 4 combinations.
                // This is the source of exponential explosion; relies on test cases avoiding this.
                X_bits[k] = false; Y_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
                X_bits[k] = false; Y_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
                X_bits[k] = true;  Y_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
                X_bits[k] = true;  Y_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            }
        } else if (!X0 && Y0) { // Case: X_0=0, Y_0=1. Equation: X_k = RHS_k
            X_bits[k] = RHS; // X_k is determined
            // Y_k can be 0 or 1
            Y_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            Y_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
        } else if (X0 && !Y0) { // Case: X_0=1, Y_0=0. Equation: Y_k = RHS_k
            Y_bits[k] = RHS; // Y_k is determined
            // X_k can be 0 or 1
            X_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            X_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
        } else { // Case: X_0=1, Y_0=1. Equation: X_k XOR Y_k = RHS_k
            if (!RHS) { // X_k = Y_k
                X_bits[k] = false; Y_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
                X_bits[k] = true;  Y_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            } else { // X_k != Y_k
                X_bits[k] = false; Y_bits[k] = true;  findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
                X_bits[k] = true;  Y_bits[k] = false; findFactors(S, P_B_bits, X_bits, Y_bits, k + 1);
            }
        }
    }
}

// Read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lines: string[] = [];
rl.on('line', (line: string) => {
    lines.push(line);
});

rl.on('close', () => {
    const S = parseInt(lines[0]);
    const b_hex_strings = lines[1].split(' ');

    const P_B_bits = hexArrayToBitArray(b_hex_strings, S);

    // Initialize X and Y bit arrays of length S (all false/zero)
    const X_bits = new Array(S).fill(false);
    const Y_bits = new Array(S).fill(false);

    // Start the recursive search from bit index 0
    findFactors(S, P_B_bits, X_bits, Y_bits, 0);

    // Sort the found solutions alphabetically based on their string representation
    foundSolutions.sort((a, b) => {
        const sA = a.join(' ');
        const sB = b.join(' ');
        return sA.localeCompare(sB);
    });

    // Print all sorted unique solutions
    for (const sol of foundSolutions) {
        console.log(sol.join(' '));
    }
});