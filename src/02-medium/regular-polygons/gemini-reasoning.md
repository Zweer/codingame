The puzzle asks us to count the number of regular `n`-gons that can be constructed using a straightedge and compass, where `n` is in a given range `[a, b]`. The core of the problem is applying the Gauss-Wantzel theorem.

### Gauss-Wantzel Theorem
A regular `n`-gon can be constructed with compass and straightedge if and only if `n` is of the form `2^k * F1 * F2 * ... * Fj`, where `k` is a non-negative integer, and `F1, F2, ..., Fj` are distinct Fermat primes. A Fermat prime is a prime number of the form `2^(2^m) + 1`.

### Identifying Fermat Primes
Let's list the first few Fermat numbers `F_m = 2^(2^m) + 1`:
*   `m = 0`: `F_0 = 2^(2^0) + 1 = 2^1 + 1 = 3` (Prime)
*   `m = 1`: `F_1 = 2^(2^1) + 1 = 2^2 + 1 = 5` (Prime)
*   `m = 2`: `F_2 = 2^(2^2) + 1 = 2^4 + 1 = 17` (Prime)
*   `m = 3`: `F_3 = 2^(2^3) + 1 = 2^8 + 1 = 257` (Prime)
*   `m = 4`: `F_4 = 2^(2^4) + 1 = 2^16 + 1 = 65537` (Prime)
*   `m = 5`: `F_5 = 2^(2^5) + 1 = 2^32 + 1 = 4294967297`. This number is known to be composite (`641 * 6700417`).

Furthermore, `F_5` (`2^32 + 1`) is already greater than the maximum allowed value for `b` (`2^31 - 1`). Thus, we only need to consider the five known Fermat primes: `3, 5, 17, 257, 65537`.

### Strategy
The range `[a, b]` can be very large (`b` can be up to `2^31 - 1`). Iterating through every `n` from `a` to `b` and checking the condition for each would be too slow (up to `2 * 10^9` iterations).

A more efficient approach is to generate all possible `n` values that satisfy the condition and then count how many of them fall within the `[a, b]` range.

1.  **Generate all "odd parts" (`P`)**: These are products of distinct Fermat primes. The "empty product" (1) is also included, representing numbers of the form `2^k`.
    *   There are 5 Fermat primes. Since each can either be included or not included in a product, there are `2^5 = 32` such distinct products.
    *   The largest possible product is `3 * 5 * 17 * 257 * 65537 = 4294967295`, which is `2^32 - 1`. All these products fit comfortably within JavaScript's `number` type (which uses 64-bit floating-point numbers, offering precise integer representation up to `2^53 - 1`).

2.  **For each `P`**: Generate numbers of the form `n = P * 2^k`.
    *   Start with `current_n = P`.
    *   **Fast-forward `current_n`**: Repeatedly multiply `current_n` by 2 until `current_n >= a`. During this process, if `current_n` would exceed `b` (by checking `current_n > b / 2` before multiplication), we can stop, as no further multiples of `P` will be in the range `[a, b]`.
    *   **Count `n` values**: Once `current_n` is `>= a` (and also `<= b`), it's a constructible number in the range. Add it to the count. Then, continue multiplying `current_n` by 2, adding to the count, until `current_n` exceeds `b`. Again, use the `current_n > b / 2` check to avoid unnecessary multiplications.

This approach involves generating 32 products and for each product, performing at most `log2(2^31)` (approx 31) multiplications by 2. This is extremely efficient: `32 * 31` operations are negligible.

### Algorithm Steps

1.  Initialize `count = 0`.
2.  Define the array of Fermat primes: `fermatPrimes = [3, 5, 17, 257, 65537]`.
3.  Create a `Set` called `productsOfFermatPrimes` to store unique products of distinct Fermat primes.
4.  Implement a recursive function `generateProducts(index, currentProduct)`:
    *   Add `currentProduct` to `productsOfFermatPrimes`.
    *   For `i` from `index` to `fermatPrimes.length - 1`:
        *   Recursively call `generateProducts(i + 1, currentProduct * fermatPrimes[i])`. This ensures distinct primes are used for each product.
