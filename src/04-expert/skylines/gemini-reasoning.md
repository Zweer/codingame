The problem asks us to count the number of lines required to draw the visible skyline of a city composed of rectangular buildings. The rules for line counting are crucial:
1.  **Single Building:** 3 lines (left wall, roof, right wall). This implies we count the segments of the outer perimeter.
2.  **Two Separate Buildings:** 7 lines (3 for each building, plus 1 for the ground connection). This also fits the perimeter model, where the ground is drawn if it's the base of the skyline.
3.  **Two Partially Overlapping or Adjacent Buildings of Different Heights:** 5 lines. This example depicts a scenario where a taller building (left) partially covers a shorter one (right). The resulting skyline has a left wall, a roof, a connecting vertical segment, another roof, and a right wall. This strongly suggests counting the segments of the *outer contour* of the combined shape.

This problem is a classic application of the **sweep-line algorithm** for calculating skyline outlines.

**Algorithm:**

1.  **Represent Buildings as Events:**
    For each building defined by `(h, x1, x2)`, we create two events:
    *   A 'start' event at `x1` with height `h`. This means a building begins here, potentially increasing the skyline height.
    *   An 'end' event at `x2` with height `h`. This means a building ends here, potentially decreasing the skyline height.

2.  **Sort Events:**
    Sort all events primarily by their `x`-coordinate in ascending order.
    If two events have the same `x`-coordinate, their relative order matters for accurate height calculation at that point. A common strategy for skyline problems is to process 'end' events before 'start' events at the same `x`. This ensures that if a building ends and another begins at the same `x`, the height drop from the ending building is registered before the rise from the starting building, correctly reflecting the 'net' height at that point.

3.  **Sweep Line and Count Lines:**
    *   Initialize `lines = 0`.
    *   `activeHeights`: A `Map<number, number>` (or similar data structure) to store the counts of buildings currently active at each height. For example, `activeHeights.set(h, count)` means `count` buildings of height `h` are currently active.
    *   `prevX = 0`: The x-coordinate of the previous distinct event processed.
    *   `currentSkylineHeight = 0`: The effective maximum height of the skyline in the interval `[prevX, currentX)`.

    Iterate through the sorted events:
    *   For each `currentX` (the x-coordinate of the current event):
        *   **Group events at `currentX`:** Collect all events that share `currentX`. This is important because all changes at a single `x`-coordinate must be processed together to determine the `newSkylineHeight` at that point.
        *   **Count Horizontal Line Segment:** If `currentX > prevX`, it means there's a horizontal segment from `prevX` to `currentX`. This segment has the height `currentSkylineHeight` (the height before processing any events at `currentX`). Increment `lines` by 1 for this horizontal segment.
        *   **Update Active Heights:** Process all events grouped at `currentX`. For each 'start' event, increment its height's count in `activeHeights`. For each 'end' event, decrement its height's count. If a height's count becomes 0, remove it from `activeHeights`.
        *   **Calculate `newSkylineHeight`:** After processing all events at `currentX`, find the maximum height among all currently active buildings in `activeHeights`. This is the `newSkylineHeight`. If `activeHeights` is empty, `newSkylineHeight` is 0.
        *   **Count Vertical Line Segment:** If `newSkylineHeight` is different from `currentSkylineHeight`, it means a vertical line segment is formed at `currentX`. Increment `lines` by 1.
        *   **Update State:** Set `currentSkylineHeight = newSkylineHeight` and `prevX = currentX` for the next iteration.
        *   Advance the loop counter to skip all events already processed in the current `currentX` group.

**Example Tracing (B1: (10, 0, 5), B2: (5, 5, 15) -> Expected 5 lines):**

Events: `[{x:0, h:10, type:'start'}, {x:5, h:10, type:'end'}, {x:5, h:5, type:'start'}, {x:15, h:5, type:'end'}]`

Sorted Events (x-asc, then 'end' before 'start' if x same):
`[{x:0, h:10, type:'start'},`
 ` {x:5, h:10, type:'end'},   // 'end' event at x=5`
 ` {x:5, h:5, type:'start'},  // 'start' event at x=5`
 ` {x:15, h:5, type:'end'}]`

Initial: `lines=0`, `activeHeights={}`, `prevX=0`, `currentSkylineHeight=0`

1.  **Event `x=0`**:
    *   `currentX = 0`. `currentX > prevX` (0 > 0) is false. No horizontal line.
    *   Events at `x=0`: `[{x:0, h:10, type:'start'}]`. Process 'start' 10. `activeHeights={10:1}`.
    *   `newSkylineHeight = 10`.
    *   `newSkylineHeight !== currentSkylineHeight` (10 !== 0) is true. `lines++` (now 1). (This is (0,0)-(0,10) vertical line)
    *   Update: `currentSkylineHeight=10`, `prevX=0`.

2.  **Events `x=5`**:
    *   `currentX = 5`. `currentX > prevX` (5 > 0) is true. `lines++` (now 2). (This is (0,10)-(5,10) horizontal line)
    *   Events at `x=5`: `[{x:5, h:10, type:'end'}, {x:5, h:5, type:'start'}]`.
        *   Process `end` 10: `activeHeights.delete(10)`. `activeHeights={}`.
        *   Process `start` 5: `activeHeights.set(5,1)`. `activeHeights={5:1}`.
    *   `newSkylineHeight = 5`. (Max active height is 5).
    *   `newSkylineHeight !== currentSkylineHeight` (5 !== 10) is true. `lines++` (now 3). (This is (5,10)-(5,5) vertical line)
    *   Update: `currentSkylineHeight=5`, `prevX=5`.

3.  **Event `x=15`**:
    *   `currentX = 15`. `currentX > prevX` (15 > 5) is true. `lines++` (now 4). (This is (5,5)-(15,5) horizontal line)
    *   Events at `x=15`: `[{x:15, h:5, type:'end'}]`. Process `end` 5. `activeHeights.delete(5)`. `activeHeights={}`.
    *   `newSkylineHeight = 0`.
    *   `newSkylineHeight !== currentSkylineHeight` (0 !== 5) is true. `lines++` (now 5). (This is (15,5)-(15,0) vertical line)
    *   Update: `currentSkylineHeight=0`, `prevX=15`.

End of events. Total `lines = 5`. This matches the example's rule.

This algorithm correctly counts the number of continuous line segments that form the visible perimeter of the skyline, including ground segments between buildings.