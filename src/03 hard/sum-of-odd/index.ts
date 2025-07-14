/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is usually provided globally.
 */
declare function readline(): string;

const n: number = parseInt(readline());

let solutionsCount: number = 0;
let longestFirst: number = 0;
let longestLast: number = 0;
let maxTerms: number = 0;

// The sum 'n' can be expressed as T * (2k + T), where T is the number of terms
// and (2k + 1) is the first odd number in the sequence.
// Let X = (2k + T). So n = T * X.
// Conditions for a valid solution:
// 1. T must be an integer factor of n.
// 2. T >= 2 (at least two consecutive odd numbers).
// 3. X = n / T must be an integer.
// 4. X and T must have the same parity (because X - T = 2k, which must be even).
// 5. k = (X - T) / 2 must be non-negative, meaning X >= T.
//    Since T * X = n and X >= T, it implies T*T <= n, so T <= sqrt(n).
//    Therefore, we only need to iterate T up to sqrt(n).

// Calculate the upper limit for T
const limit: number = Math.floor(Math.sqrt(n));

for (let T = 2; T <= limit; T++) {
    // Check if T is a divisor of n
    if (n % T === 0) {
        const X: number = n / T;

        // Check if X and T have the same parity.
        // (X - T) must be even for 2k to be an integer.
        if ((X - T) % 2 === 0) {
            // This is a valid solution
            solutionsCount++;

            // Calculate k: 2k = X - T => k = (X - T) / 2
            const k: number = (X - T) / 2;

            // Calculate the first and last terms of the sequence
            // First term: 2k + 1
            const firstTerm: number = 2 * k + 1;
            // Last term: 2k + 2T - 1
            const lastTerm: number = 2 * k + 2 * T - 1;

            // If this sequence has more terms than the current longest, update
            if (T > maxTerms) {
                maxTerms = T;
                longestFirst = firstTerm;
                longestLast = lastTerm;
            }
        }
    }
}

// Output the results
console.log(solutionsCount);
console.log(`${longestFirst} ${longestLast}`);