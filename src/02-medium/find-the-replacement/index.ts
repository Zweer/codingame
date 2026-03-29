// Read the input strings X and Y
const X: string = readline();
const Y: string = readline();

// Map to store the character replacements: FROM character -> TO character
const replacements = new Map<string, string>();

// Set to store the unique FROM characters in the order they first appear in X.
// This is used to ensure the output order requirement.
const uniqueFromCharsInOrder = new Set<string>();

// Flag to track if a conflicting mapping is found, making transformation impossible.
let possible = true;

// Iterate through the strings character by character
for (let i = 0; i < X.length; i++) {
    const charX = X[i];
    const charY = Y[i];

    // Check if charX has already been mapped
    if (replacements.has(charX)) {
        // If charX is already mapped, check for consistency
        if (replacements.get(charX) !== charY) {
            // Conflict found: charX maps to different characters.
            possible = false;
            break; // No need to continue, transformation is impossible.
        }
    } else {
        // This is a new mapping for charX. Store it.
        replacements.set(charX, charY);
        // Add charX to the set to preserve its first appearance order.
        uniqueFromCharsInOrder.add(charX);
    }
}

// Determine the output based on the processing result
if (!possible) {
    // If a conflict was found, print CAN'T
    console.log("CAN'T");
} else if (X === Y) {
    // If X and Y are identical, no replacements are needed
    console.log("NONE");
} else {
    // Collect all valid replacement lines
    const outputLines: string[] = [];
    
    // Iterate through the unique FROM characters in their appearance order
    for (const fromChar of uniqueFromCharsInOrder) {
        // Retrieve the TO character for the current FROM character
        const toChar = replacements.get(fromChar)!; // '!' asserts that value exists, which it must.

        // Only add replacements where the character actually changes
        if (fromChar !== toChar) {
            outputLines.push(`${fromChar}->${toChar}`);
        }
    }

    // Print each collected replacement line
    outputLines.forEach(line => console.log(line));
}