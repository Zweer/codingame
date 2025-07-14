The "Wondev Woman" puzzle requires your unit to reach a height of 3 levels before your opponent. In the Wood league, you control a single unit and have to perform a `MOVE&BUILD` action each turn. The game provides a list of all legal actions, which simplifies the problem as we don't need to generate possible moves, only evaluate and select the best one.

**Strategy:**

The core strategy is to implement a scoring mechanism for each available `MOVE&BUILD` action and choose the action with the highest score. The scoring prioritizes actions that lead to an immediate win or set up a win for the next turn.

1.  **Parse Input:** Read the grid, your unit's position, the opponent's unit's position, and the list of legal actions for the current turn.

2.  **Define Directions:** Create a mapping for direction strings (N, NE, E, etc.) to their corresponding `dx`, `dy` (change in row/column) values.

3.  **Action Class:** Represent each legal action with a class that stores its type, unit index, move direction, build direction, and pre-calculated `dx`, `dy` values for convenience.

4.  **Scoring Function (`calculateActionScore`):**
    *   **Immediate Win (Highest Priority):** If an action leads your unit to move onto a cell with height 3, this is an immediate win. This action receives an `Infinity` score and is chosen instantly.
    *   **Set Up Win for Next Turn:** If an action builds a cell to height 3 (meaning it was height 2 before), this creates a potential winning spot for your unit in the next turn. This is given a very high score (e.g., 200).
    *   **Deny Opponent:** If an action builds a cell that is currently height 3 to height 4 (removing it from play), and this cell is adjacent to the opponent, it effectively denies them a potential winning spot. This is also given a high score (e.g., 150).
    *   **Increase My Unit's Height:** Climbing to a higher level is generally good. Award points based on the difference in height climbed (e.g., 10 points per level up).
    *   **General Higher Ground Preference:** A small bonus for simply being on a higher cell.
    *   **General Building Progress:** Award points for building cells to height 1 or 2, as these contribute to future higher levels.
    *   **Minor Penalty for Blocking Myself:** A small penalty if building a height 3 cell to height 4 when it's not blocking the opponent, as this removes a potentially useful cell from the game.

5.  **Select Best Action:** Iterate through all legal actions, calculate the score for each using the `calculateActionScore` function, and keep track of the action with the maximum score.

6.  **Output Action:** Print the chosen action in the required format.

**Detailed Scoring Logic (Priorities):**

1.  **Immediate Victory:** If `newMyHeight === 3`, return `Infinity`.
2.  **Building a Win Spot:** If `currentBuildHeight === 2` and `simulatedBuildHeight === 3`, `score += 200`.
3.  **Blocking Opponent:** If `currentBuildHeight === 3`, `simulatedBuildHeight === 4`, and `buildCell` is adjacent to `oppUnit`, `score += 150`.
4.  **Climbing Up:** `score += (newMyHeight - currentMyHeight) * 10`.
5.  **General Height Advantage:** `score += newMyHeight * 5`.
6.  **Building to Level 2:** If `currentBuildHeight === 1` and `simulatedBuildHeight === 2`, `score += 50`.
7.  **Building to Level 1:** If `currentBuildHeight === 0` and `simulatedBuildHeight === 1`, `score += 25`.
8.  **Minor Self-Block Penalty:** If `currentBuildHeight === 3`, `simulatedBuildHeight === 4`, and `buildCell` is *not* adjacent to `oppUnit`, `score -= 10`.

This greedy approach prioritizes immediate wins, then setting up future wins, then hindering the opponent, and finally making general progress on the board. This should be sufficient for the Wood league.