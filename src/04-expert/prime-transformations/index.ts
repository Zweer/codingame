// Define readline for CodinGame environment
declare function readline(): string;

/**
 * Generates an array of prime numbers up to a specified limit using the Sieve of Eratosthenes.
 * @param limit The upper bound for prime numbers.
 * @returns An array of BigInt prime numbers.
 */
function getPrimesUpTo(limit: number): BigInt[] {
    const isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = false;
    isPrime[1] = false;
    for (let p = 2; p * p <= limit; p++) {
        if (isPrime[p]) {
            for (let i = p * p; i <= limit; i += p)
                isPrime[i] = false;
        }
    }
    const primes: BigInt[] = [];
    for (let p = 2; p <= limit; p++) {
        if (isPrime[p]) {
            primes.push(BigInt(p));
        }
    }
    return primes;
}

// Precompute primes up to 100 as per the constraint "2 <= Pi <= 100".
// This constraint implies all prime factors of X, Ai, and Bi will be <= 100.
const primesUpTo100 = getPrimesUpTo(100);

/**
 * Performs prime factorization of a BigInt number.
 * Assumes all prime factors are within `primesUpTo100` based on problem constraints.
 * @param n The BigInt number to factorize.
 * @returns A Map where keys are prime factors (BigInt) and values are their exponents (number).
 */
function primeFactorize(n: BigInt): Map<BigInt, number> {
    const factors = new Map<BigInt, number>();
    let currentN = n;

    for (const p of primesUpTo100) {
        if (currentN % p === 0n) {
            let count = 0;
            while (currentN % p === 0n) {
                count++;
                currentN /= p;
            }
            factors.set(p, count);
        }
        if (currentN === 1n) {
            break; // All factors found
        }
    }
    
    // According to the problem constraint "2 <= Pi <= 100", currentN must be 1n at this point
    // for valid inputs. If it's not, it implies a prime factor greater than 100, 
    // which contradicts the problem constraints. We assume inputs adhere to constraints.
    return factors;
}

// Read the integer X to transform
const X_str: string = readline();
const X: BigInt = BigInt(X_str);

// Read the number of clues C
const C: number = parseInt(readline());

// Map to store the deduced prime transformations (original_prime -> transformed_prime)
const primeMap = new Map<BigInt, BigInt>();
// Map to check for unique transformed primes (transformed_prime -> original_prime)
const reversePrimeMap = new Map<BigInt, BigInt>();

// Store all clues as factorized pairs
const clues: [Map<BigInt, number>, Map<BigInt, number>][] = [];

for (let i = 0; i < C; i++) {
    const line: string[] = readline().split(' ');
    const Ai: BigInt = BigInt(line[0]);
    const Bi: BigInt = BigInt(line[1]);

    const factorsA = primeFactorize(Ai);
    const factorsB = primeFactorize(Bi);
    clues.push([factorsA, factorsB]);
}

