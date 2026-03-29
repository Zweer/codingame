To solve this problem, we need to determine if a given number `n` is a Carmichael number.

A Carmichael number `n` is a composite number such that for all integers `a`, `a^n ≡ a (mod n)`.

The most efficient way to identify Carmichael numbers is to use the following mathematical properties:
A number `n` is a Carmichael number if and only if it satisfies all three of these conditions:
1.  `n` is composite (i.e., not prime and `n > 1`).
2.  `n` is square-free (i.e., it is not divisible by the square of any prime number. This means `n` must be a product of distinct prime numbers).
3.  For every prime factor `p` of `n`, it must be true that `(p-1)` divides `(n-1)`.

Additionally, all known Carmichael numbers are odd. If `n` is even, it cannot be a Carmichael number. This is because if `n` is even, `n-1` is odd. If `p` is an odd prime factor of `n`, then `p-1` is even. An even number cannot divide an odd number (unless it's 0, which `p-1` isn't). The only prime factor that would satisfy `p-1 | n-1` if `n-1` is odd is if `p-1=1`, meaning `p=2`. But if `n` contains an odd prime factor, then it must be odd itself, creating a contradiction. So, Carmichael numbers must be odd.

**Algorithm Steps:**

1.  **Read Input `n`**: Get the given number.
2.  **Initial Checks for Non-Carmichael Numbers**:
    *   If `n <= 1`: These are not composite numbers, so they cannot be Carmichael numbers. Output `NO`.
    *   If `n` is even: Carmichael numbers are always odd. Output `NO`.
    *   If `n` is prime: By definition, Carmichael numbers are composite. We'll need a primality test function. If `n` is prime, output `NO`.
    *   If `n` passes these checks, it is a composite, odd number greater than 1. This means it's a potential Carmichael number.
3.  **Find Prime Factors and Check for Square-Freeness**:
    *   Initialize an empty list `primeFactors` to store distinct prime factors of `n`.
    *   Initialize a boolean `isSquareFree = true`.
    *   Iterate through potential prime factors `i` starting from 3 (since `n` is odd, 2 is not a factor) up to `sqrt(n)`, incrementing by 2.
        *   If `i` divides `n`:
            *   Add `i` to `primeFactors`.
            *   Count how many times `i` divides `n`. Divide `n` by `i` repeatedly until it's no longer divisible.
            *   If `i` divided `n` more than once, it means `n` is divisible by `i*i`, so `n` is not square-free. Set `isSquareFree = false` and break the loop (no need to find more factors).
    *   After the loop, if the remaining `n` (which is `tempN` in the code) is greater than 1, it means `tempN` itself is a prime factor. Add it to `primeFactors`.
    *   If `isSquareFree` is `false` at this point, output `NO`.
4.  **Verify the `(p-1) | (n-1)` Condition**:
    *   For each prime factor `p` in the `primeFactors` list:
        *   Check if `(n-1)` is perfectly divisible by `(p-1)`. That is, `(n-1) % (p-1) === 0`.
        *   If this condition is false for *any* prime factor `p`, then `n` is not a Carmichael number. Set `isCarmichael = false` and break the loop.
5.  **Output Result**:
    *   If all conditions pass (`isCarmichael` remains `true`), output `YES`.
    *   Otherwise (if any check failed), output `NO`.

**Complexity:**
The dominant part of the algorithm is primality testing and prime factorization, both of which run in approximately `O(sqrt(N))` time. Given `N <= 1,000,000`, `sqrt(N)` is at most `1,000`, which is very efficient for the given constraints.