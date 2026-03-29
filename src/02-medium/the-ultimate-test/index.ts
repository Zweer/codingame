/**
 * Reads input from stdin and processes it to find expressions.
 * Assumes readline() and print() functions are globally available in the CodinGame environment.
 */
function solvePuzzle(): void {
    // Read N (as a string, since digits are processed individually)
    const N_str: string = readline();
    // Read K (target number)
    const K: number = parseInt(readline());

    const N_len: number = N_str.length; // Length of the digit string N
    const results: string[] = []; // Stores all expressions that evaluate to K

    /**
     * Recursive function to explore all possible placements of operators.
     *
     * @param idx The current index in N_str from which to take the next digit.
     *            This index represents the start of the next potential number segment.
     * @param currentExpr The expression string built so far.
     * @param currentSum The sum of the terms evaluated so far, excluding currentNum.
     * @param currentNum The numerical value of the number segment currently being built (e.g., for "123", if we processed "1" and are at "2", currentNum could be 1 for '1+2', or 12 for '12').
     * @param sign The sign applied to currentNum (1 for addition, -1 for subtraction) relative to currentSum.
     */
    function findExpressions(idx: number, currentExpr: string, currentSum: number, currentNum: number, sign: number): void {
        // Base case: All digits of N have been processed.
        if (idx === N_len) {
            // Calculate the final total sum by adding the last processed number segment with its sign.
            if (currentSum + (sign * currentNum) === K) {
                results.push(currentExpr); // If the total sum equals K, add the expression to results.
            }
            return; // End of this recursive path.
        }

        // Get the current digit character and its numerical value.
        const digit_char: string = N_str[idx];
        const digit_val: number = parseInt(digit_char);

        // --- Option 1: Append (no operator between currentNum and digit_char) ---
        // This forms a larger number by concatenating the current digit to currentNum.
        // The sign for this extended number remains the same as currentNum.
        // Example: If currentNum is 1, digit_val is 2, newCurrentNum becomes 12.
        // The expression string simply appends the digit.
        const newCurrentNum_append: number = currentNum * 10 + digit_val;
        findExpressions(idx + 1, currentExpr + digit_char, currentSum, newCurrentNum_append, sign);

        // --- Option 2: Add (+) operator ---
        // The current number segment (currentNum) is finalized and added to the currentSum.
        // A new number segment begins with digit_val, and it will be added to the sum.
        // Example: If currentExpr is "1", currentNum is 1, currentSum is 0, sign is 1.
        //          newCurrentSum becomes 0 + (1 * 1) = 1.
        //          The new number segment starts with digit_val (e.g., 2), and its sign is positive (1).
        // The expression string adds '+' and the digit.
        const newCurrentSum_add: number = currentSum + (sign * currentNum);
        findExpressions(idx + 1, currentExpr + '+' + digit_char, newCurrentSum_add, digit_val, 1);

        // --- Option 3: Subtract (-) operator ---
        // Similar to addition, but the new number segment will be subtracted from the sum.
        // Example: newCurrentSum becomes 0 + (1 * 1) = 1.
        //          The new number segment starts with digit_val (e.g., 2), and its sign is negative (-1).
        // The expression string adds '-' and the digit.
        const newCurrentSum_subtract: number = currentSum + (sign * currentNum);
        findExpressions(idx + 1, currentExpr + '-' + digit_char, newCurrentSum_subtract, digit_val, -1);
    }

    // Initial call to the recursive function.
    // The first digit of N always starts a number segment.
    // currentSum is initialized to 0.
    // currentNum is the value of the first digit.
    // The sign for the first digit is implicitly positive (1).
    const firstDigit: number = parseInt(N_str[0]);
    findExpressions(1, N_str[0], 0, firstDigit, 1);

    // Print all found expressions, each on a new line.
    results.forEach(expr => console.log(expr));
}

// CodinGame boilerplate declarations for readline and print.
// These functions are provided by the CodinGame environment.
declare function readline(): string;
declare function print(message: any): void;

// Call the main function to execute the puzzle solution.
solvePuzzle();