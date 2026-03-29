// For CodinGame, readline() is globally available.
// For local testing, you might need to mock or provide input manually.

const [W, H] = readline().split(' ').map(Number);

const originalGrid: string[][] = [];
let hasBuildings = false;

for (let i = 0; i < H; i++) {
    const row = readline().split('');
    originalGrid.push(row);
    // Check for buildings to handle the "no buildings" edge case early
    if (!hasBuildings && row.includes('B')) {
        hasBuildings = true;
    }
}

// Rule: If no buildings exist at all, no zerglings should be included in the output.
if (!hasBuildings) {
    originalGrid.forEach(row => console.log(row.join('')));
    // In CodinGame, exiting is not explicitly needed, the program just ends.
    // In Node.js, process.exit(0); could be used.
} else {
    // isZerglingSpot[r][c] will be true if cell (r,c) is an empty spot '.' that Zerglings can reach from the border.
    const isZerglingSpot: boolean[][] = Array(H).fill(0).map(() => Array(W).fill(false));

    // Queue for BFS: stores [row, column]
    const queue: [number, number][] = [];
    let head = 0; // Pointer for the front of the queue (more performant than Array.shift())

    // Directions for 8-directional movement:
    // dr = delta row, dc = delta column
    const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

    // Initialize BFS queue with all empty border cells
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            // A cell is a border cell if it's on the first/last row or first/last column.
            if (originalGrid[r][c] === '.' && (r === 0 || r === H - 1 || c === 0 || c === W - 1)) {
                if (!isZerglingSpot[r][c]) { // Ensure not to add duplicates
                    isZerglingSpot[r][c] = true;
                    queue.push([r, c]);
                }
            }
        }
    }

    // BFS to find all reachable empty cells according to zergling movement rules
    while (head < queue.length) {
        const [currR, currC] = queue[head++];

        for (let i = 0; i < 8; i++) {
            const nR = currR + dr[i];
            const nC = currC + dc[i];

            // 1. Check bounds
            if (nR < 0 || nR >= H || nC < 0 || nC >= W) {
                continue;
            }

            // 2. If the neighbor is already marked as a zergling spot, skip (already visited/enqueued)
            if (isZerglingSpot[nR][nC]) {
                continue;
            }

            // 3. If the neighbor is not an empty space (it's 'B' or '#'), zerglings cannot enter
            if (originalGrid[nR][nC] !== '.') {
                continue;
            }

            // 4. Diagonal blocking rule: "they will only be able to enter horizontal or vertical gaps:
            //    if buildings are diagonally adjacent they will block the zerglings."
            // This means for a diagonal move from (currR, currC) to (nR, nC),
            // both orthogonal intermediate cells (currR, nC) AND (nR, currC) must be empty ('.').
            // If either of them is 'B' or '#', the diagonal path is blocked.
            if (dr[i] !== 0 && dc[i] !== 0) { // Check if it's a diagonal move
                const intermediate1R = currR;
                const intermediate1C = nC;
                const intermediate2R = nR;
                const intermediate2C = currC;

                // Check if both intermediate cells are blocked ('B' or '#')
                if ((originalGrid[intermediate1R][intermediate1C] === 'B' || originalGrid[intermediate1R][intermediate1C] === '#') &&
                    (originalGrid[intermediate2R][intermediate2C] === 'B' || originalGrid[intermediate2R][intermediate2C] === '#')) {
                    continue; // Path blocked due to "no squeezing" through diagonal gaps
                }
            }

            // If all checks pass, mark as reachable zergling spot and enqueue
            isZerglingSpot[nR][nC] = true;
            queue.push([nR, nC]);
        }
    }

    // Prepare the final grid for output
    const finalGrid: string[][] = originalGrid.map(row => [...row]); // Deep copy

    // Flag to check if any zergling 'z' was actually placed adjacent to a building 'B'
    let anyZerglingAdjacentToBuilding = false;

    // Iterate through the original grid to find buildings and apply zerglings
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            // Rule: "Zerglings will surround all enemy buildings they can reach"
            // So we only care about empty cells adjacent to buildings.
            if (originalGrid[r][c] === 'B') {
                // Check all 8 neighbors of this building
                for (let i = 0; i < 8; i++) {
                    const nR = r + dr[i];
                    const nC = c + dc[i];

                    // Check bounds for the neighbor
                    if (nR >= 0 && nR < H && nC >= 0 && nC < W) {
                        // If the neighbor is an empty spot '.' AND it's reachable by zerglings
                        if (originalGrid[nR][nC] === '.' && isZerglingSpot[nR][nC]) {
                            finalGrid[nR][nC] = 'z'; // Mark as zergling
                            anyZerglingAdjacentToBuilding = true; // At least one zergling will stay
                        }
                    }
                }
            }
        }
    }

    // Rule: "if no building can be reached or if there are no buildings at all,
    // the zerglings will not stay (no zerglings should be included in the output)."
    // We already handled 'no buildings'. Now handle 'no building can be reached'.
    // If no 'z's were placed next to any building, it means no buildings were reachable.
    if (!anyZerglingAdjacentToBuilding) {
        // If no zerglings are adjacent to any building, revert all 'z's back to '.'
        // Note: this loop is efficient as 'z' would only be placed in the finalGrid
        // if originalGrid[r][c] was '.' AND isZerglingSpot[r][c] was true.
        // If anyZerglingAdjacentToBuilding is false, these 'z's must revert.
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                if (finalGrid[r][c] === 'z') {
                    finalGrid[r][c] = '.';
                }
            }
        }
    }

    // Print the resulting grid
    finalGrid.forEach(row => console.log(row.join('')));
}