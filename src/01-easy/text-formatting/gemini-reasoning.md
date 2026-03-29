The problem asks us to reformat a given text string according to several specific rules:
1.  **Single space between words**: Remove any excessive spaces between words.
2.  **No spaces before punctuation**: Punctuation marks should immediately follow the preceding word, without a space in between.
3.  **One space after punctuation**: If a punctuation mark is followed by a letter or digit, there must be exactly one space after it.
4.  **Capitalization**: All letters should be lowercase, except for the first letter of a sentence (which starts after a period `.`, exclamation mark `!`, or question mark `?`, or at the very beginning of the input).
5.  **Remove repeated punctuation**: Consecutive identical punctuation marks (e.g., `,,,` or `...`) should be reduced to a single instance of that mark.

A "punctuation mark" is defined as any character that is not a space, a letter, or a digit.

**Reasoning and Approach:**

The best way to handle these rules, which are highly dependent on the context of surrounding characters, is to process the input string character by character. We will build the formatted output in an array of characters (which is more efficient than repeatedly concatenating strings) and then join them at the end.

We'll maintain several state variables to keep track of the current formatting context:
*   `needsCapitalization`: A boolean flag, `true` if the next letter encountered should be capitalized (e.g., at the start of the text or after a sentence-ending punctuation).
*   `lastAddedIsSpace`: A boolean flag, `true` if the last character added to our `result` array was a space. This helps enforce single spaces and "no spaces before punctuation".
*   `lastAddedIsPunctuation`: A boolean flag, `true` if the last character added was a punctuation mark. This helps enforce "one space after punctuation" and "no spaces before punctuation".
*   `lastAddedPunctuationChar`: A string storing the specific punctuation character if `lastAddedIsPunctuation` is `true`. This is crucial for the "remove repeated punctuation" rule (e.g., to distinguish between `,,` and `.;`).

**Step-by-step logic:**

1.  **Initialization**: Convert the entire input string to lowercase first. Initialize `result` as an empty string array, `needsCapitalization` to `true`, and all other flags to `false` or `null`.

2.  **Character Iteration**: Loop through each character `char` of the (lowercase) input string.

    *   **If `char` is a Letter or Digit**:
        *   **Rule: One space after punctuation**: If `lastAddedIsPunctuation` is true and `lastAddedIsSpace` is false (meaning we just added punctuation without a space following it yet), insert a space into `result`. Set `lastAddedIsSpace` to `true`.
        *   **Rule: Capitalization**: If `char` is a letter and `needsCapitalization` is true, convert `char` to uppercase before adding it to `result`, and then set `needsCapitalization` to `false`.
        *   Add `char` to `result`.
        *   Reset `lastAddedIsSpace`, `lastAddedIsPunctuation`, and `lastAddedPunctuationChar` flags, as the current character is a letter/digit.

    *   **If `char` is a Space**:
        *   **Rule: Single space between words / No spaces before punctuation**: We should *not* add a space if:
            *   `result` is empty (ignore leading spaces).
            *   `lastAddedIsSpace` is true (avoid multiple spaces).
            *   `lastAddedIsPunctuation` is true (spaces immediately after punctuation are handled when the next letter/digit appears, or they are just skipped if followed by another punctuation).
        *   If none of the above conditions are met, add a single space to `result` and set `lastAddedIsSpace` to `true`.
        *   Reset `lastAddedIsPunctuation` and `lastAddedPunctuationChar` (a space breaks any punctuation sequence).

    *   **If `char` is a Punctuation Mark**:
        *   **Rule: Remove repeated punctuation**: If `lastAddedIsPunctuation` is true and `lastAddedPunctuationChar` is the same as `char`, skip adding this `char` (it's a repeated punctuation).
        *   **Rule: No spaces before punctuation**: If `lastAddedIsSpace` is true, it means there's a space immediately before this punctuation. Pop the last character (the space) from `result`. Set `lastAddedIsSpace` to `false`.
        *   Add `char` to `result`.
        *   Set `lastAddedIsPunctuation` to `true`, `lastAddedPunctuationChar` to `char`, and `lastAddedIsSpace` to `false`.
        *   **Rule: Capitalization**: If `char` is a sentence-ending punctuation (`.`, `!`, `?`), set `needsCapitalization` to `true` for the next sentence.

3.  **Final Cleanup**: After the loop, there might be trailing spaces if the input ended with spaces or a word followed by spaces. Remove any trailing spaces from `result`.

4.  **Join**: Join the characters in `result` array to form the final formatted string.

**Helper Functions**:
Simple helper functions `isLetter`, `isDigit`, `isSpace`, `isPunctuation`, and `isSentenceEndPunctuation` are used to categorize characters based on the problem's definitions.