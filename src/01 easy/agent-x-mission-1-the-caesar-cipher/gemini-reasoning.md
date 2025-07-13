The problem asks us to decrypt a Caesar cipher message where the shift operates on ASCII characters from `32` to `126` (inclusive), wrapping around. We are given the `ciphertext` and a `word` that is guaranteed to be present in the decrypted message. Our goal is to find the decryption `key` and the full `plaintext`.

**Understanding the Caesar Cipher:**

1.  **Character Range:** The cipher operates on ASCII characters from `32` (space) to `126` (tilde `~`).
    *   The total number of characters in this range is `126 - 32 + 1 = 95`. Let's call this `RANGE_SIZE`.
    *   `MIN_ASCII = 32`, `MAX_ASCII = 126`.
2.  **Encryption:** The problem states that `key` is the number of positions "down" the ASCII code range. However, the examples (`a` becomes `d` with `key=3`) show that a positive key *increases* the ASCII value during encryption.
    *   `encrypted_char_code = (original_char_code - MIN_ASCII + key) % RANGE_SIZE + MIN_ASCII`
3.  **Decryption:** To decrypt, we need to reverse this process, which means subtracting the key.
    *   `decrypted_char_code = (cipher_char_code - MIN_ASCII - key + RANGE_SIZE) % RANGE_SIZE + MIN_ASCII`
    *   The `+ RANGE_SIZE` before the final modulo is crucial to ensure that the result of `(normalizedCharCode - key)` is non-negative before applying the modulo operator, which correctly handles wrap-around for negative results.
4.  **Key Range:** Since the shift wraps around after `RANGE_SIZE` characters, a key of `X` is equivalent to a key of `X + RANGE_SIZE`, `X + 2*RANGE_SIZE`, etc. Therefore, we only need to test keys from `0` to `RANGE_SIZE - 1`.

**Finding the Key and Decrypting:**

Since we don't know the key, but we have a known word in the plaintext, we can use a brute-force approach:
1.  Iterate through every possible decryption `key` from `0` to `RANGE_SIZE - 1` (i.e., `0` to `94`).
2.  For each `key`, decrypt the entire `ciphertext`.
3.  Check if the `knownWord` appears in the decrypted message.

**Word Matching Logic:**

*   The problem specifies delimiters: `SP` (space), `,`, `.`, `?`, `;`, `:`, `!`.
*   The example `test` (input word) leads to `Test, test, hello!` (output plaintext), implying case-insensitive matching for the known word, but the output plaintext retains its original casing.
*   To accurately check for the `knownWord` as a full word:
    1.  Convert the `knownWord` to lowercase.
    2.  In the decrypted message, replace all occurrences of the specified delimiters with a single space.
    3.  Convert the modified decrypted message to lowercase.
    4.  Split the string into an array of words using space as the delimiter.
    5.  Check if the lowercase `knownWord` exists in this array of words.

Once the correct key is found, we print the key and the corresponding decrypted plaintext message and terminate.

**TypeScript Implementation Details:**

*   `charCodeAt(0)`: Gets the ASCII value of a character.
*   `String.fromCharCode()`: Converts an ASCII value back to a character.
*   Regular expressions: `/[ ,.?;:!]+/g` will match one or more of the specified delimiter characters globally. This is used with `replace()` to normalize word separation.