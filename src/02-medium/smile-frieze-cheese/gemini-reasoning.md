The puzzle requires classifying a given ASCII pattern into one of the seven Frieze groups based on its symmetries. The pattern consists only of hyphens (`-`) and hashes (`#`).

The seven Frieze groups are:
1.  **p111**: No other transformations (besides horizontal translation).
2.  **p1m1**: Horizontal symmetry.
3.  **pm11**: Vertical symmetries.
4.  **p112**: 180-degree rotation symmetry.
5.  **pmm2**: Horizontal and vertical symmetries, and 180-degree rotation.
6.  **p1a1**: Glide-reflection symmetry.
7.  **pma2**: Vertical symmetries, 180-degree rotation, and glide-reflection (but no horizontal symmetry).

### Approach

1.  **Parse Input and Convert to Boolean Matrix**: Read the `N` lines of the pattern. Store it as a 2D array (matrix) of booleans, where `true` represents `#` and `false` represents `-`. This simplifies comparisons.

2.  **Find the Smallest Repeating Unit**: The problem states the pattern is "repetitive" and "won't be cut," meaning it's a series of identical units. We need to find the smallest width `W` of this repeating unit.
    *   The total width of the input pattern is `M`. `W` must be a divisor of `M`.
    *   We iterate through all divisors `w` of `M`, starting from the smallest. For each `w`, we check if `pattern[r][c] === pattern[r][c + w]` for all rows `r` and columns `c` within the range `[0, M-w-1]`.
    *   The first `w` that satisfies this condition is our `unitWidth`.
    *   To optimize this search, we find all divisors of `M` first (by checking up to `sqrt(M)`) and then sort them. This reduces the time complexity from `O(N * M^2)` to `O(sqrt(M) * N * M)`, which is acceptable for typical CodinGame constraints.

3.  **Extract the Unit Pattern**: Once `unitWidth` is found, extract the `N x unitWidth` sub-pattern from the original `pattern` matrix. Let's call this `unitPattern`. All symmetry checks will be performed on this `unitPattern`.

4.  **Implement Symmetry Checks**:
    *   `checkHorizontalSymmetry(unitPattern, N, W)`: Checks if `unitPattern[r][c]` equals `unitPattern[N-1-r][c]` for all `r, c`.
    *   `checkVerticalSymmetry(unitPattern, N, W)`: Checks if `unitPattern[r][c]` equals `unitPattern[r][W-1-c]` for all `r, c`.
    *   `checkRotationSymmetry(unitPattern, N, W)`: Checks if `unitPattern[r][c]` equals `unitPattern[N-1-r][W-1-c]` for all `r, c`.
    *   `checkGlideReflectionSymmetry(unitPattern, N, W)`: Checks if `unitPattern[r][c]` equals `unitPattern[N-1-r][(c + W/2) % W]` for all `r, c`. This symmetry requires the unit width `W` to be even; if `W` is odd, it cannot have glide-reflection symmetry.

5.  **Classify the Frieze Group**: After determining the presence of each symmetry (let's use boolean flags `hasH`, `hasV`, `hasR`, `hasG`), classify the pattern using a decision tree. The order of checks is crucial to correctly identify the most specific group.
    The order is based on the number and type of symmetries, prioritizing more complex groups or those with specific exclusions:
    *   If `hasH` and `hasV` (implies `hasR`): `pmm2`
    *   Else if `hasV` and `hasR` and `hasG` and `!hasH`: `pma2` (explicitly no horizontal symmetry)
    *   Else if `hasH`: `p1m1`
    *   Else if `hasV`: `pm11`
    *   Else if `hasR`: `p112`
    *   Else if `hasG`: `p1a1`
    *   Else (no symmetries detected): `p111`

### TypeScript Code