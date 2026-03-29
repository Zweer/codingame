/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is usually provided.
 */
declare function readline(): string;

/**
 * Prints a string to standard output.
 * In a CodinGame environment, this function is usually provided.
 */
declare function print(message: string): void;

// Read H, the number of lines in the map
const H: number = parseInt(readline());

// Read the map lines into an array of strings
const map: string[] = [];
for (let i = 0; i < H; i++) {
    map.push(readline());
}

let isStable: boolean = true;
const width: number = H * 2; // The width of the map is H * 2

// Iterate through each cell of the map, row by row, column by column
for (let r = 0; r < H; r++) { // Iterate through rows (r from 0 to H-1)
    const currentRow = map[r];

    for (let c = 0; c < width; c++) { // Iterate through columns (c from 0 to width-1)
        const card = currentRow[c];

        // If the current cell is a dot ('.'), it's empty space and doesn't need stability checks.
        // Skip to the next cell.
        if (card === '.') {
            continue;
        }

        // --- Horizontal Stability Checks ---

        // Rule 1: ".\ " is UNSTABLE
        // If a '\' card is at column 0 or has a '.' immediately to its left, it's unstable.
        // This means it's a '\' card without a '/' card to its left.
        if (card === '\\') {
            if (c === 0 || currentRow[c - 1] === '.') {
                isStable = false;
                break; // Found instability, no need to check further
            }
        }

        // Rule 2: "/." is UNSTABLE
        // If a '/' card is at the last column or has a '.' immediately to its right, it's unstable.
        // This means it's a '/' card without a '\' card to its right.
        if (card === '/') {
            if (c === width - 1 || currentRow[c + 1] === '.') {
                isStable = false;
                break; // Found instability, no need to check further
            }
        }

        // Rule 3: Two cards side by side have the same orientation ("//" or "\\") is UNSTABLE
        // This interprets the rule as two adjacent cards leaning in the same direction are unstable.
        // (e.g., "//" or "\\"). The example confirms that "/\" is a stable pattern.
        if (card === '/') {
            // Check if there's another '/' immediately to its right
            if (c < width - 1 && currentRow[c + 1] === '/') {
                isStable = false;
                break; // Found instability
            }
        } else if (card === '\\') { // The current card is '\'
            // Check if there's another '\' immediately to its left
            if (c > 0 && currentRow[c - 1] === '\\') {
                isStable = false;
                break; // Found instability
            }
        }
        
        // --- Vertical Stability Checks ---

        // These checks only apply if the current card is not on the bottom row (ground).
        if (r < H - 1) {
            const cardBelow = map[r + 1][c]; // Get the character directly below the current card

            // Rule 4: "Neither another card nor the ground are below (aka. a "flying card")"
            // If the spot directly below the card is empty ('.'), the card is flying.
            if (cardBelow === '.') {
                isStable = false;
                break; // Found instability
            }
            
            // Rule 5: "The card below has the same orientation"
            // A card cannot be stable if the card directly below it has the same orientation.
            // E.g., '/' on top of '/' or '\' on top of '\' is unstable.
            if (card === cardBelow) {
                isStable = false;
                break; // Found instability
            }
        }
    }
    
    // If instability was found in the inner (column) loop, break the outer (row) loop as well.
    if (!isStable) {
        break; 
    }
}

// Output the final result based on the stability check
if (isStable) {
    print("STABLE");
} else {
    print("UNSTABLE");
}