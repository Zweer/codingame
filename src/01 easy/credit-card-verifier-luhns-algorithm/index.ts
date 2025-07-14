// The `readline` function is provided by the CodinGame environment.
// The `console.log` function serves as the `print` function for output.

function main() {
    const N: number = parseInt(readline());

    for (let i = 0; i < N; i++) {
        const cardNumberInput: string = readline();
        // Remove all spaces from the card number string to get a continuous 16-digit string
        const cleanedCardNumber: string = cardNumberInput.replace(/\s/g, '');

        let sumEvenIndices = 0; // Stores the sum of digits at even 0-indexed positions (from left), after processing
        let sumOddIndices = 0;  // Stores the sum of digits at odd 0-indexed positions (from left)

        // Iterate through each digit of the cleaned card number from left to right
        for (let j = 0; j < cleanedCardNumber.length; j++) {
            const digit = parseInt(cleanedCardNumber[j]);

            // Based on the example's consistent calculation for Luhn's algorithm:
            // Digits at even 0-indexed positions (0, 2, 4, ..., 14 from the left) are doubled.
            // If the doubled result is a two-digit number, subtract 9 (e.g., 18 becomes 9).
            if (j % 2 === 0) {
                let doubledDigit = digit * 2;
                if (doubledDigit >= 10) {
                    doubledDigit -= 9; // Equivalent to adding the digits of the doubled number
                }
                sumEvenIndices += doubledDigit;
            } 
            // Digits at odd 0-indexed positions (1, 3, 5, ..., 15 from the left) are added directly.
            else {
                sumOddIndices += digit;
            }
        }

        // Step 4: Sum the results from both groups of digits
        const totalSum = sumEvenIndices + sumOddIndices;

        // Step 5: Check if the total sum is divisible by 10
        if (totalSum % 10 === 0) {
            console.log('YES');
        } else {
            console.log('NO');
        }
    }
}

// Call the main function to start the execution of the program
main();