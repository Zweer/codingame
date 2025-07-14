// Define a TrieNode class
class TrieNode {
    // A map to store children nodes, where the key is the digit (string)
    // and the value is the TrieNode corresponding to that digit.
    children: Map<string, TrieNode>;

    constructor() {
        this.children = new Map<string, TrieNode>();
    }
}

// CodinGame provides a global `readline()` function for input.
// We declare it here to satisfy TypeScript's type checking.
declare function readline(): string;

function solve() {
    // Read the number of telephone numbers.
    const N: number = parseInt(readline());

    // Initialize the root of the Trie. It doesn't represent any digit itself.
    let root: TrieNode = new TrieNode();
    // Initialize the counter for the total number of elements stored.
    let totalElements: number = 0;

    // Process each telephone number.
    for (let i = 0; i < N; i++) {
        const phoneNumber: string = readline();
        // Start traversal from the root for each new phone number.
        let currentNode: TrieNode = root;

        // Iterate through each digit of the phone number.
        for (const digit of phoneNumber) {
            // Check if the current digit already has a corresponding child node
            // from the current node's children.
            if (!currentNode.children.has(digit)) {
                // If not, a new element (node) needs to be created.
                const newNode = new TrieNode();
                currentNode.children.set(digit, newNode);
                // Increment the total elements count.
                totalElements++;
            }
            // Move to the child node that corresponds to the current digit.
            // We use the non-null assertion operator (!) because we've just
            // ensured that the child node exists (either it already did, or we just created it).
            currentNode = currentNode.children.get(digit)!;
        }
    }

    // Print the final total number of elements.
    console.log(totalElements);
}

// Call the solve function to execute the program.
solve();