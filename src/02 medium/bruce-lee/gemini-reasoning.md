The puzzle "Bruce Lee" requires decoding a message that was encoded using the Chuck Norris encoding scheme. This scheme converts a message into a binary string (7 bits per ASCII character), and then represents consecutive identical bits as pairs of unary sequences.

Here's a breakdown of the decoding process and the validation steps:

1.  **Understand the Encoding Scheme (in reverse):**
    *   **Unary Pair Structure:** The encoded message consists of space-separated sequences. These sequences always come in pairs: `(code_sequence, count_sequence)`.
    *   **`code_sequence`:**
        *   `0` represents the binary bit `1`.
        *   `00` represents the binary bit `0`.
    *   **`count_sequence`:** A sequence of `k` zeroes, where `k` is the number of times the bit (determined by `code_sequence`) repeats.
    *   **Example (Decoding 'A' from `0 0 00 00000 0 0`):**
        *   `0 0`: `0` means binary `1`, `0` means 1 repetition. Result: `1`
        *   `00 00000`: `00` means binary `0`, `00000` means 5 repetitions. Result: `00000`
        *   `0 0`: `0` means binary `1`, `0` means 1 repetition. Result: `1`
        *   Concatenated binary: `1000001`
        *   `1000001` (binary 65) converts to 'A' (ASCII).

2.  **Decoding Steps:**

    *   **Input Reading and Initial Validation:**
        *   Read the entire encoded message as a string.
        *   Check if the input string is empty or contains only whitespace. If so, it's `INVALID`.
        *   Split the input string by spaces into an array of "tokens" (individual zero sequences).

    *   **Token Count Validation:**
        *   The number of tokens must be even, as they are processed in pairs. If odd, it's `INVALID`.
        *   If splitting results in an empty array (e.g., input was just spaces or an empty string after trimming), this is also an invalid state.

    *   **Pair-wise Decoding:**
        *   Iterate through the `tokens` array, taking two tokens at a time: `firstSequence` and `secondSequence`.
        *   **Validate `firstSequence` (code sequence):** It must be either `0` or `00`. Any other value (e.g., `000`, `1`, an empty string from multiple spaces) makes the input `INVALID`.
        *   **Determine the Binary Bit:** Based on `firstSequence`, set the current bit (`1` for `0`, `0` for `00`).
        *   **Validate `secondSequence` (count sequence):** It must consist *only* of '0' characters and have a positive length. An empty string or a string containing non-zero characters makes the input `INVALID`.
        *   **Determine the Repetition Count:** The length of `secondSequence` is the count `k`.
        *   **Append to Binary String:** Append the determined binary bit, repeated `k` times, to a growing `binaryString`.

    *   **Final Binary String Validation:**
        *   After processing all pairs, check the `binaryString`'s length. Since each decoded character is 7 bits, the `binaryString`'s length must be a multiple of 7. If not, or if the string is empty, it's `INVALID`.

    *   **Convert Binary to ASCII:**
        *   Split the `binaryString` into 7-bit chunks.
        *   For each 7-bit chunk, convert it from binary to an integer using `parseInt(chunk, 2)`.
        *   Convert the resulting integer ASCII code back to a character using `String.fromCharCode()`.
        *   Concatenate these characters to form the `decodedMessage`.

    *   **Output:** Print the `decodedMessage` or `INVALID` if any validation failed.

**Example Trace (`0 0 00 00000 0 0`):**

1.  **Input:** `0 0 00 00000 0 0`
2.  **Tokens:** `["0", "0", "00", "00000", "0", "0"]`
3.  **Length Check:** 6 (even), OK.
4.  **Loop 1 (i=0):**
    *   `firstSequence = "0"`, `bit = "1"`
    *   `secondSequence = "0"`, `count = 1`
    *   `binaryString` becomes `"1"`
5.  **Loop 2 (i=2):**
    *   `firstSequence = "00"`, `bit = "0"`
    *   `secondSequence = "00000"`, `count = 5`
    *   `binaryString` becomes `"100000"`
6.  **Loop 3 (i=4):**
    *   `firstSequence = "0"`, `bit = "1"`
    *   `secondSequence = "0"`, `count = 1`
    *   `binaryString` becomes `"1000001"`
7.  **Final Binary Check:** Length is 7 (multiple of 7), OK.
8.  **Convert to ASCII:**
    *   Chunk: `"1000001"`
    *   `parseInt("1000001", 2)` = 65
    *   `String.fromCharCode(65)` = `'A'`
9.  **Output:** `A`