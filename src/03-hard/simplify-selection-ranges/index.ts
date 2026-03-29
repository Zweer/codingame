// The 'readline()' function is provided by the CodinGame environment for reading input.
// The 'console.log()' function is provided for printing output.

// Read the input string from standard input
const inputString: string = readline();

/**
 * Simplifies a selection of numbers by replacing ranges of 3 or more items
 * with a shorthand #-# equivalent.
 *
 * @param inputString A string representing an array of digits (e.g., "[1,2,5,6,7]").
 * @returns A comma-separated string containing the sorted and simplified range sets.
 */
function simplifySelectionRanges(inputString: string): string {
    // 1. Parse the input string into an array of numbers.
    // Remove the leading '[' and trailing ']' characters.
    const rawNumbersString = inputString.substring(1, inputString.length - 1);

    // Handle empty input array case (e.g., "[]")
    if (rawNumbersString.length === 0) {
        return "";
    }

    // Split by comma and convert each string part to a number.
    const numbers = rawNumbersString.split(',').map(Number);

    // 2. Sort the numbers from lowest to highest.
    // This ensures correct range identification and output order.
    numbers.sort((a, b) => a - b);

    const resultParts: string[] = []; // Stores the final simplified parts (individual numbers or ranges)
    let currentRange: number[] = []; // Stores numbers in the current consecutive sequence

    // Iterate through the sorted numbers to identify and process ranges.
    for (let i = 0; i < numbers.length; i++) {
        const currentNum = numbers[i];

        // Check if the current number is consecutive to the last number in currentRange,
        // or if currentRange is empty (meaning we're starting a new range).
        if (currentRange.length === 0 || currentNum === currentRange[currentRange.length - 1] + 1) {
            // If consecutive or new range, add the number to currentRange.
            currentRange.push(currentNum);
        } else {
            // The current number is NOT consecutive, so the previous range has ended.
            // Process the completed 'currentRange'.
            if (currentRange.length >= 3) {
                // If the range has 3 or more numbers, represent it as 'start-end'.
                resultParts.push(`${currentRange[0]}-${currentRange[currentRange.length - 1]}`);
            } else {
                // If the range has less than 3 numbers (1 or 2), add each number individually.
                for (const num of currentRange) {
                    resultParts.push(String(num));
                }
            }
            // Start a new 'currentRange' with the current number that broke the sequence.
            currentRange = [currentNum];
        }
    }

    // 4. After the loop, process any remaining 'currentRange'.
    // This handles the very last range in the input array.
    if (currentRange.length > 0) {
        if (currentRange.length >= 3) {
            resultParts.push(`${currentRange[0]}-${currentRange[currentRange.length - 1]}`);
        } else {
            for (const num of currentRange) {
                resultParts.push(String(num));
            }
        }
    }

    // 5. Join all the collected parts with a comma to form the final string output.
    return resultParts.join(',');
}

// Output the result to standard output
console.log(simplifySelectionRanges(inputString));