// Standard input reading for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Read the Wolfram code (R)
const R: number = parseInt(readline());
// Read the number of generations (N) to output
const N: number = parseInt(readline());
// Read the initial pattern string
const initialPatternString: string = readline();

// Convert the initial pattern string into an array of 0s and 1s
// '@' becomes 1, '.' becomes 0
let currentPattern: number[] = initialPatternString.split('').map(char => char === '@' ? 1 : 0);
const patternLength: number = currentPattern.length;

// Loop N times to simulate and print each generation
for (let generation = 0; generation < N; generation++) {
    // Print the current generation by converting the array of 0s/1s back to '@'/'.' string
    console.log(currentPattern.map(bit => bit === 1 ? '@' : '.').join(''));

    // Create a new array to store the next generation's state
    const nextPattern: number[] = new Array(patternLength);

    // Calculate the state of each cell for the next generation
    for (let i = 0; i < patternLength; i++) {
        // Determine the indices of the left and right neighbors, handling wrapping
        const leftNeighborIndex = (i - 1 + patternLength) % patternLength;
        const rightNeighborIndex = (i + 1) % patternLength;

        // Get the values of the left, current, and right cells
        const leftValue = currentPattern[leftNeighborIndex];
        const currentValue = currentPattern[i];
        const rightValue = currentPattern[rightNeighborIndex];

        // Form the 3-bit neighborhood value (LCR)
        // This value ranges from 0 (000) to 7 (111)
        const neighborhoodValue = (leftValue * 4) + (currentValue * 2) + (rightValue * 1);

        // Determine the next state based on the Wolfram rule R
        // The 'neighborhoodValue' is used as the bit index (from right, 0-indexed) in R.
        // (R >> neighborhoodValue) shifts the relevant bit to the 0th position.
        // & 1 extracts that bit (0 or 1).
        const nextState = (R >> neighborhoodValue) & 1;

        // Store the calculated next state
        nextPattern[i] = nextState;
    }

    // Update the current pattern to the newly calculated next pattern for the next iteration
    currentPattern = nextPattern;
}