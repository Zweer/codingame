The problem requires formatting a custom data structure called CGX. The core challenge lies in correctly applying indentation and newlines based on the type of element (BLOCK, PRIMITIVE_TYPE, KEY_VALUE) and its position within the structure. The input includes unnecessary whitespace that must be stripped unless it's part of a string literal.

Here's a breakdown of the strategy:

1.  **Input Processing**: Read all input lines and concatenate them into a single `rawInput` string. Whitespace outside of string literals will be ignored during parsing. Whitespace inside string literals must be preserved.

2.  **State Machine Parsing**: Iterate through the `rawInput` character by character, maintaining several state variables:
    *   `formattedLines`: An array of strings, where each string represents a complete formatted line (including its leading indentation). This will be joined by `\n` at the end.
    *   `currentLineBuffer`: A string that accumulates characters for the current *conceptual* line segment. It does *not* include leading indentation; indentation is added only when `currentLineBuffer` is flushed to `formattedLines`.
    *   `currentIndent`: The current indentation level, a multiple of 4 spaces.
    *   `inString`: A boolean flag, true when the parser is inside a single-quoted string.
    *   `afterEquals`: A boolean flag, true if the previously processed significant character was `=`. This helps apply Rule 7 (PRIMITIVE_TYPEs don't start new lines if they are values of KEY_VALUEs).
    *   `needsForcedNewline`: A boolean flag, true if the *next* element (unless it's a value after `=`) should start on a new line. This flag is set by `(`, `)`, and `;`.

3.  **Character Processing Logic**:

    *   **Whitespace**: If not `inString`, ignore all whitespace characters (` `, `\t`, `\n`, `\r`). If `inString`, append them to `currentLineBuffer`.
    *   **`'` (Single Quote)**:
        *   If `inString` is true, append `'` to `currentLineBuffer` and set `inString` to false (closing quote).
        *   If `inString` is false (opening quote):
            *   Determine if this string literal (as a key or standalone primitive) needs to start a new line based on `afterEquals` and `needsForcedNewline`. If it does, flush `currentLineBuffer` if it contains anything.
            *   Append `'` to `currentLineBuffer`, set `inString` to true, and reset relevant flags.
    *   **`(` (Opening Block)**:
        *   This always forces a new line for the `(`. Flush `currentLineBuffer` if it has content (e.g., a key before a block value).
        *   Add `(` to `formattedLines` with `currentIndent`.
        *   Increase `currentIndent` by 4.
        *   Set `needsForcedNewline` to true as the block's contents will be indented on new lines.
    *   **`)` (Closing Block)**:
        *   Flush any remaining content in `currentLineBuffer` (the last element of the block).
        *   Decrease `currentIndent` by 4.
        *   Add `)` to `formattedLines` with the *new* (decremented) `currentIndent`.
        *   Set `needsForcedNewline` to true.
    *   **`=` (Equals Sign)**:
        *   Append `=` to `currentLineBuffer`.
        *   Set `afterEquals` to true, indicating the next token is a value.
        *   Reset `needsForcedNewline` (as values typically follow immediately, unless they are blocks).
    *   **`;` (Semicolon)**:
        *   Append `;` to `currentLineBuffer`.
        *   Flush `currentLineBuffer` to `formattedLines`.
        *   Set `needsForcedNewline` to true, as the next element will be on a new line.
    *   **Default Characters (Numbers, Booleans, `null`, Key Parts)**:
        *   Determine if a new line should start *before* this character, based on `needsForcedNewline` and `afterEquals`. If so, flush `currentLineBuffer`.
        *   Append the character to `currentLineBuffer`.
        *   Reset `afterEquals` and `needsForcedNewline`.

4.  **Final Flush**: After the loop finishes, if `currentLineBuffer` still contains any content, flush it to `formattedLines`.

5.  **Output**: Join all strings in `formattedLines` with `\n` and print the result.

This state machine approach ensures that formatting rules are applied contextually, yielding the correct output.