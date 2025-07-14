// For CodinGame, `readline()` and `console.log()` (or `print()`) are typically globally available.
// This code block assumes such an environment.

/**
 * Implements a Min-Priority Queue (Min-Heap) data structure.
 * Elements are ordered based on a provided comparison function.
 */
class MinPriorityQueue<T> {
    private heap: T[] = [];
    // Comparison function: returns <0 if a has higher priority, >0 if b has higher, 0 if equal.
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    private parent(i: number): number { return Math.floor((i - 1) / 2); }
    private leftChild(i: number): number { return 2 * i + 1; }
    private rightChild(i: number): number { return 2 * i + 2; }

    // Swaps two elements in the heap array.
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Moves an element up the heap to maintain the heap property.
    private bubbleUp(i: number) {
        while (this.parent(i) >= 0 && this.compare(this.heap[i], this.heap[this.parent(i)]) < 0) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    // Moves an element down the heap to maintain the heap property.
    private bubbleDown(i: number) {
        let smallest = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);

        // Check left child
        if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
            smallest = left;
        }

        // Check right child
        if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
            smallest = right;
        }

        // If a child is smaller, swap and continue bubbling down
        if (smallest !== i) {
            this.swap(i, smallest);
            this.bubbleDown(smallest);
        }
    }

    /**
     * Inserts an item into the priority queue.
     * @param item The item to insert.
     */
    insert(item: T) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the item with the highest priority (smallest value).
     * @returns The highest priority item, or undefined if the queue is empty.
     */
    extractMin(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop(); // Only one element, just remove it
        }

        const item = this.heap[0]; // Get the root (min element)
        this.heap[0] = this.heap.pop()!; // Move the last element to the root
        this.bubbleDown(0); // Restore heap property
        return item;
    }

    /**
     * Checks if the priority queue is empty.
     * @returns True if empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * Returns the number of elements in the priority queue.
     * @returns The size of the queue.
     */
    size(): number {
        return this.heap.length;
    }
}

/**
 * Type definition for a node stored in the priority queue.
 * Contains f-value, node ID, and g-value.
 */
type PQNode = {
    fValue: number;
    nodeId: number;
    gValue: number;
};

/**
 * Comparison function for PQNode objects, used by the MinPriorityQueue.
 * Orders by fValue (ascending), then by nodeId (ascending) for tie-breaking.
 */
const comparePQNodes = (a: PQNode, b: PQNode): number => {
    if (a.fValue !== b.fValue) {
        return a.fValue - b.fValue; // Smaller fValue has higher priority
    }
    return a.nodeId - b.nodeId; // Smaller nodeId has higher priority (tie-breaker)
};

/**
 * Type definition for an edge in the graph.
 */
type Edge = { to: number; weight: number; };

/**
 * Type definition for the adjacency list representation of the graph.
 */
type AdjacencyList = Map<number, Edge[]>;

/**
 * Solves the A* search puzzle.
 * Reads input, performs A* search, and prints the expanded nodes.
 */
function solveAStar() {
    // Read N, E, S, G from the first line of input
    const firstLine = readline().split(' ').map(Number);
    const N = firstLine[0]; // Number of nodes
    const E = firstLine[1]; // Number of edges
    const S = firstLine[2]; // Start node
    const G = firstLine[3]; // Goal node

    // Read heuristic values for all nodes
    const H = readline().split(' ').map(Number);

    // Initialize adjacency list for the graph
    const adj: AdjacencyList = new Map();
    for (let i = 0; i < N; i++) {
        adj.set(i, []); // Initialize an empty array for each node's neighbors
    }

    // Read edges and build the adjacency list (undirected graph)
    for (let i = 0; i < E; i++) {
        const [X, Y, C] = readline().split(' ').map(Number);
        adj.get(X)?.push({ to: Y, weight: C }); // Edge from X to Y
        adj.get(Y)?.push({ to: X, weight: C }); // Edge from Y to X
    }

    // gScore[nodeId] stores the current minimum cost found from the start node to nodeId.
    const gScore: number[] = new Array(N).fill(Infinity);
    gScore[S] = 0; // Cost from start to start is 0.

    // Initialize the open set (priority queue) with the start node.
    const openSet = new MinPriorityQueue<PQNode>(comparePQNodes);
    // fValue for start node = gScore[S] (0) + H[S].
    openSet.insert({ fValue: H[S], nodeId: S, gValue: 0 });

    // Array to collect output lines (expanded nodes and their f-values).
    const expandedNodesOutput: string[] = [];

    // Main A* loop
    while (!openSet.isEmpty()) {
        const current = openSet.extractMin()!; // Get the node with the highest priority (lowest fValue)

        // Optimization: If this path to current.nodeId is worse than one already found and processed, skip it.
        // This handles cases where a node might be re-added to the openSet with a better gValue,
        // but an older, worse entry for the same node is still present in the queue.
        if (current.gValue > gScore[current.nodeId]) {
            continue;
        }

        // This is the optimal path found so far to current.nodeId. Expand it and record for output.
        expandedNodesOutput.push(`${current.nodeId} ${current.fValue}`);

        // If the current node is the goal node, we have found the shortest path.
        // A* guarantees that the first time the goal node is extracted from the open set,
        // it represents the shortest path from the start.
        if (current.nodeId === G) {
            break; // Path to goal found, terminate A* search.
        }

        // Explore all neighbors of the current node
        const neighbors = adj.get(current.nodeId) || [];
        for (const edge of neighbors) {
            const neighborId = edge.to;
            const edgeWeight = edge.weight;

            // Calculate the tentative g-value if we were to go to neighborId through current
            const tentative_gScore = current.gValue + edgeWeight;

            // If this new path to neighborId is shorter than any previously found path
            if (tentative_gScore < gScore[neighborId]) {
                gScore[neighborId] = tentative_gScore; // Update the g-value for neighborId
                // Calculate the new f-value for neighborId
                const fValue_neighbor = tentative_gScore + H[neighborId];
                // Add the neighbor to the open set (or effectively update if already there)
                openSet.insert({ fValue: fValue_neighbor, nodeId: neighborId, gValue: tentative_gScore });
            }
        }
    }

    // Print all collected output lines to the console
    expandedNodesOutput.forEach(line => console.log(line));
}

// Call the main function to start the A* algorithm execution.
solveAStar();