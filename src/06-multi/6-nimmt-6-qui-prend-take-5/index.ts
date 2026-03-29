/**
 * Global readline function provided by the CodinGame environment.
 * When running locally for testing, you might need to mock this function.
 */
declare function readline(): string;

/**
 * Calculates the number of cows on a single card based on the game's expert rules.
 *
 * Rules:
 * - Multiples of 11: 5 cows.
 * - Multiples of 10: 3 cows.
 * - Multiples of 5 (but not 10): 2 cows.
 * - All other cards: 1 cow.
 * Special Note: 55 (multiple of 5 and 11) gives 7 cows (5 + 2).
 * The order of checks handles this by accumulating cows.
 *
 * @param cardId The number on the card (1-104).
 * @returns The number of cows on the card.
 */
function getCows(cardId: number): number {
    let cows = 0;

    // Multiples of 11 give 5 cows
    if (cardId % 11 === 0) {
        cows += 5;
    }

    // Multiples of 10 give 3 cows
    if (cardId % 10 === 0) {
        cows += 3;
    }
    // Multiples of 5 that aren't multiples of 10 give 2 cows
    // The `else if` ensures cards like 10, 20, etc. don't also get 2 cows from this rule.
    else if (cardId % 5 === 0) {
        cows += 2;
    }

    // If no specific rule applied (cows is still 0), it's a 1-cow card.
    // This check is at the end, ensuring it doesn't override accumulated cows.
    // For card 55, cows would be 5 (from %11) + 2 (from %5), totaling 7.
    // For card 10, cows would be 3 (from %10).
    // For card 5, cows would be 2 (from %5).
    if (cows === 0) {
        cows = 1;
    }
    return cows;
}

/**
 * Calculates the total number of cows for all cards in a given line.
 *
 * @param line An array of card numbers representing a line on the table.
 * @returns The total number of cows for the line.
 */
function totalCowsOfLine(line: number[]): number {
    return line.reduce((sum, card) => sum + getCows(card), 0);
}

// --- Main game logic ---

// Initialization Input (read once at the beginning of the game)
// playerCount is always 4 in this puzzle, but reading it is good practice.
const [playerCount, myPlayerId] = readline().split(' ').map(Number);

