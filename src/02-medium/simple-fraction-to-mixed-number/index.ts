/**
 * Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param a The first number.
 * @param b The second number.
 * @returns The GCD of a and b.
 */
function gcd(a: number, b: number): number {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function solve(): void {
    // Read the number of test cases
    const N: number = parseInt(readline());

    for (let i = 0; i < N; i++) {
        const line: string = readline();
        const parts: string[] = line.split('/');
        const x: number = parseInt(parts[0]);
        const y: number = parseInt(parts[1]);

        // Rule 4: Handle division by zero
        if (y === 0) {
            console.log("DIVISION BY ZERO");
            continue; // Move to the next test case
        }

        // Rule 5: Zero does not have a sign. Rule 1: If X/Y equals integer part.
        // If numerator is 0, the result is 0 regardless of denominator (unless denominator is 0, already handled).
        if (x === 0) {
            console.log("0");
            continue; // Move to the next test case
        }

        // Determine the overall sign of the result
        // The sign applies to the whole number.
        const isNegative: boolean = (x < 0 && y > 0) || (x > 0 && y < 0);
        let signPrefix: string = isNegative ? "-" : "";

        // Work with absolute values for calculations
        const absX: number = Math.abs(x);
        const absY: number = Math.abs(y);

        // Calculate the integer part (A)
        const integerPart: number = Math.floor(absX / absY);

        // Calculate the remainder (B) for the fractional part
        let remainder: number = absX % absY;

        let simplifiedNumerator: number = remainder;
        let simplifiedDenominator: number = absY;

        // Simplify the proper fraction if a remainder exists
        if (remainder !== 0) {
            const commonDivisor: number = gcd(remainder, absY);
            simplifiedNumerator = remainder / commonDivisor;
            simplifiedDenominator = absY / commonDivisor;
        }

        let result: string;

        // Rule 1 & 3: If X/Y equals the integer part, return integer part only (no spaces).
        if (remainder === 0) {
            result = signPrefix + integerPart;
        } 
        // Rule 2 & 3: If integer part is zero, return the irreducible proper fraction only (no spaces).
        else if (integerPart === 0) {
            result = signPrefix + simplifiedNumerator + "/" + simplifiedDenominator;
        } 
        // General case: Mixed number A B/C (exactly one space).
        else {
            result = signPrefix + integerPart + " " + simplifiedNumerator + "/" + simplifiedDenominator;
        }

        console.log(result);
    }
}

// Call the solve function to execute the logic for CodinGame environment
solve();