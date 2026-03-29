// Define readline() and print() as they are globally available in CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the Anagrams puzzle by unscrambling the given phrase.
 */
function solve() {
    const scrambledPhrase: string = readline();

    /**
     * Checks if a given character is an Nth letter of the alphabet.
     * Alphabet positions are 1-indexed (A=1, B=2, ...).
     * @param char The character to check.
     * @param n The 'n' for Nth letter (e.g., 2 for 2nd letters, 3 for 3rd letters).
     * @returns True if the character is an Nth letter, false otherwise.
     */
    function isNthLetter(char: string, n: number): boolean {
        if (char === ' ') return false; // Spaces are not letters
        const charCode = char.charCodeAt(0);
        const positionInAlphabet = charCode - 'A'.charCodeAt(0) + 1; // Convert to 1-indexed position
        return positionInAlphabet % n === 0;
    }

    /**
     * Performs a circular shift on an array.
     * @param arr The array to shift.
     * @param direction 'left' for left circular shift, 'right' for right circular shift.
     * @returns The shifted array (modified in place).
     */
    function circularShift<T>(arr: T[], direction: 'left' | 'right'): T[] {
        if (arr.length === 0) return arr;
        if (direction === 'left') {
            const first = arr.shift();
            if (first !== undefined) arr.push(first);
        } else { // 'right'
            const last = arr.pop();
            if (last !== undefined) arr.unshift(last);
        }
        return arr;
    }

    /**
     * Implements the inverse of Scramble Step 4: Reversing word lengths.
     * This restores the phrase's word grouping to its state *before* Scramble Step 4.
     * @param phrase The phrase with scrambled word lengths.
     * @returns The phrase with word lengths restored to the state before Scramble Step 4.
     */
    function unscrambleStep4(phrase: string): string {
        const words = phrase.split(' ');
        const currentWordLengths = words.map(word => word.length);
        
        // To undo the scrambling step (original lengths [L1, L2, ...] -> scrambled lengths [..., L2, L1]),
        // we take the current scrambled lengths ([..., L2, L1]) and reverse them again to get the original grouping ([L1, L2, ...]).
        const targetWordLengths = [...currentWordLengths].reverse(); 

        const allLetters = words.join(''); // Get a continuous sequence of all letters without spaces
        let result = '';
        let currentLetterIndex = 0;

        // Reconstruct the phrase using the 'targetWordLengths'
        for (let i = 0; i < targetWordLengths.length; i++) {
            const len = targetWordLengths[i];
            result += allLetters.substring(currentLetterIndex, currentLetterIndex + len);
            currentLetterIndex += len;
            // Add space between words, but not after the last word
            if (i < targetWordLengths.length - 1) {
                result += ' ';
            }
        }
        return result;
    }

    /**
     * A generalized function to apply transformations (reverse, circular shift left/right)
     * to specific Nth letters within a phrase, while preserving spaces and other letters' positions.
     * This function is used for Inverse Steps 1, 2, and 3.
     * @param phrase The phrase (which may contain spaces) to transform.
     * @param nth The 'n' for Nth letters to target (e.g., 2, 3, or 4).
     * @param transformType The type of transformation to apply ('reverse', 'shiftLeft', 'shiftRight').
     * @returns The phrase with the specified letters transformed.
     */
    function applyLetterTransformation(
        phrase: string,
        nth: number,
        transformType: 'reverse' | 'shiftLeft' | 'shiftRight'
    ): string {
        const phraseChars = phrase.split(''); // Convert phrase to a mutable array of characters (including spaces)
        const targetLetters: string[] = [];
        const targetLetterOriginalIndices: number[] = [];

        // 1. Identify and extract the target Nth letters along with their original indices
        for (let i = 0; i < phraseChars.length; i++) {
            const char = phraseChars[i];
            if (isNthLetter(char, nth)) {
                targetLetters.push(char);
                targetLetterOriginalIndices.push(i);
            }
        }

        // 2. Apply the specified transformation to the extracted letters
        if (transformType === 'reverse') {
            targetLetters.reverse();
        } else if (transformType === 'shiftLeft') {
            circularShift(targetLetters, 'left');
        } else if (transformType === 'shiftRight') {
            circularShift(targetLetters, 'right');
        }

        // 3. Reinsert the transformed letters back into their original positions in the phrase
        for (let i = 0; i < targetLetters.length; i++) {
            phraseChars[targetLetterOriginalIndices[i]] = targetLetters[i];
        }

        return phraseChars.join(''); // Convert the character array back to a string
    }

    // --- Main Unscrambling Process ---
    // Apply the inverse steps in reverse order of the scrambling steps (4, 3, 2, 1).

    let currentPhrase = scrambledPhrase;

    // Inverse Step 4: Un-reverse word lengths (re-groups the words)
    // (Example: "MLSOHYTA RMLESS" becomes "MLSOHY TARMLESS")
    currentPhrase = unscrambleStep4(currentPhrase);

    // Inverse Step 3: Un-shift 4th letters (Scramble step was LEFT shift, so inverse is RIGHT shift)
    // (Example: "MLSOHY TARMLESS" becomes "MLSOLY HARMTESS")
    currentPhrase = applyLetterTransformation(currentPhrase, 4, 'shiftRight');

    // Inverse Step 2: Un-shift 3rd letters (Scramble step was RIGHT shift, so inverse is LEFT shift)
    // (Example: "MLSOLY HARMTESS" becomes "MOSLRY HALMTESS")
    currentPhrase = applyLetterTransformation(currentPhrase, 3, 'shiftLeft');

    // Inverse Step 1: Un-reverse 2nd letters (Scramble step was REVERSE, so inverse is REVERSE again)
    // (Example: "MOSLRY HALMTESS" becomes "MOSTLY HARMLESS")
    currentPhrase = applyLetterTransformation(currentPhrase, 2, 'reverse');

    // Output the final unscrambled phrase
    console.log(currentPhrase);
}

// Call the solve function to run the puzzle solution
solve();