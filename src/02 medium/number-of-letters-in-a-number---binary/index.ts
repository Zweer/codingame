// Standard input reading for CodinGame (provided by the platform)
declare function readline(): string;
declare function print(message: string): void; // CodinGame usually uses print

// Function to calculate the next term in the sequence based on the number of letters
// in the spelled-out binary representation.
function calculateNextBigInt(val: BigInt): BigInt {
    // Special case for 0: "0" in binary is "zero", which has 4 letters.
    // Although 'start' is >= 1, the sequence could theoretically generate 0.
    if (val === 0n) {
        return 4n;
    }

    // Convert the BigInt number to its binary string representation.
    const binaryString = val.toString(2);

    let numZeros = 0n; // Use BigInt for counts to ensure arithmetic operations are BigInt
    let numOnes = 0n;

    // Iterate through the binary string to count '0's and '1's.
    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '0') {
            numZeros++;
        } else { // Character must be '1'
            numOnes++;
        }
    }

    // "zero" has 4 letters, "one" has 3 letters.
    // Calculate the next term by summing the letter counts.
    return (numZeros * 4n) + (numOnes * 3n);
}

function solve() {
    // Read the input line and parse start and n as BigInts.
    const line = readline().split(' ');
    let start = BigInt(line[0]);
    const n = BigInt(line[1]);

    // If n is 0, the Nth term is simply the start value (S(0) = start).
    if (n === 0n) {
        console.log(start.toString());
        return;
    }

    // `sequenceValues` stores the sequence terms: sequenceValues[i] holds S(i).
    const sequenceValues: BigInt[] = [];
    // `visited` maps a value to the step index where it first appeared.
    const visited: Map<BigInt, BigInt> = new Map();

    let currentVal = start; // The current term in the sequence, starting with S(0)
    let step = 0n;          // The current step index (0-based)

    // Loop indefinitely until the Nth term is found or a cycle is detected.
    while (true) {
        // Check if the current value has been encountered before.
        if (visited.has(currentVal)) {
            // Cycle detected!
            const cycleStartStep = visited.get(currentVal)!; // The step index where the cycle begins
            const cycleLength = step - cycleStartStep;      // The length of the detected cycle

            // Calculate how many more steps are needed to reach 'n' from the current 'step'.
            const remainingSteps = n - step;
            // Determine the offset within the cycle.
            const offsetInCycle = remainingSteps % cycleLength;

            // The final Nth term will be found by taking the value at
            // (cycleStartStep + offsetInCycle) within our `sequenceValues` history.
            // Convert BigInt index to Number for array access (safe because indices will be small).
            const finalValueIndex = Number(cycleStartStep + offsetInCycle);
            
            // Output the result and terminate.
            console.log(sequenceValues[finalValueIndex].toString());
            return;
        }

        // If not visited, record the current value and its step.
        visited.set(currentVal, step);
        sequenceValues.push(currentVal);

        // If the current step is 'n', we have found the target term.
        if (step === n) {
            console.log(currentVal.toString());
            return;
        }

        // Calculate the next term in the sequence.
        currentVal = calculateNextBigInt(currentVal);
        // Advance to the next step.
        step++;
    }
}

// Execute the puzzle-solving logic.
solve();