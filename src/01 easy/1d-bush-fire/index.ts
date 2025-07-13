/**
 * Reads a line from standard input. In CodinGame's environment, this function
 * is typically provided globally. For local development, you might need to mock it.
 */
declare function readline(): string;

/**
 * Solves the 1D Bush Fire puzzle.
 * Reads the input according to the problem description and prints the minimum
 * number of water drops required for each test case.
 */
function solve(): void {
    // Read the number of test cases
    const N: number = parseInt(readline());

    // Process each test case
    for (let i = 0; i < N; i++) {
        // Read the current bushland strip status
        const line: string = readline();
        let drops: number = 0;
        let j: number = 0; // Current 0-indexed position in the strip

        // Iterate through the strip
        while (j < line.length) {
            // If fire is found at the current position 'j'
            if (line[j] === 'f') {
                // A drop is needed. Increment the counter.
                drops++;

                // To minimize total drops, we place a water drop that covers
                // the current fire at 'j' and extends its coverage as far right as possible.
                // A drop targeted at cell 'X' (0-indexed) covers cells X-1, X, X+1.
                // Targeting the drop at 'j+1' (0-indexed) covers cells 'j', 'j+1', and 'j+2'.
                // These three cells are now extinguished.
                // So, we can safely advance our pointer to check for the next fire
                // starting from 'j+3'.
                j += 3;
            } else {
                // No fire at the current position, simply move to the next cell.
                j++;
            }
        }
        // Print the total number of drops required for this test case
        console.log(drops);
    }
}

// Call the solve function to execute the program logic
solve();