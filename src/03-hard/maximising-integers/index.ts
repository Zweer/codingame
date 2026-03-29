// For CodinGame environment, input is typically read using readline().
// Declare it here to satisfy TypeScript compiler if not running in CodinGame.
declare function readline(): string;

function solve() {
    // Read the input number N as a string, as it can have up to 900 digits.
    const nStr: string = readline();

    // Create two arrays to store odd and even digits, maintaining their original relative order.
    const oddDigits: string[] = [];
    const evenDigits: string[] = [];

    // Populate the oddDigits and evenDigits arrays.
    for (const digitChar of nStr) {
        const digit = parseInt(digitChar); // Convert char to number for parity check
        if (digit % 2 === 0) {
            evenDigits.push(digitChar); // Store as string to preserve leading zeros if applicable (though problem says not optimal)
        } else {
            oddDigits.push(digitChar);
        }
    }

    // Pointers for iterating through the odd and even digit arrays.
    let oddPtr = 0;
    let evenPtr = 0;

    // Array to build the maximized integer string.
    const result: string[] = [];

    // Merge the two arrays by always picking the larger digit available.
    while (oddPtr < oddDigits.length && evenPtr < evenDigits.length) {
        // Convert digits to numbers for comparison.
        const currentOdd = parseInt(oddDigits[oddPtr]);
        const currentEven = parseInt(evenDigits[evenPtr]);

        // Prioritize the larger digit to form the biggest number.
        if (currentOdd > currentEven) {
            result.push(oddDigits[oddPtr]);
            oddPtr++; // Move to the next odd digit
        } else {
            // If currentEven is greater than or equal to currentOdd, pick the even digit.
            // Choosing even when equal doesn't affect correctness since they're equal.
            result.push(evenDigits[evenPtr]);
            evenPtr++; // Move to the next even digit
        }
    }

    // After the loop, one of the arrays might still have remaining digits.
    // Append all remaining odd digits (if any).
    while (oddPtr < oddDigits.length) {
        result.push(oddDigits[oddPtr]);
        oddPtr++;
    }

    // Append all remaining even digits (if any).
    while (evenPtr < evenDigits.length) {
        result.push(evenDigits[evenPtr]);
        evenPtr++;
    }

    // Join the characters in the result array to form the final string and print it.
    console.log(result.join(''));
}

// Call the solve function to run the program.
solve();