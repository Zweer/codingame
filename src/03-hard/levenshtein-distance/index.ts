/**
 * Reads a line from standard input.
 * In CodinGame, this function is usually provided globally.
 */
declare function readline(): string;

/**
 * Prints a message to standard output.
 * In CodinGame, this function is usually provided globally.
 */
declare function print(message: any): void;

// Read the two input strings
const s1: string = readline();
const s2: string = readline();

// Get the lengths of the strings
const len1: number = s1.length;
const len2: number = s2.length;

// Create a 2D array (matrix) to store the distances
// The matrix size will be (len1 + 1) x (len2 + 1)
const dp: number[][] = Array(len1 + 1).fill(0).map(() => Array(len2 + 1).fill(0));

// Initialize the first column (transforming empty string to prefix of s1)
// This represents the cost of deleting characters from s1 to get an empty string.
for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
}

// Initialize the first row (transforming prefix of s2 to empty string)
// This represents the cost of inserting characters into s1 to get s2's prefix.
for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
}

// Fill the dp table using the recurrence relation
for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
        // If the characters match, no operation is needed for this step.
        // The cost is the same as the distance of the preceding prefixes.
        if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
        } else {
            // If characters do not match, we need an operation.
            // Take the minimum of the three possible operations (deletion, insertion, substitution)
            // and add 1 for the cost of that operation.
            dp[i][j] = 1 + Math.min(
                dp[i - 1][j],     // Cost of deletion (delete s1[i-1])
                dp[i][j - 1],     // Cost of insertion (insert s2[j-1] into s1)
                dp[i - 1][j - 1]  // Cost of substitution (change s1[i-1] to s2[j-1])
            );
        }
    }
}

// The Levenshtein distance is stored in the bottom-right cell of the matrix
print(dp[len1][len2]);