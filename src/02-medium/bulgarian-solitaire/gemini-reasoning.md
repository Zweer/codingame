Bulgarian Solitaire is a mathematical game played with cards. The goal of this puzzle is to find the length of the cycle (loop) that the game eventually enters.

### Game Rules and State Representation

1.  **Initial State**: You start with `N` piles of cards, each with a given number of cards.
2.  **Turn Steps**: In each turn:
    *   One card is taken from *each* existing pile that has cards. Piles with zero cards are ignored (they effectively disappear).
    *   A new pile is created with all the cards that were collected in this step. The size of this new pile will be equal to the number of non-empty piles at the start of the turn.
3.  **Loop Detection**: The game continues until a configuration of piles is reached that has appeared previously.
    *   **Ignoring order**: A configuration like `[1, 2]` is the same as `[2, 1]`.
    *   **Ignoring empty piles**: A configuration like `[1, 0, 2]` is the same as `[1, 2]`.
    *   The total number of cards in the system remains constant throughout the game.

### Solution Approach

The problem asks for the length of the loop. This is a classic cycle detection problem in a state-space.
The state of the game is defined by the set of pile sizes. To correctly identify if a state has been seen before, we need a canonical representation for each configuration:
1.  **Filter out zero-sized piles**: As per the rules, piles with no cards are ignored.
2.  **Sort the pile sizes**: To account for order not being important, we sort the remaining pile sizes in ascending order.
3.  **Convert to string**: We join the sorted pile sizes into a comma-separated string (e.g., `[1, 2, 3]` becomes `"1,2,3"`). This string will serve as a unique key for the configuration.

We use a `Map` (or a `Set` if we only care about presence, but `Map` is better to store the turn number) to store all previously encountered configurations. The map will store the string representation of the configuration as the key and the turn number (number of steps taken from Turn 0) at which that configuration was first observed as the value.

The algorithm proceeds as follows:

1.  **Initialization**:
    *   Read the initial number of piles (`N`) and their card counts (`C`).
    *   Create an empty `Map` called `seenConfigurations` to store `(configuration_string -> turn_number)` pairs.
    *   Initialize `turnCount` to `0`. This `turnCount` represents the number of turns *completed* to reach the current state.

2.  **Simulation Loop**:
    *   **Standardize Current State**: Convert the `currentPiles` array into its canonical string representation (filter zeros, sort, join).
    *   **Check for Loop**:
        *   If the `normalizedConfig` string is already present in `seenConfigurations`:
            *   A loop has been found. The loop length is the `current turnCount` minus the `turnCount` when this configuration was first seen (retrieved from `seenConfigurations`).
            *   Print the loop length and terminate.
        *   Otherwise (configuration is new):
            *   Add the `normalizedConfig` to `seenConfigurations` with the current `turnCount`.
    *   **Perform Game Turn**:
        *   Iterate through the `currentPiles`. For each pile with `> 0` cards:
            *   Decrement its size by 1. Add this new size to a `nextPiles` array.
            *   Increment a `cardsTaken` counter.
        *   After processing all piles, add the `cardsTaken` count as a new pile to the `nextPiles` array.
        *   Update `currentPiles` to `nextPiles`.
    *   **Increment Turn Counter**: Increment `turnCount` for the next iteration.

This process guarantees finding the loop length because the total number of cards is constant and there are a finite number of ways to partition the total number of cards, so a state must eventually repeat.

### Example Walkthrough (Input: `3`)

*   **Turn 0**: `currentPiles = [3]`, `turnCount = 0`
    *   `normalizedConfig = "3"`. Not in `seenConfigurations`.
    *   `seenConfigurations.set("3", 0)`.
    *   **Perform Turn**: Take 1 from `[3]` -> `[2]`. `cardsTaken = 1`. New pile `[1]`. `nextPiles = [2, 1]`.
    *   `currentPiles = [2, 1]`, `turnCount = 1`

*   **Turn 1**: `currentPiles = [2, 1]`, `turnCount = 1`
    *   `normalizedConfig = "1,2"`. Not in `seenConfigurations`.
    *   `seenConfigurations.set("1,2", 1)`.
    *   **Perform Turn**: Take 1 from `[2]` -> `[1]`. Take 1 from `[1]` -> `[0]`. `cardsTaken = 2`. New pile `[2]`. `nextPiles = [1, 0, 2]`.
    *   `currentPiles = [1, 0, 2]`, `turnCount = 2`

*   **Turn 2**: `currentPiles = [1, 0, 2]`, `turnCount = 2`
    *   `normalizedConfig = "1,2"` (after filtering 0 and sorting).
    *   `normalizedConfig` ("1,2") *is* in `seenConfigurations`. Its value is `1`.
    *   Loop length = `turnCount - seenConfigurations.get("1,2") = 2 - 1 = 1`.
    *   Print `1`.