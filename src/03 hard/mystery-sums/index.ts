// For CodinGame, `readline()` and `print()` are globally available.
// If running locally, you might need to mock them or use a library like 'readline-sync'.

/**
 * Solves the Mystery Sums puzzle by finding missing digits in a mathematical expression.
 */
function solveMysterySums() {
    // Read the input expression from standard input
    const expression: string = readline();

    // Split the expression into tokens based on spaces
    const tokens = expression.split(' ');

    let equalsIndex = -1;
    let operator = '';
    let rhsValue: bigint; // Right-Hand Side value, using BigInt for large numbers
    let lhsNumberStrings: string[] = []; // Left-Hand Side numbers as strings, might contain '?'

    // Parse the expression to identify LHS numbers, operator, and RHS value
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '=') {
            equalsIndex = i;
            break;
        }
    }

    // The last token is always the RHS value
    rhsValue = BigInt(tokens[tokens.length - 1]);
    // The token immediately before '=' is the operator
    operator = tokens[equalsIndex - 1];

    // All tokens before the operator are LHS numbers
    for (let i = 0; i < equalsIndex - 1; i++) {
        lhsNumberStrings.push(tokens[i]);
    }

    // Define an interface to store information about each question mark position
    interface QuestionMarkPosition {
        numberIndex: number; // Index of the number string in `lhsNumberStrings`
        digitIndex: number;  // Index of the '?' character within that number string
    }
    const questionMarkPositions: QuestionMarkPosition[] = [];

    // Populate the `questionMarkPositions` list by finding all '?' characters
    for (let i = 0; i < lhsNumberStrings.length; i++) {
        const numStr = lhsNumberStrings[i];
        for (let j = 0; j < numStr.length; j++) {
            if (numStr[j] === '?') {
                questionMarkPositions.push({
                    numberIndex: i,
                    digitIndex: j
                });
            }
        }
    }

    let solutionFound = false;
    let resultLhsNumberStrings: string[] = []; // Stores the LHS numbers for the found solution

    /**
     * Recursive function to find the correct digits for '?'.
     * It tries every possible digit for the current '?' and recursively calls itself for the next '?'
     *
     * @param qIdx The index of the current question mark being processed in `questionMarkPositions`.
     * @param currentLhsNumStrs A copy of the LHS number strings with '?'s filled so far.
     * @returns `true` if a solution is found in this recursive branch (or already found globally), `false` otherwise.
     */
    function findSolution(
        qIdx: number,
        currentLhsNumStrs: string[]
    ): boolean {
        // Optimization: If a solution has already been found by another branch, stop exploring this one.
        if (solutionFound) {
            return true;
        }

        // Base case: All question marks have been filled
        if (qIdx === questionMarkPositions.length) {
            const numbers: bigint[] = [];
            // Convert current string numbers (with '?' filled) to BigInts
            for (const numStr of currentLhsNumStrs) {
                const num = BigInt(numStr);
                // Problem states that the numbers in the expression must be "positive integers".
                // If any parsed number (after '?' substitution) becomes 0, this combination is invalid.
                // For example, if '?' becomes '0', or '??' becomes '00', resulting in 0, it's invalid.
                if (num === 0n) {
                    return false;
                }
                numbers.push(num);
            }

            // Calculate the LHS result based on the operator
            let currentLhsResult: bigint;
            switch (operator) {
                case '+':
                    currentLhsResult = numbers.reduce((sum, n) => sum + n, 0n);
                    break;
                case '-':
                    // For subtraction, the first number is the initial value
                    currentLhsResult = numbers.reduce((diff, n, idx) => idx === 0 ? n : diff - n);
                    break;
                case '*':
                    currentLhsResult = numbers.reduce((prod, n) => prod * n, 1n);
                    break;
                case '/':
                    // For division, the first number is the initial value.
                    // Division by zero is prevented because numbers are guaranteed positive (not 0) by the earlier check.
                    currentLhsResult = numbers.reduce((quotient, n, idx) => {
                        if (idx === 0) return n;
                        return quotient / n; // BigInt division automatically performs integer division
                    });
                    break;
                default:
                    // This case should ideally not be reached given problem constraints on operators
                    throw new Error(`Unknown operator: ${operator}`);
            }

            // Check if the calculated LHS matches the RHS value
            if (currentLhsResult === rhsValue) {
                solutionFound = true;
                resultLhsNumberStrings = [...currentLhsNumStrs]; // Store a copy of the valid LHS numbers
                return true;
            }
            return false; // No match
        }

        // Recursive step: Try filling the current question mark with digits 0-9
        const qPos = questionMarkPositions[qIdx];
        const currentNumStr = currentLhsNumStrs[qPos.numberIndex];
        const newNumStrChars = currentNumStr.split('');

        // Determine the starting digit for the loop (0 or 1)
        // If the '?' is the *only* digit in the number (e.g., the number is just "?"),
        // it cannot be 0 because 0 is not a positive integer. It must be 1-9.
        let startDigit = 0;
        if (currentNumStr.length === 1 && qPos.digitIndex === 0) {
            startDigit = 1;
        }
        // For multi-digit numbers (e.g., "?1", "??"), a leading '0' is generally allowed.
        // For example, BigInt("01") correctly parses to 1n, which is positive.
        // The `if (num === 0n)` check in the base case handles cases like "00" turning into 0.

        for (let d = startDigit; d <= 9; d++) {
            newNumStrChars[qPos.digitIndex] = d.toString();
            // Create a new array for the next recursive call to avoid modifying shared state
            const nextLhsNumStrs = [...currentLhsNumStrs];
            nextLhsNumStrs[qPos.numberIndex] = newNumStrChars.join('');

            // Recursively call `findSolution` for the next question mark
            if (findSolution(qIdx + 1, nextLhsNumStrs)) {
                return true; // Solution found in a deeper call, propagate `true` up
            }
        }

        return false; // No solution found for this branch
    }

    // Start the recursive search with the initial LHS number strings
    findSolution(0, [...lhsNumberStrings]);

    // Construct and print the final output expression if a solution was found
    if (solutionFound) {
        let outputTokens: string[] = [];
        for (let i = 0; i < resultLhsNumberStrings.length; i++) {
            outputTokens.push(resultLhsNumberStrings[i]);
            // Add operator after each number except the last one on LHS
            if (i < resultLhsNumberStrings.length - 1) {
                outputTokens.push(operator);
            }
        }
        // Add the equals sign and the RHS value (which was never modified)
        outputTokens.push('=');
        outputTokens.push(rhsValue.toString());
        print(outputTokens.join(' ')); // Print the result
    } else {
        // According to CodinGame puzzle typical guarantees, a solution usually exists.
        // If this branch is reached, it might indicate an issue with the logic
        // or an unexpected input without a valid solution.
        print("No solution found.");
    }
}

// Call the main function to solve the puzzle (this line is typically uncommented in CodinGame submissions)
// solveMysterySums();