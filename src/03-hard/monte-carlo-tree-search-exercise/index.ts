// Define the Node class for the MCTS tree
class Node {
    scoreSum: number;
    visits: number;
    children: Map<string, Node>; // Maps a move (character) to the next Node

    constructor() {
        this.scoreSum = 0;
        this.visits = 0;
        this.children = new Map();
    }
}

/**
 * Calculates the UCB1 value for a child node.
 * Formula: M.s/M.v + C*sqrt(ln(N.v)/M.v)
 * @param parentNodeVisits N.v (visits of the parent node)
 * @param childScoreSum M.s (sum of scores for the child node)
 * @param childVisits M.v (visits of the child node)
 * @param C The exploration constant
 * @returns The calculated UCB1 value
 */
function calculateUCB1(parentNodeVisits: number, childScoreSum: number, childVisits: number, C: number): number {
    // As per the puzzle description, childVisits will always be > 0 for existing children.
    // parentNodeVisits will also be >= 1 after the first playout, ensuring Math.log is valid.

    const exploitationTerm = childScoreSum / childVisits;
    // Math.log() in JavaScript is the natural logarithm (ln)
    const explorationTerm = C * Math.sqrt(Math.log(parentNodeVisits) / childVisits);

    return exploitationTerm + explorationTerm;
}

/**
 * Solves the Monte Carlo Tree Search puzzle.
 * Reads input, builds the tree, performs UCB1 selection, and prints the result.
 */
function solve() {
    // Read the first line: N (number of playouts) and C (exploration constant)
    const firstLine = readline().split(' ');
    const N = parseInt(firstLine[0]);
    const C = parseFloat(firstLine[1]);

    // Initialize the root of the MCTS tree
    const root = new Node();

    // Step 1: Build the MCTS tree from the given playouts
    for (let i = 0; i < N; i++) {
        const playoutLine = readline().split(' ');
        const sequence = playoutLine[0];
        const score = parseFloat(playoutLine[1]);

        let currentNode = root;
        // Traverse the path defined by the sequence of moves
        for (const move of sequence) {
            // Update the statistics (visits and scoreSum) for the current node
            // as the playout passes through it.
            currentNode.visits++;
            currentNode.scoreSum += score;

            // If the child node for the current move does not exist, create it.
            if (!currentNode.children.has(move)) {
                currentNode.children.set(move, new Node());
            }
            // Move to the child node for the next iteration
            currentNode = currentNode.children.get(move)!;
        }
        // After the loop, currentNode is the final node in the sequence.
        // Update its statistics as well.
        currentNode.visits++;
        currentNode.scoreSum += score;
    }

    // Step 2: Perform UCB1 selection to find the optimal path
    let currentPath = ''; // Stores the chosen sequence of moves
    let currentNode = root; // Start selection from the root node

    while (true) {
        // Stopping Condition 1: If the current node has no children, it's a true leaf.
        // No further moves can be made from this state.
        if (currentNode.children.size === 0) {
            break;
        }

        // Stopping Condition 2: Custom condition based on the example explanation.
        // "As there are no further nodes in MCTS tree along that paths, the 1-move sequence 'a' is the answer."
        // This implies that if a node has been visited only once, and it leads to only one child
        // which itself has been visited only once, then this path is considered "fully determined"
        // by the given playouts and no further branching decisions are made using UCB1.
        if (currentNode.visits === 1 && currentNode.children.size === 1) {
            const onlyChildNode = currentNode.children.values().next().value as Node;
            if (onlyChildNode.visits === 1) {
                break; // Stop selection, as the path is considered determined.
            }
        }

        let bestUCB1Value = -Infinity;
        let bestMove: string | null = null;

        // Get all possible moves (children keys) from the current node and sort them.
        // This is crucial for tie-breaking: smaller letter should be chosen.
        const sortedMoves = Array.from(currentNode.children.keys()).sort();

        // Iterate through sorted children to find the best move based on UCB1
        for (const move of sortedMoves) {
            const childNode = currentNode.children.get(move)!;
            const ucb1Value = calculateUCB1(currentNode.visits, childNode.scoreSum, childNode.visits, C);

            // Select the child with the highest UCB1 value.
            // If values are equal, the one earlier in `sortedMoves` (alphabetically smaller)
            // will be picked due to the `>` comparison operator.
            if (ucb1Value > bestUCB1Value) {
                bestUCB1Value = ucb1Value;
                bestMove = move;
            }
        }

        // If no best move was found (shouldn't happen if children.size > 0), break.
        if (bestMove === null) {
            break;
        }

        // Append the chosen move to the path and move to the next node
        currentPath += bestMove;
        currentNode = currentNode.children.get(bestMove)!;
    }

    // Print the final chosen sequence of movements
    console.log(currentPath);
}

// Call the solve function to execute the puzzle logic.
// In a CodinGame environment, `readline()` and `console.log()` are typically available globally.
solve();