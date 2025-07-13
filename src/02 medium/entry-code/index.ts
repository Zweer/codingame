import * as readline from 'readline';

// Function to read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    solve();
});

function solve() {
    const x = parseInt(inputLines[0]); // Number of available digits (k)
    const n = parseInt(inputLines[1]); // Length of the entry code (n)

    // Special case: If n=1, all codes are single digits (0, 1, ..., x-1).
    // The shortest sequence is just 012...(x-1).
    // This is a trivial De Bruijn sequence B(x, 1), which has length x^1 + 1 - 1 = x.
    // e.g., x=3, n=1 -> "012"
    if (n === 1) {
        let result = "";
        for (let i = 0; i < x; i++) {
            result += i.toString();
        }
        console.log(result);
        return;
    }

    // De Bruijn sequence construction using recursive Hierholzer's algorithm.
    // Nodes are (n-1)-digit strings. Each edge represents appending a digit.
    // To ensure the numerically smallest sequence, we always prioritize the smallest digit (0, then 1, etc.).

    // adj: Map from a node string (e.g., "00") to an array of available next digits (e.g., ["0", "1"]).
    // The arrays will be mutated (using `shift()`) to track visited edges.
    const adj: Map<string, string[]> = new Map();

    // Helper function to generate all possible (n-1)-digit strings
    // and initialize their outgoing edges (digits 0 to x-1, sorted).
    function generateNodes(currentPrefix: string, targetLength: number) {
        if (currentPrefix.length === targetLength) {
            const outgoingDigits: string[] = [];
            for (let i = 0; i < x; i++) {
                outgoingDigits.push(i.toString());
            }
            adj.set(currentPrefix, outgoingDigits);
            return;
        }
        for (let i = 0; i < x; i++) {
            generateNodes(currentPrefix + i.toString(), targetLength);
        }
    }

    // Initialize all possible (n-1)-digit nodes and their outgoing edges
    generateNodes("", n - 1);

    // finalDigits: Stores the sequence of appended digits.
    // This array will be built in reverse order by the Hierholzer's algorithm.
    const finalDigits: string[] = [];

    // Recursive DFS function to find the Eulerian path
    function dfs(u: string) {
        const outgoing = adj.get(u)!; // Get the list of available outgoing digits for node u

        // While there are unused outgoing edges from u
        while (outgoing.length > 0) {
            const digit = outgoing.shift()!; // Take the smallest available digit and remove it (marking the edge as used)
            const v = u.substring(1) + digit; // Form the next node by shifting digits and appending the new one
            dfs(v); // Recursively explore from the next node
            finalDigits.push(digit); // Add the digit to the sequence AFTER the recursive call returns (backtracking)
        }
    }

    // Start the DFS from the "00...0" node.
    // This ensures the initial prefix of the sequence is lexicographically smallest.
    const startNode = "0".repeat(n - 1);
    dfs(startNode);

    // The `finalDigits` array is built in reverse order by this Hierholzer variant.
    // Reverse it to get the correct sequence order.
    // The final De Bruijn sequence starts with the `n-1` digits of the `startNode`,
    // followed by the `x^n` appended digits.
    const result = startNode + finalDigits.reverse().join('');
    console.log(result);
}