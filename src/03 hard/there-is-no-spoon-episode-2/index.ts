// Define readline and print for local development if not running in CodinGame environment directly
// In CodinGame's environment, these are globally available.
declare function readline(): string;
declare function print(message: string): void;

/**
 * Represents a node (island) in the Hashi puzzle.
 */
class Node {
    x: number;
    y: number;
    value: number; // The required number of links for this node
    
    constructor(x: number, y: number, value: number) {
        this.x = x;
        this.y = y;
        this.value = value;
    }
}

/**
 * Type alias for a coordinate point.
 */
type Point = { x: number; y: number };

/**
 * Type alias for a placed link, including its endpoints and the amount (1 or 2).
 */
type Link = { n1: Point; n2: Point; amount: number };

/**
 * Represents the current state of the board, used for backtracking.
 */
class CurrentBoardState {
    width: number;
    height: number;
    nodesGrid: (Node | null)[][]; // 2D grid storing Node objects or null for empty cells
    allNodes: Node[]; // Flat list of all Node objects on the board

    links: Link[]; // List of links that have been placed in this specific state

    // Dynamic state that changes during the search, needs to be copied for backtracking:
    adj: Map<Node, Map<Node, number>>; // Adjacency map: Node -> Neighbor Node -> current number of links between them
    availableLinks: Map<Node, Map<Node, number>>; // Node -> Neighbor Node -> links still possible (1 or 2)
    nodeCurrentLinkCount: Map<Node, number>; // Current total links connected to each node

    // 2D boolean array to track cells occupied by existing links.
    // Used to efficiently check the "links must not cross any other links or nodes" rule.
    isCellBlockedForCrossing: boolean[][];

