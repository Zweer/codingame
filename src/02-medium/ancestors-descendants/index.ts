/**
 * The solution for the CodinGame puzzle "Ancestors & Descendants".
 * This TypeScript code reads family member data from standard input,
 * determines ancestor-descendant relationships based on leading dots,
 * and prints out full descent paths.
 */

// These functions are provided by the CodinGame environment
// For local testing, you might need to mock them or provide a dummy implementation.
declare function readline(): string;
declare function print(s: string): void;

function solve() {
    // Read the total number of family members.
    const N: number = parseInt(readline());

    // currentAncestors stores the names of the active ancestors in the current branch.
    // currentAncestors[k] holds the name of the person at level 'k' (k dots).
    // The array's length indicates the current depth of the active path.
    const currentAncestors: string[] = [];

    // outputBuffer collects all the complete family descendant paths before printing them.
    const outputBuffer: string[] = [];

    // Process each family member line.
    for (let i = 0; i < N; i++) {
        const line: string = readline();

        // Calculate the level (number of leading dots).
        let level = 0;
        while (line.charAt(level) === '.') {
            level++;
        }

        // Extract the name by removing the leading dots.
        const name = line.substring(level);

        // Logic to determine if a previous path is now complete:
        // If there's an active path (currentAncestors is not empty) AND
        // the current person's level is less than or equal to the deepest level
        // of the current active path (currentAncestors.length - 1).
        // This signifies that the person at currentAncestors[currentAncestors.length - 1]
        // does not have a child following them in the sequence from the input.
        if (currentAncestors.length > 0 && level <= currentAncestors.length - 1) {
            // The path to be completed and stored is the entire currentAncestors array.
            // We use slice() to create a copy before joining, to avoid modifying the original array reference.
            const pathToPrint = currentAncestors.slice().join(" > ");
            outputBuffer.push(pathToPrint);

            // Now, truncate currentAncestors to the level of the current person.
            // This effectively "pops" off any deeper ancestors from previous branches
            // that are no longer part of the active path.
            currentAncestors.length = level;
        }

        // Add the current person to the currentAncestors array at their respective level.
        // If 'level' is equal to currentAncestors.length, it extends the array.
        // If 'level' is less than currentAncestors.length, it overwrites an existing entry (sibling).
        currentAncestors[level] = name;
        
        // Ensure the array's effective length matches the current deepest active ancestor.
        // This is crucial if a person at a lower level (e.g., 'd' after 'a > b > c')
        // effectively shortens the array.
        currentAncestors.length = level + 1;
    }

    // After processing all input lines, there might be one last active path
    // that needs to be printed (e.g., the last person in the input if they have no children).
    if (currentAncestors.length > 0) {
        const pathToPrint = currentAncestors.join(" > ");
        outputBuffer.push(pathToPrint);
    }

    // Print all collected paths, each on a new line.
    outputBuffer.forEach(path => print(path));
}

// Call the solve function to run the puzzle logic.
solve();