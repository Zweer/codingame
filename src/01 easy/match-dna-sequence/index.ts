// Declare the readline function, common in CodinGame environments.
// If running locally, you might need to provide an implementation, e//g., using Node.js's 'readline' module.
declare function readline(): string;

function solve() {
    // Read the maximum allowed differences (delta)
    const delta: number = parseInt(readline());

    // Read the gene sequence to search for
    const gene: string = readline();

    // Read the number of chromosome sequences (n)
    const n: number = parseInt(readline());

    // Flag to indicate if a valid match has been found.
    // We set this to true and break loops as soon as the first match is found.
    let foundMatch = false;

    // Loop through each chromosome (chr) sequence
    for (let i = 0; i < n; i++) {
        // Read the current chr sequence
        const chr: string = readline();

        // Calculate the maximum possible starting index for the gene within the current chr.
        // The gene length is 42, and chr length is 128.
        // So, the gene can start from index 0 up to (128 - 42) = 86.
        // If it starts at index 86, it covers characters chr[86] through chr[127],
        // which is exactly 42 characters and fits within chr's bounds.
        const maxStartIndex = chr.length - gene.length;

        // Loop through all possible starting positions (j) for the gene within the current chr
        for (let j = 0; j <= maxStartIndex; j++) {
            let currentDifferences = 0; // Initialize difference count for the current match attempt

            // Compare the gene character by character with the corresponding substring of chr
            for (let k = 0; k < gene.length; k++) {
                // If a character in gene does not match the character in chr at the aligned position,
                // increment the difference count.
                if (gene[k] !== chr[j + k]) {
                    currentDifferences++;
                }

                // Optimization: If the number of differences exceeds the allowed delta,
                // this starting position is not a valid match. We can stop checking
                // further characters for this position and move to the next 'j'.
                if (currentDifferences > delta) {
                    break; // Exit the inner 'k' loop
                }
            }

            // After comparing the entire gene (or breaking early due to exceeding delta),
            // check if the `currentDifferences` is within the allowed `delta`.
            if (currentDifferences <= delta) {
                // A valid match has been found.
                // According to the problem, we need to output the *first* such match:
                // first by chromosome index (i), then by starting index (j) within that chromosome.
                // Our nested loops naturally iterate in this desired order.
                console.log(`${i} ${j} ${currentDifferences}`);
                foundMatch = true; // Set the flag to true
                break; // Exit the 'j' loop (inner loop) as we found the required match for this chr
            }
        }

        // If a match was found in the current chr, we don't need to check any further chrs.
        // Break from the 'i' loop (outer loop) as we've found the overall first match.
        if (foundMatch) {
            break;
        }
    }

    // If the loop completes and `foundMatch` is still false, it means no valid match was found.
    if (!foundMatch) {
        console.log("NONE");
    }
}

// Call the solve function to execute the program logic.
solve();