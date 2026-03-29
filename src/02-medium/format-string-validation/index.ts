/**
 * Reads a line from standard input.
 * In the CodinGame environment, this function is typically provided globally.
 */
declare function readline(): string;

function solve() {
    const text: string = readline();
    const format: string = readline();

    const N = text.length;
    const M = format.length;

    // dp[i][j] will be true if text[0...i-1] matches format[0...j-1]
    // The table size is (N+1) x (M+1) to accommodate empty prefixes (i=0 or j=0)
    const dp: boolean[][] = Array(N + 1).fill(null).map(() => Array(M + 1).fill(false));

    // Base case: empty text matches empty format
    dp[0][0] = true;

    // Initialize the first row (text is empty, format has some characters)
    // Only '~' can match an empty string segment.
    for (let j = 1; j <= M; j++) {
        if (format[j - 1] === '~') {
            dp[0][j] = dp[0][j - 1];
        }
        // If format[j-1] is not '~', dp[0][j] remains false, as a non-'~' character
        // or a '?' cannot match an empty string.
    }

    // Fill the rest of the DP table
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
            const textChar = text[i - 1];
            const formatChar = format[j - 1];

            if (formatChar === '?') {
                // '?' matches exactly one character (textChar)
                // So, text[0...i-1] matches format[0...j-1] if text[0...i-2] matched format[0...j-2]
                dp[i][j] = dp[i - 1][j - 1];
            } else if (formatChar === '~') {
                // '~' matches zero or more characters
                // Option 1: '~' matches zero characters.
                //   text[0...i-1] matches format[0...j-1] if text[0...i-1] matched format[0...j-2]
                const matchZeroChars = dp[i][j - 1];

                // Option 2: '~' matches textChar (and potentially more characters before it).
                //   text[0...i-1] matches format[0...j-1] if text[0...i-2] matched format[0...j-1] (the same '~' keeps matching)
                const matchOneOrMoreChars = dp[i - 1][j];

                dp[i][j] = matchZeroChars || matchOneOrMoreChars;
            } else {
                // Literal character match
                // textChar must be equal to formatChar AND text[0...i-2] must match format[0...j-2]
                dp[i][j] = (textChar === formatChar) && dp[i - 1][j - 1];
            }
        }
    }

    // The final result is whether the entire text matches the entire format
    if (dp[N][M]) {
        console.log("MATCH");
    } else {
        console.log("FAIL");
    }
}

// Call the solve function to run the logic
solve();