5.  Call `generateProducts(0, 1)` to start the process (1 represents the empty product).
6.  Iterate through each `p` in `productsOfFermatPrimes`:
    *   Initialize `current_n = p`.
    *   **First loop (fast-forward):**
        typescript
const inputs: string[] = readline().split(' ');
const a: number = parseInt(inputs[0]);
const b: number = parseInt(inputs[1]);

// Fermat primes: 2^(2^m) + 1 for m=0 to m=4.
// F_0 = 3, F_1 = 5, F_2 = 17, F_3 = 257, F_4 = 65537
// F_5 = 2^32 + 1 is composite and also too large for the 'b' constraint (b < 2^31).
const fermatPrimes: number[] = [3, 5, 17, 257, 65537];

// A Set to store all unique products of distinct Fermat primes.
// This set will contain all possible odd parts 'P' for constructible n-gons.
// The "empty product" (1) is included, representing cases where n = 2^k.
const productsOfFermatPrimes: Set<number> = new Set<number>();

/**
 * Recursively generates all possible products of distinct Fermat primes.
 * This function uses a backtracking approach to build combinations.
 *
 * @param index The starting index in the `fermatPrimes` array for the current recursive call.
 *              This ensures that each Fermat prime is used at most once in a product
 *              (by only considering primes at or after `index`).
 * @param currentProduct The product formed so far in the current recursive path.
 */
function generateProducts(index: number, currentProduct: number): void {
    // Add the current product to the set.
    // The Set automatically handles uniqueness.
    productsOfFermatPrimes.add(currentProduct);

    // Iterate through the remaining Fermat primes (from `index` onwards)
    // to form new products by including them.
    for (let i = index; i < fermatPrimes.length; i++) {
        const nextProduct = currentProduct * fermatPrimes[i];
        
        // JavaScript numbers can accurately represent integers up to 2^53 - 1.
        // The largest product of Fermat primes (2^32 - 1) fits well within this limit,
        // so no explicit overflow check is needed here for the `number` type itself.
        // Also, no check against 'b' is needed here, as 'b' is a limit for 'n', not for 'P'.
        generateProducts(i + 1, nextProduct);
    }
}

// Start the generation process with the "empty product" (1) and starting from the first Fermat prime.
generateProducts(0, 1);

let count = 0; // Initialize the counter for constructible polygons

// Iterate through each unique product 'p' found (each possible odd part).
for (const p of productsOfFermatPrimes) {
    // 'current_n' will represent a potential constructible number (p * 2^k).
    let current_n: number = p;

    // Step 1: Fast-forward 'current_n' until it is greater than or equal to 'a'.
    // We only multiply by 2 if 'current_n' is still less than 'a'.
    // Also, we must ensure 'current_n' doesn't exceed 'b' during this fast-forwarding,
    // or if the next multiplication would exceed 'b'.
    while (current_n < a) {
        // If 'current_n' is already greater than 'b / 2', then 'current_n * 2' will definitely exceed 'b'.
        // In this case, no multiple of 'p' by a power of 2 will be within the range [a, b].
        // We set 'current_n' to 'b + 1' to ensure the subsequent 'while (current_n <= b)' loop does not execute.
        if (current_n > b / 2) {
            current_n = b + 1; // Assign a value that makes current_n > b
            break;             // Exit this fast-forward loop
        }
        current_n *= 2; // Double current_n to find the next power-of-2 multiple
    }

    // Step 2: Now, 'current_n' is either:
    // a) greater than or equal to 'a' AND less than or equal to 'b', or
    // b) greater than 'b' (meaning no values for this 'p' are in the range [a, b]).
    // We iterate, adding constructible numbers to the count, until 'current_n' exceeds 'b'.
    while (current_n <= b) {
        // At this point, 'current_n' is guaranteed to be within the range [a, b]
        // because of the previous 'while' loop (which ensured it became >= a) and
        // the current loop's condition (which ensures it is <= b).
        count++; // Found a constructible number within the range.

        // If 'current_n' is already greater than 'b / 2', then 'current_n * 2' will exceed 'b'.
        // This means there are no further constructible multiples of 'p' within the range.
        if (current_n > b / 2) {
            break; // Exit this loop
        }
        current_n *= 2; // Move to the next power-of-2 multiple
    }
}

// Output the total count of constructible polygons.
print(count);

```