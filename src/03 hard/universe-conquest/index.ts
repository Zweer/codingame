// Standard input reading boilerplate for CodinGame (or mock for local testing)
// In CodinGame environment, `readline()` and `print()` are globally available.
declare function readline(): string;
declare function print(message: any): void;

// Define the Edge class for the graph
class Edge {
    to: number;
    capacity: number;
    flow: number;
    reverse: number; // Index of the reverse edge in adj[to]

    constructor(to: number, capacity: number, reverse: number) {
        this.to = to;
        this.capacity = capacity;
        this.flow = 0;
        this.reverse = reverse;
    }
}

// Dinic's Max Flow Algorithm
class Dinic {
    n: number; // Number of nodes in the graph
    adj: Edge[][]; // Adjacency list to store edges
    level: number[]; // Stores level of each node in the level graph (for BFS)
    ptr: number[]; // Pointers for DFS optimization (to avoid re-checking saturated edges)

    constructor(n: number) {
        this.n = n;
        this.adj = Array.from({ length: n }, () => []);
        this.level = new Array(n).fill(-1);
        this.ptr = new Array(n).fill(0);
    }

    // Adds a directed edge and its corresponding residual edge
    addEdge(u: number, v: number, capacity: number) {
        // Edge from u to v
        const uToV = new Edge(v, capacity, this.adj[v].length);
        // Residual edge from v to u (initial capacity 0, used for backflow)
        const vToU = new Edge(u, 0, this.adj[u].length);
        this.adj[u].push(uToV);
        this.adj[v].push(vToU);
    }

    // BFS to build the level graph for current residual graph
    bfs(s: number, t: number): boolean {
        this.level.fill(-1); // Reset all levels to -1 (unvisited)
        this.level[s] = 0; // Source node is at level 0
        const q: number[] = [s]; // Queue for BFS
        let head = 0;

        while (head < q.length) {
            const u = q[head++]; // Dequeue node u
            for (const edge of this.adj[u]) {
                // If edge has remaining capacity and its destination is unvisited
                if (edge.capacity - edge.flow > 0 && this.level[edge.to] === -1) {
                    this.level[edge.to] = this.level[u] + 1; // Assign level to destination
                    q.push(edge.to); // Enqueue destination
                }
            }
        }
        // Return true if the sink 't' is reachable (has a level assigned)
        return this.level[t] !== -1;
    }

    // DFS to find augmenting paths and push flow along them
    dfs(u: number, t: number, pushed: number): number {
        if (pushed === 0) return 0; // No flow to push
        if (u === t) return pushed; // Reached sink, return the amount of flow pushed to this point

        // Iterate through neighbors of u using ptr to optimize (start from where previous DFS left off)
        while (this.ptr[u] < this.adj[u].length) {
            const edge = this.adj[u][this.ptr[u]];

            // Check if edge is valid in the level graph and has remaining capacity
            if (this.level[u] + 1 !== this.level[edge.to] || edge.capacity - edge.flow === 0) {
                this.ptr[u]++; // Move to the next edge
                continue;
            }

            // Recursively call DFS to push flow
            const tr = this.dfs(edge.to, t, Math.min(pushed, edge.capacity - edge.flow));
            if (tr === 0) {
                this.ptr[u]++; // No flow pushed through this path, move to next edge
                continue;
            }

            // Update flow on forward and reverse edges
            edge.flow += tr;
            this.adj[edge.to][edge.reverse].flow -= tr; // Decrease flow on reverse edge (equivalent to increasing its residual capacity)
            return tr; // Return the amount of flow pushed
        }
        return 0; // No augmenting path found from u
    }

    // Main function to compute the maximum flow
    maxFlow(s: number, t: number): number {
        let totalFlow = 0;
        // Keep finding augmenting paths while sink is reachable in the level graph
        while (this.bfs(s, t)) {
            this.ptr.fill(0); // Reset pointers for each BFS phase
            // Push flow using DFS until no more blocking flow can be pushed in this phase
            while (true) {
                const pushed = this.dfs(s, t, Infinity); // Try to push infinite flow (will be limited by path capacity)
                if (pushed === 0) break; // No more flow can be pushed in current level graph
                totalFlow += pushed; // Add pushed flow to total
            }
        }
        return totalFlow; // The total maximum flow
    }
}


// --- Main Logic for Universe Conquest Puzzle ---

// Read P (number of planets) and H (number of hyperspace roads)
const [P_str, H_str] = readline().split(' ');
const P = parseInt(P_str);
const H = parseInt(H_str);

// Interface to store planet information
interface PlanetInfo {
    faction: string; // 'E' for Empire, 'R' for Republic
    ships: number; // Ships required to destroy army
}

// Store planet information. Using 0-indexed array for P planets.
// Planet 1 from input corresponds to planets[0], Planet 2 to planets[1], etc.
const planets: PlanetInfo[] = [];
for (let i = 0; i < P; i++) {
    const [A, S_str] = readline().split(' ');
    planets.push({ faction: A, ships: parseInt(S_str) });
}

// Define a sufficiently large number for "infinite" capacity edges.
// Max total ships = P * MaxS = 30 * 100 = 3000. So 4000 is safe.
const INF_CAPACITY = 4000; 

// Create a Dinic graph. Total nodes = Source (0) + P planets (1 to P) + Sink (P+1).
const dinic = new Dinic(P + 2);
const S_node = 0;       // Source node ID
const T_node = P + 1;   // Sink node ID

// Add edges from Source to Empire planets and from Republic planets to Sink.
// A planet at index 'i' in the 'planets' array corresponds to graph node 'i + 1'.
for (let i = 0; i < P; i++) {
    const planetNode = i + 1; // Graph node ID for this planet
    const planet = planets[i];

    if (planet.faction === 'E') {
        dinic.addEdge(S_node, planetNode, planet.ships);
    } else { // Faction is 'R'
        dinic.addEdge(planetNode, T_node, planet.ships);
    }
}

// Read hyperspace roads and add 'infinite' capacity edges for problematic ones.
for (let i = 0; i < H; i++) {
    const [P1_str, P2_str] = readline().split(' ');
    // Adjust 1-indexed input planet IDs to 0-indexed array indices
    const p1_idx = parseInt(P1_str) - 1; 
    const p2_idx = parseInt(P2_str) - 1;

    const planet1 = planets[p1_idx];
    const planet2 = planets[p2_idx];

    // If the road connects planets of different factions (E-R or R-E)
    if (planet1.faction !== planet2.faction) {
        // Add a directed edge from the Empire planet's node to the Republic planet's node.
        // This ensures that to "cut" this problematic road, we must pay for either the E-planet or the R-planet.
        // Node IDs are p1_idx + 1 and p2_idx + 1.
        if (planet1.faction === 'E' && planet2.faction === 'R') {
            dinic.addEdge(p1_idx + 1, p2_idx + 1, INF_CAPACITY);
        } else { // planet1.faction === 'R' && planet2.faction === 'E'
            dinic.addEdge(p2_idx + 1, p1_idx + 1, INF_CAPACITY);
        }
    }
}

// Calculate the maximum flow from S_node to T_node.
// By Max Flow - Min Cut theorem, this value is the minimum cost to cut all problematic roads.
const minShips = dinic.maxFlow(S_node, T_node);

// Output the result
print(minShips);