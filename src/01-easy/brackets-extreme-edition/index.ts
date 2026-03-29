/**
 * Determines whether a given expression has valid brackets.
 * This means all parentheses (), square brackets [], and curly brackets {}
 * must be correctly paired and nested.
 * The expression does not contain whitespace characters and only contains bracket characters.
 */
function solve(): void {
    // Read the input expression from CodinGame's standard input.
    const expression: string = readline();

    // Initialize an empty stack to keep track of opening brackets.
    // We use a string array as a stack, leveraging push() and pop().
    const stack: string[] = [];

    // Define a Set for quick lookup of opening brackets.
    const openingBrackets = new Set<string>(['(', '[', '{']);

    // Define a Map to quickly get the matching opening bracket for any closing bracket.
    const matchingBrackets = new Map<string, string>([
        [')', '('], // Closing parenthesis ')' expects an opening parenthesis '('
        [']', '['], // Closing square bracket ']' expects an opening square bracket '['
        ['}', '{']  // Closing curly bracket '}' expects an opening curly bracket '{'
    ]);

    // Iterate through each character of the input expression.
    for (const char of expression) {
        if (openingBrackets.has(char)) {
            // If the current character is an opening bracket, push it onto the stack.
            // It's waiting for its corresponding closing bracket.
            stack.push(char);
        } else if (matchingBrackets.has(char)) {
            // If the current character is a closing bracket:

            // 1. Check if the stack is empty.
            // If it is, it means we've encountered a closing bracket without any preceding
            // opening bracket to match it (e.g., ")}"). This makes the expression invalid.
            if (stack.length === 0) {
                console.log('false');
                return; // Exit the function early.
            }

            // 2. Pop the most recently added opening bracket from the stack.
            const lastOpenBracket = stack.pop();

            // 3. Compare the popped opening bracket with the expected opening bracket for the current closing character.
            // The `matchingBrackets.get(char)` gives us the required opening bracket type.
            if (lastOpenBracket !== matchingBrackets.get(char)) {
                // If they don't match (e.g., we popped '[' but the current char is ')'),
                // it means there's a type mismatch or incorrect nesting (e.g., "([)]").
                // This makes the expression invalid.
                console.log('false');
                return; // Exit the function early.
            }
        }
        // According to the problem description, the expression only contains bracket characters.
        // Therefore, no other character types need to be handled.
    }

    // After iterating through the entire expression:
    // If the stack is empty, it means every opening bracket found its corresponding
    // closing bracket, and all pairs were correctly nested. The expression is valid.
    if (stack.length === 0) {
        console.log('true');
    } else {
        // If the stack is not empty, it means there are one or more opening brackets
        // that never found their corresponding closing brackets (e.g., "({)").
        // This makes the expression invalid.
        console.log('false');
    }
}

// Call the solve function to execute the bracket validation logic.
solve();