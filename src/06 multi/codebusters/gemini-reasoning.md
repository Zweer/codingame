The CodeBusters puzzle requires controlling a team of busters to capture ghosts and bring them back to your base. The game involves fog of war, ghost movement, and strategic decision-making for each buster.

Here's a breakdown of the strategy and implementation:

1.  **Game State Representation:**
    *   **`Point` Interface:** A simple `{x, y}` structure for coordinates.
    *   **`EntityType` Enum:** Defines types for busters (Team 0, Team 1) and ghosts.
    *   **`GameEntity` Interface:** Represents the raw input data for any entity on the map.
    *   **`Buster` Class:** Extends `GameEntity` information with internal state for AI, such as `hasGhost` and `explorationTargetIndex`. My own busters are stored in a `Map<number, Buster>`.
    *   **`Ghost` Class:** Stores `id`, `x`, `y`, `isTrapped` (meaning it's currently carried by *any* buster or delivered to a base), and `lastSeenTurn` (for fog of war tracking). All known ghosts are stored in a `Map<number, Ghost>`.
    *   **Global Variables:** `myTeamId`, `myBase`, `opponentBase`, `bustersPerPlayer`, `ghostCount`, and `currentTurn` are maintained.

2.  **Utility Functions:**
    *   `dist(p1, p2)`: Calculates Euclidean distance between two points.
    *   `clamp(value, min, max)`: Restricts a value within a given range, useful for keeping coordinates within map boundaries.
    *   `getBase(teamId)`: Returns the `Point` object for a team's base location.

3.  **Game Loop Logic:**
    *   **Initialization:** Reads `bustersPerPlayer`, `ghostCount`, and `myTeamId` to set up base locations and initial buster objects. Each buster is given an initial `explorationTargetIndex` to ensure they spread out.
    *   **Turn Processing:**
        *   Increments `currentTurn`.
        *   Reads the `entitiesCount` for the current turn.
        *   Parses each entity input line:
            *   **My Busters:** If the entity is one of my busters, its `Buster` object in `myBusters` is created or updated with current position and state.
            *   **Opponent Busters:** If the entity is an opponent buster, its `Buster` object in `opponentBusters` is created or updated. If the opponent buster is carrying a ghost, that ghost is marked as `isTrapped = true` in the `knownGhosts` map, indicating it's unavailable.
            *   **Ghosts:** If the entity is a ghost, its `Ghost` object in `knownGhosts` is created or updated. It's also added to `visibleGhostsThisTurn` and marked `isTrapped = false` (since it's visible, it's not carried or delivered).
    *   **Buster AI (for each of my busters):** The core decision-making for each buster follows a priority system:

        *   **Priority 1: Deliver Ghost:**
            *   If the buster `hasGhost`, it checks its distance to `myBase`.
            *   If within `RELEASE_RANGE` (1600 units), it executes `RELEASE`.
            *   Otherwise, it executes `MOVE myBase.x myBase.y` to head towards the base.

        *   **Priority 2: Bust a Ghost:**
            *   If the buster does not have a ghost, it looks for available ghosts to bust.
            *   It filters `visibleGhostsThisTurn` to find ghosts that are `!isTrapped` and `!assignedGhostIds.has(ghost.id)` (to prevent multiple busters from targeting the same ghost this turn).
            *   It then categorizes these available ghosts based on distance:
                *   **`BUST_MIN_RANGE` to `BUST_MAX_RANGE` (900-1760):** These ghosts are immediately bustable. The closest one is preferred.
                *   **Less than `BUST_MIN_RANGE` (too close):** The buster needs to move away. It calculates a target point `BUST_MIN_RANGE` units away from the ghost, in the direction of the buster's current position. An edge case is handled for when the buster is exactly on top of the ghost (`d === 0`), moving simply `BUST_MIN_RANGE` units to the right. `Math.round` and `clamp` are used for the target coordinates.
                *   **Greater than `BUST_MAX_RANGE` (too far):** The buster needs to move closer. It simply targets the ghost's current coordinates.
            *   The buster prioritizes an immediate `BUST` action first. If none are possible, it then prioritizes moving to get into range (too close), and finally moving towards a ghost (too far). The closest ghost within each category is preferred.
            *   If a `bestGhostToTarget` is found, the corresponding `BUST` or `MOVE` action is executed, and the ghost's ID is added to `assignedGhostIds`.

        *   **Priority 3: Explore:**
            *   If no suitable ghost is found to bust (either none visible, all are trapped, or already assigned to another buster), the buster enters exploration mode.
            *   A predefined list of `EXPLORATION_TARGETS` is used. Each buster has an `explorationTargetIndex`.
            *   If the buster is already "close enough" (within 1.5 times `MOVE_DISTANCE`) to its current `EXPLORATION_TARGET`, it increments its `explorationTargetIndex` to move to the next point in the sequence, ensuring it continues exploring.
            *   It then executes `MOVE` to the current `explorationTarget`.

This strategy provides a robust foundation for capturing ghosts, with basic handling of movement, range, and exploration.