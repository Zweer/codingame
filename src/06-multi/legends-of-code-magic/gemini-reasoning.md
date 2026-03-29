The problem "Legends of Code & Magic" is a two-player card game with two phases: Draft and Battle. In Wood League 4, we only deal with Creature cards, and many advanced mechanics like abilities, runes, and direct health/card draw effects are ignored.

### Reasoning

**1. Draft Phase Strategy (30 turns):**
The goal is to build a 30-card deck. Since creature abilities are ignored, the primary focus is on raw stats: Attack and Defense, considering their Mana Cost.

*   **Metric:** A simple but effective metric for a creature's value in this league is the sum of its `attack` and `defense` points. This balances offensive and defensive capabilities.
*   **Prioritization:**
    1.  **Highest `(attack + defense)`:** Choose the card that offers the most combined stats.
    2.  **Lowest `cost` (tie-breaker):** If multiple cards have the same `(attack + defense)` sum, prefer the one with a lower mana cost. A cheaper card with equivalent stats is generally more flexible and can be played earlier.
    3.  **Highest `attack` (secondary tie-breaker):** If `(attack + defense)` and `cost` are both tied, prioritize the card with higher `attack`. Direct damage is crucial for winning the game.
    4.  **Default (tertiary tie-breaker):** If all criteria are tied, simply pick the first card (index 0 or the first encountered).

This strategy aims to build a deck with generally strong and efficient creatures across various mana costs.

**2. Battle Phase Strategy:**
The goal is to reduce the opponent's Health Points (HP) from 30 to 0. This involves summoning creatures and using them to attack.

*   **Overall Goal:** Maximize damage to the opponent's face while maintaining board control.

*   **Turn Breakdown:** Each turn involves two main steps:
    1.  **Summoning Creatures:** Play cards from your hand onto the board.
    2.  **Attacking:** Use creatures already on your board to attack the opponent's creatures or the opponent directly. (Newly summoned creatures cannot attack the turn they are summoned).

*   **Detailed Battle Strategy:**

    *   **Initialization:**
        *   Track current available mana (`currentMana`).
        *   Keep separate lists of cards in hand (`myHandCards`), on your board (`myBoardCreatures`), and on the opponent's board (`opponentBoardCreatures`).
        *   Create mutable copies of `opponentBoardCreatures` (e.g., `tempOpponentBoard`) to simulate damage and removals within the current turn, and track `tempOpponentHealth`. Your own creatures' health is only relevant for the opponent's turn, so we don't need to simulate their deaths within your turn for the purpose of their attacks.

    *   **Phase 1: Summoning:**
        1.  **Sort `myHandCards`:** Sort by `cost` (ascending) first, then by `attack` (descending). This prioritizes cheaper, higher-damage creatures, allowing for more flexible plays early on or setting up multiple creatures.
        2.  **Iterate and Summon:** Go through the sorted `myHandCards`.
            *   If `currentMana` is sufficient for the card's `cost` AND your board size (current creatures + already summoned this turn) is less than the limit (6):
                *   Add a `SUMMON` action for the card.
                *   Deduct the card's `cost` from `currentMana`.
                *   **Important:** Newly summoned creatures cannot attack this turn. So, they are not added to the list of `availableAttackers` for this turn's attack phase.

    *   **Phase 2: Attacking:**
        1.  **Identify Attackers:** Only creatures that were on your board at the *start of the turn* (`myBoardCreatures`) can attack.
        2.  **Sort Attackers:** Sort `availableAttackers` by `attack` (descending). This ensures your strongest creatures attack first.
        3.  **Iterate and Attack:** For each `attacker` in the sorted `availableAttackers`:
            *   **Check for Win Condition:** If `tempOpponentHealth` is already 0 or less, stop attacking; the game is effectively won.
            *   **Targeting Logic:**
                *   **If `tempOpponentBoard` has creatures:**
                    *   **Priority 1: One-shot their biggest threat:** Find any opponent creature that this `attacker` can destroy in one hit (`attacker.attack >= target.currentDefense`). Among these, choose the one with the highest `attack` (removing their most dangerous threat).
                    *   **Priority 2: Damage their biggest threat:** If no one-shot kill is possible, simply target the opponent's creature with the highest `attack` (again, to neutralize their most dangerous threat).
                    *   **Execute Attack:** Add an `ATTACK attacker.instanceId target.instanceId` action. Simulate damage to the `target.currentDefense`. If `target.currentDefense` drops to 0 or below, remove that `target` from `tempOpponentBoard` (simulating its death) so subsequent attackers don't target it.
                *   **If `tempOpponentBoard` is empty:**
                    *   **Attack Face:** Add an `ATTACK attacker.instanceId -1` action. Simulate damage to `tempOpponentHealth`.

    *   **Output:** Join all collected actions with a semi-colon (`;`). If no actions were possible, output `PASS`.

This strategy is greedy, prioritizing strong plays in both summoning and attacking, and aims for board control before direct damage, which is a solid approach for the introductory leagues.

### Code