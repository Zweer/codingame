To solve the Stock Exchange Losses puzzle, we need to find the largest possible loss that can be made by buying a share at time `t0` and selling it at a later time `t1`. This means we want to maximize the negative difference `value(t1) - value(t0)`, where `t1 > t0`. If no loss is possible (i.e., all possible `value(t1) - value(t0)` pairs result in a profit or break-even), the output should be `0`.

**Reasoning:**

The core idea is to iterate through the stock prices once, keeping track of two key pieces of information:

1.  **`maxPriceSoFar`**: The highest stock price encountered *up to the current point in the chronological series*. This is important because to incur the largest possible loss, we would ideally buy when the price is at its peak before a subsequent drop.
2.  **`maxLoss`**: The largest (most negative) loss found so far. We initialize this to `0` because if no actual loss is found, the problem states the answer should be `0`.

**Algorithm:**

1.  Read the number of stock values, `n`.
2.  Read the stock values into an array, `values`.
3.  Initialize `maxLoss` to `0`. This variable will store the most negative difference found.
4.  Initialize `maxPriceSoFar` with the first stock value (`values[0]`). This is our initial potential buying point.
5.  Iterate through the `values` array starting from the second element (`i = 1`) up to `n-1`. For each `currentValue` at index `i`:
    *   Calculate the `currentLoss`: `currentValue - maxPriceSoFar`. This represents the loss if we bought at `maxPriceSoFar` and sold at `currentValue`.
    *   Update `maxLoss`: `maxLoss = Math.min(maxLoss, currentLoss)`. We use `Math.min` because a larger loss is represented by a more negative number (e.g., -5 is a larger loss than -2).
    *   Update `maxPriceSoFar`: `maxPriceSoFar = Math.max(maxPriceSoFar, currentValue)`. We update this because for any future potential sale, we want to consider buying at the highest possible price seen *up to that point*.
6.  After iterating through all values, `maxLoss` will hold the greatest loss found. Print `maxLoss`.

**Why this works (Complexity O(N)):**

This approach is efficient because it processes each stock value exactly once. At each step, it determines the potential loss based on the highest price encountered *before or at* the current point. This implicitly checks all valid `(t0, t1)` pairs where `t0` is the highest price point and `t1` is the current point, effectively covering all necessary combinations without nested loops. The time complexity is O(N), which is well within the limits for N up to 100,000.

**Example Walkthrough (Input: 3 2 4 2 1 5):**

1.  `n = 6`, `values = [3, 2, 4, 2, 1, 5]`
2.  `maxLoss = 0`
3.  `maxPriceSoFar = 3`

Iteration:
*   `i = 1`, `currentValue = 2`:
    *   `currentLoss = 2 - 3 = -1`
    *   `maxLoss = Math.min(0, -1) = -1`
    *   `maxPriceSoFar = Math.max(3, 2) = 3`
*   `i = 2`, `currentValue = 4`:
    *   `currentLoss = 4 - 3 = 1`
    *   `maxLoss = Math.min(-1, 1) = -1`
    *   `maxPriceSoFar = Math.max(3, 4) = 4`
*   `i = 3`, `currentValue = 2`:
    *   `currentLoss = 2 - 4 = -2`
    *   `maxLoss = Math.min(-1, -2) = -2`
    *   `maxPriceSoFar = Math.max(4, 2) = 4`
*   `i = 4`, `currentValue = 1`:
    *   `currentLoss = 1 - 4 = -3`
    *   `maxLoss = Math.min(-2, -3) = -3`
    *   `maxPriceSoFar = Math.max(4, 1) = 4`
*   `i = 5`, `currentValue = 5`:
    *   `currentLoss = 5 - 4 = 1`
    *   `maxLoss = Math.min(-3, 1) = -3`
    *   `maxPriceSoFar = Math.max(4, 5) = 5`

End of loop. Output `maxLoss = -3`.