The puzzle asks us to find a target `Result` using 6 given numbers and standard arithmetic operations (addition, subtraction, multiplication, division). There are specific rules for subtraction (result must be positive) and division (result must be an integer). We need to determine if the `Result` is "POSSIBLE" to achieve and, if so, report the minimum number of operations. If it's "IMPOSSIBLE", we report the minimum absolute difference between the `Result` and any number reachable through operations.

**Problem Analysis:**

This is a classic "Countdown" game variation. We start with 6 numbers and, in each step, combine two numbers using an operation, replacing them with the result. This reduces the count of available numbers by one. The maximum number of operations is 5 (to combine 6 numbers down to a single result).

**Approach: Breadth-First Search (BFS)**

A Breadth-First Search is ideal for this problem for two reasons:
1.  **Minimum Operations:** BFS explores states level by level (by the number of operations). The first time we reach the `Result`, it guarantees that we have found the path with the minimum number of operations.
2.  **Minimum Distance:** By exploring all reachable states up to the maximum number of operations (5), we can track the closest number to the `Result` at any point, allowing us to report the minimum difference if the target is not achieved.

**State Representation:**

Each state in our BFS queue will be represented by:
*   `numbers`: An array of the numbers currently available.
*   `operationsCount`: The number of operations performed to reach this state.

**Detailed Algorithm:**

1.  **Initialization:**
    *   Read the `Result` and the 6 `initialNumbers`.
    *   Initialize `minOperations = Infinity`, `possible = false`, `minDistance = Infinity`.
    *   Create a `queue` for BFS, initially containing `[initialNumbers, 0]`.
    *   Create a `visited` map (e.g., `Map<string, number>`) to store canonical representations of number sets and the minimum operations required to reach them. This prevents cycles and redundant computations. A canonical representation is created by sorting the numbers in the array and joining them into a string (e.g., `[3, 9, 25]` becomes `"3,9,25"`).
    *   Update `minDistance` by checking the absolute difference between `Result` and each of the `initialNumbers`. If `Result` is one of the `initialNumbers`, set `possible = true` and `minOperations = 0`.

2.  **BFS Loop:**
    *   While the `queue` is not empty:
        *   Dequeue `[currentNumbers, currentOps]`.
        *   **Pruning:**
            *   If `possible` is already `true` and `currentOps` is greater than or equal to `minOperations`, we can stop exploring this path because we've already found a shorter or equally short solution.
            *   If `currentOps` is 5 or more, we've used all numbers or exceeded the maximum allowed operations. Prune this path.
        *   **Generate Next States:**
            *   Iterate through all unique pairs `(num1, num2)` from `currentNumbers`.
            *   For each pair, perform all valid operations:
                *   `num1 + num2`
                *   `num1 * num2`
                *   `num1 - num2` (if `num1 > num2`)
                *   `num2 - num1` (if `num2 > num1`)
                *   `num1 / num2` (if `num2 !== 0` and `num1 % num2 === 0`)
                *   `num2 / num1` (if `num1 !== 0` and `num2 % num1 === 0`)
            *   For each `resultValue` from an operation:
                *   **Filtering Intermediate Values:** Discard results that are less than or equal to 0, or are excessively large (e.g., `> 1,000,000`). While not strictly stated in the puzzle, this is a common optimization in Countdown-like games. Intermediate results rarely need to be astronomically large to reach a target like 100-999. Values up to `100 * 100 * 100 = 1,000,000` could be legitimate (e.g., `1,000,000 / 1000 = 1000`), but beyond that, it becomes less likely with the given initial numbers. This pruning helps keep the search space manageable.
                *   Create `nextNumbers` by removing `num1` and `num2` from `currentNumbers` and adding `resultValue`.
                *   Calculate `nextOps = currentOps + 1`.
                *   Update `minDistance` if `Math.abs(resultValue - Result)` is smaller.
                *   If `resultValue === Result`:
                    *   Set `possible = true`.
                    *   Update `minOperations = Math.min(minOperations, nextOps)`.
                *   Generate the `nextKey` (sorted string) for `nextNumbers`.
                *   If `nextKey` has not been visited, or if `nextOps` is shorter than the previously recorded operations for `nextKey`, then:
                    *   Add `[nextNumbers, nextOps]` to the `queue`.
                    *   Update `visited.set(nextKey, nextOps)`.

3.  **Output:**
    *   If `possible` is `true`, print "POSSIBLE" and `minOperations`.
    *   Otherwise, print "IMPOSSIBLE" and `minDistance`.

**TypeScript Considerations:**

*   `readline()` is a global function in the CodinGame environment. A `declare const readline: () => string;` is needed for local TypeScript compilation.
*   Using an index `head` for dequeuing from the `queue` (`queue[head++]`) is more performant than `Array.shift()` for large queues.
*   The `getNumbersKey` function ensures that sets of numbers like `[1, 2, 3]` and `[3, 1, 2]` are treated as the same state, which is crucial for correct `visited` tracking.