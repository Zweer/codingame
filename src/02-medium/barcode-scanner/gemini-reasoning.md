The problem asks us to decode a 95-bit binary sequence representing an EAN-13 barcode into its 13-digit decimal number. The input sequence might be reversed.

Here's a breakdown of the EAN-13 barcode structure and the decoding process:

1.  **Barcode Structure:**
    *   A 95-bit sequence is composed of: `LEFT GUARD` (3 bits) + `LEFT PART` (42 bits) + `CENTRAL GUARD` (5 bits) + `RIGHT PART` (42 bits) + `RIGHT GUARD` (3 bits).
    *   `LEFT GUARD` and `RIGHT GUARD` are both `101`.
    *   `CENTRAL GUARD` is `01010`.
    *   `LEFT PART` and `RIGHT PART` each consist of 6 digits, where each digit is encoded as a 7-bit code.

2.  **Handling Reversed Input:**
    *   The first step is to determine the correct orientation of the `scanline`. We attempt to decode the `scanline` as is. If it fails, we reverse the `scanline` and try again. If both fail, the scan is invalid.

3.  **Decoding Individual Digits:**
    *   We are provided with tables for `L-code`, `G-code`, and `R-code` for digits 0-9. These are stored in `Map` objects for efficient lookup.
    *   **Left Part:** Consists of 6 7-bit codes. These codes can be either `L-code` (odd parity) or `G-code` (even parity). We need to identify which type each 7-bit segment corresponds to and store both the digit and its type (`L` or `G`).
    *   **Right Part:** Consists of 6 7-bit codes. These are always `R-code`.

4.  **Determining the First Digit:**
    *   The first (leftmost) digit of the 13-digit barcode is not encoded in a 7-bit segment. Instead, it's determined by the *pattern* of L and G codes in the `LEFT PART`. For example, "LLLLLL" corresponds to the first digit 0, "LLGLGG" to 1, and so on. We use a lookup table for these patterns.

5.  **Checksum Verification:**
    *   After decoding all 13 digits (the first digit derived from the pattern, followed by 6 from the left part, then 6 from the right part), a checksum calculation is performed to validate the barcode.
    *   The rule is: Multiply every second digit by 3, then add up all 13 digits. If the barcode is correct, the total sum must be a multiple of 10.
    *   In 0-indexed terms (for an array `digits[0]` to `digits[12]`): `digits[1]`, `digits[3]`, `digits[5]`, `digits[7]`, `digits[9]`, `digits[11]` are multiplied by 3. All other digits (`digits[0]`, `digits[2]`, `digits[4]`, `digits[6]`, `digits[8]`, `digits[10]`, `digits[12]`) are multiplied by 1. Sum them all up and check if `sum % 10 === 0`.

6.  **Error Handling (`INVALID SCAN`):**
    *   If the `scanline` length is not 95 bits.
    *   If any of the guard patterns (`LEFT GUARD`, `CENTRAL GUARD`, `RIGHT GUARD`) do not match their expected values.
    *   If any 7-bit segment in the `LEFT PART` does not match an `L-code` or `G-code`.
    *   If any 7-bit segment in the `RIGHT PART` does not match an `R-code`.
    *   If the determined pattern for the first digit does not exist in the `FIRST_DIGIT_PATTERNS` table.
    *   If the final 13-digit barcode fails the checksum verification.
    *   In any of these cases, the function returns `null`, indicating a failed decode attempt for that orientation.

The solution first defines constants for the code tables, guard patterns, and the "INVALID SCAN" string. It then implements a `calculateChecksum` function and a `decodeBarcode` function. The main part of the script reads the input, attempts to decode, and if unsuccessful, tries with the reversed input before printing the final result or "INVALID SCAN".