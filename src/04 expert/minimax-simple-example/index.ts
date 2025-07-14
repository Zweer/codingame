// Standard input/output for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

// Type alias for the result of minimax: [player1_score, player2_score]
type Result = [number, number];

// Global variables to store game state and precomputed data
let N: number; // Number of letters in the pile
let Q: number; // Number of scoring words
let initialLetters: string[]; // The original letters in the pile (as strings)
let wordScores: Map<string, number>; // Maps word to its score
let wordLetterMasks: Map<string, number>; // Maps word to a bitmask of its letters' original indices
let charToOriginalIndex: Map<string, number>; // Maps a character to its original index (0 to N-1)
let originalIndexToChar: string[]; // Maps an original index to its character

// Memoization table: Maps a BigInt key (representing game state) to a Result
const memo = new Map<bigint, Result>();

/**
 * Counts the number of set bits (1s) in a 32-bit integer.
 * Used to determine the number of letters remaining.
 * @param n The integer to count bits in.
 * @returns The number of set bits.
 */
function countSetBits(n: number): number {
    let count = 0;
    while (n > 0) {
        n &= (n - 1); // Brian Kernighan's algorithm: clears the least significant set bit
        count++;
    }
    return count;
}

/**
 * Calculates the score for a player based on their collected letters.
 * @param collectedLettersMask A bitmask representing the letters collected by the player.
 * @returns The total score for the player.
 */
function calculatePlayerScore(collectedLettersMask: number): number {
    let score = 0;
    // Iterate through all words in the dictionary
    for (const [word, wordScore] of wordScores.entries()) {
        const requiredWordMask = wordLetterMasks.get(word)!;
        // Check if all letters required for the word are present in the player's collected letters
        // This is true if (collectedLettersMask bitwise AND requiredWordMask) equals requiredWordMask
        if ((collectedLettersMask & requiredWordMask) === requiredWordMask) {
            score += wordScore;
        }
    }
    return score;
}

/**
 * Identifies the "first" and "second" letters available in the current pile.
 * "First" means the letter with the smallest original index whose bit is set in `remainingLettersMask`.
 * "Second" means the letter with the second smallest original index whose bit is set.
 * @param remainingLettersMask A bitmask of letters currently in the pile.
 * @returns An object containing the characters and their original indices for the first and second choices.
 */
function getAvailableChoices(remainingLettersMask: number): { char1: string | null, index1: number, char2: string | null, index2: number } {
    let count = 0;
    let char1: string | null = null;
    let index1 = -1;
    let char2: string | null = null;
    let index2 = -1;

    // Iterate through original indices to find the first and second available letters
    for (let i = 0; i < N; i++) {
        if (((remainingLettersMask >> i) & 1) === 1) { // If the letter at original index `i` is still in the pile
            if (count === 0) {
                char1 = originalIndexToChar[i];
                index1 = i;
            } else if (count === 1) {
                char2 = originalIndexToChar[i];
                index2 = i;
            }
            count++;
            if (count === 2) break; // Found both first and second letters
        }
    }
    return { char1, index1, char2, index2 };
}

/**
 * Implements the Minimax algorithm with Alpha-Beta pruning.
 * Returns the final scores for Player 1 and Player 2 assuming optimal play from this state.
 * @param remainingLettersMask Bitmask of letters still in the pile.
 * @param player1CollectedMask Bitmask of letters collected by Player 1.
 * @param player2CollectedMask Bitmask of letters collected by Player 2.
 * @param alpha The best score (difference) that the maximizing player (Player 1) can guarantee so far.
 * @param beta The best score (difference) that the minimizing player (Player 2) can guarantee so far.
 * @returns A tuple [player1_final_score, player2_final_score].
 */
