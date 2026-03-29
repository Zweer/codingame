// readline and print functions are provided by the CodinGame environment.
// For local development, you might need to mock them.
// declare function readline(): string;
// declare function print(message: string): void;

function solve() {
    const formulaStr: string = readline();
    // Split the formula string by spaces and filter out any empty tokens
    // (e.g., from multiple spaces or leading/trailing spaces).
    const tokens = formulaStr.split(' ').filter(token => token !== '');

    const N: number = parseInt(readline());

    // Map to store the fixed truth values of variables (excluding 'X')
    const fixedVars: Map<string, boolean> = new Map();
    for (let i = 0; i < N; i++) {
        const [varName, valueStr] = readline().split(' ');
        fixedVars.set(varName, valueStr === 'TRUE');
    }

    /**
     * Performs a logical operation on two boolean values.
     * @param left The left-hand side operand.
     * @param op The operator string ("AND", "OR", "XOR").
     * @param right The right-hand side operand.
     * @returns The result of the operation.
     */
    function performOperation(left: boolean, op: string, right: boolean): boolean {
        switch (op) {
            case "AND":
                return left && right;
            case "OR":
                return left || right;
            case "XOR":
                // XOR (exclusive OR) is true if exactly one input is true.
                return left !== right;
            default:
                // This case should not be reached based on problem constraints.
                throw new Error(`Unknown operator: ${op}`);
        }
    }

    /**
     * Evaluates the logical formula for a given truth value of the free variable 'X'.
     * Uses a two-stack (operand and operator) approach for infix expression evaluation.
     * @param xValue The truth value to assign to 'X'.
     * @returns The resulting truth value of the entire formula.
     */
    function evaluate(xValue: boolean): boolean {
        // Stack to store boolean operands (intermediate results)
        const operandStack: boolean[] = [];
        // Stack to store operators and opening parentheses
        const operatorStack: string[] = [];

        for (const token of tokens) {
            if (token === '(') {
                // Push opening parenthesis onto the operator stack to mark scope.
                operatorStack.push(token);
            } else if (token === ')') {
                // When a closing parenthesis is encountered, evaluate all operations
                // within the current scope until the matching opening parenthesis is found.
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    const right = operandStack.pop();
                    const op = operatorStack.pop();
                    const left = operandStack.pop();

                    // Basic validation for sufficient items on stack (though problem guarantees valid syntax).
                    if (left === undefined || op === undefined || right === undefined) {
                        throw new Error("Syntax error during evaluation: Not enough operands or operator for ')'.");
                    }
                    operandStack.push(performOperation(left, op, right));
                }
                // After the loop, the top of the operatorStack must be the matching '('. Pop it.
                if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                    throw new Error("Syntax error: Mismatched or unhandled parentheses.");
                }
                operatorStack.pop(); // Pop the '('
            } else if (['AND', 'OR', 'XOR'].includes(token)) {
                // It's an operator; push it onto the operator stack.
                // Precedence rules are implicitly handled by the full parenthesization.
                operatorStack.push(token);
            } else { // It's a variable (A-Z)
                if (token === 'X') {
                    // Assign the current test value for 'X'
                    operandStack.push(xValue);
                } else if (fixedVars.has(token)) {
                    // Look up the fixed value for other variables
                    operandStack.push(fixedVars.get(token)!); // '!' asserts non-undefined
                } else {
                    // This error indicates a variable in the formula that is neither 'X' nor fixed.
                    // Problem constraints imply all non-X variables are fixed.
                    throw new Error(`Undefined variable '${token}' encountered in formula.`);
                }
            }
        }

        // After processing all tokens, the operandStack should contain the single final result.
        // The operatorStack should be empty.
        if (operandStack.length !== 1 || operatorStack.length !== 0) {
            throw new Error("Formula evaluation error: Malformed expression or unhandled operators/operands at end.");
        }
        return operandStack[0];
    }

    // Attempt to satisfy the formula by assigning X = TRUE
    const satisfiableWithTrue = evaluate(true);
    if (satisfiableWithTrue) {
        print("Satisfiable");
        return; // Found a satisfying assignment, no need to check X = FALSE
    }

    // If not satisfiable with X = TRUE, attempt with X = FALSE
    const satisfiableWithFalse = evaluate(false);
    if (satisfiableWithFalse) {
        print("Satisfiable");
        return; // Found a satisfying assignment
    }

    // If neither assignment makes the formula true, it is unsatisfiable
    print("Unsatisfiable");
}

// Call the main solve function to run the puzzle logic
solve();