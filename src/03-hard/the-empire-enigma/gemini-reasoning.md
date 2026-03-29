The problem asks us to decode a message from a sequence of integers. We are given the `Offset` (which turns out to be not directly useful for decoding) and `Length` of the message, followed by `Length` encoded integers.

The encoding process is described as follows:
1.  The original message uses ASCII characters.
2.  The first character of every original message is always `'@'` (ASCII 64).
3.  A Random Number Generator (RNG) is used: `R(n+1) = (7562100 * R(n) + 907598307) mod 7140`. `R(0)` is a `Seed`.
4.  The first `Offset` numbers from the RNG are discarded.
5.  Each *undiscarded* random number `R_val` is XOR'ed with the ASCII code `C_val` of the character. The result `(R_val ^ C_val)` is then truncated to its lowest 8 bits `(& 0xFF)` to become part of the encoded message. So, `Encoded_val = (R_val ^ C_val) & 0xFF`.
6.  `Seed` and `Offset` can be very large (up to 2^63), making brute-forcing them impossible with standard `number` types.

**The Key Insight**

The crucial piece of information is that the first character of every original message is always `'@'`. This means we know `C_val` for the first character (ASCII 64) and we know its corresponding `Encoded_val` (the first integer in the input).

Let `R_effective_0` be the first *undiscarded* random number from the RNG, which was used to encode `'@'`.
We have `encodedChars[0] = (R_effective_0 ^ ASCII_AT) & 0xFF`.

We need to find `R_effective_0`. Since `R_effective_0` is part of an RNG sequence modulo `7140`, `0 <= R_effective_0 < 7140`. We can iterate through all possible values for `R_effective_0` within this range (0 to 7139) and check which ones satisfy the equation above.
For each `r` in `0..7139`: if `((r ^ 64) & 0xFF) === encodedChars[0]`, then `r` is a candidate for `R_effective_0`. There will likely be multiple such candidates (typically 28, as `7140 / 256` is about 27.8).

**Decoding Strategy**

Since there can be multiple candidates for `R_effective_0`, we must test each one:

1.  **Find Candidates for `R_effective_0`**: Iterate `r` from 0 to 7139. If `((r ^ 64) & 0xFF)` equals `encodedChars[0]`, add `r` to a list of `candidateR0s`.
2.  **Test Each Candidate**:
    *   For each `candidateR0` in `candidateR0s`:
        *   Initialize `currentRNGValue = candidateR0`.
        *   Initialize an empty string `tempDecodedMessage`.
        *   The first character (`@`) has already been "decoded" implicitly to find `candidateR0`. We start decoding from the second character (index 1 of `encodedChars`).
        *   Loop through the `encodedChars` from index `1` to `Length - 1`:
            *   Calculate the `nextRNGValue` using the given formula: `nextRNGValue = (7562100 * currentRNGValue + 907598307) % 7140`.
            *   The original ASCII character `C_val` can be recovered using the property of XOR: `C_val = (Encoded_val ^ R_val) & 0xFF`. So, `originalCharCode = (encodedChars[i] ^ nextRNGValue) & 0xFF`.
            *   **Validation**: The problem states that original ASCII codes are between 32 and 126. If `originalCharCode` is outside this range, this `candidateR0` is incorrect. Mark it as invalid and break the inner loop.
            *   If valid, append `String.fromCharCode(originalCharCode)` to `tempDecodedMessage`.
            *   Update `currentRNGValue = nextRNGValue` for the next iteration.
        *   If the inner loop completes without finding an invalid character, then this `candidateR0` is the correct one. Store `tempDecodedMessage` as the final `decodedMessage` and break out of the outer loop.
3.  **Output**: Print the `decodedMessage`.

The maximum value of `Length` is 255. The number of candidates for `R_effective_0` is small (at most 28). This means the total number of operations will be approximately `28 * 255`, which is small enough for the given time limits. JavaScript `number` type (double-precision floating-point) is sufficient for all arithmetic operations as intermediate results of the RNG calculations fit within `2^53 - 1`.