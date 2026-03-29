// Standard input/output methods for CodinGame
// In a typical CodinGame environment, these functions are globally available.
declare function readline(): string;
declare function print(message: string): void;

// Define the alphabet and its properties
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const MOD = 53; // Modulo for all calculations

// Create mappings between characters and their numerical indices
const charToIndex = new Map<string, number>();
const indexToChar: string[] = [];
for (let i = 0; i < ALPHABET.length; i++) {
    charToIndex.set(ALPHABET[i], i);
    indexToChar[i] = ALPHABET[i];
}

/**
 * Computes base^exp % mod using modular exponentiation (exponentiation by squaring).
 * Ensures that the base remains positive modulo mod throughout the calculation.
 * @param base The base number.
 * @param exp The exponent.
 * @param mod The modulus.
 * @returns The result of (base^exp) % mod.
 */
function power(base: number, exp: number, mod: number): number {
    let res = 1;
    base = (base % mod + mod) % mod; // Ensure base is positive modulo mod
    while (exp > 0) {
        if (exp % 2 === 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
    }
    return res;
}

/**
 * Computes the modular multiplicative inverse of n modulo mod.
 * Uses Fermat's Little Theorem: n^(mod-2) % mod for a prime modulus.
 * @param n The number to find the inverse of.
 * @param mod The prime modulus.
 * @returns The modular inverse of n.
 */
function modInverse(n: number, mod: number): number {
    return power(n, mod - 2, mod);
}

/**
 * Performs modular division: (numerator / denominator) % mod.
 * This is equivalent to (numerator * denominator^-1) % mod.
 * Ensures all intermediate values and the final result are positive modulo mod.
 * @param numerator The numerator.
 * @param denominator The denominator.
 * @param mod The modulus.
 * @returns The result of modular division.
 */
function modDiv(numerator: number, denominator: number, mod: number): number {
    // Ensure numerator and denominator are positive modulo mod before operations
    numerator = (numerator % mod + mod) % mod;
    denominator = (denominator % mod + mod) % mod;
    
    // Calculate inverse of denominator
    const invDen = modInverse(denominator, mod);
    
    // Perform multiplication and ensure final result is positive
    let result = (numerator * invDen) % mod;
    return (result + mod) % mod; 
}

// Main function to solve the puzzle
function solve() {
    // Read N, the number of parts gathered
    const N: number = parseInt(readline());

    // Interface to store an agent's data: their number (x) and their secret part (yValues)
    interface AgentData {
        x: number; // Agent's identifier (e.g., 5 for "005")
        yValues: number[]; // The sequence of character indices for this agent's part
    }
    const agents: AgentData[] = [];

    let secretLength = 0; // To store the length of the secret message

    // Read and parse N lines of agent data
    for (let i = 0; i < N; i++) {
        const inputs = readline().split(' ');
        const agentCode: number = parseInt(inputs[0]); // Convert "005" to 5
        const secretPart: string = inputs[1]; // The string part, e.g., "Lvb"

        // The length of all secret parts is the same; store it from the first agent
        if (i === 0) {
            secretLength = secretPart.length;
        }

        // Convert the secret part string into an array of numerical indices
        const yValues: number[] = [];
        for (const char of secretPart) {
            yValues.push(charToIndex.get(char)!); // ! asserts that char is found in map
        }
        agents.push({ x: agentCode, yValues: yValues });
    }

    let revealedSecret = ""; // Accumulator for the reconstructed secret message

    // Iterate through each character position of the secret message
    // (from 0 to secretLength-1)
    for (let j = 0; j < secretLength; j++) {
        let characterValue = 0; // This will be P[j](0), the numerical index of the j-th secret character

        // Apply Lagrange Interpolation formula: P(0) = SUM (Y_idx * L_idx(0)) % MOD
        // We iterate through each available agent's point to compute the sum.
        // N is the number of points, so the polynomial degree is N-1.
        for (let idx = 0; idx < N; idx++) {
            const X_idx = agents[idx].x; // The x-coordinate (agent number) for the current point
            const Y_idx = agents[idx].yValues[j]; // The y-coordinate (j-th character value) for the current point

            let lagrangeTermProduct = 1; // Accumulator for L_idx(0)

            // Calculate L_idx(0) = PRODUCT_{m=0, m!=idx}^{N-1} ((-X_m) / (X_idx - X_m)) % MOD
            for (let m = 0; m < N; m++) {
                if (m === idx) continue; // Skip when m equals idx (denominator would be zero)

                const X_m = agents[m].x; // The x-coordinate for other points

                const numerator = -X_m;
                const denominator = X_idx - X_m;

                // Multiply the current product by the term, using modular division
                lagrangeTermProduct = modDiv(lagrangeTermProduct * numerator, denominator, MOD);
            }
            
            // Add the current term (Y_idx * L_idx(0)) to the sum
            // Ensure intermediate sum also stays positive modulo MOD
            characterValue = (characterValue + Y_idx * lagrangeTermProduct) % MOD;
            characterValue = (characterValue + MOD) % MOD; // Normalize to [0, MOD-1]
        }

        // Convert the numerical character value back to its character form
        // and append it to the revealed secret string
        revealedSecret += indexToChar[characterValue];
    }

    // Print the final revealed secret
    print(revealedSecret);
}

// Execute the solver function
solve();