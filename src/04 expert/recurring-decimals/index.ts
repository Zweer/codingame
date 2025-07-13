/**
 * Reads a line from standard input.
 * In a real CodinGame environment, `readline()` is globally available.
 * For local development, this declaration helps with type checking.
 */
declare function readline(): string;

/**
 * Solves the Recurring Decimals puzzle.
 * Computes 1/N in decimal form, with repeating parts enclosed in parentheses.
 */
function solve(): void {
    const N: number = parseInt(readline());

    // Initialize variables for the long division simulation
    // `numerator` represents the current "dividend" in the long division process.
    // Initially, it's 1 for 1/N. In subsequent steps, it's the remainder * 10.
    let numerator = 1; 

    // `decimalDigits` stores the sequence of digits after the decimal point.
    let decimalDigits: number[] = [];

    // `remainderToIndex` maps a remainder value to the index in `decimalDigits`
    // where that remainder first occurred. This is crucial for detecting cycles.
    // Example: { 1: 0 } means remainder 1 was encountered when the first decimal digit was computed.
    let remainderToIndex = new Map<number, number>(); 

    // `currentPosition` tracks the current length of `decimalDigits`,
    // which is also the index for the next digit to be added.
    let currentPosition = 0; 

    // Flags to determine if a repeating part was found and where it starts.
    let isRepeating = false;
    let repeatStartIndex = -1; 

    // Simulate the long division process
    while (true) {
        // The `numerator` at the start of an iteration is effectively the remainder
        // from the previous step before it was multiplied by 10.
        // We check this value to see if it causes a repeat.
        const remainderToCheckForCycle = numerator;

        // Condition 1: Decimal terminates if the remainder is 0.
        if (remainderToCheckForCycle === 0) {
            break; 
        }

        // Condition 2: A repeating cycle is detected if this remainder has been seen before.
        if (remainderToIndex.has(remainderToCheckForCycle)) {
            isRepeating = true;
            // Get the starting index of the repeating block
            repeatStartIndex = remainderToIndex.get(remainderToCheckForCycle)!;
            break; 
        }

        // If it's a new remainder, store it with its current position.
        remainderToIndex.set(remainderToCheckForCycle, currentPosition);

        // Multiply the current `numerator` by 10 to get the value for the next digit calculation.
        // (e.g., if remainder was 1, for 1/7, we now consider 10/7 to get 0.1...)
        numerator *= 10;
        
        // Calculate the next digit in the decimal.
        const digit = Math.floor(numerator / N);
        decimalDigits.push(digit);

        // Calculate the new remainder for the next iteration.
        // (e.g., for 10/7, remainder is 3. This 3 will be the new `numerator` in the next loop, effectively 30/7)
        numerator %= N; 
        
        // Move to the next decimal digit position.
        currentPosition++;
    }

    // Construct the final output string based on whether a repeating part was found.
    let result = "0.";

    if (isRepeating) {
        // If there's a repeating part, separate the non-repeating and repeating portions.
        let nonRepeatingPart = "";
        let repeatingPart = "";

        // Append digits from the start up to the `repeatStartIndex` (exclusive)
        for (let i = 0; i < repeatStartIndex; i++) {
            nonRepeatingPart += decimalDigits[i];
        }
        
        // Append digits from `repeatStartIndex` to the end (inclusive)
        for (let i = repeatStartIndex; i < decimalDigits.length; i++) {
            repeatingPart += decimalDigits[i];
        }
        
        // Format the output with parentheses for the repeating part.
        result += nonRepeatingPart + "(" + repeatingPart + ")";
    } else {
        // If the decimal terminates, simply join all computed digits.
        result += decimalDigits.join("");
    }

    console.log(result);
}

// Call the solve function to execute the program logic.
solve();