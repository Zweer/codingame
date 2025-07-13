// Standard input/output for CodinGame
declare const readline: () => string;
declare const print: (message: any) => void;

/**
 * Represents a node in the Binary Search Tree.
 */
class TreeNode {
    value: number;
    x: number;
    y: number;
    left: TreeNode | null;
    right: TreeNode | null;

    constructor(value: number, x: number, y: number) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.left = null;
        this.right = null;
    }
}

// Global variables to store puzzle input and state.
// Using global variables is common in competitive programming for convenience.
let width: number;
let height: number;
let n: number;
let bombs: Set<string>; // Stores bomb coordinates as "x,y" strings for quick lookup
let goals: Set<string>; // Stores goal coordinates as "x,y" strings for quick lookup
let solution: number[] | null = null; // Stores the first found sequence of numbers

/**
 * Recursive backtracking function to find a valid sequence of numbers that
 * builds a BST reaching all goals without hitting bombs or invalid positions.
 *
 * @param root The current root node of the Binary Search Tree. Null if the tree is empty.
 * @param occupiedCoords A set of "x,y" strings representing all coordinates currently occupied by tree nodes.
 * @param unreachedGoals A set of "x,y" strings representing goals that have not yet been reached.
 * @param usedNumbers A set of numbers (1 to n) that have already been placed in the tree.
 * @param currentSequence The ordered list of numbers added to the tree so far.
 * @returns True if a solution is found from this state (or a deeper state), false otherwise.
 */
