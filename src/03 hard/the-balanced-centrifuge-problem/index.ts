import * as readline from 'readline';

// Create a readline interface to read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let N: number;

// Read the input N
rl.on('line', (line: string) => {
    N = parseInt(line);
    rl.close();
});

// Once input is read, solve the puzzle
rl.on('close', () => {
    solve();
});

function solve() {
    // Use a Set to store possible K values to automatically handle distinctness
    const possibleValues = new Set<number>();

    // Rule 1: K=N is always possible (all holes filled form a regular N-gon).
    possibleValues.add(N);

    // Calculate v_2(N): the exponent of the highest power of 2 dividing N.
    // This helps differentiate between N being a multiple of 4 (v2_N >= 2)
    // and N being 2 * (an odd number) (v2_N == 1), or N being odd (v2_N == 0).
    let tempN = N;
    let v2_N = 0;
    while (tempN > 0 && tempN % 2 === 0) {
        v2_N++;
        tempN /= 2;
    }

    // Find all divisors of N.
    // Iterating up to sqrt(N) is efficient.
    const divisors: number[] = [];
    for (let i = 1; i * i <= N; i++) {
        if (N % i === 0) {
            divisors.push(i);
            if (i * i !== N) { // If i is not sqrt(N), then N/i is also a distinct divisor
                divisors.push(N / i);
            }
        }
    }

    // Rule 2: Any K that is a divisor of N (and K>1) can form a regular K-gon.
    for (const d of divisors) {
        if (d > 1) { // K=1 tube alone is never balanced for N>=2
            possibleValues.add(d);
        }
    }

    // Rule 3: Combination strategies (adding pairs of tubes to a base d-gon).
    // These strategies only apply if N is even.
    if (N % 2 === 0) {
        // Iterate through all divisors 'd' as a base for a d-gon.
        for (const d of divisors) {
            // 'canAddPairs' determines if 'd' can be extended by '2m' tubes
            // (i.e., if the remaining N-d holes allow forming opposite pairs).
            let canAddPairs: boolean;

            if (d % 2 === 0) {
                // If 'd' is an even divisor, a d-gon uses either a mix of parities or only even-indexed holes.
                // In either case, enough mixed-parity or same-parity holes remain to form additional pairs.
                // So, an even 'd' can always be combined with additional pairs.
                canAddPairs = true;
            } else { // 'd' is an odd divisor
                // If N is even and d is odd, then N/d must be even.
                // A d-gon starting at hole 0 (0, N/d, 2N/d, ..., (d-1)N/d) will occupy only even-indexed holes.
                // The remaining N-d holes will then all be odd-indexed.
                
                // Now, check if opposite pairs can be formed from these remaining odd holes:
                if (v2_N === 1) { // Case: N = 2 * (odd_number)
                    // In this case, N/2 is odd. An opposite pair (j, j + N/2) always consists
                    // of one even-indexed hole and one odd-indexed hole.
                    // Since all remaining N-d holes are odd, it's impossible to form such pairs.
                    canAddPairs = false;
                } else { // Case: v2_N >= 2 (N is a multiple of 4)
                    // In this case, N/2 is even. An opposite pair (j, j + N/2) consists of
                    // two holes of the same parity (both even or both odd).
                    // Since the remaining N-d holes are all odd, we can form pairs from them.
                    canAddPairs = true;
                }
            }

            // If it's possible to add pairs for this base 'd', add all K = d + 2m values to the set.
            if (canAddPairs) {
                // 'm' starts from 1 because we are adding *additional* pairs.
                // d + 2 * m must not exceed N.
                for (let m = 1; d + 2 * m <= N; m++) {
                    possibleValues.add(d + 2 * m);
                }
            }
        }
    }

    // The problem asks for the number of *different possible values of K*.
    // The Set automatically handles distinctness. K=0 is typically not counted.
    // The logic correctly excludes K=1.
    console.log(possibleValues.size);
}