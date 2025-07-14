The problem asks us to destroy all "surveillance nodes" (`@`) on a grid using "fork-bombs". We have a limited number of bombs and turns. Bombs explode in a cross shape with a range of 3 cells after 3 turns, but can explode earlier if hit by another explosion. Explosions are blocked by "passive nodes" (`#`). We must output the optimal first move (coordinates to place a bomb, or `WAIT`). This is a turn-based puzzle where our program runs repeatedly, making a decision each turn.

This problem is a classic shortest path problem on a graph where states are game configurations. Since we want to find the *first* action of the shortest sequence of actions to destroy all nodes, Breadth-First Search (BFS) is the ideal algorithm.

**1. Game State Representation:**
A game state needs to capture all relevant information:
*   `grid`: A 2D array representing the current state of the map ('.', '@', '#').
*   `placedBombs`: An array of objects `{x: number, y: number, countdown: number}` for bombs currently on the grid. The `countdown` represents turns until natural explosion (3 turns, then 2, then 1, then explodes).
*   `bombsLeft`: The number of bombs we can still place.
*   `turnsLeft`: The number of turns remaining before we lose.
*   `history`: An array of actions (`"WAIT"` or `{x, y}`) taken to reach this state. This is crucial for reconstructing the first move.

**2. Core Mechanics Simulation:**

*   **`simulate_explosions(initialGrid, initialBombsToExplode, currentBombsOnMap)`:** This function takes a grid and lists of bombs, processes explosions (including chain reactions), and returns the updated grid and remaining bombs.
    *   It uses a queue (`q`) to process bombs that explode.
    *   For each exploding bomb, it calculates the affected cells in a cross shape, stopping if out of bounds or if a passive node (`#`) is encountered.
    *   If an affected cell contains a surveillance node (`@`), it's destroyed (becomes '.').
    *   If an affected cell contains another placed bomb that hasn't exploded yet, that bomb is immediately triggered and added to the queue for processing in the same "turn".
    *   It ensures deep copies of the grid and bomb lists are used to avoid modifying states of other BFS branches.

*   **`grid_to_string(grid, bombs)`:** This helper function generates a unique string hash for a game state. This hash is used by the `visited` set in BFS to avoid redundant computations and infinite loops. It concatenates the grid rows and a sorted string representation of the `placedBombs` to ensure consistency.

**3. Breadth-First Search (BFS) Strategy:**

The BFS algorithm will work as follows:

*   **Initialization:**
    *   Create an initial `GameState` representing the current game state (grid, available bombs, remaining turns).
    *   Initialize a `queue` with this initial state.
    *   Initialize a `visited` set to store hashes of states that have already been explored. Add the initial state's hash to `visited`.

*   **Loop:** While the `queue` is not empty:
    *   Dequeue the `currentState`.
    *   **Check for Victory:** If `count_surveillance_nodes(currentState.grid)` is 0, a solution has been found. Since BFS finds the shortest path, the first action in `currentState.history` is the optimal move. Return this action.
    *   **Check for Loss:** If `currentState.turnsLeft <= 0` and there are still surveillance nodes, this path leads to a loss. Skip to the next state in the queue.
    *   **Simulate Turn Progression:** From `currentState`, we consider what happens *after* a decision is made (WAIT or PLACE BOMB) and the turn progresses. This involves decrementing bomb countdowns and processing any resulting explosions.
        *   Identify bombs whose `countdown` is 1. These will explode this turn.
        *   Identify bombs whose `countdown` is > 1. These will have their `countdown` decremented.
        *   Call `simulate_explosions` to apply these explosions and chain reactions to the `currentState.grid` and `currentState.placedBombs`. This yields `nextGrid` and `nextPlacedBombs`.
    *   **Generate Next States (Branching):**
        *   **Option 1: WAIT:** Create a new `GameState` based on `nextGrid`, `nextPlacedBombs`, `currentState.bombsLeft`, and `currentState.turnsLeft - 1`. Add `"WAIT"` to its history. If this state hasn't been visited, add it to the `queue` and `visited` set.
        *   **Option 2: PLACE BOMB:** If `currentState.bombsLeft > 0`, iterate through all empty cells (`.`) on `currentState.grid` that do not already contain a bomb.
            *   For each valid empty cell `(c, r)`:
                *   Create a new list of bombs by adding `{x: c, y: r, countdown: 3}` to `currentState.placedBombs`.
                *   Calculate which bombs from this *new list* will explode this turn (countdown 1) and which will have their countdown decremented.
                *   Call `simulate_explosions` again, using `currentState.grid` and these bomb lists to get `nextGrid` and `nextPlacedBombs`.
                *   Create a new `GameState` based on these, with `currentState.bombsLeft - 1` and `currentState.turnsLeft - 1`. Add `{x: c, y: r}` to its history. If this state hasn't been visited, add it to the `queue` and `visited` set.

*   **No Solution:** If the queue becomes empty and no victory state was found, it means no solution exists within the given constraints. In CodinGame, this usually implies losing, so returning "WAIT" is a safe fallback.

**4. Turn-Based Execution:**

The CodinGame environment runs our program in a loop.
*   First, `readInitialInput()` is called once to get grid dimensions and the initial map layout.
*   Then, in an infinite loop, `readTurnInput()` provides the current `rounds` and `bombs`.
*   Crucially, before running BFS for *this* turn's decision, we must update our `currentGameState` by processing the explosions that happened due to actions in *previous* turns. This `currentGameState` (which stores the persistent grid and active bombs) is then used as the `initialStateForBFS`.
*   The BFS will then compute the best first action from this *updated current state*.

This approach ensures that the BFS always finds the optimal move considering the current game situation and the remaining resources.