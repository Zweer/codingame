The goal of this puzzle is to gain as many followers (units) as possible by converting neutral units and enemy cultists, and by eliminating opponent units. The game is played on a 13x7 grid.

My strategy prioritizes actions based on their impact on achieving the game's goal. Here's the breakdown of the logic:

1.  **Game State Representation:**
    *   The `Game` class stores all necessary information: board dimensions, initial grid (obstacles), and a dynamic `currentGrid` that tracks unit positions.
    *   `Unit` objects store `id`, `type` (Cultist/Cult Leader), `hp`, `x`, `y`, and `owner`.
    *   Helper functions for `manhattanDistance` and `getLinePath` (Bresenham's algorithm) are implemented for movement and shooting calculations.
    *   `getBlockingEntity` and `getEffectiveDamage` functions determine if a shot will hit its intended target and how much damage it will deal, respecting line-of-sight rules.

2.  **Action Prioritization (Scoring System):**
    The bot evaluates all possible actions for all its units and selects the single action with the highest "score" for the current turn. This greedy approach aims to make the most impactful move each turn. The scoring is as follows (higher is better):

    *   **10000: Cult Leader converts an adjacent neutral unit.** This is the highest priority as it directly increases your army size without risk.
    *   **9500: Cult Leader converts an adjacent enemy cultist.** This simultaneously increases your units and decreases the opponent's. Slightly lower priority than neutral conversion but still very high.
    *   **5100 + damage: Cultist kills an enemy cultist.** Eliminating enemy cultists directly reduces their offensive capabilities and unit count.
    *   **5000 + damage: Cultist kills the enemy Cult Leader.** A crucial blow, potentially winning the game if it's their last unit, but generally slightly less preferred than killing an enemy cultist (to reduce enemy numbers faster) unless it's the last enemy.
    *   **4000 - distance: Cult Leader moves towards the nearest convertable unit.** If no immediate conversion is possible, the leader should position itself to convert in future turns. Closer targets yield higher scores.
    *   **100 + damage: Cultist shoots an enemy but doesn't kill it.** Dealing damage is good, but a kill is much better.
    *   **50 - distance: Cultist moves towards the nearest enemy.** If a cultist cannot make a good shot, it should move to get into range for the next turn. Closer targets for movement are preferred.
    *   **-1 (default): WAIT.** This is the fallback if no other beneficial action is found.

3.  **Turn Logic (`playTurn()` method):**
    *   The `playTurn` method iterates through all potential actions:
        1.  **Cult Leader Conversion:** Checks for adjacent neutral units first, then adjacent enemy cultists. If found, this action is immediately prioritized due to its high score.
        2.  **Cult Leader Movement:** If no adjacent conversion is possible, it calculates the best move for the Cult Leader to get closer to a neutral or enemy cultist for future conversion.
        3.  **Cultist Shooting:** Iterates through all my cultists and all enemy units to find the best possible shot (considering kills, target type, and damage).
        4.  **Cultist Movement:** If no sufficiently good shooting opportunity exists, it finds the best cultist to move towards the nearest enemy to get into range for future turns.
    *   The action with the highest calculated score is chosen and returned as the command string.

This strategy balances early-game army building (conversion) with mid-to-late-game aggression (shooting), while also ensuring units reposition themselves effectively when direct action isn't possible. The emphasis on line-of-sight for shooting adds a layer of tactical depth by encouraging units to find clear firing lanes.