    /**
     * Initializes a new CurrentBoardState from the initial grid values.
     * @param initialGridValues A 2D array of numbers (node values) or null (empty cells).
     * @param width The width of the grid.
     * @param height The height of the grid.
     */
    constructor(initialGridValues: (number | null)[][], width: number, height: number) {
        this.width = width;
        this.height = height;
        this.nodesGrid = Array(height).fill(0).map(() => Array(width).fill(null));
        this.allNodes = [];
        this.links = [];
        this.adj = new Map();
        this.availableLinks = new Map();
        this.nodeCurrentLinkCount = new Map();
        this.isCellBlockedForCrossing = Array(height).fill(0).map(() => Array(width).fill(false));

        // Initialize Node objects and populate grid/list
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = initialGridValues[y][x];
                if (value !== null) {
                    const node = new Node(x, y, value);
                    this.nodesGrid[y][x] = node;
                    this.allNodes.push(node);
                    this.nodeCurrentLinkCount.set(node, 0); // Initialize current links to 0
                    this.adj.set(node, new Map()); // Initialize adjacency map for node
                    this.availableLinks.set(node, new Map()); // Initialize available links map for node
                }
            }
        }

        // Pre-calculate direct neighbors and set initial available links to 2 for each valid pair.
        // We only need to check right and down from each node to cover all unique horizontal and vertical pairs.
        for (const node of this.allNodes) {
            // Check right
            for (let x = node.x + 1; x < width; x++) {
                const neighborNode = this.nodesGrid[node.y][x];
                if (neighborNode) {
                    this.availableLinks.get(node)!.set(neighborNode, 2);
                    this.availableLinks.get(neighborNode)!.set(node, 2); // Symmetrical update for the neighbor
                    break; // Stop at the first node found in this direction
                }
            }
            // Check down
            for (let y = node.y + 1; y < height; y++) {
                const neighborNode = this.nodesGrid[y][node.x];
                if (neighborNode) {
                    this.availableLinks.get(node)!.set(neighborNode, 2);
                    this.availableLinks.get(neighborNode)!.set(node, 2); // Symmetrical update for the neighbor
                    break; // Stop at the first node found in this direction
                }
            }
        }
    }

    /**
     * Creates a deep copy of the current board state. This is essential for backtracking
     * to explore different branches without modifying previous states.
     * @returns A new `CurrentBoardState` object that is a deep copy.
     */
    clone(): CurrentBoardState {
        // Create a new board state with the same dimensions
        const newState = new CurrentBoardState(
            Array(this.height).fill(0).map(() => Array(this.width).fill(null)), 
            this.width, 
            this.height
        );
        
        // Map old Node objects to their new cloned counterparts to maintain correct references in the new state.
        const oldToNewNodeMap = new Map<Node, Node>();
        for (const oldNode of this.allNodes) {
            const newNode = new Node(oldNode.x, oldNode.y, oldNode.value);
            newState.nodesGrid[newNode.y][newNode.x] = newNode;
            newState.allNodes.push(newNode);
            oldToNewNodeMap.set(oldNode, newNode);
        }

        // Copy dynamic state (adjacency, available links, current link counts) using the new Node instances as keys.
        newState.adj = new Map();
        newState.availableLinks = new Map();
        newState.nodeCurrentLinkCount = new Map();

        for (const oldNode of this.allNodes) {
            const newNode = oldToNewNodeMap.get(oldNode)!;
            newState.nodeCurrentLinkCount.set(newNode, this.nodeCurrentLinkCount.get(oldNode)!);
            
            newState.adj.set(newNode, new Map());
            for (const [oldNeighbor, count] of this.adj.get(oldNode)!) {
                newState.adj.get(newNode)!.set(oldToNewNodeMap.get(oldNeighbor)!, count);
            }

            newState.availableLinks.set(newNode, new Map());
            for (const [oldNeighbor, count] of this.availableLinks.get(oldNode)!) {
                newState.availableLinks.get(newNode)!.set(oldToNewNodeMap.get(oldNeighbor)!, count);
            }
        }
        
        // Copy the list of placed links (Link objects are simple and don't need deep cloning).
        newState.links = [...this.links];

        // Copy the blocked cells state.
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newState.isCellBlockedForCrossing[y][x] = this.isCellBlockedForCrossing[y][x];
            }
        }

        return newState;
    }

    /**
     * Attempts to add a link between two nodes. Performs validity checks before adding.
     * @param n1 The first node.
     * @param n2 The second node.
     * @param amount The number of links to add (1 or 2).
     * @returns True if the link was successfully added, false if it's an invalid move.
     */
    addLink(n1: Node, n2: Node, amount: number): boolean {
        // 1. Check if adding links would exceed node capacity
        if (this.nodeCurrentLinkCount.get(n1)! + amount > n1.value ||
            this.nodeCurrentLinkCount.get(n2)! + amount > n2.value) {
            return false;
        }
        // 2. Check if there are enough available slots for links between n1 and n2
        if (this.availableLinks.get(n1)!.get(n2) === undefined || this.availableLinks.get(n1)!.get(n2)! < amount) {
            return false;
        }

        // 3. Check if the new link would cross an existing link.
        if (this.isCrossingBlocked(n1, n2)) {
            return false;
        }

        // All checks passed, place the link:
        this.links.push({ n1: {x: n1.x, y: n1.y}, n2: {x: n2.x, y: n2.y}, amount });

        // Update link counts for involved nodes
        this.nodeCurrentLinkCount.set(n1, this.nodeCurrentLinkCount.get(n1)! + amount);
        this.nodeCurrentLinkCount.set(n2, this.nodeCurrentLinkCount.get(n2)! + amount);

        // Update adjacency matrix (links between nodes)
        this.adj.get(n1)!.set(n2, (this.adj.get(n1)!.get(n2) || 0) + amount);
        this.adj.get(n2)!.set(n1, (this.adj.get(n2)!.get(n1) || 0) + amount);

        // Decrease available link slots between n1 and n2
        this.availableLinks.get(n1)!.set(n2, this.availableLinks.get(n1)!.get(n2)! - amount);
        this.availableLinks.get(n2)!.set(n1, this.availableLinks.get(n2)!.get(n1)! - amount);

        // Mark cells along the new link as blocked for future crossing checks
        this.markBlockedCells(n1, n2);
        
        return true;
    }

    /**
     * Checks if placing a new link between n1 and n2 would cross any already placed link.
     * It iterates through all cells between n1 and n2 and checks if any are marked as blocked.
     * @param n1 The first node.
     * @param n2 The second node.
     * @returns True if a crossing is detected, false otherwise.
     */
    isCrossingBlocked(n1: Node, n2: Node): boolean {
        if (n1.x === n2.x) { // Vertical link
            const min = Math.min(n1.y, n2.y);
            const max = Math.max(n1.y, n2.y);
            for (let y = min + 1; y < max; y++) {
                if (this.isCellBlockedForCrossing[y][n1.x]) {
                    return true;
                }
            }
        } else if (n1.y === n2.y) { // Horizontal link
            const min = Math.min(n1.x, n2.x);
            const max = Math.max(n1.x, n2.x);
            for (let x = min + 1; x < max; x++) {
                if (this.isCellBlockedForCrossing[n1.y][x]) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Marks all cells along the path of the new link as blocked to prevent future crossings.
     * @param n1 The first node of the link.
     * @param n2 The second node of the link.
     */
    markBlockedCells(n1: Node, n2: Node): void {
        if (n1.x === n2.x) { // Vertical link
            const min = Math.min(n1.y, n2.y);
            const max = Math.max(n1.y, n2.y);
            for (let y = min + 1; y < max; y++) {
                this.isCellBlockedForCrossing[y][n1.x] = true;
            }
        } else if (n1.y === n2.y) { // Horizontal link
            const min = Math.min(n1.x, n2.x);
            const max = Math.max(n1.x, n2.x);
            for (let x = min + 1; x < max; x++) {
                this.isCellBlockedForCrossing[n1.y][x] = true;
            }
        }
    }

    /**
     * Checks if all nodes have reached their required number of links.
     * @returns True if all nodes are satisfied, false otherwise.
     */
    isAllNodesSatisfied(): boolean {
        for (const node of this.allNodes) {
            if (this.nodeCurrentLinkCount.get(node)! !== node.value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if all nodes in the graph are connected into a single component using BFS.
     * @returns True if all nodes are connected, false otherwise.
     */
    isConnected(): boolean {
        if (this.allNodes.length === 0) return true; // No nodes, trivially connected

        const visited = new Set<Node>();
        const queue: Node[] = [this.allNodes[0]]; // Start BFS from the first node in the list
        visited.add(this.allNodes[0]);

        let head = 0;
        while (head < queue.length) {
            const currentNode = queue[head++];
            const neighborsMap = this.adj.get(currentNode);
            if (neighborsMap) {
                for (const [neighbor, count] of neighborsMap) {
                    // If there's at least one link between current and neighbor, and neighbor not yet visited
                    if (count > 0 && !visited.has(neighbor)) { 
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }
        return visited.size === this.allNodes.length; // True if all nodes were reached
    }
}

let solutionFound = false; // Global flag to stop the search once a solution is found and printed.

/**
 * Solves the Hashi puzzle using a backtracking search algorithm with constraint propagation.
 * @param board The current state of the game board.
 * @returns True if a solution is found from this state (or its sub-branches), false otherwise.
 */
function solve(board: CurrentBoardState): boolean {
    if (solutionFound) return true; // Stop searching if a solution has already been found in another branch

    // --- Constraint Propagation Loop ---
    // Repeatedly apply forced moves and prune impossible branches until no more changes can be made.
    let changed = true;
    while (changed) {
        changed = false;

        for (const node of board.allNodes) {
            const needed = node.value - board.nodeCurrentLinkCount.get(node)!;
            
            // Pruning 1: If a node already has too many links, this path is invalid.
            if (needed < 0) return false;

            let maxPossibleFromNode = 0; // Maximum links that can be placed from this node to its neighbors
            const activeNeighbors: [Node, number][] = []; // Neighbors with > 0 available links
            
            // Collect info about potential connections
            for (const [neighbor, available] of board.availableLinks.get(node)!) {
                maxPossibleFromNode += available;
                if (available > 0) {
                    activeNeighbors.push([neighbor, available]);
                }
            }
            
            // Pruning 2: If a node needs more links than physically possible from its neighbors, this path is invalid.
            if (needed > maxPossibleFromNode) {
                return false;
            }

            // --- Forced Moves ---

            // Forced Move 1: If a node is fully satisfied, it cannot accept more links.
            if (board.nodeCurrentLinkCount.get(node)! === node.value) {
                for (const [neighbor, available] of board.availableLinks.get(node)!) {
                    if (available > 0) {
                        board.availableLinks.get(node)!.set(neighbor, 0);
                        board.availableLinks.get(neighbor)!.set(node, 0); // Symmetrical update
                        changed = true;
                    }
                }
            }

            // Forced Move 2: If a node needs exactly `maxPossibleFromNode` links, then all available links to its neighbors must be used.
            // Example: Node A needs 3 links. Neighbors: B (1 available), C (2 available). Max possible = 3.
            // In this case, Node A must take 1 link from B and 2 links from C.
            if (needed === maxPossibleFromNode && needed > 0) { // Also ensures `needed` is not 0 (node already satisfied)
                for (const [neighbor, available] of activeNeighbors) {
                    if (available > 0) {
                        const amountToAdd = available; // Must use all available links to this neighbor
                        if (!board.addLink(node, neighbor, amountToAdd)) {
                            return false; // This forced move led to an invalid state, so this branch is bad
                        }
                        changed = true;
                    }
                }
            }
            
            // Forced Move 3: If a node needs `needed` links and has only one neighbor with available links.
            // All `needed` links must go to this single neighbor (if that neighbor can accept them).
            if (activeNeighbors.length === 1) {
                const [neighbor, availableToNeighbor] = activeNeighbors[0];
                if (needed <= availableToNeighbor) { 
                    const amountToAdd = needed;
                    if (!board.addLink(node, neighbor, amountToAdd)) {
                        return false; // Forced move led to an invalid state
                    }
                    changed = true;
                } else {
                    return false; // The single neighbor cannot satisfy the node's needs
                }
            }
        }
    }

    // --- Base Cases (after propagation) ---
    // Check if a solution is found for the current board state.
    if (board.isAllNodesSatisfied()) {
        if (board.isConnected()) {
            solutionFound = true; // Mark global flag to stop other branches
            // Print the solution links to standard output
            for (const link of board.links) {
                print(`${link.n1.x} ${link.n1.y} ${link.n2.x} ${link.n2.y} ${link.amount}`);
            }
            return true; // Solution found!
        } else {
            return false; // All nodes satisfied but not connected, so this path is invalid
        }
    }

    // --- Select Next Move (Heuristic) ---
    // If the board is not yet solved, pick the "most constrained" unsatisfied node.
    // This is typically a node that needs more links but has the fewest `currentOptions` (sum of available links to its neighbors).
    // This heuristic helps reduce the branching factor.
    let bestNode: Node | null = null;
    let minAvailableOptions = Infinity; 

    for (const node of board.allNodes) {
        if (board.nodeCurrentLinkCount.get(node)! < node.value) { // Only consider unsatisfied nodes
            let currentOptions = 0; 
            for (const [_, available] of board.availableLinks.get(node)!) {
                currentOptions += available; // Sum of potential links from this node to all its neighbors
            }
            
            // Prioritize nodes that have available options but are more restricted (fewer options)
            if (currentOptions > 0 && currentOptions < minAvailableOptions) {
                minAvailableOptions = currentOptions;
                bestNode = node;
            }
        }
    }

    // If no unsatisfied node with options is found, but the board is not solved, it means this is a dead end.
    if (!bestNode) {
        return false;
    }

    // --- Recursive Step: Try branching on the selected node's possible moves ---
    // Get a list of neighbors for the bestNode that still have available link slots.
    const neighborsForBestNode: Node[] = [];
    for (const [neighbor, available] of board.availableLinks.get(bestNode)!) {
        if (available > 0) {
            neighborsForBestNode.push(neighbor);
        }
    }

    // Sort neighbors for deterministic (and potentially faster) branching behavior.
    // Sorting by coordinates (x then y) is a common choice.
    neighborsForBestNode.sort((a, b) => a.x - b.x || a.y - b.y);

    for (const neighbor of neighborsForBestNode) {
        // Option 1: Try placing 2 links between bestNode and neighbor (if possible)
        if (board.availableLinks.get(bestNode)!.get(neighbor)! >= 2) {
            const newState = board.clone(); // Create a new state for this branch
            // Get the cloned nodes that correspond to `bestNode` and `neighbor` in the `newState`
            const clonedBestNode = newState.nodesGrid[bestNode.y][bestNode.x]!;
            const clonedNeighbor = newState.nodesGrid[neighbor.y][neighbor.x]!;
            
            if (newState.addLink(clonedBestNode, clonedNeighbor, 2)) {
                if (solve(newState)) { // Recurse with the new state
                    return true; // Solution found in this branch
                }
            }
        }

        // Option 2: Try placing 1 link between bestNode and neighbor (if possible).
        // This is tried regardless of whether 2 links were possible, to explore all valid paths.
        if (board.availableLinks.get(bestNode)!.get(neighbor)! >= 1) {
            const newState = board.clone(); // Create a new state for this branch
            const clonedBestNode = newState.nodesGrid[bestNode.y][bestNode.x]!;
            const clonedNeighbor = newState.nodesGrid[neighbor.y][neighbor.x]!;
            
            if (newState.addLink(clonedBestNode, clonedNeighbor, 1)) {
                if (solve(newState)) { // Recurse with the new state
                    return true; // Solution found in this branch
                }
            }
        }
    }

    return false; // No solution found from any branch stemming from this state
}


// --- Main Program Execution ---

// Read grid dimensions
const width: number = parseInt(readline());
const height: number = parseInt(readline());

// Parse the initial grid input from standard input
const initialGridValues: (number | null)[][] = Array(height).fill(0).map(() => Array(width).fill(null));
for (let i = 0; i < height; i++) {
    const line: string = readline();
    for (let j = 0; j < width; j++) {
        const char = line[j];
        if (char !== '.') {
            initialGridValues[i][j] = parseInt(char); // Convert '1'-'8' chars to numbers
        }
    }
}

// Create the initial board state
const initialBoard = new CurrentBoardState(initialGridValues, width, height);

// Start the solver. The solution will be printed directly by the `solve` function if found.
solve(initialBoard);