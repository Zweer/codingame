The problem asks for the minimum number of button presses to move an elevator from a starting floor `k` to a target floor `m`. The elevator is in a building with `n` floors and has two buttons: `UP` (moves `a` floors up) and `DOWN` (moves `b` floors down). The elevator cannot go below floor 1 or above floor `n`; if commanded to do so, it remains on its current floor.

This is a classic shortest path problem on an unweighted graph. Each floor can be considered a node, and pressing a button creates an edge between floors. Since we need the *minimal* number of button presses, Breadth-First Search (BFS) is the ideal algorithm. BFS explores all reachable floors layer by layer, guaranteeing that the first time the target floor `m` is reached, it will be by the shortest path.

### Reasoning

1.  **Graph Representation**:
    *   Nodes: Floors 1 to `n`.
    *   Edges: From a `currentFloor`, there are two potential moves:
        *   To `currentFloor + a` (if `currentFloor + a <= n`).
        *   To `currentFloor - b` (if `currentFloor - b >= 1`).
    *   Edge Weight: Each move (button press) has a weight of 1.

2.  **BFS Algorithm**:
    *   **State**: Each state in the BFS queue will be `[floor, steps]`, representing the current floor and the total steps taken to reach it.
    *   **Initialization**:
        *   Create a `visited` array (or map) of size `n+1` (for 1-indexed floors), initialized with `Infinity` for all floors. This array will store the minimum steps to reach each floor.
        *   Create a queue and add the starting state `[k, 0]` to it.
        *   Set `visited[k] = 0`.
    *   **Traversal**:
        *   While the queue is not empty:
            *   Dequeue `[currentFloor, steps]`.
            *   **Check Target**: If `currentFloor` is equal to `m`, we have found the shortest path. Print `steps` and terminate.
            *   **Explore Neighbors**:
                *   **Move UP**: Calculate `nextFloorUp = currentFloor + a`. If `nextFloorUp` is within bounds (`1 <= nextFloorUp <= n`) AND the path through `currentFloor` is shorter (`steps + 1 < visited[nextFloorUp]`), then update `visited[nextFloorUp] = steps + 1` and enqueue `[nextFloorUp, steps + 1]`.
                *   **Move DOWN**: Calculate `nextFloorDown = currentFloor - b`. If `nextFloorDown` is within bounds (`1 <= nextFloorDown <= n`) AND the path through `currentFloor` is shorter (`steps + 1 < visited[nextFloorDown]`), then update `visited[nextFloorDown] = steps + 1` and enqueue `[nextFloorDown, steps + 1]`.
    *   **Unreachable**: If the queue becomes empty and the target floor `m` has not been reached, it means `m` is unreachable. Print "IMPOSSIBLE".

3.  **Optimization for Queue**:
    *   In JavaScript/TypeScript, `Array.prototype.shift()` has `O(N)` time complexity (where N is the array size) because it re-indexes all remaining elements. For large `n` (up to 10000), this can lead to Time Limit Exceeded.
    *   A common optimization for queues in JavaScript is to use a `head` pointer. Instead of `shift()`, we simply increment `head` to simulate dequeuing, and `push()` for enqueuing. This makes both operations `O(1)`.

### Complexity:
*   **Time Complexity**: `O(N)`, where `N` is the number of floors. Each floor (node) is visited and enqueued at most once. For each visited floor, we perform a constant number of operations (two potential moves).
*   **Space Complexity**: `O(N)` for the `visited` array and the queue, both of which can store up to `N` elements in the worst case.

These complexities are well within the limits for `n <= 10000`.

### Example Walkthrough (from problem statement):
`n=10, a=1, b=1, k=8, m=5`

1.  `visited` array initialized to `Infinity`. `queue = []`.
2.  `queue.push([8, 0])`. `visited[8] = 0`. `head = 0`.
3.  Dequeue `[8, 0]`.
    *   Target `5` not reached.
    *   UP: `8+1=9`. `9 <= 10`. `0+1 < visited[9]` (`1 < Infinity`). `visited[9]=1`. `queue.push([9, 1])`.
    *   DOWN: `8-1=7`. `7 >= 1`. `0+1 < visited[7]` (`1 < Infinity`). `visited[7]=1`. `queue.push([7, 1])`.
    `queue = [[9, 1], [7, 1]]`. `head = 1`.
4.  Dequeue `[9, 1]`.
    *   Target `5` not reached.
    *   UP: `9+1=10`. `10 <= 10`. `1+1 < visited[10]` (`2 < Infinity`). `visited[10]=2`. `queue.push([10, 2])`.
    *   DOWN: `9-1=8`. `8 >= 1`. `1+1 < visited[8]` (`2 < 0`) is false.
    `queue = [[7, 1], [10, 2]]`. `head = 2`.
5.  Dequeue `[7, 1]`.
    *   Target `5` not reached.
    *   UP: `7+1=8`. `8 >= 1`. `1+1 < visited[8]` (`2 < 0`) is false.
    *   DOWN: `7-1=6`. `6 >= 1`. `1+1 < visited[6]` (`2 < Infinity`). `visited[6]=2`. `queue.push([6, 2])`.
    `queue = [[10, 2], [6, 2]]`. `head = 3`.
6.  Dequeue `[10, 2]`.
    *   Target `5` not reached.
    *   UP: `10+1=11`. Invalid.
    *   DOWN: `10-1=9`. `9 >= 1`. `2+1 < visited[9]` (`3 < 1`) is false.
    `queue = [[6, 2]]`. `head = 4`.
7.  Dequeue `[6, 2]`.
    *   Target `5` not reached.
    *   UP: `6+1=7`. `7 >= 1`. `2+1 < visited[7]` (`3 < 1`) is false.
    *   DOWN: `6-1=5`. `5 >= 1`. `2+1 < visited[5]` (`3 < Infinity`). `visited[5]=3`. `queue.push([5, 3])`.
    `queue = [[5, 3]]`. `head = 5`.
8.  Dequeue `[5, 3]`.
    *   Target `5` **is** reached! Print `3`. Terminate.