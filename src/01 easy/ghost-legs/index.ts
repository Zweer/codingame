// Required for CodinGame environment, usually implicitly available.
// Declared here for local TypeScript development/type checking.
declare function readline(): string;

function solve() {
    // Read W (width) and H (height) from the first line
    const [W, H] = readline().split(' ').map(Number);

    // Read all diagram lines into an array
    const diagramLines: string[] = [];
    for (let i = 0; i < H; i++) {
        diagramLines.push(readline());
    }

    // --- Extract Top Labels ---
    // Top labels are on the very first line (index 0) of the diagram.
    // Store them with their original column index to preserve output order.
    const topLabelsInfo: { label: string, col: number }[] = [];
    const topRow = diagramLines[0];
    for (let i = 0; i < W; i++) {
        const char = topRow[i];
        // Labels are single visible ASCII characters; spaces are not labels.
        if (char !== ' ') {
            topLabelsInfo.push({ label: char, col: i });
        }
    }

    // --- Extract Bottom Labels ---
    // Bottom labels are on the very last line (index H-1) of the diagram.
    // Use a Map for efficient lookup by column index later.
    const bottomLabelsMap = new Map<number, string>();
    const bottomRow = diagramLines[H - 1];
    for (let i = 0; i < W; i++) {
        const char = bottomRow[i];
        // Labels are single visible ASCII characters; spaces are not labels.
        if (char !== ' ') {
            bottomLabelsMap.set(i, char);
        }
    }

    // --- Simulate Path Traversal for Each Top Label ---
    const results: string[] = []; // To store the "TopLabelBottomLabel" pairs

    // Iterate through each top label in their left-to-right order
    for (const { label: topLabel, col: startCol } of topLabelsInfo) {
        let currentCol = startCol; // Current column of the path

        // Traverse downwards through the "legs" section of the diagram.
        // This section spans from row 1 (below top labels) to row H-2 (above bottom labels).
        for (let r = 1; r < H - 1; r++) {
            // Check for a horizontal connector to the right: |--
            // A connector starts at `currentCol` if `diagramLines[r][currentCol + 1]` and `[currentCol + 2]` are both '-'.
            // Ensure bounds are checked for array access.
            if (currentCol + 2 < W &&
                diagramLines[r][currentCol + 1] === '-' &&
                diagramLines[r][currentCol + 2] === '-') {
                currentCol += 3; // Move 3 columns to the right (to the next vertical line)
            }
            // Check for a horizontal connector to the left: --|
            // A connector ends at `currentCol` if `diagramLines[r][currentCol - 1]` and `[currentCol - 2]` are both '-'.
            // Ensure bounds are checked for array access.
            else if (currentCol - 2 >= 0 &&
                     diagramLines[r][currentCol - 1] === '-' &&
                     diagramLines[r][currentCol - 2] === '-') {
                currentCol -= 3; // Move 3 columns to the left (to the previous vertical line)
            }
            // If neither a right nor a left connector is found at the current position,
            // the path continues straight down in the same column.
        }

        // After traversing all relevant rows, 'currentCol' holds the final column
        // where the path ends at the bottom of the diagram.
        const bottomLabel = bottomLabelsMap.get(currentCol);

        // Based on puzzle guarantees, a bottom label should always be found.
        if (bottomLabel) {
            results.push(`${topLabel}${bottomLabel}`);
        }
    }

    // --- Output Results ---
    // Print each connected pair, one per line.
    results.forEach(pair => console.log(pair));
}

// Call the solve function to execute the puzzle logic.
solve();