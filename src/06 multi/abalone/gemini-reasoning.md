The puzzle "Abalone" requires us to implement an AI player for the hexagonal board game. The goal is to push six of the opponent's marbles off the board. The game involves moving 1 to 3 of your own marbles in a straight line, either by shifting them into empty spaces (side-step or in-line) or by pushing opponent marbles (Sumito).

### 1. Understanding the Board and Coordinates

The game board is hexagonal and provided as a 9-line grid of characters. The image illustrating the board (`https://i.imgur.com/HbCb9QE.png`) uses A-I for rows and 1-9 for columns. The input `(row, col)` values directly correspond to indices in a jagged 2D array, where `board[row]` is an array of columns for that row.

This is a common "offset coordinate" system for hexagonal grids, specifically "odd-r horizontal" layout. In this system, odd-numbered rows are shifted half a cell to the right compared to even-numbered rows. This affects how movement directions translate to changes in `(row, col)` coordinates.

We define `BOARD_MIN_COLS` and `BOARD_MAX_COLS` arrays to quickly check if a cell `(r, c)` is within the board boundaries for each row.

### 2. Hexagonal Movement Directions

The puzzle defines 6 directions (0-5) as shown in `https://i.imgur.com/Y5W2Yl7.png`. Based on the "odd-r horizontal" coordinate system, we can map these directions to `(dr, dc)` deltas, where `dr` is the change in row and `dc` is the change in column. These deltas depend on whether the current row `r` is even or odd.

*   `DR_ODD_R` and `DC_ODD_R` arrays store these deltas for each direction and row parity.
*   `getNeighbor(r, c, dir)`: Calculates the `(newR, newC)` for a cell moved in `dir`, returning `null` if the new cell is off-board.
*   `getOppositeDirection(dir)`: Simple modulo arithmetic to get the direction 180 degrees opposite (e.g., 0 becomes 3).
*   `getDirection(fromCell, toCell)`: Determines the direction number from `fromCell` to `toCell` if they are direct neighbors.

### 3. AI Strategy

The problem constraints (75ms per turn) suggest that a complex AI like Monte Carlo Tree Search or deep minimax would be too slow. A simple heuristic-based AI is necessary.

The chosen strategy is:
1.  **Prioritize moves that push opponent marbles off the board.** This directly contributes to winning the game.
2.  **If no such move exists, pick the first legal move provided by the game engine.** This is a basic fallback to ensure a move is always made.

The game engine provides a list of `legalActions` for each turn. This simplifies the AI greatly, as we don't need to implement complex move generation and validation logic ourselves. We only need to "simulate" each legal move to determine its impact on the game state (specifically, how many opponent marbles are pushed off).

### 4. `simulateMove` Function

This function takes the current `board`, a `move` to simulate, and the `playerColor`. It returns a new board state (a deep copy) and the count of opponent marbles pushed off.

*   **Determining Marbles in Line:** The `move` input `(r1, c1, r2, c2)` defines the start and end of the group of marbles being moved. If `r1,c1` and `r2,c2` are the same, it's a single marble. Otherwise, it reconstructs the intermediate marbles by stepping from `(r1, c1)` towards `(r2, c2)` using the `lineDir`.
*   **Move Type:** It distinguishes between "in-line" moves (direction of move is parallel to the selected marble line) and "side-step" moves (direction is transverse). A single marble cannot be part of an "in-line" move.
*   **In-line Move Logic (Sumito):**
    *   Identifies the "push target" cell (the cell immediately after the leading marble in the move direction).
    *   If the push target contains opponent marbles, it counts consecutive opponent marbles.
    *   If the player's marble count is strictly greater than the opponent's count (Sumito rule), it proceeds to simulate the push.
    *   Opponent marbles are moved first, starting from the one farthest from the pushing player's marbles, to avoid overwriting. If an opponent marble moves off-board, `pushedCount` is incremented.
    *   Player's marbles are then moved into their new positions. The order depends on the `move.dir` (forward vs. backward) to ensure correct marble placement.
*   **Side-step Move Logic:**
    *   For each marble in the selected group, its target cell is calculated.
    *   Since legal moves are guaranteed valid, these target cells are assured to be empty.
    *   Marbles are simply moved from their old positions to new empty positions.

### 5. Main Game Loop

The `main` function reads the initial player ID. Then, in a continuous loop for each turn:
1.  Reads scores, board state, opponent's last move (which is ignored by this AI), and the list of legal actions.
2.  Iterates through each `legalAction`.
3.  Calls `simulateMove` to find out how many opponent marbles each move would push.
4.  Keeps track of the `bestMove` that results in the maximum `pushedCount`.
5.  If multiple moves push the same maximum number of marbles, the first one encountered is chosen.
6.  If no moves push any marbles, the first legal action from the list is chosen as a default.
7.  Prints the chosen move in the specified format `R1 C1 R2 C2 DIR`.

This simple greedy strategy aims for immediate advantage by pushing opponent marbles, which is the primary win condition.