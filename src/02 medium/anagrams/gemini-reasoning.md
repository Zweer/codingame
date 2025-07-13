To solve this Anagrams puzzle, we need to reverse the four scrambling steps described. Since the scrambling steps are applied sequentially (1, 2, 3, 4), the unscrambling steps must be applied in reverse order (Inverse 4, Inverse 3, Inverse 2, Inverse 1).

Let's break down each scrambling step and derive its inverse:

### Scrambling Steps and Their Inverses

1.  **Scramble Step 1: Reverse every 2nd letter (B, D, F, ...)**
    *   **Inverse 1 (Unscramble):** Reversing a sequence twice returns it to its original order. So, to undo this, we simply reverse the 2nd letters again.

2.  **Scramble Step 2: Shift every 3rd letter (C, F, I, ...) one position to the right (with wrap-around).**
    *   **Inverse 2 (Unscramble):** The opposite of a right circular shift is a left circular shift. So, shift the 3rd letters one position to the left (with wrap-around).

3.  **Scramble Step 3: Shift every 4th letter (D, H, L, ...) one position to the left (with wrap-around).**
    *   **Inverse 3 (Unscramble):** The opposite of a left circular shift is a right circular shift. So, shift the 4th letters one position to the right (with wrap-around).

4.  **Scramble Step 4: Count word lengths, reverse that list, and re-apply to the letter sequence.**
    *   **Inverse 4 (Unscramble):** This step effectively re-groups the letters based on a reversed list of word lengths. To undo this, we need to take the *current* word lengths, reverse *that* list, and then use these "double-reversed" lengths to re-group the letters. This will restore the word boundaries to what they were *before* Scramble Step 4 was applied.

### Implementation Strategy

We'll implement helper functions for character classification and array manipulation, and then apply the inverse steps in the correct order.

1.  **`isNthLetter(char, n)`**: A helper function to check if a given character is an Nth letter of the alphabet. This is determined by its 1-indexed position in the alphabet (e.g., 'A' is 1st, 'B' is 2nd).
2.  **`circularShift(arr, direction)`**: A helper function to perform circular shifts on an array.
3.  **`unscrambleStep4(phrase)`**: This function handles the word length reversal. It takes the input phrase, computes its current word lengths, reverses this list of lengths, then re-groups the continuous sequence of letters based on these restored lengths. This function is crucial for setting up the correct word spacing for subsequent steps.
4.  **`applyLetterTransformation(phrase, nth, transformType)`**: A generalized function to handle Inverse Steps 1, 2, and 3. It takes the phrase (which will include spaces at this point), identifies the `nth` letters, extracts them along with their original indices, applies the specified transformation (reverse, left shift, or right shift), and then reinserts the transformed letters back into their original positions within the phrase, preserving spaces and other letters.

### Detailed Unscrambling Flow (with Example `MLSOHYTA RMLESS` -> `MOSTLY HARMLESS`)

The input phrase is `MLSOHYTA RMLESS`.

1.  **Unscramble Step 4 (Inverse of Scramble Step 4): Re-establish word lengths.**
    *   Input: `MLSOHYTA RMLESS`
    *   Current word lengths: `[8, 6]` (from "MLSOHYTA" and "RMLESS")
    *   Reverse current lengths: `[6, 8]`
    *   Continuous letters: `MLSOHYTARMLESS`
    *   Re-group `MLSOHYTARMLESS` using lengths `[6, 8]`: "MLSOHY" (6 chars) + "TARMLESS" (8 chars)
    *   Result: `MLSOHY TARMLESS` (This matches the phrase's state *before* Scramble Step 4)

2.  **Unscramble Step 3 (Inverse of Scramble Step 3): Shift 4th letters right.**
    *   Input: `MLSOHY TARMLESS`
    *   Identify 4th letters (D, H, L, P, T, X) and their indices in `MLSOHY TARMLESS`:
        *   'H' (at index 4)
        *   'T' (at index 8)
        *   'L' (at index 12)
    *   Extracted letters: `['H', 'T', 'L']`
    *   Shift right: `['L', 'H', 'T']`
    *   Reinsert: 'L' at index 4, 'H' at index 8, 'T' at index 12.
    *   Result: `MLSOLY HARMTESS` (This matches the phrase's state *before* Scramble Step 3)

3.  **Unscramble Step 2 (Inverse of Scramble Step 2): Shift 3rd letters left.**
    *   Input: `MLSOLY HARMTESS`
    *   Identify 3rd letters (C, F, I, L, O, R, U, X) and their indices:
        *   'L' (at index 2)
        *   'O' (at index 3)
        *   'L' (at index 5)
        *   'R' (at index 9)
    *   Extracted letters: `['L', 'O', 'L', 'R']`
    *   Shift left: `['O', 'L', 'R', 'L']`
    *   Reinsert: 'O' at index 2, 'L' at index 3, 'R' at index 5, 'L' at index 9.
    *   Result: `MOSLRY HALMTESS` (This matches the phrase's state *before* Scramble Step 2)

4.  **Unscramble Step 1 (Inverse of Scramble Step 1): Reverse 2nd letters.**
    *   Input: `MOSLRY HALMTESS`
    *   Identify 2nd letters (B, D, F, H, J, L, N, P, R, T, V, X, Z) and their indices:
        *   'L' (at index 3)
        *   'R' (at index 5)
        *   'H' (at index 8)
        *   'L' (at index 10)
        *   'T' (at index 12)
    *   Extracted letters: `['L', 'R', 'H', 'L', 'T']`
    *   Reverse: `['T', 'L', 'H', 'R', 'L']`
    *   Reinsert: 'T' at index 3, 'L' at index 5, 'H' at index 8, 'R' at index 10, 'L' at index 12.
    *   Result: `MOSTLY HARMLESS` (The original phrase!)

This step-by-step logic, applied to both examples provided in the problem description, yields the correct output.