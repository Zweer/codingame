// This is the standard boilerplate for CodinGame TypeScript puzzles.
// It allows reading input line by line.
declare function readline(): string;

/**
 * Solves the KGood puzzle.
 * Finds the length of the longest KGood substring of a given string S.
 * A string is KGood if it has no more than K different characters.
 */
function solveKGood(): void {
    // Read the input string S
    const S: string = readline();
    // Read the integer K
    const K: number = parseInt(readline());

    // Initialize variables for the sliding window
    let maxLength: number = 0; // Stores the maximum length found so far
    let left: number = 0;     // Left pointer of the sliding window

    // Use an array to store character counts within the current window.
    // Index 0 for 'a', 1 for 'b', ..., 25 for 'z'.
    // Initialized with zeros, indicating no characters are present.
    const charCounts: number[] = new Array(26).fill(0);
    let distinctCount: number = 0; // Number of distinct characters in the current window

    /**
     * Helper function to convert a lowercase English character to its 0-25 index.
     * @param char The character to convert.
     * @returns The index of the character (0 for 'a', 1 for 'b', etc.).
     */
    const getCharIndex = (char: string): number => {
        return char.charCodeAt(0) - 'a'.charCodeAt(0);
    };

    // Iterate with the right pointer, expanding the window
    for (let right = 0; right < S.length; right++) {
        const charRight: string = S[right];
        const charRightIndex: number = getCharIndex(charRight);

        // If this character's count was 0 before incrementing, it means it's a new distinct character
        if (charCounts[charRightIndex] === 0) {
            distinctCount++;
        }
        // Increment the count of the current character
        charCounts[charRightIndex]++;

        // While the number of distinct characters in the current window exceeds K,
        // shrink the window from the left by moving the 'left' pointer.
        while (distinctCount > K) {
            const charLeft: string = S[left];
            const charLeftIndex: number = getCharIndex(charLeft);

            // Decrement the count of the character at the left end of the window
            charCounts[charLeftIndex]--;

            // If the count of this character becomes 0 after decrementing,
            // it means it's no longer present in the window, so decrement distinctCount.
            if (charCounts[charLeftIndex] === 0) {
                distinctCount--;
            }
            // Move the left pointer to the right to shrink the window
            left++;
        }

        // At this point, the current window [left, right] is a KGood substring.
        // Calculate its length and update maxLength if it's greater than the current maximum.
        maxLength = Math.max(maxLength, right - left + 1);
    }

    // Output the final result, which is the length of the longest KGood substring.
    console.log(maxLength);
}

// Call the function to solve the puzzle when the script is executed.
solveKGood();