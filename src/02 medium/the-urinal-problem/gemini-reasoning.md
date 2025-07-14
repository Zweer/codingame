The problem asks us to find the most "isolated" unoccupied urinal in a line. Isolation is defined as being furthest away from any occupied urinal. If there's a tie in isolation distance, we should choose the leftmost urinal.

**Reasoning:**

1.  **Iterate through Urinals:** We need to examine each urinal to determine if it's a suitable candidate. We are only interested in unoccupied urinals ('U').
2.  **Calculate Isolation Score for 'U' Urinals:** For each unoccupied urinal at a given index `i`, we need to calculate its "isolation score". This score is the minimum of two distances:
    *   The distance to the nearest occupied urinal to its left.
    *   The distance to the nearest occupied urinal to its right.
    *   If there are no occupied urinals on one side, we can consider that distance to be effectively "infinite" (or at least greater than any possible real distance, like `N` itself, since `N` is the total number of urinals).
3.  **Find Nearest Occupied Urinal:**
    *   **To the left:** Starting from `i-1` and moving downwards to `0`, the first `!` encountered gives us the distance `i - j`.
    *   **To the right:** Starting from `i+1` and moving upwards to `N-1`, the first `!` encountered gives us the distance `j - i`.
4.  **Keep Track of Best Urinal:** We maintain two variables:
    *   `maxIsolationScore`: Stores the highest isolation score found so far.
    *   `bestUrinalIndex`: Stores the index of the urinal corresponding to `maxIsolationScore`.
5.  **Tie-breaking Rule:** The problem states that if two unoccupied urinals are equally isolated, we should choose the leftmost one. Our iteration strategy naturally handles this:
    *   We iterate through the urinals from left to right (index `0` to `N-1`).
    *   If a new urinal has a `currentIsolationScore` strictly *greater than* `maxIsolationScore`, we update both `maxIsolationScore` and `bestUrinalIndex`.
    *   If a new urinal has a `currentIsolationScore` equal to `maxIsolationScore`, we *do not* update `bestUrinalIndex`. This ensures that `bestUrinalIndex` always retains the index of the leftmost urinal among those with the maximum isolation score found so far.

**Example Walkthrough (`N=3, B="UU!"`):**

*   Initialize `maxIsolationScore = -1`, `bestUrinalIndex = -1`.

*   **`i = 0` (Urinal `B[0]` is 'U'):**
    *   Nearest '!' to left: None. `leftDistance = 3` (our "infinity").
    *   Nearest '!' to right: `B[2]` is '!'. Distance `2 - 0 = 2`. `rightDistance = 2`.
    *   `currentIsolationScore = min(3, 2) = 2`.
    *   `2 > -1`. Update: `maxIsolationScore = 2`, `bestUrinalIndex = 0`.

*   **`i = 1` (Urinal `B[1]` is 'U'):**
    *   Nearest '!' to left: None (`B[0]` is 'U'). `leftDistance = 3`.
    *   Nearest '!' to right: `B[2]` is '!'. Distance `2 - 1 = 1`. `rightDistance = 1`.
    *   `currentIsolationScore = min(3, 1) = 1`.
    *   `1` is not `> 2`. No update.

*   **`i = 2` (Urinal `B[2]` is '!'):** Skip.

*   End of loop. The final `bestUrinalIndex` is `0`.

This approach ensures correctness and efficiently handles the given constraints (N <= 100), as the nested loops result in an O(N^2) time complexity, which is perfectly acceptable for N=100.

---