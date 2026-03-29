The puzzle asks us to simulate a card game called "War" between two players and determine the winner and the number of rounds played.

Here's a breakdown of the rules and how the solution addresses them:

1.  **Card Values:** Cards are represented by their rank and suit (e.g., "AS" for Ace of Spades). Only the rank matters for comparison. The order from weakest to strongest is 2, 3, ..., 10, J, Q, K, A. A `Map` is used to convert card ranks (e.g., "J", "A") to numerical values (11, 14 respectively) for easy comparison.

2.  **Player Decks:** Each player has a deck of cards. Cards are drawn from the top and added to the bottom. This behavior implies a queue data structure. For performance, especially with up to 1000 cards, a standard JavaScript `Array.shift()` operation (which removes the first element) can be slow (O(N)). To mitigate this, a custom `Deque` (double-ended queue) class is implemented using two internal arrays (`inbox` and `outbox`). This allows `push` and `shift` operations to be amortized O(1), making the simulation efficient.

3.  **Game Rounds:**
    *   **Battle (Normal Play):** In each round, both players reveal their top card. The player with the higher card takes both cards and adds them to the bottom of their deck. The rule specifies the order for adding cards: the winner adds their card first, then the loser's card. (For a collected "war pile", it's P1's cards then P2's cards, regardless of winner). The code implements this by accumulating all cards involved in `warPileP1` and `warPileP2` and then appending `warPileP1` then `warPileP2` to the winner's deck.
    *   **War:** If the two cards revealed are of equal value, a "war" occurs. Both players place three cards face down from their deck into a temporary "war pile", and then reveal a new top card to determine the winner of the war. This can chain if the new cards are also equal. The player who wins the war takes all cards accumulated during that war (initial tied cards + all face-down cards + the final battle cards). All cards are added to the winner's deck in the order: all cards from Player 1's war pile, then all cards from Player 2's war pile.
    *   **Round Counting:** A single battle or a sequence of chained wars all count as one game round. The `rounds` counter is incremented once at the beginning of each `while` loop iteration that represents a new game round.

4.  **Special Cases (PAT):**
    *   The game ends in a "PAT" (tie) if a player runs out of cards during a war. This happens specifically if a player cannot provide the three face-down cards or the subsequent battle card required to resolve the war.
    *   The problem statement guarantees that games will always end (no infinite loops to handle).

5.  **Victory Condition:** A player wins when the other player no longer has cards in their deck.

**Algorithm Steps:**

1.  **Initialization:**
    *   Create a `Map` for card values.
    *   Initialize two `Deque` objects, `player1Deck` and `player2Deck`.
    *   Read initial cards from input and populate the decks.
    *   Initialize `rounds = 0` and `gameOver = false`.

2.  **Game Loop:**
    *   The main `while` loop continues as long as both players have cards and `gameOver` is `false`.
    *   Inside the main loop, increment `rounds`.
    *   Initialize `warPileP1` and `warPileP2` (arrays to hold cards for the current round).

3.  **Battle/War Inner Loop:**
    *   An inner `while(true)` loop handles the current battle and any chained wars.
    *   Draw `card1` from `player1Deck` and `card2` from `player2Deck`.
    *   **PAT Check 1:** If either `card1` or `card2` is `undefined` (player ran out of cards *during* a war sequence), print "PAT", set `gameOver = true`, and `break` from the inner loop.
    *   Add `card1` and `card2` to `warPileP1` and `warPileP2` respectively.
    *   Compare `val1` and `val2` (numerical values of `card1` and `card2`).
    *   **If `val1 > val2` (P1 wins):** Add `warPileP1` then `warPileP2` to `player1Deck`. `break` from the inner loop (round ends).
    *   **If `val2 > val1` (P2 wins):** Add `warPileP1` then `warPileP2` to `player2Deck`. `break` from the inner loop (round ends).
    *   **If `val1 == val2` (War!):**
        *   **PAT Check 2:** If either `player1Deck.size < 3` or `player2Deck.size < 3` (not enough cards for face-down cards), print "PAT", set `gameOver = true`, and `break` from the inner loop.
        *   For three times, draw `warCard1` and `warCard2` (the face-down cards). If any is `undefined` (robustness check), handle as PAT. Add them to `warPileP1` and `warPileP2`.
        *   The inner `while(true)` loop continues to its next iteration, where new battle cards will be drawn to resolve this war.

4.  **Final Output:**
    *   After the main `while` loop finishes:
        *   If `gameOver` is `true` (meaning "PAT" was already printed), do nothing.
        *   Otherwise (a player ran out of cards normally):
            *   If `player1Deck.size === 0`, Player 2 wins. Print `2 ${rounds}`.
            *   Else (`player2Deck.size === 0`), Player 1 wins. Print `1 ${rounds}`.