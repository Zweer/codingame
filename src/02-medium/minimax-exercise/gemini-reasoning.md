The puzzle asks us to implement the Minimax algorithm with Alpha-Beta pruning to find the optimal score for the first player (maximizer) in a zero-sum game, and to count the number of visited tree nodes.

**Game Description:**
*   **Two Players:** A maximizer (first player) and a minimizer (second player).
*   **Zero-Sum:** One player's gain is the other's loss.
*   **Fixed Turns:** The game always lasts `D` turns, meaning the game tree has a depth of `D` (root is depth 0, leaves are at depth `D`).
*   **Fixed Choices:** Each player has `B` choices at each turn, leading to a branching factor of `B`.
*   **Leaves:** The `B^D` leaf nodes contain the final scores for the first player. These are given as a flat array, ordered from left to right.

**Minimax Algorithm with Alpha-Beta Pruning:**

The core of the solution is a recursive `minimax` function. This function determines the best possible score for the current player at a given node in the game tree.

1.  **Function Signature:**
    `minimax(depth, startIndex, alpha, beta, maximizingPlayer)`
    *   `depth`: Current depth in the tree (0 for the root).
    *   `startIndex`: The index in the `leafScores_global` array where the leaves for the current subtree begin. This is crucial for navigating the flat array without building an explicit tree structure.
    *   `alpha`: The best (highest) score that the maximizing player can *guarantee* so far for themselves or any parent.
    *   `beta`: The best (lowest) score that the minimizing player can *guarantee* so far for themselves or any parent.
    *   `maximizingPlayer`: A boolean, `true` if it's the maximizing player's turn, `false` if it's the minimizing player's turn.

2.  **Visited Nodes Count:**
    A global counter `visitedNodes` is incremented at the beginning of each `minimax` function call to track every node evaluated.

3.  **Base Case:**
    When `depth === D_global` (the global maximum depth), we have reached a leaf node. The function returns the score directly from `leafScores_global[startIndex]`.

4.  **Recursive Step:**
    For internal nodes:
    *   **Calculate `leavesPerChildSubtree`**: This represents the number of leaf nodes controlled by a single child of the current node. It's calculated as `B_global^(D_global - (depth + 1))`. For example, if `D=3, B=2`:
        *   At depth 0, a child is at depth 1. `leavesPerChildSubtree = 2^(3-(0+1)) = 2^2 = 4`. Each child subtree has 4 leaves.
        *   At depth 1, a child is at depth 2. `leavesPerChildSubtree = 2^(3-(1+1)) = 2^1 = 2`. Each child subtree has 2 leaves.
        *   At depth 2, a child is at depth 3 (a leaf). `leavesPerChildSubtree = 2^(3-(2+1)) = 2^0 = 1`. Each child subtree has 1 leaf.
    *   **Iterate through Children:** Loop `B_global` times, once for each possible move (child).
        *   For each child `i`, calculate its `childStartIndex` as `startIndex + i * leavesPerChildSubtree`. This ensures we correctly point to the segment of `leafScores_global` relevant to that child's subtree.
        *   Recursively call `minimax` for the child, toggling `maximizingPlayer`.
    *   **Maximizing Player's Turn:**
        *   Initialize `value = -Infinity`.
        *   For each child: `value = Math.max(value, child_result)`.
        *   Update `alpha = Math.max(alpha, value)`.
        *   **Alpha Pruning:** If `alpha >= beta`, the maximizing player has found a move that guarantees a score `alpha` or better. If the minimizing player (in a parent node) can already force a score of `beta` (which is less than or equal to `alpha`), they will never allow play to reach this path. So, we can stop exploring further siblings for this node (`break`).
    *   **Minimizing Player's Turn:**
        *   Initialize `value = +Infinity`.
        *   For each child: `value = Math.min(value, child_result)`.
        *   Update `beta = Math.min(beta, value)`.
        *   **Beta Pruning:** If `beta <= alpha`, the minimizing player has found a move that guarantees a score `beta` or worse. If the maximizing player (in a parent node) can already force a score of `alpha` (which is greater than or equal to `beta`), they will never allow play to reach this path. So, we can stop exploring further siblings for this node (`break`).

5.  **Initial Call:**
    The algorithm is started by calling `minimax(0, 0, -Infinity, Infinity, true)`. `depth=0` for the root, `startIndex=0` for the beginning of the `leafScores_global` array, and the first player is the `maximizingPlayer`.

**Constraints Handled:**
The constraints `0 < D < 15`, `0 < B < 15`, and `number of leafs < 3500` ensure that `B^D` (total leaves) and `B^(D - (depth + 1))` (leaves per child subtree) remain small enough for `Math.pow` and array indexing to work correctly without overflow, and that the total number of operations remains within limits.