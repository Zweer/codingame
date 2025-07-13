// The 'readline()' and 'console.log()' functions are provided by the CodinGame environment.
// No imports are typically needed for competitive programming on this platform.

// Read N: The number of places inside the city (City Hall not included).
// Nodes will be 0 (City Hall) to N. Total N+1 nodes.
const N: number = parseInt(readline());

// Read L: The number of links.
const L: number = parseInt(readline());

// Store links as pairs [nodeA, nodeB].
const links: [number, number][] = [];
for (let i = 0; i < L; i++) {
    const inputs = readline().split(' ').map(Number);
    const A: number = inputs[0];
    const B: number = inputs[1];
    links.push([A, B]);
}

// Object types mapping:
// 0: House (H)
// 1: Entertainment (E)
// 2: Factory (F)

// Direct happiness effect for each object type (e.g., Entertainment gives +1 happiness, Factory gives -1 happiness)
const HAPPINESS_EFFECT_DIRECT: number[] = [
    0, // Type 0: House (H) - no direct happiness change
    1, // Type 1: Entertainment (E) - +1 happiness
    -1 // Type 2: Factory (F) - -1 happiness
];

// Initialize maximum production found so far.
// A configuration with all Houses (for nodes 1 to N) will always result in 0 production and 0 happiness,
// so 0 is a valid baseline for maxProduction as it satisfies the happiness constraint.
let maxProduction = 0;

// Iterate through all possible combinations for placing objects in nodes 1 to N.
// There are N places, and each can be one of 3 types (House, Entertainment, Factory).
// So, there are 3^N total combinations.
// We represent each combination as a base-3 number.
// The (nodeIdx - 1)-th digit (from right) of the base-3 number corresponds to the type of node nodeIdx.
const numCombinations = Math.pow(3, N);

for (let i = 0; i < numCombinations; i++) {
    // objectTypes array stores the type for each node.
    // objectTypes[0] is for City Hall, objectTypes[1] to objectTypes[N] for other places.
    const objectTypes: number[] = new Array(N + 1);
    objectTypes[0] = 0; // City Hall (node 0) is always a House (type 0).

    let tempI = i; // Use a temporary variable for the base-3 conversion
    // Assign object types for nodes 1 to N based on the current base-3 combination
    for (let nodeIdx = 1; nodeIdx <= N; nodeIdx++) {
        objectTypes[nodeIdx] = tempI % 3; // Get the current digit (0, 1, or 2)
        tempI = Math.floor(tempI / 3);    // Move to the next digit (effectively shifting right in base 3)
    }

    let currentProduction = 0;
    let currentHappiness = 0;

    // 1. Calculate direct happiness from objects placed in nodes 1 to N (City Hall's direct effect is 0).
    for (let nodeIdx = 1; nodeIdx <= N; nodeIdx++) {
        currentHappiness += HAPPINESS_EFFECT_DIRECT[objectTypes[nodeIdx]];
    }

    // 2. Calculate effects from links.
    for (const [u, v] of links) {
        const typeU = objectTypes[u];
        const typeV = objectTypes[v];

        // Blue links (House - Factory or Factory - House): +1 Production
        if ((typeU === 0 && typeV === 2) || (typeU === 2 && typeV === 0)) {
            currentProduction += 1;
        }
        // Green links (House - Entertainment or Entertainment - House): +1 Happiness
        else if ((typeU === 0 && typeV === 1) || (typeU === 1 && typeV === 0)) {
            currentHappiness += 1;
        }
        // Red links (Factory - Entertainment or Entertainment - Factory): -1 Happiness
        else if ((typeU === 2 && typeV === 1) || (typeU === 1 && typeV === 2)) {
            currentHappiness -= 1;
        }
        // White links (between objects of the same type) are neutral, so no 'else' is needed here.
    }

    // 3. Check if the current configuration is valid (happiness non-negative)
    //    and update maxProduction if it yields a higher production.
    if (currentHappiness >= 0) {
        maxProduction = Math.max(maxProduction, currentProduction);
    }
}

// Output the maximum possible production found.
console.log(maxProduction);