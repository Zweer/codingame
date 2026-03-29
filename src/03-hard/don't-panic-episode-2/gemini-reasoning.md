The problem "Don't Panic - Episode 2" is an extension of "Episode 1" with a crucial new mechanic: the ability to build additional elevators. The goal remains to save at least one clone by guiding it to the exit.

### Key Changes and Challenges in Episode 2:

1.  **Multiple Elevators per Floor:** Floors can now have more than one or no elevators. This means the pathfinding can be more complex, as there might be multiple ways to ascend.
2.  **`ELEVATOR` Action:**
    *   We can build a new elevator at the `leading clone`'s current `(floor, pos)`.
    *   `nbAdditionalElevators` specifies how many we can build.
    *   The clone performing the `ELEVATOR` action is destroyed. This implies sacrificing a clone to create a necessary path for *future* clones.

### Overall Strategy:

The core of the solution revolves around a robust simulation function and a greedy decision-making process for the leading clone.

1.  **Simulation Function (`simulatePathOutcome`):**
    *   This function is the brain of the strategy. It takes a starting clone state (`floor`, `pos`, `direction`), the current map state (elevators, blocked positions), and game parameters.
    *   It simulates the clone's movement turn by turn.
    *   It handles:
        *   Reaching the exit (`'SAVED'`).
        *   Falling off the map (`'DIED'`).
        *   Going too high above the exit floor (`'TOO_HIGH'`).
        *   Using existing elevators (takes 1 turn to go up, then continues on next floor).
        *   Colliding with blocked clones (changes direction upon reaching the blocked position).
        *   Detecting infinite loops (oscillating paths) using a `visitedStates` set (`'STUCK'`).
    *   It returns an outcome (`'SAVED'`, `'DIED'`, `'STUCK'`, `'TOO_HIGH'`, `'NONE'`).

2.  **Decision-Making Logic (in the main game loop):**

    For each turn, given the `leading clone`'s state:

    *   **No leading clone:** If `cloneFloor` is -1, output `WAIT`.
    *   **Attempt 1: Check if the current clone can succeed without intervention:**
        *   Call `simulatePathOutcome` with the current clone's state and existing map.
        *   If the outcome is `'SAVED'`: This clone is a winner! Output `WAIT` to let it proceed.
    *   **Attempt 2: Immediate Danger / Forced Block:**
        *   If the outcome is `'DIED'` or `'TOO_HIGH'`: This clone is doomed if left alone. It's always better to `BLOCK` it. Blocking prevents its destruction and turns its position into a turning point for subsequent clones. Add its position to `blockedClonesPositions`. Output `BLOCK`.
    *   **Attempt 3: Consider Building an Elevator:**
        *   If the outcome is `'STUCK'` or `'NONE'` (meaning the clone won't die immediately but also won't reach the exit):
            *   Check if we have `nbAdditionalElevatorsRemaining > 0`, if the current `(cloneFloor, clonePos)` doesn't already have an elevator, and if the clone is on a floor `below` the `exitFloor` (as elevators only go up).
            *   **Hypothetical scenario:** Create a temporary set of elevators that includes a new one at `(cloneFloor, clonePos)`.
            *   Simulate the clone's path again using this `testElevatorsSet`. This simulates if *some* clone (potentially a future one, as the current one would be destroyed) could be saved using this new elevator.
            *   If this hypothetical simulation results in `'SAVED'`: It's beneficial to build the elevator. Add `(cloneFloor, clonePos)` permanently to `elevatorsSet`, decrement `nbAdditionalElevatorsRemaining`, and output `ELEVATOR`.
    *   **Attempt 4: Default to Blocking:**
        *   If none of the above actions were taken (e.g., no elevator needed, no elevators left, or building an elevator wouldn't immediately lead to a save): Then `BLOCK` the clone. This prevents it from wandering aimlessly and creates a turning point for other clones, which is often crucial for navigation. Add its position to `blockedClonesPositions`. Output `BLOCK`.

### Implementation Details:

*   **`elevatorsSet` and `blockedClonesPositions`:** Used `Set<string>` to store coordinates as "floor,pos" strings for efficient lookups.
*   **`MAX_SIM_TURNS`:** A large enough constant to prevent infinite loops in the `simulatePathOutcome` function (e.g., `width * nbFloors * 4`).
*   **`visitedStates` in `simulatePathOutcome`:** This set helps detect if a clone enters a loop (e.g., moving back and forth between two points). It's crucial to clear this set when the clone moves up a floor, as its context changes significantly.

This greedy strategy prioritizes immediate saves, then prevents immediate deaths, then attempts to create necessary infrastructure (elevators), and finally, falls back to creating turning points.