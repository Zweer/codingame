The problem asks us to perform a topological sort on a set of actions, respecting specific precedence rules and a tie-breaking condition. The tie-breaking rule states that if multiple actions can be done simultaneously, the one that appeared first in the initial input order should be chosen. The number of actions `N` is very small (less than 10), which simplifies the choice of algorithms and allows for less optimized but more straightforward approaches.

**Reasoning:**

1.  **Graph Representation:** This is a classic dependency problem, best modeled as a directed acyclic graph (DAG).
    *   Each action is a **node** in the graph.
    *   A directed edge from action `A` to action `B` (`A -> B`) means `A` must be performed *before* `B`.
2.  **Tracking Dependencies:**
    *   We need an **adjacency list** (`graph: Map<string, Set<string>>`) to store for each action `A`, what other actions `A` *must precede*.
    *   We also need to track the number of **incoming edges** for each action (`inDegrees: Map<string, number>`). An action can only be performed when its `inDegree` (number of unmet prerequisites) drops to 0.
3.  **Tie-breaking Rule:** To implement the tie-breaking rule ("choose the one that appears first in the initial order"), we need:
    *   To store the actions in their original input order (`actions: string[]`).
    *   A way to quickly look up an action's original index (`actionToIndex: Map<string, number>`).
4.  **Topological Sort Algorithm (Kahn's Algorithm variant):**
    *   **Initialization:**
        *   Create `graph` and `inDegrees` for all actions, initially setting `inDegrees` to 0.
        *   Process the precedence rules:
            *   `a1 before a2`: Add an edge `a1 -> a2`. Increment `inDegrees` for `a2`.
            *   `a1 after a2`: This means `a2` must be before `a1`. Add an edge `a2 -> a1`. Increment `inDegrees` for `a1`.
    *   **Ready Queue:** Maintain a `readyQueue` (a list of actions whose `inDegree` is 0). This queue will always be kept sorted according to the initial input order.
        *   Initially populate `readyQueue` with all actions that have an `inDegree` of 0.
        *   Sort this initial `readyQueue` based on their `actionToIndex` to ensure the tie-breaking rule is applied from the start.
    *   **Main Loop:**
        *   While `readyQueue` is not empty:
            *   Dequeue (remove from the front) the first action (`currentAction`) from `readyQueue`. This action is chosen because it's ready and has the highest priority according to the tie-breaking rule.
            *   Add `currentAction` to our `result` list.
            *   For each `dependentAction` that `currentAction` directly precedes:
                *   Decrement `inDegrees` for `dependentAction`.
                *   If `inDegrees` for `dependentAction` becomes 0, it means `dependentAction` is now ready to be performed. Add it to `readyQueue`.
                *   **Crucially for tie-breaking:** After adding a new action to `readyQueue`, **re-sort the entire `readyQueue`** based on `actionToIndex`. Because `N` is very small, repeatedly sorting a list of at most `N` elements is computationally inexpensive and ensures the `readyQueue` always presents the next action correctly.
5.  **Output:** Print the actions in the `result` list, one per line.

**Example Walkthrough (from problem):**
Input:
```
3
Close
Open
Pour
2
Open before Pour
Close after Pour
```

1.  **Initialization:**
    *   `N = 3`
    *   `actions = ["Close", "Open", "Pour"]`
    *   `actionToIndex = {"Close": 0, "Open": 1, "Pour": 2}`
    *   `graph = {"Close":{}, "Open":{}, "Pour":{}}` (empty sets)
    *   `inDegrees = {"Close":0, "Open":0, "Pour":0}`

2.  **Process Rules:**
    *   `Open before Pour`: Add `Open -> Pour`.
        *   `graph.get("Open").add("Pour")`
        *   `inDegrees.set("Pour", 1)`
    *   `Close after Pour`: This means `Pour before Close`. Add `Pour -> Close`.
        *   `graph.get("Pour").add("Close")`
        *   `inDegrees.set("Close", 1)`
    *   Final `inDegrees = {"Close":1, "Open":0, "Pour":1}`

3.  **Topological Sort:**
    *   **Initial `readyQueue`:** Only "Open" has `inDegree = 0`.
        *   `readyQueue = ["Open"]`
        *   Sort `readyQueue` (no change, already sorted relative to itself).

    *   **Loop 1:**
        *   `currentAction = readyQueue.shift()` (`"Open"`)
        *   `result = ["Open"]`
        *   Process `Open`'s neighbors: `{"Pour"}`
            *   `inDegrees.set("Pour", 0)` (decremented from 1)
            *   `Pour`'s `inDegree` is now 0, so add `Pour` to `readyQueue`.
            *   `readyQueue = ["Pour"]`
            *   Sort `readyQueue` (no change).

    *   **Loop 2:**
        *   `currentAction = readyQueue.shift()` (`"Pour"`)
        *   `result = ["Open", "Pour"]`
        *   Process `Pour`'s neighbors: `{"Close"}`
            *   `inDegrees.set("Close", 0)` (decremented from 1)
            *   `Close`'s `inDegree` is now 0, so add `Close` to `readyQueue`.
            *   `readyQueue = ["Close"]`
            *   Sort `readyQueue` (no change).

    *   **Loop 3:**
        *   `currentAction = readyQueue.shift()` (`"Close"`)
        *   `result = ["Open", "Pour", "Close"]`
        *   Process `Close`'s neighbors: (none)

    *   `readyQueue` is empty. Loop terminates.

4.  **Output:**
    ```
    Open
    Pour
    Close
    ```
This matches the example output.

**Code:**