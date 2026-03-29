// Standard input reading function (provided by CodinGame environment)
declare function readline(): string;

/**
 * Decrypts a single character using a Caesar cipher.
 * @param char The character to decrypt.
 * @param shift The numerical shift to apply. A negative shift means moving backwards in the alphabet.
 * @returns The decrypted character. Non-alphabetic characters are returned as is.
 */
function decryptChar(char: string, shift: number): string {
    const charCode = char.charCodeAt(0);

    // Handle uppercase letters (A-Z, ASCII 65-90)
    if (charCode >= 65 && charCode <= 90) {
        // Calculate new position (0-25) relative to 'A'
        // Add shift, then ensure positive modulo by adding 26 before final modulo
        return String.fromCharCode(((charCode - 65 + shift) % 26 + 26) % 26 + 65);
    }
    // Handle lowercase letters (a-z, ASCII 97-122)
    else if (charCode >= 97 && charCode <= 122) {
        // Calculate new position (0-25) relative to 'a'
        // Add shift, then ensure positive modulo by adding 26 before final modulo
        return String.fromCharCode(((charCode - 97 + shift) % 26 + 26) % 26 + 97);
    }
    // For non-alphabetic characters (spaces, hyphens, punctuation, etc.), return them unchanged
    return char;
}

// A mapping from spelled-out number words to their corresponding digit strings
const numberWordsToDigits: { [key: string]: string } = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9"
};

// Read the entire encrypted message from standard input
const inputMessage: string = readline();

// Based on the analysis, the decryption shift is -7
const decryptionShift = -7;

// The combination part of the message is always found after ": "
// For example: "Aol zhml jvtipuhapvu pz: zpe-mvby-zpe-mvby-aoyll"
// We are interested in "zpe-mvby-zpe-mvby-aoyll"
const parts = inputMessage.split(': ');
const encryptedCombinationPart = parts[1]; 

// The encrypted words are separated by hyphens
const encryptedWords = encryptedCombinationPart.split('-');

let finalCombination = ""; // This string will build the numeric safe combination

// Iterate through each encrypted word (e.g., "zpe", "mvby", "aoyll")
for (const encryptedWord of encryptedWords) {
    let decryptedWord = "";
    // Decrypt each character of the current word
    for (const char of encryptedWord) {
        decryptedWord += decryptChar(char, decryptionShift);
    }
    
    // Look up the fully decrypted word (e.g., "six", "four", "three") in our mapping
    const digit = numberWordsToDigits[decryptedWord];
    
    // If a valid number word was found, append its digit to the final combination
    // The puzzle implies valid inputs, so `digit` should always be defined here.
    if (digit !== undefined) {
        finalCombination += digit;
    }
}

// Print the resulting safe combination to standard output
console.log(finalCombination);