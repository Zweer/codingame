// Define card value mappings for parsing input characters to numeric values.
// 'A' maps to 14 for high card comparisons, etc.
const CARD_CHAR_VALUES: { [key: string]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// Define mapping from numeric value back to character for output.
// '1' is included to correctly represent Ace when it acts as a low card in A,2,3,4,5 straight for display purposes.
const VALUE_TO_CHAR: { [key: number]: string } = {
    1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: 'T',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

// Interface representing a playing card.
interface Card {
    valueChar: string; // Original character value (e.g., 'A', 'K', 'T')
    suitChar: string;  // Suit character (e.g., 'C', 'D', 'H', 'S')
    value: number;     // Numeric value (2-14, A=14)
}

// Enum for Hand Types, ordered by strength (lower enum value = weaker hand).
enum HandType {
    HIGH_CARD = 0,
    PAIR = 1,
    TWO_PAIR = 2,
    THREE_OF_A_KIND = 3,
    STRAIGHT = 4,
    FLUSH = 5,
    FULL_HOUSE = 6,
    FOUR_OF_A_KIND = 7,
    STRAIGHT_FLUSH = 8,
}

// Mapping from HandType enum value to its string name for output.
const HAND_TYPE_NAMES: { [key: number]: string } = {
    [HandType.HIGH_CARD]: "HIGH_CARD",
    [HandType.PAIR]: "PAIR",
    [HandType.TWO_PAIR]: "TWO_PAIR",
    [HandType.THREE_OF_A_KIND]: "THREE_OF_A_KIND",
    [HandType.STRAIGHT]: "STRAIGHT",
    [HandType.FLUSH]: "FLUSH",
    [HandType.FULL_HOUSE]: "FULL_HOUSE",
    [HandType.FOUR_OF_A_KIND]: "FOUR_OF_A_KIND",
    [HandType.STRAIGHT_FLUSH]: "STRAIGHT_FLUSH",
};

// Interface to store the result of evaluating a hand.
interface HandResult {
    type: HandType;
    // Numeric values used for comparison/tie-breaking.
    // Length varies based on hand type (e.g., Pair: 4 values, High Card: 5 values).
    orderedValues: number[];
    // Numeric values for the final output string.
    // Always 5 values, representing the specific cards in their display order.
    displayValues: number[];
}

/**
 * Parses a card string (e.g., "TC") into a Card object.
 * @param s The card string.
 * @returns A Card object.
 */
function parseCard(s: string): Card {
    const valueChar = s[0];
    const suitChar = s[1];
    const value = CARD_CHAR_VALUES[valueChar];
    return { valueChar, suitChar, value };
}

/**
 * Generates all combinations of k elements from an array.
 * @param arr The input array.
 * @param k The number of elements to pick for each combination.
 * @returns An array of combinations.
 */
function combinations<T>(arr: T[], k: number): T[][] {
    const result: T[][] = [];
    function backtrack(startIndex: number, currentCombination: T[]) {
        if (currentCombination.length === k) {
            result.push([...currentCombination]);
            return;
        }
        for (let i = startIndex; i < arr.length; i++) {
            currentCombination.push(arr[i]);
            backtrack(i + 1, currentCombination);
            currentCombination.pop(); // Backtrack: remove last added element
        }
    }
    backtrack(0, []);
    return result;
}

/**
 * Evaluates a 5-card hand and determines its type, comparison values, and display values.
 * @param cards An array of 5 Card objects.
 * @returns A HandResult object representing the evaluated hand.
 */
function evaluateFiveCardHand(cards: Card[]): HandResult {
    // Standard sort for general use and High Card/Flush display.
    // Values are 2-14 (Ace high).
    const standardSortedValues = cards.map(c => c.value).sort((a, b) => b - a);
    const suits = cards.map(c => c.suitChar);

    // Count frequencies of card values to detect pairs, trips, quads.
    const valueCounts = new Map<number, number>();
    for (const card of cards) {
        valueCounts.set(card.value, (valueCounts.get(card.value) || 0) + 1);
    }

    // Create groups (e.g., {value: 10, count: 2}) sorted by count descending, then value descending.
    // This prioritizes higher counts (quads > trips > pairs) and then higher values within same count.
    const groups: { value: number, count: number }[] = [];
    for (const [value, count] of valueCounts.entries()) {
        groups.push({ value, count });
    }
    groups.sort((a, b) => {
        if (a.count !== b.count) return b.count - a.count; // Primary sort by count
        return b.value - a.value; // Secondary sort by value (highest value group first)
    });

    // Check for flush (all cards of the same suit).
    const isFlush = new Set(suits).size === 1;

    // Check for standard straight (e.g., K,Q,J,T,9 or 6,5,4,3,2).
    let isStandardStraight = true;
    for (let i = 0; i < standardSortedValues.length - 1; i++) {
        if (standardSortedValues[i] - 1 !== standardSortedValues[i+1]) {
            isStandardStraight = false;
            break;
        }
    }

    // Initialize variables for straight comparison and display values.
    let isAceLowStraight = false;
    let straightCompareValues: number[] = []; // Values for tie-breaking comparison (Ace as 1)
    let straightDisplayValues: number[] = []; // Values for display (Ace as 1, for 'A' char output)

    // Check for Ace-low straight (A,2,3,4,5). In `standardSortedValues`, this appears as 14,5,4,3,2.
    if (standardSortedValues[0] === 14 && standardSortedValues[1] === 5 &&
        standardSortedValues[2] === 4 && standardSortedValues[3] === 3 &&
        standardSortedValues[4] === 2) {
        isAceLowStraight = true;
        straightCompareValues = [5, 4, 3, 2, 1]; // Ace effectively ranked as 1 for comparison
        straightDisplayValues = [5, 4, 3, 2, 1]; // Ace value 1 maps to 'A' for output
    } else if (isStandardStraight) {
        straightCompareValues = standardSortedValues;
        straightDisplayValues = standardSortedValues;
    }
    const isStraight = isStandardStraight || isAceLowStraight;

    // --- Evaluate hand types in descending order of strength ---

    // 1. STRAIGHT_FLUSH (5 consecutive cards of the same suit)
    if (isFlush && isStraight) {
        return { type: HandType.STRAIGHT_FLUSH, orderedValues: straightCompareValues, displayValues: straightDisplayValues };
    }

    // 2. FOUR_OF_A_KIND (4 cards of matching values and 1 kicker)
    if (groups[0] && groups[0].count === 4) {
        const quadValue = groups[0].value;
        const kickerValue = groups[1].value; // The next group (with count 1) is the kicker
        return {
            type: HandType.FOUR_OF_A_KIND,
            orderedValues: [quadValue, kickerValue],
            displayValues: Array(4).fill(quadValue).concat([kickerValue])
        };
    }

    // 3. FULL_HOUSE (3 cards of matching values, and 2 of a different matching value)
    if (groups[0] && groups[0].count === 3 && groups[1] && groups[1].count === 2) {
        const tripleValue = groups[0].value;
        const pairValue = groups[1].value;
        return {
            type: HandType.FULL_HOUSE,
            orderedValues: [tripleValue, pairValue], // Per rule: "list the set of 3 before the pair"
            displayValues: Array(3).fill(tripleValue).concat(Array(2).fill(pairValue))
        };
    }

    // 4. FLUSH (5 non-consecutive cards, all the same suit)
    if (isFlush) {
        return { type: HandType.FLUSH, orderedValues: standardSortedValues, displayValues: standardSortedValues };
    }

    // 5. STRAIGHT (5 consecutive cards, not same suit)
    if (isStraight) {
        return { type: HandType.STRAIGHT, orderedValues: straightCompareValues, displayValues: straightDisplayValues };
    }

    // 6. THREE_OF_A_KIND (3 cards of matching values and 2 kickers)
    if (groups[0] && groups[0].count === 3) {
        const tripleValue = groups[0].value;
        // Remaining groups are kickers, sorted by value descending
        const kickers = groups.slice(1).map(g => g.value).sort((a, b) => b - a);
        return {
            type: HandType.THREE_OF_A_KIND,
            orderedValues: [tripleValue, ...kickers],
            displayValues: Array(3).fill(tripleValue).concat(kickers)
        };
    }

    // 7. TWO_PAIR (2 cards of a matching value, 2 of a different matching value and 1 kicker)
    if (groups[0] && groups[0].count === 2 && groups[1] && groups[1].count === 2) {
        const highPair = groups[0].value; // `groups` are sorted, so the first pair is the higher one
        const lowPair = groups[1].value;
        const kicker = groups[2].value; // The third group (with count 1) is the kicker
        return {
            type: HandType.TWO_PAIR,
            orderedValues: [highPair, lowPair, kicker],
            displayValues: Array(2).fill(highPair).concat(Array(2).fill(lowPair)).concat([kicker])
        };
    }

    // 8. PAIR (2 cards of matching values and 3 kickers)
    if (groups[0] && groups[0].count === 2) {
        const pairValue = groups[0].value;
        // Remaining groups are kickers, sorted by value descending
        const kickers = groups.slice(1).map(g => g.value).sort((a, b) => b - a);
        return {
            type: HandType.PAIR,
            orderedValues: [pairValue, ...kickers],
            displayValues: Array(2).fill(pairValue).concat(kickers)
        };
    }

    // 9. HIGH_CARD (The absence of any better hand)
    // For High Card, orderedValues and displayValues are simply the 5 cards sorted descending.
    return { type: HandType.HIGH_CARD, orderedValues: standardSortedValues, displayValues: standardSortedValues };
}

/**
 * Finds the best 5-card hand from a given set of 7 cards.
 * @param allCards An array of 7 Card objects (2 hole cards + 5 community cards).
 * @returns The HandResult representing the best possible 5-card hand.
 */
function getBestHand(allCards: Card[]): HandResult {
    // Generate all 5-card combinations from the 7 available cards (C(7,5) = 21 combinations).
    const fiveCardCombinations = combinations(allCards, 5);
    let bestHandResult: HandResult | null = null;

    // Iterate through all combinations to find the strongest hand.
    for (const combo of fiveCardCombinations) {
        const currentHandResult = evaluateFiveCardHand(combo);

        // If this is the first hand evaluated, it's currently the best.
        if (!bestHandResult) {
            bestHandResult = currentHandResult;
            continue;
        }

        // Compare current hand with the best hand found so far.
        // First, compare HandType (stronger type wins).
        if (currentHandResult.type > bestHandResult.type) {
            bestHandResult = currentHandResult;
        } else if (currentHandResult.type === bestHandResult.type) {
            // If HandTypes are the same, compare orderedValues element by element.
            let isCurrentBetter = false;
            for (let i = 0; i < currentHandResult.orderedValues.length; i++) {
                if (currentHandResult.orderedValues[i] > bestHandResult.orderedValues[i]) {
                    isCurrentBetter = true;
                    break;
                } else if (currentHandResult.orderedValues[i] < bestHandResult.orderedResult[i]) { // Note: currentHandResult.orderedValues[i] < bestHandResult.orderedValues[i]
                    isCurrentBetter = false;
                    break;
                }
                // If values are equal, continue to the next card for comparison.
            }
            if (isCurrentBetter) {
                bestHandResult = currentHandResult;
            }
        }
    }
    return bestHandResult!; // A best hand (at least High Card) is always guaranteed to be found.
}

// --- Main execution logic ---

// Read input lines for player hole cards and community cards.
// `readline()` is a CodinGame specific function to read a line from standard input.
const holeCardsPlayer1Str = readline().split(' ');
const holeCardsPlayer2Str = readline().split(' ');
const communityCardsStr = readline().split(' ');

// Parse card strings into structured Card objects.
const holeCardsPlayer1 = holeCardsPlayer1Str.map(parseCard);
const holeCardsPlayer2 = holeCardsPlayer2Str.map(parseCard);
const communityCards = communityCardsStr.map(parseCard);

// Combine hole cards with community cards for each player to form their 7-card pool.
const allCardsPlayer1 = [...holeCardsPlayer1, ...communityCards];
const allCardsPlayer2 = [...holeCardsPlayer2, ...communityCards];

// Determine the best 5-card hand for each player.
const bestHandPlayer1 = getBestHand(allCardsPlayer1);
const bestHandPlayer2 = getBestHand(allCardsPlayer2);

let winnerId: number | null = null;
let winningHand: HandResult;

// Compare the best hands of Player 1 and Player 2 to determine the winner.
if (bestHandPlayer1.type > bestHandPlayer2.type) {
    // Player 1 has a higher hand type, so Player 1 wins.
    winnerId = 1;
    winningHand = bestHandPlayer1;
} else if (bestHandPlayer2.type > bestHandPlayer1.type) {
    // Player 2 has a higher hand type, so Player 2 wins.
    winnerId = 2;
    winningHand = bestHandPlayer2;
} else {
    // Hand types are the same, proceed to compare ordered values for tie-breaking.
    let isDraw = true;
    for (let i = 0; i < bestHandPlayer1.orderedValues.length; i++) {
        if (bestHandPlayer1.orderedValues[i] > bestHandPlayer2.orderedValues[i]) {
            // Player 1 has a higher card at this position, Player 1 wins.
            winnerId = 1;
            winningHand = bestHandPlayer1;
            isDraw = false;
            break;
        } else if (bestHandPlayer2.orderedValues[i] > bestHandPlayer1.orderedValues[i]) {
            // Player 2 has a higher card at this position, Player 2 wins.
            winnerId = 2;
            winningHand = bestHandPlayer2;
            isDraw = false;
            break;
        }
        // If values are equal, continue to the next card to compare.
    }
    // If all ordered values are identical, the hand is a DRAW.
    if (isDraw) {
        console.log("DRAW");
    }
}

// Output the result if a winner is found.
if (winnerId !== null) {
    const handTypeName = HAND_TYPE_NAMES[winningHand.type];
    // Convert the numeric display values of the winning hand back to character representation
    // and join them into a single string.
    const orderedCardValuesOutput = winningHand.displayValues.map(val => VALUE_TO_CHAR[val]).join('');
    console.log(`${winnerId} ${handTypeName} ${orderedCardValuesOutput}`);
}