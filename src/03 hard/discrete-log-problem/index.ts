// Declare readline for TypeScript compiler, as it's provided globally by CodinGame.
declare function readline(): string;

/**
 * Main function to solve the Discrete Log Problem.
 */
function solve() {
    // Read the input line containing G, H, Q space-separated.
    const inputLine = readline();
    const [gStr, hStr, qStr] = inputLine.split(' ');

    // Convert string inputs to BigInt for accurate large number arithmetic.
    const G = BigInt(gStr);
    const H = BigInt(hStr);
    const Q = BigInt(qStr);

    /**
     * Computes (base^exp) % mod using binary exponentiation (exponentiation by squaring).
     * This function works with BigInts to handle large numbers.
     * @param base The base for exponentiation.
     * @param exp The exponent.
     * @param mod The modulus.
     * @returns (base^exp) % mod.
     */
    function pow(base: bigint, exp: bigint, mod: bigint): bigint {
        let res = 1n; // Initialize result to 1 (representing base^0)
        base %= mod; // Ensure base is within the modulus range (0 to mod-1)

        // Iterate while the exponent is greater than 0
        while (exp > 0n) {
            // If the current bit of the exponent is 1 (i.e., exp is odd)
            // then multiply the result by the current base value.
            if (exp % 2n === 1n) {
                res = (res * base) % mod;
            }
            // Square the base for the next iteration.
            base = (base * base) % mod;
            // Right-shift the exponent by 1 (equivalent to integer division by 2).
            exp /= 2n;
        }
        return res;
    }

    // Baby-step Giant-step algorithm to solve G^X = H (mod Q).
    // The algorithm finds X in the form X = i * m + j.

    // Calculate m = ceil(sqrt(Q)).
    // Since Q < 5 * 10^10, Number(Q) fits in a standard JavaScript number,
    // so Math.sqrt can be used. The result is then converted to BigInt.
    const m = BigInt(Math.ceil(Math.sqrt(Number(Q))));

    // Phase 1: Baby Steps
    // Precompute G^j mod Q for j from 0 to m-1.
    // Store these values in a Map: Map<G^j mod Q, j>.
    // Using a Map (hash table) provides efficient O(1) average time lookups.
    const babySteps = new Map<bigint, bigint>();
    let currentG_j = 1n; // Represents G^j, starting with G^0 = 1.

    // Iterate j from 0 up to m-1.
    for (let j = 0n; j < m; j++) {
        // Store the current G^j value and its exponent j.
        // If a value (currentG_j) already exists in the map, we don't overwrite it.
        // This ensures that for a given G^j value, we store the *smallest* j
        // that produces it, which is crucial for finding the *lowest* X later.
        if (!babySteps.has(currentG_j)) {
            babySteps.set(currentG_j, j);
        }
        // Calculate the next G^j mod Q for the next iteration.
        currentG_j = (currentG_j * G) % Q;
    }

    // Phase 2: Giant Steps
    // We need to compute (G^m)^(-1) mod Q.
    // Since Q is a prime number (given as "order of the key"),
    // we can use Fermat's Little Theorem: a^(Q-2) = a^(-1) mod Q.
    const G_m = pow(G, m, Q); // First, compute G^m mod Q.
    const G_m_inv = pow(G_m, Q - 2n, Q); // Then, compute its modular inverse (G^m)^(-1) mod Q.

    let currentH_term = H; // Represents H * (G^(-m))^i, starting with i=0 (so just H).

    // Iterate i from 0 up to m-1.
    for (let i = 0n; i < m; i++) {
        // Check if the current H_term exists in our babySteps map.
        // If it exists, it means we found a 'j' such that currentH_term = G^j (mod Q).
        if (babySteps.has(currentH_term)) {
            // Retrieve the corresponding 'j' value from the map.
            const j = babySteps.get(currentH_term)!;
            
            // We have H * (G^(-m))^i = G^j (mod Q).
            // Rearranging this equation gives: H = G^j * (G^m)^i (mod Q).
            // This means H = G^(j + i*m) (mod Q).
            // So, the secret key X is j + i*m.
            const X = i * m + j;

            // Output the lowest integer X found and terminate.
            console.log(X.toString());
            return;
        }
        // If no match is found, compute the next term for the giant steps:
        // currentH_term becomes H * (G^(-m))^(i+1) mod Q.
        currentH_term = (currentH_term * G_m_inv) % Q;
    }

    // This part should ideally not be reached given the problem constraints guarantee a solution.
    // It's a fallback or for debugging if a solution isn't found.
    // console.error("No solution found within the expected range.");
}

// Execute the solver function.
solve();