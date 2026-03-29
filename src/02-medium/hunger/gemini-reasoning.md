The problem asks us to find the length of the longest "good" feast. A food is "good" if its sweetness is greater than or equal to `k`. A feast (subarray) is "good" if the number of "good" foods in it is strictly greater than the number of "non-good" foods.

**Reasoning:**

1.  **Transformation to a Sum Problem:**
    This problem can be transformed into a variation of the maximum subarray sum problem.
    Let's represent "good" foods with a value of `1` and "non-good" foods with a value of `-1`.
    If a feast (subarray) has `G` good foods and `N` non-good foods, its sum will be `G * 1 + N * (-1) = G - N`.
    The condition for a "good" feast is `G > N`, which translates to `G - N > 0`.
    So, our goal becomes: find the longest subarray in the transformed array whose sum is strictly greater than `0`.

2.  **Algorithm (Brute Force with Optimization):**
    Given `N` up to 3000, an `O(N^2)` solution should be efficient enough.
    *   **Step 1: Transform the input array.**
        Create a new array, `transformedFoods`, of the same size as the input `foodsSweetness`. For each food:
        *   If `foodsSweetness[i] >= k`, set `transformedFoods[i] = 1`.
        *   Else (`foodsSweetness[i] < k`), set `transformedFoods[i] = -1`.
    *   **Step 2: Iterate through all possible subarrays.**
        We can use nested loops:
        *   The outer loop (`i`) defines the starting index of the subarray.
        *   The inner loop (`j`) defines the ending index of the subarray.
        *   For each pair `(i, j)`, calculate the sum of `transformedFoods` from index `i` to `j`. This can be done efficiently by maintaining a `currentFeastSum` that accumulates values as `j` increases for a fixed `i`.
    *   **Step 3: Check and Update Max Length.**
        If `currentFeastSum > 0` for the subarray `transformedFoods[i...j]`:
        *   Calculate the length of this subarray: `j - i + 1`.
        *   Update `maxLength = Math.max(maxLength, j - i + 1)`.
    *   Initialize `maxLength` to `0`. If no "good" feast is found, `maxLength` will remain `0`, which is the correct output.

**Example Walkthrough:**

Input:
`n = 7, k = 8`
`foods = [1, 3, 8, 9, 1, 1, 12]`

1.  **Transform:**
    `transformedFoods = [-1, -1, 1, 1, -1, -1, 1]` (since `1, 3, 1, 1` are `< 8`, and `8, 9, 12` are `>= 8`)

2.  **Iterate and Calculate:**
    `maxLength = 0`

    *   `i = 0`:
        *   `j = 0`: `[-1]`, sum = -1.
        *   `j = 1`: `[-1, -1]`, sum = -2.
        *   `j = 2`: `[-1, -1, 1]`, sum = -1.
        *   `j = 3`: `[-1, -1, 1, 1]`, sum = 0.
        *   `j = 4`: `[-1, -1, 1, 1, -1]`, sum = -1.
        *   `j = 5`: `[-1, -1, 1, 1, -1, -1]`, sum = -2.
        *   `j = 6`: `[-1, -1, 1, 1, -1, -1, 1]`, sum = -1.
    *   `i = 1`:
        *   `j = 1`: `[-1]`, sum = -1.
        *   `j = 2`: `[-1, 1]`, sum = 0.
        *   `j = 3`: `[-1, 1, 1]`, sum = 1. Good! Length = 3. `maxLength = 3`.
        *   `j = 4`: `[-1, 1, 1, -1]`, sum = 0.
        *   `j = 5`: `[-1, 1, 1, -1, -1]`, sum = -1.
        *   `j = 6`: `[-1, 1, 1, -1, -1, 1]`, sum = 0.
    *   `i = 2`:
        *   `j = 2`: `[1]`, sum = 1. Good! Length = 1. `maxLength` remains 3.
        *   `j = 3`: `[1, 1]`, sum = 2. Good! Length = 2. `maxLength` remains 3.
        *   `j = 4`: `[1, 1, -1]`, sum = 1. Good! Length = 3. `maxLength` remains 3.
        *   `j = 5`: `[1, 1, -1, -1]`, sum = 0.
        *   `j = 6`: `[1, 1, -1, -1, 1]`, sum = 1. Good! Length = 5. `maxLength = 5`.
    *(... continue for other `i` values, but `maxLength` won't increase further)*

Final `maxLength = 5`, which matches the example output.

This `O(N^2)` approach (3000^2 = 9 million operations) is well within the typical time limits for CodinGame puzzles.