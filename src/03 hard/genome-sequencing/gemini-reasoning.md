The problem asks us to find the length of the shortest possible sequence that contains all given sub-sequences as substrings. This is a classic problem known as the Shortest Common Superstring (SCS) problem.

Given the very small constraint on `N` (number of sub-sequences, `0 < N < 6`), a brute-force approach involving permutations of the sub-sequences is feasible.

Here's the breakdown of the solution strategy:

1.  **Filter Redundant Sequences**: If one sequence is a substring of another given sequence, it is redundant because the longer sequence will already cover the shorter one. Removing these redundant sequences reduces the effective `N` and simplifies the problem without affecting the final result. For example, if "ABC" and "B" are inputs, "B" is redundant because "ABC" already contains it. The final superstring needs only to contain "ABC".

2.  **Pre-compute Overlaps**: To form the shortest superstring, we need to maximize the overlap when concatenating sequences. For any two sequences `s1` and `s2`, we calculate the length of the longest suffix of `s1` that is also a prefix of `s2`. This overlap value will be used to reduce the total length when `s2` is appended after `s1`. For example, `getOverlap("AGATTA", "GATTACA")` is 5 (for "GATTA").

3.  **Permutation Search (Depth-First Search with Bitmask)**:
    *   Since the order of concatenation matters for minimizing the total length, we must explore all possible orderings of the unique (non-redundant) sequences.
    *   A Depth-First Search (DFS) approach is suitable for this. We can represent the set of visited sequences using a bitmask, which is efficient for small `N`.
    *   The DFS function will keep track of:
        *   `currentPathMask`: A bitmask indicating which sequences have been included in the current superstring path.
        *   `lastStringIndex`: The index of the last sequence added to the path.
        *   `currentLength`: The total length of the superstring formed so far by the current path.
    *   The base case for the DFS is when all unique sequences have been visited. At this point, we compare the `currentLength` with the `minTotalLength` found so far and update it if the `currentLength` is smaller.
    *   In the recursive step, we iterate through all unvisited sequences. For each unvisited `nextStringIndex`, we calculate the `newLength` (currentLength + length of `uniqueSequences[nextStringIndex]` - `overlap[lastStringIndex][nextStringIndex]`) and make a recursive call.
    *   The DFS is initiated by trying each unique sequence as the starting point of the superstring.

**Example Walkthrough (for `TT, AA, ACT` which yields 5):**

1.  **Redundancy Filter**: `["TT", "AA", "ACT"]`. No sequence is a substring of another. So, `uniqueSequences = ["TT", "AA", "ACT"]`. `numUnique = 3`.

2.  **Overlaps Matrix (`overlaps[i][j]` = overlap when `uniqueSequences[j]` follows `uniqueSequences[i]`):**
    *   `getOverlap("AA", "ACT")` = 1 (for 'A')
    *   `getOverlap("ACT", "TT")` = 1 (for 'T')
    *   All other relevant overlaps are 0.

    `overlaps` matrix:
          TT  AA  ACT
    TT    0   0   0
    AA    0   0   1
    ACT   0   0   1

3.  **DFS (example path `AA` -> `ACT` -> `TT`):**
    *   Start: `dfs(1 << index_AA, index_AA, len("AA"))` -> `dfs(0b010, 1, 2)` (assuming `AA` is at index 1)
    *   Inside `dfs(0b010, 1, 2)`:
        *   Try `ACT` (at index 2). `nextStringIndex = 2`.
        *   `newLength = 2 (len AA) + len("ACT") - overlaps[index_AA][index_ACT]`
        *   `newLength = 2 + 3 - 1 = 4`. (`AACT`)
        *   Recursive call: `dfs(0b010 | 0b100, 2, 4)` -> `dfs(0b110, 2, 4)`
        *   Inside `dfs(0b110, 2, 4)`:
            *   Try `TT` (at index 0). `nextStringIndex = 0`.
            *   `newLength = 4 (len AACT) + len("TT") - overlaps[index_ACT][index_TT]`
            *   `newLength = 4 + 2 - 1 = 5`. (`AACTT`)
            *   Recursive call: `dfs(0b110 | 0b001, 0, 5)` -> `dfs(0b111, 0, 5)`
            *   Inside `dfs(0b111, 0, 5)`:
                *   `currentPathMask` (0b111) equals `(1 << numUnique) - 1` (0b111). Base case met.
                *   `minTotalLength = Math.min(Infinity, 5) = 5`. Return.

This path yields 5, which matches the example output. The algorithm correctly finds the shortest common superstring length.