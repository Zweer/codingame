// For CodinGame environment, readline() is typically available globally.
// If running locally with Node.js, you might need to mock or provide a way to read input.
declare function readline(): string;

/**
 * Represents the Straddling Checkerboard, mapping characters to their numeric codes
 * and vice-versa, along with the special tens digits for the second and third rows.
 */
class Checkerboard {
    charToCode: Map<string, number>;
    codeToChar: Map<number, string>;
    row2Tens: number; // The tens digit for the second row (e.g., 2)
    row3Tens: number; // The tens digit for the third row (e.g., 6)

    constructor(header: string, passphrase: string, posslash: number, posdot: number) {
        this.charToCode = new Map<string, number>();
        this.codeToChar = new Map<number, string>();
        let rowTensCandidateColumns: number[] = []; // Stores the header digits corresponding to space positions in passphrase

        // 1. Populate Row 0 (tens digit 0)
        // Characters in passphrase map to single digits (0-9) based on header/column.
        // Spaces in passphrase define the tens digits for rows 2 and 3.
        for (let i = 0; i < passphrase.length; i++) {
            const char = passphrase[i];
            const headerDigit = parseInt(header[i]); // The actual digit value for this column
            if (char === ' ') {
                rowTensCandidateColumns.push(headerDigit);
            } else {
                this.charToCode.set(char, headerDigit);
                this.codeToChar.set(headerDigit, char);
            }
        }

        // Sort to ensure a consistent order for row2Tens and row3Tens (smaller for row2, larger for row3)
        rowTensCandidateColumns.sort((a, b) => a - b);
        this.row2Tens = rowTensCandidateColumns[0];
        this.row3Tens = rowTensCandidateColumns[1];

        // 2. Prepare remaining alphabet
        let remainingAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const usedChars = new Set(passphrase.replace(/ /g, ''));
        remainingAlphabet = remainingAlphabet.filter(char => !usedChars.has(char));

        // 3. Insert '/' and '.' into the remaining alphabet list
        // The splice positions are relative to the list at the moment of insertion.
        // If posslash is less than or equal to posdot, '/' is inserted first.
        // This shifts elements, so posdot's effective index for insertion becomes posdot + 1.
        if (posslash <= posdot) {
            remainingAlphabet.splice(posslash, 0, '/');
            remainingAlphabet.splice(posdot + 1, 0, '.'); 
        } else { // posslash > posdot, so '.' is inserted first
            remainingAlphabet.splice(posdot, 0, '.');
            remainingAlphabet.splice(posslash + 1, 0, '/'); 
        }

        // 4. Populate Row 2 and Row 3 (two-digit codes)
        // Characters fill codes like 20, 21, ..., 29, then 60, 61, ..., 69.
        for (let j = 0; j < 10; j++) {
            const char = remainingAlphabet.shift();
            if (char === undefined) break; // Should not happen with valid inputs (20 remaining chars needed)
            const code = parseInt(`${this.row2Tens}${header[j]}`); // Combines tens digit with units digit from header
            this.charToCode.set(char, code);
            this.codeToChar.set(code, char);
        }
        for (let j = 0; j < 10; j++) {
            const char = remainingAlphabet.shift();
            if (char === undefined) break; // Should not happen
            const code = parseInt(`${this.row3Tens}${header[j]}`); // Combines tens digit with units digit from header
            this.charToCode.set(char, code);
            this.codeToChar.set(code, char);
        }
    }
}

/**
 * Encrypts a message using the Straddling Checkerboard.
 * @param message The plaintext message.
 * @param key The key number for addition modulo 10.
 * @param checkerboard The constructed checkerboard mapping.
 * @returns The encrypted message as a string of characters.
 */
