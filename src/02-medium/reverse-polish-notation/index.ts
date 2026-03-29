// The `readline()` function is provided by the CodinGame platform.
// This is a placeholder for local development.
declare function readline(): string;

// Function to print to stdout.
// This is a placeholder for local development.
declare function print(message: any): void;


// --- Start of actual solution code ---

// Stack to store numbers
let stack: number[] = [];

// Flag to track if an error has occurred
let errorOccurred: boolean = false;

// Read the number of instructions (N), though not directly used in logic,
// it's part of the input protocol.
const N: number = parseInt(readline(), 10);

// Read the instructions line and split it into individual tokens
const instructions: string[] = readline().split(' ');

// Iterate through each instruction token
for (let i = 0; i < instructions.length; i++) {
    // If an error has already occurred, stop processing further instructions
    // but continue reading input if necessary (though 'break' here handles it for single-line input).
    if (errorOccurred) {
        break;
    }

    const instruction: string = instructions[i];
    const numValue: number = parseInt(instruction, 10);

    // Check if the token is a number
    if (!isNaN(numValue)) {
        // If it's a number, push it onto the stack
        stack.push(numValue);
    } else {
        // It's an operator or stack manipulation command
        switch (instruction) {
            case 'ADD':
            case 'SUB':
            case 'MUL':
            case 'DIV':
            case 'MOD':
                // Binary operations require at least two operands
                if (stack.length < 2) {
                    errorOccurred = true;
                    break; // Exit switch and main loop
                }
                const b: number = stack.pop()!; // Pop top element (second operand)
                const a: number = stack.pop()!; // Pop next element (first operand)

                // Check for division by zero for DIV and MOD operations
                if ((instruction === 'DIV' || instruction === 'MOD') && b === 0) {
                    errorOccurred = true;
                    break; // Exit switch and main loop
                }

                let result: number;
                switch (instruction) {
                    case 'ADD': result = a + b; break;
                    case 'SUB': result = a - b; break;
                    case 'MUL': result = a * b; break;
                    case 'DIV': result = Math.trunc(a / b); break; // Integer division
                    case 'MOD': result = a % b; break;
                    default: result = 0; break; // Should not happen with valid input
                }
                stack.push(result);
                break;

            case 'POP':
                // POP requires at least one operand
                if (stack.length < 1) {
                    errorOccurred = true;
                    break;
                }
                stack.pop();
                break;

            case 'DUP':
                // DUP requires at least one operand
                if (stack.length < 1) {
                    errorOccurred = true;
                    break;
                }
                stack.push(stack[stack.length - 1]); // Duplicate the top element
                break;

            case 'SWP':
                // SWP requires at least two operands
                if (stack.length < 2) {
                    errorOccurred = true;
                    break;
                }
                const val2: number = stack.pop()!; // Top element
                const val1: number = stack.pop()!; // Second from top element
                stack.push(val2); // Push val2 back first
                stack.push(val1); // Then push val1
                break;

            case 'ROL':
                // ROL expects the 'N' value on top of the stack first
                if (stack.length < 1) {
                    errorOccurred = true;
                    break; // Exit switch and main loop
                }
                const N_rol: number = stack.pop()!; // Pop the 'N' value for ROL

                // Validate N_rol: must be a positive integer and not exceed the remaining stack size.
                // N_rol refers to the Nth element *from the top of the remaining stack* (after X itself is popped).
                if (N_rol <= 0 || N_rol > stack.length) {
                    errorOccurred = true;
                    break; // Exit switch and main loop
                }
                
                // Calculate the 0-indexed position from the bottom of the stack
                // Example: If stack is [1, 2, 3, 4] (bottom to top) and N_rol = 3.
                // 1st from top: 4 (at index 3)
                // 2nd from top: 3 (at index 2)
                // 3rd from top: 2 (at index 1)
                // The index is `stack.length - N_rol`. For the example: 4 - 3 = 1.
                const elementToMoveIndex: number = stack.length - N_rol;
                
                // Use splice to remove the element at the calculated index and get it
                const elementToMove: number = stack.splice(elementToMoveIndex, 1)[0];
                
                // Push the removed element to the top of the stack
                stack.push(elementToMove);
                break;

            // No default case needed as problem implies only valid instructions will be given.
        }
    }
}

// Output the final state of the stack or an error message
if (errorOccurred) {
    // Print the stack state just before the error occurred, followed by " ERROR"
    print(stack.join(' ') + " ERROR");
} else {
    // Print the final stack
    print(stack.join(' '));
}

// --- End of actual solution code ---