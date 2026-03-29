The goal of this puzzle is to create an AI for a Connect 4 game played on a 7x9 board (7 rows, 9 columns). The AI needs to choose a column to drop a chip, aiming to connect four of its chips horizontally, vertically, or diagonally. A special "STEAL" move is available for the second player on their first turn.

### Reasoning and Strategy

The AI's strategy is based on a hierarchical decision-making process:

1.  **STEAL Move (Second Player Only):** If the AI is the second player (`myId === '1'`) and it's their first turn (`turnIndex === 1`), and the `STEAL` option (`-2`) is available, the AI will choose to STEAL. This is a common strategy in variations of Connect 4, allowing the second player to take control of the first player's initial chip and effectively reverse the turn order advantage. For a simple bot, assuming STEAL is always beneficial in this specific scenario is a reasonable heuristic.

2.  **Immediate Win:** The AI first checks if any of its possible moves (dropping a chip in an available column) would result in an immediate win (four chips connected). If such a move is found, the AI takes it immediately. This is the highest priority.

3.  **Immediate Block:** If no immediate winning move is available, the AI then checks if the opponent has any move that would lead to their immediate win. If such a move exists, the AI plays in that column to block the opponent. This is the second highest priority, as preventing a loss is crucial.

4.  **Heuristic Evaluation (1-Ply Lookahead with Opponent Response Check):** If neither an immediate win nor an immediate block is available, the AI evaluates all remaining valid column moves based on a simple heuristic score.
    *   **Centrality:** Moves in columns closer to the center of the board are generally preferred. In Connect 4, controlling the center columns provides more opportunities for connecting chips in multiple directions. The score is higher for columns closer to column 4 (the center column).
    *   **Avoiding Suicide Moves (Opponent Forced Win):** Crucially, after simulating each of its own potential moves, the AI simulates *all possible opponent responses* to that move. If any of the opponent's responses would lead to an immediate win for the opponent, the AI marks its original potential move as highly undesirable (giving it a very low score). This prevents the AI from making moves that inadvertently set up the opponent for a forced win.

5.  **Random Selection:** Among the moves that share the highest heuristic score, the AI picks one randomly. This adds a small element of unpredictability to the bot's play, making it slightly harder for an opponent to predict its exact move when multiple equally good options exist.

### Board Representation and Helper Functions:

*   **`PlayerChip` Type:** A custom type `PlayerChip` is used to represent the state of a cell on the board: `'0'` for player 0's chip, `'1'` for player 1's chip, and `'.'` for an empty cell.
*   **`copyBoard(board)`:** Creates a deep copy of the 2D board array. This is essential for simulating moves without altering the actual game state or previous simulated states.
*   **`dropChip(board, col, player)`:** Simulates dropping a `player`'s chip into a given `col` on a `board`. It finds the lowest empty row in that column, places the chip, and returns the `[row, col]` coordinates where it landed. It returns `null` if the column is full or out of bounds.
*   **`checkWin(board, player, r, c)`:** This function checks if the `player` has achieved a 4-in-a-row condition by placing a chip at `(r, c)`. It efficiently checks all four directions (horizontal, vertical, and two diagonals) by iterating up to 3 positions in both directions from the placed chip.

### Code Structure:

The code follows the standard CodinGame input/output pattern:
1.  Read initialization data (`myId`, `oppId`).
2.  Enter an infinite loop for game turns.
3.  Inside the loop:
    *   Read turn-specific data (`turnIndex`, `board`, `numValidActions`, `validActions`, `oppPreviousAction`).
    *   Apply the decision-making logic (STEAL, Win, Block, Heuristic).
    *   Print the chosen move to standard output.

This strategy balances simplicity with effectiveness, aiming to perform well within the given time constraints (100ms per turn).