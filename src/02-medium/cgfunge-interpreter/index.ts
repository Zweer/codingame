// For CodinGame, readline and print are global functions.

// Input reading
const N: number = parseInt(readline());
const programLines: string[] = [];
let maxColLength = 0;
for (let i = 0; i < N; i++) {
    const line: string = readline();
    programLines.push(line);
    if (line.length > maxColLength) {
        maxColLength = line.length;
    }
}

// Pad program lines to make it a rectangular grid for toroidal wrapping.
// If a line is shorter than maxColLength, it's padded with spaces.
// Spaces are ignored during execution anyway.
const grid: string[][] = programLines.map(line => {
    return (line + ' '.repeat(maxColLength - line.length)).split('');
});

// Interpreter State
let pc_r: number = 0; // Program Counter row
let pc_c: number = 0; // Program Counter column
let dr: number = 0;   // Direction row change
let dc: number = 1;   // Direction column change (initial: right)
const stack: number[] = [];
let stringMode: boolean = false;
let programRunning: boolean = true;

// Helper function to pop a value from the stack.
// If the stack is empty, it returns 0, as per common Befunge-like behavior.
function popValue(): number {
    return stack.length > 0 ? stack.pop()! : 0;
}

// Helper function to push a value onto the stack.
// Ensures the value is within the [0, 255] range using modulo arithmetic.
// The (+ 256) % 256 part handles potential negative results from the % operator in JavaScript.
function pushValue(val: number) {
    stack.push((val % 256 + 256) % 256);
}

// Helper function to move the Program Counter, applying toroidal wrapping.
function movePC() {
    pc_r = (pc_r + dr + N) % N; // N is the number of rows
    pc_c = (pc_c + dc + maxColLength) % maxColLength; // maxColLength is the effective number of columns
}

// Main execution loop
while (programRunning) {
    const char = grid[pc_r][pc_c];

    let extraMoveForS: boolean = false; // Flag to indicate if 'S' requires an additional PC move

    if (stringMode) {
        if (char === '"') {
            stringMode = false;
        } else {
            pushValue(char.charCodeAt(0));
        }
    } else { // Not in string mode
        if (char === ' ') {
            // Spaces are ignored, simply proceed to next character
        } else if (char === 'E') {
            programRunning = false; // End program
        } else if (char === '>') {
            dr = 0; dc = 1; // Go right
        } else if (char === '<') {
            dr = 0; dc = -1; // Go left
        } else if (char === '^') {
            dr = -1; dc = 0; // Go up
        } else if (char === 'v') {
            dr = 1; dc = 0; // Go down
        } else if (char >= '0' && char <= '9') {
            pushValue(parseInt(char)); // Push digit
        } else if (char === '+') {
            const b = popValue();
            const a = popValue();
            pushValue(a + b);
        } else if (char === '-') {
            const b = popValue(); // Top element is subtracted FROM the second element
            const a = popValue(); // So, a - b
            pushValue(a - b);
        } else if (char === '*') {
            const b = popValue();
            const a = popValue();
            pushValue(a * b);
        } else if (char === 'P') {
            popValue(); // Pop and discard
        } else if (char === 'X') {
            const b = popValue(); // Top
            const a = popValue(); // Second
            pushValue(b); // Push top back (now second)
            pushValue(a); // Push second back (now top)
        } else if (char === 'D') {
            const val = popValue(); // Get top value (or 0 if stack empty)
            pushValue(val);       // Push it back
            pushValue(val);       // Push it again (duplicate)
        } else if (char === '"') {
            stringMode = true; // Enter string mode
        } else if (char === '_') { // Horizontal IF
            const val = popValue();
            if (val === 0) {
                dr = 0; dc = 1; // Go right
            } else {
                dr = 0; dc = -1; // Go left
            }
        } else if (char === '|') { // Vertical IF
            const val = popValue();
            if (val === 0) {
                dr = 1; dc = 0; // Go down
            } else {
                dr = -1; dc = 0; // Go up
            }
        } else if (char === 'I') {
            const val = popValue();
            console.log(val); // Print integer
        } else if (char === 'C') {
            const val = popValue();
            console.log(String.fromCharCode(val)); // Print character from ASCII code
        } else if (char === 'S') {
            extraMoveForS = true; // Flag for an additional PC move
        }
        // Any other characters are implicitly ignored, as per problem description
        // (only specified characters and digits have meaning, spaces are ignored,
        // and string mode handles all characters).
    }

    // Move the Program Counter for the next iteration, unless 'E' was just executed.
    if (programRunning) {
        movePC(); // First move (normal for most commands)
        if (extraMoveForS) {
            movePC(); // Second move for 'S' command
        }
    }
}