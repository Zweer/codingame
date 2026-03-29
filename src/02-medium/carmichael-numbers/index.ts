// Standard input reading in CodinGame environment
declare function readline(): string;

function solve() {
    const N: number = parseInt(readline());

    /**
     * Checks if a number is prime.
     * This optimization checks divisibility by 2 and 3 first, then loops for numbers of the form 6k ± 1.
     * @param num The number to check.
     * @returns True if prime, false otherwise.
     */
    function isPrime(num: number): boolean {
        if (num <= 1) return false; // Numbers less than or equal to 1 are not prime
        if (num <= 3) return true;  // 2 and 3 are prime numbers

        // If num is divisible by 2 or 3, it's not prime
        if (num % 2 === 0 || num % 3 === 0) return false;

        // All primes greater than 3 can be written in the form 6k ± 1.
        // We only need to check divisors up to sqrt(num).
        for (let i = 5; i * i <= num; i += 6) {
            // Check for divisibility by i and (i + 2)
            if (num % i === 0 || num % (i + 2) === 0) {
                return false;
            }
        }
        return true;
    }

    // A Carmichael number N must satisfy these conditions:
    // 1. N is composite (not prime, N > 1).
    // 2. N is odd.
    // 3. N is square-free (not divisible by the square of any prime).
    // 4. For every prime factor p of N, (p-1) must divide (N-1).

    // Step 1: Initial checks for numbers that cannot be Carmichael.
    // - N <= 1 are not composite.
    // - N % 2 === 0 (N is even): Carmichael numbers are odd.
    // - isPrime(N): Carmichael numbers are composite by definition.
    if (N <= 1 || N % 2 === 0 || isPrime(N)) {
        console.log("NO");
        return; // Exit the function as N is not a Carmichael number
    }

    // At this point, N is guaranteed to be a composite, odd number greater than 1.
    // Now we proceed to check the remaining Carmichael properties: square-freeness
    // and the divisibility condition for its prime factors.

    const primeFactors: number[] = [];
    let tempN = N; // Use a temporary variable to modify during factorization
    let isSquareFree = true; // Assume square-free until a squared factor is found

    // Step 2: Find prime factors and check for square-freeness.
    // Since N is odd (checked above), we only need to check for odd prime factors.
    // We iterate from 3 up to sqrt(tempN), incrementing by 2.
    for (let i = 3; i * i <= tempN; i += 2) {
        if (tempN % i === 0) {
            // Found a prime factor 'i'.
            primeFactors.push(i);
            let count = 0; // Count occurrences of this factor to check for square-freeness
            while (tempN % i === 0) {
                tempN /= i;
                count++;
            }
            if (count > 1) {
                // If 'i' divided N more than once, it means N is divisible by i*i.
                // Thus, N is not square-free.
                isSquareFree = false;
                break; // No need to continue factoring, N is not a Carmichael number.
            }
        }
    }

    // If, after the loop, tempN is still greater than 1, it means the remaining tempN
    // is a prime factor itself (the largest one). Add it to the list.
    if (tempN > 1) {
        primeFactors.push(tempN);
    }

    // Step 3: If N is not square-free, it's not a Carmichael number.
    if (!isSquareFree) {
        console.log("NO");
        return;
    }

    // Step 4: Check the third core condition: For every prime factor p of N, (p-1) must divide (N-1).
    let isCarmichael = true; // Assume N is Carmichael until a condition fails
    for (const p of primeFactors) {
        // 'p' is a prime factor of N. Since N is odd and composite, all its prime factors 'p'
        // will be odd and greater than or equal to 3. So (p-1) will always be >= 2.
        if ((N - 1) % (p - 1) !== 0) {
            isCarmichael = false; // Condition failed for this prime factor
            break; // N is not a Carmichael number, no need to check further factors
        }
    }

    // Step 5: Output the result.
    if (isCarmichael) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

solve(); // Execute the main function