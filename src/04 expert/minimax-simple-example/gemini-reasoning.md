The problem asks us to implement a Minimax algorithm, potentially with Alpha-Beta pruning, to find the optimal first move for Player 1 and the resulting final scores. The game involves taking letters from a pile and forming words from a given dictionary to score points.

Let's break down the rules and design the Minimax solution:

**Game Rules Interpretation:**
1.  **Pile of letters:** Initially, `N` distinct letters are available. These letters maintain their original relative order implicitly (e.g., `A S R E` means A is first, S is second, R is third, E is fourth based on their initial positions).
2.  **Taking letters:** In each turn, a player can choose to take "the first or the second letter of the pile." This is crucial. Given the example `A S R E`, if the first letter `A` (original index 0) is taken, the pile becomes `S R E`. If the second letter `S` (original index 1) is taken, the pile becomes `A R E`. This means letters are chosen based on their current "rank" in the remaining sequence, and taking a letter effectively removes it from the pool. This implies that the game state cannot simply be `(startIndex, endIndex)` for a contiguous subarray, but rather requires tracking *which* letters from the original set are still available.
3.  **Last turn:** When only one letter remains, the current player *must* take it.
4.  **Scoring:** After all `N` letters are collected, each player calculates their score. For every word in the dictionary, if a player has *all* the letters required for that word, they gain the word's score. Letters can be reused for multiple words (e.g., having 'A', 'S', 'E' allows forming 'SA' and 'SE' if both are in the dictionary).
5.  **Player 1's Goal:** Maximize `(Player 1's score - Player 2's score)`. Player 2 will try to minimize this difference.

**Minimax State and Memoization:**

*   **Letters:** Since letters are distinct and their relative order matters for determining "first" and "second," we map each initial letter to a unique integer index from `0` to `N-1`. This allows using bitmasks to represent sets of letters.
    *   `charToOriginalIndex`: `Map<string, number>`
    *   `originalIndexToChar`: `string[]`
*   **Game State:** A state in the Minimax tree must capture enough information to:
    1.  Determine whose turn it is.
    2.  Identify the available choices ("first" and "second" letters).
    3.  Calculate scores at the terminal state.
    This implies the state needs:
    *   `remainingLettersMask`: A bitmask representing which letters (by their original index) are still in the pile.
    *   `player1CollectedMask`: A bitmask representing which letters Player 1 has collected.
    *   `player2CollectedMask`: A bitmask representing which letters Player 2 has collected.
    The total number of letters taken so far (`N - countSetBits(remainingLettersMask)`) determines whose turn it is (even `->` P1, odd `->` P2).
*   **Memoization Key:** Combining these three masks into a single `BigInt` provides a unique key for each state. `(remainingLettersMask << (2 * N)) | (player1CollectedMask << N) | player2CollectedMask`. Since `N` can be up to 26, this key can be up to `26*3 = 78` bits, requiring `BigInt` in JavaScript.
*   **Memoization Value:** `[player1_final_score, player2_final_score]`. This is the pair of scores achievable from this state assuming optimal play by both players.

**Minimax Algorithm (`minimax(remainingLettersMask, player1CollectedMask, player2CollectedMask, alpha, beta)`):**

