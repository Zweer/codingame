The puzzle "Git Patchwork" is a turn-based board game where players compete to cover their 9x9 quilt board with patches and accumulate more buttons. The game's scoring rewards covered squares (2 points per square saved from penalty) and having more buttons. Players move their time tokens on a timeline, and the player whose token is furthest behind takes the turn. If tokens are at the same position, the player who just played takes another turn.

In this "Wood 4" league, several advanced rules (like Button Income events, Special Patch events, and Patch Earning) are simplified or removed, making the core mechanics revolve around efficient patch placement and resource management (buttons and time).

My strategy focuses on maximizing the immediate "value" of each potential move, considering its impact on the final score.

**Core Logic and Strategy:**

1.  **Parsing Input:** Read the current game state, including my buttons, time, and board, as well as the available patches. Only the first 3 patches are playable.

2.  **Patch Transformations:** A crucial aspect of Patchwork is the ability to rotate and flip patches.
    *   I parse the `patchShape` string into a 2D boolean array (`boolean[][]`).
    *   I implement `rotatePatch` (90 degrees clockwise) and `flipPatch` (horizontal).
    *   A `normalizePatchShape` function crops each patch's boolean array to its minimal bounding box of occupied cells. This ensures that the top-leftmost occupied cell is always at `(0,0)`, simplifying placement calculations and making it easy to identify unique orientations.
    *   `getUniqueOrientations` generates all 8 possible orientations (4 rotations, each with and without a flip) for a patch and stores only the unique ones.

3.  **Evaluating `PLAY` Moves:**
    *   For each of the first 3 available patches:
        *   **Affordability Check:** First, check if I have enough buttons to buy the patch (`myButtons >= patch.buttonPrice`). If not, this patch is skipped.
        *   **Iterate Orientations:** For each unique orientation of the patch:
            *   **Iterate Positions:** For every possible (x, y) coordinate on the 9x9 board where the patch's top-left corner could be placed:
                *   **Placement Check:** Use `canPlacePatch` to verify if the patch fits without going out of bounds or overlapping existing patches.
                *   **Score Calculation:** If placement is valid, calculate a `currentMoveScore` using a heuristic. The goal is to maximize `(squares_covered * 2) - buttons_spent - (time_spent * TIME_PENALTY_FACTOR)`.
                    *   `squares_covered * 2`: This directly reflects the points gained by covering squares (each square covered saves 2 points from the endgame penalty).
                    *   `buttons_spent`: This is the `patchButtonPrice`, directly decreasing my button count.
                    *   `time_spent * TIME_PENALTY_FACTOR`: This term penalizes moves that advance my time token too much. Moving time faster can reduce the number of turns I get or give more turns to the opponent. A `TIME_PENALTY_FACTOR` of `0.5` means spending 1 unit of time is roughly equivalent to losing half a button or a quarter of a square's value. This value is a heuristic that can be tuned.

4.  **Evaluating `SKIP` Moves:**
    *   The `SKIP` command moves my time token directly in front of the opponent's. In this league, it doesn't earn buttons or cover squares. Its primary use is as a fallback when no `PLAY` move is beneficial or possible, or to strategically cede a turn to the opponent.
    *   In my implementation, `SKIP` is chosen if no `PLAY` move yields a positive `currentMoveScore`. A positive score means the `PLAY` move brings a net gain in terms of points (considering squares covered vs. button/time cost). If the best `PLAY` move's score is 0 or negative, it implies it's either neutral or detrimental, making `SKIP` (which has an implicit 0 benefit/cost) a better choice.

5.  **Selecting the Best Move:**
    *   Initialize `bestScore` to negative infinity and `bestMove` to "SKIP".
    *   During the iteration through `PLAY` moves, if a `currentMoveScore` is higher than `bestScore`, update `bestScore` and `bestMove`.
    *   After checking all `PLAY` possibilities, if `bestScore` is still `0` or less, it means no sufficiently beneficial `PLAY` move was found, so "SKIP" remains the chosen `bestMove`. Otherwise, the `PLAY` command with the highest score is chosen.

This greedy approach, maximizing immediate gain based on a simple heuristic, is often effective in lower leagues of CodinGame puzzles where complex multi-turn lookaheads are not feasible within the time limits.