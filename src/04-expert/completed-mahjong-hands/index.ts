// Standard input reading boilerplate for CodinGame
declare const readline: () => string;
declare const print: (message: any) => void;

// Define tile order for deterministic processing in canFormSets and iterating through tile types
const TILE_ORDER: string[] = [];
for (let i = 1; i <= 9; i++) TILE_ORDER.push(`${i}m`);
for (let i = 1; i <= 9; i++) TILE_ORDER.push(`${i}p`);
for (let i = 1; i <= 9; i++) TILE_ORDER.push(`${i}s`);
for (let i = 1; i <= 7; i++) TILE_ORDER.push(`${i}z`); // Z tiles only go up to 7

/**
 * Parses the input string (e.g., "222888m444p2277z 7z") into a Map of tile counts.
 * @param input The full input string containing initial hand and drawn tile.
 * @returns A Map where keys are tile strings (e.g., "1m") and values are their counts.
 */
function getTileCounts(input: string): Map<string, number> {
    const counts = new Map<string, number>();
    const parts = input.split(' ');
    const sequence = parts[0];
    const drawnTile = parts[1];

    let currentNumbers = '';

    const processNumbersForSuit = (suit: string) => {
        for (const numChar of currentNumbers) {
            const tile = numChar + suit;
            counts.set(tile, (counts.get(tile) || 0) + 1);
        }
        currentNumbers = '';
    };

    for (const char of sequence) {
        if (char === 'm' || char === 'p' || char === 's' || char === 'z') {
            processNumbersForSuit(char);
        } else {
            currentNumbers += char;
        }
    }
    // Add the drawn tile to the counts
    counts.set(drawnTile, (counts.get(drawnTile) || 0) + 1);

    return counts;
}

/**
 * Creates a shallow copy of a tile counts Map.
 * @param counts The Map to copy.
 * @returns A new Map with the same key-value pairs.
 */
function copyCounts(counts: Map<string, number>): Map<string, number> {
    return new Map<string, number>(counts);
}

/**
 * Calculates the total number of tiles in a hand.
 * @param hand A Map of tile counts.
 * @returns The total number of tiles.
 */
function getTotalTiles(hand: Map<string, number>): number {
    let total = 0;
    for (const count of hand.values()) {
        total += count;
    }
    return total;
}

/**
 * Checks if a hand constitutes a Kokushi Musou (Thirteen Orphans) winning hand.
 * A Kokushi Musou hand consists of one of each of the 1m, 9m, 1p, 9p, 1s, 9s,
 * and 1z, 2z, 3z, 4z, 5z, 6z, 7z tiles, with one of them appearing as a pair (total 14 tiles).
 * @param hand The tile counts of the 14 tiles.
 * @returns True if it's a Kokushi Musou hand, false otherwise.
 */
function isKokushiMusou(hand: Map<string, number>): boolean {
    const orphans = new Set([
        '1m', '9m', '1p', '9p', '1s', '9s',
        '1z', '2z', '3z', '4z', '5z', '6z', '7z'
    ]);

    let distinctOrphanTilesPresent = 0;
    let hasPair = false;

    // A Kokushi Musou hand must always be exactly 14 tiles.
    if (getTotalTiles(hand) !== 14) {
        return false;
    }

    for (const [tile, count] of hand.entries()) {
        if (!orphans.has(tile)) {
            return false; // Hand contains a non-orphan tile
        }
        if (count === 1) {
            distinctOrphanTilesPresent++;
        } else if (count === 2) {
            if (hasPair) {
                return false; // More than one pair or a tile with count > 2 initially for this hand type.
            }
            hasPair = true;
            distinctOrphanTilesPresent++; // This tile type counts towards the 13 distinct types
        } else { // count > 2 for any orphan tile
            return false; // Kokushi Musou allows at most one of each, plus one duplicate for the pair
        }
    }

    return distinctOrphanTilesPresent === 13 && hasPair;
}

/**
 * Checks if a hand constitutes a Seven Pairs winning hand.
 * A Seven Pairs hand consists of 7 distinct pairs (total 14 tiles).
 * @param hand The tile counts of the 14 tiles.
 * @returns True if it's a Seven Pairs hand, false otherwise.
 */
