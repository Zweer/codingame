The problem asks us to find the sub-rectangle with the largest sum within a given 2D array of integers. This is a classic problem known as the "Maximum Sum Submatrix" problem.

**Reasoning:**

1.  **Brute Force (Inefficient):** A naive approach would be to iterate through all possible top-left `(r1, c1)` and bottom-right `(r2, c2)` coordinates to define every possible sub-rectangle. For each sub-rectangle, we would sum all its elements. This leads to a time complexity of `O(H^3 * W^3)`, which is too slow for `H, W <= 100` (e.g., `100^6 = 10^12` operations).

2.  **Reducing to 1D Problem (Efficient):** The standard approach to solve this problem more efficiently involves reducing the 2D problem to a 1D problem. This is done by applying Kadane's algorithm.

    *   **Kadane's Algorithm (1D Max Subarray Sum):** Given a 1D array of numbers, Kadane's algorithm finds the maximum sum of a contiguous subarray in `O(N)` time. It maintains two variables: `max_so_far` (the overall maximum sum found) and `current_max` (the maximum sum ending at the current position).

    *   **Extension to 2D:**
        The idea is to iterate through all possible pairs of top and bottom rows `(r1, r2)` that define the vertical boundaries of a potential sub-rectangle.
        For each pair `(r1, r2)`:
        *   We create a temporary 1D array, let's call it `currentColumnSums`, of size `W` (the width of the matrix).
        *   For each column `c` from `0` to `W-1`, `currentColumnSums[c]` will store the sum of `matrix[row][c]` for all `row` from `r1` to `r2`. Effectively, this compresses the rows `r1` through `r2` into a single 1D array.
        *   Once `currentColumnSums` is populated for the current `r1` and `r2`, we apply Kadane's algorithm to this `currentColumnSums` array. The maximum sum returned by Kadane's algorithm will be the maximum sum of a sub-rectangle whose top row is `r1`, bottom row is `r2`, and column span `(c1, c2)` is determined by Kadane's.
        *   We keep track of the overall maximum sum found across all `(r1, r2)` pairs.

3.  **Complexity Analysis:**
    *   The outer loop iterates `r1` from `0` to `H-1` (`H` times).
    *   The inner loop iterates `r2` from `r1` to `H-1` (`H` times in the worst case for each `r1`).
    *   Inside these loops:
        *   We update `currentColumnSums` by iterating through `W` columns (`O(W)`).
        *   We apply Kadane's algorithm on `currentColumnSums`, which takes `O(W)` time.
    *   Total time complexity: `O(H * H * (W + W)) = O(H^2 * W)`.
    *   Given `H, W <= 100`, this means `100^2 * 100 = 10^6` operations, which is well within typical time limits for competitive programming (usually around `10^8` operations per second).

4.  **Edge Cases:**
    *   **All negative numbers:** Kadane's algorithm correctly handles arrays with all negative numbers by returning the largest (least negative) single element. We initialize `maxOverallSum` to `Number.MIN_SAFE_INTEGER` to ensure that even a single negative number is correctly captured as the maximum if all other sums are smaller (more negative).
    *   **1x1 matrix:** The algorithm correctly identifies the single element as the maximum sum.

**Code Structure:**

1.  Read `W` and `H`.
2.  Read the 2D grid into a `number[][]`.
3.  Initialize `maxOverallSum = Number.MIN_SAFE_INTEGER`.
4.  Implement a `kadane(arr: number[]): number` helper function.
5.  Loop `r1` from `0` to `H-1`.
6.  Inside, initialize `currentColumnSums` as an array of `W` zeros.
7.  Loop `r2` from `r1` to `H-1`.
8.  Inside, loop `c` from `0` to `W-1` to add `grid[r2][c]` to `currentColumnSums[c]`.
9.  Call `kadane(currentColumnSums)` and update `maxOverallSum`.
10. Print `maxOverallSum`.