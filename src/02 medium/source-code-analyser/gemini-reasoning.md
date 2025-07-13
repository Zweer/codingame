The puzzle requires analyzing source code to identify and count library function calls, while excluding specific types of calls (reserved keywords, variable functions, user-defined functions/classes) and ignoring content within comments and string literals.

Here's the breakdown of the solution strategy:

1.  **Input Reading**: The input consists of `N` lines of source code. A crucial note is to preserve newlines, as they terminate single-line comments. We'll read all lines and join them into a single `fullSourceCode` string, ensuring each line ends with a `\n`.

2.  **Phase 1: Pre-processing (Cleaning Code)**
    *   The most complex part is correctly ignoring comments and string literals. A character-by-character state machine is used for this.
    *   States include `NORMAL`, `IN_SINGLE_QUOTE`, `IN_DOUBLE_QUOTE`, `IN_MULTI_LINE_COMMENT`, and `IN_SINGLE_LINE_COMMENT`.
    *   When in a comment or string state, characters are consumed but replaced with a space in the `processedCode` string. This ensures that the removal of these elements doesn't inadvertently merge adjacent valid code tokens (e.g., `foo/*comment*/bar` becoming `foobar`).
    *   Newlines (`\n`) are specifically preserved when ending a `IN_SINGLE_LINE_COMMENT` to maintain line structure for subsequent parsing (though in this specific solution, they are later treated as general whitespace).

3.  **Phase 2: Function Call Detection and Filtering**
    *   After cleaning, `processedCode` contains only valid code characters and spaces.
    *   We use a regular expression `/[a-zA-Z0-9_]+/g` to iteratively find all "words" (potential function names) in the `processedCode`.
    *   For each found `currentName`, we apply the rules:
        *   **Is it a function call?**: Check if `currentName` is immediately followed by an opening parenthesis `(` (ignoring intervening whitespace).
        *   **Rule 1: PHP-specific Variable Function Call (`$name()` )**: Check if the character immediately preceding `currentName` (ignoring intervening whitespace) is a `$`.
        *   **Rule 2: Reserved Keywords**: Check if `currentName` (case-insensitively) is one of the predefined reserved words (`and`, `array`, `echo`, etc.).
        *   **Rule 3: User-defined Functions/Classes (`function name()`, `new name()` )**: This is tracked by maintaining a `prevWord` variable. If `prevWord` was `function` or `new` (case-insensitively), and there's only whitespace between `prevWord` and `currentName`, then `currentName` is considered a user-defined entity and is excluded. The `prevWord` is only set to `function` or `new` keywords. For all other words, `prevWord` is reset.
    *   If a `currentName` is identified as a function call and passes all exclusion rules, its count is incremented in a `Map`.

4.  **Output**:
    *   If no library function calls are found, output `NONE`.
    *   Otherwise, retrieve all unique function names from the map, sort them alphabetically (ASCII order), and print each name along with its count, separated by a space.

This two-phase approach allows for robust handling of the complex parsing rules by first simplifying the input and then applying contextual analysis for function identification.