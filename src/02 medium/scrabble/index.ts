/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is typically provided globally.
 * For local testing, you might need to mock it or use Node.js's readline module.
 */
declare function readline(): string;

/**
 * Prints a message to standard output.
 * In a CodinGame environment, this function is typically provided globally.
 * For local testing, you might use console.log.
 */
declare function print(message: any): void;


// Define the points for each letter according to Scrabble rules.
const letterScores: { [key: string]: number } = {
    'e': 1, 'a': 1, 'i': 1, 'o': 1, 'n': 1, 'r': 1, 't': 1, 'l': 1, 's': 1, 'u': 1,
    'd': 2, 'g': 2,
    'b': 3, 'c': 3, 'm': 3, 'p': 3,
    'f': 4, 'h': 4, 'v': 4, 'w': 4, 'y': 4,
    'k': 5,
    'j': 8, 'x': 8,
    'q': 10, 'z': 10
};

/**
 * Calculates the Scrabble score for a given word.
 * @param word The word to score.
 * @returns The total score of the word.
 */
function calculateWordScore(word: string): number {
    let score = 0;
    for (const char of word) {
        score += letterScores[char] || 0; // Add 0 if char not found (shouldn't happen with valid scrabble letters)
    }
    return score;
}

/**
 * Generates a frequency map of characters from a given string.
 * @param letters The string to count characters from.
 * @returns A Map where keys are characters and values are their counts.
 */
function getLetterCounts(letters: string): Map<string, number> {
    const counts = new Map<string, number>();
    for (const char of letters) {
        counts.set(char, (counts.get(char) || 0) + 1);
    }
    return counts;
}

/**
 * Checks if a word can be formed using the available letters.
 * This function modifies a copy of the available letters map, so the original remains intact.
 * @param word The word to check.
 * @param availableLetters A Map containing the counts of available letters.
 * @returns True if the word can be formed, false otherwise.
 */
function canFormWord(word: string, availableLetters: Map<string, number>): boolean {
    // Create a mutable copy of the available letters map for this word check.
    const tempAvailable = new Map(availableLetters);

    for (const char of word) {
        const count = tempAvailable.get(char);
        if (count === undefined || count <= 0) {
            // Not enough of this letter available.
            return false;
        }
        // "Use" one instance of the letter.
        tempAvailable.set(char, count - 1);
    }
    return true; // The word can be formed.
}

// --- Main Program Logic ---

// Read the number of words in the dictionary.
const N: number = parseInt(readline());

// Read all dictionary words.
const dictionary: string[] = [];
for (let i = 0; i < N; i++) {
    dictionary.push(readline());
}

// Read the 7 available letters.
const availableLettersString: string = readline();
// Convert the available letters string into a frequency map.
const availableLettersCounts: Map<string, number> = getLetterCounts(availableLettersString);

let bestWord: string = '';
let maxScore: number = -1; // Initialize with a value lower than any possible score.

// Iterate through each word in the dictionary.
for (const word of dictionary) {
    // Check if the current word can be formed using the available letters.
    if (canFormWord(word, availableLettersCounts)) {
        const currentScore = calculateWordScore(word);

        // If this word scores higher than the current best, or if it's the first valid word found.
        if (currentScore > maxScore) {
            maxScore = currentScore;
            bestWord = word;
        }
        // If currentScore === maxScore, we stick with the 'bestWord' found earlier,
        // which naturally satisfies the tie-breaking rule (first in dictionary order).
    }
}

// Print the word that scores the most points.
print(bestWord);