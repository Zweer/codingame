The problem asks us to simulate the construction of a binary decision tree for classifying beetle pupae based on their horn sizes and species IDs. The goal is to find the *original index* of the very last pupa chosen as a separator during this tree-building process.

Here's a breakdown of the approach:

1.  **Data Structure**: We'll define an interface `Pupa` to store the `originalIndex`, `hornSize`, and `speciesID` for each beetle pupa. The `originalIndex` is crucial for tie-breaking and for the final output.

    
4
0 1 1
1 2 1
2 3 2
3 4 2
```

1.  **Initial call**: `buildTree([P0(0,1,1), P1(1,2,1), P2(2,3,2), P3(3,4,2)])`.
    *   The group `S` has `Entropy(S) = 1.0` (two species, two of each).
    *   Evaluate all possible separators (P0, P1, P2, P3):
        *   P0 as separator: Left=[], Right=[P0,P1,P2,P3]. Weighted Entropy = 1.0.
        *   P1 as separator: Left=[P0], Right=[P1,P2,P3]. Weighted Entropy = 0.6885.
        *   P2 as separator: Left=[P0,P1], Right=[P2,P3]. Weighted Entropy = 0.0.
        *   P3 as separator: Left=[P0,P1,P2], Right=[P3]. Weighted Entropy = 0.6885.
    *   The `bestSeparator` is P2 (index 2) as it gives the minimum `Weighted Entropy` of 0.0.
    *   `lastSeparatorIndex` is updated to `2`.
    *   **Recursive Call 1 (Left Group)**: `buildTree([P0(0,1,1), P1(1,2,1)])`.
        *   `Entropy` for this group is 0 (both species 1).
        *   Base case met. Function returns. No further splits or `lastSeparatorIndex` updates here.
    *   **Recursive Call 2 (Right Group)**: `buildTree([P2(2,3,2), P3(3,4,2)])`.
        *   `Entropy` for this group is 0 (both species 2).
        *   Base case met. Function returns. No further splits or `lastSeparatorIndex` updates here.

2.  All recursive calls complete. The `lastSeparatorIndex` remains `2`.
3.  The program outputs `2`.

This logic correctly follows all problem requirements.

```typescript
/**
 * Represents a single beetle pupa with its original index, horn size, and species ID.
 */
interface Pupa {
    originalIndex: number;
    hornSize: number;
    speciesID: number;
}

// A global variable to store the index of the last chosen separator.
// This variable will be updated each time a split occurs, and due to the Depth-First Search (DFS)
// traversal order (left branch first, then right), its final value will be the index
// of the last separator on the rightmost path that underwent a split.
let lastSeparatorIndex: number = -1;

/**
 * Calculates the binary entropy for a given group of pupae.
 * Entropy H(S) = - sum(p_i * log2(p_i))
 * where p_i is the proportion of pupae of species i in the group S.
 * If p_i is 0, the term p_i * log2(p_i) is considered 0.
 * A group with 0 or 1 distinct species (or an empty group) has an entropy of 0.
 *
 * @param pupae The array of pupae in the group.
 * @returns The entropy of the group.
 */
function calculateEntropy(pupae: Pupa[]): number {
    if (pupae.length === 0) {
        return 0; // Empty group has 0 entropy.
    }

    const speciesCounts = new Map<number, number>();
    for (const pupa of pupae) {
        speciesCounts.set(pupa.speciesID, (speciesCounts.get(pupa.speciesID) || 0) + 1);
    }

    // If there's only one species (or no species, which is caught by pupae.length === 0)
    // in the group, it's pure, so entropy is 0.
    if (speciesCounts.size <= 1) {
        return 0;
    }

    let entropy = 0;
    const totalPupae = pupae.length;

    for (const count of speciesCounts.values()) {
        const p = count / totalPupae;
        // Avoid Math.log(0), as it results in -Infinity.
        // The term p * log2(p) is defined as 0 when p is 0.
        if (p > 0) {
            entropy -= p * (Math.log(p) / Math.log(2)); // log2(x) = log(x) / log(2)
        }
    }
    return entropy;
}

