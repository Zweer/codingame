The puzzle asks us to implement a Cribbage hand scoring algorithm for Nobs, an AI bot. We are given 4 cards held by the player and a 5th common starter card. The total score for the 5 cards needs to be calculated based on specific rules for Fifteens, Runs, Pairs, Flushes, and His Nobs.

Here's a breakdown of the approach:

1.  **Card Representation**: We define a `Card` interface to store a card's rank (e.g., 'A', 'K'), suit (e.g., 'H', 'D'), its numerical `value` (for sums like Fifteens: A=1, T,J,Q,K=10), and its `rankValue` (for sequence comparisons in Runs and identifying Pairs: A=1, J=11, Q=12, K=13). A `parseCard` function converts input strings (e.g., "7H") into `Card` objects.

2.  **Scoring Categories Implementation**: Each scoring category is implemented as a separate function.

    *   **`calculateFifteens(cards: Card[])`**:
        *   This function iterates through all possible non-empty subsets of the 5 cards using a bit manipulation technique (from 1 to `2^5 - 1`).
        *   For each subset, it sums the `value` property of the cards.
        *   If the sum is exactly 15, 2 points are added to the total.

    *   **`calculatePairs(cards: Card[])`**:
        *   A `Map` is used to count the occurrences of each `rankValue` among the 5 cards.
        *   For `n` cards of the same rank (e.g., three 5s), the number of distinct pairs is `n * (n - 1) / 2`. Since each pair is worth 2 points, the total points for `n` cards of the same rank is `n * (n - 1)`. This correctly handles triplets (3 cards = 6 points) and quadruplets (4 cards = 12 points).

    *   **`calculateRuns(cards: Card[])`**:
        *   First, all unique `rankValue`s from the 5 cards are extracted and sorted.
        *   A `Map` is also created to store the frequency of each `rankValue` in the full 5-card hand.
        *   The function then iterates through the sorted unique ranks, identifying contiguous sequences.
        *   For each sequence, it calculates its length and a `multiplier`. The `multiplier` is the product of the counts of each rank within that sequence from the `rankCounts` map (e.g., `3S 3H 4D 5C` has a run of `3-4-5` with `3` appearing twice, so `multiplier = 2 * 1 * 1 = 2`).
        *   The points for a run are `length * multiplier`.
        *   Cribbage rules dictate that only the *longest* run counts. The algorithm keeps track of the `maxRunPoints` found.

    *   **`calculateFlushes(handCards: Card[], starterCard: Card)`**:
        *   This rule specifically refers to the player's initial 4 `handCards`.
        *   It checks if all 4 `handCards` are of the same suit. If they are, 4 points are awarded.
        *   Then, it checks if the `starterCard` also matches that suit. If it does, an additional 1 point is awarded (total 5 points).
        *   If the initial 4 `handCards` are not all the same suit, 0 points are awarded for flush.

    *   **`calculateHisNobs(handCards: Card[], starterCard: Card)`**:
        *   This rule checks if any of the player's 4 `handCards` is a Jack ('J').
        *   If a Jack is found, it then checks if its suit matches the `starterCard`'s suit.
        *   If both conditions are met, 1 point is awarded. Only one such Jack is needed for the point.

3.  **Main Logic (`solve` function)**:
    *   Reads the number of hands `N`.
    *   For each hand:
        *   Reads the 5 card strings.
        *   Parses them into `handCards` (the first 4) and `starterCard` (the 5th).
        *   Combines all 5 cards into an `allCards` array for categories that score across the entire 5-card set (Fifteens, Pairs, Runs).
        *   Calls each scoring function and sums their results.
        *   Prints the total score for the hand.

The solution correctly handles the specific interpretations of rules as demonstrated in the puzzle's example for the "29 Hand", especially regarding "His Nobs" and "Flushes" where the distinction between the 4 player cards and the 5th starter card is crucial.