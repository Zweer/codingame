The problem describes a simplified Enigma-like encryption machine with a specific set of operations: a Caesar shift followed by three rotor substitutions. Decryption requires reversing these steps.

### Encryption Process Breakdown:

1.  **Caesar Shift (Incrementing):**
    *   Each character in the message is shifted by an amount that increases for each successive character.
    *   For the character at index `i` (0-indexed) in the original message, the shift amount is `N + i`.
    *   The shift is applied modulo 26 to keep the result within the A-Z alphabet.
    *   Example: `AAA`, `N=4`
        *   `A` (index 0): `A + (4 + 0) = E`
        *   `A` (index 1): `A + (4 + 1) = F`
        *   `A` (index 2): `A + (4 + 2) = G`
        *   Result: `EFG`

2.  **Rotor Substitution (Rotor I, then II, then III):**
    *   Each rotor is a simple substitution cipher. The rotor string defines the mapping: `ABCDEFGHIJKLMNOPQRSTUVWXYZ` maps to the rotor string.
    *   To encrypt a character `C`, find its 0-indexed position `P` in the standard alphabet (e.g., `A` is 0, `B` is 1). The encrypted character is the character at position `P` in the rotor string.
    *   Example: `EFG` through Rotor I (`BDFHJLCPRTXVZNYEIWGAKMUSQO`)
        *   `E` (index 4) maps to `ROTOR_I[4]`, which is `J`.
        *   `F` (index 5) maps to `ROTOR_I[5]`, which is `L`.
        *   `G` (index 6) maps to `ROTOR_I[6]`, which is `C`.
        *   Result: `JLC`
    *   This result (`JLC`) is then passed through Rotor II, and that result through Rotor III.

### Decryption Process Breakdown:

Decryption reverses the encryption steps. This means applying the inverse operations in the reverse order.

1.  **Inverse Rotor Substitution (Rotor III, then II, then I):**
    *   To decrypt a character `C` using a rotor, we need to find which character `X` in the standard alphabet maps to `C` via this rotor.
    *   This means finding the position `P` such that `ROTOR_STRING[P] = C`. The decrypted character is the character at position `P` in the standard alphabet. In other words, the decrypted character's index is `rotorString.indexOf(C)`.
    *   Example: `KQF` through Inverse Rotor III (`EKMFLGDQVZNTOWYHXUSPAIBRCJ`)
        *   `K`: `ROTOR_III.indexOf('K')` is `1`. The character at index 1 in the alphabet is `B`. So `K` decrypts to `B`.
        *   `Q`: `ROTOR_III.indexOf('Q')` is `7`. The character at index 7 is `H`. So `Q` decrypts to `H`.
        *   `F`: `ROTOR_III.indexOf('F')` is `3`. The character at index 3 is `D`. So `F` decrypts to `D`.
        *   Result: `BHD`
    *   This result (`BHD`) is then passed through Inverse Rotor II, and that result through Inverse Rotor I.

2.  **Inverse Caesar Shift (Decrementing):**
    *   The encrypted character at index `i` was shifted by `N + i`. To decrypt it, we must subtract this same shift amount.
    *   Again, use modulo 26, ensuring that negative results wrap around correctly (e.g., `-1 % 26` should be `25`).
    *   Example: `EFG`, `N=4`
        *   `E` (index 0): `E - (4 + 0) = A`
        *   `F` (index 1): `F - (4 + 1) = A`
        *   `G` (index 2): `G - (4 + 2) = A`
        *   Result: `AAA`

### Implementation Details:

*   **Character to Index Conversion:** Convert characters `A-Z` to 0-25 indices using their ASCII values (e.g., `char.charCodeAt(0) - 'A'.charCodeAt(0)`). Convert back using `String.fromCharCode('A'.charCodeAt(0) + index)`.
*   **Modulo Function:** A custom `mod` function is needed to handle negative numbers correctly in JavaScript's `%` operator: `((n % m) + m) % m`.
*   **Rotor Function:** A single `applyRotor` function can be used for both encryption and decryption by passing a boolean flag (`isEncrypt`) to switch between the forward mapping (indexing into the rotor string) and inverse mapping (finding the index of the character within the rotor string).

### TypeScript Code: