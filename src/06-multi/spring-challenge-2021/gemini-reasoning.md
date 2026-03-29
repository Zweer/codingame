The problem asks us to play a simplified version of the "Spring Challenge 2021" game, restricted to the Wood 4 league. Our goal is to maximize our score by the end of the game.

## Game Rules (Wood 4 League)

1.  **Game Duration**: The game lasts only one "day". This means we have a limited number of turns.
2.  **Sun Points**: At the beginning of the day (and thus at the start of each of our turns, as the `day` variable will always be 0), we receive 3 sun points for each tree we own. This amount is already included in `mySun` at the start of our turn.
3.  **Actions**: We can perform one of two actions per turn:
    *   `COMPLETE <cellIndex>`: Harvest a large (size 3) tree we own at the specified `cellIndex`.
        *   **Cost**: 4 sun points.
        *   **Points Gained**: `current_nutrient_value + richness_bonus`.
            *   Richness 1: +0 bonus
            *   Richness 2: +2 bonus
            *   Richness 3: +4 bonus
        *   **Effect**: The tree is removed, and the global `nutrient` value decreases by 1 (or 2 if the opponent also completes a tree on the same turn).
    *   `WAIT`: Do nothing for the rest of the day. If both players `WAIT`, the game ends.
4.  **Game End Scoring**:
    *   Each 3 sun points remaining at the end of the game grant 1 additional point.
    *   If scores are tied, the player with more trees wins.

## Strategy for Wood 4

Given the constraints of Wood 4, the strategy is quite straightforward:

1.  **Prioritize `COMPLETE` actions**:
    *   A `COMPLETE` action costs 4 sun points but yields a significant amount of points (starting at 20 + richness bonus).
    *   In contrast, saving 4 sun points and `WAIT`ing would only yield `floor(4/3) = 1` point at the end of the game. The `COMPLETE` action is overwhelmingly more valuable.
    *   Therefore, if we have enough sun points (at least 4) and a size 3 tree to complete, we should almost always do so.
2.  **Maximize points from `COMPLETE`**:
    *   When choosing which tree to `COMPLETE`, we should select the one that gives the maximum potential points. This means prioritizing trees located on cells with higher richness (Richness 3 > Richness 2 > Richness 1), as they provide a bonus to the base `nutrient` value.
    *   The `nutrient` value starts high (20) and decreases. Completing trees earlier is generally better to capture higher `nutrient` values, but since we can only take one action per turn and there's only one "day", this is implicitly handled by always taking the best action available *this turn*.
3.  **`WAIT` as a last resort**:
    *   If we don't have at least 4 sun points, or if we have no size 3 trees remaining to `COMPLETE`, then `WAIT` is the only viable action.

## Implementation Details

1.  **Initialization**: Read the `numberOfCells` and then `numberOfCells` lines of cell data. The crucial piece of information here is the `richness` for each `cellIndex`. Store this in a `Map` for quick lookup.
2.  **Game Loop**:
    *   Read the current game state: `day` (always 0), `nutrients`, `mySun`, `myScore`, `oppSun`, `oppScore`, `oppIsWaiting`.
    *   Read tree information. Filter for `my` trees that are `size 3`. For each such tree, get its `cellIndex` and look up its `richness` using the `Map` created during initialization. Store these in a list.
    *   Read the `possibleActions` list. In Wood 4, we don't strictly need to parse this list to decide our action; our logic for `COMPLETE` actions (having enough sun, owning a size 3 tree) is sufficient to determine validity. We just need to consume these lines from input.
    *   **Decision Logic**:
        *   Initialize `bestAction` to "WAIT".
        *   Initialize `maxPotentialPoints` to -1 and `bestTreeCellIndex` to -1.
        *   If `mySun >= 4`:
            *   Iterate through all of `mySize3Trees`.
            *   For each tree, calculate the potential points if harvested: `nutrients + richness_bonus`.
            *   If this `currentPotentialPoints` is greater than `maxPotentialPoints`, update `maxPotentialPoints` and `bestTreeCellIndex`.
        *   After checking all trees, if `bestTreeCellIndex` is still -1 (meaning no affordable or suitable trees were found), `bestAction` remains "WAIT". Otherwise, set `bestAction` to `COMPLETE ${bestTreeCellIndex}`.
    *   Output `bestAction`.

This strategy ensures we always take the most profitable action for ourselves given the immediate game state, leading to maximum score in this simplified league.