// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// --- Sieve of Eratosthenes ---
const MAX_PRIME_VALUE = 1999; // The constraint is "Every prime involved is less than 2000"
                              // so max prime is 1999.
const isPrime: boolean[] = new Array(MAX_PRIME_VALUE + 1).fill(true);
const primesDescending: number[] = []; // Used for solving e_p and final output order
const primesAscending: number[] = [];  // Used for Legendre's formula precomputation and prime factorization

isPrime[0] = isPrime[1] = false;
for (let p = 2; p * p <= MAX_PRIME_VALUE; p++) {
    if (isPrime[p]) {
        for (let i = p * p; i <= MAX_PRIME_VALUE; i += p)
            isPrime[i] = false;
    }
}

for (let p = 2; p <= MAX_PRIME_VALUE; p++) {
    if (isPrime[p]) {
        primesAscending.push(p);
    }
}
primesDescending.push(...primesAscending.slice().reverse()); // Create a reversed copy

// --- Prime Factorization Helper ---
// Given a number, returns a map of its prime factors to their counts
function getPrimeFactorCounts(num: number): Map<number, number> {
    const counts = new Map<number, number>();
    for (const p of primesAscending) { // Iterate through primes in ascending order
        if (num === 1) break;
        // Optimization: If current prime p is greater than num, any remaining num
        // must be a prime factor itself. But given problem constraints that all involved
        // primes are < 2000, 'num' should reduce to 1 by primes <= MAX_PRIME_VALUE.
        // If 'num' has a prime factor > MAX_PRIME_VALUE, it cannot be decomposed,
        // so we implicitly assume valid inputs that always reduce to 1.
        if (p > num && num > 1) { 
            // This path would only be taken if `num` is a prime > MAX_PRIME_VALUE
            // but for `num` to be representable, it must only have prime factors <= MAX_PRIME_VALUE.
            // So, this branch should ideally not be hit with valid inputs, or if hit,
            // indicates an irrepresentable N (which is not handled explicitly, but okay by problem type).
            break; 
        }
        while (num % p === 0) {
            counts.set(p, (counts.get(p) || 0) + 1);
            num /= p;
        }
    }
    return counts;
}

// --- Parse Input N ---
const N_str: string = readline();
let numerator: number;
let denominator: number;

if (N_str.includes('/')) {
    const parts = N_str.split('/');
    numerator = parseInt(parts[0]);
    denominator = parseInt(parts[1]);
} else {
    numerator = parseInt(N_str);
    denominator = 1;
}

// --- Calculate v_q(N) = v_q(num) - v_q(den) ---
const primeFactorCountsNum = getPrimeFactorCounts(numerator);
const primeFactorCountsDen = getPrimeFactorCounts(denominator);

const v_q_N_map = new Map<number, number>(); // Stores the net exponent for each prime q in N
for (const p of primesAscending) { // Iterate all primes that could be factors
    const countNum = primeFactorCountsNum.get(p) || 0;
    const countDen = primeFactorCountsDen.get(p) || 0;
    const exponent = countNum - countDen;
    if (exponent !== 0) {
        v_q_N_map.set(p, exponent);
    }
}

// --- Calculate Legendre's Formula values ---
// E_q(n!) = floor(n/q) + floor(n/q^2) + ...
function calculateLegendreExponent(n: number, q: number): number {
    let exponent = 0;
    let powerOfQ = q;
    while (powerOfQ <= n) {
        exponent += Math.floor(n / powerOfQ);
        // Avoid overflow for powerOfQ * q if powerOfQ is already very large
        // and prevent infinite loop if powerOfQ*q becomes 0
        if (powerOfQ > n / q) break; 
        powerOfQ *= q;
    }
    return exponent;
}

// leg_exponents[p_val][q_val] stores E_q_val(p_val!)
const leg_exponents = new Map<number, Map<number, number>>(); // p_val -> (q_val -> E_q_val(p_val!))

for (const p_val of primesAscending) { // p_val is the 'p' in p!
    const q_exponents = new Map<number, number>();
    for (const q_val of primesAscending) { // q_val is the 'q' in E_q
        if (q_val > p_val) break; // E_q(p!) is 0 if q > p
        q_exponents.set(q_val, calculateLegendreExponent(p_val, q_val));
    }
    leg_exponents.set(p_val, q_exponents);
}

// --- Solve for e_p using back-substitution ---
// Equation: v_q(N) = e_q * E_q(q!) + Sum_{p > q, p prime} e_p * E_q(p!)
// Since E_q(q!) = 1, this simplifies to:
// e_q = v_q(N) - Sum_{p > q, p prime} e_p * E_q(p!)
const decompositionMap = new Map<number, number>(); // prime -> exponent for p!

// Iterate primes in descending order to solve for e_p
for (const current_prime_p of primesDescending) {
    const current_v_p_N = v_q_N_map.get(current_prime_p) || 0;
    let sum_of_higher_terms = 0;

    // Sum over terms involving primes p_i > current_prime_p
    // These e_p_i are already computed in previous iterations (since we iterate descending)
    for (const higher_prime of primesDescending) {
        if (higher_prime <= current_prime_p) break; // Stop when we reach or go below current_prime_p
        
        const e_higher_prime = decompositionMap.get(higher_prime);
        // Optimization: skip if coefficient is 0, as it won't contribute to the sum
        if (e_higher_prime === undefined || e_higher_prime === 0) continue; 
        
        const E_current_prime_higher_prime_factorial = leg_exponents.get(higher_prime)?.get(current_prime_p) || 0;
        sum_of_higher_terms += e_higher_prime * E_current_prime_higher_prime_factorial;
    }

    const e_current_prime = current_v_p_N - sum_of_higher_terms;
    if (e_current_prime !== 0) {
        decompositionMap.set(current_prime_p, e_current_prime);
    }
}

// --- Format Output ---
const result_terms: string[] = [];
// Iterate primes in descending order to match output requirement
for (const p of primesDescending) {
    const exponent = decompositionMap.get(p);
    if (exponent !== undefined && exponent !== 0) {
        result_terms.push(`${p}#${exponent}`);
    }
}

print(result_terms.join(' '));