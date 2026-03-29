The provided CodinGame puzzle "6 nimmt!" requires an AI to make decisions in a card game where the goal is to collect as few "cow" points as possible. The game involves simultaneous card play, specific rules for placing cards on lines, and penalties for completing lines or playing cards that are too small.

### Game Rules Summary:

1.  **Objective:** Minimize the total number of "cow" points collected.
2.  **Cards:** Numbered 1-104, each with a unique cow score (1, 2, 3, 5, or 7).
    *   Multiples of 5 (not 10): 2 cows.
    *   Multiples of 10: 3 cows.
    *   Multiples of 11: 5 cows.
    *   All others: 1 cow.
    *   Note: 55 is a multiple of 5 and 11, giving 2 + 5 = 7 cows.
3.  **Table Setup:** 4 lines, each starting with one card.
4.  **Turns:** Players simultaneously choose a card. Cards are then revealed and placed in ascending order of their value.
5.  **Card Placement:**
    *   A card must be placed on a line where its value is greater than the last card of that line.
    *   If multiple lines are possible, the card is placed on the line where the difference between the card and the last card in the line is minimum (i.e., the last card in that line is the greatest among suitable lines).
6.  **Line Full (6th Card):** If a card is placed as the 6th card in a line, the player takes the existing 5 cards from that line (adding their cow points to their score), and their played card starts a new line.
7.  **Card Too Small:** If a card is smaller than the last card of *all* existing lines, the player must choose one of the existing lines to pick up (adding its cow points to their score), and their played card then starts a new line.

### AI Strategy:

The core of the AI's strategy is to make decisions that minimize the immediate number of cows gained, or to manage the hand to avoid worse situations later. Since it's a simultaneous choice game, the AI cannot predict what other players will play. Therefore, a greedy approach based on the current board state and its own hand is typically sufficient.

**1. `CHOOSE_CARD_TO_PLAY` Phase:**

The AI needs to select a card from its hand. For each card in its hand, it calculates a "predicted penalty" (number of cows it would immediately collect) and then chooses the best card based on these predictions.

*   **Predicting Placement & Penalty:**
    *   For each card in my hand (`myCard`):
        *   Determine which line (`bestTargetLineId`) it would be placed on according to the game rules (closest fit, i.e., `myCard - lastCardInLine` is minimal).
        *   **Scenario A: `myCard` is too small for all lines.**
            *   The player is forced to pick a line. The strategy is to pick the line with the *minimum* total cows on the board. So, the `predictedPenalty` is `minCowsOfAllLines`.
        *   **Scenario B: `myCard` can be placed.**
            *   If `myCard` makes the chosen line have 6 cards (i.e., the line currently has 5 cards), the `predictedPenalty` is the `totalCowsOfLine` for that specific line.
            *   Otherwise (line has < 5 cards), the `predictedPenalty` is 0.

*   **Choosing the Best Card (Sorting Logic):**
    The goal is to minimize collected cows. This leads to a multi-level sorting of potential moves:
    1.  **Primary Sort:** Sort by `predictedPenalty` in ascending order. (Lower penalty is always better).
    2.  **Secondary Sort (if `predictedPenalty` is equal):**
        *   **If both cards force a pick (`isTooSmall`):** Play the *highest* card from hand. It will start a new line anyway, so getting rid of a high card from your hand is generally beneficial.
        *   **If both cards can be placed without penalty (`predictedPenalty === 0`):** Play the *highest* card from hand. This removes a potentially problematic high card while incurring no immediate cost.
        *   **If both cards can be placed and cause a penalty (`predictedPenalty > 0`):** Play the *lowest* card from hand. If a pickup is unavoidable, it's better to use a lower card and keep higher cards for potential safe placements in future turns.
        *   **If one forces a pick (`isTooSmall`) and the other can be placed, but their `predictedPenalty` is identical:** Prefer the card that *can be placed*. Being able to place a card indicates more flexibility and less "forced" action.

**2. `CHOOSE_LINE_TO_PICK` Phase:**

This phase occurs when the card chosen in the previous `CHOOSE_CARD_TO_PLAY` phase was too small for all lines. The AI must now choose which line to pick up.

*   **Strategy:** Simply pick the line with the *minimum* `totalCowsOfLine`. This directly minimizes the immediate score impact.

### Code Structure:

1.  **`getCows(cardId: number)`:** A utility function to calculate cow points for a single card based on the expert rules.
2.  **`totalCowsOfLine(line: number[])`:** A utility function to sum cow points for all cards in a given line.
3.  **Main Game Loop:**
    *   Reads `gamePhase`.
    *   Reads the current state of the 4 lines on the table.
    *   Reads the cards in the player's hand.
    *   Executes logic based on `gamePhase`:
        *   If `CHOOSE_CARD_TO_PLAY`: Implements the `MoveOption` structure, calculates penalties for each hand card, sorts, and prints `PLAY <cardId>`.
        *   If `CHOOSE_LINE_TO_PICK`: Calculates cows for each line, finds the minimum, and prints `PICK <lineId>`.

This strategy provides a robust greedy approach to the game, aiming to minimize immediate cow pickups.