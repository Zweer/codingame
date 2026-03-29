// Standard CodinGame input/output setup.
// These declarations are typically provided by the CodinGame environment.
declare function readline(): string;
declare function print(message: string): void; 

// Define constants for special words and limits
const __START__ = "__START__";
const __END__ = "__END__";
const AUTOMATON_KEYWORD = "Automaton2000";
const MAX_SENTENCE_WORDS = 30; // Maximum number of words in a generated sentence

// Type definitions for clarity
type WordCounts = Map<string, number>; // Maps a word to its frequency count
type WordGraph = Map<string, WordCounts>; // Maps a previous word to its possible next words and their counts

// The global word graph that stores all learned relationships
const wordGraph: WordGraph = new Map();

/**
 * Adds or increments the count of a relationship between a previous word and a next word.
 * This function builds the word graph based on observed sequences.
 * @param prevWord The word preceding `nextWord`.
 * @param nextWord The word succeeding `prevWord`.
 */
function addRelationship(prevWord: string, nextWord: string): void {
    // Ensure the prevWord exists in the graph
    if (!wordGraph.has(prevWord)) {
        wordGraph.set(prevWord, new Map());
    }
    // Get the map of next words for prevWord and increment the count for nextWord
    const nextWordsMap = wordGraph.get(prevWord)!; // '!' asserts that nextWordsMap is not undefined
    nextWordsMap.set(nextWord, (nextWordsMap.get(nextWord) || 0) + 1);
}

/**
 * Generates a sentence based on the current state of the wordGraph.
 * It starts from __START__, selects the most frequent next word,
 * breaking ties alphabetically, and stops at __END__ or MAX_SENTENCE_WORDS.
 * @returns The generated sentence as a single string.
 */
function generateSentence(): string {
    let currentWord = __START__;
    const sentence: string[] = [];

    // Loop to build the sentence, up to the maximum word limit
    for (let i = 0; i < MAX_SENTENCE_WORDS; i++) {
        const possibleNextWords = wordGraph.get(currentWord);

        // If there are no words following the current word, or the graph is empty for this branch, stop.
        if (!possibleNextWords || possibleNextWords.size === 0) {
            break;
        }

        // Convert the map of possible next words into an array of [word, count] entries.
        // Then, sort this array to find the "best" next word based on the puzzle's rules:
        // 1. Highest count (most frequent) first.
        // 2. Alphabetical order (case-sensitive) for words with the same count.
        const sortedNextWords = Array.from(possibleNextWords.entries()).sort((a, b) => {
            const [wordA, countA] = a;
            const [wordB, countB] = b;

            // Primary sort criterion: descending by count (higher count comes first)
            if (countA !== countB) {
                return countB - countA;
            }
            // Secondary sort criterion: ascending alphabetically for ties in count
            return wordA.localeCompare(wordB);
        });

        // The first element after sorting is the best choice
        const bestNextWordEntry = sortedNextWords[0];

        // If no best word could be determined (shouldn't happen if possibleNextWords.size > 0),
        // or if the chosen word is the end-of-sentence marker, break the loop.
        if (!bestNextWordEntry || bestNextWordEntry[0] === __END__) {
            break;
        }

        const bestNextWord = bestNextWordEntry[0];
        sentence.push(bestNextWord); // Add the chosen word to the sentence
        currentWord = bestNextWord; // Move to the next word
    }

    // Join the words to form the final sentence string
    return sentence.join(" ");
}

// Main program execution flow
const n: number = parseInt(readline()); // Read the total number of chat lines

// Process each chat line
for (let i = 0; i < n; i++) {
    const line: string = readline();

    // Extract the message part from the chat line.
    // The format is "(HH:MM:SS) UserName: Message".
    // We find the last colon to accurately get the start of the message content.
    const lastColonIndex = line.lastIndexOf(":");
    let rawMessage = "";
    // Ensure that the colon exists and there's content after ": "
    if (lastColonIndex !== -1 && lastColonIndex + 2 < line.length) {
        rawMessage = line.substring(lastColonIndex + 2);
    } else {
        // If the line format is unexpected or invalid, skip it.
        // This is a defensive check, as puzzle inputs are usually well-formed.
        continue; 
    }

    // Split the raw message into words using space as a delimiter.
    // Filter out any empty strings that might result from multiple spaces.
    // Also, filter out the "Automaton2000" keyword itself, as it's ignored for learning.
    const words = rawMessage.split(" ").filter(word => word.length > 0 && word !== AUTOMATON_KEYWORD);

    // Build or update the word graph with relationships from the current line
    if (words.length > 0) {
        addRelationship(__START__, words[0]); // Connect __START__ to the first word
        for (let j = 0; j < words.length - 1; j++) {
            addRelationship(words[j], words[j + 1]); // Connect consecutive words
        }
        addRelationship(words[words.length - 1], __END__); // Connect the last word to __END__
    }

    // After processing the line and updating the graph, check if the line
    // contains the trigger keyword "Automaton2000". If it does, generate and print a sentence.
    if (line.includes(AUTOMATON_KEYWORD)) {
        console.log(generateSentence()); // Output the generated sentence
    }
}