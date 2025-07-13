/**
 * Reads a line from standard input. In the CodinGame environment, this function is globally available.
 * @returns {string} The read line.
 */
declare function readline(): string;

/**
 * Prints a value to standard output, followed by a newline. In the CodinGame environment, this function is globally available.
 * @param {any} value The value to print.
 */
declare function print(value: any): void;


/**
 * Solves the Excavating Palindromes puzzle.
 * Finds the length of the Longest Palindromic Subsequence (LPS) of a given string.
 * This is equivalent to finding the Longest Common Subsequence (LCS)
 * between the string and its reverse.
 */
function solve(): void {
    // Read the input string.
    const s: string = readline();
    const n: number = s.length;

    // Create the reversed version of the input string.
    const reversed_s: string = s.split('').reverse().join('');

    // Initialize the dynamic programming table.
    // dp[i][j] will store the length of the LCS of s.substring(0, i)
    // and reversed_s.substring(0, j).
    // The table dimensions are (n + 1) x (n + 1) to handle empty prefixes.
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0));

    // Fill the dp table using the LCS recurrence relation.
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= n; j++) {
            // If the characters at the current positions match,
            // we extend the LCS from the diagonal element (LCS of previous prefixes).
            if (s[i - 1] === reversed_s[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                // If the characters do not match,
                // we take the maximum of the LCS when either:
                // 1. s[i-1] is excluded (dp[i-1][j])
                // 2. reversed_s[j-1] is excluded (dp[i][j-1])
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // The length of the Longest Palindromic Subsequence
    // is the value in the bottom-right corner of the dp table.
    console.log(dp[n][n]);
}

// Call the main solve function to run the logic.
solve();