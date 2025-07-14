/**
 * Reads a line of input from stdin. In a CodinGame environment, this function is usually provided.
 * For local testing, you might need to mock it or provide a test input string.
 * @returns {string} The read line.
 */
declare function readline(): string;

// Read the input line containing two integers separated by a space
const inputs = readline().split(' ');
let a = parseInt(inputs[0]);
let b = parseInt(inputs[1]);

// Sort numbers: num1 will be the multiplicand (doubled), num2 will be the multiplier (halved).
// This matches the example's approach where the larger number (12) is doubled and the smaller (5) is halved.
let num1 = Math.max(a, b);
let num2 = Math.min(a, b);

// Print the initial multiplication expression
console.log(`${num1} * ${num2}`);

let currentMultiplicand = num1;
let currentMultiplier = num2;
let termsToAdd: number[] = [];
// This variable stores the currentMultiplicand value right before currentMultiplier becomes 1.
// It is used to correctly format the last intermediate line as `X * 0` where X is the value
// from the previous significant step.
let prevMultiplicandForZeroLine = 0; 

// Loop as long as the current multiplier is greater than zero
while (currentMultiplier > 0) {
    // If the current multiplier is odd, add the current multiplicand to our list of terms to sum later
    if (currentMultiplier % 2 !== 0) {
        termsToAdd.push(currentMultiplicand);
    }

    // If the current multiplier is 1, this is the last step where we consider a non-zero multiplier.
    // Store this multiplicand as it will be used for the `* 0` line.
    if (currentMultiplier === 1) {
        prevMultiplicandForZeroLine = currentMultiplicand;
    }

    // Prepare the values for the *next* iteration (or for the current line's output)
    // The multiplicand is doubled
    currentMultiplicand *= 2;
    // The multiplier is halved (integer division)
    currentMultiplier = Math.floor(currentMultiplier / 2);

    let lineString: string;
    // Determine the format of the current output line
    if (currentMultiplier > 0) {
        // If the multiplier is still positive, print the new (doubled) multiplicand and (halved) multiplier
        lineString = `= ${currentMultiplicand} * ${currentMultiplier}`;
    } else {
        // If the multiplier has become 0, this is the final intermediate step.
        // Use the stored multiplicand from the step where the multiplier was 1.
        lineString = `= ${prevMultiplicandForZeroLine} * 0`;
    }

    // Append any accumulated terms to the line string
    if (termsToAdd.length > 0) {
        lineString += ' + ' + termsToAdd.join(' + ');
    }
    
    // Print the constructed line
    console.log(lineString);
}

// After the loop, calculate the final sum by adding all collected terms
const finalSum = termsToAdd.reduce((acc, val) => acc + val, 0);

// Print the final sum
console.log(`= ${finalSum}`);