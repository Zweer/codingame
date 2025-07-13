The problem asks us to simulate BlitzProg's experience gain and leveling up process. We are given his current `Level`, the `Xp` needed to reach the next level, and `N`, the number of puzzles he gets accepted. Each accepted puzzle grants 300 XP. The XP required to level up is calculated by the formula `CurrentLevel * Sqrt(CurrentLevel) * 10`, rounded down.

Here's the step-by-step logic:

1.  **Initialize Variables:**
    *   `currentLevel`: This will store BlitzProg's current level, starting with the input `Level`.
    *   `xpRemainingForNextLevel`: This stores the XP BlitzProg still needs to reach `currentLevel + 1`. It starts with the input `Xp`.
    *   `totalXpEarned`: This is the total XP BlitzProg gains from `N` puzzles. It's simply `N * 300`.

2.  **Level Up Calculation Function:**
    *   Define a helper function, say `calculateXpToNextLevel(level: number)`, which takes a level number and returns the XP required to go from that `level` to `level + 1`. This function will implement the formula `Math.floor(level * Math.sqrt(level) * 10)`.

3.  **Simulation Loop:**
    *   Use a `while` loop that continues as long as `totalXpEarned` is greater than 0 (meaning there's still XP to be processed).
    *   **Inside the loop:**
        *   **Check for Level Up:** If `totalXpEarned` is greater than or equal to `xpRemainingForNextLevel`, BlitzProg has enough XP to level up.
            *   Subtract `xpRemainingForNextLevel` from `totalXpEarned`.
            *   Increment `currentLevel` by 1.
            *   Calculate the *new* `xpRemainingForNextLevel` using the `calculateXpToNextLevel` function with the *newly incremented* `currentLevel`. This sets the XP requirement for the next level after the current level-up.
        *   **Not Enough XP for Level Up:** If `totalXpEarned` is less than `xpRemainingForNextLevel`, BlitzProg doesn't have enough XP to reach the next level.
            *   Subtract `totalXpEarned` from `xpRemainingForNextLevel` (this consumes all the remaining earned XP).
            *   Set `totalXpEarned` to 0 to exit the loop.

4.  **Output:**
    *   After the loop finishes, `currentLevel` will hold BlitzProg's final level.
    *   `xpRemainingForNextLevel` will hold the XP still needed for BlitzProg to reach the level after the `currentLevel`.
    *   Print `currentLevel` and `xpRemainingForNextLevel` on separate lines.

**Example Trace (from problem description):**
Input: `Level = 10`, `Xp = 300`, `N = 1`

*   Initial: `currentLevel = 10`, `xpRemainingForNextLevel = 300`, `totalXpEarned = 1 * 300 = 300`.
*   **Loop 1:**
    *   `totalXpEarned` (300) >= `xpRemainingForNextLevel` (300)? Yes.
    *   `totalXpEarned = 300 - 300 = 0`.
    *   `currentLevel = 10 + 1 = 11`.
    *   `xpRemainingForNextLevel = calculateXpToNextLevel(11) = Math.floor(11 * Math.sqrt(11) * 10) = Math.floor(11 * 3.3166... * 10) = Math.floor(364.826...) = 364`.
*   **Loop condition:** `totalXpEarned` (0) > 0? No. Loop ends.
*   **Output:**
    *   `11`
    *   `364`

This matches the example output and confirms the logic. The constraints on `Level`, `Xp`, and `N` are small enough that this simulation will run very quickly.