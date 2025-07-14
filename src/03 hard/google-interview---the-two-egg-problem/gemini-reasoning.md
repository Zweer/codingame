To solve the Two Egg Problem, we need to find the minimal number of drops in the worst case to determine the highest floor an egg can be dropped from without breaking. We are given `N` floors and two identical eggs.

## Reasoning

Let `k` be the maximum number of drops we are willing to take in the worst case. Our goal is to find the smallest integer `k` that allows us to cover `N` floors.

The optimal strategy for this problem involves a decreasing sequence of initial jumps for the first egg. The idea is to balance the worst-case scenarios:
1. The first egg breaks, and we need to use the second egg to perform a linear search in the segment below where the first egg broke.
2. The first egg does not break, and we can continue using it, but with fewer drops remaining.

To ensure the worst-case number of drops is minimized, we must design the strategy such that no matter when the first egg breaks (or if it never breaks), the total number of drops always equals `k`.

Let's trace this strategy:

- **Drop 1:** We drop the first egg from floor `k`.
    - **Scenario A: The egg breaks at floor `k`.**
        This means the highest safe floor `F` is somewhere between 1 and `k-1`. We have used 1 drop. We have `k-1` drops remaining for the second egg. To find `F` precisely, we must check floors `1, 2, ..., k-1` sequentially with the second egg. This will take `k-1` additional drops.
        Total drops in this scenario: 1 (first egg) + (k-1) (second egg) = `k`. This works.
    - **Scenario B: The egg does not break at floor `k`.**
        This means `F >= k`. We have used 1 drop. We have `k-1` drops remaining. Since we didn't break the first egg, we can use it again. The "budget" for remaining drops has decreased by one, so the size of our next jump should also decrease by one.

- **Drop 2:** If the first egg didn't break at floor `k`, we drop it from floor `k + (k-1)`.
    - **Scenario A: The egg breaks at floor `k + (k-1)`.**
        This means `F` is between `k` and `k + (k-1) - 1`. We have used 2 drops. We have `k-2` drops remaining for the second egg. We must check floors `k+1, k+2, ..., k+(k-1)-1` sequentially. The number of floors to check is `(k+(k-1)-1) - k = k-2`. This will take `k-2` additional drops.
        Total drops in this scenario: 2 (first egg) + (k-2) (second egg) = `k`. This works.
    - **Scenario B: The egg does not break at floor `k + (k-1)`.**
        This means `F >= k + (k-1)`. We have used 2 drops. We have `k-2` drops remaining. We prepare for the next jump.

This pattern continues. Each time the first egg doesn't break, we make the next jump smaller by one floor, specifically, by `(drops_remaining - 1)`. The sequence of floors where we drop the first egg would be:
`k`
`k + (k-1)`
`k + (k-1) + (k-2)`
...
until the last jump is `1`.

The total number of floors `N_max` that this strategy can cover in `k` drops is the sum of these jumps:
`N_max = k + (k-1) + (k-2) + ... + 1`

This is the sum of the first `k` natural numbers, which can be calculated using the formula:
`N_max = k * (k + 1) / 2`

We need to find the smallest integer `k` such that `k * (k + 1) / 2 >= N`.

To solve for `k`, we can rearrange the inequality:
`k^2 + k >= 2N`
`k^2 + k - 2N >= 0`

We can find the roots of the quadratic equation `k^2 + k - 2N = 0` using the quadratic formula `k = [-b ± sqrt(b^2 - 4ac)] / 2a`:
`k = [-1 ± sqrt(1^2 - 4 * 1 * (-2N))] / (2 * 1)`
`k = [-1 ± sqrt(1 + 8N)] / 2`

Since `k` must be a positive number (number of drops), we take the positive root:
`k = (-1 + Math.sqrt(1 + 8N)) / 2`

Since `k` must be an integer, and we need the smallest `k` that satisfies the inequality, we take the ceiling of this calculated floating-point value.

**Example: N = 100**
`k = (-1 + Math.sqrt(1 + 8 * 100)) / 2`
`k = (-1 + Math.sqrt(801)) / 2`
`k ≈ (-1 + 28.30) / 2`
`k ≈ 27.30 / 2`
`k ≈ 13.65`
Taking the ceiling: `k = 14`.
This matches the example output.

## Code