// Game loop (runs for each turn until the game ends)
while (true) {
    // Read the current game phase
    const gamePhase: string = readline();

    // Read last played cards by each player (not used by the current AI strategy)
    const lastPlayedCards: number[] = readline().split(' ').map(Number);

    // Read the current state of the table lines
    const lines: number[][] = [];
    for (let i = 0; i < 4; i++) {
        // The lineLength is provided but we can directly use lines[i].length later.
        const lineLength = Number(readline()); 
        lines.push(readline().split(' ').map(Number));
    }

    // Read player scores (not used by the current AI strategy)
    const playerScores: number[] = readline().split(' ').map(Number);

    // Read the cards currently in the player's hand
    // The handLength is provided but we can directly use myHand.length.
    const handLength = Number(readline());
    const myHand: number[] = readline().split(' ').map(Number);

    // --- Logic for CHOOSE_CARD_TO_PLAY phase ---
    if (gamePhase === "CHOOSE_CARD_TO_PLAY") {
        // Define an interface for storing details about each potential move.
        interface MoveOption {
            card: number;            // The card from hand being considered
            predictedPenalty: number;// The number of cows this move is predicted to cause me to pick up
            targetLineId: number;    // The ID of the line (0-3) where this card would be placed (-1 if too small)
            isTooSmall: boolean;     // True if the card is smaller than all line-end cards
        }

        const moveOptions: MoveOption[] = [];

        // Calculate the minimum cows across all current lines on the table.
        // This value is used if the played card is too small and forces the player to pick a line.
        let minCowsAllLines = Infinity;
        if (lines.length > 0) { // There are always 4 lines on the table.
            minCowsAllLines = Math.min(...lines.map(totalCowsOfLine));
        }

        // Evaluate each card in hand to determine its best potential placement and associated penalty.
        for (const myCard of myHand) {
            let bestTargetLineId = -1; // Initialize to -1, indicating no valid line found yet
            let minDiff = Infinity;    // To find the line where card - last_card is minimal (closest fit)
            let isTooSmall = true;     // Flag to check if the card is too small for all lines

            // Iterate through all 4 lines on the table to find the best fit for the current card.
            for (let lineId = 0; lineId < 4; lineId++) {
                const currentLine = lines[lineId];
                // The last card in the line is always at the end of its array.
                const lastCardInLine = currentLine[currentLine.length - 1];

                // A card can only be placed on a line if it's greater than the last card in that line.
                if (myCard > lastCardInLine) {
                    isTooSmall = false; // This card can be placed somewhere
                    const diff = myCard - lastCardInLine;

                    // According to game rules, if multiple lines are possible, the card goes on the line
                    // where the difference between the card and the last card in the line is minimum.
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestTargetLineId = lineId;
                    }
                }
            }

            let predictedPenalty = 0;
            if (isTooSmall) {
                // If the card is too small for all lines, the player must pick a line.
                // The strategy is to pick the line with the minimum number of cows, so calculate that penalty.
                predictedPenalty = minCowsAllLines;
            } else {
                // If the card can be placed, check if it completes a line (i.e., becomes the 6th card).
                if (lines[bestTargetLineId].length === 5) {
                    // If it completes a line, the player must pick up all 5 cards from that line.
                    // The penalty is the total cows of that line.
                    predictedPenalty = totalCowsOfLine(lines[bestTargetLineId]);
                }
                // If lines[bestTargetLineId].length < 5, the card simply extends the line normally,
                // resulting in 0 immediate penalty. `predictedPenalty` remains 0.
            }

            // Add this evaluated move option to our list.
            moveOptions.push({
                card: myCard,
                predictedPenalty,
                targetLineId: bestTargetLineId,
                isTooSmall
            });
        }

        // Sort the move options to find the best card to play based on our strategy.
        moveOptions.sort((a, b) => {
            // 1. Primary sort criterion: Minimize predicted cows to pick up (ascending penalty).
            // Always prioritize moves that result in fewer collected cows.
            if (a.predictedPenalty !== b.predictedPenalty) {
                return a.predictedPenalty - b.predictedPenalty;
            }

            // 2. Secondary sort criterion: If predicted penalties are equal, apply strategic tie-breakers.
            if (a.isTooSmall && b.isTooSmall) {
                // If both cards are "too small" (and thus incur the same min_cows_all_lines penalty):
                // Play the highest card from hand. It will start a new line anyway, so getting rid of a high card
                // that might be harder to place safely later is generally beneficial.
                return b.card - a.card; // Sort by card value descending
            } else if (!a.isTooSmall && !b.isTooSmall) {
                // If both cards can be placed (not "too small"), and result in the same predicted penalty:
                if (a.predictedPenalty === 0) {
                    // If penalty is 0 (i.e., both are "safe" plays): Play the highest card.
                    // This strategy removes a high card from hand that might become problematic (cause a pickup) later,
                    // without any immediate cost.
                    return b.card - a.card; // Sort by card value descending
                } else {
                    // If penalty > 0 (both cause a line pickup, e.g., by filling a line): Play the lowest card.
                    // If a pickup is unavoidable, it's better to use a lower card to take the hit,
                    // preserving higher cards in hand for potential future safe placements.
                    return a.card - b.card; // Sort by card value ascending
                }
            } else {
                // This case handles a scenario where one card is "too small" and the other can be placed,
                // but by coincidence, they both result in the exact same predicted penalty.
                // In such rare cases, it's generally better to place a card on an existing line
                // than to be forced to pick a line, as placing offers more control.
                return a.isTooSmall ? 1 : -1; // Prioritize the option where the card is NOT too small
            }
        });

        // The best move is now the first element in the sorted array.
        const bestMove = moveOptions[0];
        console.log(`PLAY ${bestMove.card}`);

    }
    // --- Logic for CHOOSE_LINE_TO_PICK phase ---
    else if (gamePhase === "CHOOSE_LINE_TO_PICK") {
        // This phase occurs when the player's chosen card was smaller than the last card
        // of all existing lines, forcing them to pick up a line.
        let minCows = Infinity;
        let bestLineToPickId = -1;

        // Iterate through all 4 lines on the table to find the one with the fewest cows.
        for (let lineId = 0; lineId < 4; lineId++) {
            const currentLineCows = totalCowsOfLine(lines[lineId]);
            if (currentLineCows < minCows) {
                minCows = currentLineCows;
                bestLineToPickId = lineId;
            }
        }
        // Output the ID of the line with the minimum cows to pick up.
        console.log(`PICK ${bestLineToPickId}`);
    }
}