1.  **Determine Current Player:** Count the number of letters remaining (`lettersRemaining = countSetBits(remainingLettersMask)`). The number of letters taken is `N - lettersRemaining`. If this count is even, it's Player 1's turn (Maximizer). If odd, it's Player 2's turn (Minimizer).
2.  **Memoization Check:** If the current state (represented by the `BigInt` key) is already in the `memo` map, return the stored result.
3.  **Base Case:** If `lettersRemaining === 0` (all letters taken), the game ends. Calculate `player1Score = calculatePlayerScore(player1CollectedMask)` and `player2Score = calculatePlayerScore(player2CollectedMask)`. Store and return `[player1Score, player2Score]`.
4.  **Determine Choices:** Use `getAvailableChoices(remainingLettersMask)` to find the original indices (`index1`, `index2`) of the "first" and "second" letters currently in the pile.
5.  **Recursive Calls and Evaluation:**
    *   Initialize `bestP1Score`, `bestP2Score`, and `bestDiff` (`-Infinity` for Player 1, `+Infinity` for Player 2).
    *   **Option 1 (Take first letter):**
        *   Calculate `newRemainingMask1`, `newP1CollectedMask1`, `newP2CollectedMask1`.
        *   Recursively call `minimax(newRemainingMask1, newP1CollectedMask1, newP2CollectedMask1, alpha, beta)`.
        *   Let the result be `[s1_opt1, s2_opt1]`. Calculate `diff1 = s1_opt1 - s2_opt1`.
        *   If it's Player 1's turn: If `diff1` is greater than `bestDiff`, update `bestDiff`, `bestP1Score`, `bestP2Score`. Update `alpha = max(alpha, diff1)`. If `beta <= alpha`, prune this branch and return.
        *   If it's Player 2's turn: If `diff1` is less than `bestDiff`, update `bestDiff`, `bestP1Score`, `bestP2Score`. Update `beta = min(beta, diff1)`. If `beta <= alpha`, prune this branch and return.
    *   **Option 2 (Take second letter):** This option is only available if `lettersRemaining > 1`.
        *   Similar logic as Option 1, calculate new masks, make recursive call, evaluate `diff2`, and perform alpha-beta pruning.
6.  **Store and Return:** Store the `[bestP1Score, bestP2Score]` in `memo` for the current state and return it.

**`getAvailableChoices(remainingLettersMask)`:**
Iterates from `i = 0` to `N-1`. If `(remainingLettersMask >> i) & 1` is true (letter `i` is in the pile):
*   If this is the first such letter encountered, it's `char1`/`index1`.
*   If this is the second such letter, it's `char2`/`index2`.
It stops after finding two letters.

**`calculatePlayerScore(collectedLettersMask)`:**
Iterates through all `(word, wordScore)` pairs in the dictionary. For each `word`, it generates a `requiredWordMask` (precomputed). If `(collectedLettersMask & requiredWordMask) === requiredWordMask`, it means all letters for `word` are present in `collectedLettersMask`, so `wordScore` is added to the total.

**Main Program Logic:**

1.  Read `N`, `Q`, initial letters, and dictionary words/scores.
2.  Pre-process `charToOriginalIndex`, `originalIndexToChar`, `wordLetterMasks`.
3.  Initialize `bestOverallChar`, `bestOverallScores`, `bestOverallDiff`.
4.  For Player 1's first turn:
    *   Call `getAvailableChoices` on the initial `(1 << N) - 1` mask to find the initial "first" and "second" letters.
    *   For each of these two choices:
        *   Simulate Player 1 taking that letter, updating `remainingLettersMask` and `player1CollectedMask`.
        *   Call `minimax` with the new state (and initial `alpha = -Infinity`, `beta = +Infinity`).
        *   Get `[p1Score, p2Score]` from `minimax` and calculate `currentDiff = p1Score - p2Score`.
        *   If `currentDiff` is better than `bestOverallDiff`, update `bestOverallDiff`, `bestOverallChar`, and `bestOverallScores`.
5.  Print the `bestOverallChar` and `bestOverallScores` in the required format.

**Complexity:**
*   **State Space:** The number of states is roughly `2^N * 2^N` (for `remainingLettersMask` and `player1CollectedMask`, as `player2CollectedMask` is derived). For `N=26`, this is `2^52`, which is extremely large.
*   **Alpha-Beta Pruning:** While Alpha-Beta prunes branches, it does not reduce the theoretical state space that *could* be visited. However, in practice, for many game trees, it significantly reduces the number of *actual nodes visited*. Given `N=26` and the problem type as "simple minimax," the implicit expectation is that Alpha-Beta pruning is effective enough for the test cases, or that `N` is smaller in the stricter test cases. The `BigInt` for map keys is essential for performance.