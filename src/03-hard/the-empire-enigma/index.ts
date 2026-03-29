// Define constants for the RNG
const A = 7562100;
const B = 907598307;
const M = 7140;
const ASCII_AT = 64; // ASCII code for '@'

// Read input from stdin
// The 'readline()' function is provided by the CodinGame environment.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const offset: number = parseInt(readline()); // Offset is not directly used in the decoding logic
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const length: number = parseInt(readline());

const encodedChars: number[] = [];
for (let i = 0; i < length; i++) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    encodedChars.push(parseInt(readline()));
}

// Step 1: Find all possible R(Offset) values
// We know: encodedChars[0] = (R(Offset) ^ ASCII_AT) & 0xFF
// We need to find R(Offset) in the range [0, M-1] that satisfies this.
const candidateR0s: number[] = [];
const firstEncodedChar = encodedChars[0];

for (let r_val = 0; r_val < M; r_val++) {
    // Check if the current r_val, when XORed with ASCII_AT and truncated to 8 bits,
    // matches the first encoded character.
    if (((r_val ^ ASCII_AT) & 0xFF) === firstEncodedChar) {
        candidateR0s.push(r_val);
    }
}

// Step 2: Iterate through candidates and find the correct one
let decodedMessage = "";

for (const candidateR0 of candidateR0s) {
    let currentRNGValue = candidateR0; // This is our assumed R(Offset)
    let tempDecodedMessage = "";
    let isValidCandidate = true;

    // The first character '@' is used to deduce R(Offset), so we don't decode it here.
    // We proceed to decode the rest of the message, starting from the second encoded character (index 1),
    // which corresponds to the first character *after* '@'.
    for (let i = 1; i < length; i++) {
        // Generate the next random number using the RNG formula
        currentRNGValue = (A * currentRNGValue + B) % M;

        // Decode the current character: Original_Char_Code = (Encoded_Char ^ RNG_Value) & 0xFF
        const originalCharCode = (encodedChars[i] ^ currentRNGValue) & 0xFF;

        // Check if the decoded character is a valid ASCII character (32 to 126 inclusive)
        if (originalCharCode < 32 || originalCharCode > 126) {
            isValidCandidate = false;
            break; // This candidate is invalid, try the next one
        }

        tempDecodedMessage += String.fromCharCode(originalCharCode);
    }

    if (isValidCandidate) {
        decodedMessage = tempDecodedMessage;
        break; // Found the correct R(Offset) and decoded message, no need to check other candidates
    }
}

// Output the decoded message (excluding the initial '@')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
console.log(decodedMessage);