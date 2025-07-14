The problem asks us to solve a system of symbolic equations, outputting the most simplified form for each variable, or indicating if a circular reference exists.

**Core Idea:**

This problem can be modeled as finding the "value" of each variable in a dependency graph. If `A = F(B, C)`, then `A` depends on `B` and `C`. To find `A`'s value, we first need to find `B`'s and `C`'s values. This is a classic dependency resolution problem, best solved using a recursive approach with memoization and cycle detection (similar to a Depth-First Search or topological sort).

**Data Structures:**

1.  **`equationMap` (Map<string, { func: string, args: string[] }>):** This map stores the parsed equations. The key is the variable on the left-hand side (LHS), and the value is an object containing the function name (`func`) and an array of its argument variable names (`args`).
2.  **`solutionMap` (Map<string, string>):** This map acts as a cache (memoization) for already resolved variable expressions. The key is the variable name, and the value is its fully resolved symbolic expression as a string.
3.  **`resolvingPath` (Set<string>):** This set is crucial for detecting circular references. During the recursive resolution process, it keeps track of all variables currently in the call stack. If we try to resolve a variable that is already in `resolvingPath`, it means we've found a cycle.
4.  **`hasCircularReference` (boolean):** A global flag set to `true` if any circular reference is detected, allowing us to immediately stop further computation and output "No solution!".

**Algorithm Steps:**

1.  **Input Parsing:**
    *   Read `N` (number of variables).
    *   Read `N` space-separated variable names. Store them in an array `variables`. These are guaranteed to be in lexicographical order, which is convenient for the final output.
    *   Read `M` (number of equations).
    *   For each of the `M` equations:
        *   Parse the line in the format `variable = function ( arg1 arg2 ... )`.
        *   Extract the LHS variable, the function name, and its arguments.
        *   Store this information in `equationMap`.

2.  **Recursive Resolution (`resolve` function):**
    This function takes a `variableName` as input and returns its resolved symbolic expression string.

    *   **Early Exit for Global Error:** If `hasCircularReference` is already `true`, immediately return an empty string (or any dummy value), as we're already in an error state.
    *   **Memoization:** Check if `variableName` is already in `solutionMap`. If yes, return its cached solution directly.
    *   **Cycle Detection:** Check if `variableName` is already in `resolvingPath`. If yes, a circular reference is detected. Set `hasCircularReference` to `true` and return an empty string.
    *   **Add to Path:** Add `variableName` to `resolvingPath` to mark it as currently being resolved.
    *   **Base Case (Independent Variable):** If `variableName` is *not* found as a LHS in `equationMap` (meaning it's not defined by any equation), its solution is simply itself (e.g., `x -> x`). Store `variableName` in `solutionMap` and remove it from `resolvingPath`. Return `variableName`.
    *   **Recursive Step (Defined Variable):** If `variableName` *is* defined in `equationMap`:
        *   Retrieve its function name (`func`) and original arguments (`originalArgs`) from `equationMap`.
        *   Create an empty array `resolvedArgs`.
        *   For each `arg` in `originalArgs`:
            *   Recursively call `resolve(arg)` to get its resolved form.
            *   **Error Propagation:** If `hasCircularReference` becomes `true` after the recursive call, immediately return an empty string.
            *   Add the `resolvedArg` to `resolvedArgs`.
        *   Construct the `finalExpression` string by combining the `funcName` and the `resolvedArgs` in the required format: `funcName ( resolvedArg1 resolvedArg2 ... )`.
        *   Store this `finalExpression` in `solutionMap`.
        *   Remove `variableName` from `resolvingPath` (as its resolution is complete).
        *   Return `finalExpression`.

3.  **Main Execution Flow:**
    *   Initialize `solutionMap`, `resolvingPath`, and `hasCircularReference`.
    *   Iterate through each `varName` in the `variables` array (which is already sorted lexicographically).
    *   Call `resolve(varName)`.
    *   After each call, check `hasCircularReference`. If it's `true`, break the loop immediately, as we've found an unsolvable system.

4.  **Output:**
    *   If `hasCircularReference` is `true`, print "No solution!".
    *   Otherwise, iterate through the `variables` array again (ensuring lexicographical order) and print each variable's solution in the format `variable -> solutionMap.get(variable)!`.

**Example Walkthrough (`z = f ( x y )`, `y = h ( x )`):**

1.  `variables = ["x", "y", "z"]`
2.  `equationMap = { "y": { func: "h", args: ["x"] }, "z": { func: "f", args: ["x", "y"] } }`

*   **`resolve("x")`**: `x` is not in `equationMap`. Base case. `solutionMap["x"] = "x"`. Returns "x".
*   **`resolve("y")`**:
    *   `y` is in `equationMap` (`h(x)`).
    *   `resolvingPath` adds "y".
    *   `resolve("x")` is called. It returns "x" (from memoization).
    *   Constructs `h ( x )`. `solutionMap["y"] = "h ( x )"`. Returns "h ( x )".
    *   `resolvingPath` removes "y".
*   **`resolve("z")`**:
    *   `z` is in `equationMap` (`f(x, y)`).
    *   `resolvingPath` adds "z".
    *   `resolve("x")` is called. It returns "x".
    *   `resolve("y")` is called. It returns "h ( x )".
    *   Constructs `f ( x h ( x ) )`. `solutionMap["z"] = "f ( x h ( x ) )"`. Returns "f ( x h ( x ) )".
    *   `resolvingPath` removes "z".

Final Output:
`x -> x`
`y -> h ( x )`
`z -> f ( x h ( x ) )`

This approach correctly handles dependencies, memoizes results for efficiency, and detects circular references as required.