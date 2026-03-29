/**
 * Reads a line from standard input. In the CodinGame environment, this function is provided globally.
 */
declare function readline(): string;

/**
 * Prints a message to standard output. In the CodinGame environment, this function is provided globally.
 */
declare function print(message: any): void;

/**
 * Solves the "deus Hex machina" puzzle.
 */
function solve() {
    // Read the input hexadecimal number string
    const N: string = readline();

    // Define the flip maps based on the problem description's example:
    // "Horizontal flip:    123456789abcdef0  |  0#9b#d6e8#a2##51"
    const H_MAP: { [key: string]: string } = {
        '0': '1', '1': '0', '2': '#', '3': '9', '4': 'b', '5': '#', '6': 'd', '7': '6',
        '8': 'e', '9': '8', 'a': '#', 'b': 'a', 'c': '2', 'd': '#', 'e': '#', 'f': '5'
    };

    // "Vertical flip:      153#2e#8a9#c#6#0" (implied for input 123456789abcdef0)
    const V_MAP: { [key: string]: string } = {
        '0': '0', '1': '1', '2': '5', '3': '3', '4': '#', '5': '2', '6': '#', '7': '8',
        '8': 'a', '9': '9', 'a': '#', 'b': 'c', 'c': '#', 'd': '6', 'e': '#', 'f': '#'
    };

    let currentNumber = N;
    let isNotANumber = false;

    // Convert the hexadecimal number to its binary representation.
    // This binary string serves as the sequence of flip instructions ('0' for horizontal, '1' for vertical).
    // BigInt is used to handle hexadecimal numbers up to 10000 digits, which can be very large.
    // Example: "0x15" (BigInt) -> "10101" (binary string)
    let binaryInstructions: string;
    try {
        // Handle cases like "0" or "000". BigInt("0x0").toString(2) correctly yields "0".
        binaryInstructions = BigInt("0x" + N).toString(2);
    } catch (e) {
        // This catch block is mostly for defensive programming; input is constrained to be valid hex.
        print("Not a number");
        return;
    }

    // Apply flips sequentially based on the binary instructions
    for (const instruction of binaryInstructions) {
        // If the number has already become invalid, stop processing further flips.
        if (isNotANumber) {
            break;
        }

        let nextNumberChars: string[] = [];
        // Choose the correct map based on the binary instruction (0 for H, 1 for V)
        const mapToUse = (instruction === '0') ? H_MAP : V_MAP;

        // Apply the flip digit by digit
        for (const char of currentNumber) {
            const flippedChar = mapToUse[char];
            if (flippedChar === '#') {
                // If any digit flips to '#', the entire number becomes "Not a number".
                isNotANumber = true;
                break; // Exit the inner loop, no need to flip more digits for this step.
            }
            nextNumberChars.push(flippedChar);
        }

        // If the current flip didn't result in '#', update currentNumber for the next iteration.
        if (!isNotANumber) {
            currentNumber = nextNumberChars.join('');
        }
    }

    // Output the final result
    if (isNotANumber) {
        print("Not a number");
    } else {
        // Display only the initial 1000 hex digits if the result exceeds that length.
        if (currentNumber.length > 1000) {
            print(currentNumber.substring(0, 1000));
        } else {
            print(currentNumber);
        }
    }
}

// Call the solve function to run the puzzle logic
solve();