## Reasoning

The problem requires converting an ASCII message into a specific "unary" encoding. Let's break down the process and how it's implemented in the TypeScript solution.

1.  **ASCII to 7-bit Binary Conversion:**
    *   Each character in the input message is an ASCII character, which is 7-bit.
    *   We need to convert each character's ASCII code into its 7-bit binary representation.
    *   For example, 'C' has an ASCII code of 67. `67.toString(2)` gives "1000011". If a character like 'A' (65) was input, `65.toString(2)` would give "1000001", which is already 7 bits. However, a character with a smaller ASCII code, like `newline` (10), would result in "1010", which is only 4 bits. We need to ensure all are 7 bits.
    *   A concise way to get a 7-bit binary string from an ASCII code `n` is `(n | 128).toString(2).slice(1)`.
        *   `n | 128`: This performs a bitwise OR operation. If `n` is 67 (binary `01000011`), `67 | 128` (binary `01000011 | 10000000`) results in `11000011` (decimal 195). The leading `1` ensures the number is at least 8 bits long before converting to string.
        *   `.toString(2)`: Converts the number to its binary string representation (e.g., "11000011").
        *   `.slice(1)`: Removes the leading `1` that was added by the bitwise OR, leaving the desired 7-bit representation (e.g., "1000011").
    *   We iterate over each character of the input `MESSAGE`, apply this conversion, and then `join('')` all the 7-bit strings together to form a single `fullBinaryString`.

2.  **Identifying Consecutive Bit Blocks:**
    *   The core of the encoding relies on identifying consecutive runs of the same bit (e.g., "1", "0000", "11").
    *   Regular expressions are perfectly suited for this. `/(1+)|(0+)/g` is used to find one or more consecutive '1's or one or more consecutive '0's globally in the `fullBinaryString`.
    *   `fullBinaryString.match(/(1+)|(0+)/g)` returns an array of strings, where each string is a block of identical consecutive bits (e.g., `['1', '0000', '11']` for "C").

3.  **Encoding Each Block:**
    *   We iterate through the array of matched blocks.
    *   For each `block`:
        *   `bit = block[0]`: This gives us whether the block consists of '1's or '0's.
        *   `count = block.length`: This gives us the number of bits in the current run.
        *   **First part of encoding:** If `bit` is '1', the encoding starts with `0`. If `bit` is '0', it starts with `00`.
        *   **Second part of encoding:** The second part is `count` number of `0`s. This is concisely created using `'0'.repeat(count)`.
    *   These two parts (`'0'` or `'00'`, and `'0'.repeat(count)`) are pushed into a `result` array.

4.  **Final Output:**
    *   Finally, all elements in the `result` array are joined together with a single space (`result.join(' ')`) to produce the final encoded message.

This approach is efficient and concise, especially leveraging JavaScript's string methods and regular expressions for bit manipulation and pattern matching.

## Code