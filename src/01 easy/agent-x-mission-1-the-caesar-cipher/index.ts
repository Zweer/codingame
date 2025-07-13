// Define constants for the ASCII range
const MIN_ASCII = 32;
const MAX_ASCII = 126;
const RANGE_SIZE = MAX_ASCII - MIN_ASCII + 1; // Total number of characters in the cipher's range (126 - 32 + 1 = 95)

/**
 * Decrypts a single character based on the Caesar cipher rules.
 * This function handles the wrap-around within the defined ASCII range.
 * @param cipherChar The character from the ciphertext.
 * @param key The decryption key.
 * @returns The decrypted character.
 */
function decryptChar(cipherChar: string, key: number): string {
    const charCode = cipherChar.charCodeAt(0);

    // Normalize charCode to be 0-indexed within the cipher's range (0 to RANGE_SIZE - 1)
    const normalizedCharCode = charCode - MIN_ASCII;

    // Apply the decryption shift.
    // (normalizedCharCode - key % RANGE_SIZE) performs the shift.
    // Adding RANGE_SIZE before the modulo ensures the result is always non-negative,
    // which is essential for correct wrap-around when `normalizedCharCode - key` is negative.
    const decryptedNormalizedCharCode = (normalizedCharCode - (key % RANGE_SIZE) + RANGE_SIZE) % RANGE_SIZE;

    // Convert the normalized decrypted character code back to its original ASCII value
    const decryptedCharCode = decryptedNormalizedCharCode + MIN_ASCII;

    return String.fromCharCode(decryptedCharCode);
}

/**
 * Decrypts an entire message using the Caesar cipher with a given key.
 * @param ciphertext The encrypted message.
 * @param key The decryption key.
 * @returns The decrypted plaintext message.
 */
function decryptMessage(ciphertext: string, key: number): string {
    let decryptedMessage = '';
    for (let i = 0; i < ciphertext.length; i++) {
        decryptedMessage += decryptChar(ciphertext[i], key);
    }
    return decryptedMessage;
}

// In a CodinGame environment, `readline()` reads input from stdin
// and `console.log()` writes output to stdout.
// Declare `readline` function for TypeScript compilation if not globally available.
declare function readline(): string;

// Read the encrypted message and the known word from input
const ciphertext: string = readline();
const knownWord: string = readline();

// Convert the known word to lowercase for case-insensitive matching
const targetWordLower = knownWord.toLowerCase();

// Define the regular expression for word delimiters specified in the problem.
// `[ ,.?;:!]` matches any single delimiter character.
// `+` ensures it matches one or more consecutive delimiters (e.g., "word!!" becomes "word ").
// `g` flag ensures all occurrences are replaced, not just the first.
const wordDelimitersRegex = /[ ,.?;:!]+/g;

// Iterate through all possible decryption keys (0 to 94)
for (let key = 0; key < RANGE_SIZE; key++) {
    // Decrypt the entire message with the current key
    const decryptedMessage = decryptMessage(ciphertext, key);

    // Prepare the decrypted message for word checking:
    // 1. Replace all delimiter sequences with a single space to normalize word boundaries.
    // 2. Convert the entire string to lowercase for case-insensitive comparison.
    // 3. Split the string by spaces to get an array of words.
    // 4. Filter out any empty strings that might result from splitting (e.g., from multiple spaces).
    const normalizedDecryptedMessage = decryptedMessage.replace(wordDelimitersRegex, ' ').toLowerCase();
    const wordsInDecryptedMessage = normalizedDecryptedMessage.split(' ').filter(word => word.length > 0);

    // Check if the lowercase target word exists as a full word in the array of decrypted words.
    if (wordsInDecryptedMessage.includes(targetWordLower)) {
        // If the known word is found, we have the correct key and plaintext.
        // Print the key and the original-cased decrypted message.
        console.log(key);
        console.log(decryptedMessage);
        // Exit the loop as we've found the solution.
        break;
    }
}