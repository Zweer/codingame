/**
 * Reads a line from standard input. In a CodinGame environment, this function
 * is globally available. For local testing, you might need to mock it.
 * declare function readline(): string;
 */

/**
 * Prints a line to standard output. In a CodinGame environment, this function
 * is globally available. For local testing, you might need to mock it.
 * declare function print(message: any): void;
 */

// Read N, the number of integers
const N: number = parseInt(readline());

// Read the list of N integers as a space-separated string
const Ik_str: string = readline();

// Convert the string of numbers into an array of numbers
const Ik: number[] = Ik_str.split(' ').map(Number);

// Map to store information about sequences ending at a particular number.
// Key: The number 'x' that ends a sequence.
// Value: An object { length: number, start: number }
//   - length: The length of the longest incrementing sequence found *so far* that ends with 'x'.
//   - start: The starting number of that longest sequence ending with 'x'.
const sequenceInfo = new Map<number, { length: number; start: number }>();

// Variables to track the overall longest sequence found across all numbers.
let maxLength: number = 0;
// Initialize bestStartNum with Infinity to ensure any valid start number will be smaller,
// correctly handling the tie-breaking rule (lowest starting integer).
let bestStartNum: number = Infinity; 

// Iterate through each number in the input list
for (const currentNum of Ik) {
    // The number that would precede currentNum in an incrementing sequence
    const prevNum = currentNum - 1;

    let currentLength: number;
    let currentStart: number;

    // Check if a sequence ending with prevNum exists in our map
    if (sequenceInfo.has(prevNum)) {
        // If it exists, currentNum can extend that sequence.
        const prevSeq = sequenceInfo.get(prevNum)!; // '!' asserts that prevSeq is not undefined
        currentLength = prevSeq.length + 1;
        currentStart = prevSeq.start;
    } else {
        // If no sequence ends with prevNum, currentNum starts a new sequence of length 1.
        currentLength = 1;
        currentStart = currentNum;
    }

    // Update the sequenceInfo map for currentNum.
    // We only update if the new sequence (ending at currentNum) is better than what's currently stored.
    // "Better" means:
    // 1. It's longer than the existing sequence ending at currentNum.
    // 2. It's the same length, but starts with a lower number.
    const existingInfo = sequenceInfo.get(currentNum);
    if (!existingInfo || currentLength > existingInfo.length || (currentLength === existingInfo.length && currentStart < existingInfo.start)) {
        sequenceInfo.set(currentNum, { length: currentLength, start: currentStart });
    }

    // Update the overall best sequence found so far across all numbers processed.
    if (currentLength > maxLength) {
        // If the current sequence is strictly longer, it's the new best.
        maxLength = currentLength;
        bestStartNum = currentStart;
    } else if (currentLength === maxLength) {
        // If the current sequence has the same maximum length, apply the tie-breaking rule:
        // prefer the one with the lowest starting integer.
        if (currentStart < bestStartNum) {
            bestStartNum = currentStart;
        }
    }
}

// Reconstruct the result sequence based on the `maxLength` and `bestStartNum`.
// If N > 0, maxLength will always be at least 1 (as any single number forms a sequence of length 1).
const resultSequence: number[] = [];
for (let i = 0; i < maxLength; i++) {
    resultSequence.push(bestStartNum + i);
}

// Print the result sequence, with numbers separated by spaces.
console.log(resultSequence.join(' '));