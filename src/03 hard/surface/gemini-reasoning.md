The problem requires us to calculate the surface area of lakes on a given map. A map is composed of land ('#') and water ('O') squares. A lake is defined as a group of horizontally or vertically adjacent water squares. We need to process several queries, each providing a coordinate (X, Y), and output the size of the lake at that coordinate. If the coordinate is land, or there's no lake, the size is 0.

**Core Idea:**
This problem can be efficiently solved using a graph traversal algorithm like Breadth-First Search (BFS). Since there can be multiple queries on the same map, and lakes can be quite large, pre-calculating all lake sizes is the most optimal approach.

**Algorithm Steps:**

1.  **Input Parsing:**
    *   Read the map width `L` and height `H`.
    *   Read `H` lines to construct the map, storing it as a 2D array or array of strings.
    *   Read the number of queries `N`.

2.  **Pre-calculation of Lakes (BFS based):**
    *   Create a `lakeIdMap` (a 2D array of the same dimensions as the map) initialized with a special value (e.g., -1) indicating that a cell has not yet been visited or belongs to a lake. This map will store a unique ID for each lake.
    *   Create a `lakeSizes` object (or map) to store the calculated size for each lake ID.
    *   Initialize `currentLakeId = 0`.
    *   Iterate through every cell `(x, y)` of the map:
        *   If `map[y][x]` is 'O' (water) AND `lakeIdMap[y][x]` is still -1 (meaning this water cell hasn't been assigned to a lake yet):
            *   This indicates the discovery of a new, unvisited lake.
            *   Increment `currentLakeId` to assign a new unique ID to this lake.
            *   Initialize `currentLakeSize = 0`.
            *   Start a BFS from `(x, y)`:
                *   Create a queue and add `[x, y]` to it.
                *   Mark `lakeIdMap[y][x]` with `currentLakeId` and increment `currentLakeSize`.
                *   While the queue is not empty:
                    *   Dequeue a cell `[cx, cy]`.
                    *   For each of its four horizontal/vertical neighbors `[nx, ny]`:
                        *   Check if `[nx, ny]` is within map bounds.
                        *   Check if `map[ny][nx]` is 'O' (water) AND `lakeIdMap[ny][nx]` is -1 (unvisited).
                        *   If both conditions are true, mark `lakeIdMap[ny][nx]` with `currentLakeId`, increment `currentLakeSize`, and enqueue `[nx, ny]`.
            *   After the BFS completes, `currentLakeSize` will hold the total area of the lake identified by `currentLakeId`. Store this in `lakeSizes[currentLakeId]`.

3.  **Processing Queries:**
    *   For each of the `N` queries:
        *   Read the query coordinates `(X, Y)`.
        *   If `map[Y][X]` is '#'(land), print `0`.
        *   Otherwise (it's water 'O'), retrieve `lakeId = lakeIdMap[Y][X]`. This `lakeId` was assigned during the pre-calculation phase.
        *   Print `lakeSizes[lakeId]`.

**Time Complexity:**
*   **Pre-calculation:** Each cell `(L*H)` is visited at most once by the BFS process. Thus, this phase takes O(L * H) time.
*   **Queries:** Each query takes O(1) time (a direct lookup in `map` and `lakeIdMap`). For `N` queries, this is O(N).
*   **Total:** O(L * H + N). Given `L, H < 10000` and `N < 1000`, this approach is efficient enough (approx. 10^8 operations in the worst case, which is acceptable).

**Space Complexity:**
*   `map`: O(L * H) for storing the characters.
*   `lakeIdMap`: O(L * H) for storing lake IDs. This is the main memory consumer. For `10000x10000` map, `10^8` integers, which could be around 400MB to 800MB depending on how JavaScript numbers are stored. This should generally be within typical competitive programming limits (e.g., 512MB or 1GB).
*   `lakeSizes`: O(number of lakes), which is at most O(L * H) in a checkerboard pattern, but practically much less.
*   BFS `queue`: At most O(L * H) in the worst case (a single large lake).

**TypeScript Specifics:**
*   Using `readline()` for input (as provided by the CodinGame environment).
*   A manual `head` pointer for the BFS queue (`let head = 0; while (head < queue.length) { const [cx, cy] = queue[head++]; }`) is used instead of `Array.shift()` for performance reasons, as `shift()` can be an O(N) operation for large arrays.