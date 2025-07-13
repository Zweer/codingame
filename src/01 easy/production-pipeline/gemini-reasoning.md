The problem asks us to find a valid processing order for `N` sequential processes, given `K` constraints. Each constraint `p1 < p2` means that process `p1` must be executed before `p2`. If multiple orders are possible, we should choose the one where smaller process numbers come first when their order doesn't otherwise matter. If no valid order exists (due to circular dependencies), we should output `INVALID`.

This is a classic **Topological Sort** problem. We can model the processes as nodes in a directed graph and the constraints as directed edges. An edge from `p1` to `p2` means `p1` must precede `p2`.

We will use **Kahn's algorithm** (a BFS-based approach) for topological sorting, with a modification to handle the tie-breaking rule.

**Algorithm Steps:**

1.  **Graph Representation:**
    *   We'll use an **adjacency list** (`adj`) to store the graph. `adj.get(u)` will contain a `Set` of processes `v` such that there's a dependency `u < v`. Using a `Set` ensures that duplicate constraints like `2<5` appearing multiple times don't add redundant edges or incorrectly increment in-degrees.
    *   We'll use an `inDegree` array to store the number of incoming edges for each process. `inDegree[v]` represents how many processes must run before `v`.

2.  **Initialization:**
    *   Initialize `adj` as a `Map` where each process `i` (from 1 to `N`) maps to an empty `Set`.
    *   Initialize `inDegree` array of size `N+1` (for 1-based indexing) with all values set to 0.

3.  **Process Constraints:**
    *   For each constraint `p1 < p2`:
        *   Add `p2` to `adj.get(p1)`.
        *   Increment `inDegree[p2]`. We must check if the edge `p1 -> p2` already exists *before* incrementing `inDegree[p2]` to avoid double-counting due to redundant constraints.

4.  **Initialize Ready Processes Queue (with Tie-breaking):**
    *   Create a list (which will act as our priority queue) called `readyProcesses`.
    *   Add all processes `i` that have `inDegree[i] === 0` to `readyProcesses`. These are the processes that have no prerequisites and can be executed first.
    *   **Crucially, sort `readyProcesses` in ascending order.** This ensures that when multiple processes are ready, the one with the smallest process number is picked first, satisfying the tie-breaking rule.

5.  **Topological Sort (Kahn's Algorithm):**
    *   Create an empty array `result` to store the final sorted order.
    *   While `readyProcesses` is not empty:
        *   Dequeue (remove from the front) the smallest process `u` from `readyProcesses`.
        *   Add `u` to `result`.
        *   For each neighbor `v` of `u` (i.e., for every process `v` that `u` must run before):
            *   Decrement `inDegree[v]`.
            *   If `inDegree[v]` becomes 0, it means all prerequisites for `v` are now met. Add `v` to `readyProcesses`.
            *   **After adding `v`, re-sort `readyProcesses` in ascending order.** This maintains the "smallest process first" property of our priority queue. For `N <= 250`, this repeated sorting operation (`O(M log M)` where `M` is the current queue size) is efficient enough.

6.  **Cycle Detection:**
    *   After the loop finishes, if the `result` array contains `N` processes, then a valid topological order was found. Print the processes in `result` separated by spaces.
    *   If `result.length` is less than `N`, it means there's a cycle in the dependency graph, and not all processes could be ordered. In this case, output `INVALID`.

**Example Walkthrough (from problem description):**
`N=8`, `K=3`
Constraints:
`2<5`
`3<4`
`5<4`

1.  **Initialization:**
    *   `adj`: All 1-8 map to empty `Set`.
    *   `inDegree = [0,0,0,0,0,0,0,0,0]`

2.  **Process Constraints:**
    *   `2<5`: `adj.get(2).add(5)`, `inDegree[5]` becomes 1.
    *   `3<4`: `adj.get(3).add(4)`, `inDegree[4]` becomes 1.
    *   `5<4`: `adj.get(5).add(4)`, `inDegree[4]` becomes 2.

3.  **Initial Ready Processes:**
    *   Processes with `inDegree=0`: 1, 2, 3, 6, 7, 8.
    *   `readyProcesses = [1, 2, 3, 6, 7, 8]` (already sorted).

4.  **Topological Sort:**
    *   `result = []`
    *   `u = 1`. `result = [1]`. `adj.get(1)` is empty. `readyProcesses = [2, 3, 6, 7, 8]`.
    *   `u = 2`. `result = [1, 2]`. `v = 5` (from `adj.get(2)`). `inDegree[5]` becomes 0. `readyProcesses.push(5)`. `readyProcesses` becomes `[3, 6, 7, 8, 5]`. Re-sort: `[3, 5, 6, 7, 8]`.
    *   `u = 3`. `result = [1, 2, 3]`. `v = 4` (from `adj.get(3)`). `inDegree[4]` becomes 1. `readyProcesses` remains `[5, 6, 7, 8]`.
    *   `u = 5`. `result = [1, 2, 3, 5]`. `v = 4` (from `adj.get(5)`). `inDegree[4]` becomes 0. `readyProcesses.push(4)`. `readyProcesses` becomes `[6, 7, 8, 4]`. Re-sort: `[4, 6, 7, 8]`.
    *   `u = 4`. `result = [1, 2, 3, 5, 4]`. `adj.get(4)` is empty. `readyProcesses = [6, 7, 8]`.
    *   `u = 6`. `result = [1, 2, 3, 5, 4, 6]`. `adj.get(6)` is empty. `readyProcesses = [7, 8]`.
    *   `u = 7`. `result = [1, 2, 3, 5, 4, 6, 7]`. `adj.get(7)` is empty. `readyProcesses = [8]`.
    *   `u = 8`. `result = [1, 2, 3, 5, 4, 6, 7, 8]`. `adj.get(8)` is empty. `readyProcesses = []`.

5.  **Check Result:**
    *   `result.length` (8) equals `N` (8). Output `1 2 3 5 4 6 7 8`.

This matches the example output.