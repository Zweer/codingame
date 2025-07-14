The "Botters of the Galaxy" puzzle in its Wood 4 league introduces the basic mechanics of a MOBA-style game. The primary goals are to destroy the enemy tower or eliminate the enemy hero. In this league, players control a single hero, with no complex mechanics like items, skills, or neutral creeps to consider.

### Reasoning for the Solution

1.  **Hero Selection Phase (`roundType < 0`):**
    *   The puzzle requires outputting a hero name. A simple, effective choice for this league is key, as there are no advanced strategies like counter-picking.
    *   **IRONMAN** is chosen due to his ranged attack (range 270), which allows him to safely poke enemies and towers from a distance. While his health is lower, his range often compensates for this, allowing him to avoid direct engagement with melee heroes or tower attacks if played carefully. Other heroes like Deadpool or Hulk have higher HP and damage but are melee, requiring them to be in closer, more dangerous positions. Doctor Strange also has good range but lower damage. IRONMAN provides a good balance for a basic strategy.

2.  **Game Phase (`roundType > 0`):**
    *   The core strategy revolves around identifying the most critical target and commanding the hero to attack it. If no immediate threat or win condition is present, the hero should push towards the enemy base.
    *   **Targeting Priority:**
        *   **Enemy Hero:** Eliminating the enemy hero is an immediate win condition. Therefore, the bot prioritizes finding and attacking the visible opponent hero. The `isVisible` property for heroes is crucial here.
        *   **Enemy Tower:** If no visible enemy hero is present, the next priority is the enemy tower. Destroying the tower is also a win condition.
        *   **Pushing:** If neither an enemy hero nor an enemy tower is visible or targetable (e.g., they are too far or hidden), the hero should move proactively towards the general location of the enemy tower. This ensures continuous pressure and forward progression.
    *   **Command Choice (`ATTACK` vs. `MOVE_ATTACK`):**
        *   The `ATTACK unitId` command moves the hero closer only if "slightly" out of range. For potentially long distances, this might not be sufficient to close the gap and land an attack in one turn.
        *   The `MOVE_ATTACK x y unitId` command is more robust. It instructs the hero to move towards the specified `(x, y)` coordinates and then attack `unitId` if it's within range after the movement. By setting `(x, y)` to the target's coordinates, we ensure the hero moves directly towards the target, maximizing the chance of getting within attack range and performing an action in the same turn. This is crucial for maintaining aggression.
    *   **Movement Logic (when pushing):**
        *   The game map is 1920x750. Player 0 starts on the left, player 1 on the right.
        *   Player 0's tower is at (0, 375), and Player 1's tower is at (1920, 375).
        *   When pushing without an immediate target, the hero moves towards a point near the enemy tower's X-coordinate, keeping Y at the center of the map (375).
        *   For `myTeam = 0`, the hero pushes towards `X = 1800` (near the enemy tower at 1920).
        *   For `myTeam = 1`, the hero pushes towards `X = 120` (near the enemy tower at 0). This allows the hero to position itself for an attack when the tower comes into range.

### Structure of the Code:

1.  **Helper Function:** A `distance` function for calculating Euclidean distance between two points.
2.  **Interfaces and Enums:** Define types for `Coordinate`, `UnitType`, `HeroType`, `GameEntity` (base for all units like towers, creeps), and `HeroEntity` (extends `GameEntity` with hero-specific attributes). This improves code readability and maintainability.
3.  **Global Variables:** `myTeam` stores the player's team number. Arrays like `myHeroes`, `opponentHeroes`, `myTowers`, `opponentTowers` store the parsed game entities for the current turn.
4.  **Initialization Phase:** Reads `myTeam` and then consumes the subsequent lines for `bushAndSpawnPointCount` and `itemCount` without processing their details, as these are not relevant for Wood 4 league.
5.  **Game Loop (`while(true)`):**
    *   Reads per-turn inputs (`myGold`, `oppGold`, `roundType`, `entityCount`).
    *   Clears entity lists from the previous turn.
    *   Parses all `entityCount` lines, populating the respective entity arrays (`myHeroes`, `opponentHeroes`, etc.) based on `team` and `unitType`.
    *   **Decision Logic:**
        *   If `roundType < 0`, outputs `IRONMAN`.
        *   If `roundType > 0`:
            *   Gets the player's single hero (`myHeroes[0]`).
            *   Filters for `visibleOpponentHeroes` and attempts to `MOVE_ATTACK` the first one found.
            *   If no visible opponent hero, attempts to `MOVE_ATTACK` the opponent tower.
            *   If neither is present, issues a `MOVE` command towards the pre-defined push coordinates near the enemy base.
            *   Includes debug messages (`; Comment`) for clarity in the CodinGame visualizer.

This strategy is straightforward and aims to aggressively push towards win conditions while adapting to the presence of the enemy hero.