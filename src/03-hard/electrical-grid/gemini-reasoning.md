The problem asks us to connect all `N` houses to house 1 (which has a power generator) with the minimum possible total cost. We are given `M` possible connections between pairs of houses, each with a specific cost. The exact path to house 1 doesn't matter, only that a path exists. This is a classic Minimum Spanning Tree (MST) problem.

A Minimum Spanning Tree is a subset of the edges of a connected, edge-weighted undirected graph that connects all the vertices together, without any cycles and with the minimum possible total edge weight. Since house 1 needs to be connected to all other houses, and we want to minimize the cost, finding an MST of the entire graph will achieve this goal. If we find an MST, all houses will be connected to each other, and thus to house 1, at the minimum total cost.

We can solve this using Kruskal's algorithm, which is well-suited for graphs where the number of edges `M` is significantly larger than the number of vertices `N` (or when `M` is sparse).

**Kruskal's Algorithm Steps:**

1.  **Represent Edges:** Store all possible connections as edge objects/tuples, each containing the two connected houses and the cost. To ensure consistent output sorting later, it's beneficial to store the house with the smaller ID as the first element (`u`) and the larger ID as the second element (`v`) for each edge.
2.  **Sort Edges:** Sort all edges in non-decreasing order based on their cost.
3.  **Initialize Disjoint Set Union (DSU):**
    *   Create a `parent` array where `parent[i]` initially points to `i` itself (each house is in its own set).
    *   Create a `rank` (or `size`) array for optimization (union by rank/size). Initially, all ranks are 0.
    *   The DSU structure will help efficiently determine if two houses are already connected and to merge their connected components.
4.  **Build MST:**
    *   Initialize `totalCost = 0`, `connectionsMade = 0`, and an empty list `mstEdges` to store the selected connections.
    *   Iterate through the sorted edges:
        *   For each edge `(u, v, cost)`:
            *   Use the `find` operation of the DSU to get the root (representative) of `u`'s set and `v`'s set.
            *   If the roots are different, it means `u` and `v` are in different connected components, and adding this edge will not form a cycle.
                *   Perform a `union` operation on `u` and `v` to merge their components.
                *   Add `cost` to `totalCost`.
                *   Increment `connectionsMade`.
                *   Add the edge `(u, v, cost)` to `mstEdges`.
            *   Optimization: If `connectionsMade` reaches `N - 1` (for `N > 1` houses, an MST has `N-1` edges; for `N=1`, 0 edges are needed), we have found the complete MST, so we can stop.
5.  **Output Results:**
    *   Print the total number of connections (`connectionsMade`) and the `totalCost`.
    *   Sort the `mstEdges` list numerically, first by the smaller house ID (`u`) and then by the larger house ID (`v`), as required by the problem.
    *   Print each selected connection in the sorted order.

**DSU Operations:**

*   **`find(i)`:** Returns the representative of the set containing `i`. It uses path compression to flatten the tree structure, making future `find` operations faster.
*   **`union(i, j)`:** Merges the sets containing `i` and `j`. It uses union by rank to keep the tree height minimal, further optimizing performance.

**Complexity:**
*   Sorting edges: `O(M log M)`
*   DSU operations (find and union): `O(M * α(N))`, where `α` is the inverse Ackermann function, which is practically a very small constant.
*   Total time complexity: `O(M log M)` due to sorting dominating.
*   Space complexity: `O(N + M)` for storing DSU arrays and edges.

Given `N <= 5000` and `M <= 50000`, `M log M` is approximately `50000 * log(50000)` which is roughly `50000 * 16.6` or `830,000` operations, well within typical time limits.