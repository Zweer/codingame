The problem asks us to calculate a "weight" for each tag type (lowercase English letter) based on its occurrences and their nesting depths within a simplified XML-like string. We then need to output the tag type with the greatest weight. In case of a tie in weights, the alphabetically smallest tag type should be chosen.

**Understanding the Data Format and Rules:**

1.  **Tags:** Tags are single lowercase English letters (e.g., `a`, `b`).
2.  **Start Tag:** Represented by the letter itself (e.g., `a`).
3.  **Closing Tag:** Represented by a hyphen followed by the letter (e.g., `-a`).
4.  **Properly Formed:** The input string is guaranteed to be well-formed, meaning we don't need to validate nesting or handle errors.
5.  **Depth:** The depth of a tag is `1 + the number of tags in which it is nested`. This means an outermost tag has a depth of 1. When an opening tag appears, its depth is `(current nesting level) + 1`. If we track `currentDepth` as the number of currently open tags, then for a new opening tag, its depth will be `currentDepth + 1` (and `currentDepth` increases by 1 for subsequent tags).
6.  **Weight:** The weight of a tag name is the sum of the reciprocals of the depths of each of its occurrences. For example, if tag `a` appears at depths 1, 2, and 3, its weight is `(1/1) + (1/2) + (1/3)`.

**Example Analysis (Key to Understanding Tokenization):**

The problem provides a critical example: `ab-bcd-d-c-ae-e` is equivalent to `<a> <b> </b> <c> <d> </d> </c></a> <e> </e>`. This illustrates how the input string is parsed:
*   A single letter (e.g., `a`, `b`) denotes an opening tag.
*   A hyphen followed by a letter (e.g., `-b`, `-c`) denotes a closing tag.
This implies we process the string sequentially, consuming one or two characters per tag token.

Let's re-verify the problematic example `a-abab-b-a-b` with this tokenization rule:
*   `a` (open 'a')
*   `-a` (close 'a')
*   `b` (open 'b')
*   `a` (open 'a')
*   `b` (open 'b')
*   `-b` (close 'b')
*   `-a` (close 'a')
*   `-b` (close 'b')

With this correct tokenization, the weights perfectly match the example's result:
1.  **a**: Current Depth = 0 -> 1. Weight('a') += 1/1 = 1.0
2.  **-a**: Current Depth = 1 -> 0.
3.  **b**: Current Depth = 0 -> 1. Weight('b') += 1/1 = 1.0
4.  **a**: Current Depth = 1 -> 2. Weight('a') += 1/2 = 1.0 + 0.5 = 1.5
5.  **b**: Current Depth = 2 -> 3. Weight('b') += 1/3 = 1.0 + 0.333... = 1.333...
6.  **-b**: Current Depth = 3 -> 2.
7.  **-a**: Current Depth = 2 -> 1.
8.  **-b**: Current Depth = 1 -> 0.

Final Weights: Weight('a') = 1.5, Weight('b') = 1.333... This matches the example, confirming the parsing and depth calculation logic.

**Algorithm:**

1.  **Initialization:**
    *   Create a `Map` (or an object) to store `tagWeights` for each letter from 'a' to 'z', initialized to `0.0`.
    *   Initialize `currentDepth = 0`.
    *   Initialize an index `i = 0` to traverse the input `sequence`.

2.  **Parsing and Calculation Loop:**
    *   Iterate while `i < sequence.length`:
        *   Get the current character `char = sequence[i]`.
        *   **If `char === '-'`:** This indicates a closing tag.
            *   The actual tag letter is `sequence[i+1]`.
            *   Decrement `currentDepth`.
            *   Increment `i` by 2 (to skip both '-' and the tag letter).
        *   **Else (if `char` is a letter):** This indicates an opening tag.
            *   The tag letter is `char`.
            *   Increment `currentDepth`.
            *   Add `1 / currentDepth` to `tagWeights[tagLetter]`.
            *   Increment `i` by 1 (to skip the tag letter).

3.  **Find Maximum Weight Tag:**
    *   Initialize `maxWeight = -1` (or any value lower than any possible weight, e.g., 0).
    *   Initialize `resultTag = ''`.
    *   Iterate through all possible tag letters from 'a' to 'z' (ensuring alphabetical order for tie-breaking).
        *   Get the `weight` for the current `tagLetter` from `tagWeights`.
        *   If `weight > maxWeight`:
            *   Update `maxWeight = weight`.
            *   Update `resultTag = tagLetter`.
        *   If `weight === maxWeight`: (This case handles ties)
            *   Since we iterate alphabetically (`a` then `b` etc.), if `maxWeight` was already set by an earlier letter (e.g., 'a') and the current letter (e.g., 'b') has the same weight, 'a' is already stored as `resultTag`. The problem states to choose the *smallest* alphabetically, so no action is needed here because any later letter in the iteration would be alphabetically larger.

4.  **Output:** Print `resultTag`.

**Complexity:**
*   Time Complexity: O(N) for parsing the sequence (where N is the length of the sequence, max 300) + O(26) for finding the max weight. Overall, O(N), which is very efficient for the given constraints.
*   Space Complexity: O(26) for storing tag weights (constant space) + O(1) for other variables. Overall, O(1).