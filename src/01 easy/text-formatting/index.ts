// Helper functions for character classification
function isLetter(char: string): boolean {
    return char >= 'a' && char <= 'z';
}

function isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
}

function isSpace(char: string): boolean {
    return char === ' ';
}

function isPunctuation(char: string): boolean {
    // A punctuation mark is a character other than a space, a letter or a digit.
    return !isLetter(char) && !isDigit(char) && !isSpace(char);
}

function isSentenceEndPunctuation(char: string): boolean {
    return char === '.' || char === '!' || char === '?';
}

/**
 * Solves the Text Formatting puzzle by applying a set of formatting rules.
 *
 * @param text The input text string to be formatted.
 * @returns The formatted text string according to the puzzle rules.
 */
function solve(text: string): string {
    // Rule: Use only lowercase letters, except for the beginning of the sentence
    // We convert the entire input to lowercase first to simplify capitalization logic later.
    const input = text.toLowerCase();

    const result: string[] = []; // Stores the formatted characters
    let needsCapitalization = true; // True if the next letter encountered should be capitalized (start of sentence)
    let lastAddedIsSpace = false; // True if the last character added to 'result' was a space
    let lastAddedIsPunctuation = false; // True if the last character added to 'result' was a punctuation mark
    let lastAddedPunctuationChar: string | null = null; // Stores the specific punctuation char for repeated punctuation check

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (isLetter(char) || isDigit(char)) {
            // Rule: One space after each punctuation mark in front of a letter/digit;
            // If the last character added was punctuation and it wasn't followed by a space yet, add one.
            if (lastAddedIsPunctuation && !lastAddedIsSpace) {
                result.push(' ');
                lastAddedIsSpace = true; // A space was just added
            }

            // Rule: Use only lowercase letters, except for the beginning of the sentence
            if (isLetter(char) && needsCapitalization) {
                result.push(char.toUpperCase());
                needsCapitalization = false; // Reset flag after capitalizing the first letter of the sentence
            } else {
                result.push(char);
            }

            // Reset flags as the current character is not a space or punctuation
            lastAddedIsSpace = false;
            lastAddedIsPunctuation = false;
            lastAddedPunctuationChar = null; // A letter/digit breaks any punctuation sequence
        } else if (isSpace(char)) {
            // Rule: Only a single space between words (remove excessive spaces);
            // Rule: No spaces before punctuation marks; (implicitly handled if we don't add spaces before punct)

            // Ignore spaces if:
            // 1. Result is empty (leading spaces in the input).
            // 2. The last character added was already a space (multiple consecutive spaces).
            // 3. The last character added was a punctuation mark (spaces immediately after punctuation are handled
            //    when a letter/digit follows, or are simply skipped if followed by more punctuation/spaces).
            if (result.length === 0 || lastAddedIsSpace || lastAddedIsPunctuation) {
                continue;
            }

            result.push(' ');
            lastAddedIsSpace = true;
            // A space breaks a punctuation sequence, so reset punctuation flags
            lastAddedIsPunctuation = false;
            lastAddedPunctuationChar = null;
            // needsCapitalization state is not affected by a space
        } else if (isPunctuation(char)) {
            // Rule: Remove repeated punctuation marks.
            // If the last character added was the same punctuation mark, skip the current one.
            if (lastAddedIsPunctuation && lastAddedPunctuationChar === char) {
                continue;
            }

            // Rule: No spaces before punctuation marks;
            // If the last character added was a space, remove it before adding the punctuation.
            // This handles cases like "word ." -> "word."
            if (lastAddedIsSpace) {
                result.pop(); // Remove the preceding space
                lastAddedIsSpace = false; // The space is removed
            }

            result.push(char);
            lastAddedIsPunctuation = true;
            lastAddedPunctuationChar = char;
            lastAddedIsSpace = false; // Just added punctuation, so not a space

            // Rule: Capitalize for beginning of the sentence (after a dot, exclamation, or question mark);
            if (isSentenceEndPunctuation(char)) {
                needsCapitalization = true;
            }
        }
    }

    // Final cleanup: remove any trailing spaces that might remain at the very end of the result.
    while (result.length > 0 && result[result.length - 1] === ' ') {
        result.pop();
    }

    return result.join('');
}

// In a typical CodinGame environment, the input is read via readline()
// and the output is printed using console.log().
// The provided code structure assumes `readline()` is available.

// const inputLine: string = readline();
// console.log(solve(inputLine));