// Required for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Validates an ISBN string (either ISBN-10 or ISBN-13) based on its length and checksum rules.
 *
 * @param isbnString The ISBN string to validate.
 * @returns true if the ISBN is valid, false otherwise.
 */
function validateISBN(isbnString: string): boolean {
    const len = isbnString.length;

    if (len === 10) {
        // ISBN-10 Validation Logic
        let sum = 0;
        // Calculate weighted sum for the first 9 digits
        for (let i = 0; i < 9; i++) {
            const char = isbnString[i];
            const digit = parseInt(char, 10);

            // Ensure current character is a valid digit ('0'-'9')
            if (isNaN(digit)) {
                return false; // Invalid character found
            }
            sum += digit * (10 - i); // Weights decrease from 10 down to 2
        }

        const lastChar = isbnString[9];
        let checkDigitValue: number;

        // Determine the numerical value of the check digit (10th character)
        if (lastChar === 'X') {
            checkDigitValue = 10; // 'X' represents 10
        } else {
            const digit = parseInt(lastChar, 10);
            // Ensure the last character is a valid digit ('0'-'9') if not 'X'
            if (isNaN(digit)) {
                return false; // Invalid character found at the check digit position
            }
            checkDigitValue = digit;
        }

        // Calculate the expected check digit using Modulus 11
        // The check digit is the value needed to add to the sum to make it divisible by 11.
        // This is equivalent to (11 - (sum % 11)) % 11.
        // Example: If sum % 11 is 0, expected is (11-0)%11 = 0.
        // Example: If sum % 11 is 9, expected is (11-9)%11 = 2.
        // Example: If sum % 11 is 1, expected is (11-1)%11 = 10 (represented by 'X').
        const remainder = sum % 11;
        const expectedCheckDigit = (11 - remainder) % 11;

        // Compare the calculated expected check digit with the provided one
        return expectedCheckDigit === checkDigitValue;

    } else if (len === 13) {
        // ISBN-13 Validation Logic
        let sum = 0;
        // Calculate weighted sum for the first 12 digits
        for (let i = 0; i < 12; i++) {
            const char = isbnString[i];
            const digit = parseInt(char, 10);

            // Ensure current character is a valid digit ('0'-'9').
            // 'X' is NOT allowed anywhere in an ISBN-13.
            if (isNaN(digit)) {
                return false; // Invalid character found
            }
            // Alternating weights 1 and 3
            sum += digit * (i % 2 === 0 ? 1 : 3);
        }

        const lastChar = isbnString[12];
        const checkDigitValue = parseInt(lastChar, 10);

        // Ensure the last character is a valid digit ('0'-'9').
        // 'X' is NOT allowed in ISBN-13.
        if (isNaN(checkDigitValue)) {
            return false; // Invalid character found at the check digit position
        }

        // Calculate the expected check digit using Modulus 10
        // The check digit is the value needed to add to the sum to make it divisible by 10.
        // This is equivalent to (10 - (sum % 10)) % 10.
        // Example: If sum % 10 is 0, expected is (10-0)%10 = 0.
        // Example: If sum % 10 is 3, expected is (10-3)%10 = 7.
        const remainder = sum % 10;
        const expectedCheckDigit = (10 - remainder) % 10;

        // Compare the calculated expected check digit with the provided one
        return expectedCheckDigit === checkDigitValue;

    } else {
        // ISBNs must be either 10 or 13 digits long. Any other length is invalid.
        return false;
    }
}

// Main function to orchestrate reading input, processing, and printing output
function solve() {
    const N: number = parseInt(readline(), 10); // Read the number of ISBNs to verify
    const invalidISBNs: string[] = []; // Array to store ISBNs that are found to be invalid

    // Loop through each ISBN provided in the input
    for (let i = 0; i < N; i++) {
        const isbnString: string = readline(); // Read the current ISBN string
        if (!validateISBN(isbnString)) {
            // If the ISBN is determined to be invalid by our validation function, add it to the list
            invalidISBNs.push(isbnString);
        }
    }

    // Print the total count of invalid ISBNs, followed by the " invalid:" string
    print(`${invalidISBNs.length} invalid:`);
    // Print each invalid ISBN from the collected list, each on a new line
    for (const isbn of invalidISBNs) {
        print(isbn);
    }
}

// Execute the main solve function to start the program
solve();