The problem asks us to count distinct prime numbers found by reading horizontally ("Across") or vertically ("Down") in a grid of single-digit numbers. Partial numbers are allowed, meaning if we have "231", "2", "23", "231", "3", "31", "1" are all valid numbers to check. Skipping digits is not allowed. The grid dimensions are small (2x2 to 8x8).

Here's a breakdown of the solution strategy:

1.  **Input Parsing:** Read the dimensions `R` (rows) and `C` (columns) from the first line. Then, read `R` subsequent lines to populate a 2D array (matrix) representing the grid. Each digit is parsed as a number.

2.  **Prime Number Check Function (`isPrime`):** We need an efficient way to determine if a given number is prime.
    *   Numbers less than or equal to 1 are not prime.
    *   2 is the only even prime number. All other even numbers are not prime.
    *   For odd numbers, we only need to check for divisibility by odd numbers up to the square root of the number. If no such divisor is found, the number is prime. Given the maximum possible number (an 8-digit number like 99,999,999), this approach is sufficiently fast.

3.  **Extracting Numbers and Storing Primes:**
    *   We'll use a `Set<number>` called `foundPrimes` to store all distinct prime numbers found. A `Set` automatically handles distinctness, preventing duplicates.
    *   **Across Scan:**
        *   Iterate through each row `r` from `0` to `R-1`.
        *   For each row, iterate through each column `c` from `0` to `C-1`. This `(r, c)` pair represents the starting digit of a potential number.
        *   From `(r, c)`, build numbers by extending to the right: Iterate `k` from `c` to `C-1`. In each step, append `grid[r][k]` to a string representing the current number. Convert this string to a number. Check if it's prime using `isPrime`. If it is, add it to `foundPrimes`.
    *   **Down Scan:**
        *   Iterate through each column `c` from `0` to `C-1`.
        *   For each column, iterate through each row `r` from `0` to `R-1`. This `(r, c)` pair represents the starting digit of a potential number.
        *   From `(r, c)`, build numbers by extending downwards: Iterate `k` from `r` to `R-1`. In each step, append `grid[k][c]` to a string. Convert to number, check prime, and add to `foundPrimes`.

4.  **Output:** Finally, print the `size` of the `foundPrimes` set, which represents the total count of distinct primes.

**Example Walkthrough (2 2, 2 3, 1 7):**

Grid:
2 3
1 7

`foundPrimes = {}`

**Across:**
- Start (0,0)='2': "2" (prime, add 2), "23" (prime, add 23) -> `foundPrimes = {2, 23}`
- Start (0,1)='3': "3" (prime, add 3) -> `foundPrimes = {2, 3, 23}`
- Start (1,0)='1': "1" (not prime), "17" (prime, add 17) -> `foundPrimes = {2, 3, 17, 23}`
- Start (1,1)='7': "7" (prime, add 7) -> `foundPrimes = {2, 3, 7, 17, 23}`

**Down:**
- Start (0,0)='2': "2" (already in set), "21" (not prime)
- Start (1,0)='1': "1" (not prime)
- Start (0,1)='3': "3" (already in set), "37" (prime, add 37) -> `foundPrimes = {2, 3, 7, 17, 23, 37}`
- Start (1,1)='7': "7" (already in set)

Final `foundPrimes.size = 6`.

This approach ensures all possible numbers are checked and distinct primes are counted. The small constraints on R and C (max 8) ensure that this method is efficient enough.