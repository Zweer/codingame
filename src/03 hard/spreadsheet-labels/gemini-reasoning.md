The problem asks us to convert between two types of spreadsheet column labels: 1-indexed numbers (1, 2, 3...) and alphabetic labels (A, B, C... Z, AA, AB...). We need to process a list of labels, converting each to its opposite type.

### Reasoning

This problem is essentially a base conversion challenge, specifically a base-26 system. However, it has a crucial difference from standard base-26 (where digits usually range from 0 to 25): here, the "digits" are 1 to 26 (A-Z). This means there's no "zero" digit. This specific characteristic requires careful handling, especially when converting from numbers to alphabetic labels.

We need two main conversion functions:

1.  **`numberToAlpha(num: number)`: Converts a 1-indexed number to an alphabetic label.**
    *   This process is similar to converting a base-10 number to another base (e.g., base-26). We repeatedly take the modulo and divide.
    *   Let's consider `num` as the number to convert.
    *   We append characters to the `result` string from right to left (least significant digit first), so we prepend them.
    *   In each step:
        *   Calculate `remainder = num % 26`. This `remainder` will be between 0 and 25.
        *   **Special Case for `remainder === 0`**: If the `remainder` is 0, it means the current "digit" is 'Z' (which represents 26). In a standard base system, a remainder of 0 would mean the digit is '0', and `num` would simply be `num / base`. But since 'Z' represents 26, it "consumes" a full 26. Therefore, after assigning 'Z', we must decrement `num` by 1 before dividing by 26 to get the value for the next position. This is `num = (num / 26) - 1`.
        *   **For other remainders (1 to 25)**: These correspond to 'A' through 'Y'. We map `remainder` 1 to 'A', 2 to 'B', and so on. The character is `String.fromCharCode('A'.charCodeAt(0) + remainder - 1)`. Then, `num` is simply `Math.floor(num / 26)`.
    *   The loop continues as long as `num` is greater than 0.

    *Example: Converting 27 to AA*
    1.  `num = 27`
        `remainder = 27 % 26 = 1`
        `result = 'A'` (from `String.fromCharCode('A'.charCodeAt(0) + 1 - 1)`)
        `num = Math.floor(27 / 26) = 1`
    2.  `num = 1`
        `remainder = 1 % 26 = 1`
        `result = 'A' + 'A' = "AA"`
        `num = Math.floor(1 / 26) = 0`
    3.  `num = 0`, loop ends. Return "AA".

    *Example: Converting 52 to AZ*
    1.  `num = 52`
        `remainder = 52 % 26 = 0`
        `result = 'Z'`
        `num = (52 / 26) - 1 = 2 - 1 = 1`
    2.  `num = 1`
        `remainder = 1 % 26 = 1`
        `result = 'A' + 'Z' = "AZ"`
        `num = Math.floor(1 / 26) = 0`
    3.  `num = 0`, loop ends. Return "AZ".

2.  **`alphaToNumber(label: string)`: Converts an alphabetic label to a 1-indexed number.**
    *   This is a straightforward base-26 conversion.
    *   Initialize `result = 0`.
    *   Iterate through each character of the `label` from left to right.
    *   For each character `char`:
        *   Determine its numeric value (A=1, B=2, ..., Z=26). This can be calculated as `char.charCodeAt(0) - 'A'.charCodeAt(0) + 1`.
        *   Update `result`: `result = result * 26 + value`. (This is standard polynomial evaluation for base conversion, e.g., for "AB", it's `(A_value * 26) + B_value`).

    *Example: Converting "AA" to 27*
    1.  `label = "AA"`, `result = 0`
    2.  First char 'A': `value = 'A'.charCodeAt(0) - 'A'.charCodeAt(0) + 1 = 1`.
        `result = 0 * 26 + 1 = 1`.
    3.  Second char 'A': `value = 'A'.charCodeAt(0) - 'A'.charCodeAt(0) + 1 = 1`.
        `result = 1 * 26 + 1 = 27`.
    4.  Loop ends. Return 27.

### Overall Flow

1.  Read `N` (the number of labels).
2.  Read the space-separated string of labels and split it into an array of strings.
3.  Iterate through this array. For each label:
    *   Use a regular expression (`/^\d+$/`) to check if the label consists solely of digits.
    *   If it's numeric, parse it to an integer and call `numberToAlpha`.
    *   If it's alphabetic, call `alphaToNumber`.
    *   Store the converted result.
4.  Join all the converted results with spaces and print the final string.

The constraints (`N` up to 100) are small, so efficiency of the loops is not a concern. JavaScript's `number` type can safely handle integers up to `2^53 - 1`, which is more than enough for typical spreadsheet column labels (even AAA is 703, ZZZ is 18278, etc.).