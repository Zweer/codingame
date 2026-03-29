// Declare readline and console.log for TypeScript environment in CodinGame
declare function readline(): string;

// Define Card interface for better type safety and readability
interface Card {
    rank: string;
    suit: string;
    value: number; // Numerical value for sum calculations (e.g., A=1, T,J,Q,K=10)
    rankValue: number; // Numerical value for rank comparisons (e.g., A=1, J=11, Q=12, K=13)
}

// Helper function to parse a card string into a Card object
function parseCard(cardString: string): Card {
    const rank = cardString[0];
    const suit = cardString[1];
    let value: number;
    let rankValue: number;

    switch (rank) {
        case 'A':
            value = 1;
            rankValue = 1;
            break;
        case 'T': // Ten
            value = 10;
            rankValue = 10;
            break;
        case 'J': // Jack
            value = 10;
            rankValue = 11;
            break;
        case 'Q': // Queen
            value = 10;
            rankValue = 12;
            break;
        case 'K': // King
            value = 10;
            rankValue = 13;
            break;
        default: // Numeric ranks 2-9
            value = parseInt(rank);
            rankValue = parseInt(rank);
            break;
    }
    return { rank, suit, value, rankValue };
}

// --- Scoring Functions ---

/**
 * Calculates points for Fifteens.
 * 2 points for every distinct group of cards whose totals adds up to 15.
 */
function calculateFifteens(cards: Card[]): number {
    let points = 0;
    const numCards = cards.length;

    // Iterate through all possible non-empty subsets (2^N - 1 combinations)
    // Each bit in `i` represents the inclusion of a card: if j-th bit is set, cards[j] is included.
    for (let i = 1; i < (1 << numCards); i++) {
        let currentSum = 0;
        // Check each card's inclusion in the current subset based on the bitmask `i`
        for (let j = 0; j < numCards; j++) {
            if ((i >> j) & 1) { // If the j-th bit is set, include card[j]
                currentSum += cards[j].value;
            }
        }
        if (currentSum === 15) {
            points += 2;
        }
    }
    return points;
}

/**
 * Calculates points for Pairs.
 * 2 points for every distinct pair of cards with identical ranks.
 * A triplet gives 6 points (3 pairs), a quadruplet 12 points (6 pairs).
 */
function calculatePairs(cards: Card[]): number {
    let points = 0;
    const rankCounts: Map<number, number> = new Map();

    // Count occurrences of each rankValue
    for (const card of cards) {
        rankCounts.set(card.rankValue, (rankCounts.get(card.rankValue) || 0) + 1);
    }

    // For N cards of the same rank, there are N * (N - 1) / 2 distinct pairs.
    // Each pair is worth 2 points, so total points = N * (N - 1).
    for (const count of rankCounts.values()) {
        if (count >= 2) {
            points += count * (count - 1);
        }
    }
    return points;
}

/**
 * Calculates points for Runs.
 * 3 or more consecutive cards by rank, 1 point for each card.
 * If there are duplicates, the score is multiplied by the number of ways that particular run can be formed.
 */
function calculateRuns(cards: Card[]): number {
    let maxRunPoints = 0;

    // Get unique rankValues from the 5 cards and sort them to identify consecutive sequences
    const sortedUniqueRankValues = Array.from(new Set(cards.map(c => c.rankValue))).sort((a, b) => a - b);

    if (sortedUniqueRankValues.length < 3) {
        return 0; // Not enough unique ranks for a run of 3 or more
    }

    // Count frequencies of all cards' rank values in the entire 5-card hand
    const rankCounts: Map<number, number> = new Map();
    for (const card of cards) {
        rankCounts.set(card.rankValue, (rankCounts.get(card.rankValue) || 0) + 1);
    }

    // Iterate through all possible starting points for a run in the sorted unique ranks
    for (let i = 0; i < sortedUniqueRankValues.length; i++) {
        let currentRunLength = 1;
        // The multiplier starts with the count of the first card in the potential run
        let currentMultiplier = rankCounts.get(sortedUniqueRankValues[i])!;

        // Extend the run as long as ranks are consecutive
        for (let j = i + 1; j < sortedUniqueRankValues.length; j++) {
            if (sortedUniqueRankValues[j] === sortedUniqueRankValues[j - 1] + 1) {
                currentRunLength++;
                // Multiply the run's score by the count of the current rank if duplicates exist
                currentMultiplier *= rankCounts.get(sortedUniqueRankValues[j])!;
            } else {
                break; // Run is broken if ranks are not consecutive
            }
        }

        // If a run of 3 or more is found, calculate its points and update maxRunPoints
        // Cribbage rules state that only the longest run counts.
        // For a 5-card hand, there can only be one such longest contiguous sequence of ranks.
        if (currentRunLength >= 3) {
            maxRunPoints = Math.max(maxRunPoints, currentRunLength * currentMultiplier);
        }
    }

    return maxRunPoints;
}

/**
 * Calculates points for Flushes.
 * 4 points if all 4 cards in your hand are of the same suit.
 * 5 points if the starter card is also the same suit.
 */
function calculateFlushes(handCards: Card[], starterCard: Card): number {
    // Check if the 4 player's hand cards are all the same suit.
    const firstSuit = handCards[0].suit;
    const allSameSuitInHand = handCards.every(card => card.suit === firstSuit);

    if (allSameSuitInHand) {
        let points = 4;
        // If the starter card also matches the suit, add 1 more point.
        if (starterCard.suit === firstSuit) {
            points += 1;
        }
        return points;
    }
    return 0;
}

/**
 * Calculates points for His Nobs.
 * 1 point if you have a J in your hand with the same suit as the starter card.
 */
function calculateHisNobs(handCards: Card[], starterCard: Card): number {
    // Check if any of the 4 hand cards is a Jack (J)
    for (const card of handCards) {
        if (card.rank === 'J') {
            // Check if its suit matches the starter card's suit
            if (card.suit === starterCard.suit) {
                return 1; // Only 1 point for His Nobs, and only one Jack is needed.
            }
        }
    }
    return 0;
}

// Main function to solve the puzzle
function solve() {
    // Read the number of hands to score
    const N: number = parseInt(readline());

    for (let i = 0; i < N; i++) {
        // Read the 5 card strings for the current hand
        const line = readline().split(' ');
        const handStrings = line.slice(0, 4); // First 4 cards are the player's hand
        const starterString = line[4];        // The 5th card is the starter card

        // Parse card strings into Card objects
        const handCards: Card[] = handStrings.map(parseCard);
        const starterCard: Card = parseCard(starterString);

        // Combine all 5 cards for scoring categories that use the full hand (Fifteens, Pairs, Runs)
        const allCards: Card[] = [...handCards, starterCard];

        let totalScore = 0;

        // Calculate points for each category
        totalScore += calculateFifteens(allCards);
        totalScore += calculatePairs(allCards);
        totalScore += calculateRuns(allCards);
        totalScore += calculateFlushes(handCards, starterCard); // Flushes specifically checks the 4 hand cards + starter
        totalScore += calculateHisNobs(handCards, starterCard); // His Nobs specifically checks the 4 hand cards + starter

        // Output the total score for the current hand
        console.log(totalScore);
    }
}

// Call the main solve function to start execution in the CodinGame environment
solve();