// Iteratively deduce the prime transformations from the clues
let newMappingsFoundThisPass: boolean;
do {
    newMappingsFoundThisPass = false;
    const cluesToKeepForNextPass: [Map<BigInt, number>, Map<BigInt, number>][] = [];

    for (const [factorsA, factorsB] of clues) {
        const potentialLocalMappings = new Map<BigInt, BigInt>();
        // Keep track of primes from factorsB that have been assigned as targets within this specific clue
        const primesBUsedLocally = new Set<BigInt>();
        let clueSuccessfullyProcessedInThisPass = true;

        // Create a mutable copy of factorsB to track availability for matching exponents
        const availableFactorsB = new Map(factorsB);

        // --- Step 1: Process primes in factorsA that are ALREADY in the global primeMap ---
        // Verify consistency and mark corresponding primes in factorsB as used.
        for (const [pA, expA] of factorsA.entries()) {
            if (primeMap.has(pA)) {
                const pB_expected = primeMap.get(pA)!;
                if (availableFactorsB.has(pB_expected) && availableFactorsB.get(pB_expected)! === expA) {
                    potentialLocalMappings.set(pA, pB_expected);
                    primesBUsedLocally.add(pB_expected);
                    availableFactorsB.delete(pB_expected); // Mark as used from factorsB for this clue
                } else {
                    // This clue is inconsistent with existing mappings, or cannot be fulfilled.
                    // This scenario should primarily mean 'not yet resolvable' with valid input.
                    clueSuccessfullyProcessedInThisPass = false;
                    break;
                }
            }
        }
        
        if (!clueSuccessfullyProcessedInThisPass) {
            cluesToKeepForNextPass.push([factorsA, factorsB]);
            continue; // Move to the next clue
        }

        // --- Step 2: Process primes in factorsA that are NOT YET in the global primeMap ---
        // Try to find unique mappings based on exponents and available target primes.
        const unmappedPrimesA = Array.from(factorsA.entries()).filter(([pA, expA]) => !primeMap.has(pA));
        
        let hasAmbiguities = false;
        for (const [pA, expA] of unmappedPrimesA) {
            const candidatesForPA: BigInt[] = [];
            for (const [pB, expB] of availableFactorsB.entries()) {
                // Candidate pB must match exponent, not be used locally for this clue,
                // and not already be a target for another prime in the global map.
                if (expA === expB && !primesBUsedLocally.has(pB) && !reversePrimeMap.has(pB)) {
                    candidatesForPA.push(pB);
                }
            }

            if (candidatesForPA.length === 1) {
                // Unique candidate found for pA in this clue
                const pB_unique = candidatesForPA[0];
                potentialLocalMappings.set(pA, pB_unique);
                primesBUsedLocally.add(pB_unique);
                availableFactorsB.delete(pB_unique); // Mark as used for this clue
            } else if (candidatesForPA.length === 0) {
                // No match found for pA with the required exponent among available primes in B.
                clueSuccessfullyProcessedInThisPass = false;
                break;
            } else { // candidatesForPA.length > 1
                // Ambiguity: multiple possible targets for pA. Cannot resolve this clue in this pass.
                hasAmbiguities = true;
                clueSuccessfullyProcessedInThisPass = false; // Mark this clue as not fully resolved
                break;
            }
        }
        
        if (hasAmbiguities || !clueSuccessfullyProcessedInThisPass) {
            cluesToKeepForNextPass.push([factorsA, factorsB]);
            continue; // Move to the next clue
        }

        // --- Step 3: All primes in factorsA could be uniquely mapped within this clue. Apply to global map. ---
        // First, check for conflicts before applying.
        let canApplyCurrentClueMappings = true;
        for (const [pA_local, pB_local] of potentialLocalMappings.entries()) {
            if (primeMap.has(pA_local) && primeMap.get(pA_local)! !== pB_local) {
                // Conflict: pA is already mapped to a different pB globally
                canApplyCurrentClueMappings = false;
                break;
            }
            if (reversePrimeMap.has(pB_local) && reversePrimeMap.get(pB_local)! !== pA_local) {
                // Conflict: pB is already a target for a different pA globally ("no two primes map to same prime")
                canApplyCurrentClueMappings = false;
                break;
            }
        }

        if (canApplyCurrentClueMappings) {
            for (const [pA_local, pB_local] of potentialLocalMappings.entries()) {
                if (!primeMap.has(pA_local)) { // Only add if it's a new mapping
                    primeMap.set(pA_local, pB_local);
                    reversePrimeMap.set(pB_local, pA_local);
                    newMappingsFoundThisPass = true; // Indicate progress
                }
            }
        } else {
            // Clue led to conflict, keep for next pass. (Should ideally not happen with valid input.)
            cluesToKeepForNextPass.push([factorsA, factorsB]);
        }
    }
    
    // Replace the original clues list with the ones that couldn't be fully resolved yet
    clues.length = 0; // Clear the array
    clues.push(...cluesToKeepForNextPass); // Add unresolved clues back

} while (newMappingsFoundThisPass); // Continue as long as new mappings are being found

// --- Apply the transformation to X ---
const factorsX = primeFactorize(X);
let Y: BigInt = 1n; // Initialize Y as a BigInt

for (const [p, exp] of factorsX.entries()) {
    // If a prime factor 'p' of X is in our deduced primeMap, use its transformed value.
    // Otherwise, assume it maps to itself (default behavior for unmapped primes).
    const p_transformed = primeMap.has(p) ? primeMap.get(p)! : p;
    Y *= (p_transformed ** BigInt(exp)); // Apply the transformation: (P_transformed)^Q
}

// Output the transformed value Y
console.log(Y.toString());