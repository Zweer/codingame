function solve() {
    // Read the board size L
    const L: number = parseInt(readline());
    const board: string[][] = [];
    for (let i = 0; i < L; i++) {
        board.push(readline().split(''));
    }

    let blackScore: number = 0;
    let whiteScore: number = 0;

    // 1. Count stones on the board
    for (let r = 0; r < L; r++) {
        for (let c = 0; c < L; c++) {
            if (board[r][c] === 'B') {
                blackScore++;
            } else if (board[r][c] === 'W') {
                whiteScore++;
            }
        }
    }

    // 2. Calculate territories for empty intersections
    // visited array to keep track of processed empty cells across all BFS traversals
    const visited: boolean[][] = Array(L).fill(0).map(() => Array(L).fill(false));

    // Directions for 4-way movement (up, down, left, right)
    const dr = [-1, 1, 0, 0]; // Row changes
    const dc = [0, 0, -1, 1]; // Column changes

    for (let r = 0; r < L; r++) {
        for (let c = 0; c < L; c++) {
            // If it's an unvisited empty cell, start a BFS to find its connected region and determine its ownership
            if (board[r][c] === '.' && !visited[r][c]) {
                let currentRegionSize = 0;
                const potentialOwners = new Set<string>(); // Stores 'B' or 'W' found adjacent to this region
                let isContested = false; // Flag if the region touches stones of both colors

                const queue: [number, number][] = [[r, c]];
                visited[r][c] = true; // Mark the starting cell as visited immediately

                while (queue.length > 0) {
                    const [currR, currC] = queue.shift()!; // Dequeue the current cell
                    currentRegionSize++; // Increment size of the current empty region

                    // Explore all 4 neighbors
                    for (let i = 0; i < 4; i++) {
                        const nr = currR + dr[i];
                        const nc = currC + dc[i];

                        // Check if the neighbor is within board boundaries
                        if (nr >= 0 && nr < L && nc >= 0 && nc < L) {
                            const neighborChar = board[nr][nc];

                            if (neighborChar === '.') {
                                // If neighbor is an empty cell and not yet visited, add it to the queue
                                if (!visited[nr][nc]) {
                                    visited[nr][nc] = true;
                                    queue.push([nr, nc]);
                                }
                            } else { // Neighbor is a stone ('B' or 'W')
                                // If this is the first stone color found, add it as a potential owner
                                if (potentialOwners.size === 0) {
                                    potentialOwners.add(neighborChar);
                                } else if (!potentialOwners.has(neighborChar)) {
                                    // If we've already found a potential owner, and this neighbor stone is of a different color,
                                    // then this empty region is contested and cannot be territory for a single player.
                                    isContested = true;
                                }
                            }
                        }
                        // Neighbors out of bounds are simply ignored; they do not disqualify territory based on problem example.
                    }
                }
                
                // After the BFS has explored the entire connected empty region:
                // If it's not contested (surrounded by stones of only one color or no stones)
                // AND it's surrounded by exactly one type of stone (potentialOwners.size === 1)
                if (!isContested && potentialOwners.size === 1) {
                    const owner = potentialOwners.values().next().value; // Get the single owner color
                    if (owner === 'B') {
                        blackScore += currentRegionSize;
                    } else if (owner === 'W') {
                        whiteScore += currentRegionSize;
                    }
                }
                // Otherwise (if contested, or not surrounded by stones, or surrounded by multiple stone types),
                // this region is not a territory for either player.
            }
        }
    }

    // 3. Apply Komi: White gets an additional 6.5 points
    whiteScore += 6.5;

    // 4. Print results in the specified format
    console.log(`BLACK : ${blackScore}`);
    console.log(`WHITE : ${whiteScore.toFixed(1)}`); // Use toFixed(1) to ensure ".5" format for White's score

    // Determine and print the winner
    if (blackScore > whiteScore) {
        console.log("BLACK WINS");
    } else {
        console.log("WHITE WINS");
    }
}

// Call the solve function to execute the game logic
solve();