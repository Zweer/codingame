The goal of "A Code of Ice And Fire" is to destroy the opponent's Headquarters (HQ) or have more military power after 100 turns. In the Wood 4 league, only Level 1 units are available. These units cost 10 gold to train, 1 income for upkeep, and can destroy other Level 1 units and HQs.

My strategy for the Wood 4 league focuses on a direct assault:

1.  **Territory Expansion and Income Generation**:
    *   The bot needs gold to train units. Gold is generated based on the number of active cells owned.
    *   Active cells are those connected to the HQ by a path of owned cells.
    *   The strategy prioritizes expanding the territory by capturing neutral cells (`.`) or inactive opponent cells (`x`). This increases income, allowing more units to be trained.

2.  **Unit Training**:
    *   Whenever sufficient gold (10) is available, a Level 1 unit is trained.
    *   Training spots are selected based on priority:
        1.  Neutral cells (`.`) adjacent to active player territory: These are ideal for expansion as they immediately add to the player's territory and income.
        2.  Inactive opponent cells (`x`) adjacent to active player territory: These are also good for expansion and disrupting opponent territory.
        3.  Active player cells (`O`): Used if no better expansion spots are available, primarily to mass units or defend.
    *   Among cells of the same priority, those closer (Manhattan distance) to the opponent's HQ are preferred to push the frontline.
    *   The bot keeps track of `occupiedCells` (cells where friendly buildings exist or units are planned to move/train this turn) to ensure valid training spots.

3.  **Unit Movement**:
    *   Existing Level 1 units are moved each turn.
    *   The game engine handles the exact pathfinding for `MOVE id x y` by moving the unit one cell towards the target if the distance is greater than 1. This simplifies our unit movement logic; we only need to provide a smart target.
    *   Unit targets are prioritized as follows:
        1.  **Immediate Enemy HQ Attack**: If a unit is adjacent to the opponent's HQ, it will move directly onto it to attack.
        2.  **Immediate Enemy Unit Attack**: If no adjacent HQ, but an enemy unit is adjacent, the unit will move onto it to attack.
        3.  **Advance Towards Enemy HQ**: If no immediate attacks are possible, the unit's target is simply set to the opponent's HQ coordinates. The game engine will then move the unit one step closer, automatically choosing a path through friendly or neutral territory.
    *   Units cannot move onto void cells (`#`) or cells already occupied by friendly buildings. They also cannot move onto cells that are already targeted by another friendly unit's move or a new unit's training this turn (managed by `occupiedCells`).
    *   After a unit's move is planned, its original cell is marked as free, and its destination cell is marked as occupied within the `occupiedCells` set. This allows subsequent `TRAIN` actions or other unit moves to consider the updated board state.

This strategy aims to constantly push towards the enemy HQ by expanding territory and deploying a steady stream of units, which is effective for the Wood 4 league's simplified ruleset.