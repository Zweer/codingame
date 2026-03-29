// Standard input/output functions for CodinGame.
// These are usually provided by the CodinGame platform.
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the "Hunger" puzzle.
 * Finds the length of the longest "good" feast possible.
 */
function solveHungerPuzzle(): void {
    // Read the first line: n (amount of food) and k (minimum sweetness)
    const nkInput = readline().split(' ');
    const n = parseInt(nkInput[0]);
    const k = parseInt(nkInput[1]);

    // Read the second line: sweetness of each food
    const foodsSweetnessStr = readline().split(' ');
    const foodsSweetness: number[] = foodsSweetnessStr.map(Number);

    // Step 1: Transform the food sweetness array into a new array.
    // 'Good' foods (sweetness >= k) are represented by 1.
    // 'Non-good' foods (sweetness < k) are represented by -1.
    const transformedFoods: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
        if (foodsSweetness[i] >= k) {
            transformedFoods[i] = 1; // Good food contributes +1 to the sum
        } else {
            transformedFoods[i] = -1; // Non-good food contributes -1 to the sum
        }
    }

    let maxLength = 0; // Initialize the maximum length of a 'good' feast found so far.

    // Step 2: Iterate through all possible subarrays (feasts).
    // The outer loop selects the starting index 'i' of the feast.
    for (let i = 0; i < n; i++) {
        let currentFeastSum = 0; // Initialize sum for the current feast starting at 'i'.

        // The inner loop extends the feast to the right, calculating its sum.
        // 'j' represents the current ending index of the feast.
        for (let j = i; j < n; j++) {
            // Add the value of the food at index 'j' to the current feast sum.
            currentFeastSum += transformedFoods[j];

            // A feast is "good" if its sum (count of good foods - count of non-good foods)
            // is strictly greater than 0.
            if (currentFeastSum > 0) {
                // If the current feast is good, calculate its length.
                const currentFeastLength = j - i + 1;
                // Update maxLength if this feast is longer than any previously found good feast.
                maxLength = Math.max(maxLength, currentFeastLength);
            }
        }
    }

    // Step 3: Output the length of the longest 'good' feast.
    console.log(maxLength);
}

// Call the main function to execute the solution.
solveHungerPuzzle();