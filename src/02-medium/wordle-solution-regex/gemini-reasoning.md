The puzzle asks us to construct a regular expression for a 5-letter Wordle word based on a series of guesses and their results. The construction must follow specific rules regarding look-aheads and positional characters.

Here's a breakdown of the approach:

1.  **State Management**: We need to keep track of information gathered from all guesses.
    *   `greenLetters`: An array of 5 characters or `null`s, storing letters confirmed to be in specific positions (`G` results).
    *   `yellowExclusionsPerPosition`: An array of 5 `Set<string>`s, where each set stores letters that were `Y` (yellow) at that specific position and thus cannot be there.
    *   `yellowCharsOverall`: A `Set<string>` of all characters that received a `Y` result at least once across all guesses. These will be used for positive look-aheads.
    *   `greenCharsOverall`: A `Set<string>` of all characters that received a `G` result at least once across all guesses. Used to differentiate truly excluded characters.
    *   `excludedCharsOverall`: A `Set<string>` of all characters that received a `_` (gray) result at least once across all guesses.

2.  **Processing Input**:
    *   Read the number of guesses `n`.
    *   For each of the `n` guess-result pairs:
        *   Iterate through each of the 5 character positions.
        *   Based on the `result` character (`G`, `Y`, or `_`), update the relevant state variables.
            *   `G`: Mark `greenLetters` at that position, add to `greenCharsOverall`.
            *   `Y`: Add to `yellowCharsOverall`, add to `yellowExclusionsPerPosition` for the current position.
            *   `_`: Add to `excludedCharsOverall`.

3.  **Building the Regular Expression**: The RegEx is built in a specific order:
    *   **Anchors**: Start with `^` and end with `$`.
    *   **Positive Look-aheads (`Y` letters)**:
        *   Collect all characters from `yellowCharsOverall`.
        *   Sort them alphabetically.
        *   For each character `c`, append `(?=.*c)` to the RegEx.
        *   Example: `^(?=.*b)(?=.*d)(?=.*l)`
        *   *Self-correction based on example*: The rule "Any letters with a Y result - and no G results" initially suggested only `Y` letters that were never `G` should be included. However, Example 2 output includes `(?=.*g)` even though `g` is `Y` in one guess and `G` in another. This implies all characters that were `Y` at least once should be included here.
    *   **Negative Look-aheads (`_` letters)**:
        *   Collect characters from `excludedCharsOverall`.
        *   Filter this set: only include characters that were *never* `G` or `Y` in any guess. This correctly handles cases like `upper __GGG` where a character is `_` at one spot but `G` elsewhere (it's not truly excluded from the word).
        *   Sort these characters alphabetically.
        *   If there are any such characters, append `(?!.*[...])` where `...` are the sorted characters joined.
        *   Example: `(?!.*[def])`
    *   **Positional Pattern (5 characters)**: Iterate from position 0 to 4.
        *   If `greenLetters[i]` is not `null` (a `G` result): Append the green letter itself.
        *   Otherwise (no `G` result at this position):
            *   Check `yellowExclusionsPerPosition[i]`.
            *   If this set is not empty:
                *   Convert the set to an array and sort alphabetically.
                *   If there's only one character `c`, append `(?!c).`.
                *   If there are multiple characters `c1, c2, c3`, append `(?![c1c2c3]).`. (The example implies single characters don't need `[]` within `(?!...)`)
            *   Else (no `Y` exclusion for this position): Append `.`.

**Example Walkthrough (Example 2):**
Input:
```
2
waged __YG_
boils _G__G
```

After processing all inputs:
*   `greenLetters`: `[null, 'o', null, 'e', 's']`
*   `yellowExclusionsPerPosition`: `[Set(), Set(), {'g'}, Set(), Set()]`
*   `yellowCharsOverall`: `{'g'}`
*   `greenCharsOverall`: `{'o', 'e', 's'}`
*   `excludedCharsOverall`: `{'w', 'a', 'd', 'b', 'i', 'l'}`

RegEx construction:
1.  `^`
2.  **Positive Look-aheads**: `yellowCharsOverall` contains `g`. Sorted: `['g']`. Appends `(?=.*g)`.
    Current RegEx: `^(?=.*g)`
3.  **Negative Look-aheads**: `excludedCharsOverall` contains `w, a, d, b, i, l`. None of these are in `greenCharsOverall` or `yellowCharsOverall`. Sorted: `['a', 'b', 'd', 'i', 'l', 'w']`. Appends `(?!.*[abdilw])`.
    Current RegEx: `^(?=.*g)(?!.*[abdilw])`
4.  **Positional Pattern**:
    *   Pos 0: `greenLetters[0]` is `null`. `yellowExclusionsPerPosition[0]` is empty. Appends `.`.
    *   Pos 1: `greenLetters[1]` is `o`. Appends `o`.
    *   Pos 2: `greenLetters[2]` is `null`. `yellowExclusionsPerPosition[2]` is `{'g'}`. Sorted: `['g']`. Appends `(?!g).`.
    *   Pos 3: `greenLetters[3]` is `e`. Appends `e`.
    *   Pos 4: `greenLetters[4]` is `s`. Appends `s`.
    Current RegEx: `^(?=.*g)(?!.*[abdilw]).o(?!g).es`
5.  `$`
Final RegEx: `^(?=.*g)(?!.*[abdilw]).o(?!g).es$`

This matches the example output precisely.