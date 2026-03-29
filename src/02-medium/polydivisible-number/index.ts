// readline() and console.log() are standard for CodinGame TypeScript puzzles.
// If running locally without these globals, you might need to mock them.
declare function readline(): string;

/**
 * Solves the Polydivisible number puzzle.
 * Reads a sequence of digits (as strings), parses them,
 * and finds all bases (2-36) in which the number formed by these digits is polydivisible.
 */
function solve(): void {
    // Read the input line, e.g., "04 04 00"
    const line: string = readline();
    const digitStrings: string[] = line.split(' ');

    // Parse each digit string into its integer value.
    // Example: "01" -> 1, "10" -> 10, "00" -> 0
    const digits: number[] = digitStrings.map(s => parseInt(s, 10));

    // Determine the maximum digit value present in the input.
    // This is used to establish the minimum valid base for the number.
    // A base 'B' must be strictly greater than any digit 'd' it represents (d < B).
    let maxDigitValue = 0;
    for (const digit of digits) {
        if (digit > maxDigitValue) {
            maxDigitValue = digit;
        }
    }

    const possibleBases: number[] = [];

    // Iterate through all possible bases, as per constraints (2 to 36).
    for (let base = 2; base <= 36; base++) {
        // A base is valid only if all digits are less than the base.
        // For example, if a digit '10' (value ten) is present, base must be at least 11.
        if (base <= maxDigitValue) {
            continue; // Skip this base, it cannot represent all the given digits.
        }

        // Initialize state for checking polydivisibility in the current base.
        let isPolydivisible = true;
        // currentNumberBigInt will store the value of the prefix of the number in the current base.
        // BigInt is necessary because numbers can grow very large (up to 36^17), exceeding
        // JavaScript's standard Number type's safe integer limit.
        let currentNumberBigInt = 0n;

        // Iterate through the digits, from the first (k=1) to the last (k=digits.length).
        for (let k = 1; k <= digits.length; k++) {
            const digitValue = digits[k - 1]; // Get the k-th digit (0-indexed array).
            const divisor = BigInt(k);       // The divisor for this step (1, 2, 3, ...).

            // Special check for the first digit (k=1):
            // The problem states: "Its first digit a is not 0."
            // This is a fundamental rule for a polydivisible number.
            if (k === 1 && digitValue === 0) {
                isPolydivisible = false; // If the first digit's value is 0, it's not polydivisible.
                break;                   // No need to check further for this base.
            }

            // Form the number composed of the first 'k' digits in the current 'base'.
            // This is done iteratively: N_k = N_{k-1} * base + d_{k-1}.
            currentNumberBigInt = currentNumberBigInt * BigInt(base) + BigInt(digitValue);

            // Check the polydivisibility condition:
            // The number formed by the first 'k' digits must be divisible by 'k'.
            if (currentNumberBigInt % divisor !== 0n) {
                isPolydivisible = false; // Condition failed for this base.
                break;                   // No need to check further for this base.
            }
        }

        // If all conditions passed for this base, it's a polydivisible base.
        if (isPolydivisible) {
            possibleBases.push(base);
        }
    }

    // Sort the found bases in numeric order as required by the output.
    possibleBases.sort((a, b) => a - b);

    // Print each valid base on a new line.
    for (const base of possibleBases) {
        console.log(base);
    }
}

// Call the solve function to run the program.
solve();