/**
 * Recursively builds the decision tree for a given group of pupae.
 * It identifies the best separator based on weighted entropy, updates the global
 * `lastSeparatorIndex`, and then recursively processes the resulting left and right subgroups.
 * The process stops when a group is pure (entropy is 0).
 *
 * @param currentGroup The current group of pupae to process.
 */
function buildTree(currentGroup: Pupa[]): void {
    // Base case: If the group is empty or already pure (entropy 0), stop branching.
    if (currentGroup.length === 0 || calculateEntropy(currentGroup) === 0) {
        return;
    }

    let bestSeparator: Pupa | null = null;
    let minWeightedEntropy = Infinity;
    let bestLeftGroup: Pupa[] = [];
    let bestRightGroup: Pupa[] = [];

    // Iterate through each pupa in the current group, considering it as a potential separator.
    for (const candidateSeparator of currentGroup) {
        const leftGroup: Pupa[] = [];
        const rightGroup: Pupa[] = [];

        // Split the current group into two subgroups based on the candidate separator's horn size:
        // - pupae with horn sizes strictly less than `candidateSeparator.hornSize` go to `leftGroup`.
        // - all other pupae (horn size >= `candidateSeparator.hornSize`) go to `rightGroup`.
        for (const pupa of currentGroup) {
            if (pupa.hornSize < candidateSeparator.hornSize) {
                leftGroup.push(pupa);
            } else {
                rightGroup.push(pupa);
            }
        }

        // Calculate the entropy for the two resulting subgroups.
        const entropyLeft = calculateEntropy(leftGroup);
        const entropyRight = calculateEntropy(rightGroup);

        // Calculate the weighted entropy for this particular split.
        // `currentGroup.length` will not be zero due to the base case check at the function start.
        const currentWeightedEntropy =
            (leftGroup.length / currentGroup.length) * entropyLeft +
            (rightGroup.length / currentGroup.length) * entropyRight;

        // Check if this split yields a new minimum weighted entropy.
        if (currentWeightedEntropy < minWeightedEntropy) {
            minWeightedEntropy = currentWeightedEntropy;
            bestSeparator = candidateSeparator;
            bestLeftGroup = leftGroup;
            bestRightGroup = rightGroup;
        } else if (currentWeightedEntropy === minWeightedEntropy) {
            // Tie-breaking rule: if entropies are equal, choose the pupa with a smaller original index.
            if (bestSeparator === null || candidateSeparator.originalIndex < bestSeparator.originalIndex) {
                minWeightedEntropy = currentWeightedEntropy;
                bestSeparator = candidateSeparator;
                bestLeftGroup = leftGroup;
                bestRightGroup = rightGroup;
            }
        }
    }

    // If a best separator was found (it should always be found if the group is not pure),
    // proceed with recursive calls.
    if (bestSeparator) {
        // Update the global `lastSeparatorIndex`. Because we process left then right,
        // this variable will ultimately hold the index of the last separator that
        // was chosen on the rightmost path of the tree that underwent a split.
        lastSeparatorIndex = bestSeparator.originalIndex;

        // Recursively process the left subgroup first, as per problem instructions.
        buildTree(bestLeftGroup);

        // Then, recursively process the right subgroup.
        buildTree(bestRightGroup);
    }
}

/**
 * Main function to read input, initiate the tree building process, and print the result.
 */
function solve(): void {
    const N = parseInt(readline()); // Read the number of pupae
    const allPupae: Pupa[] = [];

    // Read N lines of pupa data
    for (let i = 0; i < N; i++) {
        const line = readline().split(' ').map(Number);
        allPupae.push({
            originalIndex: line[0],
            hornSize: line[1],
            speciesID: line[2]
        });
    }

    // Start building the decision tree from the initial group containing all pupae.
    buildTree(allPupae);

    // Output the index of the last separator determined by the tree building process.
    console.log(lastSeparatorIndex);
}

// Call the main solve function to run the program.
solve();

// These declarations are for CodinGame environment, not needed for local testing with mocks.
declare function readline(): string;
declare function print(message: any): void; // Equivalent to console.log in most TypeScript environments
```