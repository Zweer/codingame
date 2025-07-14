import * as readline from 'readline';

// --- Readline setup for CodinGame environment ---
// In CodinGame, `readline()` is typically available directly.
// For local testing, we simulate it with `rl.on` events.
let inputLines: string[] = [];
let currentLine = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line: string) => {
    inputLines.push(line);
});

rl.on('close', () => {
    solve();
});

// Helper function to read a line from the buffered input
function readLine(): string {
    return inputLines[currentLine++];
}

// --- Main solution logic ---
function solve() {
    const N = parseInt(readLine());
    const data: { n: number; t: number }[] = [];
    for (let i = 0; i < N; i++) {
        const parts = readLine().split(' ').map(Number);
        data.push({ n: parts[0], t: parts[1] });
    }

    interface Complexity {
        name: string;
        func: (n: number) => number;
    }

    // Define the candidate computational complexities and their corresponding functions
    const complexities: Complexity[] = [
        { name: "O(1)", func: (n) => 1 },
        { name: "O(log n)", func: (n) => Math.log(n) }, // Natural logarithm (base e)
        { name: "O(n)", func: (n) => n },
        { name: "O(n log n)", func: (n) => n * Math.log(n) },
        { name: "O(n^2)", func: (n) => n * n },
        { name: "O(n^2 log n)", func: (n) => n * n * Math.log(n) },
        { name: "O(n^3)", func: (n) => n * n * n },
        { name: "O(2^n)", func: (n) => Math.pow(2, n) },
    ];

    let minError = Infinity;
    let bestComplexityName = "";

    // Iterate through each complexity type to find the best fit
    for (const complexity of complexities) {
        let sum_XY = 0; // Sum of t_i * f(n_i)
        let sum_X2 = 0; // Sum of f(n_i)^2
        let validPointsCount = 0;
        let hasOverflow = false; // Flag if f(n) results in Infinity for any point

        for (const point of data) {
            const n = point.n;
            const t = point.t;

            const x_prime = complexity.func(n);

            // Check for non-finite values (Infinity, NaN) or non-positive values.
            // For the given constraints (n > 5), f(n) will always be positive for
            // O(1), O(log n), O(n), O(n log n), O(n^2), O(n^2 log n), O(n^3).
            // O(2^n) is the only one that can produce Infinity for large n.
            if (!Number.isFinite(x_prime) || x_prime <= 0) {
                hasOverflow = true;
                break; // This complexity is likely a poor fit or impossible for this data range
            }

            sum_XY += t * x_prime;
            sum_X2 += x_prime * x_prime;
            validPointsCount++;
        }

        let currentError = Infinity;

        // If there was an overflow, or not enough valid points to calculate a fit,
        // or if sum_X2 is zero (meaning all x_prime were effectively zero), assign max error.
        // sum_X2 should not be 0 given n > 5 and our functions always producing positive x_prime.
        if (hasOverflow || validPointsCount < 2 || sum_X2 === 0) {
            currentError = Infinity;
        } else {
            // Calculate the optimal constant C using linear regression (model: T = C * f(n))
            // C = (sum of T*f(n)) / (sum of f(n)^2)
            const bestC = sum_XY / sum_X2;

            // Calculate the sum of squared differences (error) for this complexity model
            let sumSquaredDifferences = 0;
            for (const point of data) {
                const n = point.n;
                const t = point.t;
                const x_prime = complexity.func(n); 

                // Re-check x_prime for safety, though `hasOverflow` check should handle it.
                if (!Number.isFinite(x_prime) || x_prime <= 0) {
                     sumSquaredDifferences = Infinity; 
                     break;
                }

                const predictedT = bestC * x_prime;
                sumSquaredDifferences += (t - predictedT) * (t - predictedT);
            }
            currentError = sumSquaredDifferences;
        }

        // Update the best complexity if the current one has a smaller error
        if (currentError < minError) {
            minError = currentError;
            bestComplexityName = complexity.name;
        }
    }

    console.log(bestComplexityName);
}