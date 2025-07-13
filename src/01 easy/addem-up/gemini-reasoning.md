The problem asks us to find the minimum cost to combine a set of cards into a single card. The cost of combining two cards is the sum of their health points. This new card then replaces the two original cards. This process continues until only one card remains.

This problem is a classic example of a greedy algorithm that can be solved efficiently using a min-priority queue, similar to Huffman coding.

**Problem Analysis and Greedy Strategy:**

Let's consider the given example: cards with points 1, 2, and 3.

*   **Scenario 1:** Combine 1 and 2.
    *   New card: 1 + 2 = 3. Cost incurred: 3.
    *   Remaining cards: [3 (new), 3 (original)].
    *   Combine 3 and 3.
    *   New card: 3 + 3 = 6. Cost incurred: 6.
    *   Total cost: 3 + 6 = 9.

*   **Scenario 2:** Combine 2 and 3.
    *   New card: 2 + 3 = 5. Cost incurred: 5.
    *   Remaining cards: [1 (original), 5 (new)].
    *   Combine 1 and 5.
    *   New card: 1 + 5 = 6. Cost incurred: 6.
    *   Total cost: 5 + 6 = 11.

The lowest cost is 9. Notice that in the optimal scenario (Scenario 1), we always combined the two smallest available cards. This observation leads to the greedy strategy:

1.  Always pick the two cards with the smallest health points.
2.  Combine them, add their sum to the total cost.
3.  Place the new card (with the sum as its health point) back into the collection of cards.
4.  Repeat until only one card remains.

**Why this greedy strategy works:**

When we combine two cards `A` and `B` into `A+B`, we pay `A+B`. This sum `A+B` will then be used in subsequent combinations. Each initial card's value contributes to the total cost multiple times, proportional to how many times it's part of an intermediate sum. By always combining the smallest available numbers, we ensure that smaller values are summed together first, creating larger sums earlier. These larger sums will then participate in fewer subsequent additions, minimizing their overall contribution to the total cost. This strategy effectively minimizes the sum of `(value * depth)` for all original cards in the implicit binary tree of combinations, where `depth` is the number of times a value is involved in an addition operation.

**Implementation Details:**

To efficiently find and extract the two smallest cards at each step, a **min-priority queue** (min-heap) is the ideal data structure.

1.  **Initialization**: Read all initial card health points and insert them into a min-heap.
2.  **Iteration**: Loop while the heap contains more than one element:
    *   Extract the two smallest elements (`card1`, `card2`) from the heap.
    *   Calculate their sum (`sum = card1 + card2`).
    *   Add `sum` to a running `totalCost`.
    *   Insert `sum` back into the heap.
3.  **Result**: Once the loop finishes (meaning only one card remains in the heap), `totalCost` will hold the minimum total cost.

**Time Complexity:**

*   **Building the heap**: `N` insertions, each `O(log N)`, so `O(N log N)`.
*   **Loop**: The loop runs `N-1` times (each iteration reduces the number of cards by one).
    *   Each iteration involves two `extractMin` operations (`O(log N)` each) and one `insert` operation (`O(log N)`).
    *   Total time for the loop: `(N-1) * O(log N) = O(N log N)`.

Overall time complexity: `O(N log N)`.
Given `N <= 5000`, `N log N` is approximately `5000 * log2(5000) ~ 5000 * 12.3 = 61500`, which is highly efficient and well within typical time limits (usually 1-2 seconds for `10^8` operations).

**Space Complexity:**

*   The min-heap stores up to `N` elements, so `O(N)` space complexity.
*   Given `N <= 5000`, this is a negligible memory footprint.

**Data Type for Total Cost:**

The maximum value for a card is `100,000`. With `N = 5000`, the final sum could be `5000 * 100,000 = 5 * 10^8`. The `totalCost` could be significantly larger. In the worst case (e.g., combining 1s), the cost can be roughly `N * MaxValue * log(N)`, which is approximately `5000 * 100,000 * 12.3 = 6.15 * 10^9`. Standard JavaScript numbers (double-precision floating-point) can precisely represent integers up to `2^53 - 1` (approx `9 * 10^15`), so this value fits perfectly.