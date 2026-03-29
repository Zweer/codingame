/**
 * Reads a line from standard input. In a CodinGame environment, this is provided.
 * For local testing, you might need to declare it or mock it.
 */
declare function readline(): string;

/**
 * Prints a message to standard output, followed by a newline. In a CodinGame environment, this is provided.
 * For local testing, you might need to declare it or replace it with console.log.
 */
declare function print(message: string): void;

function solve() {
    const N: number = parseInt(readline());

    // Iterate through all 2*N lines of the Triforce
    for (let i = 0; i < 2 * N; i++) {
        let line = '';

        if (i < N) {
            // This is part of the top triangle (first N lines)
            const numStars = 2 * i + 1;
            
            // Calculate the number of leading spaces for the top triangle.
            // This formula is derived from observed patterns in N=1 and N=5 examples,
            // representing the horizontal positioning of the top triangle's stars.
            const leadingSpaces = (2 * N - 1) - i;

            line = ' '.repeat(leadingSpaces) + '*'.repeat(numStars);

            // Special handling for the very first line (i=0) to place the '.'
            // The '.' takes the place of the first character (which is a space).
            if (i === 0) {
                line = '.' + line.substring(1);
            }
        } else {
            // This is part of the bottom two triangles (next N lines)
            const j = i - N; // 0-indexed line number within the bottom section (0 to N-1)
            const numStars = 2 * j + 1;

            // Calculate leading spaces for the leftmost bottom triangle.
            // This is derived from observed patterns in N=1 and N=5 examples,
            // representing the leftmost alignment of the bottom triangles.
            const leftTriangleLeadingSpaces = (N - 1) - j;

            // Calculate the gap between the two bottom triangles.
            // This gap narrows as 'j' increases. The formula is consistent across N=1 and N=5 examples.
            // It's essentially 2 times the leading spaces of a single N-triangle's line 'j', plus 1 for the minimum gap.
            const gapSpaces = 2 * ((N - 1) - j) + 1;

            line = ' '.repeat(leftTriangleLeadingSpaces) +
                   '*'.repeat(numStars) +
                   ' '.repeat(gapSpaces) +
                   '*'.repeat(numStars);
        }
        print(line);
    }
}

// Call the solve function to execute the puzzle logic.
solve();