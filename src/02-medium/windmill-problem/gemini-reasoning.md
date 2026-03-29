The problem describes a "windmill process" where a line rotates around a pivot point until it hits another point, which then becomes the new pivot. This process repeats `N` times. We need to find the final pivot's index and how many times each point was a pivot.

The key challenges are:
1.  **Large N**: `N` can be up to 10^12, which means a direct simulation is too slow. This typically implies cycle detection.
2.  **Line Definition and Angle Calculation**: The line `l` starts horizontally. When a new point `Q` becomes the pivot, the line becomes the segment `PQ` (where `P` was the old pivot and `Q` is the new one). Subsequent rotations happen around `Q` starting from the direction of `PQ`.
3.  **No three collinear points**: This is a crucial constraint. It ensures that for any two points, a third point will never lie exactly on the line segment formed by the first two. This simplifies angle comparison and avoids ambiguity when finding the "next" point.

**Algorithm Breakdown:**

1.  **State Representation for Cycle Detection**:
    Since "no three collinear points" is guaranteed, the line's direction is uniquely defined by the *previous pivot* and the *current pivot*. For example, if `P_prev` was the pivot and the line rotated to hit `P_curr`, then `P_curr` becomes the new pivot, and the line itself is `P_prev P_curr`. When rotating around `P_curr`, the direction to `P_prev` defines the starting angle of the rotation.
    Therefore, a state can be uniquely represented by the pair `(previousPivotIndex, currentPivotIndex)`.
    The total number of possible states is `K * K`. Since `K <= 30`, `30 * 30 = 900` states, which is small enough for cycle detection.

2.  **Angle Calculation**:
    Given a current pivot `P_curr = (Px, Py)` and a point `X = (Xx, Yx)`, the vector from `P_curr` to `X` is `(Xx - Px, Yx - Py)`. The angle of this vector with the positive X-axis can be found using `Math.atan2(Yx - Py, Xx - Px)`. This function returns angles in radians in the range `(-PI, PI]`.

    To find the next point hit by clockwise rotation:
    *   Determine the `currentLineAngle`. For the first step, it's `0` (horizontal). For subsequent steps, it's `Math.atan2(P_curr.y - P_prev.y, P_curr.x - P_prev.x)`.
    *   For every other point `X` (not `P_curr`):
        *   Calculate `angle_P_curr_X = Math.atan2(X.y - P_curr.y, X.x - P_curr.x)`.
        *   Calculate the `angleDiff` (clockwise difference) from `currentLineAngle` to `angle_P_curr_X`:
            `angleDiff = currentLineAngle - angle_P_curr_X`.
        *   If `angleDiff <= 0`, add `2 * Math.PI` to make it a positive clockwise angle (handling wrap-around, e.g., rotating from 0 degrees to -90 degrees is 270 degrees clockwise): `angleDiff += 2 * Math.PI`.
        *   The point `X` with the minimum `angleDiff` is the next point to be hit.

3.  **Simulation Loop with Cycle Detection**:
    *   Initialize `pivotCounts` array (size `K`) to all zeros.
    *   Set `currPivotIdx` to `P_start_idx`, and `prevPivotIdx` to `-1` (a sentinel value for the initial horizontal line).
    *   Increment `pivotCounts[currPivotIdx]` (the starting point is counted as a pivot).
    *   Use a `Map<string, StateInfo>` to store visited states. The key is `"${prevPivotIdx},${currPivotIdx}"`, and the value `StateInfo` contains the `step` (number of pivot changes completed to reach this state) and a copy of `pivotCounts` at that step.

    *   Loop `N` times (for `n` from `0` to `N-1`):
        a.  Determine `currentLineAngle`: `0` if `prevPivotIdx` is `-1`, otherwise derived from `points[prevPivotIdx]` and `points[currPivotIdx]`.
        b.  Form the `stateKey = "${prevPivotIdx},${currPivotIdx}"`.
        c.  **Cycle Detection**: If `visitedStates` already contains `stateKey`:
            *   We've found a cycle. Calculate `cycleStartNumChanges` and `countsAtCycleStart` from the stored `StateInfo`.
            *   Calculate `stepsInCycle = n - cycleStartNumChanges`.
            *   Calculate `remainingChanges = N - n`.
            *   Calculate `numFullCycles = Math.floor(remainingChanges / stepsInCycle)`.
            *   Apply the counts for `numFullCycles` to `pivotCounts`: for each `i`, `pivotCounts[i] += numFullCycles * (pivotCounts[i] - countsAtCycleStart[i])`.
            *   Advance `n` by `numFullCycles * stepsInCycle` to skip the simulated steps.
            *   If `n >= N`, all `N` changes are accounted for, so break the loop.
        d.  **Store State**: If no cycle was found for this state, store it: `visitedStates.set(stateKey, { step: n, counts: pivotCounts.slice() })`. The `step` `n` represents the number of pivot changes *completed* before entering this state.
        e.  **Find Next Pivot**: Iterate through all other points `i` in `S`. Calculate `angleDiff` (clockwise) from `currentLineAngle` to the vector `(P_curr, P_i)`. The point `i` with the minimum `angleDiff` becomes `nextPivotIdx`.
        f.  **Update State**: Set `prevPivotIdx = currPivotIdx`, `currPivotIdx = nextPivotIdx`. Increment `pivotCounts[currPivotIdx]`.

4.  **Output**: After the loop finishes, print `currPivotIdx` and then each count in `pivotCounts`.

The "no three collinear points" guarantee simplifies the `angleDiff` logic significantly as it ensures that `angleDiff` will never be exactly 0 (or 2PI) unless a point is the current pivot itself.