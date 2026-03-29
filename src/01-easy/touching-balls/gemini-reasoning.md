The problem asks us to simulate the expansion of `N` non-overlapping spheres in a specific order. For each sphere, its radius should expand until it touches any of the other spheres. The key challenge is that when a sphere's radius is determined, it affects subsequent calculations for other spheres. Finally, we need to sum the cubes of the final radii and round the result.

Here's a breakdown of the approach:

1.  **Data Structure**: We'll represent each sphere with its `x`, `y`, `z` coordinates, and a `r` (radius) property. We also need to store the `originalR` because the problem states "expand the radius", implying the new radius must be at least the initial radius.

2.  **Distance Calculation**: A helper function `calculateDistance` is needed to compute the Euclidean distance between the centers of two spheres. The formula is `sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2)`.

3.  **Processing Order**: The spheres must be processed in the exact order they are given in the input. This is crucial because the "current" radius of a sphere depends on whether it has already been processed or not.

4.  **Radius Expansion Logic**: For each sphere `Si` at index `i` (being processed):
    *   Initialize `minRequiredRadius` to `Infinity`. This variable will store the smallest radius `Si` would need to touch *any* other sphere.
    *   Iterate through all *other* spheres `Sj` (where `j != i`):
        *   Determine the `currentRadiusOfSj`. If `j < i`, `Sj` has already been processed and its `r` property holds its expanded radius. If `j > i`, `Sj` has not yet been processed, and its `r` property still holds its original radius. This is naturally handled by using `spheres[j].r` directly as we modify `r` in place.
        *   Calculate the distance `d` between `Si` and `Sj`.
        *   The radius `Si` would need to touch `Sj` is `d - currentRadiusOfSj`. Let's call this `candidateRadius`.
        *   Update `minRequiredRadius = Math.min(minRequiredRadius, candidateRadius)`.
    *   After checking all other spheres, `minRequiredRadius` represents the smallest radius `Si` *could* become to touch another sphere.
    *   However, the radius must *expand* or stay the same. So, the new radius for `Si` is `Math.max(Si.originalR, minRequiredRadius)`. We update `spheres[i].r` with this new value.

5.  **Final Calculation**: After all spheres have been processed and their radii updated, iterate through the `spheres` array again. For each sphere, calculate `r^3` (using `Math.pow(r, 3)` or `r * r * r`) and add it to a running sum.

6.  **Output**: Round the final sum to the nearest integer using `Math.round()` and print it.

**Example Walkthrough (from problem):**

Input:
```
2
0 0 0 1
0 0 10 3
```

Initial Spheres:
`S0: {x: 0, y: 0, z: 0, r: 1, originalR: 1}`
`S1: {x: 0, y: 0, z: 10, r: 3, originalR: 3}`

**Processing S0 (i=0):**
*   `currentSphere = S0`
*   `minRequiredRadius = Infinity`
*   Compare `S0` with `S1` (`j=1`):
    *   Distance `d(S0, S1) = sqrt((0-0)^2 + (0-0)^2 + (0-10)^2) = sqrt(100) = 10`.
    *   `S1` has not been processed (`j > i`), so `currentRadiusOfS1 = S1.r = 3`.
    *   `candidateRadius = d(S0, S1) - currentRadiusOfS1 = 10 - 3 = 7`.
    *   `minRequiredRadius = min(Infinity, 7) = 7`.
*   Update `S0.r = Math.max(S0.originalR, minRequiredRadius) = Math.max(1, 7) = 7`.
*   Spheres now: `S0: {r: 7}`, `S1: {r: 3}`.

**Processing S1 (i=1):**
*   `currentSphere = S1`
*   `minRequiredRadius = Infinity`
*   Compare `S1` with `S0` (`j=0`):
    *   Distance `d(S1, S0) = 10`.
    *   `S0` has been processed (`j < i`), so `currentRadiusOfS0 = S0.r = 7` (its expanded radius).
    *   `candidateRadius = d(S1, S0) - currentRadiusOfS0 = 10 - 7 = 3`.
    *   `minRequiredRadius = min(Infinity, 3) = 3`.
*   Update `S1.r = Math.max(S1.originalR, minRequiredRadius) = Math.max(3, 3) = 3`.
*   Spheres now: `S0: {r: 7}`, `S1: {r: 3}`.

**Final Sum of Cubes:**
*   `S0.r^3 = 7^3 = 343`
*   `S1.r^3 = 3^3 = 27`
*   Sum = `343 + 27 = 370`.
*   Rounded to nearest integer: `370`.

This matches the example output.