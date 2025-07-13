// Read input from stdin
const inputs = readline().split(' ').map(Number);
const N: number = inputs[0];
const M: number = inputs[1];
let X_seed: number = inputs[2]; // Initial seed for the LCG

// Define a type for a horse
interface Horse {
    V: number; // Velocity
    E: number; // Elegance
}

const allHorses: Horse[] = [];

// Read classical horses
for (let i = 0; i < N; i++) {
    const [V, E] = readline().split(' ').map(Number);
    allHorses.push({ V, E });
}

// LCG parameters as BigInts to prevent precision issues
const MOD: bigint = 1n << 31n; // 2^31
const MULTIPLIER: bigint = 1103515245n;
const ADDEND: bigint = 12345n;

let currentLCGValue: bigint = BigInt(X_seed);

// Generate congruential horses
for (let i = 0; i < M; i++) {
    // Even terms are velocity
    const V = Number(currentLCGValue);
    currentLCGValue = (MULTIPLIER * currentLCGValue + ADDEND) % MOD;

    // Odd terms are elegance
    const E = Number(currentLCGValue);
    currentLCGValue = (MULTIPLIER * currentLCGValue + ADDEND) % MOD;

    allHorses.push({ V, E });
}

// Sort all horses. Sorting by (V + E) often helps in Manhattan distance problems.
// If V+E sums are equal, sort by V, then E to maintain a consistent order.
allHorses.sort((a, b) => {
    const sumA = a.V + a.E;
    const sumB = b.V + b.E;

    if (sumA !== sumB) {
        return sumA - sumB;
    }
    if (a.V !== b.V) {
        return a.V - b.V;
    }
    return a.E - b.E;
});

// Find the minimum difference using a limited window approach (heuristic for O(N*K) performance)
// K is the size of the window to check after sorting. A value of 100 is typically sufficient
// for problems of this scale in competitive programming to pass within time limits.
const K = 100; 
let minDiff: number = Infinity;

for (let i = 0; i < allHorses.length; i++) {
    // Only check against horses within the window K
    // The min() ensures we don't go out of bounds of the array.
    for (let j = i + 1; j < Math.min(i + K, allHorses.length); j++) {
        const horse1 = allHorses[i];
        const horse2 = allHorses[j];

        const diffV = Math.abs(horse2.V - horse1.V);
        const diffE = Math.abs(horse2.E - horse1.E);
        const currentDiff = diffV + diffE;

        if (currentDiff < minDiff) {
            minDiff = currentDiff;
        }
    }
}

// Output the result
console.log(minDiff);