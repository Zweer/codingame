// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Flips a character: '1' becomes '0', '0' becomes '1'.
 * @param char The character to flip ('0' or '1').
 * @returns The flipped character.
 */
function flip(char: string): string {
    return char === '1' ? '0' : '1';
}

/**
 * Recursively finds the character at a specific index k in the paper-folding curve of order n.
 * Uses BigInt for index k and intermediate length calculations to handle large numbers.
 *
 * @param n The order of the curve (1 to 50).
 * @param k The 0-based index of the character to retrieve (can be very large).
 * @returns The character ('0' or '1') at the specified position.
 */
function getChar(n: number, k: bigint): string {
    // Base case: S(1) is "1"
    if (n === 1) {
        return '1';
    }

    // Calculate the length of S(n-1).
    // Length L = 2^(n-1) - 1.
    // Use BigInt for bit shift to avoid precision issues with large numbers (2^49 can be large).
    const L: bigint = (1n << BigInt(n - 1)) - 1n;

    if (k < L) {
        // The character is in the first S(n-1) part
        return getChar(n - 1, k);
    } else if (k === L) {
        // The character is the middle '1'
        return '1';
    } else { // k > L
        // The character is in the reverseAndFlip(S(n-1)) part.
        // Calculate its corresponding index in S(n-1).
        // This is (L - 1 - (k - (L + 1))) which simplifies to (2*L - k).
        const originalIndex: bigint = 2n * L - k;
        const charInPrevSequence = getChar(n - 1, originalIndex);
        return flip(charInPrevSequence);
    }
}

// Read N (order of the curve)
const N: number = parseInt(readline());

// Read starting and ending indices as BigInts
const [startIndexStr, endIndexStr] = readline().split(' ');
const startIndex: bigint = BigInt(startIndexStr);
const endIndex: bigint = BigInt(endIndexStr);

let result: string = '';
// Iterate from startIndex to endIndex (inclusive) to build the sub-sequence
for (let i = startIndex; i <= endIndex; i++) {
    result += getChar(N, i);
}

// Output the generated sub-sequence
print(result);