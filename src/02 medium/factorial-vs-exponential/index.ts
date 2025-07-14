// Helper to read a line from stdin (standard for CodinGame TypeScript setup)
declare function readline(): string;

/**
 * Finds the smallest integer N such that A^N < N!.
 * This is done by comparing N * ln(A) with ln(N!).
 * @param A The base number for the exponential.
 * @returns The smallest integer N.
 */
function solveForA(A: number): number {
    // Calculate ln(A) once as it's constant for a given A.
    const logA = Math.log(A);

    let N = 1;
    // currentLogFactorial represents ln(N!).
    // It's accumulated as N increases.
    // For N=1, ln(1!) = ln(1) = 0.
    let currentLogFactorial = 0;

    // Loop until the condition N * ln(A) < ln(N!) is met.
    while (true) {
        // Calculate ln(A^N) = N * ln(A)
        const logAPowN = N * logA;

        // Update currentLogFactorial: ln(N!) = ln((N-1)!) + ln(N)
        // For N=1, Math.log(1) is 0, so currentLogFactorial remains 0.
        // For N=2, it adds Math.log(2) to the previous 0 (ln(1!)).
        // For N=3, it adds Math.log(3) to ln(2!). And so on.
        currentLogFactorial += Math.log(N);

        // Check the condition: A^N < N!  is equivalent to  ln(A^N) < ln(N!)
        if (logAPowN < currentLogFactorial) {
            return N; // Found the smallest N
        }

        N++; // Increment N and continue searching
    }
}

// Main function to read input, process, and print output
function main() {
    // Read the number of inputs K
    const K = parseInt(readline());

    // Read the K space-separated numbers A and parse them into an array of numbers
    const As = readline().split(' ').map(Number);

    const results: number[] = [];

    // Process each A value
    for (const A of As) {
        results.push(solveForA(A));
    }

    // Print the results space-separated
    console.log(results.join(' '));
}

// Call the main function to start the program
main();