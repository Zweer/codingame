The puzzle asks us to implement a Chess bot that plays two games against an opponent, one as White and one as Black, using Chess960 rules. The objective is to score more points than the opponent across both games (1 point for a win, 0.5 for a draw).

The most crucial information for a basic bot is that the game engine provides a list of *all legal moves* for the current position in each turn. This significantly simplifies the problem, as we don't need to implement a full chess engine with move generation, validation, and board state management.

**Strategy for a Basic Bot:**

1.  **Initialization Phase:**
    *   Read the initial game constants provided by the referee (e.g., `maxMoves`). For a simple bot, these might not be directly used but are part of the input protocol.
    *   Configure the inputs we want to receive for subsequent turns. The puzzle recommends `fen` (Forsyth-Edwards Notation) and `moves` (list of legal moves). We also request `draw` (opponent's draw offer), `game` (current game number), and `score` (current match score) for potential future enhancements or debugging.

2.  **Game Loop Phase:**
    *   In each turn, read the configured inputs:
        *   The FEN string representing the current board state.
        *   The number of legal moves, followed by each legal move in UCI format (e.g., `e2e4`, `h7h8q` for promotion, `e1h1` for Chess960 castling).
        *   Whether the opponent offered a draw.
        *   The current game number (1 or 2).
        *   Our score and the opponent's score for the match.
    *   **Decision Making:**
        *   The simplest and safest strategy is to pick a random move from the list of legal moves provided by the referee. This guarantees we always make a legal move and avoids timeouts due to complex calculations.
        *   If the list of legal moves is empty (`movesCount` is 0), it implies the game has reached a terminal state (checkmate or stalemate). In such a scenario, the bot must still provide an output. Since a chess move is not possible, and a draw acceptance requires an offer, the most robust fallback is to `resign` the current game. However, typically the game platform will conclude the game and terminate the bot process soon after.
        *   For this basic bot, we will ignore draw offers and continue playing.
    *   **Output:** Print the chosen move (or `resign` if no moves are available) to the standard output.

**Code Structure:**

The TypeScript code will be structured into a `main` function (or similar) that encapsulates the logic. It will first handle the initial setup and then enter an infinite loop for game turns. `readline()` is used to read input, and `console.log()` is used to send output to the game referee. `console.error()` is used for debugging messages, which are visible in the CodinGame interface.