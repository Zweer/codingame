The problem asks us to implement a simplified version of the UNIX `tree` command in TypeScript. We need to parse file paths, build a tree structure, apply filtering based on flags (`-a`, `-d`, `-L depth`), sort the output, and print a summary line.

Here's a breakdown of the approach:

1.  **Data Structures:**
    *   `FsNode`: A class or interface to represent a file or directory. Each node will have a `name`, its `path` (full path for identification), `type` ('directory' or 'file'), and if it's a directory, a `children` map to store its immediate descendants. The `children` map uses the child's name as the key for easy lookup and ensures uniqueness within a directory.
    *   `allNodesByPath`: A global `Map<string, FsNode>` to store all created nodes, keyed by their full path. This allows quick access to any node given its path and helps in determining if the starting path `S` exists and its type.
    *   `ParsedFlags`: An interface to hold the parsed state of the command-line flags.

2.  **Input Parsing and Flag Handling:**
    *   Read the starting path `S`, the flags string `F`, and the number of files `N`.
    *   Parse `F`: Split the string by commas.
        *   `-a`: Set `includeHidden` to `true`.
        *   `-d`: Set `directoriesOnly` to `true`.
        *   `-L depth`: Parse the `depth` value and set `maxDepth`. Ignore if `depth` is invalid or not a positive integer.

3.  **Building the File System Tree:**
    *   Iterate through each input file path.
    *   For each path, split it into segments (e.g., `./Directory1/File1` becomes `[".", "Directory1", "File1"]`).
    *   Traverse the segments, creating `FsNode` objects for directories and files as needed.
    *   Store each created node in `allNodesByPath` with its full path as the key.
    *   Connect parent-child relationships using the `children` map of `FsNode`. The root node `.` will be the starting point of the overall tree.

4.  **Handling the Starting Path `S`:**
    *   After building the entire tree, check if `S` exists in `allNodesByPath`.
    *   If `S` does not exist or is a file, print `S [error opening dir]` and exit.
    *   Otherwise, `S` is a valid starting directory. Print `S` as the first line of the output.

5.  **Tree Traversal and Printing (Recursive Function):**
    *   A recursive function `printChildrenRecursive(parentNode: FsNode, currentDisplayDepth: number, parentPrefix: string)` is used to traverse and print the tree.
        *   `parentNode`: The current directory whose children are to be processed.
        *   `currentDisplayDepth`: The depth of the *children* relative to the starting path `S` (where `S` is at depth 0, its direct children at depth 1, etc.).
        *   `parentPrefix`: The accumulated indentation string from `S` down to `parentNode`. This string determines the `|   ` or `    ` parts before the `|--` or `` `-- `` for the current level's children.
    *   **Filtering Children:** Before printing, filter `parentNode.children` based on the flags:
        *   `-L depth`: Only include children if `currentDisplayDepth` is less than or equal to `maxDepth`.
        *   `-a`: If `includeHidden` is `false`, exclude children whose names start with `.`.
        *   `-d`: If `directoriesOnly` is `true`, exclude file children.
    *   **Sorting Children:** Sort the filtered children using a custom comparison function (`sortNodes`). This function ignores the leading `.` for hidden files/directories and performs a case-insensitive alphabetical sort.
    *   **Printing Each Child:** Iterate through the sorted children:
        *   Determine `linePrefix`: `|-- ` for non-last children, `` `-- `` for the last child.
        *   Print the line: `${parentPrefix}${linePrefix}${child.name}`.
        *   **Counting:** Increment `totalVisibleDirs` if the child is a directory, or `totalVisibleFiles` if it's a file and `-d` is not active. The starting path `S` itself is NOT included in these counts, matching the example output.
        *   **Recurse:** Calculate `nextPrefix` for the grandchildren based on `parentPrefix` and whether the current `child` is the last sibling (e.g., `parentPrefix + (isLastChild ? '    ' : '|   ')`). Then recursively call `printChildrenRecursive` for the `child`.
    *   The initial call to `printChildrenRecursive` will be with `effectiveRoot`, `currentDisplayDepth = 1`, and `parentPrefix = ''`.

6.  **Final Report Line:**
    *   After the recursion completes, print the summary: `<x> directories, <y> files` or `<x> directories` if `-d` is active.
    *   Handle pluralization (`directory`/`directories`, `file`/`files`).

**Sorting Logic (`getSortableName`):**
The problem specifies sorting "without considering the leading and first character '.' (dot) from hidden files or directories names."
This means `.foo` and `foo` should both sort based on the string `foo`.
The `getSortableName(name: string)` helper achieves this by returning `name.substring(1).toLowerCase()` if `name` starts with `.` and `name.toLowerCase()` otherwise.