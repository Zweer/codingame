import * as readline from 'readline';

// --- Constants (provided in the puzzle description) ---
const P = 0x3fddbf07bb3bc551n; // Prime modulus
const A = 0n; // Parameter A for the curve equation Y^2 = X^3 + A*X + B mod P
const B = 7n; // Parameter B for the curve equation
const G_X = 0x69d463ce83b758en; // X-coordinate of the base point G
const G_Y = 0x287a120903f7ef5cn; // Y-coordinate of the base point G

// --- Point Class ---
class Point {
    x: bigint;
    y: bigint;
    isInfinity: boolean; // Flag to represent the point at infinity

    constructor(x: bigint, y: bigint, isInfinity: boolean = false) {
        this.x = x;
        this.y = y;
        this.isInfinity = isInfinity;
    }
}

// The point at infinity, additive identity in ECC
const O = new Point(0n, 0n, true); 

// The base point G
const G = new Point(G_X, G_Y);

// --- Modular Arithmetic Helper Functions ---

/**
 * Computes (n % m), ensuring a positive result.
 * @param n The number.
 * @param m The modulus.
 * @returns The result of n mod m.
 */
function mod(n: bigint, m: bigint): bigint {
    return ((n % m) + m) % m;
}

/**
 * Computes (base^exp) % modVal using modular exponentiation (exponentiation by squaring).
 * @param base The base.
 * @param exp The exponent.
 * @param modVal The modulus.
 * @returns (base^exp) % modVal.
 */
function power(base: bigint, exp: bigint, modVal: bigint): bigint {
    let res = 1n;
    base = mod(base, modVal); // Ensure base is within [0, modVal-1]
    while (exp > 0n) {
        if (exp % 2n === 1n) { // If exp is odd
            res = mod(res * base, modVal);
        }
        base = mod(base * base, modVal); // base = base^2 % modVal
        exp /= 2n; // exp = exp / 2 (integer division)
    }
    return res;
}

/**
 * Computes the modular multiplicative inverse of 'a' modulo 'm'.
 * Uses Fermat's Little Theorem: a^(m-2) % m is the inverse if m is prime.
 * @param a The number for which to find the inverse.
 * @param m The prime modulus.
 * @returns The modular inverse of a mod m.
 */
function modInverse(a: bigint, m: bigint): bigint {
    // Note: This relies on m being a prime number.
    return power(a, m - 2n, m);
}

// --- Elliptic Curve Point Operations ---

/**
 * Doubles a point C on the elliptic curve.
 * @param C The point to double.
 * @returns The point 2*C.
 */
function pointDouble(C: Point): Point {
    if (C.isInfinity) {
        return O; // Doubling the point at infinity results in the point at infinity
    }
    
    // If Yc is 0, the tangent at C is vertical, and 2C is the point at infinity.
    if (C.y === 0n) {
        return O;
    }

    // Calculate slope L = (3*Xc^2 + A) / (2*Yc) mod P
    const numerator = mod(3n * C.x * C.x + A, P);
    const denominator = mod(2n * C.y, P);
    
    // The denominator should not be zero here because C.y !== 0n and P is a large prime.
    // If it were zero, it would imply C.y is 0 mod P, which is handled above.
    const L = mod(numerator * modInverse(denominator, P), P);

    // Calculate new point coordinates Xs, Ys
    const Xs = mod(L * L - C.x - C.x, P); // Xs = L^2 - 2*Xc mod P
    const Ys = mod(L * (C.x - Xs) - C.y, P);

    return new Point(Xs, Ys);
}

/**
 * Adds two points C and D on the elliptic curve.
 * @param C The first point.
 * @param D The second point.
 * @returns The point C + D.
 */
function pointAdd(C: Point, D: Point): Point {
    if (C.isInfinity) {
        return D; // C + O = C
    }
    if (D.isInfinity) {
        return C; // O + D = D
    }

    if (C.x === D.x) {
        if (C.y === D.y) {
            // C === D, so this is a point doubling operation
            return pointDouble(C);
        } else {
            // C.x === D.x and C.y === -D.y (mod P), meaning C and D are inverses
            // Their sum is the point at infinity
            return O;
        }
    }

    // Calculate slope L = (Yd - Yc) / (Xd - Xc) mod P
    const numerator = mod(D.y - C.y, P);
    const denominator = mod(D.x - C.x, P);
    
    // Denominator cannot be zero here because C.x !== D.x
    const L = mod(numerator * modInverse(denominator, P), P);

    // Calculate new point coordinates Xs, Ys
    const Xs = mod(L * L - C.x - D.x, P);
    const Ys = mod(L * (C.x - Xs) - C.y, P);

    return new Point(Xs, Ys);
}

/**
 * Performs scalar multiplication k*G using the double-and-add algorithm.
 * @param k The scalar (private key).
 * @param G The base point.
 * @returns The resulting point k*G.
 */
function scalarMultiply(k: bigint, G: Point): Point {
    let result = O; // Initialize result as the point at infinity
    let current = G; // Start with the base point G

    // Iterate through the bits of k
    while (k > 0n) {
        if (k % 2n === 1n) { // If the current bit is 1 (k is odd)
            result = pointAdd(result, current); // Add current to the result
        }
        current = pointDouble(current); // Double current for the next bit
        k /= 2n; // Move to the next bit (equivalent to right shift k by 1)
    }
    return result;
}

// --- Main Program Logic ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    // Parse input
    const N = parseInt(inputLines[0]);
    const keysK: bigint[] = [];
    for (let i = 1; i <= N; i++) {
        keysK.push(BigInt(inputLines[i])); // Convert hexadecimal string to BigInt
    }

    // Process each key and print the X-coordinate
    for (const k of keysK) {
        const kG = scalarMultiply(k, G);
        // Output format: hexadecimal with 0x prefix
        console.log(`0x${kG.x.toString(16)}`);
    }
});