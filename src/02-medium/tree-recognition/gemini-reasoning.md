The problem asks us to build Binary Search Trees (BSTs) from given lists of unique integers and then count how many distinct tree shapes (topologies) exist among all the constructed trees.

**1. Building the BST:**
For each list of integers, we construct a BST.
*   The first integer in the list becomes the root of the tree.
*   Subsequent integers are inserted one by one following the BST rules:
    *   If the new value is less than the current node's value, traverse to the left child.
    *   If the new value is greater than the current node's value, traverse to the right child.
    *   Continue this process until an empty (null) child position is found, and then insert the new value as a new node at that position.
    *   Since all values in a list are unique, we don't need to handle equality.

**2. Recognizing "Same Look" (Tree Shape):**
Two trees have the same "look" or "shape" if their structural arrangement of nodes and branches is identical, regardless of the actual values stored within the nodes. To achieve this, we need a way to generate a *canonical representation* (a unique string or hash) for each tree's shape.

A common and effective approach is to perform a pre-order traversal of the tree's structure, representing existing nodes and explicitly marking null (missing) children.

Our chosen method for `getShape()`:
*   Define a recursive function `_getShapeRecursive(node)`.
*   If `node` is `null`, return a specific marker, e.g., `"N"`. This signifies a missing branch.
*   If `node` is not `null`, recursively call `_getShapeRecursive` for its left child and right child. Concatenate their results and wrap them in parentheses to indicate the presence of the current node. The format will be `(LeftChildShapeRightChildShape)`.

**Example of Shape String Generation:**
Consider a simple tree:
```
    5
   / \
  2   7
   \
    3
```
1.  `_getShapeRecursive(null)` returns `"N"`.
2.  `_getShapeRecursive(3)` (a leaf node): `(_getShapeRecursive(null) + _getShapeRecursive(null))` = `(NN)`.
3.  `_getShapeRecursive(2)`: `(_getShapeRecursive(null) + _getShapeRecursive(3))` = `(N(NN))`.
4.  `_getShapeRecursive(7)` (a leaf node): `(_getShapeRecursive(null) + _getShapeRecursive(null))` = `(NN)`.
5.  `_getShapeRecursive(5)` (the root): `(_getShapeRecursive(2) + _getShapeRecursive(7))` = `((N(NN))(NN))`.

This string uniquely represents the structure of the tree. Trees with identical structures will produce identical shape strings.

**3. Counting Distinct Shapes:**
We will use a `Set` data structure (e.g., `Set<string>`). As we build each tree and generate its shape string, we add the string to the `Set`. A `Set` only stores unique values, so duplicate shape strings will automatically be ignored. After processing all `n` input lists, the final `size` of the `Set` will give us the total number of distinct tree shapes.

**Time Complexity:**
*   **Building a BST:** For `k` nodes, insertion takes `O(log k)` on average (for a balanced tree) and `O(k)` in the worst case (for a skewed tree, like inserting sorted numbers). So, building a tree is `O(k^2)` in the worst case, but on average `O(k log k)`. Given `k <= 16`, this is very fast.
*   **Generating Shape String:** This involves traversing each node once, which is `O(k)`. The length of the string is also `O(k)`.
*   **Set Insertion:** Inserting a string of length `L` into a `Set` is typically `O(L)`. Here, `L` is `O(k)`.
*   **Overall:** With `n` trees, the total time complexity will be `n * (build_time + shape_gen_time + set_insert_time)`. Since `k` is small (`16`), this will be extremely efficient and well within typical time limits (`200 * (16^2)` operations roughly).

**Code Structure:**

1.  **`Node` Class:** Represents a single node in the BST with `value`, `left` child, and `right` child.
2.  **`BST` Class:**
    *   `constructor()`: Initializes the tree with a `null` root.
    *   `insert(value)`: Inserts a new value, handling the root case and traversing to find the correct insertion point.
    *   `getShape()`: Public method to call the recursive shape generation.
    *   `_getShapeRecursive(node)`: Private recursive helper that generates the shape string.
3.  **Main Logic (`solve()` function):**
    *   Reads `n` and `k`.
    *   Initializes an empty `Set<string>` named `distinctShapes`.
    *   Loops `n` times:
        *   Reads the `k` integer values for the current tree.
        *   Creates a `BST` instance.
        *   Inserts all values into the `BST`.
        *   Generates the shape string using `bst.getShape()`.
        *   Adds the shape string to `distinctShapes`.
    *   Prints the final `distinctShapes.size`.