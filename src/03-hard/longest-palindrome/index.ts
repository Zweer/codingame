/**
 * The `readline()` function is provided by the CodinGame environment to read input.
 * For local testing, you might need to mock it, e.g., by:
 * const readline = () => "madam";
 * or by reading from stdin using Node.js 'fs' module for more complex cases:
 * import * as fs from 'fs';
 * const inputLines = fs.readFileSync(0, 'utf-8').split('\n');
 * let currentLine = 0;
 * const readline = () => inputLines[currentLine++];
 */
declare const readline: () => string; // Assuming readline is globally available

function solve() {
    const S: string = readline();

    // According to constraints: 0 < length of S < 10000.
    // So, S will never be an empty string. If S has only one character,
    // it's a palindrome of length 1, and the algorithm correctly handles this.

    let maxLength: number = 0;
    // This array stores all palindromes that currently hold the maximum length.
    // They are added in the order they are found (which corresponds to their
    // appearance order in the string S due to the left-to-right scan).
    let longestPalindromes: string[] = [];

    /**
     * Helper function to check if a newly found palindrome is longer than,
     * or equal to, the current maximum length palindrome(s).
     * Updates `maxLength` and `longestPalindromes` accordingly.
     * @param palindromeStr The palindrome string to evaluate.
     */
    const checkAndStore = (palindromeStr: string) => {
        if (palindromeStr.length > maxLength) {
            // A new longest palindrome is found.
            // Reset maxLength and start a new list for longer palindromes.
            maxLength = palindromeStr.length;
            longestPalindromes = [palindromeStr];
        } else if (palindromeStr.length === maxLength) {
            // A palindrome of the current maximum length is found.
            // Add it to the existing list to maintain order of appearance.
            longestPalindromes.push(palindromeStr);
        }
    };

    // Iterate through each character in the string to use it as a potential center
    // for palindromes. We need to check for both odd and even length palindromes.
    for (let i = 0; i < S.length; i++) {
        // Case 1: Palindromes with odd length (centered at character S[i])
        // Example: For "madam", when i is at 'd' (index 2), it can expand to "madam".
        let left1 = i;
        let right1 = i;
        while (left1 >= 0 && right1 < S.length && S[left1] === S[right1]) {
            // Extract the current palindrome string
            const currentPalindrome = S.substring(left1, right1 + 1);
            checkAndStore(currentPalindrome); // Check and store if it's the longest

            // Expand outwards: move left pointer left, right pointer right
            left1--;
            right1++;
        }

        // Case 2: Palindromes with even length (centered between characters S[i] and S[i+1])
        // Example: For "abba", when i is at 'b' (index 1), it can expand to "abba".
        let left2 = i;
        let right2 = i + 1; // Start with two characters as a potential even center
        while (left2 >= 0 && right2 < S.length && S[left2] === S[right2]) {
            // Extract the current palindrome string
            const currentPalindrome = S.substring(left2, right2 + 1);
            checkAndStore(currentPalindrome); // Check and store if it's the longest

            // Expand outwards
            left2--;
            right2++;
        }
    }

    // After checking all possible centers, print all collected longest palindromes.
    // They are already in the correct order of appearance due to the iteration logic.
    for (const palindrome of longestPalindromes) {
        console.log(palindrome);
    }
}

// Execute the solver function to run the puzzle logic.
solve();