function minimax(remainingLettersMask: number, player1CollectedMask: number, player2CollectedMask: number, alpha: number, beta: number): Result {
    // Determine whose turn it is based on the number of letters remaining
    const lettersRemaining = countSetBits(remainingLettersMask);
    const isPlayer1Turn = ((N - lettersRemaining) % 2 === 0); // P1 starts (turn 0, 2, ...), P2 (turn 1, 3, ...)

    // Construct a unique key for memoization using BigInt
    // The key combines remaining letters, P1's collected letters, and P2's collected letters
    // Example: (remainingMask (26 bits) << 52) | (p1Mask (26 bits) << 26) | p2Mask (26 bits)
    const key: bigint = (BigInt(remainingLettersMask) << BigInt(2 * N)) | (BigInt(player1CollectedMask) << BigInt(N)) | BigInt(player2CollectedMask);
    if (memo.has(key)) {
        return memo.get(key)!;
    }

    // Base case: No letters left in the pile, game ends.
    if (lettersRemaining === 0) {
        const p1Score = calculatePlayerScore(player1CollectedMask);
        const p2Score = calculatePlayerScore(player2CollectedMask);
        memo.set(key, [p1Score, p2Score]);
        return [p1Score, p2Score];
    }

    // Get the current choices for the "first" and "second" letters
    const { char1, index1, char2, index2 } = getAvailableChoices(remainingLettersMask);

    let bestP1Score: number;
    let bestP2Score: number;

    // Player 1 (Maximizer): Chooses moves to maximize (P1_score - P2_score)
    if (isPlayer1Turn) {
        let maxDiff = -Infinity;
        bestP1Score = -Infinity;
        bestP2Score = Infinity; 

        // Option 1: Current player takes the first letter
        const newRemainingMask1 = remainingLettersMask & ~(1 << index1);
        const newP1CollectedMask1 = player1CollectedMask | (1 << index1);
        
        // Recursive call for the next state
        const [s1_opt1, s2_opt1] = minimax(newRemainingMask1, newP1CollectedMask1, player2CollectedMask, alpha, beta);
        const currentDiff1 = s1_opt1 - s2_opt1;

        if (currentDiff1 > maxDiff) {
            maxDiff = currentDiff1;
            bestP1Score = s1_opt1;
            bestP2Score = s2_opt1;
        }
        alpha = Math.max(alpha, maxDiff); // Update alpha
        if (beta <= alpha) { // Alpha-beta pruning: If beta is less than or equal to alpha, prune
            memo.set(key, [bestP1Score, bestP2Score]);
            return [bestP1Score, bestP2Score];
        }

        // Option 2: Current player takes the second letter (if available)
        // "At the last turn, the last player has no choice but getting the last letter."
        // So, if only one letter is left (lettersRemaining === 1), Option 2 is not possible.
        if (lettersRemaining > 1 && char2 !== null) {
            const newRemainingMask2 = remainingLettersMask & ~(1 << index2);
            const newP1CollectedMask2 = player1CollectedMask | (1 << index2);
            
            const [s1_opt2, s2_opt2] = minimax(newRemainingMask2, newP1CollectedMask2, player2CollectedMask, alpha, beta);
            const currentDiff2 = s1_opt2 - s2_opt2;

            // Problem statement guarantees unique best solution, so strict '>' is fine for player 1.
            // However, a typical minimax usually uses '>=' to handle ties, and the problem constraints might
            // rely on specific tie-breaking (e.g., prefer taking first, then second letter if equal score).
            // Here, we maintain the best seen so far, if the next option is strictly better, we choose it.
            if (currentDiff2 > maxDiff) {
                maxDiff = currentDiff2;
                bestP1Score = s1_opt2;
                bestP2Score = s2_opt2;
            }
            alpha = Math.max(alpha, maxDiff); // Update alpha
            if (beta <= alpha) { // Alpha-beta pruning
                memo.set(key, [bestP1Score, bestP2Score]);
                return [bestP1Score, bestP2Score];
            }
        }
    }
    // Player 2 (Minimizer): Chooses moves to minimize (P1_score - P2_score)
    else {
        let minDiff = Infinity;
        bestP1Score = Infinity; 
        bestP2Score = -Infinity;

        // Option 1: Current player takes the first letter
        const newRemainingMask1 = remainingLettersMask & ~(1 << index1);
        const newP2CollectedMask1 = player2CollectedMask | (1 << index1);
        
        const [s1_opt1, s2_opt1] = minimax(newRemainingMask1, player1CollectedMask, newP2CollectedMask1, alpha, beta);
        const currentDiff1 = s1_opt1 - s2_opt1;

        if (currentDiff1 < minDiff) {
            minDiff = currentDiff1;
            bestP1Score = s1_opt1;
            bestP2Score = s2_opt1;
        }
        beta = Math.min(beta, minDiff); // Update beta
        if (beta <= alpha) { // Alpha-beta pruning
            memo.set(key, [bestP1Score, bestP2Score]);
            return [bestP1Score, bestP2Score];
        }

        // Option 2: Current player takes the second letter (if available)
        if (lettersRemaining > 1 && char2 !== null) {
            const newRemainingMask2 = remainingLettersMask & ~(1 << index2);
            const newP2CollectedMask2 = player2CollectedMask | (1 << index2);
            
            const [s1_opt2, s2_opt2] = minimax(newRemainingMask2, player1CollectedMask, newP2CollectedMask2, alpha, beta);
            const currentDiff2 = s1_opt2 - s2_opt2;

            if (currentDiff2 < minDiff) {
                minDiff = currentDiff2;
                bestP1Score = s1_opt2;
                bestP2Score = s2_opt2;
            }
            beta = Math.min(beta, minDiff); // Update beta
            if (beta <= alpha) { // Alpha-beta pruning
                memo.set(key, [bestP1Score, bestP2Score]);
                return [bestP1Score, bestP2Score];
            }
        }
    }

    // Store the best result for the current state before returning
    memo.set(key, [bestP1Score, bestP2Score]);
    return [bestP1Score, bestP2Score];
}

