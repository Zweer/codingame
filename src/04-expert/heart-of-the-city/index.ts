// For CodinGame, readline() is globally available.
// For local testing, you might need to declare it or mock it:
// declare function readline(): string;

function solve(): number {
    const n: number = parseInt(readline());

    // As per constraints: 1 < n < 10,000,000 and n is always odd.
    // The smallest n is 3.
    // M represents the maximum absolute coordinate difference from the center.
    // For an n x n grid, relative coordinates (dx, dy) range from -M to M.
    const M = (n - 1) / 2;

    // mu[i] will store the Mobius function value for i.
    // lp[i] will store the least prime factor of i, used for the sieve.
    // primes stores a list of prime numbers found so far.
    const mu: number[] = new Array(M + 1).fill(0);
    const lp: number[] = new Array(M + 1).fill(0);
    const primes: number[] = [];

    // Base case for Mobius function: mu(1) = 1
    mu[1] = 1;

    // Linear Sieve to precompute Mobius function values up to M.
    // This sieve ensures each composite number i*p is processed exactly once,
    // when p is its least prime factor.
    for (let i = 2; i <= M; i++) {
        if (lp[i] === 0) { // If lp[i] is 0, i is prime
            lp[i] = i;
            primes.push(i);
            mu[i] = -1; // Mobius value for a prime number p is -1
        }

        // Iterate through primes to find multiples of i
        for (const p of primes) {
            // Optimization:
            // 1. If p > lp[i], it means p is a prime factor of i*p that is larger than the smallest prime factor of i.
            //    To ensure `i*p` is processed only by its least prime factor, we break.
            // 2. If i * p exceeds M, we are out of bounds.
            if (p > lp[i] || i * p > M) {
                break;
            }

            lp[i * p] = p; // Set the least prime factor for i*p

            if (p === lp[i]) {
                // If p is the least prime factor of i (meaning i is divisible by p),
                // then i*p has p^2 as a factor. The Mobius function is 0 for numbers
                // that have a squared prime factor.
                mu[i * p] = 0;
            } else {
                // If p is not a factor of i (i.e., gcd(p, i) = 1),
                // then mu is multiplicative: mu(i*p) = mu(i) * mu(p).
                // Since p is prime, mu(p) = -1. So, mu(i*p) = -mu(i).
                mu[i * p] = -mu[i];
            }
        }
    }

    // Calculate f_M, which is the count of pairs (dx, dy) such that:
    // 1 <= dx <= M, 1 <= dy <= M, and gcd(dx, dy) == 1.
    // This is computed using the Mobius inversion formula:
    // f_M = Sum_{d=1 to M} mu(d) * floor(M/d)^2
    let f_M = 0;
    for (let d = 1; d <= M; d++) {
        const term = Math.floor(M / d);
        f_M += mu[d] * term * term;
    }

    // Total visible buildings consist of two parts:
    // 1. 4 buildings on the cardinal axes: (0,1), (0,-1), (1,0), (-1,0). These are always visible.
    // 2. 4 * f_M buildings in the four quadrants (e.g., dx>0, dy>0; dx<0, dy>0, etc.).
    //    Each quadrant contributes f_M visible buildings due to symmetry.
    const totalVisibleBuildings = 4 + 4 * f_M;

    return totalVisibleBuildings;
}

// Output the result as required by CodinGame environment
console.log(solve());