function encrypt(message: string, key: string, checkerboard: Checkerboard): string {
    const { charToCode, codeToChar, row2Tens, row3Tens } = checkerboard;

    // 1. Message Preparation: Uppercase, remove invalid chars, prefix digits with '/'
    let preparedMessage = '';
    const validChars = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.');
    message = message.toUpperCase();

    for (const char of message) {
        if (validChars.has(char)) {
            preparedMessage += char;
        }
    }

    // 2. Convert to Raw Digit Codes (before key application)
    // Digits are represented by the '/' character's code followed by the digit itself.
    let rawEncryptedDigitsArr: string[] = [];
    for (let i = 0; i < preparedMessage.length; i++) {
        const char = preparedMessage[i];
        if (char >= '0' && char <= '9') { // If it's a digit (0-9)
            rawEncryptedDigitsArr.push(charToCode.get('/').toString()); // Append code for '/' (e.g., '62')
            rawEncryptedDigitsArr.push(char); // Append the actual digit (e.g., '1')
        } else {
            const code = charToCode.get(char);
            if (code !== undefined) {
                rawEncryptedDigitsArr.push(code.toString());
            }
        }
    }
    const rawEncryptedDigits = rawEncryptedDigitsArr.join('');

    // 3. Apply Key Number (Addition Modulo 10)
    // The key is repeated to match the length of the raw encrypted digits.
    let keyPadded = '';
    for (let i = 0; i < rawEncryptedDigits.length; i++) {
        keyPadded += key[i % key.length];
    }

    let modifiedDigits = '';
    for (let i = 0; i < rawEncryptedDigits.length; i++) {
        const d1 = parseInt(rawEncryptedDigits[i]);
        const d2 = parseInt(keyPadded[i]);
        modifiedDigits += ((d1 + d2) % 10).toString();
    }

    // 4. Convert Modified Digits Back to Characters (Final Output)
    // The output should be characters (letters, slash, or period), not digits.
    let finalOutput = '';
    for (let i = 0; i < modifiedDigits.length; i++) {
        const firstDigit = parseInt(modifiedDigits[i]);
        let char: string | undefined;

        if (firstDigit === row2Tens || firstDigit === row3Tens) {
            // This is a potential two-digit code (tens digit matches row2/row3)
            if (i + 1 < modifiedDigits.length) {
                const twoDigitCode = parseInt(`${firstDigit}${modifiedDigits[i+1]}`);
                char = codeToChar.get(twoDigitCode);
                i++; // Consume the next digit, as it's part of a two-digit code
            } else {
                // Should not happen for a properly formed encrypted message, but fallback
                char = firstDigit.toString(); // Fallback: just append the single digit
            }
        } else {
            // This is a single-digit code (tens digit is 0)
            char = codeToChar.get(firstDigit);
        }

        if (char !== undefined) {
            finalOutput += char;
        }
    }

    return finalOutput;
}

/**
 * Decrypts a message using the Straddling Checkerboard.
 * @param message The encrypted message (a string of digits).
 * @param key The key number for subtraction modulo 10.
 * @param checkerboard The constructed checkerboard mapping.
 * @returns The decrypted message, with digits restored from their '/' prefix.
 */
function decrypt(message: string, key: string, checkerboard: Checkerboard): string {
    const { codeToChar, row2Tens, row3Tens } = checkerboard;

    // 1. Apply Key Number (Subtraction Modulo 10)
    // Subtract the key (padded) from the encrypted message digits.
    let keyPadded = '';
    for (let i = 0; i < message.length; i++) {
        keyPadded += key[i % key.length];
    }

    let originalEncryptedDigits = '';
    for (let i = 0; i < message.length; i++) {
        const d1 = parseInt(message[i]); // Received encrypted digit
        const d2 = parseInt(keyPadded[i]); // Key digit
        originalEncryptedDigits += ((d1 - d2 + 10) % 10).toString(); // (d1 - d2 + 10) % 10 for positive result
    }

    // 2. Convert Raw Digit Codes Back to Characters and reconstruct original message
    // Handle '/' to restore original digits (0-9).
    let decryptedMessage = '';
    for (let i = 0; i < originalEncryptedDigits.length; i++) {
        const firstDigit = parseInt(originalEncryptedDigits[i]);
        let charOrDigit: string | undefined;

        if (firstDigit === row2Tens || firstDigit === row3Tens) {
            // This is a two-digit code (tens digit matches row2/row3)
            if (i + 1 < originalEncryptedDigits.length) {
                const twoDigitCode = parseInt(`${firstDigit}${originalEncryptedDigits[i+1]}`);
                charOrDigit = codeToChar.get(twoDigitCode);
                i++; // Consume the next digit, as it's part of a two-digit code
            } else {
                // Malformed code, fallback
                charOrDigit = firstDigit.toString(); // Fallback: just append the single digit
            }
        } else {
            // This is a single-digit code (tens digit is 0)
            charOrDigit = codeToChar.get(firstDigit);
        }

        if (charOrDigit !== undefined) {
            if (charOrDigit === '/') {
                // If the character is '/', it signifies a numerical digit in the original message.
                // The actual digit is the *next* digit in the `originalEncryptedDigits` sequence.
                if (i + 1 < originalEncryptedDigits.length) {
                    decryptedMessage += originalEncryptedDigits[i+1]; // Append the actual digit (e.g., '1')
                    i++; // Consume the actual digit as well
                }
            } else {
                decryptedMessage += charOrDigit;
            }
        }
    }

    return decryptedMessage;
}

// Main execution logic for CodinGame
const action = parseInt(readline()); // 1 to encrypt, 0 to decrypt
const header = readline(); // e.g., "0123456789"
const passphrase = readline(); // e.g., "ET AON RIS"
const [posslash, posdot] = readline().split(' ').map(Number); // e.g., "12 19"
const key = readline(); // e.g., "0432"
const message = readline(); // message to encrypt/decrypt

const checkerboard = new Checkerboard(header, passphrase, posslash, posdot);

if (action === 1) {
    console.log(encrypt(message, key, checkerboard));
} else {
    console.log(decrypt(message, key, checkerboard));
}