// It is common practice in competitive programming environments like CodinGame
// to declare readline and print functions if they are not globally available.
// For a standard TypeScript compilation, these might need to be stubbed or provided.
declare function readline(): string;
declare function print(message: any): void; // print is usually for outputting, but console.log works too.

/**
 * Calculates the maximum overlap length when s2 is conceptually appended after s1.
 * This is the length of the longest suffix of s1 that is also a prefix of s2.
 * Example: getOverlap("AGATTA", "GATTACA") returns 5 (for "GATTA").
 *
 * @param s1 The first string (which comes before s2).
 * @param s2 The second string (which comes after s1).
 * @returns The length of the maximum overlap.
 */
function getOverlap(s1: string, s2: string): number {
    let maxOverlap = 0;
    // Iterate from possible longest overlap down to 1.
    // The maximum possible overlap is the length of the shorter string.
    const minLen = Math.min(s1.length, s2.length);
    for (let i = 1; i <= minLen; i++) {
        // Check if the suffix of s1 of length 'i' matches the prefix of s2 of length 'i'
        if (s1.substring(s1.length - i) === s2.substring(0, i)) {
            maxOverlap = i;
        }
    }
    return maxOverlap;
}

/**
 * Solves the Genome Sequencing puzzle.
 * Reads N sequences, filters them, computes overlaps, and finds the shortest
 * common superstring length using a permutation-based DFS.
 */
function solvePuzzle(): void {
    const N: number = parseInt(readline());
    const sequences: string[] = [];
    for (let i = 0; i < N; i++) {
        sequences.push(readline());
    }

    // Handle edge case where N is 0 (though constraints state 0 < N < 6)
    if (N === 0) {
        console.log(0);
        return;
    }

    // Step 1: Filter redundant sequences.
    // A sequence is considered redundant if it is a substring of another sequence in the input list.
    // We only need to process the "maximal" sequences, as the shorter ones will be implicitly covered.
    let currentSequences: string[] = [...sequences]; // Create a mutable copy to mark elements for removal
    
    for (let i = 0; i < currentSequences.length; i++) {
        // Skip if this sequence has already been marked as redundant
        if (currentSequences[i] === "") continue; 

        for (let j = 0; j < currentSequences.length; j++) {
            if (i === j) continue; // Don't compare a sequence with itself
            
            // If currentSequences[i] is a substring of currentSequences[j],
            // then currentSequences[i] is redundant and can be ignored.
            if (currentSequences[j].includes(currentSequences[i])) {
                currentSequences[i] = ""; // Mark for removal by setting to an empty string
                break; // No need to check against other strings; it's already identified as redundant
            }
        }
    }
    
    // Create a new array containing only the non-empty (unique and non-redundant) sequences
    const uniqueSequences = currentSequences.filter(s => s !== "");

    // If, after filtering, there's only one unique sequence, its length is the answer.
    // This also correctly handles the initial N=1 case.
    if (uniqueSequences.length === 1) {
        console.log(uniqueSequences[0].length);
        return;
    }

    const numUnique = uniqueSequences.length;

    // Step 2: Pre-compute the overlap matrix for all pairs of unique sequences.
    // overlaps[i][j] will store the maximum overlap when uniqueSequences[j] is appended after uniqueSequences[i].
    const overlaps: number[][] = Array(numUnique).fill(0).map(() => Array(numUnique).fill(0));
    for (let i = 0; i < numUnique; i++) {
        for (let j = 0; j < numUnique; j++) {
            if (i === j) continue; // A sequence doesn't overlap with itself in this context
            overlaps[i][j] = getOverlap(uniqueSequences[i], uniqueSequences[j]);
        }
    }

    let minTotalLength: number = Infinity; // Initialize with a very large value

    // Step 3: Use Depth-First Search (DFS) to explore all permutations of unique sequences.
    // This approach finds the optimal order to concatenate sequences for the shortest length.
    // currentPathMask: A bitmask where the k-th bit is set if uniqueSequences[k] has been included in the current path.
    // lastStringIndex: The index of the last sequence added to the current superstring.
    // currentLength: The total length of the superstring formed by the current path.
    function dfs(currentPathMask: number, lastStringIndex: number, currentLength: number): void {
        // Base case: If all unique sequences have been included in the path,
        // we've found a complete superstring. Update the minimum length if this one is shorter.
        // (1 << numUnique) - 1 creates a bitmask with all 'numUnique' bits set (e.g., if numUnique=3, this is 0b111).
        if (currentPathMask === (1 << numUnique) - 1) {
            minTotalLength = Math.min(minTotalLength, currentLength);
            return;
        }

        // Recursive step: Iterate through all unique sequences to find the next one to add.
        for (let nextStringIndex = 0; nextStringIndex < numUnique; nextStringIndex++) {
            // Check if 'nextStringIndex' has not been visited yet (i.e., its bit is not set in currentPathMask).
            if ((currentPathMask & (1 << nextStringIndex)) === 0) {
                // Calculate the length of the superstring if uniqueSequences[nextStringIndex] is added next.
                // It's the current length plus the length of the new string, minus the overlap with the last string.
                const newLength = currentLength + uniqueSequences[nextStringIndex].length - overlaps[lastStringIndex][nextStringIndex];
                
                // Recurse with the updated bitmask (setting the bit for nextStringIndex),
                // the new lastStringIndex, and the new total length.
                dfs(currentPathMask | (1 << nextStringIndex), nextStringIndex, newLength);
            }
        }
    }

    // Initiate the DFS. We must try each unique sequence as the starting point of the superstring,
    // as any sequence can be the first in the optimal ordering.
    for (let i = 0; i < numUnique; i++) {
        // The initial call starts a path with uniqueSequences[i].
        // The mask only has the i-th bit set (1 << i).
        // The lastStringIndex is 'i'.
        // The currentLength is just the length of uniqueSequences[i].
        dfs(1 << i, i, uniqueSequences[i].length);
    }
    
    // Output the minimum total length found.
    console.log(minTotalLength);
}

// Call the main function to execute the puzzle logic
solvePuzzle();