function solve(
    root: TreeNode | null,
    occupiedCoords: Set<string>,
    unreachedGoals: Set<string>,
    usedNumbers: Set<number>,
    currentSequence: number[]
): boolean {
    // Base Case 1: All goals have been reached.
    // If this condition is met, we have found a valid solution.
    if (unreachedGoals.size === 0) {
        // Store a copy of the current sequence as the solution and return true.
        solution = currentSequence.slice();
        return true;
    }

    // Iterate through all possible numbers from 1 to 'n' to try adding next.
    // The order of trying numbers might influence which solution is found first,
    // but not whether a solution exists.
    for (let k = 1; k <= n; k++) {
        // Skip numbers that have already been used in the current tree construction path.
        if (usedNumbers.has(k)) {
            continue;
        }

        // --- Step 1: Determine potential placement coordinates for 'k' ---
        let parentNode: TreeNode | null = null; // To keep track of 'k's parent in the BST
        let isLeftChild: boolean = false;        // True if 'k' would be a left child, false for right
        let nextX: number;
        let nextY: number;

        if (!root) {
            // If the tree is currently empty, 'k' will become the root.
            nextX = Math.floor((width - 1) / 2); // Root's X-coordinate
            nextY = 0;                           // Root's Y-coordinate
        } else {
            // If the tree is not empty, traverse it to find the correct insertion point for 'k'.
            let current = root;
            while (true) {
                parentNode = current; // Keep track of the current node as the potential parent for 'k'

                if (k < current.value) {
                    // 'k' should go into the left subtree.
                    nextX = current.x - 1;
                    nextY = current.y + 1;
                    if (current.left) {
                        current = current.left; // Continue traversal down the left child.
                    } else {
                        isLeftChild = true;
                        break; // Found an empty left child slot, this is where 'k' will be placed.
                    }
                } else if (k > current.value) {
                    // 'k' should go into the right subtree.
                    nextX = current.x + 1;
                    nextY = current.y + 1;
                    if (current.right) {
                        current = current.right; // Continue traversal down the right child.
                    } else {
                        isLeftChild = false;
                        break; // Found an empty right child slot, this is where 'k' will be placed.
                    }
                } else {
                    // This case indicates 'k' is equal to an existing node's value.
                    // BSTs typically contain distinct values. This should be caught by usedNumbers.has(k)
                    // but included for robustness.
                    continue; // Skip this number 'k' as it cannot be placed.
                }
            }
        }

        const posStr = `${nextX},${nextY}`; // Convert coordinates to a string for set lookups.

        // --- Step 2: Validate the potential placement ---
        // 2.1 Check for out-of-bounds placement.
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            continue; // Invalid placement, try next 'k'.
        }
        // 2.2 Check if the position is already occupied by another node.
        // This is a losing condition according to problem rules.
        if (occupiedCoords.has(posStr)) {
            continue; // Invalid placement, try next 'k'.
        }
        // 2.3 Check if the position is a bomb.
        if (bombs.has(posStr)) {
            continue; // Invalid placement, try next 'k'.
        }

        // --- Step 3: Make the move (place 'k' into the tree and update state) ---

        // Create a new TreeNode for 'k' with its calculated coordinates.
        const newNode = new TreeNode(k, nextX, nextY);

        // Add the new node to the BST structure.
        let newRoot = root; // 'newRoot' reference will only change if this is the very first node.
        if (!root) {
            newRoot = newNode; // 'k' becomes the new root of the tree.
        } else {
            // Attach 'newNode' as a child to its determined 'parentNode'.
            if (isLeftChild) {
                parentNode!.left = newNode;
            } else {
                parentNode!.right = newNode;
            }
        }

        // Update global state tracking sets and the current sequence of numbers.
        occupiedCoords.add(posStr);
        usedNumbers.add(k);
        currentSequence.push(k);

        // Check if a goal was reached by placing this node.
        const wasGoalReached = unreachedGoals.has(posStr);
        if (wasGoalReached) {
            unreachedGoals.delete(posStr); // If yes, remove it from the unreached goals.
        }

        // --- Step 4: Recursive call for the next step ---
        // If a solution is found in a deeper call (returns true), propagate true upwards.
        if (solve(newRoot, occupiedCoords, unreachedGoals, usedNumbers, currentSequence)) {
            return true;
        }

        // --- Step 5: Backtrack (Undo the move) ---
        // If the recursive call above returned false, this path did not lead to a solution.
        // Restore the state to what it was before placing 'k'.

        occupiedCoords.delete(posStr); // Remove coordinates from occupied set.
        usedNumbers.delete(k);         // Mark the number as unused again.
        currentSequence.pop();          // Remove the number from the current sequence.

        // If a goal was reached in this step, add it back to unreachedGoals.
        if (wasGoalReached) {
            unreachedGoals.add(posStr);
        }

        // Detach the node from the tree structure (crucial for backtracking).
        if (root) { // Only if the tree was not empty initially (i.e., not the first node)
            if (isLeftChild) {
                parentNode!.left = null; // Disconnect the left child.
            } else {
                parentNode!.right = null; // Disconnect the right child.
            }
        }
        // If root was null, `newNode` was set to `newRoot`. No explicit detachment needed,
        // as `root` remains null in the next iteration of the loop for the initial call.
    }

    // If the loop finishes, it means no valid number could be added from this state
    // that leads to a solution. Return false.
    return false;
}

// Main execution block: handles input reading and initiates the search.
function main() {
    // Read the first line of input: width, height, n, bombsCount, goalsCount.
    const inputs = readline().split(' ').map(Number);
    width = inputs[0];
    height = inputs[1];
    n = inputs[2];
    const bombsCount = inputs[3];
    const goalsCount = inputs[4];

    // Read bomb coordinates.
    bombs = new Set<string>();
    for (let i = 0; i < bombsCount; i++) {
        const [x, y] = readline().split(' ').map(Number);
        bombs.add(`${x},${y}`);
    }

    // Read goal coordinates.
    goals = new Set<string>();
    for (let i = 0; i < goalsCount; i++) {
        const [x, y] = readline().split(' ').map(Number);
        goals.add(`${x},${y}`);
    }

    // Start the backtracking search.
    // Initial call: empty tree (root=null), no coordinates occupied, all goals unreached,
    // no numbers used, and an empty sequence.
    solve(null, new Set<string>(), new Set<string>(goals), new Set<number>(), []);

    // Output the found solution.
    if (solution) {
        solution.forEach(num => print(num));
    } else {
        // This line should ideally not be reached if the puzzle is always solvable.
        // It's a fallback for debugging or if no solution truly exists within constraints.
        print("No solution found.");
    }
}

// Call the main function to begin program execution.
main();