The puzzle "Vox Codei - Episode 2" is an extension of the first episode, where surveillance nodes (`@`) can now move. The goal remains to destroy all these nodes within a limited number of turns and bombs.

Here's a breakdown of the strategy and the TypeScript implementation:

**1. Game State and Data Structures:**

*   **Grid Representation:** The map is represented as a 2D array of strings (`string[][]`). We differentiate between the `staticGrid` (which stores `#` walls and `.` empty spaces, constant throughout the game) and `currentInputGrid` (the grid read each turn, reflecting current node positions).
*   **Nodes:** Each surveillance node (`@`) needs to be tracked. We use an `interface NodeState` to store its `id` (for unique identification across turns), `x`, `y` coordinates, and `dx`, `dy` representing its current velocity (e.g., `(1,0)` for right, `(-1,0)` for left, etc.).
    *   `globalTrackedNodes`: An array that persists across turns, storing all currently "alive" and tracked nodes.
    *   `nextGlobalNodeId`: A counter to assign unique IDs to new nodes.
*   **Round Counter:** `roundNumber` helps distinguish the initial game turn from subsequent turns, especially for initializing node directions and the `staticGrid`.

**2. Node Movement Simulation (`simulateSingleNodeMove`):**

*   Nodes move one unit per turn, either horizontally or vertically.
*   If a node attempts to move into a wall (`#`) or grid boundary, it reverses its direction (`dx *= -1`, `dy *= -1`). Crucially, it then moves one unit in this *new* (reversed) direction within the *same* turn. This ensures constant speed.
*   The function takes a `NodeState` object and modifies its `x`, `y`, `dx`, `dy` properties in place. It uses the `staticGrid` for collision detection.

**3. Bomb Explosion (`getBlastRadius`):**

*   Bombs explode in a cross shape, with a range of 3 cells.
*   The explosion is blocked by passive nodes (`#`) and grid boundaries.
*   This function calculates all `(x,y)` coordinates that would be affected by a bomb placed at a given `(bombX, bombY)`, returning them as a `Set<string>` (where coordinates are "x,y" strings).

**4. Node Tracking and Reconciliation (Per Turn):**

This is the most critical part due to moving nodes and the absence of explicit node IDs in the input.

*   **Initialization (First Turn - `roundNumber === 0`):**
    *   The `staticGrid` is built by recording all `#` positions.
    *   All `@` symbols found in the initial `currentInputGrid` are identified as new nodes.
    *   For each new node, an `id` is assigned, and an initial `dx, dy` velocity is determined using a simple heuristic:
        *   Try to move right. If that path is blocked by a wall/boundary, try left.
        *   If both horizontal paths are blocked, try down. If that's blocked, try up.
        *   This prioritizes horizontal movement. This is an assumption based on common puzzle patterns.
        *   `dx` or `dy` will always be zero, as movement is strictly horizontal or vertical.
*   **Subsequent Turns (`roundNumber > 0`):**
    *   We compare the *actual* `@` positions from the `currentInputGrid` with the *predicted* positions of our `globalTrackedNodes` from the previous turn.
    *   For each `oldNode` in `globalTrackedNodes`:
        *   Calculate its `predictedNextPosition` (`oldNode.x + oldNode.dx`, `oldNode.y + oldNode.dy`).
        *   If an `@` exists at this `predictedNextPosition` on the `currentInputGrid` and hasn't been matched yet, then this `oldNode` is matched to it. Its `x, y` are updated, and it's added to `newGlobalTrackedNodes`.
        *   If the direct prediction fails, calculate its `bouncedPosition` (`oldNode.x - oldNode.dx`, `oldNode.y - oldNode.dy`).
        *   If an `@` exists at this `bouncedPosition` and hasn't been matched, then this `oldNode` is matched. Its `x, y` are updated, and its `dx, dy` are reversed. It's then added to `newGlobalTrackedNodes`.
    *   Nodes that are not found on the `currentInputGrid` (i.e., they didn't match a `predicted` or `bounced` position) are implicitly considered destroyed (e.g., by a bomb from a previous turn) and are not carried over to `newGlobalTrackedNodes`.
    *   `globalTrackedNodes` is then updated with `newGlobalTrackedNodes`.

**5. Bomb Placement Strategy (Greedy with Foresight):**

*   The goal is to destroy all nodes. We have limited bombs and turns.
*   **Decision Logic:**
    1.  If no bombs left or all nodes are destroyed, `WAIT`.
    2.  Iterate through every empty cell `(bx, by)` on the `currentInputGrid` (where a bomb can be placed).
    3.  For each potential placement:
        *   Create a deep copy of `globalTrackedNodes` to simulate their movement.
        *   Simulate the movement of these copied nodes for `3` turns into the future (the fuse time of a bomb).
        *   Calculate the `blastRadius` for the bomb at `(bx, by)`.
        *   Count how many of the *simulated* nodes (at their 3-turn future positions) fall within this `blastRadius`. This is `currentNodesDestroyed`.
    4.  Keep track of the `(bestBombX, bestBombY)` that yields the `maxNodesDestroyed`.
    5.  If `maxNodesDestroyed > 0`, output `bestBombX bestBombY`.
    6.  Otherwise (no bomb can hit any nodes effectively in 3 turns), output `WAIT`.
*   This strategy is greedy: it picks the best immediate bomb placement. It doesn't plan for cascading explosions or multi-bomb combinations over several turns, which would require a more complex search (e.g., A* or minimax). Given the time constraints (100ms) and grid size, a greedy approach is usually sufficient for "medium" difficulty puzzles.

The "chaining explosions" rule ("A fork-bomb can explode before the 3 turns if it is triggered by the explosion of another fork-bomb.") is implicitly handled by the game engine. Our simulation for bomb placement only considers the *player-placed* bomb exploding after 3 turns. If this triggers other bombs, that's a bonus effect we don't need to model explicitly for our decision-making.