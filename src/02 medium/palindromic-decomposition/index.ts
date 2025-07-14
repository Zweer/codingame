/**
 * Reads a line from standard input. In CodinGame, this is provided by `readline()`.
 * This declaration is needed for TypeScript compilation in a CodinGame environment.
 */
declare function readline(): string;

/**
 * Writes a line to standard output. In CodinGame, this is provided by `console.log()`.
 * This declaration is needed for TypeScript compilation in a CodinGame environment.
 */
declare function print(message: any): void;


function solve(): number {
    const S: string = readline();
    const N = S.length;
    let count = 0;

    // isPalindrome[i][j] is true if the substring S[i...j] (inclusive) is a palindrome.
    // The indices i and j are 0-based.
    const isPalindrome: boolean[][] = Array(N).fill(0).map(() => Array(N).fill(false));

    // Step 1: Precompute all palindromic substrings using dynamic programming.
    // Base cases:
    // All single characters are palindromes.
    for (let i = 0; i < N; i++) {
        isPalindrome[i][i] = true;
    }

    // All two-character substrings are palindromes if their characters are the same.
    for (let i = 0; i < N - 1; i++) {
        if (S[i] === S[i + 1]) {
            isPalindrome[i][i + 1] = true;
        }
    }

    // Fill for lengths 3 to N.
    // 'len' is the length of the substring.
    for (let len = 3; len <= N; len++) {
        // 'i' is the starting index of the substring.
        for (let i = 0; i <= N - len; i++) {
            const j = i + len - 1; // 'j' is the ending index of the substring.
            // S[i...j] is a palindrome if S[i] == S[j] AND S[i+1...j-1] is a palindrome.
            // The check isPalindrome[i+1][j-1] accesses smaller length substrings,
            // which are already computed in previous iterations of the 'len' loop.
            if (S[i] === S[j] && isPalindrome[i + 1][j - 1]) {
                isPalindrome[i][j] = true;
            }
        }
    }

    // Step 2: Iterate through all possible split points for (P, Q, R) and count valid decompositions.
    // A decomposition is (P, Q, R) such that P+Q+R = S.
    // P = S.substring(0, i)   (length of P is i)
    // Q = S.substring(i, j)   (length of Q is j - i)
    // R = S.substring(j, N)   (length of R is N - j)
    //
    // 'i' represents the length of P (or, the index right after P ends).
    // 'j' represents the length of P+Q (or, the index right after Q ends).
    // Both 'i' and 'j' can range from 0 to N. The condition 'i <= j' must hold.

    for (let i = 0; i <= N; i++) { // 'i' iterates through all possible end points for P (or start points for Q).
        // Check if P (S.substring(0, i)) is a palindrome.
        // If i === 0, P is an empty string (""), which is always a palindrome.
        // Otherwise, P is S[0...i-1], so we check `isPalindrome[0][i-1]`.
        const pIsPal = (i === 0) || isPalindrome[0][i - 1];

        if (pIsPal) {
            for (let j = i; j <= N; j++) { // 'j' iterates through all possible end points for Q (or start points for R).
                // Check if Q (S.substring(i, j)) is a palindrome.
                // If j === i, Q is an empty string (""), which is always a palindrome.
                // Otherwise, Q is S[i...j-1], so we check `isPalindrome[i][j-1]`.
                const qIsPal = (j === i) || isPalindrome[i][j - 1];

                if (qIsPal) {
                    // Check if R (S.substring(j, N)) is a palindrome.
                    // If N === j, R is an empty string (""), which is always a palindrome.
                    // Otherwise, R is S[j...N-1], so we check `isPalindrome[j][N-1]`.
                    const rIsPal = (N === j) || isPalindrome[j][N - 1];
                    if (rIsPal) {
                        count++;
                    }
                }
            }
        }
    }

    return count;
}

// Output the result of the solve function.
print(solve());