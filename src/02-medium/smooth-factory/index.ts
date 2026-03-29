// This template is for CodinGame. `readline()` and `console.log()` are implicitly available.

/**
 * Solves the Smooth Factory puzzle.
 * Reads the number of victories V, then calculates the sum of the V smallest unique
 * shipment sizes that result in a victory in the Smoothie Reduction game.
 */
function solve(): void {
    // Read the number of victories V from standard input.
    const V: number = parseInt(readline());

    // If V is 0, no fruit is needed, so the total sum is 0.
    if (V === 0) {
        console.log(0);
        return;
    }

    // The game specifies that a victory occurs when the fruit count reduces to 1
    // using a watermelon (n=1). This implies that any starting fruit count 'S'
    // that can be reduced to 1 using factors 1, 2, 3, or 5 will result in a victory.
    // Such numbers are of the form 2^a * 3^b * 5^c (5-smooth numbers, or Hamming numbers).
    // We need to find the V smallest distinct such numbers and sum them.

    // Array to store the generated 5-smooth numbers in increasing order.
    // The smallest 5-smooth number is 1 (2^0 * 3^0 * 5^0).
    const hammingNumbers: number[] = [1];

    // Pointers for the multiples of 2, 3, and 5.
    // These pointers track the indices in 'hammingNumbers' array.
    // For example, hammingNumbers[i2] * 2 is a candidate for the next 5-smooth number.
    let i2: number = 0; // Pointer for multiples of 2
    let i3: number = 0; // Pointer for multiples of 3
    let i5: number = 0; // Pointer for multiples of 5

    // Variable to accumulate the sum of the V smallest 5-smooth numbers.
    // Initialize with 1, as it's the first number.
    let totalFruitScheduled: number = 1;

    // Generate the remaining V-1 5-smooth numbers.
    // We already have the first one (1).
    for (let k = 1; k < V; k++) {
        // Calculate the next potential 5-smooth numbers by multiplying by 2, 3, and 5
        // from the numbers already found (at indices i2, i3, i5).
        const nextMultipleOf2: number = hammingNumbers[i2] * 2;
        const nextMultipleOf3: number = hammingNumbers[i3] * 3;
        const nextMultipleOf5: number = hammingNumbers[i5] * 5;

        // The next actual 5-smooth number is the minimum of these three candidates.
        const nextHamming: number = Math.min(nextMultipleOf2, nextMultipleOf3, nextMultipleOf5);
        
        // Add the newly found 5-smooth number to our list.
        hammingNumbers.push(nextHamming);
        // Add it to the running total sum.
        totalFruitScheduled += nextHamming;

        // Advance the pointer(s) that contributed to the current minimum.
        // It's crucial to use 'if' (not 'else if') for all checks.
        // This handles cases where the minimum is produced by multiple factors (e.g., 6 = 2*3 = 3*2).
        // Advancing all relevant pointers prevents duplicates from being considered in the next iteration
        // and ensures the numbers are generated in correct sorted order.
        if (nextHamming === nextMultipleOf2) {
            i2++;
        }
        if (nextHamming === nextMultipleOf3) {
            i3++;
        }
        if (nextHamming === nextMultipleOf5) {
            i5++;
        }
    }

    // Output the final calculated total amount of fruit.
    console.log(totalFruitScheduled);
}

// Call the solve function to execute the program.
solve();