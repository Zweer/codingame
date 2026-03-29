To solve the "Longest Palindrome" puzzle, we need to find all palindromic substrings within a given input string `S`, identify the maximum length among them, and then print all palindromes that achieve this maximum length, in the order they appear in `S`.

### Reasoning

1.  **Understanding Palindromes:** A palindrome reads the same forwards and backwards. Examples: "madam", "racecar", "abba", "a".
2.  **Brute-Force Approach (Inefficient):**
    A naive approach would be to generate all possible substrings of `S`. For each substring, check if it's a palindrome. Keep track of the longest one(s).
    *   There are O(N^2) substrings in a string of length N.
    *   Checking if a substring of length `L` is a palindrome takes O(L) time.
    *   Total time complexity: O(N^3).
    *   Given N can be up to 10000, N^3 (10^12) is too slow.

3.  **Optimized Approach: Expand Around Center:**
    A more efficient approach leverages the property that a palindrome expands outwards from its center. A palindrome can have:
    *   **An odd length:** Centered around a single character (e.g., "racecar" is centered at 'e').
    *   **An even length:** Centered between two identical characters (e.g., "abba" is centered between the two 'b's).

    The algorithm proceeds as follows:
    *   Iterate through each character `i` in the string `S`.
    *   For each `i`, consider two potential "centers" for a palindrome:
        *   `i` itself (for odd-length palindromes).
        *   Between `i` and `i+1` (for even-length palindromes).
    *   For each center, expand outwards:
        *   Start with `left = center_start` and `right = center_end`.
        *   While `left` is within bounds (>= 0), `right` is within bounds (< `S.length`), and `S[left]` equals `S[right]`:
            *   The substring `S[left...right]` is a palindrome.
            *   Compare its length with the current `maxLength`.
            *   If it's longer, update `maxLength` and reset the list of `longestPalindromes` to contain only this new palindrome.
            *   If it's of the same length, add it to the `longestPalindromes` list (maintaining order of appearance).
            *   Decrement `left` and increment `right` to continue expanding.

4.  **Handling Multiple Longest Palindromes:** The problem explicitly states, "If multiple substrings qualify, print them all in the same order as they appear in S." Our "expand around center" approach naturally discovers palindromes in a left-to-right fashion based on their center points. By storing them in an array (`longestPalindromes`) and clearing/adding based on `maxLength`, we correctly maintain this order.

5.  **Time and Space Complexity:**
    *   **Time Complexity:** For each of the `N` possible characters, we expand outwards. In the worst case (e.g., "aaaaa"), each expansion can go up to N/2 steps. Since there are effectively `2N-1` centers (N for odd, N-1 for even), the total time complexity is O(N^2). For N=10000, N^2 = 10^8, which is generally acceptable within typical time limits (a few seconds).
    *   **Space Complexity:** O(N), for storing the `longestPalindromes` list in the worst case (e.g., a string like "abcde" where "a", "b", "c", "d", "e" are all longest palindromes of length 1).

### TypeScript Code