/**
 * Reads a line from standard input. In CodinGame, this function is usually provided globally.
 */
declare function readline(): string;

function solve() {
    // Read the original number R from the first line of input
    const R: number = parseInt(readline());
    // Read the target line L from the second line of input
    const L: number = parseInt(readline());

    // Initialize the current line of the Conway sequence.
    // It starts with the original number R as a single element in an array.
    let currentLine: number[] = [R];

    // Generate subsequent lines until we reach the L-th line.
    // The loop starts from line 2 because line 1 is already initialized.
    for (let lineNum = 2; lineNum <= L; lineNum++) {
        const nextLine: number[] = []; // This array will store the elements of the next generated line
        let i = 0; // Pointer to iterate through the currentLine array

        // Iterate through the currentLine to describe it and build the nextLine
        while (i < currentLine.length) {
            const currentNumber = currentLine[i]; // Get the number we are currently analyzing
            let count = 0; // Initialize a counter for consecutive occurrences of currentNumber

            // Use an inner pointer 'j' to count consecutive occurrences of 'currentNumber'
            let j = i; 
            while (j < currentLine.length && currentLine[j] === currentNumber) {
                count++; // Increment count for each consecutive occurrence
                j++;     // Move to the next element
            }

            // After counting, add the count and the number itself to the nextLine
            nextLine.push(count);
            nextLine.push(currentNumber);

            // Move the main pointer 'i' to the position where the new distinct number starts (or end of line)
            i = j;
        }

        // The newly generated line becomes the currentLine for the next iteration
        currentLine = nextLine;
    }

    // After generating all L lines, print the elements of the final currentLine,
    // separated by spaces, as required by the puzzle.
    console.log(currentLine.join(' '));
}

// Execute the solver function to start the program
solve();