function isSevenPairs(hand: Map<string, number>): boolean {
    let numPairs = 0;

    // A Seven Pairs hand must always be exactly 14 tiles.
    if (getTotalTiles(hand) !== 14) {
        return false;
    }

    for (const count of hand.values()) {
        if (count === 2) {
            numPairs++;
        } else {
            return false; // A tile count is not 2, so cannot be 7 pairs
        }
    }

    return numPairs === 7;
}

/**
 * Recursively checks if the remaining tiles in 'hand' can form 'setsNeeded' sets.
 * This is a helper for `isStandardHand`. It employs a backtracking algorithm.
 * @param hand The current tile counts.
 * @param setsNeeded The number of sets (triplets or runs) to form.
 * @returns True if sets can be formed, false otherwise.
 */
function canFormSets(hand: Map<string, number>, setsNeeded: number): boolean {
    if (setsNeeded === 0) {
        return true; // All sets successfully formed
    }

    // Optimization: If remaining tiles are less than needed for sets, it's impossible.
    if (getTotalTiles(hand) < setsNeeded * 3) {
        return false;
    }

    // Find the "first" tile (smallest in TILE_ORDER) that has a count > 0.
    // This ensures deterministic processing and correct backtracking logic.
    let firstTile: string | null = null;
    for (const tile of TILE_ORDER) {
        if ((hand.get(tile) || 0) > 0) {
            firstTile = tile;
            break;
        }
    }

    if (!firstTile) {
        // No tiles left but sets are still needed, means failure.
        return false;
    }

    const firstTileCount = hand.get(firstTile)!;
    const rankStr = firstTile[0];
    const suit = firstTile[1];
    const rank = parseInt(rankStr);

    // --- Try forming a Triplet with `firstTile` ---
    if (firstTileCount >= 3) {
        const nextHand = copyCounts(hand);
        nextHand.set(firstTile, firstTileCount - 3);
        if (canFormSets(nextHand, setsNeeded - 1)) {
            return true;
        }
    }

    // --- Try forming a Run with `firstTile` ---
    // Runs are only possible with 'm', 'p', 's' suits.
    // 'z' tiles (honor tiles) cannot form runs.
    // Runs are formed by 3 consecutive ranks, so ranks 1-7 can be the start of a run (e.g., 789).
    if (suit !== 'z' && rank <= 7) { 
        const nextRank1 = rank + 1;
        const nextRank2 = rank + 2;
        const tile1 = `${nextRank1}${suit}`;
        const tile2 = `${nextRank2}${suit}`;

        // Check if the necessary tiles for a run exist
        if ((hand.get(tile1) || 0) >= 1 && (hand.get(tile2) || 0) >= 1) {
            const nextHand = copyCounts(hand);
            nextHand.set(firstTile, firstTileCount - 1);
            nextHand.set(tile1, nextHand.get(tile1)! - 1);
            nextHand.set(tile2, nextHand.get(tile2)! - 1);
            if (canFormSets(nextHand, setsNeeded - 1)) {
                return true;
            }
        }
    }

    // If `firstTile` cannot form a set (triplet or run) in any successful way,
    // then this branch of the recursion fails.
    return false;
}

/**
 * Checks if a hand constitutes a Standard Mahjong winning hand (4 sets and 1 pair).
 * @param hand The tile counts of the 14 tiles.
 * @returns True if it's a Standard Hand, false otherwise.
 */
function isStandardHand(hand: Map<string, number>): boolean {
    // A Standard Hand must always be exactly 14 tiles.
    if (getTotalTiles(hand) !== 14) {
        return false;
    }

    // Iterate through all possible tiles to be the 'pair'
    for (const pairTile of TILE_ORDER) {
        const count = hand.get(pairTile) || 0;
        if (count >= 2) {
            const remainingHand = copyCounts(hand);
            remainingHand.set(pairTile, count - 2);

            // Try to form 4 sets from the remaining 12 tiles
            if (canFormSets(remainingHand, 4)) {
                return true; // Found a valid pair and sets, so it's a standard hand
            }
        }
    }

    return false; // No valid pair found that allows forming 4 sets
}

// Main logic to read input, determine hand type, and print result
const line: string = readline();
const fullHandCounts: Map<string, number> = getTileCounts(line);

if (isKokushiMusou(fullHandCounts)) {
    print("TRUE");
} else if (isSevenPairs(fullHandCounts)) {
    print("TRUE");
} else if (isStandardHand(fullHandCounts)) {
    print("TRUE");
} else {
    print("FALSE");
}