The problem asks us to construct the "highest" truncated pyramid using a given number of `N` bricks. Each floor of the pyramid must contain one more brick than the previous floor, and floors start at the left of the line. Bricks are represented by `*`. We need to use at most `N` bricks and maximize the number of floors.

Let `k` be the number of floors in the pyramid and `f1` be the number of bricks on the first (topmost) floor.
The number of bricks on each floor will be:
*   Floor 1: `f1`
*   Floor 2: `f1 + 1`
*   Floor 3: `f1 + 2`
*   ...
*   Floor `k`: `f1 + (k - 1)`

The total number of bricks `S_k` for `k` floors starting with `f1` bricks is the sum of an arithmetic series:
`S_k = f1 + (f1 + 1) + ... + (f1 + k - 1)`
`S_k = k * f1 + (0 + 1 + 2 + ... + k - 1)`
The sum `0 + 1 + 2 + ... + (k - 1)` is `(k - 1) * k / 2`.
So, `S_k = k * f1 + k * (k - 1) / 2`.

To make the pyramid "highest", we need to maximize `k`.
For a given `k`, the minimum number of bricks required is when `f1 = 1`.
`min_S_k = k * 1 + k * (k - 1) / 2 = k + k * (k - 1) / 2 = k * (1 + (k - 1) / 2) = k * ((2 + k - 1) / 2) = k * (k + 1) / 2`.

**Algorithm:**

1.  **Find the maximum height (`optimalK`):**
    Iterate `k` starting from 1. For each `k`, calculate `min_S_k = k * (k + 1) / 2`.
    If `min_S_k` is less than or equal to `N`, then `k` floors are possible, and we update `optimalK = k`.
    If `min_S_k` exceeds `N`, then `k` floors are not possible even with `f1 = 1`, so the previous `k` was the maximum possible height. Break the loop.

2.  **Calculate the starting bricks (`f1`):**
    Once `optimalK` is determined, we know how many floors the pyramid will have.
    The `k * (k - 1) / 2` part of the total sum `S_k` represents the "incremental" bricks (the part that makes each floor wider than the previous one).
    Let `bricksForIncrements = optimalK * (optimalK - 1) / 2`.
    The remaining bricks `N_remaining = N - bricksForIncrements` must be distributed equally among `optimalK` floors to form the base `f1` for each floor.
    So, `optimalK * f1 <= N_remaining`. To maximize `f1` given `optimalK`, we divide `N_remaining` by `optimalK`. Since `f1` must be an integer, we take the floor: `f1 = Math.floor(N_remaining / optimalK)`.
    This `f1` is the largest possible base width for the `optimalK` height without exceeding `N` bricks.

3.  **Draw the pyramid:**
    Iterate from `i = 0` to `optimalK - 1`. For each `i`, the number of bricks on the current floor is `f1 + i`. Print `*` repeated `(f1 + i)` times.

**Example: N = 7**

1.  **Find `optimalK`:**
    *   `k = 1`: `min_S_1 = 1 * (1 + 1) / 2 = 1`. `1 <= 7`. `optimalK = 1`.
    *   `k = 2`: `min_S_2 = 2 * (2 + 1) / 2 = 3`. `3 <= 7`. `optimalK = 2`.
    *   `k = 3`: `min_S_3 = 3 * (3 + 1) / 2 = 6`. `6 <= 7`. `optimalK = 3`.
    *   `k = 4`: `min_S_4 = 4 * (4 + 1) / 2 = 10`. `10 > 7`. Break.
    So, `optimalK = 3`.

2.  **Calculate `f1`:**
    *   `bricksForIncrements = optimalK * (optimalK - 1) / 2 = 3 * (3 - 1) / 2 = 3 * 2 / 2 = 3`.
    *   `N_remaining = N - bricksForIncrements = 7 - 3 = 4`.
    *   `f1 = Math.floor(N_remaining / optimalK) = Math.floor(4 / 3) = 1`.

3.  **Draw the pyramid:**
    *   Floor 1 (`i = 0`): `f1 + 0 = 1 + 0 = 1` brick. Output: `*`
    *   Floor 2 (`i = 1`): `f1 + 1 = 1 + 1 = 2` bricks. Output: `**`
    *   Floor 3 (`i = 2`): `f1 + 2 = 1 + 2 = 3` bricks. Output: `***`
    Total bricks used: 1 + 2 + 3 = 6. (1 brick from `N` is unused, which is allowed as it states "contains N bricks").