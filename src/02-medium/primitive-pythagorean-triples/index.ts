// Required for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * @param a The first integer.
 * @param b The second integer.
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

/**
 * Solves the Primitive Pythagorean Triples puzzle.
 * Reads an integer N from input and prints the count of primitive Pythagorean triples (a, b, c)
 * such that 0 < a < b < c <= N.
 */
function solvePrimitivePythagoreanTriples(): void {
    // Read the input integer N
    const N: number = parseInt(readline());

    let count = 0;

    // According to Euclid's formula for generating primitive Pythagorean triples:
    // a = m^2 - n^2
    // b = 2mn
    // c = m^2 + n^2
    // where m > n > 0, m and n are coprime, and m and n have opposite parity.
    // The problem requires 0 < a < b < c <= N.

    // The condition c <= N implies m^2 + n^2 <= N.
    // Since n >= 1, we must have m^2 < N, so m < sqrt(N).
    // The maximum value for m to check is floor(sqrt(N)).
    const mLimit = Math.sqrt(N);

    // Iterate m starting from 2 (the smallest m that can form a triple, e.g., (3,4,5) for m=2, n=1)
    for (let m = 2; m <= mLimit; m++) {
        // Iterate n from 1 up to m-1
        for (let n = 1; n < m; n++) {
            // Check condition 2 for Euclid's formula: m and n must be coprime
            if (gcd(m, n) === 1) {
                // Check condition 3 for Euclid's formula: m and n must have opposite parity
                // (one even, one odd). This is equivalent to (m % 2) !== (n % 2) or (m + n) % 2 === 1.
                if ((m % 2) !== (n % 2)) {
                    // Calculate the hypotenuse c
                    const c_val = m * m + n * n;

                    // Check if c_val is within the given limit N
                    if (c_val <= N) {
                        count++;
                    } else {
                        // Optimization: For a fixed 'm', c_val = m^2 + n^2 strictly increases as 'n' increases.
                        // If c_val for the current 'n' already exceeds N, then any larger 'n'
                        // (for the same 'm') will also result in c_val > N.
                        // So, we can safely break out of the inner loop (n loop) and move to the next 'm'.
                        break;
                    }
                }
            }
        }
    }

    // Print the total count of primitive Pythagorean triples
    print(count);
}

// Call the main function to execute the solution
solvePrimitivePythagoreanTriples();