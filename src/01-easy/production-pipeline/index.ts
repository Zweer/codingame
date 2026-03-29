// The 'readline()' function is provided by the CodinGame platform.
// For local testing, you might need to mock it.
// Example mock for local testing:
// let _input: string[] = [];
// let _inputIndex: number = 0;
// function readline(): string {
//     if (_inputIndex < _input.length) {
//         return _input[_inputIndex++];
//     }
//     return ''; // Or throw an error
// }
// _input = [
//     "8",
//     "3",
//     "2<5",
//     "3<4",
//     "5<4"
// ];

// N: the number of processes
const N: number = parseInt(readline());
// K: the number of constraints
const K: number = parseInt(readline());

// Graph representation: Adjacency list and in-degrees
// adj: Map from process (node) to a Set of processes it must run before (neighbors).
// Using a Set prevents duplicate edges from being added if a constraint is listed multiple times.
const adj = new Map<number, Set<number>>();
// inDegree: Array to store the count of incoming edges for each process.
// Using 1-based indexing for processes, so the array size is N+1.
const inDegree = new Array(N + 1).fill(0);

// Initialize the adjacency map with all processes (1 to N).
// This ensures that even processes with no constraints are part of the graph structure.
for (let i = 1; i <= N; i++) {
    adj.set(i, new Set());
}

// Read constraints and build the graph (populate adj and inDegree)
for (let i = 0; i < K; i++) {
    const constraint: string = readline();
    const parts = constraint.split('<');
    const p1 = parseInt(parts[0]);
    const p2 = parseInt(parts[1]);

    // Add edge p1 -> p2.
    // Only add if the edge doesn't already exist to prevent double-counting in-degree.
    if (!adj.get(p1)!.has(p2)) {
        adj.get(p1)!.add(p2);
        inDegree[p2]++; // Increment in-degree of p2
    }
}

// Priority Queue (simulated using a standard array and sort).
// This queue will store processes that are ready to be executed (i.e., their in-degree is 0).
// We sort it to satisfy the rule: "In case the order of two processes doesn't matter, use the smaller process first."
const readyProcesses: number[] = [];

// Initialize the queue with all processes that currently have an in-degree of 0.
for (let i = 1; i <= N; i++) {
    if (inDegree[i] === 0) {
        readyProcesses.push(i);
    }
}
// Sort the initial set of ready processes to ensure the smallest ones are processed first.
readyProcesses.sort((a, b) => a - b);

// result: Array to store the final topological order of processes.
const result: number[] = [];

// Perform Kahn's algorithm (BFS-based topological sort)
while (readyProcesses.length > 0) {
    // Get the smallest process from the front of the sorted queue.
    // 'shift()' removes the first element and returns it.
    const currentProcess = readyProcesses.shift()!;
    result.push(currentProcess); // Add it to our sorted result.

    // For each process 'nextProcess' that 'currentProcess' must run before:
    for (const nextProcess of adj.get(currentProcess)!) {
        inDegree[nextProcess]--; // Decrement the in-degree of 'nextProcess'.

        // If 'nextProcess' now has an in-degree of 0, all its prerequisites are met.
        // It is now ready to be executed.
        if (inDegree[nextProcess] === 0) {
            readyProcesses.push(nextProcess); // Add it to the queue of ready processes.
            // Re-sort the queue to maintain the "smaller process first" rule.
            // For N <= 250, this repeated sorting operation is efficient enough.
            readyProcesses.sort((a, b) => a - b);
        }
    }
}

// Check for cycles in the graph.
// If the length of the result array is less than N, it means not all processes could be ordered,
// indicating a cycle in the dependency graph (an invalid state).
if (result.length === N) {
    console.log(result.join(' ')); // Output the space-separated valid order.
} else {
    console.log('INVALID'); // Output INVALID if no valid order exists.
}