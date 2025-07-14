import * as readline from 'readline';

// Using async/await with readline for robust input handling in CodinGame environment
async function solve() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let lines: string[] = [];
    // Read all input lines
    for await (const line of rl) {
        lines.push(line);
    }
    rl.close();

    // Parse M and N from input
    const M = parseInt(lines[0]);
    const N = parseInt(lines[1]);

    // R is the number of South moves required (M-1 rows to traverse)
    const R = M - 1; 
    // C is the number of East moves required (N-1 columns to traverse)
    const C = N - 1; 

    // Edge case: if M=1 and N=1, then R=0 and C=0.
    // There's only one way to stay at the start point (do nothing).
    // In this case, N_total = 0, the prime loop will not run, and result will stay 1n,
    // so this explicit check is not strictly necessary for correctness but improves clarity.
    if (R === 0 && C === 0) {
        console.log("1");
        return;
    }

    // Total number of moves is R + C
    const N_total = R + C;

    // Calculate binomial coefficient C(N_total, R) = N_total! / (R! * C!)
    // This is done by prime factorization for efficiency with large numbers.

    // 1. Sieve of Eratosthenes to find all primes up to N_total
    // Max N_total is (5000-1) + (5000-1) = 4999 + 4999 = 9998
    const MAX_PRIME_CHECK = N_total; 
    const isPrime = new Array(MAX_PRIME_CHECK + 1).fill(true);
    
    // 0 and 1 are not prime numbers
    if (MAX_PRIME_CHECK >= 0) isPrime[0] = false; 
    if (MAX_PRIME_CHECK >= 1) isPrime[1] = false; 

    // Apply the sieve algorithm
    for (let p = 2; p * p <= MAX_PRIME_CHECK; p++) {
        if (isPrime[p]) {
            // Mark multiples of p as not prime
            for (let multiple = p * p; multiple <= MAX_PRIME_CHECK; multiple += p) {
                isPrime[multiple] = false;
            }
        }
    }

    // Collect all prime numbers found
    const primes: number[] = [];
    for (let i = 2; i <= MAX_PRIME_CHECK; i++) {
        if (isPrime[i]) {
            primes.push(i);
        }
    }

    // 2. Function to calculate the exponent of a prime p in the factorial of n (n!)
    // This uses Legendre's formula: sum(floor(n / p^k)) for k=1, 2, ...
    function countFactorialExponent(n: number, p: number): number {
        let count = 0;
        let powerOfP = p;
        while (powerOfP <= n) {
            count += Math.floor(n / powerOfP);
            // This check prevents 'powerOfP * p' from potentially overflowing standard JS number
            // if 'powerOfP' gets very large, before 'powerOfP' exceeds 'n'.
            // For n up to 9998, this is generally safe, but good practice.
            if (powerOfP > n / p) break; 
            powerOfP *= p;
        }
        return count;
    }

    // 3. Compute the result using BigInt based on prime factor exponents
    let result = 1n; // Initialize result as a BigInt

    // Iterate through all primes found
    for (const p of primes) {
        // Calculate the exponent of 'p' in N_total!
        const exponent_N_total = countFactorialExponent(N_total, p);
        // Calculate the exponent of 'p' in R!
        const exponent_R = countFactorialExponent(R, p);
        // Calculate the exponent of 'p' in C!
        const exponent_C = countFactorialExponent(C, p);

        // The net exponent for 'p' in C(N_total, R) is exponent(N_total!) - exponent(R!) - exponent(C!)
        const final_exponent = exponent_N_total - exponent_R - exponent_C;

        // If the prime 'p' has a positive net exponent, multiply it into the result
        if (final_exponent > 0) {
            result *= (BigInt(p) ** BigInt(final_exponent));
        }
    }

    // 4. Convert the BigInt result to a string and truncate to the first 1000 digits
    const resultStr = result.toString();
    console.log(resultStr.substring(0, Math.min(resultStr.length, 1000)));
}

// Call the solve function to run the program
solve();