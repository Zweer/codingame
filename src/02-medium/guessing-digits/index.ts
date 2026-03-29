// Standard CodinGame input/output
declare function readline(): string;
declare function print(message: any): void;

// Helper functions for pair manipulation
/**
 * Formats a pair of numbers [a, b] into a canonical string representation 'min,max'.
 * This ensures that (1,2) and (2,1) both map to '1,2', which is useful for Set keys.
 * @param a The first digit.
 * @param b The second digit.
 * @returns A string representing the pair (e.g., '1,2').
 */
function formatPair(a: number, b: number): string {
    return (a <= b) ? `${a},${b}` : `${b},${a}`;
}

/**
 * Parses a string representation of a pair 'a,b' back into a number array [a, b].
 * @param s The string to parse (e.g., '1,2').
 * @returns A number array representing the pair [a, b].
 */
function parsePair(s: string): [number, number] {
    const parts = s.split(',').map(Number);
    return [parts[0], parts[1]];
}

// Precompute all initial valid (a,b) pairs where 1 <= a, b <= 9.
// We store them in their canonical [a,b] form where a <= b.
const allInitialPairs: [number, number][] = [];
for (let a = 1; a <= 9; a++) {
    for (let b = a; b <= 9; b++) { // Ensure a <= b for canonical representation
        allInitialPairs.push([a, b]);
    }
}

// Read input: S (sum for Burt) and P (product for Sarah)
const S: number = parseInt(readline());
const P: number = parseInt(readline());

// `currentKnowledge` is a set of string representations of pairs ('a,b')
// that are currently considered possible by both Burt and Sarah.
// Initially, all valid pairs are considered possible.
let currentKnowledge: Set<string> = new Set(allInitialPairs.map(p => formatPair(p[0], p[1])));
let rounds: number = 0; // Tracks the number of full rounds (Burt then Sarah)

/**
 * Checks if a player (Burt or Sarah) would know the pair given their secret value
 * (S for Burt, P for Sarah) and the current set of public knowledge.
 * A player knows if exactly one pair in `knownPairsAsStrings` matches their secret.
 * @param secretKey 'sum' or 'product', indicating which secret value to check.
 * @param secretValue The actual sum or product the player knows.
 * @param knownPairsAsStrings The current set of possible pairs known publicly.
 * @returns True if the player would know the digits, false otherwise.
 */
function wouldPlayerKnow(
    secretKey: 'sum' | 'product',
    secretValue: number,
    knownPairsAsStrings: Set<string>
): boolean {
    let count = 0;
    for (const pStr of knownPairsAsStrings) {
        const pair = parsePair(pStr);
        if (secretKey === 'sum' && (pair[0] + pair[1]) === secretValue) {
            count++;
        } else if (secretKey === 'product' && (pair[0] * pair[1]) === secretValue) {
            count++;
        }
    }
    return count === 1;
}

/**
 * Updates `currentKnowledge` after a player says "I don't know".
 * If a player says "I don't know", it implies that the true pair's secret value
 * must not be one that would have allowed them to uniquely identify the pair
 * given the `currentKnowledge` at that moment.
 * @param knownPairsAsStrings The current set of possible pairs known publicly.
 * @param playerRole 'burt' or 'sarah', indicating which player just spoke.
 * @returns A new Set<string> representing the updated public knowledge.
 */
function filterKnowledgeAfterPlayerSaysIDontKnow(
    knownPairsAsStrings: Set<string>,
    playerRole: 'burt' | 'sarah'
): Set<string> {
    const nextKnowledge = new Set<string>();
    for (const pStr of knownPairsAsStrings) {
        const pair = parsePair(pStr);
        // Determine the secret value (sum for Burt, product for Sarah) for this specific `pair`.
        const testSecretValue = playerRole === 'burt' ? (pair[0] + pair[1]) : (pair[0] * pair[1]);
        const testSecretKey = playerRole === 'burt' ? 'sum' : 'product';

        // If the player *would have known* this `pair` (meaning it's unique for its `testSecretValue`
        // within the current `knownPairsAsStrings` set), then this `pair` cannot be the true one.
        // This is because the player just stated they "don't know". So, we *don't* add it to `nextKnowledge`.
        // If the player *would NOT have known* this `pair` (meaning there were multiple possibilities
        // for its `testSecretValue` within `knownPairsAsStrings`), then this `pair` is still possible.
        // So, we add it to `nextKnowledge`.
        if (!wouldPlayerKnow(testSecretKey, testSecretValue, knownPairsAsStrings)) {
            nextKnowledge.add(pStr);
        }
    }
    return nextKnowledge;
}

// Main game simulation loop
while (true) {
    rounds++; // Increment round count for each full cycle (Burt + Sarah)
    const prevKnowledgeSize = currentKnowledge.size; // Store knowledge size before Burt's turn

    // --- BURT's turn ---
    // 1. Burt checks if he knows the numbers.
    // He finds all pairs in `currentKnowledge` that match his secret sum `S`.
    let burtCandidates: string[] = [];
    for (const pStr of currentKnowledge) {
        const pair = parsePair(pStr);
        if ((pair[0] + pair[1]) === S) {
            burtCandidates.push(pStr);
        }
    }

    // If Burt found only one candidate, he knows the digits.
    if (burtCandidates.length === 1) {
        print(`(${burtCandidates[0]}) BURT ${rounds}`);
        break; // Game ends
    }

    // 2. Burt doesn't know. Update public knowledge based on his "I don't know" statement.
    currentKnowledge = filterKnowledgeAfterPlayerSaysIDontKnow(currentKnowledge, 'burt');

    // Check for impossible state or no progress after Burt's turn.
    // If no pairs remain or no new information was gained (set size unchanged), it's impossible.
    if (currentKnowledge.size === 0 || currentKnowledge.size === prevKnowledgeSize) {
        print("IMPOSSIBLE");
        break;
    }

    // --- SARAH's turn ---
    // Store knowledge size before Sarah's turn (after Burt's update).
    const prevKnowledgeSizeAfterBurt = currentKnowledge.size;

    // 1. Sarah checks if she knows the numbers.
    // She finds all pairs in the *updated* `currentKnowledge` that match her secret product `P`.
    let sarahCandidates: string[] = [];
    for (const pStr of currentKnowledge) {
        const pair = parsePair(pStr);
        if ((pair[0] * pair[1]) === P) {
            sarahCandidates.push(pStr);
        }
    }

    // If Sarah found only one candidate, she knows the digits.
    if (sarahCandidates.length === 1) {
        print(`(${sarahCandidates[0]}) SARAH ${rounds}`);
        break; // Game ends
    }

    // 2. Sarah doesn't know. Update public knowledge based on her "I don't know" statement.
    currentKnowledge = filterKnowledgeAfterPlayerSaysIDontKnow(currentKnowledge, 'sarah');

    // Check for impossible state or no progress after Sarah's turn.
    if (currentKnowledge.size === 0 || currentKnowledge.size === prevKnowledgeSizeAfterBurt) {
        print("IMPOSSIBLE");
        break;
    }
}