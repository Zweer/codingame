/**
 * The readline() function is provided by the CodinGame environment to read a line of input.
 */
declare function readline(): string;

/**
 * The main logic to solve the Numeral System puzzle.
 */
function solve() {
    // Read the input string representing the equality X+Y=Z
    const S: string = readline();

    // 1. Parse X, Y, Z from the input string
    const parts = S.split('+');
    const X = parts[0];
    const yzParts = parts[1].split('=');
    const Y = yzParts[0];
    const Z = yzParts[1];

    // 2. Determine the minimum possible base (N)
    // The base must be greater than the highest digit value present in X, Y, or Z.
    // Digits '0'-'9' represent values 0-9. 'A'-'Z' represent values 10-35.
    let maxDigitValue = 0;
    const allChars = X + Y + Z; // Combine all numbers' characters to find the highest digit

    for (let i = 0; i < allChars.length; i++) {
        const char = allChars[i];
        // parseInt(char, 36) correctly converts both '0'-'9' and 'A'-'Z' to their
        // corresponding numerical values (0-9 and 10-35, respectively).
        maxDigitValue = Math.max(maxDigitValue, parseInt(char, 36));
    }

    // The base must be at least 2 (binary) and strictly greater than the max digit value.
    const minBase = Math.max(2, maxDigitValue + 1);

    // 3. Iterate through possible bases from minBase up to 36
    for (let N = minBase; N <= 36; N++) {
        // 4. Convert X, Y, Z from base N to base 10 (decimal)
        // parseInt() handles conversion from a specified radix (base) to decimal.
        const valX = parseInt(X, N);
        const valY = parseInt(Y, N);
        const valZ = parseInt(Z, N);

        // Check for NaN, which can happen if a digit is invalid for the current base.
        // However, our minBase calculation ensures digits are valid for N,
        // so this check is mostly for robustness but not strictly needed with current logic.
        if (isNaN(valX) || isNaN(valY) || isNaN(valZ)) {
            continue;
        }

        // 5. Check if the equality holds
        if (valX + valY === valZ) {
            // 6. If it holds, this is the minimal base, so print it and exit.
            console.log(N);
            return; // Exit the function after finding the solution
        }
    }
}

// Call the solve function to execute the logic
solve();