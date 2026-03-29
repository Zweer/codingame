The puzzle describes an encoding process and asks us to either encode or decode a message multiple times based on the input `N`.

### Encoding Process Breakdown

Let's analyze the encoding example: `abcdefghi` becomes `ghibcadef`.

1.  **Parts extraction:** The message is split into chunks of increasing length: 1, 2, 3, 4, ... characters. The last chunk takes all remaining characters.
    For `abcdefghi` (length 9):
    *   Step 1: take `a` (1 char)
    *   Step 2: take `bc` (2 chars)
    *   Step 3: take `def` (3 chars)
    *   Step 4: take `ghi` (remaining 3 chars, even though step is 4)

2.  **Parts placement:** Each extracted part is added to a result string alternately at the end and at the beginning.
    *   Initialize `result` as an empty string.
    *   Part 1 (`a`): Add to **end** -> `a`
    *   Part 2 (`bc`): Add to **beginning** -> `bca`
    *   Part 3 (`def`): Add to **end** -> `bcadef`
    *   Part 4 (`ghi`): Add to **beginning** -> `ghibcadef`

### Decoding Process Breakdown

Decoding is the reverse of encoding. To reverse the process, we need to:
1.  Determine the length of each part that was originally extracted.
2.  Determine the order in which these parts were added (end/beginning).
3.  Extract the parts from the encoded message in reverse order of how they were added, and remove them from the current message.
4.  Once all parts are extracted, concatenate them in their original order.

Let's decode `ghibcadef` (length 9):

1.  **Determine part lengths:** We need to find `k` such that `1 + 2 + ... + (k-1) < message_length <= 1 + 2 + ... + k`. This `k` will be the "step" for the last part.
    For length 9:
    *   1st part: length 1
    *   2nd part: length 2
    *   3rd part: length 3
    *   Sum of lengths for 1, 2, 3 is 6. Remaining length is 9 - 6 = 3. So the 4th part has length 3.
    *   The parts taken from the original message were `a` (len 1), `bc` (len 2), `def` (len 3), `ghi` (len 3).
    *   The "step" numbers are 1, 2, 3, 4.

2.  **Determine placement order (reversed):** The encoding added parts at steps 1, 2, 3, 4.
    *   Step 1 (odd): Added to END
    *   Step 2 (even): Added to BEGINNING
    *   Step 3 (odd): Added to END
    *   Step 4 (even): Added to BEGINNING

    To decode, we start from the last operation, i.e., step 4.
    *   Step 4 (even): Part was added to **beginning**. So, `ghi` (the 4th part taken from original) is at the beginning of `ghibcadef`. Extract `ghi` from beginning. Remaining: `bcadef`.
    *   Step 3 (odd): Part was added to **end**. So, `def` (the 3rd part taken from original) is at the end of `bcadef`. Extract `def` from end. Remaining: `bca`.
    *   Step 2 (even): Part was added to **beginning**. So, `bc` (the 2nd part taken from original) is at the beginning of `bca`. Extract `bc` from beginning. Remaining: `a`.
    *   Step 1 (odd): Part was added to **end**. So, `a` (the 1st part taken from original) is at the end of `a`. Extract `a` from end. Remaining: `""`.

3.  **Collect and reorder parts:** We collected parts in the order `[ghi, def, bc, a]`. These are the original parts, but in reverse order of their original sequence (`Part4, Part3, Part2, Part1`). To get the original message, reverse this list: `[a, bc, def, ghi]`. Concatenate them: `abcdefghi`.

### Implementation Details

*   **String Manipulation:** Repeated string concatenations in a loop can be inefficient in JavaScript/TypeScript. It's better to store parts in an array and then `join('')` them at the end.
*   **`encode` function:** Iteratively removes characters from the input string and adds them to the `resultParts` array, using `push` or `unshift` based on the step parity.
*   **`decode` function:**
    *   First, calculate all the original part lengths (1, 2, 3, ..., last remaining part).
    *   Then, iterate through these lengths in reverse order. For each part, determine if it was originally added to the beginning or end of the result string (based on its original step number's parity).
    *   Extract the part from the current message accordingly (from beginning or end).
    *   Store these extracted parts.
    *   Finally, reverse the array of extracted parts and join them to get the original message.
*   **Main Logic:** Read `N`. If `N > 0`, call `decode` `N` times. If `N < 0`, call `encode` `|N|` times. If `N = 0`, do nothing.

### Code