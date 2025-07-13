import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Mapping of all bracket characters to their "family" type.
// This allows us to check if two brackets belong to the same pair type,
// regardless of whether they are opening or closing in the original string.
const BRACKET_TYPES: { [key: string]: string } = {
    '(': 'paren',   ')': 'paren',
    '[': 'square',  ']': 'square',
    '{': 'curly',   '}': 'curly',
    '<': 'angle',   '>': 'angle',
};

/**
 * Checks if a character is one of the recognized bracket characters.
 * @param char The character to check.
 * @returns True if the character is a bracket, false otherwise.
 */
function isBracketChar(char: string): boolean {
    return BRACKET_TYPES.hasOwnProperty(char);
}

/**
 * Determines if a given expression's bracketing can be made valid by flipping elements in-place.
 * @param expression The input string expression.
 * @returns True if the expression can be made valid, false otherwise.
 */
function solveExpression(expression: string): boolean {
    // Step 1: Filter out non-bracket characters and create a sequence of only brackets.
    const bracketChars: string[] = [];
    for (const char of expression) {
        if (isBracketChar(char)) {
            bracketChars.push(char);
        }
    }

    const K = bracketChars.length;

    // Step 2: Handle edge cases.
    // An empty sequence of brackets (or expression with no brackets) is valid.
    if (K === 0) {
        return true;
    }
    // An odd number of bracket characters cannot form perfect pairs.
    if (K % 2 !== 0) {
        return false;
    }

    // Step 3: Initialize the DP table.
    // dp[i][j] will be true if the substring bracketChars[i...j] can be made into a valid,
    // self-contained bracket sequence.
    // The table is K x K, initialized to false.
    const dp: boolean[][] = Array(K).fill(0).map(() => Array(K).fill(false));

    // Step 4: Fill the DP table using nested loops.
    // 'len' iterates over possible lengths of valid bracket sequences.
    // Valid lengths must be even (2, 4, 6, ..., K).
    for (let len = 2; len <= K; len += 2) {
        // 'i' iterates over the starting indices of the substrings.
        for (let i = 0; i <= K - len; i++) {
            const j = i + len - 1; // Calculate the corresponding ending index.

            // Case 1: The substring bracketChars[i...j] forms a single outer pair.
            // This is possible if bracketChars[i] and bracketChars[j] belong to the same family.
            // For example, '([' and ')}' are different families, so they cannot form an outer pair.
            if (BRACKET_TYPES[bracketChars[i]] === BRACKET_TYPES[bracketChars[j]]) {
                if (len === 2) {
                    // If the length is 2, the two characters themselves form a pair (e.g., "()", "[]", ")(", "[}").
                    // They can always be flipped to form a valid pair (e.g., ")(", "{}").
                    dp[i][j] = true;
                } else {
                    // If length > 2, they form an outer pair if the inner substring
                    // bracketChars[i+1...j-1] is also a valid sequence.
                    dp[i][j] = dp[i + 1][j - 1];
                }
            }

            // Case 2: The substring bracketChars[i...j] can be split into two adjacent valid sequences.
            // i.e., (bracketChars[i...k]) + (bracketChars[k+1...j])
            // Both parts must be valid, and their lengths must be even.
            // 'k' represents the ending index of the first part.
            // The length of the first part (k - i + 1) must be even, so k must have different parity than i.
            for (let k = i + 1; k < j; k += 2) { // Start k from i+1 and step by 2 to ensure first part length is even.
                // If dp[i][k] is true (first part is valid) AND dp[k+1][j] is true (second part is valid),
                // then the combined sequence dp[i][j] is also valid.
                if (dp[i][k] && dp[k + 1][j]) {
                    dp[i][j] = true;
                    break; // Once a valid split is found, no need to check other splits for this (i, j).
                }
            }
        }
    }

    // Step 5: The final answer is stored in dp[0][K-1], representing the entire bracket sequence.
    return dp[0][K - 1];
}

let N: number = 0; // Number of expressions to process
let expressions: string[] = []; // Array to store all expressions
let lineCount = 0; // Counter for lines read from input

// Event listener for each line read from stdin
rl.on('line', (line: string) => {
    if (lineCount === 0) {
        // First line contains the number of expressions (N)
        N = parseInt(line);
    } else {
        // Subsequent lines contain the expressions
        expressions.push(line);
        // Once all N expressions are read, process them and print results
        if (expressions.length === N) {
            for (const expr of expressions) {
                console.log(solveExpression(expr));
            }
            rl.close(); // Close the readline interface as all input has been processed
        }
    }
    lineCount++;
});