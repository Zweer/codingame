// For CodinGame, input is typically read using process.stdin and readline module.
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line: string) => {
    // The initial number n is read as a string to preserve its original length
    const nStr: string = line;
    const initialLength: number = nStr.length;

    /**
     * Pads a number with leading zeros to achieve a specific length.
     * @param num The number to pad.
     * @param length The desired total length of the string representation.
     * @returns The padded string representation of the number.
     */
    function padNumber(num: number, length: number): string {
        let s = num.toString();
        // Add leading zeros until the desired length is reached
        while (s.length < length) {
            s = '0' + s;
        }
        return s;
    }

    /**
     * Calculates D(x), the integer x whose digits are in descending order.
     * @param numStr The string representation of the number (must be padded to correct length).
     * @returns The integer value of D(x).
     */
    function getD(numStr: string): number {
        // Split string into characters, sort descending, join, and parse to int
        return parseInt(numStr.split('').sort((a, b) => parseInt(b) - parseInt(a)).join(''));
    }

    /**
     * Calculates A(x), the integer x whose digits are in ascending order.
     * @param numStr The string representation of the number (must be padded to correct length).
     * @returns The integer value of A(x).
     */
    function getA(numStr: string): number {
        // Split string into characters, sort ascending, join, and parse to int
        return parseInt(numStr.split('').sort((a, b) => parseInt(a) - parseInt(b)).join(''));
    }

    let currentNum: number = parseInt(nStr);
    const sequence: string[] = []; // Stores the padded string representations of numbers in sequence
    // Map to store seen numbers (padded string) and their first occurrence index in the sequence
    const seen: Map<string, number> = new Map<string, number>();

    // Main loop to find the cycle
    while (true) {
        // Get the padded string representation of the current number
        const currentNumPaddedStr: string = padNumber(currentNum, initialLength);

        // Check if this number has been seen before
        if (seen.has(currentNumPaddedStr)) {
            // Cycle detected!
            const startIndex: number = seen.get(currentNumPaddedStr)!; // Get the index where the cycle starts
            const cycle: string[] = sequence.slice(startIndex); // Extract the cycle numbers
            console.log(cycle.join(' ')); // Output the cycle, space-separated
            break; // Exit the loop
        }

        // If not seen, add it to the map with its current index and to the sequence array
        seen.set(currentNumPaddedStr, sequence.length);
        sequence.push(currentNumPaddedStr);

        // Calculate D(currentNum) and A(currentNum) using the padded string
        const valD: number = getD(currentNumPaddedStr);
        const valA: number = getA(currentNumPaddedStr);

        // Calculate the next number in the routine
        currentNum = valD - valA;
    }

    rl.close(); // Close the readline interface as we've processed the input
});