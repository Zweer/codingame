/**
 * Reads a single line from standard input.
 * In CodinGame, this is provided by the environment.
 */
declare function readline(): string;

/**
 * Parses a given word using the CYK algorithm and a context-free grammar in Chomsky Normal Form.
 * @param word The word to parse.
 * @param startSymbol The start symbol of the grammar.
 * @param terminalRules A map from terminal characters to sets of non-terminal symbols that can produce them (e.g., 'a' -> {'A', 'B'}).
 * @param binaryRules A map where binaryRules.get(B)?.get(C) gives the set of non-terminals A such that A -> BC (e.g., 'B' -> Map('C' -> {'A'})).
 * @returns True if the word can be parsed by the grammar, false otherwise.
 */
function parseWord(
    word: string,
    startSymbol: string,
    terminalRules: Map<string, Set<string>>,
    binaryRules: Map<string, Map<string, Set<string>>>
): boolean {
    const n = word.length;

    // As per constraints, word length is always > 0, so no need to handle empty string case for true.
    // If n=0, it cannot be parsed by a non-epsilon grammar.
    if (n === 0) {
        return false;
    }

    // P[i][j] will store the set of non-terminal symbols that can generate
    // the substring word[i...j].
    // Dimensions: P[start_index][end_index].
    const P: Set<string>[][] = Array(n)
        .fill(null)
        .map(() => Array(n).fill(null).map(() => new Set<string>()));

    // Step 1: Initialization for substrings of length 1
    // For each character word[i]
    for (let i = 0; i < n; i++) {
        const char = word[i];
        const nonTerminals = terminalRules.get(char);
        if (nonTerminals) {
            for (const nt of nonTerminals) {
                P[i][i].add(nt);
            }
        }
    }

    // Step 2: Fill the table for substrings of increasing length
    // len: current length of the substring (from 2 to n)
    for (let len = 2; len <= n; len++) {
        // i: starting index of the substring
        for (let i = 0; i <= n - len; i++) {
            // j: ending index of the substring
            const j = i + len - 1;

            // k: split point for the substring word[i...j]
            // We split into word[i...k] and word[k+1...j]
            for (let k = i; k < j; k++) {
                const leftSymbols = P[i][k];      // Non-terminals for word[i...k]
                const rightSymbols = P[k + 1][j]; // Non-terminals for word[k+1...j]

                // Iterate through all possible pairs (B, C) where B can generate word[i...k]
                // and C can generate word[k+1...j]
                for (const B of leftSymbols) {
                    const CMap = binaryRules.get(B);
                    if (CMap) {
                        for (const C of rightSymbols) {
                            const possibleHeads = CMap.get(C);
                            if (possibleHeads) {
                                // For each A in possibleHeads (i.e., A -> BC is a rule)
                                for (const A of possibleHeads) {
                                    P[i][j].add(A);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Step 3: Check if the start symbol can derive the entire word
    return P[0][n - 1].has(startSymbol);
}


// --- Main Logic ---

const N: number = parseInt(readline()); // Number of rules
const START_SYMBOL: string = readline(); // Start symbol

// Stores rules of type A -> a (terminal rules)
// Example: terminalRules.get('a') might return {'S', 'O'} if S -> a and O -> a
const terminalRules = new Map<string, Set<string>>(); 

// Stores rules of type A -> BC (binary rules)
// Example: binaryRules.get('O')?.get('C') might return {'S'} if S -> OC
const binaryRules = new Map<string, Map<string, Set<string>>>(); 

// Read grammar rules
for (let i = 0; i < N; i++) {
    const rule: string = readline();
    const parts = rule.split(' -> ');
    const head = parts[0]; // Non-terminal on the left side of the rule
    const body = parts[1]; // Right side of the rule

    if (body.length === 1) { // Rule is A -> a (terminal production)
        const terminal = body[0];
        if (!terminalRules.has(terminal)) {
            terminalRules.set(terminal, new Set<string>());
        }
        terminalRules.get(terminal)!.add(head); // Add 'head' to the set of non-terminals for 'terminal'
    } else { // Rule is A -> BC (binary production, length 2 in CNF)
        const leftNonTerminal = body[0];
        const rightNonTerminal = body[1];

        if (!binaryRules.has(leftNonTerminal)) {
            binaryRules.set(leftNonTerminal, new Map<string, Set<string>>());
        }
        const rightMap = binaryRules.get(leftNonTerminal)!; // Get the inner map for 'leftNonTerminal'

        if (!rightMap.has(rightNonTerminal)) {
            rightMap.set(rightNonTerminal, new Set<string>());
        }
        rightMap.get(rightNonTerminal)!.add(head); // Add 'head' to the set of non-terminals for 'leftNonTerminal', 'rightNonTerminal' pair
    }
}

const T: number = parseInt(readline()); // Number of test cases

// Process each test case
for (let i = 0; i < T; i++) {
    const word: string = readline();
    const result = parseWord(word, START_SYMBOL, terminalRules, binaryRules);
    console.log(result ? 'true' : 'false');
}