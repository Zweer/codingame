The problem asks us to find the optimal starting urinal `i` (1-indexed) to maximize the total number of guys `k` that can use the public toilet, following specific rules. If multiple `i` values yield the same maximum `k`, we should choose the smallest `i`.

**Rules for subsequent guys:**
1.  **Furthest away:** Each guy picks the free urinal furthest away from any occupied urinal. If there are multiple such urinals, any can be chosen. This implies maximizing `min(distance to nearest left occupied, distance to nearest right occupied)`.
2.  **No adjacent:** No guy will use a urinal if any of the urinals next to it is occupied. This means if urinal `X` is occupied, `X-1` and `X+1` must be empty. Consequently, if a urinal `Y` is considered for occupancy, `Y-1` and `Y+1` must currently be empty.

**Core Idea:**
The problem can be modeled as a simulation for each possible starting urinal `i`. However, `N` can be up to 1,500,000, so a naive `O(N^2)` simulation for each `i` (total `O(N^3)`) is too slow. We need a faster simulation, ideally `O(K log K)` where `K` is the number of guys (which is `O(N)`). Running this `O(N)` times for all `i` would still be `O(N^2 log N)`, which is also too slow.

The key insight for `N` up to 1,500,000 is that we usually only need to check a *few strategic starting positions* for `i`. These typically include the ends (`1`, `N`) and the middle (`N/2`, `N/2 +/- 1`). For each of these constant number of candidates, we run an `O(N log N)` simulation.

**Simulation Strategy (`O(K log K)` for a single `first_i`):**

1.  **Data Structures:**
    *   `occupied`: A `Set<number>` to quickly check if a urinal is occupied (average `O(1)`). This set will contain `0` and `N+1` as virtual "occupied" boundaries.
    *   `nodeMap`: A `Map<number, LinkedListNode>` where `LinkedListNode` represents an occupied urinal in a doubly linked list. This allows `O(1)` access to `prev` and `next` occupied urinals, which are crucial for defining "segments" and updating them.
    *   `pq`: A `MaxHeap` (priority queue) that stores potential moves. Each element in the heap will be `[score, urinal_to_pick, prevOccupiedBoundary, nextOccupiedBoundary]`.
        *   `score`: `min(distance to left occupied, distance to right occupied)`.
        *   `urinal_to_pick`: The specific urinal index (1-indexed) being considered for this move.
        *   `prevOccupiedBoundary`, `nextOccupiedBoundary`: The occupied urinals (or virtual walls `0`, `N+1`) that define the segment of empty urinals from which `urinal_to_pick` is derived. This is important for "stale" entry checking.

2.  **Initialization:**
    *   Create `headSentinel` (value `0`) and `tailSentinel` (value `N+1`) `LinkedListNode`s. Link them. Add them to `nodeMap`.
    *   Add `first_i` (the initial choice) to `occupied`. Add its `LinkedListNode` to the linked list structure by placing it between `0` and `N+1`.
    *   Initialize `numGuys = 1`.
    *   Identify the two segments created by `first_i`: `(0, first_i)` and `(first_i, N+1)`. For each valid segment, calculate its optimal urinal and score, and push to `pq`. A segment `(U_L, U_R)` means empty urinals `U_L+1` to `U_R-1`. The optimal `urinal_to_pick` in this segment is `U_L + 1 + floor((U_R - U_L - 1 - 1) / 2)`. Its score is `floor((U_R - U_L - 1 - 1) / 2) + 1`.

3.  **Main Simulation Loop (while `pq` is not empty):**
    *   Pop the top element `[score, u, prevOccupied, nextOccupied]` from `pq`.
    *   **Stale Entry Checks:**
        *   If `u` is already in `occupied` (it was picked by a previous guy, or is the starting `first_i`): continue.
        *   If `u-1` or `u+1` are in `occupied`: continue (violates "no adjacent" rule). This is critical.
        *   Check if `prevOccupied`'s *current* `next` is `nextOccupied` in the linked list (`nodeMap.get(prevOccupied)!.next!.value !== nextOccupied`). This ensures the segment hasn't been split by an earlier urinal placement. If it has, `continue`.
    *   If all checks pass, `u` is the chosen urinal:
        *   Add `u` to `occupied`. Increment `numGuys`.
        *   Update the doubly linked list: Get `U_L_node = nodeMap.get(prevOccupied)` and `U_R_node = nodeMap.get(nextOccupied)`. Insert `u`'s new `LinkedListNode` between `U_L_node` and `U_R_node`, updating their `prev`/`next` pointers. Add `u` to `nodeMap`.
        *   Create new segments: The placement of `u` splits the segment `(prevOccupied, nextOccupied)` into two new segments: `(prevOccupived, u)` and `(u, nextOccupied)`. For each new valid segment, calculate its optimal urinal and score, and push to `pq`.

4.  **Return `numGuys`**.

**Overall Algorithm:**

1.  Define the `simulate(n, first_i)` function as described above.
2.  Define a small set of `candidate_i` values to test: `1`, `N`, `floor(N/2)`, `ceil(N/2)`, and their immediate neighbors (`+/- 1`), ensuring they are within `[1, N]`. Sort these candidates to prioritize smaller `i` for ties.
3.  Initialize `maxK = 0` and `bestI = N + 1`.
4.  For each `i` in `filteredCandidates`:
    *   Call `currentK = simulate(N, i)`.
    *   If `currentK > maxK`, update `maxK = currentK` and `bestI = i`.
    *   Else if `currentK === maxK` and `i < bestI`, update `bestI = i`.
5.  Print `maxK` and `bestI`.

**Complexity:**
*   `MaxHeap` operations are `O(log K)`.
*   `Set` operations are average `O(1)`.
*   `Map` operations (for `nodeMap`) are average `O(1)`.
*   Each guy picked involves a few `MaxHeap` operations and a few `Map` operations. Total simulation: `O(K log K)`.
*   Number of candidates: Constant (e.g., ~6-8).
*   Total complexity: `C * O(N log N)`, which is efficient enough for `N=1.5M`.