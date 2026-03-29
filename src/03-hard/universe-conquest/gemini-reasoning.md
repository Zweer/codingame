The problem asks us to find the minimum total ships required to "attack" planets such that no hyperspace road connects a planet owned by the Empire ('E') and a planet owned by the Republic ('R'). If we attack a planet, its army is destroyed, and it no longer defends hyperspace roads on behalf of its original faction. This effectively "breaks" any connection it had to the other faction.

This problem can be elegantly solved using the **Max Flow / Min Cut theorem**. Specifically, it's a variation of the **Minimum Weight Vertex Cover** problem for a bipartite graph.

**Graph Construction for Max Flow:**

1.  **Nodes:**
    *   Create a **source node (S)**.
    *   Create a **sink node (T)**.
    *   For each planet `i` from 1 to `P`, create a corresponding **planet node `P_i`**. (We'll use 0-indexed planets `0` to `P-1` for array access, so planet `i` corresponds to node `i+1` in the graph).

2.  **Edges related to Planet Costs:**
    *   For each Empire planet `E_i`: Add a directed edge from the **source S** to the planet node `E_i` with a capacity equal to `ships[E_i]` (the cost to attack this planet).
    *   For each Republic planet `R_j`: Add a directed edge from the planet node `R_j` to the **sink T** with a capacity equal to `ships[R_j]` (the cost to attack this planet).

3.  **Edges related to Hyperspace Roads:**
    *   For each hyperspace road connecting two planets `P1` and `P2`:
        *   If `P1` and `P2` belong to the *same* faction (e.g., both 'E' or both 'R'), this road is not problematic according to the problem statement, so no edge is added to our flow network for this road.
        *   If `P1` and `P2` belong to *different* factions (one 'E' and one 'R'), this road is problematic. Add a directed edge from the Empire planet's node to the Republic planet's node with an **"infinite" capacity**. "Infinite" here means a capacity large enough that it would never be part of a minimum cut unless there's no other way to separate S from T. A value greater than the sum of all possible planet costs (e.g., `P * 100 + 1 = 30 * 100 + 1 = 3001` or `4000`) is sufficient.

**Min Cut and Solution:**

The minimum `S-T` cut in this constructed graph corresponds to the minimum cost to "break" all problematic hyperspace roads.
*   Cutting an edge from `S` to an Empire planet `E_i` means `E_i` is no longer connected to `S`'s side of the cut. This represents destroying the army on `E_i` at a cost of `ships[E_i]`.
*   Cutting an edge from a Republic planet `R_j` to `T` means `R_j` is no longer connected to `T`'s side of the cut. This represents destroying the army on `R_j` at a cost of `ships[R_j]`.
*   The "infinite" capacity edges between 'E' and 'R' planets ensure that if such an edge exists, to make a finite cut, we must either cut the `S -> E_i` edge or the `R_j -> T` edge. This means we must destroy at least one of the armies defending the connected planets.

By the Max Flow / Min Cut theorem, the maximum flow from S to T in this network is equal to the capacity of the minimum S-T cut. This minimum cut capacity will be our answer: the minimum total ships required.

**Algorithm for Max Flow:**

Dinic's algorithm is an efficient algorithm for finding the maximum flow in a flow network. It involves two main phases:
1.  **BFS (Breadth-First Search):** Constructs a "level graph" (or "layered network") by performing a BFS from the source `S`. This assigns a level to each node, representing its shortest distance from `S`. If the sink `T` is reachable, an augmenting path exists.
2.  **DFS (Depth-First Search):** Finds "blocking flows" in the level graph. A blocking flow is a flow that saturates at least one edge on every path from `S` to `T` in the current level graph. It uses a pointer (`ptr`) optimization to avoid re-checking edges that are already saturated or explored.

These two phases are repeated until `T` is no longer reachable from `S` in the residual graph via BFS, at which point the maximum flow has been found.

**Constraints Check:**
*   `P <= 30`: The number of nodes in our flow network will be `P + 2` (up to 32 nodes).
*   `H <= 200`: The number of edges will be `P + H` (up to 230 edges, plus their reverse edges).
These constraints are very small, making Dinic's algorithm (which is efficient for such graph sizes) perfectly suitable.