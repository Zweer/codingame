// Global variables to store D, B, and the leaf scores for access within the recursive function.
let D_global: number;
let B_global: number;
let leafScores_global: number[];
let visitedNodes = 0; // Counter for visited tree nodes

/**
 * Calculates the value of a node in the game tree using Minimax with Alpha-Beta Pruning.
 *
 * @param depth The current depth of the node in the game tree (0 for root).
 * @param startIndex The starting index in the global leafScores_global array for the leaves belonging to this subtree.
 * @param alpha The alpha value for alpha-beta pruning.
 * @param beta The beta value for alpha-beta pruning.
 * @param maximizingPlayer True if it's the maximizing player's turn, false if it's the minimizing player's turn.
 * @returns The minimax value of the current node.
 */
function minimax(depth: number, startIndex: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
    visitedNodes++; // Increment visited nodes for each function call

    // Base Case: If we are at a leaf node (depth D_global)
    // A leaf node's value is directly from leafScores_global.
    // The startIndex given to a leaf node should directly point to its score.
    if (depth === D_global) {
        return leafScores_global[startIndex];
    }

    // Calculate the number of leaves in the subtree rooted at each child.
    // Each child is at depth (depth + 1). The total game depth is D_global.
    // So, the subtree below a child has a remaining depth of (D_global - (depth + 1)).
    // The number of leaves in such a subtree is B_global raised to that power.
    const leavesPerChildSubtree = Math.pow(B_global, D_global - (depth + 1));

    if (maximizingPlayer) {
        let value = -Infinity; // Maximizing player wants to find the highest value
        for (let i = 0; i < B_global; i++) {
            // Calculate the starting index in leafScores_global for the i-th child's subtree.
            // Moves are examined in left-to-right order.
            const childStartIndex = startIndex + i * leavesPerChildSubtree;

            // Recursively call for children. The current player is maximizing,
            // so the next player (child node) is minimizing.
            value = Math.max(value, minimax(depth + 1, childStartIndex, alpha, beta, false));
            alpha = Math.max(alpha, value); // Update alpha after considering child's value

            // Alpha-Beta Pruning: If alpha becomes greater than or equal to beta,
            // it means the current maximizing player has found a move that guarantees
            // a value at least 'alpha'. The minimizing player at a parent node
            // already has an option that guarantees a value of 'beta' (which is <= alpha).
            // Thus, the minimizing player would never allow play to reach this state,
            // so we can stop exploring further siblings of the current node.
            if (alpha >= beta) {
                break; // Cutoff
            }
        }
        return value;
    } else { // Minimizing Player
        let value = Infinity; // Minimizing player wants to find the lowest value
        for (let i = 0; i < B_global; i++) {
            // Calculate the starting index in leafScores_global for the i-th child's subtree.
            // Moves are examined in left-to-right order.
            const childStartIndex = startIndex + i * leavesPerChildSubtree;

            // Recursively call for children. The current player is minimizing,
            // so the next player (child node) is maximizing.
            value = Math.min(value, minimax(depth + 1, childStartIndex, alpha, beta, true));
            beta = Math.min(beta, value); // Update beta after considering child's value

            // Alpha-Beta Pruning: If beta becomes less than or equal to alpha,
            // it means the current minimizing player has found a move that guarantees
            // a value at most 'beta'. The maximizing player at a parent node
            // already has an option that guarantees a value of 'alpha' (which is >= beta).
            // Thus, the maximizing player would never allow play to reach this state,
            // so we can stop exploring further siblings of the current node.
            if (beta <= alpha) {
                break; // Cutoff
            }
        }
        return value;
    }
}

// --- Main execution ---

// Read D and B from the first line of input
const line1 = readline().split(' ');
D_global = parseInt(line1[0]);
B_global = parseInt(line1[1]);

// Read leaf scores from the second line of input
leafScores_global = readline().split(' ').map(Number);

// Start the Minimax algorithm from the root node (depth 0, starting index 0).
// The first player is maximizing. Initial alpha is -Infinity, beta is +Infinity.
const bestScore = minimax(0, 0, -Infinity, Infinity, true);

// Output the best score and the number of visited nodes, space-separated.
console.log(bestScore, visitedNodes);