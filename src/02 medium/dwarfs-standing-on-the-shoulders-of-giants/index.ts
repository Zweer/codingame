// Read N, the number of influence relationships.
const N: number = parseInt(readline());

// Adjacency list to represent the directed graph.
// Key: The influencer (X)
// Value: An array of people influenced by X (Y)
const adj: Map<number, number[]> = new Map();

// A set to store all unique people encountered in the input relationships.
// This is necessary to ensure we iterate through all possible starting points for influence chains.
const allPeople: Set<number> = new Set();

// Read N lines of influence relationships.
for (let i = 0; i < N; i++) {
    const inputs: string[] = readline().split(' ');
    const X: number = parseInt(inputs[0]); // X influences Y
    const Y: number = parseInt(inputs[1]);

    // Initialize the adjacency list for X if it doesn't exist
    if (!adj.has(X)) {
        adj.set(X, []);
    }
    // Add Y to the list of people influenced by X
    adj.get(X)!.push(Y);

    // Add both X and Y to the set of all unique people
    allPeople.add(X);
    allPeople.add(Y);
}

// Memoization table to store the computed longest chain length for each person.
// Key: A person's ID
// Value: The length of the longest influence chain starting from that person.
const memo: Map<number, number> = new Map();

/**
 * Depth-First Search (DFS) function to calculate the length of the longest influence chain
 * starting from a given person 'u'.
 *
 * This function uses memoization to avoid redundant computations, which is crucial for
 * performance in a graph traversal problem like this. Since the graph is a DAG, this
 * approach correctly computes the longest path.
 *
 * @param u The ID of the person for whom to calculate the longest chain.
 * @returns The length of the longest influence chain starting from person 'u'.
 */
function dfs(u: number): number {
    // If the longest chain for 'u' has already been computed, return the memoized value.
    if (memo.has(u)) {
        return memo.get(u)!;
    }

    // Base case: If 'u' does not influence anyone (no outgoing edges),
    // the longest chain starting from 'u' is just 'u' itself, which has a length of 1.
    if (!adj.has(u) || adj.get(u)!.length === 0) {
        memo.set(u, 1);
        return 1;
    }

    let maxLengthFromSuccessors = 0;
    // Recursive step: For each person 'v' that 'u' influences,
    // find the longest chain starting from 'v' and take the maximum among them.
    for (const v of adj.get(u)!) {
        maxLengthFromSuccessors = Math.max(maxLengthFromSuccessors, dfs(v));
    }

    // The longest chain starting from 'u' is 1 (for 'u' itself)
    // plus the longest chain found among its direct successors.
    const currentLength = 1 + maxLengthFromSuccessors;
    memo.set(u, currentLength); // Memoize the result
    return currentLength;
}

let overallLongestChain = 0;

// Iterate through all unique people identified from the input relationships.
// For each person, calculate the longest chain starting from them using DFS.
// The overall longest chain will be the maximum value found across all these calculations.
// This handles disconnected components of the graph correctly.
for (const person of allPeople) {
    overallLongestChain = Math.max(overallLongestChain, dfs(person));
}

// Output the final result: the number of people involved in the longest succession of influences.
console.log(overallLongestChain);