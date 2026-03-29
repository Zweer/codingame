// The readline() and print() functions are provided by the CodinGame environment.
// For local testing, you might need to mock them or use a library like 'readline-sync'.
// declare function readline(): string;
// declare function print(s: any): void;

function solvePuzzle() {
    // Read the number of actions
    const N: number = parseInt(readline());

    // Store actions in their original input order for tie-breaking.
    // The index in this array serves as the tie-breaking priority.
    const actions: string[] = [];
    // Map action names to their original input index for quick lookup.
    const actionToIndex = new Map<string, number>();

    // Adjacency list representation of the dependency graph.
    // graph.get(actionA) will contain a set of actions that actionA must precede.
    const graph = new Map<string, Set<string>>();
    // Stores the number of prerequisites (incoming edges) for each action.
    // An action can be performed when its inDegree is 0.
    const inDegrees = new Map<string, number>();

    // Read actions and initialize graph and inDegrees.
    for (let i = 0; i < N; i++) {
        const action = readline();
        actions.push(action);
        actionToIndex.set(action, i);
        graph.set(action, new Set<string>()); // Initialize with an empty set of dependents.
        inDegrees.set(action, 0); // All actions initially have 0 prerequisites.
    }

    // Read the number of precedence rules.
    const nbOrders: number = parseInt(readline());

    // Process each precedence rule.
    for (let i = 0; i < nbOrders; i++) {
        const line = readline();
        const parts = line.split(' ');
        const a1 = parts[0];
        const precedenceType = parts[1]; // "before" or "after"
        const a2 = parts[2];

        if (precedenceType === "before") {
            // If a1 must be done before a2, it means there's a directed dependency from a1 to a2 (a1 -> a2).
            // Add a2 to the set of actions that a1 precedes.
            graph.get(a1)!.add(a2);
            // Increment the in-degree of a2, as it now has a1 as a prerequisite.
            inDegrees.set(a2, inDegrees.get(a2)! + 1);
        } else { // precedenceType === "after"
            // If a1 must be done after a2, it means a2 must be done before a1.
            // So, add a1 to the set of actions that a2 precedes (a2 -> a1).
            graph.get(a2)!.add(a1);
            // Increment the in-degree of a1, as it now has a2 as a prerequisite.
            inDegrees.set(a1, inDegrees.get(a1)! + 1);
        }
    }

    // This array will store the final chronological order of actions.
    const result: string[] = [];
    // This array acts as our "ready queue". It stores actions that have no outstanding
    // prerequisites and are thus ready to be performed. It's kept sorted to handle tie-breaking.
    const readyQueue: string[] = [];

    // Initialize the readyQueue with all actions that initially have no prerequisites.
    // Iterate through 'actions' array to ensure actions are added to the readyQueue
    // based on their original input order, which helps in the initial sort for tie-breaking.
    for (const action of actions) {
        if (inDegrees.get(action)! === 0) {
            readyQueue.push(action);
        }
    }

    // Sort the initial readyQueue based on the original input order.
    // This ensures that if multiple actions are ready at the start, the one that appeared
    // earliest in the input is processed first, respecting the tie-breaking rule.
    readyQueue.sort((a, b) => actionToIndex.get(a)! - actionToIndex.get(b)!);

    // Perform the topological sort using a modified Kahn's algorithm.
    while (readyQueue.length > 0) {
        // Get the next action to perform. shift() removes the first element,
        // which is the "highest priority" due to the ongoing sorting.
        const currentAction = readyQueue.shift()!;
        result.push(currentAction);

        // For each action that 'currentAction' precedes (i.e., its direct dependents):
        for (const dependentAction of graph.get(currentAction)!) {
            // Decrement the in-degree of the dependent action. One of its prerequisites
            // (currentAction) has now been satisfied.
            inDegrees.set(dependentAction, inDegrees.get(dependentAction)! - 1);

            // If a dependent action's in-degree becomes 0, it means all its prerequisites are met.
            // It is now ready to be performed.
            if (inDegrees.get(dependentAction)! === 0) {
                readyQueue.push(dependentAction);
                // Re-sort the entire readyQueue to maintain the tie-breaking order.
                // Given N < 10, this O(N log N) sort operation for each step is efficient enough.
                readyQueue.sort((a, b) => actionToIndex.get(a)! - actionToIndex.get(b)!);
            }
        }
    }

    // Print the actions in their chronological order.
    for (const action of result) {
        print(action);
    }
}

solvePuzzle();