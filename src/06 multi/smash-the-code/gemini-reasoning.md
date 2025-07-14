The puzzle "Smash The Code" in the Wood 1 league is a simplified version of a Puyo Puyo-like game. The goal is to clear blocks by forming groups of 4 or more of the same color, which in turn generates nuisance to be sent to the opponent. In this league, blocks always come in pairs of the *same* color.

My strategy focuses on a greedy approach:
1.  **Simulate all possible moves:** For the current pair of blocks (which are always the same color in this league), try dropping them into each of the 6 columns.
2.  **Simulate game mechanics:** For each simulated drop:
    *   Place the two blocks in the chosen column, respecting gravity.
    *   If the placement is invalid (e.g., column is full, or blocks would go above the grid), discard this move.
    *   Simulate the clearing process:
        *   Identify groups of 4 or more adjacent (horizontally or vertically) colored blocks.
        *   Clear these blocks.
        *   Clear any Skull blocks (labeled '0') that are adjacent to the just-cleared colored blocks.
        *   Apply gravity: Blocks above cleared spaces fall down.
        *   Repeat the clearing process (chain reaction) until no more blocks can be cleared.
    *   Count the total number of blocks cleared during this entire chain.
3.  **Evaluate the board state:** After the simulation, score the resulting board using a heuristic:
    *   **Prioritize cleared blocks:** The primary goal is to clear blocks, so a high multiplier is applied to the number of blocks cleared. This directly contributes to nuisance points.
    *   **Penalize board height:** A lower board is generally better as it provides more space and reduces the risk of losing. Two metrics are used:
        *   A moderate penalty for the sum of "heights" of all blocks (where a block at the bottom row has a "height" of 1 and a block at the top has a "height" of 12).
        *   A severe penalty if the highest block on the board is too close to the top, indicating an imminent loss.
4.  **Choose the best move:** Select the column that yields the highest evaluation score.

**Detailed Implementation Notes:**

*   **Grid Representation:** The grid is stored as a `number[][]` (2D array of numbers). `.` (empty) is mapped to `0`, `0` (skull) is mapped to `9` (to distinguish from `0` empty), and colored blocks `1-5` are stored as their respective numbers.
*   **Dropping Blocks:** The `simulateDrop` function determines the lowest empty spots in a given column and places the two blocks. It handles cases where a column is full or where the top block would fall out of bounds.
*   **Clearing and Gravity:** The `processClearsAndGravity` function is the core of the simulation.
    *   It uses a `while` loop to manage chain reactions.
    *   Inside the loop, it iterates through the grid to find connected groups of colored blocks (using a BFS/DFS-like approach with a `visited` array to prevent re-processing blocks within the same group).
    *   If a group of 4 or more colored blocks is found, they are marked for clearing.
    *   Separately, it identifies and clears skull blocks that are adjacent to the *just-cleared colored blocks*. Skull blocks cannot form groups themselves.
    *   After clearing, a gravity step is performed for each column, moving blocks downwards to fill empty spaces.
    *   The `while` loop continues as long as blocks are being cleared, ensuring full chain reactions are simulated.
*   **Heuristic (`evaluateBoard`):** The heuristic balances immediate gains (cleared blocks) with long-term board health (keeping blocks low). The weights are chosen to reflect the importance of clearing blocks while also preventing the board from filling up.

This approach provides a solid foundation for the Wood 1 league, prioritizing offensive power (through clears and chains) while maintaining a safe board state.