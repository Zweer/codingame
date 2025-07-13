The problem asks us to decrypt a message encoded with a shift cipher (Caesar cipher) without knowing the key. We are provided with the standard English letter frequencies and must use frequency analysis to determine the shift. The decryption process must preserve the case of alphabetical characters and leave non-alphabetical characters unchanged.

Here's a breakdown of the approach:

1.  **Define English Frequencies**: Store the provided standard English letter frequencies in an array, where each index corresponds to a letter of the alphabet (e.g., index 0 for 'A', 1 for 'B', etc.).

2.  **Calculate Observed Frequencies**:
    *   Iterate through the input `Message`.
    *   For each character, if it's an alphabetical character (A-Z or a-z), increment a counter for its corresponding uppercase letter index. For example, both 'a' and 'A' contribute to the count for index 0.
    *   Keep track of the total number of alphabetical characters.
    *   After counting, convert these raw counts into percentages (or normalized frequencies) by dividing each count by the `totalAlphabeticalChars`. This creates an "observed frequency distribution" for the encrypted message.

3.  **Determine the Shift**:
    *   The core of frequency analysis is to find the shift that, when applied to the *encrypted* message's frequency distribution, makes it most closely match the *standard English* frequency distribution.
    *   We will iterate through all 26 possible shifts (0 to 25).
    *   For each `potentialShift`:
        *   Simulate what the plaintext's frequency distribution *would look like* if this `potentialShift` were the correct decryption shift. This involves "unshifting" each observed frequency: the observed frequency of character `C` (at index `i`) in the ciphertext would correspond to the frequency of character `P` (at index `(i - potentialShift + 26) % 26`) in the original plaintext.
        *   Calculate a "score" for this `potentialShift`. A common method is to use the sum of squared differences between the "simulated plaintext frequencies" and the `ENGLISH_FREQUENCIES`. A lower score indicates a better match.
    *   The `potentialShift` that yields the minimum sum of squared differences is the most probable decryption key.

4.  **Decrypt the Message**:
    *   Once the `bestShift` (the decryption key) is found, iterate through the original `Message` again.
    *   For each character:
        *   If it's an uppercase letter: apply the `bestShift` to its character code (`(charCode - 'A' - bestShift + 26) % 26 + 'A'`).
        *   If it's a lowercase letter: apply the `bestShift` similarly, preserving the lowercase case (`(charCode - 'a' - bestShift + 26) % 26 + 'a'`).
        *   If it's a non-alphabetical character (number, symbol, space): append it directly to the decoded message without modification.
    *   Concatenate all processed characters to form the final decoded message.

**Example Walkthrough (Conceptual for Shift Determination):**

Let's say the correct encoding shift is `+3`. So 'H' (index 7) becomes 'K' (index 10).
The encrypted message will have its frequency peaks shifted forward by 3 positions relative to English.
When we test `potentialShift = 3`:
- The frequency observed for 'K' in the ciphertext (index 10) will be "unshifted" back 3 positions to index 7 ('H').
- The frequency observed for 'H' in the ciphertext (index 7) will be "unshifted" back 3 positions to index 4 ('E').
If 'H' was a common letter in the *original* plaintext, its frequency will now align with 'E' in the `candidatePlainTextFrequencies` array. This `candidatePlainTextFrequencies` array will then closely resemble the `ENGLISH_FREQUENCIES` array, resulting in a low sum of squared differences score.