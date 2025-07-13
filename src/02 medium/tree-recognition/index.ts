// Define Node class for the Binary Search Tree
class Node {
    value: number;
    left: Node | null;
    right: Node | null;

    constructor(value: number) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// Define BST class to encapsulate tree operations
class BST {
    root: Node | null;

    constructor() {
        this.root = null;
    }

    /**
     * Inserts a new value into the Binary Search Tree.
     * The puzzle states that values within a list are unique,
     * so no handling for duplicate values is necessary.
     *
     * @param value The integer value to be inserted.
     */
    insert(value: number): void {
        const newNode = new Node(value);

        // If the tree is empty, the new node becomes the root
        if (this.root === null) {
            this.root = newNode;
            return;
        }

        // Traverse the tree to find the correct insertion point
        let currentNode: Node = this.root;
        while (true) {
            if (value < currentNode.value) {
                // Go left if the new value is smaller
                if (currentNode.left === null) {
                    currentNode.left = newNode; // Insert here
                    return;
                }
                currentNode = currentNode.left; // Continue traversing left
            } else {
                // Go right if the new value is larger (since values are unique)
                if (currentNode.right === null) {
                    currentNode.right = newNode; // Insert here
                    return;
                }
                currentNode = currentNode.right; // Continue traversing right
            }
        }
    }

    /**
     * Generates a canonical string representation of the tree's structural shape (topology).
     * This representation is independent of the actual node values.
     * It uses a pre-order like traversal, marking null children with 'N' and enclosing
     * node structures (current node + its children) with parentheses.
     *
     * Example:
     * - A single node tree (root with no children): (NN)
     * - A node with only a left child (which is a leaf): ((NN)N)
     * - A node with only a right child (which is a leaf): (N(NN))
     *
     * @returns A string uniquely representing the shape of the tree.
     */
    getShape(): string {
        return this._getShapeRecursive(this.root);
    }

    /**
     * Recursive helper function for getShape().
     *
     * @param node The current node being processed.
     * @returns A string representing the shape of the subtree rooted at `node`.
     */
    private _getShapeRecursive(node: Node | null): string {
        // Base case: If the node is null, return 'N' to mark an empty branch.
        if (node === null) {
            return "N";
        }
        // Recursive step: Concatenate the shape of the left and right subtrees,
        // and wrap them in parentheses to indicate the presence of the current node.
        // This ensures the structural representation is canonical.
        return `(${this._getShapeRecursive(node.left)}${this._getShapeRecursive(node.right)})`;
    }
}

// Main function to solve the Tree Recognition puzzle
function solve() {
    // Read the first line which contains N (number of lists) and K (nodes per list).
    const firstLine = readline().split(' ').map(Number);
    const n = firstLine[0]; // Number of tree diagrams to compare.
    // const k = firstLine[1]; // K is not directly used after this, but implicitly defines the number of elements in subsequent lines.

    // A Set is used to store unique shape strings.
    // Its size at the end will be the number of distinct tree shapes.
    const distinctShapes = new Set<string>();

    // Process each of the N input lists to build trees and get their shapes.
    for (let i = 0; i < n; i++) {
        // Read the current list of K integer values.
        const values = readline().split(' ').map(Number);

        // Create a new BST for the current list of values.
        const bst = new BST();
        for (const value of values) {
            bst.insert(value);
        }

        // Get the canonical shape string for the newly built tree
        // and add it to the set of distinct shapes.
        distinctShapes.add(bst.getShape());
    }

    // Print the total number of distinct tree shapes found.
    print(distinctShapes.size);
}

// Call the solve function to start the program execution.
solve();