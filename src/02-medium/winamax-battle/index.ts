// IMPORTANT: In a CodinGame environment, `readline()` and `print()` are usually globally available.
// For local testing in Node.js, you might need to implement mocks or use `require('readline')`.
// For browser environment, these would also need to be provided.

/**
 * Helper class for a Deque (double-ended queue) for O(1) amortized push/shift operations.
 * This is crucial for performance with large numbers of cards, as `Array.shift()` can be O(N).
 */
class Deque<T> {
    private inbox: T[] = [];
    private outbox: T[] = [];

    /**
     * Adds an item to the back of the queue. O(1) amortized.
     * @param item The item to add.
     */
    push(item: T) {
        this.inbox.push(item);
    }

    /**
     * Adds multiple items to the back of the queue. O(K) where K is number of items, amortized.
     * @param items An array of items to add.
     */
    pushAll(items: T[]) {
        this.inbox.push(...items);
    }

    /**
     * Removes and returns the item from the front of the queue. O(1) amortized.
     * @returns The item from the front, or undefined if the queue is empty.
     */
    shift(): T | undefined {
        if (this.outbox.length === 0) {
            if (this.inbox.length === 0) {
                return undefined; // Deque is completely empty
            }
            // When outbox is empty, transfer all items from inbox to outbox, reversed.
            // This 'reverse' operation is O(N_inbox) but happens infrequently enough
            // that the amortized cost per shift operation remains O(1).
            this.outbox = this.inbox.reverse();
            this.inbox = [];
        }
        // Pop from the end of outbox is O(1).
        return this.outbox.pop();
    }

    /**
     * Gets the current number of items in the deque. O(1).
     * @returns The number of items.
     */
    get size(): number {
        return this.inbox.length + this.outbox.length;
    }
}

// Map card ranks to numerical values for comparison.
const cardValues: Map<string, number> = new Map([
    ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10],
    ["J", 11], // Jack
    ["Q", 12], // Queen
    ["K", 13], // King
    ["A", 14]  // Ace
]);

/**
 * Extracts the numerical value of a card from its string representation (e.g., "4H" -> 4, "AS" -> 14).
 * @param card The card string (e.g., "AD", "10C").
 * @returns The numerical value of the card.
 */
function getCardValue(card: string): number {
    // The rank is the part before the last character (suit).
    const rank = card.slice(0, -1);
    // The '!' non-null assertion is used because we expect all valid card ranks to be in the map.
    return cardValues.get(rank)!;
}

/**
 * Main function to solve the War game puzzle.
 */
function solve() {
    // Read input for Player 1's deck.
    const n = parseInt(readline());
    const player1Deck = new Deque<string>();
    for (let i = 0; i < n; i++) {
        player1Deck.push(readline());
    }

    // Read input for Player 2's deck.
    const m = parseInt(readline());
    const player2Deck = new Deque<string>();
    for (let i = 0; i < m; i++) {
        player2Deck.push(readline());
    }

    let rounds = 0; // Counts game rounds. A war (even chained) counts as one round.
    let gameOver = false; // Flag to indicate if the game has ended (e.g., due to PAT).

    // Main game loop: continues as long as both players have cards and the game hasn't ended.
    while (player1Deck.size > 0 && player2Deck.size > 0 && !gameOver) {
        rounds++; // Increment round count for each new battle/war sequence.

        // These arrays store cards involved in the current battle/war.
        // They are reset for each new round.
        let warPileP1: string[] = [];
        let warPileP2: string[] = [];

        // Inner loop handles a single battle or a chained sequence of wars.
        // It breaks when a winner is determined for the current round, or a PAT occurs.
        while (true) {
            let card1 = player1Deck.shift();
            let card2 = player2Deck.shift();

            // Check for PAT condition: a player runs out of cards during a war
            // (specifically when drawing the battle card, or if they couldn't provide 3 face-down cards previously).
            if (card1 === undefined || card2 === undefined) {
                print("PAT");
                gameOver = true;
                break; // Exit inner loop, game over.
            }

            // Add the drawn cards to the current war pile.
            warPileP1.push(card1);
            warPileP2.push(card2);

            const val1 = getCardValue(card1);
            const val2 = getCardValue(card2);

            if (val1 > val2) {
                // Player 1 wins the battle or the entire war sequence.
                // Cards are added to the winner's deck: first P1's cards, then P2's cards.
                player1Deck.pushAll(warPileP1);
                player1Deck.pushAll(warPileP2);
                break; // Exit inner loop, round ends.
            } else if (val2 > val1) {
                // Player 2 wins the battle or the entire war sequence.
                // Cards are added to the winner's deck: first P1's cards, then P2's cards.
                player2Deck.pushAll(warPileP1);
                player2Deck.pushAll(warPileP2);
                break; // Exit inner loop, round ends.
            } else {
                // War! Cards are of equal value.
                // Both players must place 3 cards face down, then draw a new battle card.

                // Check for PAT condition: not enough cards for the 3 face-down cards.
                if (player1Deck.size < 3 || player2Deck.size < 3) {
                    print("PAT");
                    gameOver = true;
                    break; // Exit inner loop, game over.
                }

                // Place 3 cards from each player face down into the war pile.
                for (let i = 0; i < 3; i++) {
                    let warCard1 = player1Deck.shift();
                    let warCard2 = player2Deck.shift();
                    
                    // These checks are for robustness, though the previous size check should ideally prevent undefined here.
                    if (warCard1 === undefined || warCard2 === undefined) {
                         print("PAT"); 
                         gameOver = true;
                         break; // Exit for loop if an unexpected undefined occurs
                    }
                    warPileP1.push(warCard1);
                    warPileP2.push(warCard2);
                }
                if (gameOver) break; // If a PAT happened inside the for loop, exit inner while loop.

                // The inner 'while(true)' loop will continue to its next iteration
                // to draw new battle cards for the war resolution.
            }
        }
    }

    // After the main game loop finishes, determine the final outcome if not already a PAT.
    if (!gameOver) {
        if (player1Deck.size === 0) {
            // Player 1 ran out of cards first (Player 2 wins).
            print(`2 ${rounds}`);
        } else { // player2Deck.size === 0
            // Player 2 ran out of cards first (Player 1 wins).
            print(`1 ${rounds}`);
        }
    }
}

// Execute the main solver function.
solve();