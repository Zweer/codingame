The problem asks us to calculate the maximum "cycle-length" of the Syracuse (or Collatz) Conjecture sequence within given ranges `[A, B]`. For each range, we need to output the smallest integer `i` (where `A <= i <= B`) that yields this maximum cycle-length, along with the length itself.

**Understanding the Syracuse Conjecture:**
The sequence starts with a positive integer `n`.
- If `n` is even, the next term is `n / 2`.
- If `n` is odd, the next term is `3 * n + 1`.
The conjecture states that the sequence will always eventually reach 1. The "cycle-length" is the total number of terms in the sequence, including the final 1.

**Example Walkthrough (for 9):**
Sequence for 9: 9, 28, 14, 7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1.
There are 20 terms, so the cycle-length of 9 is 20.

**Core Logic:**

1.  **`calculateCycleLength(n)` Function:**
    *   This function determines the cycle-length for a given starting number `n`.
    *   It initializes a `steps` counter to 0 and an empty `path` array.
    *   It simulates the sequence:
        *   In each step, it adds the current number to `path` and increments `steps`.
        *   It applies the even/odd rule to get the `next` number.
        *   This continues until `currentN` becomes a number whose cycle-length is *already known* (e.g., it reaches 1, or another number whose sequence has been previously computed and cached).
    *   Once a known number is hit, the `steps` from the starting `n` to that known number are added to the known length of that number's sequence. This gives the total cycle-length for `n`.
    *   Finally, all numbers in the `path` (those encountered during the current calculation) are cached with their respective cycle-lengths. This is crucial for optimization.

2.  **Memoization (Caching):**
    *   To avoid redundant calculations, we use a `Map` called `cycleLengthCache`.
    *   `cycleLengthCache.set(1, 1)` is the base case, as the cycle-length for 1 is 1.
    *   Before calculating any sequence, the `calculateCycleLength` function checks if `n` is already in `cycleLengthCache`. If it is, the cached value is returned immediately.
    *   If `n` is not in the cache, the calculation proceeds. As the sequence progresses, if an intermediate number `k` is encountered that *is* in the cache, the process stops, and `k`'s cached length is used to complete the current calculation.
    *   After a cycle-length is determined for `n`, all numbers in the `path` leading to the known number (or 1) are also stored in the cache. This ensures that future calculations that encounter these numbers can leverage the already computed lengths.
    *   The problem constraints (`B <= 100000`) mean many numbers will be iterated over multiple times across different ranges. Memoization drastically improves performance by ensuring each number's cycle-length is computed only once.

3.  **Processing Ranges:**
    *   The program reads `N`, the number of ranges.
    *   It then loops `N` times:
        *   In each iteration, it reads `A` and `B`.
        *   It initializes `maxCycleLength = 0` and `startNumForMaxCycle = A`.
        *   It iterates `j` from `A` to `B` (inclusive).
        *   For each `j`, it calls `calculateCycleLength(j)`.
        *   If `currentLength` is greater than `maxCycleLength`, `maxCycleLength` is updated, and `startNumForMaxCycle` is set to `j`. If `currentLength` is equal to `maxCycleLength`, `startNumForMaxCycle` is *not* updated, ensuring that the *lowest* integer with that maximum length is retained (since we iterate from `A` upwards).
        *   Finally, it prints `startNumForMaxCycle` and `maxCycleLength` separated by a space.

**Constraints Handling:**
*   `1 <= N <= 10`: A small number of queries, so global memoization across queries is highly effective.
*   `1 <= A <= i <= B <= 100000`: `B` up to 100,000 means an array could theoretically be used for memoization if we only cared about numbers up to `B`, but a `Map` is more flexible as intermediate numbers `(3*n+1)` can temporarily exceed `100000` before coming back down. JavaScript's `number` type (64-bit float) handles large integers up to `2^53 - 1` precisely, which is sufficient given the problem's guarantee of no 32-bit integer overflow.

The provided solution uses this optimized approach to efficiently solve the puzzle.