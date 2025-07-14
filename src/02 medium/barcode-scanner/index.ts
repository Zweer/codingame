// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Data structures for EAN-13 codes
const L_CODES: Map<string, number> = new Map([
    ["0001101", 0], ["0011001", 1], ["0010011", 2], ["0111101", 3],
    ["0100011", 4], ["0110001", 5], ["0101111", 6], ["0111011", 7],
    ["0110111", 8], ["0001011", 9]
]);

const G_CODES: Map<string, number> = new Map([
    ["0100111", 0], ["0110011", 1], ["0011011", 2], ["0100001", 3],
    ["0011101", 4], ["0111001", 5], ["0000101", 6], ["0010001", 7],
    ["0001001", 8], ["0010111", 9]
]);

const R_CODES: Map<string, number> = new Map([
    ["1110010", 0], ["1100110", 1], ["1101100", 2], ["1000010", 3],
    ["1011100", 4], ["1001110", 5], ["1010000", 6], ["1000100", 7],
    ["1001000", 8], ["1110100", 9]
]);

const FIRST_DIGIT_PATTERNS: Map<string, number> = new Map([
    ["LLLLLL", 0], ["LLGLGG", 1], ["LLGGLG", 2], ["LLGGGL", 3],
    ["LGLLGG", 4], ["LGGLLG", 5], ["LGGGLL", 6], ["LGLGLG", 7],
    ["LGLGGL", 8], ["LGGLGL", 9]
]);

// Constants for barcode structure
const LEFT_GUARD = "101";
const CENTRAL_GUARD = "01010";
const RIGHT_GUARD = "101";

const INVALID_SCAN = "INVALID SCAN";

/**
 * Calculates the EAN-13 checksum for a given array of 13 digits.
 * As per the problem description: Multiply every second digit by 3, then add up all the digits.
 * If the sum is a multiple of 10, the barcode is correct.
 * @param barcodeDigits An array of 13 numbers representing the barcode digits.
 * @returns True if the checksum is valid, false otherwise.
 */
function calculateChecksum(barcodeDigits: number[]): boolean {
    if (barcodeDigits.length !== 13) {
        return false; // EAN-13 must have 13 digits for checksum calculation
    }

    let sum = 0;
    for (let i = 0; i < 13; i++) {
        // Digits at even positions (2nd, 4th, 6th, etc. from left, 0-indexed: 1, 3, 5, ...) are multiplied by 3.
        // Digits at odd positions (1st, 3rd, 5th, etc. from left, 0-indexed: 0, 2, 4, ...) are multiplied by 1.
        if ((i + 1) % 2 === 0) { // (i+1) gives the 1-based position
            sum += barcodeDigits[i] * 3;
        } else {
            sum += barcodeDigits[i];
        }
    }

    return sum % 10 === 0;
}

/**
 * Decodes an EAN-13 barcode scanline into its 13-digit decimal representation.
 * @param scanline The 95-bit binary string representing the barcode.
 * @returns The 13-digit string if decoding is successful and checksum is valid, otherwise null.
 */
function decodeBarcode(scanline: string): string | null {
    // 1. Validate scanline length and guards
    if (scanline.length !== 95) {
        return null;
    }
    if (scanline.substring(0, 3) !== LEFT_GUARD ||
        scanline.substring(92, 95) !== RIGHT_GUARD ||
        scanline.substring(45, 50) !== CENTRAL_GUARD) {
        return null; // Guard patterns do not match
    }

    const decodedDigits: number[] = [];
    let leftPartPattern = ""; // To store "LLGLGG" etc. for first digit lookup

    // 2. Decode Left Part (6 digits, each 7 bits)
    // Starts after LEFT_GUARD (index 3), ends before CENTRAL_GUARD (index 45)
    for (let i = 0; i < 6; i++) {
        const segment = scanline.substring(3 + i * 7, 3 + (i + 1) * 7);
        let digit: number | undefined;
        let codeType: 'L' | 'G' | undefined;

        // Try decoding as L-code
        digit = L_CODES.get(segment);
        if (digit !== undefined) {
            codeType = 'L';
        } else {
            // If not L-code, try decoding as G-code
            digit = G_CODES.get(segment);
            if (digit !== undefined) {
                codeType = 'G';
            }
        }

        if (digit === undefined || codeType === undefined) {
            return null; // Segment does not match any known L or G code
        }
        decodedDigits.push(digit); // These will be the 2nd to 7th digits of the final 13-digit number
        leftPartPattern += codeType;
    }

    // 3. Determine the First Digit from the Left Part Pattern
    const firstDigit = FIRST_DIGIT_PATTERNS.get(leftPartPattern);
    if (firstDigit === undefined) {
        return null; // The L/G pattern of the left part is not recognized
    }
    // Prepend the first digit to the array of decoded digits
    decodedDigits.unshift(firstDigit);

    // 4. Decode Right Part (6 digits, each 7 bits)
    // Starts after CENTRAL_GUARD (index 50), ends before RIGHT_GUARD (index 92)
    for (let i = 0; i < 6; i++) {
        const segment = scanline.substring(50 + i * 7, 50 + (i + 1) * 7);
        const digit = R_CODES.get(segment);
        if (digit === undefined) {
            return null; // Segment does not match any known R code
        }
        decodedDigits.push(digit); // These will be the 8th to 13th digits of the final 13-digit number
    }

    // At this point, decodedDigits should contain all 13 digits
    if (decodedDigits.length !== 13) {
        return null; // This should theoretically not happen if structure parsing is correct
    }

    // 5. Perform Checksum Verification
    if (!calculateChecksum(decodedDigits)) {
        return null; // The decoded barcode failed the checksum validation
    }

    // If all checks pass, return the decoded 13-digit string
    return decodedDigits.join('');
}

// Main execution flow
const scanlineInput: string = readline();

let decodedResult = decodeBarcode(scanlineInput);

// If the initial scan fails, try decoding the reversed scanline
if (decodedResult === null) {
    const reversedScanline = scanlineInput.split('').reverse().join('');
    decodedResult = decodeBarcode(reversedScanline);
}

// Output the result
if (decodedResult === null) {
    print(INVALID_SCAN);
} else {
    print(decodedResult);
}