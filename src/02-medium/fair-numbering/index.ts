/**
 * Calculates the total number of digits from 1 up to a given number n.
 * For example:
 * getDigits(9) returns 9 (1+1+...+1 for numbers 1-9)
 * getDigits(10) returns 11 (9 digits for 1-9, + 2 digits for 10)
 * getDigits(100) returns 192 (9 for 1-9, 180 for 10-99, 3 for 100)
 *
 * @param n The upper limit (inclusive) for counting digits, must be >= 0.
 * @returns The total count of digits.
 */
function getDigits(n: number): number {
    if (n <= 0) {
        return 0; // Page numbers start from 1, so 0 or negative means no digits.
    }

    let digitsCount = 0;
    let powerOf10 = 1; // Represents 1, 10, 100, 1000, ... (start of number blocks like 1-9, 10-99, etc.)
    let numDigits = 1; // Represents 1, 2, 3, ... (number of digits in current block)

    // Loop through blocks of numbers with a fixed number of digits (e.g., 1-digit, 2-digit, 3-digit numbers)
    while (true) {
        // Calculate the start of the next block (e.g., 10, 100, 1000)
        let nextPowerOf10 = powerOf10 * 10;

        // If 'n' falls within the current block of 'numDigits' numbers
        // e.g., if n = 50 and we are considering 2-digit numbers (10-99).
        // (n - powerOf10 + 1) counts the numbers from 'powerOf10' up to 'n'.
        // For example, (50 - 10 + 1) = 41 numbers.
        if (n < nextPowerOf10) {
            digitsCount += (n - powerOf10 + 1) * numDigits;
            break; // 'n' has been fully processed
        } else {
            // 'n' is beyond the current block, so add all digits for this full block.
            // (nextPowerOf10 - powerOf10) gives the count of numbers in this block (e.g., 90 for 2-digit numbers)
            digitsCount += (nextPowerOf10 - powerOf10) * numDigits;

            // Move to the next block (more digits)
            powerOf10 = nextPowerOf10;
            numDigits++;
        }
    }
    return digitsCount;
}

/**
 * Calculates the total number of digits for pages within a specific range [start, end].
 *
 * @param start The starting page number (inclusive).
 * @param end The ending page number (inclusive).
 * @returns The total count of digits for the specified range. Returns 0 if the range is invalid (start > end).
 */
function getTotalDigitsInRange(start: number, end: number): number {
    if (start > end) {
        return 0; // Invalid or empty range.
    }
    // Total digits up to 'end' minus total digits up to 'start - 1'.
    return getDigits(end) - getDigits(start - 1);
}

// Main logic for the CodinGame puzzle
function solve() {
    // Read the number of test cases
    const N: number = parseInt(readline());

    // Process each test case
    for (let i = 0; i < N; i++) {
        // Read the start (st) and end (ed) page numbers for the current test case
        const line: string[] = readline().split(' ');
        const st: number = parseInt(line[0]);
        const ed: number = parseInt(line[1]);

        let low: number = st;   // Lower bound for binary search (Alice's last page)
        let high: number = ed;  // Upper bound for binary search (Alice's last page)
        let ans: number = st;   // Stores the best valid answer found so far (initialized to 'st' as Alice must write at least 'st')

        // Perform binary search to find the optimal 'mid' page for Alice
        while (low <= high) {
            const mid: number = Math.floor((low + high) / 2); // Calculate the middle page

            // Calculate the total digits Alice would write if she numbers up to 'mid'
            const aliceDigits = getTotalDigitsInRange(st, mid);
            // Calculate the total digits Bob would write if he numbers from 'mid + 1' to 'ed'
            const bobDigits = getTotalDigitsInRange(mid + 1, ed);

            // Check the fairness condition: Alice's digits should not be more than Bob's
            if (aliceDigits <= bobDigits) {
                // This 'mid' is a valid candidate for Alice's last page.
                // We want to maximize 'mid' to make Alice's contribution as large as possible
                // while still satisfying the condition (close to and not more than Bob's).
                ans = mid;         // Store this 'mid' as a potential answer
                low = mid + 1;     // Try for a larger 'mid' in the right half
            } else {
                // This 'mid' makes Alice write too many digits (more than Bob).
                // We need to reduce 'mid'.
                high = mid - 1;    // Search in the left half
            }
        }
        // Output the result for the current test case
        console.log(ans);
    }
}

// In the CodinGame environment, `readline()` and `console.log()` are globally available.
// The `solve()` function is called to start the program execution.
solve();