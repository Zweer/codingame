The problem asks us to determine the winner of a Texas Hold'em poker hand between two players, given their two hole cards and five community cards. We need to identify the best 5-card hand for each player from their 7 available cards, compare these hands based on standard poker rules, and output the winner, their hand type, and the five winning card values in a specific order. If there's a tie, output "DRAW".

Here's a breakdown of the solution strategy:

1.  **Card Representation:**
    *   Cards are represented as two characters (e.g., `TC` for Ten of Clubs).
    *   We'll map card values (A, K, Q, J, T, 9, ..., 2) to numeric values (14, 13, 12, 11, 10, 9, ..., 2). An Ace can also be treated as 1 for Ace-low straights (A,2,3,4,5).
    *   An `interface Card` will store the character, suit, and numeric value of a card.

2.  **Hand Types and Ranking:**
    *   We define an `enum HandType` to represent the different hand types, ordered by their strength (e.g., `HIGH_CARD = 0`, `STRAIGHT_FLUSH = 8`). This allows for easy comparison of hand types.
    *   A `HandResult` interface will store:
        *   `type`: The `HandType` of the best 5-card hand.
        *   `orderedValues`: An array of numeric card values used *solely for tie-breaking*. This array is structured specifically for each hand type (e.g., for a pair, it's `[pair_value, kicker1, kicker2, kicker3]`). Ace in an Ace-low straight is represented as `1` here.
        *   `displayValues`: An array of numeric card values used *for the output string*. This explicitly lists the values of all 5 cards in the required order (e.g., for a pair `66T42`, it's `[6, 6, 10, 4, 2]`). Ace in an Ace-low straight is represented as `1` here, which maps back to 'A'.

3.  **Core Logic - `evaluateFiveCardHand(cards: Card[]): HandResult`:**
    *   This function takes an array of 5 `Card` objects and determines its `HandType`, `orderedValues`, and `displayValues`.
    *   **Preparation:**
        *   Sort the 5 cards by value in descending order (standard sort).
        *   Count the frequency of each card value (e.g., a map `value -> count`) to easily detect pairs, triples, quads.
        *   Check if all cards have the same suit (for Flush).
        *   Check for Straights:
            *   Standard straight (e.g., K,Q,J,T,9): Values are consecutive.
            *   Ace-low straight (A,2,3,4,5): This is a special case where Ace (14) acts as a low card (1).
    *   **Hand Type Detection (Ordered by Strength - Descending):**
        *   The function checks for hand types in descending order of strength (Straight Flush, Four of a Kind, etc.). The first match determines the hand type.
        *   For each hand type, it correctly populates `orderedValues` (for comparison) and `displayValues` (for output) according to the problem's rules. This includes handling kickers and the specific ordering for Full Houses and Ace-low straights.

4.  **Finding Best Hand - `getBestHand(allCards: Card[]): HandResult`:**
    *   Each player has 7 cards (2 hole + 5 community). We need to find the best 5-card combination out of these 7.
    *   We use a helper `combinations` function to generate all `C(7,5) = 21` possible 5-card combinations.
    *   For each combination, `evaluateFiveCardHand` is called to get its `HandResult`.
    *   These `HandResult`s are then compared: first by `HandType` (higher enum value wins), and if types are equal, by iterating through their `orderedValues` arrays. The best `HandResult` is retained.

5.  **Comparing Players and Output:**
    *   After getting the `bestHandResult` for both Player 1 and Player 2, they are compared using the same logic as within `getBestHand` (HandType first, then `orderedValues`).
    *   If Player 1's hand is better, output `1 HandType DisplayCards`.
    *   If Player 2's hand is better, output `2 HandType DisplayCards`.
    *   If the hands are identical after comparing all `orderedValues`, output `DRAW`.
    *   The `displayValues` are converted back to character representations using `VALUE_TO_CHAR` for the final output string.

This systematic approach ensures all rules are correctly applied, especially the nuanced tie-breaking rules and card ordering for display.