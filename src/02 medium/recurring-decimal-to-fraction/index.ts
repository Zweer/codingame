// Required for CodinGame environment, assumes readline and console.log are globally available.
// If running in a local TypeScript environment, you might need to mock these or adjust.
declare function readline(): string;
// declare function printErr(...args: any[]): void; // For debugging, optional

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param a The first number.
 * @param b The second number.
 * @returns The GCD of a and b.
 */
function gcd(a: number, b: number): number {
    // Ensure numbers are positive for GCD calculation.
    // GCD(0, x) = x, which is handled correctly by the algorithm.
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Read the input recurring decimal as a string and parse it to a number.
const x: number = parseFloat(readline());

// Check if the number is effectively an integer.
// For example, 1.0 or 0.999999999999999 (which should resolve to 1).
// The fraction finding logic will handle 0.999... correctly to 1/1.
// This initial check mostly serves for clean integer inputs like 1.0, 2.0 etc.
if (x % 1 === 0) {
    console.log(x);
} else {
    let bestN: number = 0;
    let bestD: number = 1;
    let minError: number = Infinity;

    // Iterate through possible denominators to find the best approximation.
    // MAX_DENOMINATOR of 10000 is a common range for such problems, balancing precision and performance.
    // Larger values might exceed float precision limits for x*d calculations.
    const MAX_DENOMINATOR: number = 10000; 

    for (let d = 1; d <= MAX_DENOMINATOR; d++) {
        // Calculate the closest integer numerator 'n' such that 'n/d' is close to 'x'.
        // This is done by finding 'n' closest to 'x * d'.
        const n: number = Math.round(x * d);
        
        // Calculate the absolute error: | (x * d) - n |
        // This method avoids extra floating-point division (n/d) in the loop
        // and provides a stable comparison of errors.
        const currentError: number = Math.abs(x * d - n);

        // If this fraction provides a smaller error, or if it's an equally good
        // approximation found earlier (due to iterating d in increasing order),
        // then update the best fraction found so far.
        if (currentError < minError) {
            minError = currentError;
            bestN = n;
            bestD = d;
            
            // Optimization: If the error is extremely small, it means we've found
            // an effectively exact match within floating-point precision.
            // We can stop early as we won't find a better approximation.
            // 1e-12 is a common epsilon for double-precision comparisons.
            if (minError < 1e-12) { 
                break; 
            }
        }
    }
    
    // Simplify the found fraction (bestN / bestD) to its irreducible form.
    const commonDivisor: number = gcd(bestN, bestD);
    const finalN: number = bestN / commonDivisor;
    const finalD: number = bestD / commonDivisor;

    // Output the result. If the denominator is 1, it's an integer.
    if (finalD === 1) {
        console.log(finalN);
    } else {
        console.log(`${finalN} / ${finalD}`);
    }
}