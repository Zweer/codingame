// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Implements the Edmonds-Karp algorithm for finding maximum flow in a flow network.
 * This is used here to solve the maximum bipartite matching problem.
 */
class FlowGraph {
    numNodes: number;
    adj: number[][]; // Adjacency list for the graph
    capacity: number[][]; // Capacity matrix for edges

    /**
     * Initializes a new FlowGraph.
     * @param numNodes The total number of nodes in the flow network (including source and sink).
     */
    constructor(numNodes: number) {
        this.numNodes = numNodes;
        this.adj = Array(numNodes).fill(0).map(() => []);
        // Initialize capacity matrix with zeros. Each cell capacity[u][v] stores capacity from u to v.
        this.capacity = Array(numNodes).fill(0).map(() => Array(numNodes).fill(0));
    }

    /**
     * Adds an edge to the graph with a specified capacity.
     * For residual graph, a reverse edge is also added with initial capacity 0.
     * @param u The starting node of the edge.
     * @param v The ending node of the edge.
     * @param cap The capacity of the edge.
     */
    addEdge(u: number, v: number, cap: number) {
        this.adj[u].push(v);
        this.adj[v].push(u); // Add reverse edge for residual graph
        this.capacity[u][v] += cap; // Add capacity (handles parallel edges if they were a concern)
    }

    /**
     * Computes the maximum flow from source (s) to sink (t) using Edmonds-Karp.
     * @param s The source node.
     * @param t The sink node.
     * @returns The total maximum flow.
     */
    maxFlow(s: number, t: number): number {
        let totalFlow = 0;
        // parent array to reconstruct the augmenting path found by BFS
        let parent: number[] = Array(this.numNodes).fill(-1);

        // While there is an augmenting path from source to sink
        while (this.bfs(s, t, parent)) {
            // Find the minimum capacity along the found path (bottleneck capacity)
            let pathFlow = Infinity;
            for (let v = t; v !== s; v = parent[v]) {
                pathFlow = Math.min(pathFlow, this.capacity[parent[v]][v]);
            }

            // Update capacities of edges along the path and their reverse edges
            for (let v = t; v !== s; v = parent[v]) {
                this.capacity[parent[v]][v] -= pathFlow; // Reduce forward capacity
                this.capacity[v][parent[v]] += pathFlow; // Increase reverse capacity (for potential backflow)
            }
            totalFlow += pathFlow; // Add path flow to the total flow
        }
        return totalFlow;
    }

    /**
     * Performs a Breadth-First Search to find an augmenting path from source (s) to sink (t).
     * Populates the parent array to reconstruct the path.
     * @param s The source node.
     * @param t The sink node.
     * @param parent The array to store parent pointers for path reconstruction.
     * @returns True if a path is found, false otherwise.
     */
    bfs(s: number, t: number, parent: number[]): boolean {
        parent.fill(-1); // Reset parent array for current BFS
        
        // Optimized queue implementation using an array and two pointers
        let queue: number[] = new Array(this.numNodes); // Pre-allocate max possible size
        let head = 0; // Pointer to the front of the queue
        let tail = 0; // Pointer to the back of the queue

        queue[tail++] = s; // Enqueue source node
        parent[s] = s; // Mark source as visited (by setting its parent to itself)

        while (head < tail) {
            let u = queue[head++]; // Dequeue node u
            
            // Explore all neighbors of u
            for (let v of this.adj[u]) {
                // If neighbor v is not visited (-1) and there is residual capacity from u to v
                if (parent[v] === -1 && this.capacity[u][v] > 0) {
                    parent[v] = u; // Set u as the parent of v
                    queue[tail++] = v; // Enqueue v
                    if (v === t) {
                        // If sink is reached, an augmenting path is found
                        return true;
                    }
                }
            }
        }
        return false; // No path found from source to sink
    }
}

