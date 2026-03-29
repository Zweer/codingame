// The `readline` function is provided by the CodinGame environment to read input.
// The `console.log` function prints to the standard output.

/**
 * Calculates the binomial coefficient "n choose r" (C(n, r)).
 * Uses BigInt to handle large numbers, as N can be up to 60.
 *
 * @param n The total number of items.
 * @param r The number of items to choose.
 * @returns The number of combinations as a BigInt. Returns 0n if r is out of bounds (r < 0 or r > n).
 */
function combinations(n: number, r: number): bigint {
    // If r is negative or greater than n, it's impossible to choose, so 0 ways.
    if (r < 0 || r > n) {
        return 0n;
    }
    // There's one way to choose 0 items (choose nothing) or all 'n' items.
    if (r === 0 || r === n) {
        return 1n;
    }
    // Optimization: C(n, r) = C(n, n-r). Choosing the smaller 'r' value reduces iterations.
    if (r > n / 2) {
        r = n - r;
    }

    let res = 1n;
    // Calculate C(n, r) using the formula: C(n, r) = (n * (n-1) * ... * (n-r+1)) / (r * (r-1) * ... * 1)
    // This iterative approach avoids calculating large factorials directly,
    // and performs division at each step to keep intermediate results smaller,
    // thus preventing overflow even with BigInt for extremely large factorials
    // (though BigInt itself handles arbitrary size, this pattern is generally more efficient).
    for (let i = 1; i <= r; i++) {
        res = res * BigInt(n - i + 1) / BigInt(i);
    }
    return res;
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInt numbers
 * using the Euclidean algorithm.
 *
 * @param a The first BigInt number.
 * @param b The second BigInt number.
 * @returns The GCD of a and b as a BigInt.
 */
function gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Read input values from standard input
const N = parseInt(readline()); // Total number of balls in the bag
const W = parseInt(readline()); // Number of white balls in the bag
const s = parseInt(readline()); // Size of the sample (number of balls extracted)
const k = parseInt(readline()); // Desired number of white balls in the sample

// Calculate the number of black balls in the bag
const B = N - W;

// Calculate the number of ways to achieve event A:
// Exactly 'k' white balls from 'W' white balls AND
// Exactly 's-k' black balls from 'B' black balls.
const ways_A = combinations(W, k) * combinations(B, s - k);

// Calculate the total number of ways to choose 's' balls from 'N' balls.
const total_ways = combinations(N, s);

// The probability ratio P(A) : P(!A) is equivalent to (ways_A) : (total_ways - ways_A).
const A_ratio_part = ways_A;
const B_ratio_part = total_ways - ways_A;

// Determine and print the ratio in lowest terms
if (A_ratio_part === 0n) {
    // If there are 0 ways to achieve A, P(A) = 0. So P(!A) = 1. Ratio is 0:1.
    console.log("0:1");
} else if (B_ratio_part === 0n) {
    // If there are 0 ways to NOT achieve A, P(!A) = 0. So P(A) = 1. Ratio is 1:0.
    console.log("1:0");
} else {
    // If both parts are non-zero, reduce the ratio using their Greatest Common Divisor.
    const commonDivisor = gcd(A_ratio_part, B_ratio_part);
    const reduced_A = A_ratio_part / commonDivisor;
    const reduced_B = B_ratio_part / commonDivisor;
    console.log(`${reduced_A}:${reduced_B}`);
}