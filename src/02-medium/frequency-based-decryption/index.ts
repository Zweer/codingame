// Define standard English letter frequencies (percentages)
// Index 0 for A, 1 for B, ..., 25 for Z
const ENGLISH_FREQUENCIES: number[] = [
    8.08, 1.67, 3.18, 3.99, 12.56, 2.17, 1.80, 5.27, 7.24, 0.14, 0.63,
    4.04, 2.60, 7.38, 7.47, 1.91, 0.09, 6.42, 6.59, 9.15, 2.79, 1.00,
    1.89, 0.21, 1.65, 0.07
];

const ALPHABET_SIZE = 26;
const A_CODE = 'A'.charCodeAt(0);
const Z_CODE = 'Z'.charCodeAt(0);
const a_CODE = 'a'.charCodeAt(0);
const z_CODE = 'z'.charCodeAt(0);

// Read the encoded message from standard input
// In a CodinGame environment, `readline()` is typically provided.
const message: string = readline();

// 1. Calculate observed frequencies of alphabetical characters in the encoded message
const observedCounts: number[] = new Array(ALPHABET_SIZE).fill(0);
let totalAlphabeticalChars = 0;

for (const char of message) {
    const charCode = char.charCodeAt(0);
    if (charCode >= A_CODE && charCode <= Z_CODE) {
        observedCounts[charCode - A_CODE]++;
        totalAlphabeticalChars++;
    } else if (charCode >= a_CODE && charCode <= z_CODE) {
        // Treat lowercase letters as their uppercase equivalent for frequency counting
        observedCounts[charCode - a_CODE]++;
        totalAlphabeticalChars++;
    }
}

const observedFrequencies: number[] = new Array(ALPHABET_SIZE).fill(0);
if (totalAlphabeticalChars > 0) {
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        observedFrequencies[i] = (observedCounts[i] / totalAlphabeticalChars) * 100;
    }
}

// 2. Determine the most probable decryption shift using sum of squared differences
let bestShift = 0;
let minSquaredDifference = Infinity;

for (let potentialShift = 0; potentialShift < ALPHABET_SIZE; potentialShift++) {
    let currentSquaredDifference = 0;
    const candidatePlainTextFrequencies: number[] = new Array(ALPHABET_SIZE).fill(0);

    // Apply the `potentialShift` as a decryption shift to the observed frequencies.
    // This simulates what the plaintext's frequency distribution would look like.
    // If the encrypted character at index `i` (e.g., 'K' or 10) is decrypted by `potentialShift` (e.g., 3)
    // it maps to a plaintext character at index `(i - potentialShift + ALPHABET_SIZE) % ALPHABET_SIZE` (e.g., 'H' or 7).
    // So, the frequency observed for `i` in the ciphertext is assigned to the `plainCharIndex`.
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        const plainCharIndex = (i - potentialShift + ALPHABET_SIZE) % ALPHABET_SIZE;
        candidatePlainTextFrequencies[plainCharIndex] = observedFrequencies[i];
    }

    // Compare the candidate plaintext frequencies with the standard English frequencies
    // using sum of squared differences.
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        currentSquaredDifference += Math.pow(candidatePlainTextFrequencies[i] - ENGLISH_FREQUENCIES[i], 2);
    }

    // If this shift yields a better match, update bestShift
    if (currentSquaredDifference < minSquaredDifference) {
        minSquaredDifference = currentSquaredDifference;
        bestShift = potentialShift;
    }
}

// 3. Decrypt the message using the bestShift
let decodedMessage = '';

for (const char of message) {
    const charCode = char.charCodeAt(0);
    if (charCode >= A_CODE && charCode <= Z_CODE) {
        // Uppercase letter: apply decryption shift and maintain case
        let originalIndex = charCode - A_CODE;
        let decodedIndex = (originalIndex - bestShift + ALPHABET_SIZE) % ALPHABET_SIZE;
        decodedMessage += String.fromCharCode(decodedIndex + A_CODE);
    } else if (charCode >= a_CODE && charCode <= z_CODE) {
        // Lowercase letter: apply decryption shift and maintain case
        let originalIndex = charCode - a_CODE;
        let decodedIndex = (originalIndex - bestShift + ALPHABET_SIZE) % ALPHABET_SIZE;
        decodedMessage += String.fromCharCode(decodedIndex + a_CODE);
    } else {
        // Non-alphabetical character: append as is
        decodedMessage += char;
    }
}

// Output the decoded message to standard output
console.log(decodedMessage);