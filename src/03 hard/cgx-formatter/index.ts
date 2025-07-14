/**
 * Reads input from stdin. In a CodinGame environment, `readline()` reads a line and `print()` writes to stdout.
 * For local testing, you might need to mock these or provide input via file redirection.
 */
declare function readline(): string;
declare function print(message: string): void;

function solve() {
    const N: number = parseInt(readline());
    let rawInput: string = "";
    for (let i = 0; i < N; i++) {
        rawInput += readline();
    }

    const formattedLines: string[] = [];
    let currentLineBuffer: string = ""; // Stores characters for the current line segment, without indentation.
    let currentIndent: number = 0;      // Current indentation level in spaces.
    let inString: boolean = false;      // True if currently inside a single-quoted string.
    let afterEquals: boolean = false;   // True if the immediately preceding significant token was '='.
    // True if the next non-whitespace, non-string character should start a new line with currentIndent.
    // This is set by '(', ')', and ';'.
    let needsForcedNewline: boolean = false; 

    for (let i = 0; i < rawInput.length; i++) {
        const char = rawInput[i];

        // 1. Handle characters inside a string literal
        if (inString) {
            currentLineBuffer += char;
            if (char === "'") {
                inString = false;
            }
            continue; // Move to the next character
        }

        // 2. Ignore whitespace outside of strings
        if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            continue; // Move to the next character
        }

        // 3. Determine if the current character should start a new formatted line.
        // This is the "newline before" logic, which precedes appending the character to buffer/output.
        let shouldStartNewLineNow = false;
        if (char === '(') {
            // Rule: A BLOCK starts on its own line.
            shouldStartNewLineNow = true;
        } else if (char === "'") {
            // Rule: A KEY_VALUE starts on its own line.
            // Rule: A PRIMITIVE_TYPE starts on its own line unless it is the value of a VALUE_KEY.
            if (!afterEquals) { 
                shouldStartNewLineNow = true;
            }
        } else { // For numbers, booleans, null, or part of key name (not starting a string literal)
            if (needsForcedNewline && !afterEquals) {
                // If the previous token (like ';', or ')' or '(' that forced content to new line)
                // indicates a newline, AND this character is not a value after an '=' sign.
                shouldStartNewLineNow = true;
            }
        }

        // If a new line should start AND there's content pending for the *previous* conceptual line, flush it.
        // This handles cases like 'key'=(...): 'key=' is flushed, then '(' starts its own line.
        if (shouldStartNewLineNow && currentLineBuffer.length > 0) {
            formattedLines.push(' '.repeat(currentIndent) + currentLineBuffer);
            currentLineBuffer = ""; // Clear buffer after flushing
        }

        // 4. Process the character based on its type
        switch (char) {
            case "'":
                // If shouldStartNewLineNow was true, currentLineBuffer is now empty or was flushed.
                // We simply add the quote to the (potentially newly started) currentLineBuffer.
                currentLineBuffer += char;
                inString = true;
                afterEquals = false; // Reset afterEquals as a new element starts
                needsForcedNewline = false; // This token is handled, no pending newline for next char (unless ';', '(', ')')
                break;
            case '(':
                // ( has already forced currentLineBuffer flush if needed.
                // It always starts a new line for itself.
                formattedLines.push(' '.repeat(currentIndent) + char);
                currentIndent += 4; // Increase indent for block content
                currentLineBuffer = ""; // Ensure buffer is empty for content inside the block
                afterEquals = false; // Reset afterEquals
                needsForcedNewline = true; // Block content elements will need new lines and indentation
                break;
            case ')':
                // Rule: The markers at the start and end of a BLOCK are in the same column.
                // Flush any remaining content (last element in the block) before the closing paren.
                if (currentLineBuffer.length > 0) {
                    formattedLines.push(' '.repeat(currentIndent) + currentLineBuffer);
                    currentLineBuffer = "";
                }
                currentIndent -= 4; // Decrease indent before printing ')'
                formattedLines.push(' '.repeat(currentIndent) + char);
                afterEquals = false; // Reset afterEquals
                needsForcedNewline = true; // After block ends, the next element typically starts on a new line
                break;
            case '=':
                // Append '=' to the key currently in currentLineBuffer.
                currentLineBuffer += char;
                afterEquals = true; // Set flag to indicate value is expected next
                needsForcedNewline = false; // Value typically follows directly on the same line
                break;
            case ';':
                // Rule: A sequence of ELEMENTs separated by ';'. Each ELEMENT starts on its own line.
                // Append ';' to the element just finished.
                currentLineBuffer += char;
                formattedLines.push(' '.repeat(currentIndent) + currentLineBuffer);
                currentLineBuffer = ""; // Clear buffer for the next element
                afterEquals = false; // Reset afterEquals
                needsForcedNewline = true; // Next element must start on a new line
                break;
            default:
                // This is for number, boolean, null, or part of key name without quotes.
                // If shouldStartNewLineNow was true, currentLineBuffer is empty or was flushed.
                // So, just append the character to start building the current line segment.
                currentLineBuffer += char;
                afterEquals = false; // Not an equals sign itself
                needsForcedNewline = false; // This character has been placed, no pending newline
                break;
        }
    }

    // 5. Final flush for any remaining content in the buffer (e.g., a single primitive at the very end).
    if (currentLineBuffer.length > 0) {
        formattedLines.push(' '.repeat(currentIndent) + currentLineBuffer);
    }

    // 6. Output the formatted content
    print(formattedLines.join('\n'));
}

solve();