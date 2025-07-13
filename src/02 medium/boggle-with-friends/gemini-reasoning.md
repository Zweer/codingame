The puzzle requires us to simulate a game of Boggle with multiple players (Friends) and determine the winner based on a specific scoring system. Key challenges include:
1.  **Board Validity:** Checking if a word can be formed on the 4x4 Boggle board using adjacent (including diagonal) letters, with each letter used only once per word. This is typically solved using Depth-First Search (DFS) or backtracking.
2.  **Word Filtering:**
    *   Words shorter than 3 letters are invalid (though input guarantees 3+).
    *   Words not valid on the board are discarded.
    *   If a player writes a word multiple times, only one instance counts for their score.
    *   If multiple players write the *same* word (and it's valid on the board), that word does *not* count for *anyone*. These are "common words".
3.  **Scoring:** Assigning points based on word length.
4.  **Output Formatting:** Presenting the winner, individual scores, and each player's scoring words with their values, maintaining the original input order for players and their words.

### Plan and Data Structures

1.  **Board Representation:** A 2D array of strings (`string[][]`).
2.  **Player Data:** An array of `Player` objects, where each `Player` object stores:
    *   `name: string`
    *   `rawWords: string[]`: The words as they appeared in the input, preserving order.
    *   `scoringWords: { word: string, score: number }[]`: The words that actually contributed to the player's score, in their original input order.
    *   `totalScore: number`: The calculated total score for the player.
3.  **Word Validation (Board):**
    *   A `isValidWordOnBoard(word: string, board: Board)` function will use a DFS algorithm.
    *   It will iterate through each cell on the board as a potential starting point.
    *   The DFS function will explore 8 adjacent (horizontal, vertical, diagonal) cells.
    *   A `visited` 2D boolean array will track cells used in the current path to ensure a letter is used only once per word. This `visited` array must be reset for each new starting position for a word.
4.  **Word Processing Logic:**
    *   **Phase 1: Determine all board-valid words and who submitted them.**
        *   We use a `Map<string, Set<string>>` called `wordToSubmittingPlayers`. The key is a word, and the value is a `Set` of player names who submitted that word (and it was valid on the board).
        *   When processing a player's words for this map, we first put their `rawWords` into a `Set` (`playerSubmittedUniqueWords`) to ignore their *own* duplicates at this stage.
        *   For each unique word, if `isValidWordOnBoard` returns true, add the word to the map with the player's name.
    *   **Phase 2: Identify "common" words.**
        *   Iterate through `wordToSubmittingPlayers`. If a word's `Set<string>` of submitting players has `size > 1`, that word is "common" and should be added to a `Set<string>` called `commonWords`.
    *   **Phase 3: Calculate scores and populate scoring words for each player.**
        *   Iterate through each `player` in the `players` array.
        *   For each player, initialize `totalScore = 0` and `scoringWords = []`.
        *   To handle a player's own repeated words and maintain output order, iterate through the player's original `rawWords` array.
        *   Maintain a `Set<string>` called `playerWordsAlreadyProcessedForScoring` for the *current player*. If a word has already been processed for this player's scoring, skip it.
        *   For each `word` in `rawWords`:
            *   Check if `isValidWordOnBoard(word, boggleBoard)` is true AND `commonWords.has(word)` is false.
            *   If both are true, calculate the score using `calculateWordScore` and add the word and its score to `player.scoringWords`, and add the score to `player.totalScore`.
5.  **Output Generation:** Print results strictly following the specified format, finding the winner by comparing `totalScore`.