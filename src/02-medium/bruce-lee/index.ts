// Standard CodinGame setup for input/output
declare function readline(): string;
declare function print(message: any): void;

/**
 * Decodes a Chuck Norris encoded message.
 * @param encoded The Chuck Norris encoded string.
 * @returns The decoded message or "INVALID" if the input is not valid.
 */
function decodeChuckNorris(encoded: string): string {
    // 1. Initial validation: Check for empty or whitespace-only input.
    if (!encoded || encoded.trim() === "") {
        return "INVALID";
    }

    // Split the encoded message into individual sequences based on spaces.
    // `split(' ')` will handle single spaces correctly. Multiple spaces (e.g., "0  0")
    // would result in empty strings in the `tokens` array, which will be caught
    // by subsequent validation steps (e.g., `firstSequence === ""`).
    const tokens = encoded.split(' ');

    // 2. Validate the total number of sequences (tokens).
    // They must come in pairs, so the total count must be even.
    // Also, if `tokens` is empty after splitting (e.g., input was just spaces) it's invalid.
    if (tokens.length === 0 || tokens.length % 2 !== 0) {
        return "INVALID";
    }

    let binaryString = ""; // This will store the reconstructed binary message

    // 3. Iterate through the tokens, processing them in pairs.
    for (let i = 0; i < tokens.length; i += 2) {
        const firstSequence = tokens[i];     // Represents the bit type (0 or 1)
        const secondSequence = tokens[i + 1]; // Represents the count of repetitions

        // Validate and determine the bit type based on the first sequence.
        let bit: string;
        if (firstSequence === "0") {
            bit = "1"; // "0" corresponds to binary '1'
        } else if (firstSequence === "00") {
            bit = "0"; // "00" corresponds to binary '0'
        } else {
            // If the first sequence is anything else (e.g., "000", empty string, or contains non-zero chars), it's invalid.
            return "INVALID";
        }

        // Validate the second sequence.
        // It must consist only of '0's and have a positive length.
        // `secondSequence.length === 0` covers empty strings (e.g., from double spaces).
        // `!/^[0]+$/.test(secondSequence)` covers strings with non-zero characters (e.g., "01")
        // or strings that are not purely '0's (though length 0 is already caught).
        if (secondSequence.length === 0 || !/^[0]+$/.test(secondSequence)) {
            return "INVALID";
        }

        // The number of repetitions is simply the length of the second sequence.
        const count = secondSequence.length;

        // Append the determined bit, repeated 'count' times, to the binary string.
        binaryString += bit.repeat(count);
    }

    // 4. Validate the reconstructed binary string.
    // Its length must be a multiple of 7, as each ASCII character is 7 bits.
    // An empty binary string after decoding (e.g., from valid pairs but no actual bits like "0 0")
    // should also result in INVALID unless it's a null string according to requirements.
    // Given the ASCII 7-bit constraint, a valid decoded message must be non-empty and
    // its binary representation length must be a multiple of 7.
    if (binaryString.length === 0 || binaryString.length % 7 !== 0) {
        return "INVALID";
    }

    // 5. Convert the binary string into ASCII characters.
    let decodedMessage = "";
    for (let i = 0; i < binaryString.length; i += 7) {
        // Extract a 7-bit chunk from the binary string.
        const sevenBitChunk = binaryString.substring(i, i + 7);

        // Convert the 7-bit binary string to an integer (base 2).
        // This is safe because `binaryString` is built only from '0's and '1's.
        const charCode = parseInt(sevenBitChunk, 2);

        // Convert the integer ASCII code to its corresponding character and append to the result.
        decodedMessage += String.fromCharCode(charCode);
    }

    return decodedMessage;
}

// Read input from CodinGame's standard input
const encodedMessage: string = readline();

// Decode the message and print the result to CodinGame's standard output
const result = decodeChuckNorris(encodedMessage);
print(result);