// --- Main execution logic ---

// Read N and Q from the first line
const input = readline().split(' ').map(Number);
N = input[0];
Q = input[1];

// Read the N letters and populate charToOriginalIndex and originalIndexToChar
initialLetters = readline().split(' ');
charToOriginalIndex = new Map<string, number>();
originalIndexToChar = new Array<string>(N);
for (let i = 0; i < N; i++) {
    charToOriginalIndex.set(initialLetters[i], i);
    originalIndexToChar[i] = initialLetters[i];
}

// Read the Q words and their scores, and precompute word letter masks
wordScores = new Map<string, number>();
wordLetterMasks = new Map<string, number>();
for (let i = 0; i < Q; i++) {
    const line = readline().split(' ');
    const word = line[0];
    const score = parseInt(line[1]);
    wordScores.set(word, score);

    let mask = 0;
    // Create a bitmask for the letters in the current word
    for (const char of word) {
        mask |= (1 << charToOriginalIndex.get(char)!);
    }
    wordLetterMasks.set(word, mask);
}

// Determine the best first move for Player 1
let bestOverallChar: string = '';
let bestOverallScores: Result = [-Infinity, Infinity]; // Initialize with a very low difference to be maximized
let bestOverallDiff = -Infinity;

// The initial mask where all letters are available
const initialMask = (1 << N) - 1;

// Get the two available choices for the very first turn
const { char1: firstChoiceChar, index1: firstChoiceIndex, char2: secondChoiceChar, index2: secondChoiceIndex } = getAvailableChoices(initialMask);

// --- Option 1: Player 1 takes the first letter ---
if (firstChoiceChar !== null) {
    const newRemainingMask1 = initialMask & ~(1 << firstChoiceIndex); // Remove the taken letter
    const newP1CollectedMask1 = (1 << firstChoiceIndex); // P1 collects this letter
    const newP2CollectedMask1 = 0; // P2 has collected nothing yet
    
    // Call minimax for the state after P1 makes this choice. It's P2's turn next.
    // Initial alpha = -Infinity, beta = +Infinity for the root of the Minimax tree.
    const [p1Score1, p2Score1] = minimax(newRemainingMask1, newP1CollectedMask1, newP2CollectedMask1, -Infinity, Infinity);
    const currentDiff1 = p1Score1 - p2Score1;

    // Update best overall choice if this option yields a better score difference for P1
    if (currentDiff1 > bestOverallDiff) {
        bestOverallDiff = currentDiff1;
        bestOverallChar = firstChoiceChar;
        bestOverallScores = [p1Score1, p2Score1];
    }
}

// --- Option 2: Player 1 takes the second letter ---
// This option is only available if there are at least two letters initially (N > 1)
if (secondChoiceChar !== null) {
    const newRemainingMask2 = initialMask & ~(1 << secondChoiceIndex); // Remove the taken letter
    const newP1CollectedMask2 = (1 << secondChoiceIndex); // P1 collects this letter
    const newP2CollectedMask2 = 0; // P2 has collected nothing yet

    // Call minimax for the state after P1 makes this choice. It's P2's turn next.
    const [p1Score2, p2Score2] = minimax(newRemainingMask2, newP1CollectedMask2, newP2CollectedMask2, -Infinity, Infinity);
    const currentDiff2 = p1Score2 - p2Score2;

    // Update best overall choice if this option yields a better score difference for P1
    // The problem states a unique best solution, so strict '>' is appropriate here.
    if (currentDiff2 > bestOverallDiff) {
        bestOverallDiff = currentDiff2;
        bestOverallChar = secondChoiceChar;
        bestOverallScores = [p1Score2, p2Score2];
    }
}

// Output the best first choice character and the expected final scores
print(`${bestOverallChar} ${bestOverallScores[0]}-${bestOverallScores[1]}`);