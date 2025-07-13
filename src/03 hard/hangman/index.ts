// The `readline` function is provided by the CodinGame environment for reading input.

// Read the target word or phrase to be guessed.
const entry: string = readline();
// Read the list of lowercase letters guessed by the player, separated by whitespace.
const guesses: string[] = readline().split(' ');

// Pre-defined ASCII art for the hangman at different mistake levels (0 to 6).
// Each inner array contains the 4 lines for a specific state.
// Note: No trailing whitespace at the end of lines as per problem statement.
const hangmanArt: string[][] = [
    // 0 errors: Initial state
    ["+--+", "|", "|", "|\\"],
    // 1 error: Head (o)
    ["+--+", "|  o", "|", "|\\"],
    // 2 errors: Body (|)
    ["+--+", "|  o", "|  |", "|\\"],
    // 3 errors: Left arm (/)
    ["+--+", "|  o", "| /|", "|\\"],
    // 4 errors: Right arm (\)
    ["+--+", "|  o", "| /|\\", "|\\"],
    // 5 errors: Left leg (/)
    ["+--+", "|  o", "| /|\\", "|\\/"],
    // 6 errors: Right leg (\) - Game Over
    ["+--+", "|  o", "| /|\\", "|\\/ \\"]
];

// Initialize game state variables
let mistakes: number = 0; // Counts the number of incorrect guesses
// Convert the entry to lowercase for case-insensitive comparison with guesses
const originalEntryLowercase: string = entry.toLowerCase();
// Set to store all unique letters that have been guessed (correct or incorrect)
// This is used to identify repeated guesses.
const guessedLetters: Set<string> = new Set<string>();
// Set to store only the letters that are part of the original entry and have been correctly revealed.
// This is used to construct the displayed word.
const revealedLetters: Set<string> = new Set<string>();

// Simulate the game turn by turn, processing each guessed letter
for (const guessChar of guesses) {
    if (guessedLetters.has(guessChar)) {
        // Rule: If a letter is repeated, it's always considered an error.
        mistakes++;
    } else {
        // This is a new, unique guess. Add it to the set of all guessed letters.
        guessedLetters.add(guessChar);

        // Check if the guessed letter exists in the original word/phrase.
        // String.prototype.includes() is used for checking existence.
        if (originalEntryLowercase.includes(guessChar)) {
            // Correct guess: add the letter to our set of revealed letters.
            revealedLetters.add(guessChar);
        } else {
            // Incorrect guess: increment the mistake count.
            mistakes++;
        }
    }
}

// Determine the final state index for the hangman art.
// The maximum number of distinct hangman drawings is 7 (0 to 6 mistakes).
// If `mistakes` exceeds 6, we still show the 6-mistake drawing.
const finalMistakesIndex: number = Math.min(mistakes, 6);

// Output the hangman ASCII art (first 4 lines of output).
for (let i = 0; i < 4; i++) {
    console.log(hangmanArt[finalMistakesIndex][i]);
}

// Construct the final displayed word (5th line of output).
let displayWord: string = '';
for (const char of originalEntryLowercase) {
    if (char === ' ') {
        // Spaces in the entry are always visible.
        displayWord += ' ';
    } else if (revealedLetters.has(char)) {
        // Letters that have been correctly guessed are displayed.
        displayWord += char;
    } else {
        // Letters that have not been correctly guessed yet are represented by an underscore.
        displayWord += '_';
    }
}

// Output the current state of the guessed word.
console.log(displayWord);