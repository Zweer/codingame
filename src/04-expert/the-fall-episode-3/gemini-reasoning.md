The problem "The Fall - Episode 3" is a pathfinding puzzle where we need to guide Indiana Jones through a tunnel system while avoiding pitfalls and increasingly, moving rocks. The key challenges introduced in this episode are:
1.  **Rotatable Rooms:** Certain rooms can be rotated to change Indy's path. We cannot rotate rooms containing Indy, the exit, or a rock.
2.  **Moving Rocks:** Rocks appear and move according to the same rules as Indy. If Indy and a rock occupy the same room at the same time, Indy loses. If two rocks collide, they are destroyed.
3.  **Anticipation:** We need to "anticipate the arrival of some rocks." This implies looking ahead more than one turn and planning Indy's route to avoid future collisions with the currently known rocks.

**Strategy:**

The core of the solution is a search algorithm that evaluates possible actions (rotating a room or waiting) for the current turn. Since we need to anticipate rock movements, this evaluation involves simulating future turns.

1.  **Representing the Grid and Rooms:**
    *   We define `Direction` (TOP, RIGHT, BOTTOM, LEFT) to represent entry/exit points.
    *   `Room` class: Each room stores its original type, whether it's rotatable, and its current rotation state (0, 90, 180, 270 degrees clockwise from initial orientation).
    *   A `ROOM_TEMPLATES_BY_TYPE` map stores the base path configurations for each room type.
    *   The `Room.getExitDirection(entryDirection)` method correctly calculates the exit path based on the room's current rotation and entry point. This is crucial for accurate simulation.

2.  **Representing the Game State:**
    *   A `GameState` class encapsulates the entire game state: grid of rooms, Indy's position and entry direction, and all current rock positions and entry directions.
    *   A `clone()` method for `GameState` is essential for simulating future turns without modifying the actual game state.

3.  **Simulating a Turn (`simulateTurn` method):**
    *   This method takes a proposed action (WAIT or ROTATE) and a boolean `isDryRun`.
    *   If `isDryRun` is true, it operates on a cloned state; otherwise, it modifies the actual game state.
    *   It first applies the chosen rotation (if applicable and valid: not Indy's room, not exit, not containing a rock).
    *   Then, it calculates Indy's next position and all rocks' next positions simultaneously.
    *   It handles rock-rock collisions (destroying rocks that land on the same cell).
    *   Finally, it checks for Indy-rock collisions after all movements are resolved.
    *   It returns the outcome: 'WIN', 'LOSE', or 'CONTINUE', along with the updated positions of Indy and surviving rocks.

4.  **Action Evaluation (Minimax-like Search):**
    *   The `evaluateAction` function is a recursive method that determines the "score" of a given action.
    *   It takes a `GameState` (a clone), an `action`, and a `depth` parameter.
    *   **Base Cases:**
        *   If `simulateTurn` results in 'WIN', it returns a high score (prioritizing faster wins by `1000 - depth`).
        *   If `simulateTurn` results in 'LOSE', it returns a low score (penalizing slower losses less severely by `-1000 + depth`).
    *   **Recursive Step (`MAX_SEARCH_DEPTH`):**
        *   If the `depth` limit is reached, it uses a heuristic to estimate the future pathability.
        *   Otherwise (if `CONTINUE` and `depth < MAX_SEARCH_DEPTH`), it generates all *possible* actions for the *next* turn (from the simulated state) and recursively calls `evaluateAction` for each, taking the maximum score (since we want to find the best possible sequence of actions).

5.  **Heuristic (`findIndyPathHeuristic`):**
    *   When the search depth is reached, we need a quick estimate of whether Indy can still win.
    *   This function performs a Breadth-First Search (BFS) from Indy's current position (after simulated moves) to the exit.
    *   **Optimistic Assumptions:**
        *   It assumes we can rotate any rotatable room optimally (to provide a path) if it's not currently locked (by Indy, exit, or a rock).
        *   It only considers the *currently known* rock positions and avoids paths that would lead Indy into a cell occupied by a rock. It does *not* anticipate new rocks appearing or rocks moving further than the single turn simulated to reach `state`.
    *   It returns `500 - path_length` if a path is found (closer paths are better) or `-500` if no path is found.

6.  **Main Game Loop:**
    *   Reads initial `W, H, grid, EX`.
    *   In an infinite loop:
        *   Reads Indy's current state and all rock states.
        *   Generates a list of all valid possible actions for the current turn (`WAIT` or `ROTATE X Y LEFT/RIGHT`). A rotation is valid only if the room is rotatable, not Indy's room, not the exit room, and not occupied by a rock.
        *   Iterates through these `actualPossibleActions`, calling `evaluateAction` for each.
        *   The action that yields the highest score is chosen and printed.

**Constraints and Optimizations:**
*   `W, H <= 20`, `R <= 10`.
*   A `MAX_SEARCH_DEPTH` of `1` or `2` is a good balance for the 150ms time limit. A depth of `1` (one-turn lookahead plus heuristic) is likely sufficient and fast enough. The number of possible actions (approx. `W*H*2 + 1` = `800` actions max) means `800` simulations per turn for depth 1. Each simulation is fast (move Indy + 10 rocks + heuristic BFS over 400 cells).
*   Deep cloning `GameState` and `Room` objects is important to avoid side effects in the search tree.

This comprehensive approach allows the AI to react to immediate threats from rocks and strategically position rooms to create a path, looking ahead a limited number of turns.