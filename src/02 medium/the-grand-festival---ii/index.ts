let maxPrevPrizeForRest = -Infinity;
    let bestPrevPathForRest: number[] = [];
    for (let kPrev = 0; kPrev <= R; kPrev++) {
        if (dp[i - 1][kPrev].prize > maxPrevPrizeForRest) {
            maxPrevPrizeForRest = dp[i - 1][kPrev].prize;
            bestPrevPathForRest = dp[i - 1][kPrev].path;
        }
    }
    dp[i][0] = { prize: maxPrevPrizeForRest, path: [...bestPrevPathForRest] };
    ```

2.  **Calculate `dp[i][j]` for `j=1..R` (Week `i+1` is played):**
    *   **If `j = 1`**: Week `i+1` is played as the first of a new streak. This means they must have rested on the previous week (`i`). So, we transition from `dp[i-1][0]`.
        ```typescript
        if (dp[i - 1][0].prize !== -Infinity) {
            dp[i][1] = {
                prize: dp[i - 1][0].prize + prizes[i],
                path: [...dp[i - 1][0].path, i + 1],
            };
        }
        ```
    *   **If `j > 1`**: Week `i+1` is played as part of a `j`-consecutive streak. This means they must have played `j-1` consecutive tournaments ending at week `i`. So, we transition from `dp[i-1][j-1]`.
        However, there's a crucial constraint: if they played `R` consecutive tournaments ending at week `i` (i.e., `j-1 == R`), then week `i+1` *cannot* be played; it *must* be a rest. Therefore, we can only transition from `dp[i-1][j-1]` if `j-1 < R`.

        ```typescript
        if (j - 1 < R && dp[i - 1][j - 1].prize !== -Infinity) {
            dp[i][j] = {
                prize: dp[i - 1][j - 1].prize + prizes[i],
                path: [...dp[i - 1][j - 1].path, i + 1],
            };
        }
        ```

**Final Result:**
After filling the entire `dp` table up to `N-1`, the maximum prize money will be the maximum value found in `dp[N-1][j]` for any `j` from `0` to `R`. The corresponding path is the solution.