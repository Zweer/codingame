/**
 * Reads a line from standard input. In CodinGame, `readline()` is usually available globally.
 * For local testing, you might need to mock it or read from a file.
 */
declare function readline(): string;

/**
 * Prints a message to standard output. In CodinGame, `console.log()` is commonly used for this.
 */
declare function print(message: any): void;

// Define the maximum bell number based on problem constraints: "1 <= input <= 5".
// This implies bell numbers range from 1 to 5.
const MAX_BELL = 5;

// Read the single line input containing the succession of permutations.
const line: string = readline();

// Step 1: Parse the input string into a list of individual cycles.
// Each cycle is represented as an array of numbers.
// Example: "(1 2)(3 4)" will be parsed into [[1, 2], [3, 4]]
// The regex `/\((\d+(?:\s+\d+)*)\)/g` captures strings like "(1 2 3)".
// `match` returns an array of matched strings, or null if no matches.
const cycleStrings = line.match(/\((\d+(?:\s+\d+)*)\)/g) || [];
const parsedCycles: number[][] = [];
for (const cycleStr of cycleStrings) {
    // Extract numbers from inside the parentheses, split by space, and convert to integers.
    // The `.filter(num => !isNaN(num))` step is a safeguard against empty strings or non-numeric parts
    // if `split(' ')` resulted in them (e.g., if there were multiple spaces).
    const numbers = cycleStr.slice(1, -1).split(' ').map(Number).filter(num => !isNaN(num));
    if (numbers.length > 0) {
        parsedCycles.push(numbers);
    }
}

// Step 2 & 3: Compute the product of permutations.
// Permutations are functions, and according to the problem, they must be computed from right to left.
// If the input sequence is P1 P2 P3 (where P1 is leftmost), the effective transformation is P1(P2(P3(x))).
// `currentPermutation[i]` stores the bell that `i` maps to after applying all permutations processed so far.
// Initialize `currentPermutation` as the identity permutation (each bell maps to itself).
let currentPermutation: number[] = Array.from({length: MAX_BELL + 1}, (_, i) => i);

// Iterate through the parsed cycles from right to left.
// If `parsedCycles` is `[P1, P2, ..., Pn]`, we process Pn, then Pn-1, ..., then P1.
for (let i = parsedCycles.length - 1; i >= 0; i--) {
    const nextCycleArr = parsedCycles[i]; // This represents the next permutation (P_k) to apply.

    // Create a temporary mapping for this single cycle (`nextCycleArr`).
    // `nextCycleMapping[from]` will store `to` for the current cycle's transformations.
    // Initialize it as identity, then apply the specific mappings for this cycle.
    const nextCycleMapping: number[] = Array.from({length: MAX_BELL + 1}, (_, j) => j);
    for (let k = 0; k < nextCycleArr.length; k++) {
        const from = nextCycleArr[k];
        // The element `from` maps to the next element in the cycle, wrapping around for the last element.
        const to = nextCycleArr[(k + 1) % nextCycleArr.length];
        nextCycleMapping[from] = to;
    }

    // Compose the `currentPermutation` with `nextCycleMapping`.
    // The new combined permutation (`newPermutation`) results from applying `currentPermutation` first,
    // and then applying `nextCycleMapping` to the result.
    // Mathematically: `newPermutation(x) = nextCycleMapping(currentPermutation(x))`
    const newPermutation: number[] = Array.from({length: MAX_BELL + 1}, (_, j) => j);
    for (let bell = 1; bell <= MAX_BELL; bell++) {
        newPermutation[bell] = nextCycleMapping[currentPermutation[bell]];
    }
    // Update `currentPermutation` to be this newly calculated combined permutation.
    currentPermutation = newPermutation;
}

// Step 4: Decompose the final `currentPermutation` into disjoint cycles.
const resultCycles: number[][] = [];
// `visited` array keeps track of bells that have already been included in a cycle.
const visited: boolean[] = Array(MAX_BELL + 1).fill(false);

// Iterate through each bell from 1 to MAX_BELL.
for (let i = 1; i <= MAX_BELL; i++) {
    // If a bell hasn't been visited yet, it means it's the starting point of a new disjoint cycle.
    if (!visited[i]) {
        const cycle: number[] = [];
        let current = i;
        // Trace the path of `current` under the `currentPermutation` until we return to a visited element.
        while (!visited[current]) {
            visited[current] = true; // Mark the current bell as visited.
            cycle.push(current);     // Add it to the current cycle being built.
            current = currentPermutation[current]; // Move to the bell it maps to.
        }
        // A cycle is formed if the path `i -> P(i) -> P(P(i)) -> ...` eventually returns to `i`.
        // The problem states that 1-cycles (e.g., (4) where 4 maps to 4) should not be printed.
        // So, we only add cycles that have a length greater than 1.
        if (cycle.length > 1) {
            resultCycles.push(cycle);
        }
    }
}

// Step 5: Format and print the output.

// 5.1: For each cycle, ensure it starts with its smallest element.
// This is necessary for correct lexicographical sorting later and matching output format.
for (const cycle of resultCycles) {
    const minVal = Math.min(...cycle);
    const minIndex = cycle.indexOf(minVal);
    // Rotate the cycle elements so the smallest element is at the beginning.
    // Example: [3, 1, 2] -> min is 1 at index 1 -> slice(1)=[1,2], slice(0,1)=[3] -> [1,2,3]
    const rotatedCycle = cycle.slice(minIndex).concat(cycle.slice(0, minIndex));
    // Modify the original array in `resultCycles` in place with the rotated elements.
    cycle.splice(0, cycle.length, ...rotatedCycle);
}

// 5.2: Sort the list of disjoint cycles lexicographically.
// Since each cycle now starts with its smallest element, sorting by the first element is sufficient.
resultCycles.sort((a, b) => a[0] - b[0]);

// Construct the final output string.
if (resultCycles.length === 0) {
    // If `resultCycles` is empty, it means the final permutation was the identity permutation
    // (all bells mapped to themselves, resulting in only 1-cycles which are filtered out).
    // In this case, print "()".
    print('()');
} else {
    let output = '';
    for (const cycle of resultCycles) {
        output += `(${cycle.join(' ')})`; // Format each cycle as "(val1 val2 ...)"
    }
    print(output); // Print the concatenated cycle strings.
}