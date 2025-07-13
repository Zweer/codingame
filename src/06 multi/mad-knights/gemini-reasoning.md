The "Mad Knights" puzzle is a variant of the Isolation game played on an 8x8 chessboard with three players (Red, Green, Blue), each controlling a single knight. The goal is to be the last player to move. When a knight moves, its previous square becomes permanently blocked. A player loses if they cannot make a valid move on their turn.

This problem is a classic example of a game that can be solved using search algorithms. Since it's a finite game with perfect information, Minimax (or Negamax) with Alpha-Beta pruning is a suitable choice.

### Game State Representation

To implement the AI, we need a way to represent the game state:

*   **Board:** An 8x8 2D array (`CellState[][]`) to store the state of each square (`.` for open, `#` for blocked, `r`/`g`/`b` for knight positions).
*   **Players:** An array of `PlayerInfo` objects. Each `PlayerInfo` stores the player's `color`, `status` (alive/lost), and their current `position` on the board. To ensure consistent indexing during simulations, players are stored in a fixed order (e.g., Red, Green, Blue).
*   **Current Player:** An index indicating whose turn it is.
*   **Number of Alive Players:** A counter to quickly check for game termination.

The `GameState` class includes methods for:
*   `clone()`: Creates a deep copy of the current game state for simulation.
*   `isValidCoord(row, col)`: Checks if coordinates are within board bounds.
*   `getLegalMoves(playerIndex)`: Returns all valid knight moves for a given player, considering blocked squares.
*   `applyMove(playerIndex, newPos)`: Updates the board and player positions after a move, and advances the turn to the next living player.
*   `isGameOver()`: Checks if only one player remains alive.
*   `getWinner()`: Returns the color of the winning player if the game is over.

### Search Algorithm (Minimax with Alpha-Beta Pruning)

The core of the AI is the `solve` function, which implements Minimax with Alpha-Beta pruning. Since this is a 3-player game, a standard 2-player Minimax needs adaptation. Our approach is:

1.  **Evaluation Function (`evaluate(gameState, myBotColor)`):** This function determines the "goodness" of a game state from *our bot's perspective* (`myBotColor`).
    *   If the game is over: It returns `Infinity` if `myBotColor` won, and `-Infinity` if `myBotColor` lost or if the game ended without a clear winner (e.g., all players got stuck).
    *   Otherwise: It calculates a heuristic score based on the number of available moves. A simple yet effective heuristic for isolation games is `(my_liberties * 10) - (sum_of_opponents_liberties)`. This encourages our knight to have more mobility while restricting opponents.

2.  **Minimax Logic (`solve(gameState, depth, alpha, beta, myBotColor)`):**
    *   `depth`: The remaining search depth. The search stops at `depth == 0` or if the game ends.
    *   `alpha`, `beta`: Used for Alpha-Beta pruning to cut off branches that won't lead to a better solution.
    *   `myBotColor`: The color of our bot, whose perspective the `evaluate` function always takes.
    *   **Handling Lost Players:** If the current player in the simulation is already marked as lost, their turn is skipped, and the game proceeds to the next active player.
    *   **No Legal Moves:** If the current player has no legal moves, they are marked as lost. If this player is `myBotColor`, it's an immediate `-Infinity` score. If it's an opponent, it's good for `myBotColor`, and the game continues to the next active player, evaluated from our perspective.
    *   **Maximizing vs. Minimizing:**
        *   If it's `myBotColor`'s turn (`currentPlayer.color === myBotColor`): The function tries to find the move that maximizes the `evaluate` score (from our perspective).
        *   If it's an `opponent`'s turn (`currentPlayer.color !== myBotColor`): The opponent will choose the move that *maximizes their own score*. Since their goal is to win, this often means picking the move that is *worst for us*. Therefore, we assume the opponent will make the move that *minimizes* `myBotColor`'s score.

### Input/Output Parsing

The code parses the game state from the standard input:
*   Initial input: `myColor`
*   Per turn: Player statuses and last moves, followed by the 8x8 board, then `moveCount` and a list of `move` strings.
Crucially, the board represents the *current* state, so player positions are extracted from the board itself. The input `moveCount` and `move` list are always for *our* player for the current turn, which simplifies knowing whose turn it is initially for the `GameState`.

### Constraints and Performance

*   Initial turn: 1000 ms; Subsequent turns: 100 ms.
*   A search depth of 3-4 is generally feasible within 100ms for a board of this size and branching factor (max 8 moves per knight). A depth of 4 means exploring up to `8^4 = 4096` nodes in the worst case, but Alpha-Beta pruning significantly reduces this.

The chosen `maxDepth = 4` is a balance between performance and finding good moves. For simple Isolation variants, this is often sufficient to win against basic heuristics or random play.