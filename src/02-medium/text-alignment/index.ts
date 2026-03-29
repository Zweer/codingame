// The 'readline()' function is provided by the CodinGame platform.
// For local development, you might need to mock it or provide input differently.
declare function readline(): string;

/**
 * Solves the Text Alignment puzzle.
 */
function solve() {
    // Read the requested alignment type
    const alignment: string = readline();

    // Read the number of text lines
    const N: number = parseInt(readline());

    const inputLines: string[] = [];
    let maxWidth: number = 0;

    // Read all text lines and simultaneously determine the maximum line width.
    for (let i = 0; i < N; i++) {
        const line = readline();
        inputLines.push(line);
        if (line.length > maxWidth) {
            maxWidth = line.length;
        }
    }

    // Process each line according to the determined alignment and maxWidth.
    for (let i = 0; i < N; i++) {
        const currentLine: string = inputLines[i];
        const currentLength: number = currentLine.length;
        // Calculate the total number of spaces needed to pad the current line to maxWidth.
        const paddingNeeded: number = maxWidth - currentLength;

        switch (alignment) {
            case "LEFT":
                // For LEFT alignment, simply print the line as-is.
                // The problem states "Do NOT print trailing whitespace".
                console.log(currentLine);
                break;

            case "RIGHT":
                // For RIGHT alignment, prepend the necessary number of spaces.
                console.log(' '.repeat(paddingNeeded) + currentLine);
                break;

            case "CENTER":
                // For CENTER alignment, calculate spaces for the left side.
                // "If the number of remaining spaces is odd, leave the extra space on the right.
                // Don't actually append space characters to the end of the line, though."
                // This implies only left padding is explicitly added.
                const leftSpaces: number = Math.floor(paddingNeeded / 2);
                console.log(' '.repeat(leftSpaces) + currentLine);
                break;

            case "JUSTIFY":
                const words: string[] = currentLine.split(' ');

                if (words.length === 1) {
                    // Single word lines are left-aligned as per problem description.
                    console.log(currentLine);
                } else {
                    const numGaps: number = words.length - 1;
                    // These `totalAdditionalSpaces` are distributed *between* words,
                    // in addition to the single space already separating them.
                    const totalAdditionalSpaces: number = paddingNeeded;

                    // Calculate the base number of additional spaces for each gap.
                    const baseAdditionalSpacesPerGap: number = Math.floor(totalAdditionalSpaces / numGaps);
                    // Calculate how many gaps will receive one extra space (from left to right).
                    let remainingExtraSpaces: number = totalAdditionalSpaces % numGaps;

                    let justifiedLine: string = words[0]; // Start with the first word

                    // Iterate through the gaps between words.
                    for (let j = 0; j < numGaps; j++) {
                        let currentGapAdditionalSpaces: number = baseAdditionalSpacesPerGap;
                        // Distribute the remaining extra spaces.
                        if (remainingExtraSpaces > 0) {
                            currentGapAdditionalSpaces++;
                            remainingExtraSpaces--;
                        }
                        // Append the required spaces (original 1 space + additional calculated spaces)
                        // and the next word.
                        justifiedLine += ' '.repeat(1 + currentGapAdditionalSpaces) + words[j + 1];
                    }
                    console.log(justifiedLine);
                }
                break;

            default:
                // This case should not be reached given the problem constraints on alignment types.
                break;
        }
    }
}

// Call the solve function to execute the program logic.
solve();