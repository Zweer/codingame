// Standard input reading setup for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Global random_seed variable as required by the problem statement for reproducibility
let random_seed = 0;

/**
 * Function to pick an option index using the specified pseudo-random logic.
 * @param num_of_options The number of available options.
 * @returns The index of the chosen option.
 */
function pick_option_index(num_of_options: number): number {
    random_seed += 7;
    return random_seed % num_of_options;
}

// Read input values
const text: string = readline();
const depth: number = parseInt(readline());
const length: number = parseInt(readline());
const seed: string = readline();

// 1. Build the Markov Chain (lookup table)
const words: string[] = text.split(' ');
const markovChain = new Map<string, string[]>();

// Iterate through the training words to create n-grams and their following words.
// The loop runs until the last possible n-gram can be formed,
// and there's a word immediately following it.
// For example, if words = [w1, w2, w3, w4] and depth = 2:
// i = 0: n-gram ["w1", "w2"], next word "w3"
// i = 1: n-gram ["w2", "w3"], next word "w4"
// The loop stops when `i + depth` reaches `words.length`, meaning `i = words.length - depth`.
// So, `i` goes from `0` to `words.length - depth - 1`.
for (let i = 0; i <= words.length - depth - 1; i++) {
    // Extract the current n-gram (sequence of `depth` words)
    const currentNgramWords: string[] = words.slice(i, i + depth);
    const currentNgramKey: string = currentNgramWords.join(' '); // Use space as delimiter for the key

    // The word immediately following the n-gram
    const nextWord: string = words[i + depth];

    // Add the next word to the list of possibilities for this n-gram
    if (!markovChain.has(currentNgramKey)) {
        markovChain.set(currentNgramKey, []);
    }
    // We can use the non-null assertion `!` because we just checked `has` or created the entry.
    markovChain.get(currentNgramKey)!.push(nextWord); 
}

// 2. Generate Text
// Start with the seed words. This array will accumulate all generated words.
const generatedWords: string[] = seed.split(' ');

// Generate additional words until the desired 'length' is reached.
// The loop starts from the current number of words already in `generatedWords`
// and continues until `length` total words are accumulated.
for (let i = generatedWords.length; i < length; i++) {
    // The n-gram used for lookup is always the last `depth` words
    // of the currently `generatedWords` sequence.
    // This implies that `generatedWords.length` must be at least `depth`
    // to form a valid `depth`-length n-gram key.
    // If the seed has fewer words than `depth`, the `slice` might produce a shorter array,
    // leading to a key that won't be found in the `markovChain` (which contains `depth`-length keys).
    // The problem's example ("fish is" with depth 2) implies initial seed length >= depth.
    const currentNgramWords: string[] = generatedWords.slice(generatedWords.length - depth, generatedWords.length);
    const currentNgramKey: string = currentNgramWords.join(' ');

    // Get the list of possible next words for the current n-gram.
    const possibleNextWords: string[] | undefined = markovChain.get(currentNgramKey);

    // If no possible next words are found (i.e., we hit a dead end in the chain),
    // or if the n-gram key wasn't in the training data, stop generation.
    if (!possibleNextWords || possibleNextWords.length === 0) {
        break;
    }

    // Pick the next word using the specified pseudo-random function.
    const nextWordIndex: number = pick_option_index(possibleNextWords.length);
    const nextWord: string = possibleNextWords[nextWordIndex];

    // Add the chosen word to the generated sequence.
    generatedWords.push(nextWord);
}

// 3. Output the result
// Finally, ensure the output has exactly `length` words.
// If `generatedWords` became longer than `length` (e.g., if the seed itself was too long),
// `slice(0, length)` truncates it. If generation stopped early, it outputs what was generated.
const finalOutput: string[] = generatedWords.slice(0, length);
print(finalOutput.join(' '));