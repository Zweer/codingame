// Helper to read input in CodinGame environment
// In a real browser environment, you'd use input from an HTML element or similar.
// For CodinGame, these are globally available.
declare function readline(): string;
declare function print(message: any): void;

// Define bracket types and their properties.
// Types are assigned 1-4 to avoid clash with 0n (empty stack) when using BigInt encoding.
const bracketInfoMap: { [key: string]: { type: number; isOpen: boolean; counter: string } } = {
    '(': { type: 1, isOpen: true, counter: ')' }, // Type 1 (0b001)
    ')': { type: 1, isOpen: false, counter: '(' },
    '[': { type: 2, isOpen: true, counter: ']' }, // Type 2 (0b010)
    ']': { type: 2, isOpen: false, counter: '[' },
    '{': { type: 3, isOpen: true, counter: '}' }, // Type 3 (0b011)
    '}': { type: 3, isOpen: false, counter: '{' },
    '<': { type: 4, isOpen: true, counter: '>' }, // Type 4 (0b100)
    '>': { type: 4, isOpen: false, counter: '<' },
};

/**
 * Solves the Brackets, Ultimate Edition puzzle for a single expression.
 * Determines the minimum number of bracket-flipping operations needed.
 *
 * @param expression The input string expression.
 * @returns The minimum number of flips needed, or -1 if impossible.
 */
function solveExpression(expression: string): number {
    // 1. Filter out non-bracket characters and store their original info.
    // This creates an array `bracketChars` containing only relevant bracket data.
    const bracketChars: { char: string; info: typeof bracketInfoMap[string] }[] = [];
    for (const char of expression) {
        const info = bracketInfoMap[char];
        if (info) {
            bracketChars.push({ char, info });
        }
    }

    const L = bracketChars.length; // Total number of bracket elements

    // If an odd number of brackets, it's impossible to balance.
    if (L % 2 !== 0) {
        return -1;
    }
    // If no brackets, it's already valid with 0 flips.
    if (L === 0) {
        return 0;
    }

    // Memoization table: memo[idx][encodedStack] = minFlips.
    // `memo` is an array of Maps. `memo[idx]` stores results for `findMinFlips(idx, ...)`.
    // The BigInt key represents the stack state (each bracket type occupies 3 bits).
    const memo: Map<bigint, number>[] = Array.from({ length: L }, () => new Map<bigint, number>());

    /**
     * Recursive function to find the minimum flips for a subproblem.
     * Implements a top-down dynamic programming approach with memoization.
     *
     * @param idx Current index in the `bracketChars` array.
     * @param currentStackEncoded BigInt representation of the current stack of open bracket types.
     *                            Each type uses 3 bits. `0n` represents an empty stack.
     * @returns Minimum flips from this state, or `Infinity` if impossible to balance from here.
     */
    function findMinFlips(idx: number, currentStackEncoded: bigint): number {
        // Base case: All brackets processed.
        if (idx === L) {
            // If the stack is empty, it means all brackets are balanced. Cost is 0 from here.
            // Otherwise, there are unmatched opening brackets, so this path is invalid.
            return currentStackEncoded === 0n ? 0 : Infinity;
        }

        // Check if this state has already been computed (memoization).
        if (memo[idx].has(currentStackEncoded)) {
            return memo[idx].get(currentStackEncoded)!;
        }

        let minFlipsForState = Infinity; // Initialize with a very high value

        const currentBracket = bracketChars[idx];
        const originalInfo = currentBracket.info;

        // --- Option 1: Treat the current bracket as an OPENING bracket ---
        // Cost: 0 if it was originally an opening bracket, 1 if it was a closing bracket (flipped).
        const costOption1 = originalInfo.isOpen ? 0 : 1;
        
        // Push the bracket's type onto the stack. Each type occupies 3 bits.
        // `currentStackEncoded << 3n` makes space for the new type.
        // `| BigInt(originalInfo.type)` adds the new type to the least significant bits.
        const newStackEncoded1 = (currentStackEncoded << 3n) | BigInt(originalInfo.type);
        
        // Recursively find flips for the next bracket with the updated stack.
        const resultOption1 = findMinFlips(idx + 1, newStackEncoded1);
        
        // If the recursive call found a valid path, update `minFlipsForState`.
        if (resultOption1 !== Infinity) {
            minFlipsForState = Math.min(minFlipsForState, costOption1 + resultOption1);
        }

        // --- Option 2: Treat the current bracket as a CLOSING bracket ---
        // Cost: 0 if it was originally a closing bracket, 1 if it was an opening bracket (flipped).
        const costOption2 = originalInfo.isOpen ? 1 : 0;

        // A closing bracket must match an existing opening bracket on the stack.
        // So, the stack must not be empty.
        if (currentStackEncoded !== 0n) {
            // Get the type of the top element on the stack (last 3 bits).
            // `0b111n` is BigInt for 7 (mask for 3 bits).
            const stackTopType = Number(currentStackEncoded & 0b111n);

            // If the stack top's type matches the current bracket's type, it's a valid match.
            if (stackTopType === originalInfo.type) {
                // Pop the element from the stack by right-shifting by 3 bits.
                const newStackEncoded2 = currentStackEncoded >> 3n;
                
                // Recursively find flips for the next bracket with the updated stack.
                const resultOption2 = findMinFlips(idx + 1, newStackEncoded2);
                
                // If the recursive call found a valid path, update `minFlipsForState`.
                if (resultOption2 !== Infinity) {
                    minFlipsForState = Math.min(minFlipsForState, costOption2 + resultOption2);
                }
            }
        }
        // If currentStackEncoded is 0n or stackTopType !== originalInfo.type,
        // this option is either invalid (no matching opening bracket) or leads to an unmatchable state.
        // In these cases, `minFlipsForState` is not updated by this option, correctly keeping `Infinity`
        // if Option 1 also resulted in Infinity.

        // Store the computed minimum flips for this state in the memoization table.
        memo[idx].set(currentStackEncoded, minFlipsForState);
        return minFlipsForState;
    }

    // Start the recursive process from the first bracket (`idx=0`) with an empty stack (`0n`).
    const result = findMinFlips(0, 0n);

    // If the final result is Infinity, it means no valid sequence can be formed.
    return result === Infinity ? -1 : result;
}

// Main loop for CodinGame platform.
// Reads the number of expressions, then processes each one.
const N: number = parseInt(readline());
for (let i = 0; i < N; i++) {
    const expression: string = readline();
    print(solveExpression(expression));
}