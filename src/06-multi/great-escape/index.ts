/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

/**
 * Main execution block for the puzzle.
 */
function solve() {
    // Read the number N (though not strictly necessary for the sum itself, as we'll process all numbers on the next line)
    // const N: number = parseInt(readline());

    // Read the line containing the N integers
    const numbersLine: string = readline();

    // Split the line by spaces, convert each part to an integer, and store them in an array
    const numbers: number[] = numbersLine.split(' ').map(Number); // Using Number as a shorthand for parseInt

    // Calculate the sum of all numbers using the reduce method
    const sum: number = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Print the final sum
    console.log(sum);
}

// Call the solve function to execute the logic
solve();