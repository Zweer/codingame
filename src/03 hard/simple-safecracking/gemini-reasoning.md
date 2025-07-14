The puzzle asks us to find a safe combination by decrypting a given message.

**Reasoning:**

1.  **Analyze the Example:**
    *   Input: `Aol zhml jvtipuhapvu pz: zpe-mvby-zpe-mvby-aoyll`
    *   Output: `64643`

2.  **Identify the Encryption Method (Cipher):**
    The input looks like gibberish, which is characteristic of a Caesar cipher. Let's try to decrypt the first part of the message: `Aol zhml jvtipuhapvu pz:`.
    If we assume `Aol` decrypts to `The` (a common start to a sentence), we can find the shift:
    *   'A' (ASCII 65) -> 'T' (ASCII 84). Shift = 84 - 65 = 19.
    *   'o' (ASCII 111) -> 'h' (ASCII 104). Shift = 104 - 111 = -7.
    *   'l' (ASCII 108) -> 'e' (ASCII 101). Shift = 101 - 108 = -7.
    The differing shifts (19 for uppercase, -7 for lowercase) suggest a consistent shift of **-7** (or +19, which is equivalent for modulo 26 arithmetic) across the alphabet, just applied relative to 'A' or 'a'.
    Let's test the -7 shift on a larger segment, e.g., `jvtipuhapvu`:
    *   j (10) -> c (3)
    *   v (22) -> o (15)
    *   t (20) -> m (13)
    *   p (16) -> i (9)
    *   u (21) -> n (14)
    *   h (8) -> a (1)
    *   a (1) -> t (20) (1 - 7 = -6; -6 mod 26 = 20)
    *   p (16) -> i (9)
    *   v (22) -> o (15)
    *   u (21) -> n (14)
    So, `jvtipuhapvu` decrypts to `combination`. This confirms the **Caesar cipher with a shift of -7**.

3.  **Extract and Decrypt the Combination Part:**
    The decrypted message fragment `The safe combination is:` confirms that the combination is the part after the colon: `zpe-mvby-zpe-mvby-aoyll`.
    We need to apply the same -7 shift to each word:
    *   `zpe`
        *   z (26) -> s (19)
        *   p (16) -> i (9)
        *   e (5) -> x (24) (5 - 7 = -2; -2 mod 26 = 24)
        Decrypted: `six`
    *   `mvby`
        *   m (13) -> f (6)
        *   v (22) -> o (15)
        *   b (2) -> u (21) (2 - 7 = -5; -5 mod 26 = 21)
        *   y (25) -> r (18)
        Decrypted: `four`
    *   `aoyll`
        *   a (1) -> t (20) (1 - 7 = -6; -6 mod 26 = 20)
        *   o (15) -> h (8)
        *   y (25) -> r (18)
        *   l (12) -> e (5)
        *   l (12) -> e (5)
        Decrypted: `three`

4.  **Map Decrypted Words to Digits:**
    *   `six` -> `6`
    *   `four` -> `4`
    *   `three` -> `3`

5.  **Construct the Final Combination:**
    The sequence `six-four-six-four-three` translates to `64643`. This matches the example output.

**Algorithm:**

1.  Read the input encrypted message.
2.  Define a helper function `decryptChar` that takes a character and a shift value, and returns the decrypted character. It handles uppercase and lowercase letters separately, wrapping around the alphabet. Non-alphabetic characters remain unchanged.
3.  Split the input message at `": "` to isolate the encrypted combination string (e.g., `zpe-mvby-zpe-mvby-aoyll`).
4.  Split the combination string by hyphens (`-`) to get individual encrypted words (e.g., `["zpe", "mvby", ...]`).
5.  Create a mapping (e.g., a dictionary/object) from spelled-out number words (`"zero"`, `"one"`, etc.) to their digit characters (`"0"`, `"1"`, etc.).
6.  Initialize an empty string for the final combination.
7.  For each encrypted word:
    *   Decrypt the word character by character using the `decryptChar` function with a shift of -7.
    *   Look up the decrypted word in the number-word-to-digit mapping.
    *   Append the corresponding digit to the final combination string.
8.  Print the final combination string.

**Code:**