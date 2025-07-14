// The readline function is provided by the CodinGame platform.
// For local testing, you might need to mock it.
// declare function readline(): string; 

/**
 * Solves the "Divide the factorial" puzzle.
 * Finds the largest integer X such that A^X divides B!.
 */
function solveDivideFactorial(): void {
    // Read input: A and B separated by a space
    const line = readline();
    const parts = line.split(' ');
    let A: number = parseInt(parts[0]);
    const B: number = parseInt(parts[1]);

    // Step 1: Prime factorize A
    // Stores prime factors of A and their respective counts
    // e.g., A=12 => {2: 2, 3: 1}
    const primeFactorsA = new Map<number, number>();
    let tempA = A; // Use a temporary variable for factorization

    // Optimize for factor 2
    if (tempA % 2 === 0) {
        let count = 0;
        while (tempA % 2 === 0) {
            count++;
            tempA /= 2;
        }
        primeFactorsA.set(2, count);
    }

    // Check for odd prime factors from 3 up to sqrt(tempA)
    // We iterate up to sqrt(tempA) because if tempA has a prime factor larger than its sqrt,
    // it must be the only remaining factor after dividing out smaller ones.
    for (let i = 3; i * i <= tempA; i += 2) {
        if (tempA % i === 0) {
            let count = 0;
            while (tempA % i === 0) {
                count++;
                tempA /= i;
            }
            primeFactorsA.set(i, count);
        }
    }

    // If tempA is still greater than 1 after the loop, it means the remaining tempA
    // is a prime factor itself (and it's greater than sqrt of original tempA).
    if (tempA > 1) {
        primeFactorsA.set(tempA, (primeFactorsA.get(tempA) || 0) + 1);
    }

    // Step 2: Calculate the exponent for each prime factor in B! using Legendre's Formula
    // E_p(n!) = floor(n/p) + floor(n/p^2) + floor(n/p^3) + ...
    // And determine the maximum X based on the minimum available prime factor count.
    let minX: number = Infinity; // Initialize with a very large number to find the true minimum

    // Iterate over each distinct prime factor 'p' of A and its count 'countA' in A
    for (const [p, countA] of primeFactorsA.entries()) {
        let exponentB_p = 0; // Total count of prime 'p' in B!
        let currentPowerOfP = p; // Start with p, then p^2, p^3, etc.

        // Apply Legendre's formula
        // Loop continues as long as currentPowerOfP <= B
        // currentPowerOfP will not overflow Number.MAX_SAFE_INTEGER before exceeding B
        // given B <= 10^7.
        while (true) {
            // Add the count of multiples of currentPowerOfP in B!
            exponentB_p += Math.floor(B / currentPowerOfP);

            // Check if multiplying currentPowerOfP by p would exceed B.
            // If currentPowerOfP * p would be > B, then floor(B / (currentPowerOfP * p))
            // would be 0, so no need for further iterations.
            // This also implicitly handles potential overflow of currentPowerOfP * p if B were much larger,
            // but for these constraints, it's primarily for early termination.
            if (currentPowerOfP > B / p) {
                break;
            }
            currentPowerOfP *= p;
        }
        
        // The maximum power of A (for this prime factor p) that can divide B!
        // is floor(exponentB_p / countA)
        const currentX = Math.floor(exponentB_p / countA);
        
        // Update minX with the smallest X found so far.
        // This is crucial because A^X must divide B! for ALL prime factors of A.
        minX = Math.min(minX, currentX);
    }

    // Output the result
    console.log(minX);
}

// Call the main function to solve the puzzle
solveDivideFactorial();