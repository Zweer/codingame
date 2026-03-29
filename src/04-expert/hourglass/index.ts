// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;
// declare function printErr(message: string): void; // Uncomment for debugging stderr output

function solveHourglass(): void {
    const hourglassLines: string[] = [];
    for (let i = 0; i < 23; i++) {
        hourglassLines.push(readline());
    }
    const N: number = parseInt(readline());

    // Convert hourglass to a 2D character grid for manipulation
    const grid: string[][] = hourglassLines.map(line => line.split(''));

    // Count initial 'o's for validation
    let initialOsCount = 0;
    for (let r = 0; r < 23; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 'o') {
                initialOsCount++;
            }
        }
    }

    if (initialOsCount !== 100) {
        print("BROKEN HOURGLASS");
        return;
    }

    // Precompute top half sand removal coordinates
    const topRemovalCoords: { row: number; col: number }[] = [];
    // Number of 'o's for lines 1 to 10 of a full top half
    // Index 0 corresponds to line 1, index 9 to line 10
    const numOsPerTopLine: number[] = [19, 17, 15, 13, 11, 9, 7, 5, 3, 1];
    const centerCol = 11; // All 'o's are centered around column 11

    // Based on example output, removal prioritizes lines 3, 2, 1, then the rest.
    // 'd' is the horizontal distance from the center column.
    for (let d = 0; d <= 9; d++) { // Max 'd' is 9 for line 1 (19 grains: 1 center + 2*9 side grains)
        // Group 1: Lines 3, 2, 1 (higher priority according to example output)
        for (let r = 3; r >= 1; r--) {
            const numOsForThisLine = numOsPerTopLine[r - 1]; // Use r-1 for 0-indexed numOsPerTopLine
            const maxDForLine = (numOsForThisLine - 1) / 2; // Max 'd' this line can support

            if (d <= maxDForLine) {
                if (d === 0) { // Center grain
                    topRemovalCoords.push({ row: r, col: centerCol });
                } else { // Two grains (left and right of center)
                    topRemovalCoords.push({ row: r, col: centerCol - d });
                    topRemovalCoords.push({ row: r, col: centerCol + d });
                }
            }
        }
        // Group 2: Lines 10, 9, ..., 4 (remaining lines)
        for (let r = 10; r >= 4; r--) {
            const numOsForThisLine = numOsPerTopLine[r - 1];
            const maxDForLine = (numOsForThisLine - 1) / 2;

            if (d <= maxDForLine) {
                if (d === 0) { // Center grain
                    topRemovalCoords.push({ row: r, col: centerCol });
                } else { // Two grains (left and right of center)
                    topRemovalCoords.push({ row: r, col: centerCol - d });
                    topRemovalCoords.push({ row: r, col: centerCol + d });
                }
            }
        }
    }

    // Precompute bottom half sand filling coordinates
    const bottomFillCoords: { row: number; col: number }[] = [];

    // 1. Vertical trail (10 grains) from line 12 to 21
    for (let r = 12; r <= 21; r++) {
        bottomFillCoords.push({ row: r, col: centerCol });
    }

    // 2. Horizontal expansion (remaining 90 grains)
    for (let d = 1; d <= 9; d++) { // Max 'd' is 9 for line 21 (19 grains)
        for (let r = 21; r >= 12; r--) { // From bottom line 21 up to 12
            // For line `r` (12-indexed), max 'd' is `r - 12`.
            // e.g., line 12 has 1 'o', so max_d = 0.
            // e.g., line 21 has 19 'o's, so max_d = (19-1)/2 = 9.
            const maxDForLine = r - 12;

            if (d <= maxDForLine) {
                bottomFillCoords.push({ row: r, col: centerCol - d });
                bottomFillCoords.push({ row: r, col: centerCol + d });
            }
        }
    }

    // Apply N seconds: remove N grains from top, add N grains to bottom
    // The problem statement implies that if N exceeds the current top grains,
    // the bottom half will still reflect N grains, potentially becoming fully
    // filled even if the source (top) didn't have enough.
    // Since initial total is 100, and N <= 100, we simply apply N changes.
    for (let i = 0; i < N; i++) {
        // Remove grain from top half
        if (i < topRemovalCoords.length) {
            const { row, col } = topRemovalCoords[i];
            grid[row][col] = ' '; // Change 'o' to space
        }
        
        // Add grain to bottom half
        if (i < bottomFillCoords.length) {
            const { row, col } = bottomFillCoords[i];
            grid[row][col] = 'o'; // Change space to 'o'
        }
    }

    // Output the modified hourglass
    for (let r = 0; r < 23; r++) {
        print(grid[r].join(''));
    }
}

solveHourglass();