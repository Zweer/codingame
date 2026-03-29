// Standard CodinGame setup: readline function is implicitly available.
// It reads a single line from standard input.
// declare function readline(): string; // This declaration is typically implicit in CodinGame's JS/TS environment.

function solve() {
    // Read the input N as a string, then convert to BigInt.
    // N can be up to 10^18, which requires BigInt in TypeScript/JavaScript.
    const N_str = readline();
    const N = BigInt(N_str);

    // Handle the N=0 case separately as it's a base case for Fibonacci representations.
    if (N === 0n) {
        console.log('0');
        return;
    }

    // Generate Fibonacci numbers (F_n) to be used for the Zeckendorf representation.
    // The sequence starts from F_2 (value 1), F_3 (value 2), F_4 (value 3), and so on.
    // Standard Fibonacci definition: F_0 = 0, F_1 = 1, F_2 = 1, F_3 = 2, F_4 = 3, ...
    // These values correspond to bit positions in the bitstream:
    // F_2 (value 1) is assigned to bit 0
    // F_3 (value 2) is assigned to bit 1
    // F_4 (value 3) is assigned to bit 2
    // In general, F_{i+2} corresponds to bit i.
    // The 'fib_values' array will store [F_2, F_3, ..., F_k] where F_k is the largest F_n <= N.
    const fib_values: BigInt[] = [];
    let f_prev = 1n; // Represents F_1 (needed to calculate F_2)
    let f_curr = 1n; // Represents F_2 (the first Fibonacci number we care about)

    // Populate fib_values array with Fibonacci numbers up to N
    while (f_curr <= N) {
        fib_values.push(f_curr);
        const f_next = f_prev + f_curr; // Calculate next Fibonacci number
        f_prev = f_curr;                // Update f_prev to current
        f_curr = f_next;                // Update f_curr to next
    }

    let result_bitstream = 0n; // This BigInt will store the combined bitstream
    let current_N = N;          // Remaining value of N to represent

    // Apply the greedy Zeckendorf representation algorithm.
    // Iterate from the largest Fibonacci number in our list (highest bit position) down to the smallest (bit 0).
    // The key rule for "damaged centrifuges" (no consecutive 1s) maps directly to
    // Zeckendorf's theorem, where no two consecutive Fibonacci numbers can be used in the sum.
    // If F_k is used in the sum, then F_{k-1} cannot be used.
    for (let i = fib_values.length - 1; i >= 0; i--) {
        const fib_val = fib_values[i];     // Current Fibonacci value (e.g., F_{i+2})
        const bit_pos = BigInt(i);          // Corresponding bit position in the stream (0-indexed)

        if (current_N >= fib_val) {
            // If the current Fibonacci number can be included in the sum:
            current_N -= fib_val;                      // Subtract it from the remaining N
            result_bitstream |= (1n << bit_pos);       // Set the corresponding bit in the result bitstream

            // Crucial step: skip the next smaller Fibonacci number.
            // If fib_values[i] (which is F_{i+2}) was chosen, then according to the non-consecutive rule,
            // fib_values[i-1] (which is F_{i+1}) cannot be chosen.
            // The loop's natural decrement `i--` makes `i` point to `i-1` in the next iteration.
            // To *skip* `fib_values[i-1]`, we decrement `i` an additional time.
            i--; 
        }
    }

    // Convert the final BigInt bitstream to its octal string representation.
    console.log(result_bitstream.toString(8));
}

// Call the solve function to execute the program in the CodinGame environment.
solve();