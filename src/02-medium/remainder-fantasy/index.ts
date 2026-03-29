// Standard input/output functions provided by the CodinGame platform.
// declare function readline(): string;
// declare function print(message: any): void;

/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInts using the Euclidean algorithm.
 * Handles negative inputs by converting them to positive before calculation.
 * @param a The first BigInt.
 * @param b The second BigInt.
 * @returns The GCD of a and b.
 */
function gcd(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a; // Ensure positive
    b = b < 0n ? -b : b; // Ensure positive
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

/**
 * Implements the Extended Euclidean Algorithm.
 * Finds integers x and y such that ax + by = gcd(a, b).
 * @param a The first BigInt.
 * @param b The second BigInt.
 * @returns A tuple [gcd, x, y].
 */
function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (b === 0n) {
        return [a, 1n, 0n];
    }
    const [g, x1, y1] = egcd(b, a % b);
    const x = y1;
    const y = x1 - (a / b) * y1;
    return [g, x, y];
}

/**
 * Calculates the modular multiplicative inverse of 'a' modulo 'm'.
 * Returns x such that (a * x) % m === 1.
 * Requires gcd(a, m) === 1.
 * @param a The BigInt for which to find the inverse.
 * @param m The BigInt modulus.
 * @returns The modular inverse (smallest non-negative).
 * @throws Error if modular inverse does not exist (gcd(a, m) !== 1).
 */
function modInverse(a: bigint, m: bigint): bigint {
    // If modulus is 1, any value can be considered an inverse (since a * x % 1 = 0).
    // Returning 0n works correctly with subsequent calculations (target * 0 % 1 = 0).
    if (m === 1n) return 0n; 

    const [g, x] = egcd(a, m); // y is not needed for this function
    if (g !== 1n) {
        // This case should ideally not be hit given the problem context where
        // a solution is always expected.
        throw new Error("Modular inverse does not exist (a and m are not coprime).");
    }
    // Ensure the result is positive and within [0, m-1]
    return (x % m + m) % m;
}

/**
 * Solves the Remainder Fantasy puzzle using the Chinese Remainder Theorem
 * extended to handle non-coprime moduli, and applies the additional constraints.
 */
function solve() {
    const N = parseInt(readline());

    // current_x represents the smallest non-negative particular solution
    // to the system of congruences processed so far.
    // current_modulus represents the LCM of all moduli processed so far.
    // Initially, x = 0 (mod 1) is true for any integer x.
    let current_x: bigint = 0n;
    let current_modulus: bigint = 1n; 
    
    // Keep track of the maximum modulo (m) encountered, for the final constraint.
    let max_m: bigint = 0n;

    for (let i = 0; i < N; i++) {
        const line = readline().split(' ');
        const m_i = BigInt(line[0]);
        const r_i = BigInt(line[1]);

        // Update max_m with the largest modulo seen so far
        if (m_i > max_m) {
            max_m = m_i;
        }

        // We are combining two congruences:
        // 1. x ≡ current_x (mod current_modulus)
        // 2. x ≡ r_i       (mod m_i)

        // From (1), we can write x = current_x + k * current_modulus for some integer k.
        // Substitute into (2): current_x + k * current_modulus ≡ r_i (mod m_i)
        // Rearranging to solve for k: k * current_modulus ≡ r_i - current_x (mod m_i)

        const g = gcd(current_modulus, m_i);
        const diff = r_i - current_x;

        // Check for consistency: (r_i - current_x) must be divisible by gcd(current_modulus, m_i).
        // If not, the system is inconsistent. Problem constraints usually guarantee solvability.
        if (diff % g !== 0n) {
            throw new Error("The system of congruences is inconsistent.");
        }

        // Divide the linear congruence by g:
        // k * (current_modulus / g) ≡ (diff / g) (mod m_i / g)
        // Let A = (current_modulus / g), B = (diff / g), M_prime = (m_i / g)
        // So, k * A ≡ B (mod M_prime)

        const mod_prime = m_i / g;
        const coeff = current_modulus / g;
        const target = diff / g;

        // Find the modular multiplicative inverse of 'coeff' modulo 'mod_prime'.
        // Since (current_modulus / g) and (m_i / g) are coprime, the inverse always exists.
        const inv = modInverse(coeff, mod_prime);
        
        // Calculate k0, the smallest non-negative integer solution for k.
        let k0 = (target * inv) % mod_prime;
        // Ensure k0 is non-negative, as JavaScript's '%' operator can return negative results
        // for negative operands (e.g., -6 % 7 is -6).
        if (k0 < 0n) {
            k0 += mod_prime;
        }

        // Update current_x with the new particular solution.
        // The new combined solution is current_x + k0 * current_modulus.
        current_x = current_x + k0 * current_modulus;

        // The new modulus for the combined system is lcm(current_modulus, m_i).
        // lcm(a, b) = (a * b) / gcd(a, b)
        current_modulus = (current_modulus * m_i) / g;

        // Normalize current_x to be within the range [0, current_modulus - 1].
        // This ensures current_x remains the smallest non-negative solution for the system
        // of congruences processed so far.
        current_x = (current_x % current_modulus + current_modulus) % current_modulus;
    }

    // At this point, current_x is the smallest non-negative integer that satisfies all
    // given congruences. The general solution is X = current_x + K * current_modulus,
    // where K is any integer.

    // Apply the additional constraint: the answer must be the smallest possible value of x
    // such that x is greater than or equal to every modulo in input (i.e., x ≥ max_m).
    let final_x = current_x;
    while (final_x < max_m) {
        final_x += current_modulus;
    }

    // Print the final result. BigInt values are converted to string automatically for print.
    print(final_x.toString());
}

// Execute the solver function.
solve();