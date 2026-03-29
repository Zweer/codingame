// The `readline` function is provided by the CodinGame environment.
// For local testing, you might mock it or provide dummy input.

// Read the first line: n and k (space-separated)
const nk_line = readline().split(' ');
const n_str = nk_line[0]; // n as a string, might be very large
const k = parseInt(nk_line[1]); // k as an integer

// n can be up to 10^13, so it must be handled as a BigInt.
const n = BigInt(n_str); 

// Read the second line: k space-separated primes
const p_str_arr = readline().split(' ');
const primes: number[] = p_str_arr.map(p_str => parseInt(p_str)); // Primes are small, can be numbers

let totalCount = 0n; // Initialize total count as BigInt to handle large results

// Iterate through all non-empty subsets of primes using a bitmask.
// A bitmask 'i' from 1 to (2^k - 1) represents a unique subset.
// If the j-th bit of 'i' is set, it means primes[j] is included in the current subset.
for (let i = 1; i < (1 << k); i++) {
    let currentProduct = 1n; // Product of primes in the current subset, initialized to 1n (BigInt one)
    let numElementsInSubset = 0; // Count of primes in the current subset
    let productExceedsN = false; // Flag to indicate if currentProduct has exceeded n

    // Iterate through each prime to build the current subset's product
    for (let j = 0; j < k; j++) {
        // Check if the j-th bit is set in the mask 'i'
        if ((i >> j) & 1) {
            numElementsInSubset++;
            const prime = BigInt(primes[j]); // Convert prime to BigInt for multiplication

            // Optimization/Safety check:
            // If currentProduct is already large enough that multiplying by `prime`
            // would make it exceed `n`, then `n / (currentProduct * prime)` would be 0.
            // We can stop multiplying for this subset and skip its calculation.
            // This also prevents potential issues with extremely large BigInt products,
            // though BigInt handles arbitrary size, it's about logical efficiency.
            // The check `currentProduct > n / prime` is equivalent to `currentProduct * prime > n`.
            // Primes are guaranteed to be >= 2, so division by zero is not a concern.
            if (currentProduct > n / prime) {
                productExceedsN = true;
                break; // This subset's product is too large; its contribution is effectively 0.
            }
            currentProduct *= prime; // Multiply the product with the current prime
        }
    }

    // If the product did not exceed n (meaning it's a valid divisor for terms)
    if (!productExceedsN) {
        // Calculate the count of numbers divisible by `currentProduct` up to `n`
        // BigInt division (/) automatically performs floor division.
        const countForProduct = n / currentProduct;

        // Apply the Principle of Inclusion-Exclusion:
        // If the number of elements (primes) in the subset is odd, add the count.
        // If it's even, subtract the count.
        if (numElementsInSubset % 2 === 1) {
            totalCount += countForProduct;
        } else {
            totalCount -= countForProduct;
        }
    }
}

// Output the final count. Convert BigInt to string for console.log.
console.log(totalCount.toString());