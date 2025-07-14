// This declaration is necessary for TypeScript to recognize the `readline()` function,
// which is provided by the CodinGame environment.
declare function readline(): string;

/**
 * Calculates the number of bulls and cows for a given guess against a secret number.
 *
 * @param secret The 4-digit secret number string.
 * @param guess The 4-digit guess number string.
 * @returns An object containing the count of bulls and cows.
 */
function calculateBullsAndCows(secret: string, guess: string): { bulls: number, cows: number } {
    let bulls = 0;
    let cows = 0;

    // These boolean arrays track which digits in secret and guess have been 'used'
    // either as a bull or as a cow, preventing double-counting.
    // They are initialized to false, meaning no digit has been used yet.
    const secretUsed: boolean[] = new Array(4).fill(false);
    const guessUsed: boolean[] = new Array(4).fill(false);

    // First pass: Identify Bulls
    // A bull means a digit matches both value and position.
    // We iterate through the digits at the same position in both strings.
    for (let i = 0; i < 4; i++) {
        if (secret[i] === guess[i]) {
            bulls++;
            secretUsed[i] = true; // Mark this digit in secret as used by a bull
            guessUsed[i] = true;  // Mark this digit in guess as used by a bull
        }
    }

    // Second pass: Identify Cows
    // A cow means a digit matches value but is in the wrong position,
    // and has not already been counted as a bull.
    // We iterate through each digit of the guess.
    for (let i = 0; i < 4; i++) {
        // Only consider guess digits that haven't been used for a bull.
        if (!guessUsed[i]) {
            // Compare this guess digit with each digit of the secret.
            for (let j = 0; j < 4; j++) {
                // If this secret digit hasn't been used (neither for a bull nor a previous cow)
                // AND the guess digit matches the secret digit (but at a different position,
                // which is implicitly handled because bull matches are already marked used).
                if (!secretUsed[j] && guess[i] === secret[j]) {
                    cows++;
                    secretUsed[j] = true; // Mark this secret digit as used for a cow
                    break; // This guess digit has found its match, move to the next guess digit.
                           // This prevents a single secret digit from matching multiple guess digits as cows.
                }
            }
        }
    }

    return { bulls, cows };
}

// Read the number of guesses from standard input.
const N: number = parseInt(readline());

// Store all the given guesses along with their expected bull and cow counts.
// This array will hold objects, each representing one guess entry.
const guesses: { guess: string, expectedBulls: number, expectedCows: number }[] = [];
for (let i = 0; i < N; i++) {
    const lineParts = readline().split(' '); // Split the input line by space
    guesses.push({
        guess: lineParts[0],             // The 4-digit guess string
        expectedBulls: parseInt(lineParts[1]), // The expected number of bulls
        expectedCows: parseInt(lineParts[2])   // The expected number of cows
    });
}

// Iterate through all possible 4-digit secret numbers, from "0000" to "9999".
for (let i = 0; i <= 9999; i++) {
    // Format the current number `i` into a 4-digit string.
    // E.g., 5 becomes "0005", 123 becomes "0123". This is crucial for string manipulation.
    const possibleSecret = String(i).padStart(4, '0');
    let isConsistent = true; // Assume this possibleSecret is consistent until proven otherwise.

    // Check if the current `possibleSecret` is consistent with all the recorded guesses.
    for (const entry of guesses) {
        // Calculate the bulls and cows if `possibleSecret` were the true secret number
        // for the current guess (`entry.guess`).
        const { bulls, cows } = calculateBullsAndCows(possibleSecret, entry.guess);

        // If the calculated bulls or cows do not match the expected values from the input,
        // then this `possibleSecret` is not the correct one.
        if (bulls !== entry.expectedBulls || cows !== entry.expectedCows) {
            isConsistent = false; // Mark as inconsistent.
            break; // No need to check further guesses for this `possibleSecret`, move to the next one.
        }
    }

    // If, after checking all guesses, `isConsistent` is still true, it means we found the secret number.
    // As per the problem statement, there will be exactly one such number.
    if (isConsistent) {
        console.log(possibleSecret); // Print the secret number.
        break; // We found the answer, so we can stop the search.
    }
}