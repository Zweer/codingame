The puzzle "Square Spiral for Alien Contact" asks us to generate a square spiral filled with characters based on cryptic instructions. The core challenge lies in understanding how the characters are determined by the input pattern (e.g., "F4 G4") and handling the spiral movement logic.

**1. Input Parsing:**
The input is a single line with five space-separated components:
- `sideSize`: An integer representing the dimensions of the square grid (e.g., 9).
- `startCorner`: A string (`topLeft`, `topRight`, `bottomRight`, `bottomLeft`) indicating the starting point of the spiral.
- `direction`: A string (`clockwise`, `counter-clockwise`) indicating the spiral's rotation.
- `pattern1_str`, `pattern2_str`: Two strings (e.g., "F4", "G4") that define the character filling pattern. Each string consists of a single uppercase letter followed by a digit.

**2. Spiral Generation Logic:**
- **Grid Initialization:** Create a `sideSize` x `sideSize` 2D array (or array of arrays) filled with spaces.
- **Starting Position (`r`, `c`):** This depends directly on `startCorner`.
    - `topLeft`: (0, 0)
    - `topRight`: (0, `sideSize` - 1)
    - `bottomRight`: (`sideSize` - 1, `sideSize` - 1)
    - `bottomLeft`: (`sideSize` - 1, 0)
- **Initial Direction (`dr`, `dc`):** This depends on `startCorner` and `direction`. The goal is to start moving along the outermost layer.
    - `topLeft`:
        - `clockwise`: (0, 1) - Right
        - `counter-clockwise`: (1, 0) - Down
    - `topRight`:
        - `clockwise`: (0, -1) - Left
        - `counter-clockwise`: (1, 0) - Down (to fill the column downwards)
    - `bottomRight`:
        - `clockwise`: (0, -1) - Left
        - `counter-clockwise`: (-1, 0) - Up
    - `bottomLeft`:
        - `clockwise`: (0, 1) - Right
        - `counter-clockwise`: (-1, 0) - Up
- **Movement:** The spiral fills cells one by one.
    - A spiral moves in segments. After placing a character, we increment `(r, c)` by `(dr, dc)`.
    - The `currentSegmentLength` defines how many steps to take in the current direction.
    - The first segment length is `sideSize - 1`.
    - After two completed segments (e.g., a horizontal and a vertical one), the `currentSegmentLength` decreases by 1.
    - The `rotate` function handles changing `(dr, dc)` to turn the spiral. For clockwise, a turn is `(dx,dy) -> (dy, -dx)`. For counter-clockwise, it's `(dx,dy) -> (-dy, dx)`.
    - The loop runs `sideSize * sideSize` times to fill every cell. The `if (i < sideSize * sideSize - 1)` ensures we don't try to move past the last cell placed.

**3. Character Pattern Logic:**
This is the most ambiguous part given the example output. Based on typical CodinGame puzzles and the "Letters don't wrap-around" constraint, the most plausible interpretation of "F4 G4" is:
- `pattern1_def = { char: 'F', count: 4 }`
- `pattern2_def = { char: 'G', count: 4 }`
- We maintain two *independent* character codes: `pattern1CurrentCharCode` (starts as 'F') and `pattern2CurrentCharCode` (starts as 'G').
- A `charCountsInCurrentPatternBlock` tracks how many cells have been filled using the *current pattern's character*.
- An `activePatternIdx` alternates between 0 (for `pattern1`) and 1 (for `pattern2`).

For each cell in the spiral path:
1. Place the character. If `activePatternIdx` is 0, use `String.fromCharCode(pattern1CurrentCharCode)`. If 1, use `String.fromCharCode(pattern2CurrentCharCode)`.
2. Increment `charCountsInCurrentPatternBlock`.
3. If `charCountsInCurrentPatternBlock` reaches `currentPatternCount` (e.g., 4):
    a. Reset `charCountsInCurrentPatternBlock` to 0.
    b. If `activePatternIdx` was 0:
        i. Increment `pattern1CurrentCharCode` (e.g., 'F' becomes 'G' for the *next time* pattern1 is active).
        ii. Switch `activePatternIdx` to 1.
    c. If `activePatternIdx` was 1:
        i. Decrement `pattern2CurrentCharCode` (e.g., 'G' becomes 'F' for the *next time* pattern2 is active).
        ii. Switch `activePatternIdx` to 0.
4. **"No more material" constraint:** If `pattern1CurrentCharCode` increments past 'Z' or `pattern2CurrentCharCode` decrements past 'A', set a `noMoreMaterial` flag to `true`. From this point onwards, all subsequent cells are filled with spaces. Characters are clamped to 'A' or 'Z' if they attempt to go out of bounds.

**4. Output:**
- Print the entire `sideSize` x `sideSize` grid if `sideSize <= 31`.
- If `sideSize > 31`, print only the top-left 31x31 section. This is handled by slicing the grid before printing.

The example output provided in the puzzle (e.g., `LLLLMMM F`) seems to follow a much more complex and specific character progression than what could be inferred from the simple "F4 G4" pattern. The implemented logic represents the most reasonable and general interpretation of the "F4 G4" pattern combined with the "no wrap-around" rule, which is a common approach in such coding challenges when examples are ambiguous.