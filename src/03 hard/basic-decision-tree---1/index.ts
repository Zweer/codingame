interface Pupa {
        originalIndex: number;
        hornSize: number;
        speciesID: number;
    }
    ```

2.  **Entropy Calculation**: The core of the decision tree algorithm is minimizing entropy.
    *   **Entropy `H(S)`**: For a given group of pupae `S`, this measures the impurity of the species. It's calculated as `H(S) = - Σ (p_i * log2(p_i))`, where `p_i` is the proportion of pupae belonging to species `i` in group `S`.
    *   **Special Cases**: If a group is empty or contains pupae of only one species, its entropy is 0 (meaning it's "pure" and doesn't need further splitting). If `p_i` is 0, the term `p_i * log2(p_i)` is taken as 0. `log2(x)` is calculated as `Math.log(x) / Math.log(2)`.

3.  **Weighted Entropy**: When we split a group `S` into two subgroups `S_left` and `S_right`, the weighted entropy of the split is:
    `Weighted Entropy = (|S_left| / |S|) * H(S_left) + (|S_right| / |S|) * H(S_right)`.
    Our goal is to choose a separator that results in the *smallest* weighted entropy.

4.  **Splitting Mechanism**:
    *   For a given group `currentGroup`, we iterate through each pupa `candidateSeparator` within that group.
    *   This `candidateSeparator` defines the split point:
        *   `leftGroup`: Contains all pupae from `currentGroup` whose `hornSize` is *strictly less than* `candidateSeparator.hornSize`.
        *   `rightGroup`: Contains all other pupae from `currentGroup` whose `hornSize` is *greater than or equal to* `candidateSeparator.hornSize`.
    *   We calculate the weighted entropy for each potential split and find the `bestSeparator` that minimizes this value.
    *   **Tie-breaking**: If two `candidateSeparator` pupae yield the same minimum weighted entropy, the problem states we must choose the one with the *smaller original index*.

5.  **Tree Construction (Recursive DFS)**:
    *   The process starts with all pupae in a single group.
    *   We use a recursive function (e.g., `buildTree`) to process groups:
        *   **Base Case**: If a `currentGroup` is empty or its `calculateEntropy` is 0, it means the group is pure, and no further splitting is needed. The recursion stops for this branch.
        *   **Recursive Step**: If the group is not pure, we find the `bestSeparator` using the criteria above.
        *   The `lastSeparatorIndex` global variable is updated with the `originalIndex` of the `bestSeparator` found in the current step.
        *   Crucially, the problem specifies a depth-first traversal order: first, recursively process the `leftGroup` (smaller horns), and *then* recursively process the `rightGroup` (larger horns). This order ensures that `lastSeparatorIndex` will correctly track the separator from the "last" split according to the traversal order, which corresponds to the deepest split in the rightmost active branch.

6.  **Output**: After the `buildTree` function completes its execution for all branches, the `lastSeparatorIndex` will hold the desired value, which is then printed.

**Example Trace (from problem description):**

Input: