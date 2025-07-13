The puzzle asks us to implement a slightly modified SHA-256 hash function. The only difference from the standard SHA-256 algorithm is the initial hash values (H0-H7). The round constants (K) remain the same as in the standard specification. We are given an input string, which needs to be converted to ASCII bytes, padded, and then processed through the SHA-256 compression function.

Here's a breakdown of the implementation steps:

1.  **Constants:**
    *   **Initial Hash Values (H):** These are provided in the puzzle description and are unique to this problem. They are 32-bit hexadecimal numbers.
    *   **Round Constants (K):** These are the standard SHA-256 round constants, derived from the cube roots of the first 64 prime numbers.

2.  **Helper Functions (Bitwise Operations):**
    *   SHA-256 relies heavily on bitwise operations: `ROTR` (Right Rotate), `SHR` (Right Shift), `Ch` (Choice), `Maj` (Majority), `Σ0` (Sigma0), `Σ1` (Sigma1), `σ0` (lowercase sigma0), and `σ1` (lowercase sigma1).
    *   In TypeScript/JavaScript, numbers are typically 64-bit floating-point. For bitwise operations, they are implicitly converted to 32-bit signed integers, then back to 64-bit floats. To ensure correct unsigned 32-bit arithmetic as required by SHA-256, we use the `>>> 0` operator after every bitwise operation or addition that produces an intermediate or final 32-bit word.

3.  **Preprocessing:**
    *   **Convert to Bytes:** The input string `S` is converted to a sequence of ASCII bytes. Since the constraints specify printable ASCII characters (32-126), `charCodeAt()` directly gives the correct byte value.
    *   **Padding:** This is a crucial step to ensure the message length is a multiple of 512 bits.
        *   Append a single '1' bit (represented by the byte `0x80`).
        *   Append '0' bits until the message length (in bits), excluding the final 64-bit length field, is congruent to 448 (mod 512). This means the total padded message length, including the 64-bit length field, will be a multiple of 512 bits.
        *   Append the original message length (in bits) as a 64-bit big-endian integer. For typical CodinGame inputs, the original length will fit within 32 bits, so the most significant 32 bits of the 64-bit length field will be zero. The code explicitly writes out all 8 bytes of the 64-bit length, ensuring correctness even for larger hypothetical inputs.

4.  **Parsing into Blocks:**
    *   The padded message (a sequence of bytes) is divided into 512-bit (64-byte) chunks.
    *   Each 512-bit chunk is then parsed into 16 32-bit big-endian words (M[0] to M[15]).

5.  **Compression Function (Main Loop):**
    *   The core of SHA-256. It iterates through each 512-bit block.
    *   **Initialize Working Variables:** For each block, eight working variables (a, b, c, d, e, f, g, h) are initialized with the current hash values (H0-H7).
    *   **Message Schedule (W):** A 64-entry array `W` is created. The first 16 entries are the 16 words from the current block. The remaining 48 entries (W[16] to W[63]) are computed using a specific recurrence relation involving `σ0` and `σ1` functions and previous `W` values. All additions are modulo 2^32.
    *   **64 Rounds:** The main computation loop runs 64 times. In each round `i`:
        *   Two temporary values `T1` and `T2` are calculated using `Ch`, `Maj`, `Σ0`, `Σ1`, the current working variables, the round constant `K[i]`, and the message schedule word `W[i]`.
        *   The working variables are updated based on `T1` and `T2` in a specific permutation. All additions are modulo 2^32.
    *   **Update Hash Values:** After 64 rounds, the final values of the working variables (a-h) are added to the initial hash values (H0-H7) for the current block. These updated H values become the input for the next block. Again, all additions are modulo 2^32.

6.  **Final Hash Value:**
    *   After processing all blocks, the final values of H0-H7 are concatenated.
    *   Each 32-bit H value is converted to an 8-character lowercase hexadecimal string, padded with leading zeros if necessary (`padStart(8, '0')`).
    *   These 8 hexadecimal strings are joined together to form the final 64-character hash.

The provided example `Ravenclaw` and its expected output `70ac5b0feb57d7b1823a905a398863318594dd996d5c40ecced5089935e7a922` were used to verify the implementation's correctness.