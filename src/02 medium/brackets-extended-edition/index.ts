// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Helper sets and map for bracket types and their counterparts
const OPENING_BRACKETS = new Set(['(', '[', '{', '<']);
const CLOSING_BRACKETS = new Set([')', ']', '}', '>']);

// BRACKET_PAIRS maps an opening bracket to its closing counterpart,
// and a closing bracket to its opening counterpart.
const BRACKET_PAIRS: { [key: string]: string } = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    ')': '(', // Reverse mappings
    ']': '[',
    '}': '{',
    '>': '<',
};

/**
 * Validates a sequence of bracket characters using a stack.
 * Assumes the input string `s` contains only bracket characters.
 * @param s The string of bracket characters to validate.
 * @returns True if the sequence is valid, false otherwise.
 */
function isValid(s: string): boolean {
    const stack: string[] = [];
    for (const char of s) {
        if (OPENING_BRACKETS.has(char)) {
            stack.push(char);
        } else { // It's a closing bracket
            if (stack.length === 0) {
                return false; // Mismatched closing bracket (no opening bracket on stack)
            }
            const lastOpen = stack.pop()!;
            // Check if the popped opening bracket matches the current closing bracket
            if (BRACKET_PAIRS[lastOpen] !== char) {
                return false; // Mismatched type (e.g., popping '(' but seeing ']')
            }
        }
    }
    return stack.length === 0; // Stack must be empty if all brackets are correctly paired
}

/**
 * Determines if an expression's bracketing can be made valid by flipping elements in-place.
 * @param expression The input string expression.
 * @returns 'true' if it can be made valid, 'false' otherwise.
 */
function solveExpression(expression: string): string {
    // Extract only bracket characters from the expression
    const brackets: string[] = [];
    for (const char of expression) {
        if (OPENING_BRACKETS.has(char) || CLOSING_BRACKETS.has(char)) {
            brackets.push(char);
        }
    }

    const K = brackets.length;

    // Early exit: If the total number of bracket characters is odd, it's impossible to form pairs.
    if (K % 2 !== 0) {
        return 'false';
    }
    // Early exit: If there are no brackets, it's trivially valid.
    if (K === 0) {
        return 'true';
    }

    // Iterate through all 2^K possible combinations of flips.
    // Each integer 'i' from 0 to 2^K - 1 represents a unique combination.
    // The j-th bit of 'i' determines whether the j-th bracket character is flipped or not.
    for (let i = 0; i < (1 << K); i++) {
        let currentBracketSequence: string = "";
        for (let j = 0; j < K; j++) {
            const originalChar = brackets[j];
            const bit = (i >> j) & 1; // Get the j-th bit (0 or 1)

            let interpretedChar: string;
            if (bit === 0) { // If bit is 0, keep the original character
                interpretedChar = originalChar;
            } else { // If bit is 1, flip the character to its counterpart
                interpretedChar = BRACKET_PAIRS[originalChar];
            }
            currentBracketSequence += interpretedChar;
        }

        // Validate the sequence formed by the current combination of flips
        if (isValid(currentBracketSequence)) {
            return 'true'; // Found a valid combination, so return true immediately
        }
    }

    // If no combination leads to a valid bracketing, return false
    return 'false';
}

// Read N, the number of expressions
const N: number = parseInt(readline());

// Process each expression
for (let i = 0; i < N; i++) {
    const expression: string = readline();
    console.log(solveExpression(expression));
}