interface Node {
        id: number;
        left: number | null;
        right: number | null;
        parent: number | null;
        isLeftChild: boolean | null; // True if this node is a left child of its parent, false if right.
    }
    const nodes = new Map<number, Node>();
    ```

2.  **Building the Tree:**
    *   First, initialize all `N` nodes (from 1 to `N`) in our `Map`, setting `left`, `right`, `parent`, and `isLeftChild` to `null`.
    *   Then, iterate `M` times, reading `P`, `L`, `R`. For each `P`, `L`, `R` triplet:
        *   Update `nodes.get(P)!.left = L;` and `nodes.get(P)!.right = R;`
        *   Update `nodes.get(L)!.parent = P;` and `nodes.get(L)!.isLeftChild = true;`
        *   Update `nodes.get(R)!.parent = P;` and `nodes.get(R)!.isLeftChild = false;`

3.  **Finding the Root:** The problem states that all nodes except the root have exactly one parent. Therefore, the root node is the unique node whose `parent` property is `null`. We can iterate through all nodes (from 1 to `N`) to find this node.

4.  **Finding the Path:**
    *   **Special Case:** If the target node `V` is the root node, print "Root" and terminate.
    *   **General Case:** If `V` is not the root, we need to find the path. The most efficient way to reconstruct the path from the root *down* to `V` is to start at `V` and traverse *up* to the root using the `parent` links. As we move up, we record whether the current node was a left or right child of its parent.
        *   Store these "Left" / "Right" decisions in an array (e.g., `path: string[]`). Since we are going up, the path segments will be in reverse order relative to a root-down traversal.
        *   Once we reach the root (when `currentNode.parent` becomes `null`), we have the complete path in reverse.
        *   Finally, `reverse()` the `path` array and `join(" ")` its elements to get the desired output string.

**Example Trace (V=5 for the sample tree):**

Tree: