// Assuming readline is provided by the CodinGame environment
declare function readline(): string;

/**
 * Type definition for an edge in the graph.
 * Represents a connection between two houses with an associated cost.
 */
type Edge = {
    u: number; // House 1 (smaller index, for consistent sorting)
    v: number; // House 2 (larger index, for consistent sorting)
    cost: number;
};

// Read N (number of houses) and M (number of connectable pairs)
const [N, M] = readline().split(' ').map(Number);

// Store all potential edges
const edges: Edge[] = [];

for (let i = 0; i < M; i++) {
    const [h1_input, h2_input, cost] = readline().split(' ').map(Number);
    
    // Normalize edge representation: ensure the first house index (u) is always less than or equal to the second (v).
    // This helps in consistent sorting of output edges later, as output requires House1 then House2.
    const u = Math.min(h1_input, h2_input);
    const v = Math.max(h1_input, h2_input);
    
    edges.push({ u, v, cost });
}

// --- Kruskal's Algorithm Implementation ---

// 1. Sort all edges by their cost in non-decreasing order.
edges.sort((a, b) => a.cost - b.cost);

// 2. Initialize Disjoint Set Union (DSU) data structure.
// DSU is used to keep track of connected components and efficiently check if adding an edge creates a cycle.
// Houses are 1-indexed (from 1 to N), so arrays are sized N+1.
const parent: number[] = Array(N + 1).fill(0).map((_, i) => i); // parent[i] stores the parent of house i
const rank: number[] = Array(N + 1).fill(0); // rank[i] stores the rank (approximate height) of the tree rooted at i for union by rank optimization

/**
 * Finds the representative (root) of the set containing element `i`.
 * Implements path compression for optimization: flattens the tree by making every node point directly to the root.
 * @param i The element to find the root for.
 * @returns The root of the set containing `i`.
 */
function find(i: number): number {
    if (parent[i] === i) {
        return i; // `i` is the root of its own set
    }
    // Path compression: set parent[i] directly to the root
    parent[i] = find(parent[i]);
    return parent[i];
}

/**
 * Merges the sets containing elements `i` and `j`.
 * Implements union by rank for optimization: attaches the tree with smaller rank under the root of the tree with larger rank.
 * @param i An element in the first set.
 * @param j An element in the second set.
 */
function union(i: number, j: number): void {
    const rootI = find(i);
    const rootJ = find(j);

    // If they are not already in the same set, unite them
    if (rootI !== rootJ) {
        if (rank[rootI] < rank[rootJ]) {
            parent[rootI] = rootJ;
        } else if (rank[rootI] > rank[rootJ]) {
            parent[rootJ] = rootI;
        } else {
            // If ranks are equal, pick one as root and increment its rank
            parent[rootJ] = rootI;
            rank[rootI]++;
        }
    }
}

// 3. Build the Minimum Spanning Tree (MST)
let totalCost = 0;
let connectionsMade = 0;
const mstEdges: Edge[] = [];

// A spanning tree for N vertices (where N >= 1) has N-1 edges.
// The problem constraints state 1 <= N <= 5000, so N-1 is always valid.
const targetConnections = N - 1; 

// Iterate through the sorted edges
for (const edge of edges) {
    // Optimization: If we've already found N-1 edges, the MST is complete.
    // This is because we sort edges by cost, so any remaining edges would only increase the total cost.
    if (connectionsMade === targetConnections) {
        break;
    }

    const rootU = find(edge.u);
    const rootV = find(edge.v);

    // If connecting these two houses does not form a cycle (i.e., they are in different connected components)
    if (rootU !== rootV) {
        union(rootU, rootV); // Merge their components
        totalCost += edge.cost; // Add cost to total MST cost
        mstEdges.push(edge); // Add edge to our list of selected MST connections
        connectionsMade++; // Increment the count of connections made
    }
}

// --- Output Results ---

// First line: K (number of connections) and C (total cost)
console.log(`${connectionsMade} ${totalCost}`);

// Next K lines: the connections themselves, sorted numerically (on House1, then on House2)
// The mstEdges array already contains edges where u <= v due to preprocessing (Math.min/Math.max).
// We sort them again to meet the specific output order requirement:
// first by the 'u' (House1) value, and then by the 'v' (House2) value if 'u' values are equal.
mstEdges.sort((a, b) => {
    if (a.u !== b.u) {
        return a.u - b.u;
    }
    return a.v - b.v;
});

for (const edge of mstEdges) {
    console.log(`${edge.u} ${edge.v} ${edge.cost}`);
}