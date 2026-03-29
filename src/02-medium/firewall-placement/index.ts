// The `readline()` function is provided by the CodinGame environment.
// It reads a line of input from stdin.
// declare function readline(): string;

/**
 * Solves the Firewall Placement puzzle.
 *
 * The goal is to find a single node to place a firewall such that the
 * number of nodes infected by a virus (starting at a given location)
 * is minimized. The firewall cannot be placed on the virus's starting node.
 * The virus cannot traverse the firewall node.
 */
function solve() {
    // Read the number of nodes in the network
    const numNodes: number = parseInt(readline());
    // Read the starting location of the virus
    const virusLocation: number = parseInt(readline());
    // Read the number of links in the network
    const numLinks: number = parseInt(readline());

    // Initialize an adjacency list to represent the network graph.
    // Each element adj[i] will be an array of nodes connected to node i.
    const adj: number[][] = new Array(numNodes).fill(0).map(() => []);

    // Read all links and build the adjacency list.
    // The links are undirected, so add connections in both directions.
    for (let i = 0; i < numLinks; i++) {
        const link: number[] = readline().split(' ').map(Number);
        const n1: number = link[0];
        const n2: number = link[1];
        adj[n1].push(n2);
        adj[n2].push(n1);
    }

    // Variables to store the best result found so far.
    // minInfectedNodes is initialized to a value larger than any possible node count,
    // ensuring the first valid firewall candidate will set this value.
    let minInfectedNodes: number = numNodes + 1;
    // optimalFirewallLocation will store the index of the node where the firewall should be placed.
    // Initialized to -1, indicating no solution found yet (though one will always be found).
    let optimalFirewallLocation: number = -1;

    // Iterate through every possible node to consider it as a firewall location.
    for (let firewallCandidate = 0; firewallCandidate < numNodes; firewallCandidate++) {
        // As per the problem statement, a firewall cannot be placed on the infected node (virus's starting location).
        if (firewallCandidate === virusLocation) {
            continue; // Skip this candidate and move to the next.
        }

        let infectedCount = 0; // Counter for nodes infected by the virus for this candidate firewall.
        // 'visited' array to keep track of nodes reached during the BFS traversal.
        // It's re-initialized for each new firewall candidate.
        const visited: boolean[] = new Array(numNodes).fill(false);
        // Queue for Breadth-First Search (BFS).
        // Using a standard array and a 'head' pointer for efficient queue operations
        // (avoids the O(N) cost of `Array.prototype.shift()`).
        const queue: number[] = [];
        let head: number = 0; // Pointer to the front of the queue

        // Start BFS from the virus's initial location.
        // The virus location is always infected.
        queue.push(virusLocation);
        visited[virusLocation] = true;
        infectedCount++;

        // Perform BFS to find all reachable nodes given the current firewall candidate.
        while (head < queue.length) {
            const currentNode: number = queue[head++]; // Dequeue the current node (get element and advance head)

            // Iterate over all neighbors of the current node.
            for (const neighbor of adj[currentNode]) {
                // If the neighbor is the current firewall candidate, the virus cannot pass through it.
                // So, we skip this neighbor.
                if (neighbor === firewallCandidate) {
                    continue;
                }

                // If the neighbor has not been visited yet, it means the virus can spread to it.
                if (!visited[neighbor]) {
                    visited[neighbor] = true; // Mark as visited
                    infectedCount++;          // Increment the count of infected nodes
                    queue.push(neighbor);     // Enqueue the neighbor for further exploration
                }
            }
        }

        // After the BFS, 'infectedCount' holds the total number of nodes infected
        // with the current 'firewallCandidate' in place.
        // If this count is less than our current minimum, update the best solution.
        if (infectedCount < minInfectedNodes) {
            minInfectedNodes = infectedCount;
            optimalFirewallLocation = firewallCandidate;
        }
    }

    // Output the index of the node where the firewall should be placed for optimal protection.
    console.log(optimalFirewallLocation);
}

// Call the solve function to execute the game logic.
solve();