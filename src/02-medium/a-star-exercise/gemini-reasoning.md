The problem asks us to implement the A* search algorithm to find the shortest path in a weighted, undirected graph. We need to output the sequence of nodes expanded by the algorithm, along with their f-values. The A* algorithm relies on g-values (cost from start), h-values (heuristic estimate to goal), and f-values (g + h). A specific tie-breaking rule is given: if two nodes have the same f-value, the one with the smaller identifier is expanded first.

Here's a breakdown of the solution:

1.  **Graph Representation**: We'll use an adjacency list to represent the graph. A `Map<number, Array<{ to: number, weight: number }>>` is suitable, where keys are node IDs and values are arrays of objects representing outgoing edges (neighbor ID and cost). Since the graph is undirected, when an edge `X Y C` is read, we add an edge from `X` to `Y` and from `Y` to `X`.

2.  **A* Data Structures**:
    *   `gScore`: An array or map (`number[]` in this case) to store the current shortest distance found from the `start` node to every other node. It's initialized with `Infinity` for all nodes except the `start` node, which is `0`.
    *   `hValues`: An array (`number[]`) to store the heuristic estimate for each node to the `goal` node, provided directly in the input.
    *   `openSet`: A priority queue to store nodes that are candidates for expansion. Each element in the priority queue will contain the node's `f-value`, `nodeId`, and `g-value`.
    *   `expandedNodesOutput`: An array of strings to collect the output lines before printing them.

3.  **Priority Queue (Min-Heap) Implementation**: TypeScript does not have a built-in priority queue. For the given constraints (N < 100), a simple array sorted on insertion or a basic min-heap implementation will suffice. A min-heap offers better performance (O(log N) for insertion/extraction) compared to a sorted array (O(N) for insertion/extraction).
    *   The `MinPriorityQueue` class is implemented using a binary heap.
    *   The `comparePQNodes` function defines the priority:
        *   First, compare by `fValue`: smaller `fValue` has higher priority.
        *   If `fValue`s are equal, compare by `nodeId`: smaller `nodeId` has higher priority (as per tie-breaking rule).

4.  **A* Algorithm Logic**:
    *   Initialize `gScore[S] = 0` and `gScore[v] = Infinity` for all other `v`.
    *   Add the `start` node `S` to the `openSet` with its `f-value` (`gScore[S] + H[S]`).
    *   Loop while `openSet` is not empty:
        *   Extract the node `current` with the smallest `f-value` (and smallest `nodeId` tie-break) from `openSet`.
        *   **Important Check**: If `current.gValue` (the g-value of the extracted node) is greater than `gScore[current.nodeId]` (the best g-value currently known for this node), it means we've found a shorter path to `current.nodeId` already, and this entry in the priority queue is stale. Skip it. This handles multiple entries for the same node in the queue when a shorter path is discovered.
        *   Add `current.nodeId` and `current.fValue` to `expandedNodesOutput`.
        *   If `current.nodeId` is the `goal` node, we've found the shortest path. A* guarantees that the first time the goal is extracted from the open set, it is via the shortest path. So, we `break` the loop.
        *   For each `neighbor` of `current`:
            *   Calculate `tentative_gScore = current.gValue + edge_cost(current, neighbor)`.
            *   If `tentative_gScore` is less than `gScore[neighbor]`, it means we've found a shorter path to `neighbor`.
                *   Update `gScore[neighbor] = tentative_gScore`.
                *   Calculate `fValue_neighbor = tentative_gScore + H[neighbor]`.
                *   Insert `neighbor` into the `openSet` with its new `f-value` and `g-value`.

5.  **Input/Output**:
    *   Input is read using `readline()`.
    *   Output is printed using `console.log()` (which is equivalent to `print()` in the CodinGame environment).