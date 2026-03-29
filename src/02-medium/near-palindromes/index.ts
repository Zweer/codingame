/**
 * Checks if a substring of 's' from 'start' to 'end' (inclusive) is a palindrome.
 * An empty string or a single-character string is considered a palindrome.
 * @param s The string to check.
 * @param start The starting index of the substring.
 * @param end The ending index of the substring.
 * @returns True if the substring is a palindrome, false otherwise.
 */
function isPalindrome(s: string, start: number, end: number): boolean {
    while (start < end) {
        if (s[start] !== s[end]) {
            return false;
        }
        start++;
        end--;
    }
    return true; // Returns true for empty string, single char, and true palindromes
}

/**
 * Checks if a word is a "near-palindrome".
 * A near-palindrome is a word that can become a palindrome by exactly one
 * replacement, addition, or removal of a single character.
 * Words that are already palindromes are not considered near-palindromes
 * as they require 0 edits, not 1, based on the problem's phrasing "one letter away".
 * @param word The word to check.
 * @returns 1 if the word is a near-palindrome, 0 otherwise.
 */
function checkWord(word: string): number {
    const L = word.length;

    // Rule 1: If the word is already a palindrome, it's 0 edits away, not 1.
    // So, according to the strict interpretation of "one letter away", it's not a near-palindrome.
    if (isPalindrome(word, 0, L - 1)) {
        return 0;
    }

    let left = 0;
    let right = L - 1;

    // Find the first pair of characters that do not match from the ends.
    // This loop effectively finds the "core" mismatch region.
    while (left < right && word[left] === word[right]) {
        left++;
        right--;
    }

    // At this point:
    // 1. If `left >= right`, it means the string was a palindrome (e.g., "aba" or "aa").
    //    This case is already handled by the first `if (isPalindrome(word, 0, L - 1))` check,
    //    so this branch will not be reached for true palindromes.
    // 2. If `left < right`, it means `word[left] !== word[right]`, and these are the first
    //    mismatched characters from the ends. We need to check if fixing this single mismatch
    //    by one edit (removal/insertion/replacement) makes the rest a palindrome.

    // Check three scenarios where one edit could make the string a palindrome:

    // Scenario A: Remove `word[left]` (effectively inserting a character into the existing structure)
    // Check if the substring from `left + 1` to `right` is a palindrome.
    // Example: "acecars" (from "racecars" removing 'r') -> checks "acecars" (indices 1 to 7)
    // If "racecars" was input, L=8, left=0, right=7. We check `isPalindrome("racecars", 1, 7)` for "acecars".
    if (isPalindrome(word, left + 1, right)) {
        return 1;
    }

    // Scenario B: Remove `word[right]` (effectively inserting a character into the existing structure)
    // Check if the substring from `left` to `right - 1` is a palindrome.
    // Example: "racecar" (from "racecars" removing 's') -> checks "racecar" (indices 0 to 6)
    // If "racecars" was input, L=8, left=0, right=7. We check `isPalindrome("racecars", 0, 6)` for "racecar".
    if (isPalindrome(word, left, right - 1)) {
        return 1;
    }

    // Scenario C: Replace `word[left]` with `word[right]` (or vice-versa)
    // This implies that the inner substring `word[left+1 ... right-1]` must already be a palindrome.
    // Example: "cec" (from "ricecar" where 'i' and 'a' mismatch) -> checks "cec" (indices 2 to 4)
    // If "ricecar" was input, L=7, left=1, right=5. We check `isPalindrome("ricecar", 2, 4)` for "cec".
    if (isPalindrome(word, left + 1, right - 1)) {
        return 1;
    }

    // If none of the above scenarios result in a valid single-edit path to a palindrome,
    // then the word is not a near-palindrome.
    return 0;
}

// Read the number of words from standard input.
const N: number = parseInt(readline());

// Array to store the results (0 or 1) for each word.
const results: string[] = [];

// Process each word.
for (let i = 0; i < N; i++) {
    const word: string = readline(); // Read the word from standard input.
    results.push(checkWord(word).toString()); // Call checkWord and convert result to string.
}

// Output the final string of '0's and '1's, joined without spaces.
console.log(results.join(''));