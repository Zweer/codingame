/**
 * Reads a line of input from stdin. In a CodinGame environment, this is usually provided.
 * For local testing, you might need to mock this function.
 */
declare function readline(): string;

/**
 * Parses a string to an integer.
 */
declare function parseInt(s: string): number;

/**
 * Outputs a value to stdout.
 */
declare function console: {
    log(message?: any, ...optionalParams: any[]): void;
};

// Read the number of stock values available.
const n: number = parseInt(readline());

// Read the stock values as a string, split by space, and convert to numbers.
const values: number[] = readline().split(' ').map(Number);

// Initialize maxLoss to 0. This is because if no actual loss occurs,
// the problem states the loss should be 0. We're looking for the most negative
// difference possible.
let maxLoss: number = 0;

// Initialize maxPriceSoFar with the first stock value.
// This represents the highest price encountered up to the current point
// from which a purchase could have been made to result in a future loss.
let maxPriceSoFar: number = values[0];

// Iterate through the stock values starting from the second value (index 1).
// We need at least two points (t0 and t1) for a transaction where t1 > t0.
for (let i = 1; i < n; i++) {
    const currentValue = values[i];

    // Calculate the potential loss if we bought at maxPriceSoFar and sold at currentValue.
    // A loss is indicated by a negative result.
    const currentLoss = currentValue - maxPriceSoFar;

    // Update maxLoss: We want the "largest loss", which means the most negative value.
    // So, we use Math.min to keep track of the smallest (most negative) difference found.
    maxLoss = Math.min(maxLoss, currentLoss);

    // Update maxPriceSoFar: If the currentValue is higher than the maxPriceSoFar,
    // then this currentValue becomes our new highest price seen so far.
    // This is important because any *future* loss will be maximized if bought at the highest
    // possible price *before* or *at* that future point.
    maxPriceSoFar = Math.max(maxPriceSoFar, currentValue);
}

// Output the maximal loss found.
console.log(maxLoss);