The problem asks us to determine if a given number `N` is a "Queneau Number". A number `N` is a Queneau Number if, starting with the sequence `[1, 2, ..., N]`, applying a specific "spiral permutation" `N` times results in the sequence returning to its initial state `[1, 2, ..., N]`. If it is a Queneau Number, we must print all `N` permutations, otherwise print "IMPOSSIBLE".

**1. Understanding the Spiral Permutation:**

Let's break down the permutation rule with the example `[1, 2, 3, 4, 5]` becoming `[5, 1, 4, 2, 3]`:

*   Initial sequence: `[1, 2, 3, 4, 5]`
*   Take the last element (`5`), add it to the new sequence. Remaining: `[1, 2, 3, 4]`. New sequence: `[5]`
*   Take the first element (`1`), add it to the new sequence. Remaining: `[2, 3, 4]`. New sequence: `[5, 1]`
*   Take the last element (`4`), add it to the new sequence. Remaining: `[2, 3]`. New sequence: `[5, 1, 4]`
*   Take the first element (`2`), add it to the new sequence. Remaining: `[3]`. New sequence: `[5, 1, 4, 2]`
*   Take the last element (`3`), add it to the new sequence. Remaining: `[]`. New sequence: `[5, 1, 4, 2, 3]`

The pattern is: take the last, then take the first, then take the last, then take the first, and so on, from the diminishing sequence until it's empty.

**2. Algorithm Steps:**

1.  **Initialize:**
    *   Read the input `N`.
    *   Create the `initialSequence`: an array `[1, 2, ..., N]`.
    *   Create a `currentSequence` which is a copy of `initialSequence`. This sequence will be transformed in each step.
    *   Create `permutationsHistory`: an empty array of arrays to store each `currentSequence` after permutation.

2.  **`applySpiralPermutation` Function:**
    *   This helper function takes an array `arr` as input.
    *   It creates a temporary mutable copy of `arr`.
    *   It uses a `resultArr` to build the new permuted sequence.
    *   It uses a boolean flag, `takeFromEnd`, initialized to `true`.
    *   In a loop, while the temporary array is not empty:
        *   If `takeFromEnd` is `true`, `pop` (remove from end) an element from the temporary array and `push` it to `resultArr`.
        *   If `takeFromEnd` is `false`, `shift` (remove from beginning) an element from the temporary array and `push` it to `resultArr`.
        *   Toggle `takeFromEnd` for the next iteration.
    *   Return `resultArr`.

3.  **Main Loop:**
    *   Iterate `N` times (from `i = 0` to `N - 1`).
    *   In each iteration:
        *   Apply the `applySpiralPermutation` function to `currentSequence` and update `currentSequence` with the result.
        *   Store a *copy* of the `currentSequence` in `permutationsHistory`. This ensures that `permutationsHistory[i]` contains the result of the `(i+1)`-th permutation.

4.  **Check and Output:**
    *   After the loop, `currentSequence` will hold the result of `N` permutations.
    *   Compare `currentSequence` with `initialSequence` element by element. If they are identical, `N` is a Queneau Number.
    *   If `N` is a Queneau Number, iterate through `permutationsHistory` and print each stored sequence, joined by commas.
    *   Otherwise, print "IMPOSSIBLE".

**Example Trace (N=3):**

*   `N = 3`
*   `initialSequence = [1, 2, 3]`
*   `currentSequence = [1, 2, 3]`
*   `permutationsHistory = []`

*   **Iteration 1 (i=0):**
    *   `currentSequence = applySpiralPermutation([1, 2, 3])`
        *   `[1, 2, 3]` -> pop 3 -> `[3]` (remaining `[1, 2]`)
        *   `[1, 2]` -> shift 1 -> `[3, 1]` (remaining `[2]`)
        *   `[2]` -> pop 2 -> `[3, 1, 2]` (remaining `[]`)
        *   Returns `[3, 1, 2]`
    *   `currentSequence` becomes `[3, 1, 2]`
    *   `permutationsHistory.push([3, 1, 2])` -> `[[3, 1, 2]]`

*   **Iteration 2 (i=1):**
    *   `currentSequence = applySpiralPermutation([3, 1, 2])`
        *   `[3, 1, 2]` -> pop 2 -> `[2]` (remaining `[3, 1]`)
        *   `[3, 1]` -> shift 3 -> `[2, 3]` (remaining `[1]`)
        *   `[1]` -> pop 1 -> `[2, 3, 1]` (remaining `[]`)
        *   Returns `[2, 3, 1]`
    *   `currentSequence` becomes `[2, 3, 1]`
    *   `permutationsHistory.push([2, 3, 1])` -> `[[3, 1, 2], [2, 3, 1]]`

*   **Iteration 3 (i=2):**
    *   `currentSequence = applySpiralPermutation([2, 3, 1])`
        *   `[2, 3, 1]` -> pop 1 -> `[1]` (remaining `[2, 3]`)
        *   `[2, 3]` -> shift 2 -> `[1, 2]` (remaining `[3]`)
        *   `[3]` -> pop 3 -> `[1, 2, 3]` (remaining `[]`)
        *   Returns `[1, 2, 3]`
    *   `currentSequence` becomes `[1, 2, 3]`
    *   `permutationsHistory.push([1, 2, 3])` -> `[[3, 1, 2], [2, 3, 1], [1, 2, 3]]`

*   **End of Loop:**
    *   `currentSequence` (`[1, 2, 3]`) matches `initialSequence` (`[1, 2, 3]`).
    *   Print `permutationsHistory`:
        ```
        3,1,2
        2,3,1
        1,2,3
        ```
    This matches the problem's example output for `N=3`.

**Constraints:**
`2 <= N <= 30`. This small constraint means that the chosen approach, even with `shift()` operations (which can be `O(length)` for arrays in some JavaScript engines), will be highly efficient. The total complexity will be approximately `N` iterations * `N` elements processed per iteration * `N` array operations per element (worst case for `shift`), leading to roughly `O(N^3)` operations, which is very fast for `N=30` (30^3 = 27,000).