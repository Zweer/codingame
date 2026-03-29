The problem asks us to reconstruct a sentence by adding spaces, given the original sentence without spaces and a list of its constituent words in random order. The key challenge is to handle cases where multiple valid segmentations exist, in which case we should output "Unsolvable". The problem guarantees at least one solution always exists.

This problem can be efficiently solved using a combination of Dynamic Programming (DP) with memoization and a Trie (prefix tree) for fast word lookups.

### 1. Data Structures:

*   **Trie (Prefix Tree)**: To efficiently check if a substring of the `original` sentence is a valid word from the `words` list. A Trie allows us to traverse possible words starting at any index in `O(L)` time, where `L` is the length of the word, and `O(1)` per character.
    *   Each `TrieNode` will have a `children` map (mapping characters to child nodes) and a `isWordEnd` boolean flag to indicate if the path from the root to this node forms a complete word.
*   **Memoization Table**: A `Map` (or array) to store the results of subproblems. `memo[i]` will store the unique segmentation of the suffix `original[i...]`.
    *   `memo[i] = undefined`: This state has not been computed yet.
    *   `memo[i] = null`: `original[i...]` can be segmented in multiple ways (ambiguous).
    *   `memo[i] = ""`: `original[i...]` represents an empty string (base case: `i === original.length`) or no valid segmentation could be found (this case should ideally not happen for `i < original.length` due to problem constraints).
    *   `memo[i] = "some string"`: `original[i...]` has exactly one unique segmentation, and "some string" is that result (e.g., "DEF GHI J").

### 2. Algorithm:

**Step 1: Preprocessing (Build Trie)**
*   Parse the `words` input string by splitting it on spaces to get individual words.
*   Insert each word into the Trie. This step takes `O(Sum of word lengths)` time.

**Step 2: Dynamic Programming with Memoization (`solve` function)**
*   Define a recursive function `solve(index: number)` that attempts to find a unique segmentation for the suffix of `original` starting from `index`.
*   **Base Case**: If `index === original.length`, it means we have successfully segmented the entire string (or an empty suffix), so return an empty string `""`.
*   **Memoization Check**: If `memo.has(index)`, return `memo.get(index)`.
*   **Main Logic**:
    *   Initialize `possibleSuffixes = new Set<string>()`. This set will store all unique valid segmentations found for the current suffix `original[index...]`.
    *   Iterate through the `original` string from `index` onwards, using the Trie to find all possible words starting at `index`.
        *   Start with `currentNode = trie.root`.
        *   For `j` from `index` to `original.length - 1`:
            *   Get the character `char = original[j]`.
            *   If `currentNode` does not have a child for `char`, it means no word in our dictionary starts with `original[index...j]`, so break this inner loop.
            *   Move `currentNode` to its child for `char`.
            *   If `currentNode.isWordEnd` is true, it means `original.substring(index, j + 1)` is a valid word (`currentWord`).
                *   Recursively call `nextSuffixResult = solve(j + 1)` to find the segmentation for the remainder of the string.
                *   **Handle `nextSuffixResult`**:
                    *   If `nextSuffixResult === null` (ambiguous subproblem): Immediately mark `memo[index]` as `null` and return `null`. This propagates ambiguity upwards.
                    *   If `nextSuffixResult === ""` (subproblem successfully parsed an empty suffix): Add `currentWord` to `possibleSuffixes`.
                    *   If `nextSuffixResult` is a unique string (subproblem has a unique solution): Add `currentWord + " " + nextSuffixResult` to `possibleSuffixes`.
                *   **Ambiguity Check**: If at any point `possibleSuffixes.size > 1`, it means we've found at least two different ways to segment `original[index...]`. Mark `memo[index]` as `null` and return `null` immediately.
*   **Post-Iteration**:
    *   If `possibleSuffixes.size === 0`: This means no valid word could start at `index` and lead to a full segmentation. Based on the problem ("at least one solution"), this scenario for `index < N` implies an issue, but it's consistent with returning `""` for an impossible path. In our specific problem, this case effectively implies failure or only happens for `index === N` base case.
    *   If `possibleSuffixes.size === 1`: A unique segmentation was found. Store this unique string in `memo[index]` and return it.
    *   If `possibleSuffixes.size > 1`: This case should have been handled by the immediate ambiguity check inside the loop. However, as a safeguard, mark `memo[index]` as `null` and return `null`.

**Step 3: Final Output**
*   Call `solve(0)` to get the result for the entire `original` string.
*   If the result is `null`, print "Unsolvable".
*   Otherwise, print the obtained result.

### Complexity Analysis:

*   **Time Complexity**:
    *   Trie construction: `O(Sum of word lengths)`. Let `K` be the number of words, `L_avg` be the average word length. So, `O(K * L_avg)`.
    *   `solve` function: There are `N` states (from `0` to `N-1`). For each state, the inner loop iterates up to `L_max` times (maximum word length, which can be up to `N`). Each step involves a constant-time Trie lookup and a recursive call (which is memoized). Therefore, the overall DP part is `O(N * L_max)`.
    *   Given `N <= 1000`, `L_max <= 1000`, the worst-case time complexity is `O(N^2)`, which is `1000^2 = 10^6` operations, well within typical time limits (usually 1 second).
*   **Space Complexity**:
    *   Trie: `O(Sum of word lengths)` in the worst case (if all words are unique and don't share many prefixes). `O(K * L_avg)`.
    *   Memoization table: `O(N)` for storing `N` possible results (strings). Each string can be up to `N` characters long, so `O(N^2)` space for storing the strings in the memo table in the worst case.

The approach handles ambiguity effectively by propagating `null` results and by checking for multiple `possibleSuffixes` options at each step.