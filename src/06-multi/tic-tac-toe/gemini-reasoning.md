The puzzle describes the "Ultimate Tic-Tac-Toe" but explicitly states that for the "Wood 4 League", it's a standard 3x3 Tic-Tac-Toe game. The goal is to get three of your marks in a row (horizontally, vertically, or diagonally).

## Reasoning

The strategy for a basic Tic-Tac-Toe bot can be implemented with a simple prioritized decision-making process:

1.  **Win Condition:** Always check if there's a move that allows me to win immediately. If so, take it.
2.  **Block Condition:** If I cannot win, check if the opponent has a move that would make them win immediately. If so, block it.
3.  **Strategic Play:** If neither of the above conditions is met (no immediate win or block), make a strategic move based on common Tic-Tac-Toe wisdom:
    *   Prioritize the **center** square (1,1). It offers the most potential winning lines.
    *   If the center is taken, prioritize **corner** squares ((0,0), (0,2), (2,0), (2,2)). They are also good for setting up multiple threats.
    *   If corners are also taken, prioritize **edge** squares ((0,1), (1,0), (1,2), (2,1)).
4.  **Fallback:** As a last resort (though with the strategic moves, this should rarely be hit if there are valid moves), simply pick the first available valid action.

**Board Representation:**
The game board will be represented as a 3x3 2D array.
*   `0` will denote an empty cell.
*   `1` will denote my mark.
*   `2` will denote the opponent's mark.

The board state needs to persist across turns, so it's declared globally. Each turn, I update the board with the opponent's last move and then decide my next move based on the updated state and the list of `validActions` provided by the game.

**Input/Output:**
*   Input is read using `readline()`, parsed into numbers, and split by spaces as needed.
*   Output is printed using `console.log()` in the format `row col`.

**Performance:**
Since the board is a fixed 3x3 size, all operations (checking win conditions, iterating through possible moves) are constant time and very fast. This will easily meet the 100ms turn time limit.

## Code