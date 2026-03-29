// Read N, the number of CGS lines
const N: number = parseInt(readline());

// Read all CGS content lines into an array
let rawCGS: string[] = [];
for (let i = 0; i < N; i++) {
    rawCGS.push(readline());
}

// --- Phase 1: Combine lines and remove whitespace outside of quotes ---

// Join all lines into a single string
let combinedContent: string = rawCGS.join('');

// This string will hold the content after whitespace removal
let minifiedContentStage1: string = '';

// Flag to track if we are currently inside a string literal (between apostrophes)
let inQuote: boolean = false;

// Iterate through the combined content character by character
for (let i = 0; i < combinedContent.length; i++) {
    const char = combinedContent[i];

    if (char === "'") {
        // If an apostrophe is encountered, toggle the inQuote flag
        inQuote = !inQuote;
        // Always add the apostrophe itself to the minified content
        minifiedContentStage1 += char;
    } else if (inQuote) {
        // If we are inside a quote, preserve all characters (including spaces/tabs)
        minifiedContentStage1 += char;
    } else {
        // If we are outside a quote, remove spaces, tabs, newlines, and carriage returns
        if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
            minifiedContentStage1 += char;
        }
    }
}

// --- Phase 2: Minify variables ---

// Map to store original variable names to their new minified names
const variableMap: Map<string, string> = new Map();

// Character code for generating sequential variable names ('a', 'b', 'c', ...)
let nextVarCharCode: number = 'a'.charCodeAt(0);

// Use a regex to find all variable occurrences ($variableName$)
// The capture group (1) `([a-zA-Z0-9_]+)` extracts the variable name without the dollar signs.
// The 'g' flag ensures that all occurrences are replaced.
const finalMinifiedContent = minifiedContentStage1.replace(/\$([a-zA-Z0-9_]+)\$/g, (match, varName) => {
    // Check if this variable name has already been assigned a minified name
    if (!variableMap.has(varName)) {
        // If it's a new variable, assign it the next available minified name
        const newMinifiedName = String.fromCharCode(nextVarCharCode);
        variableMap.set(varName, newMinifiedName);
        nextVarCharCode++; // Increment to get the next character for the next unique variable
    }
    // Return the minified variable name, re-adding the dollar signs
    return '$' + variableMap.get(varName) + '$';
});

// Output the final minified content
console.log(finalMinifiedContent);