// The 'readline' and 'print' functions are provided by the CodinGame environment.
// For local development, you might mock them or use Node.js 'fs' module.
// declare function readline(): string;
// declare function print(message: any): void;

// Read the total number of lines in the template
const N: number = parseInt(readline());

let fullTemplate: string = "";
// Read all lines of the template and concatenate them into a single string.
// Add a newline character between lines, as readline() typically strips it
// and the problem example implies newlines should be preserved between original lines.
for (let i = 0; i < N; i++) {
    fullTemplate += readline();
    if (i < N - 1) { // Add newline for all but the last line
        fullTemplate += "\n";
    }
}

// Initialize a counter for the choice index.
// This determines which clause to pick based on the puzzle's "JBM level-0 twister" rule.
let choiceCounter: number = 0;

// Regular expression to find all choice blocks:
// \( : matches a literal opening parenthesis
// (   ) : creates a capturing group for the content inside parentheses
// [^)]* : matches any character that is NOT a closing parenthesis, zero or more times
// \) : matches a literal closing parenthesis
// g : global flag ensures that all occurrences are matched, not just the first one
const CHOICE_REGEX = /\(([^)]*)\)/g;

// Use String.prototype.replace() with a replacer function.
// The replacer function is called for each match found by the regex.
// - 'match': The full matched string (e.g., "(first|second|third)")
// - 'p1': The content captured by the first group (e.g., "first|second|third")
const expandedEmail: string = fullTemplate.replace(CHOICE_REGEX, (match: string, p1: string): string => {
    // Split the captured content by '|' to get an array of individual clauses.
    const clauses: string[] = p1.split('|');

    // Calculate the index of the clause to pick based on the current choiceCounter.
    // The modulo operator (%) ensures the index wraps around if it exceeds the number of clauses.
    const selectedIndex: number = choiceCounter % clauses.length;

    // Increment the choice counter for the next choice block.
    choiceCounter++;

    // Return the selected clause, which will replace the original parenthesized block.
    return clauses[selectedIndex];
});

// Print the final expanded email.
print(expandedEmail);