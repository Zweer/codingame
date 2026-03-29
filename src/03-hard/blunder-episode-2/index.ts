interface Room {
        money: number;
        exits: (number | 'E')[]; // 'E' represents an exit from the building
    }
    const rooms: Map<number, Room> = new Map();
    ```

2.  **Memoization Table:** We'll use a `Map` called `memo` to store the maximum money that can be collected starting from a particular room and reaching an exit. `memo.get(roomNum)` will store `maxMoney(roomNum)`.

    ```typescript
    const memo: Map<number, number> = new Map();
    ```

3.  **Recursive Function `findMaxMoney(roomNum)`:**
    *   **Base Case (Memoized):** If `memo.has(roomNum)` is true, it means we have already calculated the maximum money for this room. We can directly return `memo.get(roomNum)`.
    *   **Current Room's Value:** Retrieve the `money` and `exits` for `roomNum` from the `rooms` map.
    *   **Explore Exits:** Initialize a variable `maxMoneyFromExits` to `-Infinity`. This variable will store the maximum money collectible from any of the current room's children rooms to an exit.
        *   For each `exit` from the `currentRoom.exits`:
            *   If `exit` is `'E'` (an exit from the building), the money collected from this point onward is 0. So, we update `maxMoneyFromExits = Math.max(maxMoneyFromExits, 0)`.
            *   If `exit` is a room number, recursively call `findMaxMoney(exit)` to get the maximum money from that next room onwards. Update `maxMoneyFromExits = Math.max(maxMoneyFromExits, findMaxMoney(exit))`. It's crucial to check if `findMaxMoney(exit)` returns `-Infinity` (meaning that branch leads to a dead end), and only consider valid paths.
    *   **Calculate Total Money for Current Path:**
        *   If `maxMoneyFromExits` is still `-Infinity`, it means no valid path to an exit was found from any of the current room's children. In this case, this path is a dead end, and we return `-Infinity` to propagate this information up.
        *   Otherwise, the total money for the path starting at `roomNum` is `currentRoom.money + maxMoneyFromExits`.
    *   **Memoize and Return:** Store the calculated total money in `memo.set(roomNum, totalMoneyForCurrentPath)` before returning it.

4.  **Initial Call:** The puzzle states Blunder starts in room 0. So, we call `findMaxMoney(0)`. The result will be the maximum money Blunder can collect.

**Example Walkthrough (from problem description):**

Consider a simplified part of the example path: `... -> Room 7 (19) -> Room 12 (17) -> E`
*   `findMaxMoney(12)`: Money 17. Exits ['E', 'E']. Max from exits is `max(0, 0) = 0`. Returns `17 + 0 = 17`. Memoizes `memo[12] = 17`.
*   `findMaxMoney(7)`: Money 19. Exits [11, 12].
    *   Calls `findMaxMoney(11)` (let's assume it returns 14).
    *   Calls `findMaxMoney(12)` (retrieves 17 from `memo`).
    *   Max from exits is `max(14, 17) = 17`.
    *   Returns `19 + 17 = 36`. Memoizes `memo[7] = 36`.

This process continues recursively until `findMaxMoney(0)` is called, which then returns the final maximum amount.

**Time and Space Complexity:**
*   **Time Complexity:** O(N + E), where N is the number of rooms and E is the number of exits (edges). Each room (node) is visited once during the DFS (thanks to memoization), and for each room, its two exits (edges) are processed. Since each room has exactly two exits, E = 2N. So, the complexity is effectively O(N). Given N < 10000, this is highly efficient.
*   **Space Complexity:** O(N) for storing the `rooms` map and the `memo` map. The recursion stack depth can also go up to O(N) in the worst case (a long linear path).