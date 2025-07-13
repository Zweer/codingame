The problem asks us to find character replacements needed to transform a string `X` into a string `Y`, given that `X` and `Y` have the same length. We need to handle several specific output cases:

1.  **`CAN'T`**: If a character `C` from `X` needs to be replaced by `A` at one position, and by `B` (where `A != B`) at another position. A single character in `X` must consistently map to only one character in `Y`.
2.  **`NONE`**: If `X` and `Y` are identical.
3.  **`FROM->TO`**: Otherwise, print each unique replacement, where `FROM` is the character from `X` and `TO` is the character it maps to in `Y`. These replacements should be printed in the order that their `FROM` characters first appear in `X`. Only replacements where `FROM` is different from `TO` should be printed.

**Reasoning:**

To solve this, we can iterate through both strings `X` and `Y` simultaneously, character by character, from left to right.

1.  **Mapping Storage:** We'll use a `Map` (e.g., `replacements: Map<string, string>`) to store the observed mappings. The key will be a character from `X`, and the value will be the character from `Y` it maps to.
2.  **Order Preservation:** To respect the "in the order they appear in `X`" requirement for output, we'll also use a `Set` (e.g., `uniqueFromCharsInOrder: Set<string>`). This set will store each unique character from `X` the first time we encounter it. `Set` iteration order is insertion order in modern JavaScript, which is crucial here.
3.  **Conflict Detection (`CAN'T`):** As we iterate, for each pair `(charX, charY)`:
    *   If `charX` is already in our `replacements` map: We check if its existing mapping (`replacements.get(charX)`) is the same as `charY`. If they are different, we've found a conflict (e.g., 'A' maps to 'B' at one point, and then 'A' maps to 'C' at another). In this case, we immediately set a flag to indicate `CAN'T` and stop processing.
    *   If `charX` is *not* yet in the `replacements` map: This is a new mapping. We add `(charX, charY)` to `replacements` and add `charX` to `uniqueFromCharsInOrder`.
4.  **Output Conditions:** After iterating through the entire strings (or stopping early due to a conflict):
    *   If the conflict flag is set, print `CAN'T`.
    *   Else if `X` is identical to `Y` (which can be checked simply with `X === Y`), print `NONE`.
    *   Otherwise, we iterate through the `uniqueFromCharsInOrder` set. For each `fromChar` in this set, we retrieve its corresponding `toChar` from the `replacements` map. If `fromChar` is different from `toChar`, we format it as `FROM->TO` and add it to an array of output lines. Finally, we print each line in this array.

This approach ensures that all conditions are met correctly and efficiently. The time complexity will be linear with respect to the length of the strings (O(N)), as we iterate through them once. The space complexity is proportional to the number of unique characters in `X` (at most `N`, but practically bounded by the size of the character set, e.g., 26 for English alphabet).

**TypeScript Code:**