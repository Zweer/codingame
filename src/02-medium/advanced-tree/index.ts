// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

/**
 * Represents a file or directory node in the file system tree.
 */
class FsNode {
    name: string;
    path: string; // Full path of the node
    type: 'directory' | 'file';
    children: Map<string, FsNode>; // Children nodes, keyed by their name

    constructor(name: string, path: string, type: 'directory' | 'file') {
        this.name = name;
        this.path = path;
        this.type = type;
        this.children = new Map(); // Only relevant for directories
    }
}

/**
 * Interface to hold the parsed command-line flags.
 */
interface ParsedFlags {
    includeHidden: boolean;    // -a flag
    directoriesOnly: boolean;  // -d flag
    maxDepth?: number;         // -L depth flag
}

// Global counters for visible directories and files (excluding the root S itself)
let totalVisibleDirs: number;
let totalVisibleFiles: number;

/**
 * Main function to solve the puzzle.
 */
function solve() {
    // Initialize counters for each run
    totalVisibleDirs = 0;
    totalVisibleFiles = 0;

    // Read input
    const s = readline(); // Starting path
    const f = readline(); // Flags string
    const n = parseInt(readline()); // Number of files

    const files: string[] = [];
    for (let i = 0; i < n; i++) {
        files.push(readline());
    }

    // 1. Parse Flags
    const flags: ParsedFlags = {
        includeHidden: false,
        directoriesOnly: false,
        maxDepth: undefined,
    };

    if (f) {
        f.split(',').forEach(flag => {
            if (flag === '-a') {
                flags.includeHidden = true;
            } else if (flag === '-d') {
                flags.directoriesOnly = true;
            } else if (flag.startsWith('-L')) {
                const depthStr = flag.substring(2);
                const depth = parseInt(depthStr);
                // Constraint: depth > 0
                if (!isNaN(depth) && depth > 0) {
                    flags.maxDepth = depth;
                }
            }
        });
    }

    // 2. Build the File System Tree
    // Stores all nodes by their full path for easy lookup
    const allNodesByPath = new Map<string, FsNode>();

    function addPathToTree(fullPath: string) {
        const segments = fullPath.split('/');
        let currentPath = '';
        let currentParentNode: FsNode | null = null;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            currentPath = (currentPath === '' ? segment : `${currentPath}/${segment}`);

            let node = allNodesByPath.get(currentPath);

            if (!node) {
                // If node doesn't exist, create it
                const nodeType = (i === segments.length - 1) ? 'file' : 'directory';
                node = new FsNode(segment, currentPath, nodeType);
                allNodesByPath.set(currentPath, node);

                // Add to parent's children if a parent exists
                if (currentParentNode) {
                    currentParentNode.children.set(segment, node);
                }
            }
            // Update currentParentNode for the next iteration
            currentParentNode = node;
        }
    }

    // Add all provided file paths to build the tree
    files.forEach(addPathToTree);

    // 3. Handle Starting Path S
    const effectiveRoot: FsNode | null = allNodesByPath.get(s) || null;

    // Check for error conditions based on S
    if (!effectiveRoot || effectiveRoot.type === 'file') {
        print(`${s} [error opening dir]`);
        return;
    }

    // Print the starting path S (always printed if it's a valid directory)
    print(s);

    // Helper function to get a sortable name (case-insensitive, ignores leading dot)
    function getSortableName(name: string): string {
        // "without considering the leading and first character '.' (dot)"
        return name.startsWith('.') ? name.substring(1).toLowerCase() : name.toLowerCase();
    }

    // Custom sort function for FsNodes
    function sortNodes(a: FsNode, b: FsNode): number {
        const keyA = getSortableName(a.name);
        const keyB = getSortableName(b.name);

        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    }

    /**
     * Recursive function to print children of a node and their descendants.
     * @param parentNode The node whose children are to be printed.
     * @param currentDisplayDepth The depth of the children being printed (relative to S). S is depth 0.
     * @param parentPrefix The indentation string for the current level of children.
     */
    function printChildrenRecursive(parentNode: FsNode, currentDisplayDepth: number, parentPrefix: string) {
        // Only directories can have children
        if (parentNode.type !== 'directory') {
            return;
        }

        let childrenToPrint: FsNode[] = [];

        // Apply depth limit. If children's depth exceeds maxDepth, they are not listed.
        if (flags.maxDepth === undefined || currentDisplayDepth <= flags.maxDepth) {
            childrenToPrint = Array.from(parentNode.children.values())
                .filter(child => {
                    // Filter based on -a flag (include hidden)
                    if (!flags.includeHidden && child.name.startsWith('.')) {
                        return false;
                    }
                    // Filter based on -d flag (directories only)
                    if (flags.directoriesOnly && child.type === 'file') {
                        return false;
                    }
                    return true;
                })
                .sort(sortNodes); // Sort filtered children
        }

        // Iterate and print each visible child
        childrenToPrint.forEach((child, index) => {
            const isLastChild = index === childrenToPrint.length - 1;
            const linePrefix = isLastChild ? '`-- ' : '|-- ';
            
            // Print the current child node line
            print(`${parentPrefix}${linePrefix}${child.name}`);

            // Increment counters for visible items (S itself is not counted here)
            if (child.type === 'directory') {
                totalVisibleDirs++;
            } else if (!flags.directoriesOnly) { // Only count files if -d is not active
                totalVisibleFiles++;
            }

            // Calculate the prefix for the next level's children (grandchildren).
            // This prefix determines the vertical lines and spaces for deeper levels.
            const nextPrefix = parentPrefix + (isLastChild ? '    ' : '|   ');

            // Recurse for the current child's children
            printChildrenRecursive(child, currentDisplayDepth + 1, nextPrefix);
        });
    }

    // 4. Start Tree Traversal and Printing
    // Start from the effectiveRoot's children.
    // The effectiveRoot (S) is at depth 0, so its children are at depth 1.
    // The initial prefix is empty.
    printChildrenRecursive(effectiveRoot, 1, '');

    // 5. Print the Final Report Line
    let reportLine = `${totalVisibleDirs} ${totalVisibleDirs === 1 ? 'directory' : 'directories'}`;
    if (!flags.directoriesOnly) {
        reportLine += `, ${totalVisibleFiles} ${totalVisibleFiles === 1 ? 'file' : 'files'}`;
    }
    print(reportLine);
}

// Call the solve function to execute the program
solve();