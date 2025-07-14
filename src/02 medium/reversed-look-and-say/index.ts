// Required for CodinGame: readline() for input and console.log() for output.
declare function readline(): string;
// Using console.log as it's more standard for TypeScript.

/**
 * Applies the Look-and-Say transformation to a given string.
 * For example: "1" -> "11" (one 1); "21" -> "1211" (one 2, one 1)
 * "13112221" -> "1113213211"
 * @param s The input string.
 * @returns The transformed string.
 */
function applyLookAndSay(s: string): string {
    if (s.length === 0) {
        return "";
    }

    let result = "";
    let i = 0;
    while (i < s.length) {
        let count = 1;
        const digit = s[i];
        let j = i + 1;
        
        // Count consecutive identical digits
        while (j < s.length && s[j] === digit) {
            count++;
            j++;
        }
        
        // Append the count followed by the digit
        result += count.toString() + digit;
        
        // Move to the next distinct digit group
        i = j;
    }
    return result;
}

/**
 * Attempts to reverse the Look-and-Say transformation.
 * It parses the input string as a sequence of (count, digit) pairs.
 * For example: "1113213211" -> "13112221" (1x'1', 1x'3', 2x'1', 3x'2', 1x'1')
 * @param s The input string, which is expected to be a result of a Look-and-Say operation.
 * @returns The reversed string or null if the input string cannot be validly parsed
 *          as (count, digit) pairs (e.g., odd length, non-digit characters, zero count).
 */
function reverseLookAndSay(s: string): string | null {
    // A string representing a Look-and-Say sequence must have an even length
    // because it's a series of (count, digit) pairs.
    if (s.length % 2 !== 0) {
        return null;
    }

    let result = "";
    for (let i = 0; i < s.length; i += 2) {
        const countChar = s[i];
        const digitChar = s[i + 1];

        // Parse the count character. It must be a digit '1' through '9'.
        // Look-and-Say sequences don't have counts of zero or non-digits.
        const count = parseInt(countChar);

        // Basic validation for the parsed count and the digit character.
        // `isNaN(count)` checks if countChar was not a valid number.
        // `count < 1 || count > 9` ensures count is a single digit from 1 to 9.
        // `!/\d/.test(digitChar)` checks if digitChar is not a digit (0-9).
        if (isNaN(count) || count < 1 || count > 9 || !/\d/.test(digitChar)) {
            // If any part of the pair is invalid, the string cannot be correctly reversed.
            return null; 
        }
        
        // Append the digit repeated 'count' times.
        result += digitChar.repeat(count);
    }
    return result;
}

// Read the initial element of the series from standard input.
const n: string = readline();

// `current` tracks the string being processed in the current iteration.
// `lastValidPredecessor` stores the most recent string that was successfully
// verified as a predecessor in the Look-and-Say series.
// The input 'n' is guaranteed to be a valid element, so it's our starting point.
let current = n;
let lastValidPredecessor = n; 

// Loop to walk the series in reverse until the first valid element is found.
while (true) {
    // 1. Attempt to reverse `current` using `reverseLookAndSay`.
    const nextCandidate = reverseLookAndSay(current);

    // Stop Condition A: If `nextCandidate` is null, it means `current` cannot be parsed
    // as a valid (count, digit) sequence. This signifies the end of the valid reverse chain.
    // The `lastValidPredecessor` holds the answer.
    if (nextCandidate === null) {
        console.log(lastValidPredecessor);
        break; 
    }

    // 2. Validate the `nextCandidate`:
    // Apply the forward Look-and-Say transformation to `nextCandidate`.
    // If the result *does not* equal `current`, then `nextCandidate` is not the correct predecessor.
    // This is the "process is not always reversible" scenario described in the puzzle.
    const checkForward = applyLookAndSay(nextCandidate);

    if (checkForward === current) {
        // `nextCandidate` is a valid and correct predecessor.
        // Update `lastValidPredecessor` and continue reversing from `nextCandidate`.
        lastValidPredecessor = nextCandidate;
        current = nextCandidate;
    } else {
        // Stop Condition B: `nextCandidate` is not the *correct* predecessor for `current`.
        // This means `lastValidPredecessor` (the element that correctly generated `current`) is the answer.
        console.log(lastValidPredecessor);
        break; 
    }
}