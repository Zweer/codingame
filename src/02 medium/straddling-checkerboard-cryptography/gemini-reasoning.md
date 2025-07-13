The puzzle requires implementing a Straddling Checkerboard cipher, which involves building a custom alphabet-to-digit mapping (checkerboard), then performing a two-step encryption/decryption process: first, converting the message to digits using the checkerboard, then applying a key number using addition/subtraction modulo 10, and finally converting the resulting digits back to characters using the checkerboard.

Let's break down the solution into its main components:

### 1. Checkerboard Construction (`Checkerboard` class)

The checkerboard maps characters to numeric codes and vice-versa. It has three rows based on the problem description:
-   **Row 0 (tens digit 0):** Filled by the `passphrase`. Characters are mapped to their column index. Spaces in the passphrase indicate the tens digits for the subsequent two rows. The actual tens digits for the second and third rows are derived from the `header` string at the column indices where spaces appear in the `passphrase`. For instance, if `passphrase` has a space at index 2 and `header[2]` is '2', then '2' becomes a tens digit for a subsequent row.
-   **Rows 2 and 3 (e.g., tens digits 2 and 6):** Filled with the remaining alphabet characters, plus '/' and '.', after removing characters used in the passphrase. The `posslash` and `posdot` parameters determine where '/' and '.' are inserted into this list of remaining characters. These characters are then filled sequentially into the cells corresponding to the two "empty" column indices from Row 0. For example, if row 2's tens digit is 2, characters fill codes 20, 21, ..., 29.

**Implementation Details:**
-   We maintain `charToCode` (Map<string, number>) and `codeToChar` (Map<number, string>) for efficient lookups.
-   The `rowTensCandidateColumns` array stores the `header` digits corresponding to the space positions in the `passphrase`. These will become `row2Tens` and `row3Tens` after sorting.
-   The remaining alphabet is filtered.
-   The '/' and '.' characters are `splice`d into the `remainingAlphabet` array. Care is taken to adjust the insertion index for the second character if the first one was inserted before it in the list.
-   Finally, characters from `remainingAlphabet` are assigned to two-digit codes for `row2Tens` and `row3Tens` (e.g., `20`, `21`...).

### 2. Encryption Process (`encrypt` function)

1.  **Message Preparation:**
    -   The input `message` is converted to uppercase.
    -   Unsupported characters (anything not A-Z, 0-9, or '.') are removed.
    -   Digits in the message are special: they are prefixed by the character `/` when converting to raw digit codes. This means if the message has "1", it is treated as `/` followed by `1`. The `/` character itself has a two-digit code on the checkerboard (e.g., 62).

2.  **Convert to Raw Digit Codes:**
    -   Each character in the prepared message is looked up in the `charToCode` map.
    -   If it's a letter or '.', its corresponding single or two-digit code is appended.
    -   If it's a digit (0-9), the code for `/` (e.g., 62) is appended, followed by the digit itself. This creates a sequence like `621` for the digit `1`.

3.  **Apply Key Number (Addition Modulo 10):**
    -   The `key` number is repeated as many times as necessary to match the length of the raw encrypted digits string.
    -   Each digit from the raw encrypted string is added to the corresponding digit from the padded key, modulo 10.

4.  **Convert Modified Digits Back to Characters (Final Output):**
    -   The modified digit string is iterated through.
    -   If a digit corresponds to a single-digit row 0 code, it's directly mapped back to a character.
    -   If a digit matches `row2Tens` or `row3Tens`, it signifies a two-digit code. The current digit is combined with the next digit to form a two-digit code (e.g., `2` and `9` form `29`), which is then mapped back to a character. The next digit is consumed (`i++`).
    -   The problem states the final output should be "letters, slash or period, no digits". This step ensures that.

### 3. Decryption Process (`decrypt` function)

1.  **Apply Key Number (Subtraction Modulo 10):**
    -   The `key` is padded to match the length of the input `message` (which is a digit string).
    -   Each digit from the input `message` has the corresponding key digit subtracted, modulo 10. `(d1 - d2 + 10) % 10` is used to handle negative results of subtraction modulo 10. This recovers the `rawEncryptedDigits`.

2.  **Convert Raw Digit Codes Back to Characters and Reconstruct Original Message:**
    -   The recovered `originalEncryptedDigits` string is iterated through.
    -   Similar to encryption's final step, single or two-digit codes are mapped back to characters using the checkerboard.
    -   **Crucially:** If the character mapped back is `/`, it indicates that the next digit in `originalEncryptedDigits` is an actual numerical digit from the original message. This digit is appended directly to the `decryptedMessage`, and the digit is consumed (`i++`). This restores original digits (e.g., `621` decrypts to `/1`, then becomes `1`).
    -   For all other characters (letters, periods), they are appended directly.

This process ensures that the encryption and decryption are symmetric and adhere to all the rules outlined in the problem description.