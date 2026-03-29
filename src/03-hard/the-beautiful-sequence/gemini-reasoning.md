The problem asks us to find the maximum "beautiful value" among all continuous subsequences of a given integer sequence. The beautiful value is defined as the product of the smallest element in the subsequence and its length. We are encouraged to find an O(N) solution.

### Problem Analysis and Approach

Let the given sequence be `A` of length `N`. A continuous subsequence `A[i...j]` has length `j - i + 1`. Its beautiful value is `min(A[i...j]) * (j - i + 1)`.

A naive approach would involve iterating through all possible start `i` and end `j` indices, finding the minimum in `A[i...j]`, and calculating the beautiful value. This would be an O(N^3) or O(N^2) approach, which might be too slow for N=500 given the O(N) hint.

The hint for an O(N) solution points towards a monotonic stack approach, similar to the "Largest Rectangle in Histogram" problem. The core idea is to consider each element `A[k]` in the sequence as the potential *smallest element* of some continuous subsequence.

If `A[k]` is the smallest element of a continuous subsequence `A[left_idx...right_idx]`, it means that all elements `A[p]` where `left_idx <= p <= right_idx` must satisfy `A[p] >= A[k]`. To maximize `A[k] * (length)`, we need to find the largest possible `length` for which `A[k]` is the minimum. This means extending the subsequence as far left and as far right as possible, until we hit an element that is *strictly smaller* than `A[k]`.

Let's define:
- `leftSmaller[k]`: The index of the first element to the left of `k` (i.e., `index < k`) that is strictly smaller than `A[k]`. If no such element exists, we can consider it as -1 (an imaginary boundary before the array start).
- `rightSmaller[k]`: The index of the first element to the right of `k` (i.e., `index > k`) that is strictly smaller than `A[k]`. If no such element exists, we can consider it as `N` (an imaginary boundary after the array end).

Once `leftSmaller[k]` and `rightSmaller[k]` are known for a given `k`, `A[k]` is the minimum element in the continuous subsequence `A[leftSmaller[k] + 1 ... rightSmaller[k] - 1]`.
The length of this subsequence is `(rightSmaller[k] - 1) - (leftSmaller[k] + 1) + 1`, which simplifies to `rightSmaller[k] - leftSmaller[k] - 1`.

The algorithm proceeds in three main steps:

1.  **Compute `leftSmaller` array:** Iterate through the array from left to right. Use a monotonic stack to efficiently find the `leftSmaller` index for each element. The stack will store indices of elements in increasing order of their values. When processing `A[i]`, pop elements from the stack whose values are greater than or equal to `A[i]`. The top of the stack (if not empty) will then be `leftSmaller[i]`. Push `i` onto the stack.
2.  **Compute `rightSmaller` array:** Iterate through the array from right to left. Use another monotonic stack (or clear and reuse the first one) to find the `rightSmaller` index for each element. Similar logic to `leftSmaller`, but iterating backwards.
3.  **Calculate Max Beautiful Value:** Iterate through the array from `k = 0` to `N-1`. For each `A[k]`, calculate its beautiful value as `A[k] * (rightSmaller[k] - leftSmaller[k] - 1)`. Keep track of the maximum value found.

Each element is pushed onto and popped from the stack at most once in both Step 1 and Step 2, making these steps O(N). Step 3 is a simple O(N) loop. Thus, the overall time complexity is O(N).

### Example Walkthrough (for `A = [1, 2, 3]`)

`N = 3`, `A = [1, 2, 3]`

**1. `leftSmaller` array:**
Initialize `leftSmaller = [-1, -1, -1]`, `stack = []`

-   `i = 0`, `A[0] = 1`: `stack` is empty. `leftSmaller[0] = -1`. Push `0`. `stack = [0]`.
-   `i = 1`, `A[1] = 2`: `A[stack.top()] = A[0] = 1`. `1 < 2`, so don't pop. `leftSmaller[1] = stack.top() = 0`. Push `1`. `stack = [0, 1]`.
-   `i = 2`, `A[2] = 3`: `A[stack.top()] = A[1] = 2`. `2 < 3`, so don't pop. `leftSmaller[2] = stack.top() = 1`. Push `2`. `stack = [0, 1, 2]`.

Final `leftSmaller = [-1, 0, 1]`

**2. `rightSmaller` array:**
Initialize `rightSmaller = [3, 3, 3]`, `stack = []`

-   `i = 2`, `A[2] = 3`: `stack` is empty. `rightSmaller[2] = 3`. Push `2`. `stack = [2]`.
-   `i = 1`, `A[1] = 2`: `A[stack.top()] = A[2] = 3`. `3 >= 2`, pop `2`. `stack = []`. `stack` is empty. `rightSmaller[1] = 3`. Push `1`. `stack = [1]`.
-   `i = 0`, `A[0] = 1`: `A[stack.top()] = A[1] = 2`. `2 >= 1`, pop `1`. `stack = []`. `stack` is empty. `rightSmaller[0] = 3`. Push `0`. `stack = [0]`.

Final `rightSmaller = [3, 3, 3]`

**3. Calculate max beautiful value:**
Initialize `maxBeautifulValue = 0`

-   `k = 0`, `A[0] = 1`: `leftSmaller[0] = -1`, `rightSmaller[0] = 3`. Length = `3 - (-1) - 1 = 3`. Beautiful value = `1 * 3 = 3`. `maxBeautifulValue = 3`.
-   `k = 1`, `A[1] = 2`: `leftSmaller[1] = 0`, `rightSmaller[1] = 3`. Length = `3 - 0 - 1 = 2`. Beautiful value = `2 * 2 = 4`. `maxBeautifulValue = 4`.
-   `k = 2`, `A[2] = 3`: `leftSmaller[2] = 1`, `rightSmaller[2] = 3`. Length = `3 - 1 - 1 = 1`. Beautiful value = `3 * 1 = 3`. `maxBeautifulValue = 4`.

Final result: `4`. This matches the example output.