The puzzle "Hidden word" asks us to find a list of words within a given grid of letters. These words can be oriented horizontally, vertically, or diagonally, and can also be reversed. Once a word is found, its letters in the grid are considered "struck". Each word is guaranteed to be found exactly once. Our goal is to collect all letters that remain "unstruck", reading them from left to right and top to bottom, to form a secret word.

**Reasoning:**

1.  **Input Parsing:**
    *   First, we read the number of words (`n`).
    *   Then, we read each of the `n` words into an array.
    *   Next, we read the grid dimensions (`h` for height, `w` for width).
    *   Finally, we read the `h` lines of the grid, storing them in a 2D array of characters for easy access.

2.  **Struck Letter Tracking:**
    *   To keep track of which letters have been struck, we'll use a 2D boolean array, `struck`, of the same dimensions as the `grid`. Initially, all its values will be `false`. When a letter is part of a found word, its corresponding entry in `struck` will be set to `true`.

3.  **Word Search Strategy:**
    *   For each word in our list of words to find:
        *   We need to iterate through every possible starting cell `(r, c)` in the grid.
        *   From each starting cell, we attempt to match the word in all 8 possible directions:
            *   Horizontal: right `(0, 1)`, left `(0, -1)`
            *   Vertical: down `(1, 0)`, up `(-1, 0)`
            *   Diagonal: down-right `(1, 1)`, up-left `(-1, -1)`, down-left `(1, -1)`, up-right `(-1, 1)`
        *   For a given direction `(dr, dc)` and word `W` of length `L`:
            *   We calculate the potential ending coordinates `(endR, endC)` if `W` were to start at `(r, c)` and extend `L-1` steps in direction `(dr, dc)`.
            *   We perform a boundary check: if `(endR, endC)` falls outside the grid, this direction is invalid from `(r, c)`.
            *   If within bounds, we then iterate `k` from `0` to `L-1`, checking if `grid[r + k*dr][c + k*dc]` matches `W[k]`.
            *   If all characters match, the word is found! Since each word is found only once, we immediately mark all its letters in the `struck` array as `true` and then move on to search for the next word in our list. Using a `wordFoundThisIteration` flag ensures we break out of loops as soon as a word is found.

4.  **Collecting Unstruck Letters:**
    *   After iterating through all words and marking all their letters in the `struck` array, we scan the `struck` array from top to bottom, left to right.
    *   If `struck[r][c]` is `false`, it means `grid[r][c]` was not part of any found word. We append this character to our `secretWord` string.

5.  **Output:**
    *   Finally, we print the accumulated `secretWord`.

**Constraints and Performance:**
*   String lengths (words, grid lines) are below 40. This means the grid size (`H x W`) is at most `40x40 = 1600` cells.
*   Let `N` be the number of words, `H` the height, `W` the width, and `L` the maximum word length.
*   The complexity is roughly `N * H * W * 8 * L`.
*   In the worst case: `N` is not given, but likely small (e.g., 100). So `100 * 40 * 40 * 8 * 40 = 51,200,000` operations. This is generally acceptable for a few seconds time limit on CodinGame. The character-by-character comparison (instead of string slicing/concatenation) also helps efficiency.

**Example Walkthrough (from problem description):**

Input:
```
2
BAC
BOB
3 3
BAC
BOB
RED
```

Grid:
```
B A C
B O B
R E D
```

Initially, `struck` is all `false`.

1.  **Find "BAC"**:
    *   Starts at `(0,0)`.
    *   Direction `(0,1)` (Right): `grid[0][0]='B'`, `grid[0][1]='A'`, `grid[0][2]='C'`. Matches "BAC".
    *   Mark `struck[0][0]=true`, `struck[0][1]=true`, `struck[0][2]=true`.
    *   `struck` becomes:
        ```
        T T T
        F F F
        F F F
        ```
    *   "BAC" found, move to next word.

2.  **Find "BOB"**:
    *   Starts at `(1,0)`.
    *   Direction `(0,1)` (Right): `grid[1][0]='B'`, `grid[1][1]='O'`, `grid[1][2]='B'`. Matches "BOB".
    *   Mark `struck[1][0]=true`, `struck[1][1]=true`, `struck[1][2]=true`.
    *   `struck` becomes:
        ```
        T T T
        T T T
        F F F
        ```
    *   "BOB" found, all words processed.

3.  **Collect Unstruck Letters**:
    *   `grid[0][0]` (B), `struck[0][0]` is `T` -> skip
    *   ...
    *   `grid[1][2]` (B), `struck[1][2]` is `T` -> skip
    *   `grid[2][0]` (R), `struck[2][0]` is `F` -> `secretWord = "R"`
    *   `grid[2][1]` (E), `struck[2][1]` is `F` -> `secretWord = "RE"`
    *   `grid[2][2]` (D), `struck[2][2]` is `F` -> `secretWord = "RED"`

Output: `RED`

This matches the example.