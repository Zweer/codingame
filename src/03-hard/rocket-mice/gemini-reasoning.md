The puzzle asks us to simulate a game called "Rocket mice" turn by turn to calculate the final scores for all players. The simulation involves tracking the movement of mice and cats on a grid, their interactions with game elements like rockets, pits, walls, and arrows, and scoring based on animals entering rockets.

Here's a breakdown of the logic and implementation:

**1. Game State Representation:**
*   **Grid (`board: Cell[][]`):** A 2D array representing the game board. Each `Cell` object stores its `type` (EMPTY, ROCKET, PIT, ARROW, DOOR, WALL) and specific information like `rocketInfo` (player ID) or `arrowInfo` (direction, player ID).
*   **Animals (`currentAnimals: Animal[]`):** A list of all animals currently active on the board. Each `Animal` object tracks its `id`, `type` (MOUSE/CAT), `x`, `y` coordinates, `direction`, and `prevX`, `prevY` (for pass-through eating detection).
*   **Players (`playerScores: number[]`):** An array to store the score for each player (0-indexed).
*   **Rockets (`rocketLocations: Rocket[]`):** Stores the coordinates and owner ID of each player's rocket.
*   **Doors (`doors: Door[]`):** Stores details about each door: its grid coordinate, the wall it's on, its initial spawn coordinate (off-grid), and the direction animals move upon entering. `spawnCount` tracks animals produced for cat/mouse determination.
*   **Arrow Placements (`arrowPlacementsInput`):** A pre-read list of all arrow placement instructions for each turn.
*   **Player Arrow History (`playerArrowHistory`):** A Map to store a queue (FIFO) of arrows placed by each player, to enforce the 3-arrow limit.

**2. Core Game Logic (Turn by Turn Simulation):**

The game simulates for `NUM_TURNS + 1` cycles of animal movement and scoring. The extra cycle is to account for the final scoring step after the last arrow is placed. Arrow placement itself only happens for `NUM_TURNS`.

Each turn follows a strict sequence of steps:

*   **Step 1: Animal Production:**
    *   For each door, increment its `spawnCount`.
    *   If `spawnCount` is a multiple of 10, a `CAT` is produced; otherwise, a `MOUSE`.
    *   The animal is created `behind` its respective door (off-grid) with a determined initial movement direction and added to `currentAnimals`.

*   **Step 2: Animal Movement:**
    *   All animals in `currentAnimals` move simultaneously one square in their current direction.
    *   For each animal:
        *   Its current position is stored as `prevX`, `prevY`.
        *   Its `x`, `y` coordinates are updated to the `nextCoord`.
        *   **Check for removal:** If the `nextCoord` is off-board or a `PIT` cell, the animal is removed from play.
        *   **Check for rockets:** If the `nextCoord` is a `ROCKET` cell, the animal is temporarily stored in `animalsMovedIntoRockets` for scoring and will be removed from play.
        *   Animals remaining on the board (not removed and not entering a rocket) are collected in `animalsRemainingOnBoard`.
    *   Auxiliary maps (`miceAtLocPrev`, `catsAtLocPrev`, `miceAtLocNext`, `catsAtLocNext`) are used to efficiently track animal presence at specific coordinates before and after movement, which is crucial for eating rules.

*   **Steps 3 & 4: Scoring (Mice then Cats):**
    *   Iterate through `animalsMovedIntoRockets`.
    *   If a `MOUSE` entered a rocket, its owner's score increases by 1.
    *   If a `CAT` entered a rocket, its owner's score decreases by 10.
    *   Scores are capped at 0 (never go below zero).

*   **Step 5: Mice Eaten:**
    *   **Same Square:** Iterate through `miceAtLocNext`. If any square has both mice and cats, all mice on that square are `eaten` (marked for removal).
    *   **Pass-through:** Iterate through `animalsRemainingOnBoard`. If a `MOUSE` moved from `A` to `B` and a `CAT` simultaneously moved from `B` to `A`, the mouse is `eaten`.
    *   `currentAnimals` is updated to exclude all eaten mice.

*   **Step 6: Redirection:**
    *   For each animal still in `currentAnimals`:
        *   **Arrow:** If the animal's current square has an `ARROW`, its direction is updated to match the arrow's direction.
        *   **Wall/Door:** If not on an arrow, calculate the `potentialNextCoord` based on the animal's current direction. If this `potentialNextCoord` is out of bounds or a `WALL`/`DOOR` cell, the animal's direction turns 90 degrees counter-clockwise. (Note: Rockets and pits do not cause turns if an animal is *facing* them; animals simply move into them and are removed/scored).

*   **Step 7: Arrow Placement:**
    *   This step only executes for the first `NUM_TURNS` iterations.
    *   The current player (determined cyclically) places an arrow at the specified `(x, y)` with the given `direction`.
    *   **3-arrow limit:** If the player already has 3 arrows on the board, their oldest placed arrow is removed from the board.
    *   The new arrow is placed on the board, updating the `CellType` and `arrowInfo`.
    *   The `currentPlacingPlayerId` advances to the next player.

**3. Final Output:**
*   After the simulation loop completes, the final `playerScores` are printed, one per line.

**Key Data Structures and Helpers:**
*   Enums for `Direction`, `AnimalType`, `CellType` for clarity.
*   `DX`, `DY` arrays for easy coordinate calculation based on direction.
*   `getNextCoord(x, y, dir)`: Returns the next coordinate based on current position and direction.
*   `turnCounterClockwise(dir)`: Returns the new direction after a 90-degree counter-clockwise turn.

This robust simulation ensures all rules, order of operations, and edge cases are handled precisely.