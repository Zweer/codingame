The goal of this puzzle in Wood 4 league is to destroy the enemy Queen. The simplest and often most effective strategy for this league is a "Knight rush" where you build Knight barracks and continuously train Knight units to attack the enemy Queen. Archer units are not strictly necessary as they only attack enemy creeps, not the Queen, and the enemy AI in this league often also focuses on Knights.

Here's a breakdown of the strategy:

1.  **Queen's Action (Build/Move/Wait):**
    *   **Goal:** Build a target number of Knight barracks (e.g., 2).
    *   **Logic:**
        *   Count friendly Knight barracks.
        *   If the target count is not met:
            *   Check if the Queen is currently touching a building site (`touchedSiteId !== -1`).
            *   If yes, and the site is empty, or it's my site with an unwanted structure (e.g., an Archer barracks) and *not currently training*, then `BUILD` a `BARRACKS-KNIGHT`.
            *   If not touching a suitable site, or unable to build on the touched site, find the closest suitable site (prioritizing empty sites, then my own Archer barracks that are not training) and `MOVE` the Queen towards it.
        *   If the target number of Knight barracks has been built:
            *   Move the Queen to a safe, corner location on your side of the map (e.g., `(0,0)` if you start on the left, `(1920,0)` if on the right) to keep her out of harm's way from enemy Knights.

2.  **Training Action:**
    *   **Goal:** Train Knights as often as possible.
    *   **Logic:**
        *   Identify all friendly Knight barracks that are ready to train (`param1 === 0`).
        *   Calculate how many groups of Knights can be afforded with the current gold (each group costs 80 gold).
        *   Select the `siteId`s of as many ready Knight barracks as possible, up to what can be afforded.
        *   Issue the `TRAIN` command with the selected `siteId`s. If no training is possible (not enough gold or no ready barracks), issue `TRAIN` with no arguments.

**Code Structure:**

*   **Enums and Interfaces:** Define clear types for `StructureType`, `Owner`, `CreepType`, `Point`, `Site`, `SiteState`, and `Unit` to improve readability and maintainability.
*   **Initialization Phase:** Read `numSites` and details for each static `Site`.
*   **Game Loop:**
    *   Read turn-specific input: `myGold`, `touchedSiteId`, `SiteState` for all sites, and `Unit` details for all units (including Queens).
    *   Implement the Queen's action logic based on the strategy.
    *   Implement the training action logic.
    *   Print the two required output lines (`MOVE`/`BUILD`/`WAIT` and `TRAIN`).
*   **Helper Functions:**
    *   `distance(p1, p2)`: Calculates Euclidean distance between two points.
    *   `findTargetSiteForBuilding(...)`: Finds the best site for the Queen to move to/build on based on the strategy's priorities.
    *   `getDefensiveQueenMove(...)`: Determines a safe corner for the Queen to move to.