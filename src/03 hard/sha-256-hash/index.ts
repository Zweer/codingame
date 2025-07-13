/**
 * Implements a slightly modified SHA-256 hash function.
 * The only modification is the initial hash values (H0-H7).
 * All other aspects of the algorithm, including round constants (K) and bitwise operations,
 * follow the standard SHA-256 specification.
 */
class SHA256 {
    // Modified initial hash values (H0-H7) as per puzzle description.
    // These are the first 32 bits of the fractional parts of the square roots
    // of the next 8 primes (23, 29, 31, 37, 41, 43, 47, 53).
    private static readonly H: number[] = [
        0xcbbb9d5d, 0x629a292a, 0x9159015a, 0x152fecd8,
        0x67332667, 0x8eb44a87, 0xdb0c2e0d, 0x47b5481d
    ];

    // Standard SHA-256 round constants (K0-K63).
    // These are the first 32 bits of the fractional parts of the cube roots
    // of the first 64 prime numbers.
    private static readonly K: number[] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // Helper functions for bitwise operations.
    // All results are cast to unsigned 32-bit integers using `>>> 0`.
    private static ROTR(x: number, n: number): number {
        return ((x >>> n) | (x << (32 - n))) >>> 0;
    }

    private static SHR(x: number, n: number): number {
        return x >>> n;
    }

    private static Ch(x: number, y: number, z: number): number {
        return ((x & y) ^ (~x & z)) >>> 0;
    }

    private static Maj(x: number, y: number, z: number): number {
        return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
    }

    private static Sigma0(x: number): number {
        return (SHA256.ROTR(x, 2) ^ SHA256.ROTR(x, 13) ^ SHA256.ROTR(x, 22)) >>> 0;
    }

    private static Sigma1(x: number): number {
        return (SHA256.ROTR(x, 6) ^ SHA256.ROTR(x, 11) ^ SHA256.ROTR(x, 25)) >>> 0;
    }

    private static sigma0(x: number): number {
        return (SHA256.ROTR(x, 7) ^ SHA256.ROTR(x, 18) ^ SHA256.SHR(x, 3)) >>> 0;
    }

    private static sigma1(x: number): number {
        return (SHA256.ROTR(x, 17) ^ SHA256.ROTR(x, 19) ^ SHA256.SHR(x, 10)) >>> 0;
    }

    /**
     * Computes the SHA-256 hash of a given string using the modified initial hash values.
     * @param message The input string to hash.
     * @returns The 64-character lowercase hexadecimal hash string.
     */
    public static hash(message: string): string {
        // 1. Preprocessing
        // Convert string to bytes (ASCII encoding)
        const bytes: number[] = [];
        for (let i = 0; i < message.length; i++) {
            bytes.push(message.charCodeAt(i));
        }

        const originalBitLength = bytes.length * 8;

        // Append '1' bit (0x80)
        bytes.push(0x80);

        // Append '0' bits until the message length (excluding the 64-bit length field)
        // is 448 mod 512.
        let numZeroBits = (448 - (bytes.length * 8) % 512 + 512) % 512;
        for (let i = 0; i < numZeroBits / 8; i++) {
            bytes.push(0x00);
        }

        // Append original message length (64-bit big-endian)
        // Since originalBitLength will typically be much less than 2^32 for CodinGame constraints,
        // the higher 4 bytes will be zero. However, we write it out as 64-bit as per spec.
        bytes.push((originalBitLength >>> 56) & 0xFF);
        bytes.push((originalBitLength >>> 48) & 0xFF);
        bytes.push((originalBitLength >>> 40) & 0xFF);
        bytes.push((originalBitLength >>> 32) & 0xFF);
        bytes.push((originalBitLength >>> 24) & 0xFF);
        bytes.push((originalBitLength >>> 16) & 0xFF);
        bytes.push((originalBitLength >>> 8) & 0xFF);
        bytes.push(originalBitLength & 0xFF);

        // 2. Parse padded message into 512-bit blocks (16 32-bit words)
        const blocks: number[][] = [];
        for (let i = 0; i < bytes.length; i += 64) {
            const block: number[] = [];
            for (let j = 0; j < 64; j += 4) {
                // Combine 4 bytes into a 32-bit word (big-endian)
                const word = (bytes[i + j] << 24) |
                             (bytes[i + j + 1] << 16) |
                             (bytes[i + j + 2] << 8) |
                             bytes[i + j + 3];
                block.push(word >>> 0); // Ensure unsigned 32-bit
            }
            blocks.push(block);
        }

        // Initialize hash values with the specified initial H values.
        // Make a copy as these values are updated per block.
        let h0 = SHA256.H[0];
        let h1 = SHA256.H[1];
        let h2 = SHA256.H[2];
        let h3 = SHA256.H[3];
        let h4 = SHA256.H[4];
        let h5 = SHA256.H[5];
        let h6 = SHA256.H[6];
        let h7 = SHA256.H[7];

        // 3. Compression Function (Main Loop)
        for (const block of blocks) {
            const W: number[] = new Array(64);

            // Initialize first 16 words of message schedule (W[0]...W[15])
            for (let i = 0; i < 16; i++) {
                W[i] = block[i];
            }

            // Extend the message schedule (W[16]...W[63])
            // W[i] = σ1(W[i-2]) + W[i-7] + σ0(W[i-15]) + W[i-16]
            for (let i = 16; i < 64; i++) {
                W[i] = (SHA256.sigma1(W[i - 2]) + W[i - 7] + SHA256.sigma0(W[i - 15]) + W[i - 16]) >>> 0;
            }

            // Initialize working variables (a-h) for this block
            let a = h0;
            let b = h1;
            let c = h2;
            let d = h3;
            let e = h4;
            let f = h5;
            let g = h6;
            let h = h7;

            // 64 rounds of compression
            for (let i = 0; i < 64; i++) {
                const T1 = (h + SHA256.Sigma1(e) + SHA256.Ch(e, f, g) + SHA256.K[i] + W[i]) >>> 0;
                const T2 = (SHA256.Sigma0(a) + SHA256.Maj(a, b, c)) >>> 0;

                h = g;
                g = f;
                f = e;
                e = (d + T1) >>> 0; // Addition modulo 2^32
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) >>> 0; // Addition modulo 2^32
            }

            // Add the compressed values to the current hash values
            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
            h5 = (h5 + f) >>> 0;
            h6 = (h6 + g) >>> 0;
            h7 = (h7 + h) >>> 0;
        }

        // 4. Final Hash Value
        const finalHashValues = [h0, h1, h2, h3, h4, h5, h6, h7];

        // Convert the 8 32-bit hash values to a 64-character lowercase hexadecimal string
        return finalHashValues.map(val => val.toString(16).padStart(8, '0')).join('');
    }
}

// Read input from CodinGame standard input
declare function readline(): string;
const S: string = readline();

// Compute and print the hash
console.log(SHA256.hash(S));