// Main logic for the Harmless Rooks puzzle
function solve() {
    const N: number = parseInt(readline()); // Read board size N
    const board: string[][] = [];
    for (let i = 0; i < N; i++) {
        board.push(readline().split('')); // Read each row of the board
    }

    // Interface to define a segment (continuous block of free squares)
    interface Segment {
        r1: number; // start row
        c1: number; // start column
        r2: number; // end row
        c2: number; // end column
    }

    const horizontalSegments: Segment[] = [];
    const verticalSegments: Segment[] = [];

    // --- Step 1: Find all horizontal segments ---
    for (let r = 0; r < N; r++) {
        let inSegment = false;
        let segmentStartC = -1;
        for (let c = 0; c < N; c++) {
            if (board[r][c] === '.') {
                if (!inSegment) {
                    segmentStartC = c; // Start of a new segment
                    inSegment = true;
                }
            } else { // board[r][c] === 'X'
                if (inSegment) {
                    // Current segment ends before this 'X'
                    horizontalSegments.push({ r1: r, c1: segmentStartC, r2: r, c2: c - 1 });
                    inSegment = false;
                }
            }
        }
        // After iterating through the row, if a segment was open, it extends to the end of the row
        if (inSegment) {
            horizontalSegments.push({ r1: r, c1: segmentStartC, r2: r, c2: N - 1 });
        }
    }

    // --- Step 2: Find all vertical segments ---
    for (let c = 0; c < N; c++) {
        let inSegment = false;
        let segmentStartR = -1;
        for (let r = 0; r < N; r++) {
            if (board[r][c] === '.') {
                if (!inSegment) {
                    segmentStartR = r; // Start of a new segment
                    inSegment = true;
                }
            } else { // board[r][c] === 'X'
                if (inSegment) {
                    // Current segment ends before this 'X'
                    verticalSegments.push({ r1: segmentStartR, c1: c, r2: r - 1, c2: c });
                    inSegment = false;
                }
            }
        }
        // After iterating through the column, if a segment was open, it extends to the end of the column
        if (inSegment) {
            verticalSegments.push({ r1: segmentStartR, c1: c, r2: N - 1, c2: c });
        }
    }

    // --- Step 3: Prepare the flow network for maximum bipartite matching ---
    const numH = horizontalSegments.length;
    const numV = verticalSegments.length;
    
    // Node indexing:
    // Source: 0
    // Horizontal segments: 1 to numH (H_i is node i+1)
    // Vertical segments: numH + 1 to numH + numV (V_j is node numH + j + 1)
    // Sink: numH + numV + 1
    const source = 0;
    const sink = numH + numV + 1;
    const totalGraphNodes = numH + numV + 2; 

    const graph = new FlowGraph(totalGraphNodes);

    // Add edges from source to each horizontal segment node (capacity 1)
    for (let i = 0; i < numH; i++) {
        graph.addEdge(source, i + 1, 1);
    }

    // Add edges from each vertical segment node to sink (capacity 1)
    for (let j = 0; j < numV; j++) {
        graph.addEdge(numH + j + 1, sink, 1);
    }

    // Add edges between intersecting horizontal and vertical segments (capacity 1)
    for (let i = 0; i < numH; i++) {
        const hSeg = horizontalSegments[i];
        for (let j = 0; j < numV; j++) {
            const vSeg = verticalSegments[j];

            // Check if hSeg and vSeg intersect at a free square:
            // The row of the horizontal segment (hSeg.r1) must fall within the row range of the vertical segment.
            // The column of the vertical segment (vSeg.c1) must fall within the column range of the horizontal segment.
            if (hSeg.r1 >= vSeg.r1 && hSeg.r1 <= vSeg.r2 && 
                vSeg.c1 >= hSeg.c1 && vSeg.c1 <= hSeg.c2) {
                // If they intersect, add an edge from the horizontal segment node to the vertical segment node.
                // The intersection point (hSeg.r1, vSeg.c1) is guaranteed to be a '.' because segments are only formed by '.' squares.
                graph.addEdge(i + 1, numH + j + 1, 1);
            }
        }
    }

    // --- Step 4: Calculate Max Flow ---
    // The maximum flow in this specially constructed flow network represents the maximum bipartite matching,
    // which corresponds to the maximum number of rooks that can be placed according to the rules.
    print(graph.maxFlow(source, sink));
}

// Execute the solve function
solve();