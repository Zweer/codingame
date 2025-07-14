/**
 * Reads a line from standard input (provided by CodinGame environment).
 * This declaration is needed for TypeScript compilation in CodinGame.
 */
declare function readline(): string;

function solve() {
    // Read the number of dominoes
    const N: number = parseInt(readline());

    // degrees[i] stores the count of times number i appears on domino ends.
    // This represents the degree of vertex i in our graph.
    // Max value for domino numbers is 6, so array size 7 covers 0-6.
    const degrees: number[] = new Array(7).fill(0);

    // Adjacency list to represent the graph for connectivity check.
    // graph[i] will store an array of numbers that i is connected to.
    const graph: number[][] = new Array(7).fill(0).map(() => []);

    // Keep track of all unique numbers that appear on dominoes.
    // These are the vertices that actually exist in our graph.
    const distinctNodes = new Set<number>();

    // Read and process each domino
    for (let i = 0; i < N; i++) {
        const [A, B] = readline().split(' ').map(Number);
        
        // Increment degrees for both ends of the domino
        degrees[A]++;
        degrees[B]++;

        // Add edges to the adjacency list (undirected graph)
        graph[A].push(B);
        graph[B].push(A);
        
        // Add A and B to the set of distinct nodes
        distinctNodes.add(A);
        distinctNodes.add(B);
    }

    // --- Connectivity Check (using BFS) ---
    // An Eulerian path only exists if all relevant vertices are in a single connected component.
    // 'Relevant vertices' are those that appear on at least one domino (i.e., in distinctNodes).

    let startNode: number = -1;
    // Find a starting node for BFS. Since N >= 2, there will always be at least one distinct node.
    // We can pick any node from distinctNodes.
    if (distinctNodes.size > 0) {
        startNode = distinctNodes.values().next().value;
    }
    
    // visited array to keep track of visited nodes during BFS.
    const visited: boolean[] = new Array(7).fill(false);
    // Queue for BFS traversal.
    const queue: number[] = [];
    // Count of distinct nodes visited during BFS.
    let visitedCount = 0; 

    // Perform BFS if there are any dominoes (which is guaranteed by N >= 2)
    if (startNode !== -1) {
        queue.push(startNode);
        visited[startNode] = true;
        visitedCount++;

        while (queue.length > 0) {
            const u = queue.shift()!; // Dequeue a node
            
            // Visit all neighbors of the current node
            for (const v of graph[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    visitedCount++;
                    queue.push(v); // Enqueue unvisited neighbor
                }
            }
        }
    }

    // If the number of visited distinct nodes is not equal to the total number of distinct nodes,
    // it means the graph is not connected (for the relevant vertices).
    if (visitedCount !== distinctNodes.size) {
        console.log("false");
        return;
    }

    // --- Odd Degree Vertices Check ---
    // An Eulerian path exists if there are 0 or 2 vertices with odd degrees.
    let oddDegreeCount = 0;
    for (let i = 0; i <= 6; i++) {
        if (degrees[i] % 2 !== 0) { // Check if degree is odd
            oddDegreeCount++;
        }
    }

    // Based on Eulerian path conditions:
    // - If oddDegreeCount is 0, an Eulerian circuit exists (which is also a path).
    // - If oddDegreeCount is 2, an Eulerian path exists (starting and ending at the two odd-degree vertices).
    // - Any other count (must be an even number like 4 or 6) means no Eulerian path.
    if (oddDegreeCount === 0 || oddDegreeCount === 2) {
        console.log("true");
    } else {
        console.log("false");
    }
}

// Call the solve function to run the logic
solve();