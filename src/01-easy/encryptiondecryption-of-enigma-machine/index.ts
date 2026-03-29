/**
 * Reads a line of input from stdin.
 * (This function is typically provided by the CodinGame environment)
 * declare function readline(): string;
 *
 * Prints a line to stdout.
 * (This function is typically provided by the CodinGame environment)
 * declare function print(message: string): void;
 */

// Read input
const operation: string = readline(); // ENCODE or DECODE
const N: number = parseInt(readline()); // Starting shift
const rotor1: string = readline();
const rotor2: string = readline();
const rotor3: string = readline();
const message: string = readline();

// Helper for modulo arithmetic that correctly handles negative results
function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

// ASCII code for 'A' to easily convert between character and 0-25 index
const A_CODE: number = 'A'.charCodeAt(0);

/**
 * Applies a rotor mapping for either encryption or decryption.
 *
 * For encryption: maps the input character's alphabet position to the character
 * at that position in the rotorMap.
 * Example: if char='A' (index 0) and rotorMap="BC...", returns rotorMap[0] which is 'B'.
 *
 * For decryption: finds the index of the input character within the rotorMap,
 * then maps back to the alphabet character at that index.
 * Example: if char='B' and rotorMap="BC...", returns the character
 * at index rotorMap.indexOf('B') (which is 0) in the standard alphabet, i.e., 'A'.
 *
 * @param char The character to process (uppercase A-Z).
 * @param rotorMap The rotor string (e.g., "BDFHJLCPRTXVZNYEIWGAKMUSQO").
 * @param isEncrypt True for encryption, false for decryption.
 * @returns The character after rotor mapping.
 */
function applyRotor(char: string, rotorMap: string, isEncrypt: boolean): string {
    if (isEncrypt) {
        // Encryption: Map the character at its alphabet position to the character at that position in the rotorMap.
        const charIndex = char.charCodeAt(0) - A_CODE;
        return rotorMap[charIndex];
    } else { // Decrypt
        // Decryption: Find the index of the character in the rotorMap, then map back to the alphabet character at that index.
        const charIndexInRotor = rotorMap.indexOf(char);
        return String.fromCharCode(A_CODE + charIndexInRotor);
    }
}

let result: string = '';

if (operation === 'ENCODE') {
    // Encryption steps:
    // 1. Caesar Shift
    let currentMessage = '';
    for (let i = 0; i < message.length; i++) {
        const originalChar = message[i];
        const originalCharIndex = originalChar.charCodeAt(0) - A_CODE;
        const shiftAmount = N + i; // Shift increases for each character
        const newCharIndex = mod(originalCharIndex + shiftAmount, 26);
        currentMessage += String.fromCharCode(A_CODE + newCharIndex);
    }

    // 2. Apply Rotor I
    let afterRotor1 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterRotor1 += applyRotor(currentMessage[i], rotor1, true);
    }
    currentMessage = afterRotor1; // Update current message for next rotor

    // 3. Apply Rotor II
    let afterRotor2 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterRotor2 += applyRotor(currentMessage[i], rotor2, true);
    }
    currentMessage = afterRotor2; // Update current message for next rotor

    // 4. Apply Rotor III
    let afterRotor3 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterRotor3 += applyRotor(currentMessage[i], rotor3, true);
    }
    result = afterRotor3;

} else { // DECODE
    // Decryption steps (reverse order of encryption, inverse operations):
    let currentMessage = message; // Start with the encrypted message

    // 1. Apply Inverse Rotor III
    let afterInverseRotor3 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterInverseRotor3 += applyRotor(currentMessage[i], rotor3, false);
    }
    currentMessage = afterInverseRotor3; // Update current message for next rotor

    // 2. Apply Inverse Rotor II
    let afterInverseRotor2 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterInverseRotor2 += applyRotor(currentMessage[i], rotor2, false);
    }
    currentMessage = afterInverseRotor2; // Update current message for next rotor

    // 3. Apply Inverse Rotor I
    let afterInverseRotor1 = '';
    for (let i = 0; i < currentMessage.length; i++) {
        afterInverseRotor1 += applyRotor(currentMessage[i], rotor1, false);
    }
    currentMessage = afterInverseRotor1; // Update current message for next rotor

    // 4. Apply Inverse Caesar Shift
    let finalDecodedMessage = '';
    for (let i = 0; i < currentMessage.length; i++) {
        const currentChar = currentMessage[i];
        const currentCharIndex = currentChar.charCodeAt(0) - A_CODE;
        // The shift amount (N + i) used during encryption must be subtracted to reverse it.
        const shiftAmount = N + i;
        const originalCharIndex = mod(currentCharIndex - shiftAmount, 26);
        finalDecodedMessage += String.fromCharCode(A_CODE + originalCharIndex);
    }
    result = finalDecodedMessage;
}

// Output the final result
console.log(result);