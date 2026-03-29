/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

/**
 * Writes a message to standard output.
 * In a CodinGame environment, console.log is generally available.
 */
declare function console.log(message: any): void;

/**
 * Solves the Ted's compiler puzzle.
 */
function solve(): void {
    const line: string = readline();

    let maxValidLength: number = 0;
    let currentBalance: number = 0;

    for (let i = 0; i < line.length; i++) {
        const char: string = line[i];

        if (char === '<') {
            currentBalance++;
        } else if (char === '>') {
            currentBalance--;
        }

        // Rule 2 check: A '>' must exactly match a '<'. If balance drops below zero,
        // it means we have an unmatched '>', making the current prefix invalid.
        // Any longer prefix starting from the beginning will also be invalid.
        if (currentBalance < 0) {
            // We can stop processing, as no further character will make this prefix (starting from index 0) valid.
            // The 'maxValidLength' will retain the value of the longest valid prefix found before this point, or 0.
            break;
        } 
        
        // Rule 1 & 2 check (combined): A '<' must have a matching '>', and all are matched.
        // If balance is zero, it means we found a perfectly balanced sub-expression from the start.
        // This is a candidate for the longest valid prefix.
        else if (currentBalance === 0) {
            maxValidLength = Math.max(maxValidLength, i + 1);
        }
        
        // If currentBalance > 0, it means we have unclosed '<' characters.
        // This is a valid intermediate state for a prefix, so we continue.
    }

    console.log(maxValidLength);
}

// Call the solve function to execute the program logic.
solve();