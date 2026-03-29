import * as readline from 'readline';

// Initialize readline interface for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let N: number = 0;
const sourceLines: string[] = [];
let lineCount = 0;

// Read input line by line
rl.on('line', (line: string) => {
    if (N === 0) {
        // First line is N, the number of source lines
        N = parseInt(line);
    } else {
        // Subsequent lines are source code.
        // Add newline character back as readline.Interface typically strips it.
        // This is crucial for correctly identifying end of single-line comments.
        sourceLines.push(line + '\n');
        lineCount++;
        if (lineCount === N) {
            rl.close(); // All source lines read, close the readline interface
        }
    }
});

// Once all input is read, solve the puzzle
rl.on('close', () => {
    solve();
});

function solve() {
    // Combine all source lines into a single string
    const fullSourceCode = sourceLines.join('');

    // --- Phase 1: Pre-processing - Remove comments and strings ---
    // This phase converts comments and string literals into spaces,
    // preserving newlines at the end of single-line comments.
    enum ParseState {
        NORMAL,
        IN_SINGLE_QUOTE,
        IN_DOUBLE_QUOTE,
        IN_MULTI_LINE_COMMENT,
        IN_SINGLE_LINE_COMMENT,
    }

    let state = ParseState.NORMAL;
    let processedCode = ''; // Code after removing comments and strings

    let i = 0;
    while (i < fullSourceCode.length) {
        const char = fullSourceCode[i];
        const nextChar = fullSourceCode[i + 1]; // Lookahead for multi-char tokens

        switch (state) {
            case ParseState.NORMAL:
                if (char === "'") {
                    state = ParseState.IN_SINGLE_QUOTE;
                    processedCode += ' '; // Replace quote with space
                } else if (char === '"') {
                    state = ParseState.IN_DOUBLE_QUOTE;
                    processedCode += ' '; // Replace quote with space
                } else if (char === '/' && nextChar === '*') {
                    state = ParseState.IN_MULTI_LINE_COMMENT;
                    processedCode += '  '; // Replace "/*" with two spaces
                    i++; // Consume '*'
                } else if (char === '/' && nextChar === '/') {
                    state = ParseState.IN_SINGLE_LINE_COMMENT;
                    processedCode += '  '; // Replace "//" with two spaces
                    i++; // Consume '/'
                } else {
                    processedCode += char; // Keep normal code characters
                }
                break;
            case ParseState.IN_SINGLE_QUOTE:
                if (char === "'") {
                    state = ParseState.NORMAL;
                }
                processedCode += ' '; // Replace content with space
                break;
            case ParseState.IN_DOUBLE_QUOTE:
                if (char === '"') {
                    state = ParseState.NORMAL;
                }
                processedCode += ' '; // Replace content with space
                break;
            case ParseState.IN_MULTI_LINE_COMMENT:
                if (char === '*' && nextChar === '/') {
                    state = ParseState.NORMAL;
                    processedCode += '  '; // Replace "*/" with two spaces
                    i++; // Consume '/'
                } else {
                    processedCode += ' '; // Replace content with space
                }
                break;
            case ParseState.IN_SINGLE_LINE_COMMENT:
                if (char === '\n') {
                    state = ParseState.NORMAL;
                    processedCode += char; // Preserve newline to terminate the comment effect
                } else {
                    processedCode += ' '; // Replace content with space
                }
                break;
        }
        i++;
    }

    // --- Phase 2: Function Call Detection and Filtering ---
    const functionCounts = new Map<string, number>();
    // Reserved words that should not be treated as library function calls
    // (case-insensitive check required as per problem description)
    const RESERVED_WORDS = new Set([
        'and', 'array', 'echo', 'else', 'elseif', 'if', 'for', 'foreach',
        'function', 'or', 'return', 'while', 'new'
    ]);

    // Regex to find sequences of valid name characters (letters, digits, underscore)
    const nameRegex = /[a-zA-Z0-9_]+/g;
    let match: RegExpExecArray | null;

    let prevWord = '';      // Stores the previous significant word (e.g., 'function', 'new')
    let prevWordIndex = -1; // Stores the starting index of prevWord

    // Iterate through all potential names found by the regex
    while ((match = nameRegex.exec(processedCode)) !== null) {
        const currentName = match[0];
        const currentIndex = match.index;

        // 1. Check if 'currentName' is followed by '(', indicating a function call syntax
        // Skip any whitespace between 'currentName' and '('.
        let j = currentIndex + currentName.length;
        while (j < processedCode.length && /\s/.test(processedCode[j])) {
            j++;
        }
        const isFunctionCall = processedCode[j] === '(';

        // 2. Rule: Omit if immediately preceded by '$' (PHP-specific variable function call)
        // Find the first non-whitespace character before currentName.
        let charBeforeName = '';
        let k = currentIndex - 1;
        while (k >= 0 && /\s/.test(processedCode[k])) {
            k--;
        }
        if (k >= 0) {
            charBeforeName = processedCode[k];
        }
        const isPhpVariableCall = charBeforeName === '$';

        // 3. Rule: Omit if it's a reserved word (case-insensitive)
        const isReservedWord = RESERVED_WORDS.has(currentName.toLowerCase());

        // 4. Rule: Omit if it's a user-defined function/class (e.g., "function name(", "new name(")
        let isUserDefined = false;
        if ((prevWord.toLowerCase() === 'function' || prevWord.toLowerCase() === 'new')) {
            // Check if there's only whitespace between prevWord and currentName
            // 'p' starts right after 'prevWord' and iterates up to 'currentName' start
            let p = prevWordIndex + prevWord.length;
            let onlyWhitespaceBetween = true;
            while (p < currentIndex) {
                if (!/\s/.test(processedCode[p])) {
                    onlyWhitespaceBetween = false; // Non-whitespace found, not immediately preceded
                    break;
                }
                p++;
            }
            if (onlyWhitespaceBetween) {
                isUserDefined = true;
            }
        }

        // Apply all exclusion rules to determine if it's a valid library function call
        if (isFunctionCall) {
            if (!isReservedWord && !isPhpVariableCall && !isUserDefined) {
                functionCounts.set(currentName, (functionCounts.get(currentName) || 0) + 1);
            }
        }

        // Update prevWord for the next iteration.
        // Only 'function' and 'new' keywords (case-insensitive) can serve as 'prevWord'
        // for the user-defined function exclusion rule. For any other word, reset prevWord.
        if (currentName.toLowerCase() === 'function' || currentName.toLowerCase() === 'new') {
            prevWord = currentName;
            prevWordIndex = currentIndex;
        } else {
            prevWord = ''; // Reset for other words, they don't mark user-defined functions
            prevWordIndex = -1;
        }
    }

    // --- Output Results ---
    if (functionCounts.size === 0) {
        console.log('NONE');
    } else {
        // Get all function names, sort them by ASCII value, and print with their counts
        const sortedNames = Array.from(functionCounts.keys()).sort();
        for (const name of sortedNames) {
            console.log(`${name} ${functionCounts.get(name)}`);
        }
    }
}