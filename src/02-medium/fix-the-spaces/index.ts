/**
 * Represents a node in the Trie data structure.
 */
class TrieNode {
    children: Map<string, TrieNode>;
    isWordEnd: boolean; // True if a word ends at this node

    constructor() {
        this.children = new Map();
        this.isWordEnd = false;
    }
}

/**
 * Implements a Trie (Prefix Tree) for efficient word lookup.
 */
class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    /**
     * Inserts a word into the Trie.
     * @param word The word to insert.
     */
    insert(word: string): void {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!; // '!' asserts that the value is non-null/undefined
        }
        node.isWordEnd = true;
    }
}

// Read input from stdin
const original = readline();
const wordsInput = readline();

// Preprocessing: Build the Trie from the given words
const wordsArray = wordsInput.split(' ');
const trie = new Trie();
for (const word of wordsArray) {
    if (word.length > 0) { // Avoid inserting empty strings if there are multiple spaces
        trie.insert(word);
    }
}

// Memoization table: Stores results of solve(index)
// Map<number, string | null>
// - null: indicates ambiguity (multiple ways to segment from this index)
// - "": indicates successful segmentation of an empty suffix (base case at N)
// - string: indicates a unique and successfully segmented suffix
const memo = new Map<number, string | null>();
const N = original.length;

/**
 * Recursively finds a unique segmentation for the suffix of 'original' starting from 'index'.
 * Uses memoization to store and retrieve results of subproblems.
 * @param index The starting index in the 'original' string.
 * @returns A string representing the unique segmentation, null if ambiguous, or "" for success at N.
 */
function solve(index: number): string | null {
    // Base case: If we reached the end of the original string
    if (index === N) {
        return ""; // Successfully parsed the entire string (empty suffix)
    }

    // Memoization check: If this subproblem has already been solved
    if (memo.has(index)) {
        return memo.get(index)!; // '!' asserts that the value is non-null/undefined
    }

    // This set will temporarily store all unique ways found to parse the suffix
    // starting from 'index' via different first words.
    const possibleSuffixes = new Set<string>(); 

    let currentNode = trie.root;
    // Iterate through characters from 'index' to try and form words
    for (let j = index; j < N; j++) {
        const char = original[j];

        // Traverse the Trie using the current character
        if (!currentNode.children.has(char)) {
            // No word in the Trie starts with the current prefix (original[index...j])
            // So, no more words can be formed starting at 'index' by extending this path.
            break; 
        }

        currentNode = currentNode.children.get(char)!;

        // If 'currentNode' marks the end of a valid word
        if (currentNode.isWordEnd) {
            // 'currentWord' is original.substring(index, j + 1)
            const currentWord = original.substring(index, j + 1);
            
            // Recursively call solve for the rest of the string after 'currentWord'
            const nextSuffixResult = solve(j + 1);

            // Handle the result from the recursive call
            if (nextSuffixResult === null) {
                // If the rest of the string is ambiguous, then this whole path is ambiguous.
                // Store null in memo and return immediately to propagate ambiguity.
                memo.set(index, null);
                return null;
            } else if (nextSuffixResult === "") {
                // The rest of the string was parsed successfully to its end (empty suffix).
                // Add just the 'currentWord' as a valid segmentation for this path.
                possibleSuffixes.add(currentWord);
            } else {
                // The rest of the string had a unique segmentation.
                // Combine 'currentWord' with that unique segmentation.
                possibleSuffixes.add(currentWord + " " + nextSuffixResult);
            }
            
            // If at any point we find more than one distinct way to segment the suffix
            // starting from 'index', it means it's ambiguous.
            // Store null in memo and return immediately.
            if (possibleSuffixes.size > 1) {
                memo.set(index, null);
                return null;
            }
        }
    }

    // After iterating through all possible words starting at 'index'
    if (possibleSuffixes.size === 0) {
        // No valid segmentation found from 'index'.
        // Based on the problem statement ("at least one solution"), this case
        // should ideally only occur if 'index === N' (handled by base case)
        // or if a previous recursive call led to an unresolvable path.
        // It signals that this path cannot lead to a complete valid solution.
        memo.set(index, ""); 
        return ""; 
    } else if (possibleSuffixes.size === 1) {
        // Exactly one unique way to segment the suffix was found.
        const uniqueSolution = possibleSuffixes.values().next().value;
        memo.set(index, uniqueSolution);
        return uniqueSolution;
    } else { // This case (possibleSuffixes.size > 1) should have been caught earlier by the check inside the loop.
             // It means multiple distinct first words starting at 'index' led to unique,
             // but different, full segmentations.
        memo.set(index, null);
        return null;
    }
}

// Start the segmentation process from the beginning of the original string (index 0)
const finalResult = solve(0);

// Output the result
if (finalResult === null) {
    console.log("Unsolvable");
} else {
    console.log(finalResult);
}