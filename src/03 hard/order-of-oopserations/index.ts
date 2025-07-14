function solve(expression: string): number {
    // Step 1: Tokenize the expression
    // Converts the input string into a list of numbers and operators.
    // Unary minus is identified and represented by a special token '_UNARY_MINUS_'.
    const tokens: (number | string)[] = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];

        if (char >= '0' && char <= '9') {
            // It's a digit, parse the complete number
            let numStr = '';
            while (i < expression.length && expression[i] >= '0' && expression[i] <= '9') {
                numStr += expression[i];
                i++;
            }
            tokens.push(parseInt(numStr));
            // 'i' has already been advanced past the number, so continue to the next iteration
            continue;
        } else {
            // It's an operator
            // Determine if it's a unary minus:
            // - It's the first character of the expression (i === 0)
            // - OR the immediately preceding token was an operator (string type).
            //   This allows for expressions like `6+-3` or `-5`.
            if (char === '-' && (i === 0 || typeof tokens[tokens.length - 1] === 'string')) {
                tokens.push('_UNARY_MINUS_');
            } else {
                // It's a binary operator
                tokens.push(char);
            }
            i++;
        }
    }

    // Step 2: Evaluate the expression based on custom operator precedence
    // Operators are grouped by their priority, from highest to lowest.
    const precedenceLevels: string[][] = [
        ['_UNARY_MINUS_'], // Priority 5: Negation
        ['+'],              // Priority 4: Addition
        ['/'],              // Priority 3: Division
        ['-'],              // Priority 2: Subtraction (binary)
        ['*']               // Priority 1: Multiplication
    ];

    let currentTokens = tokens; // Start with the tokenized list

    // Iterate through each precedence level, performing operations for that level
    for (const operatorsToProcess of precedenceLevels) {
        const newTokens: (number | string)[] = [];
        let j = 0; // Index for iterating through currentTokens

        while (j < currentTokens.length) {
            const token = currentTokens[j];

            // Check if the current token is an operator to be processed in this pass
            if (typeof token === 'string' && operatorsToProcess.includes(token)) {
                if (token === '_UNARY_MINUS_') {
                    // Unary minus takes the next token as its operand
                    const operand = currentTokens[j + 1] as number;
                    newTokens.push(-operand);
                    j += 2; // Consume the '_UNARY_MINUS_' token and its operand
                } else {
                    // Binary operator: takes the last number added to newTokens as its left operand
                    // and the next token in currentTokens as its right operand.
                    const leftOperand = newTokens.pop() as number; // Get the computed left-hand side
                    const rightOperand = currentTokens[j + 1] as number; // Get the number after the operator

                    let result: number;
                    switch (token) {
                        case '+': result = leftOperand + rightOperand; break;
                        case '/': result = leftOperand / rightOperand; break;
                        case '-': result = leftOperand - rightOperand; break;
                        case '*': result = leftOperand * rightOperand; break;
                        default:
                            // This case should ideally not be reached if the operator list is exhaustive
                            throw new Error(`Unknown binary operator encountered: ${token}`);
                    }
                    newTokens.push(result);
                    j += 2; // Consume the binary operator and its right operand
                }
            } else {
                // If the token is a number, or an operator from a lower precedence level,
                // simply add it to newTokens for the next pass.
                newTokens.push(token);
                j++; // Move to the next token
            }
        }
        // After processing all operators of the current precedence level,
        // update currentTokens for the next pass.
        currentTokens = newTokens;
    }

    // After all precedence levels have been processed, currentTokens should contain a single number.
    return currentTokens[0] as number;
}