// Read input
const w: number = parseInt(readline());
const h: number = parseInt(readline());
const grid: string[][] = [];
for (let i = 0; i < h; i++) {
    grid.push(readline().split(''));
}

// Create a copy of the grid to modify for output
const outputGrid: string[][] = grid.map(row => [...row]);

// Directions for BFS (Up, Down, Left, Right)
const dr: number[] = [-1, 1, 0, 0];
const dc: number[] = [0, 0, -1, 1];

// Keep track of visited cells globally to handle multiple nets
const globalVisited: Set<string> = new Set<string>();

for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
        // If we find a '1' that hasn't been processed yet as part of a net
        if (grid[r][c] === '1' && !globalVisited.has(`${r},${c}`)) {
            const onePos = { r, c };

            // BFS to find all cells belonging to this net and locate the current '6'
            const queue: { r: number, c: number }[] = [];
            const netCells: Set<string> = new Set<string>(); // Store "r,c" strings of cells in this net
            let currentSixPos: { r: number, c: number } | null = null;
            
            queue.push(onePos);
            globalVisited.add(`${onePos.r},${onePos.c}`);
            
            let head = 0;
            while (head < queue.length) {
                const { r: currR, c: currC } = queue[head++];
                
                netCells.add(`${currR},${currC}`);

                if (grid[currR][currC] === '6') {
                    currentSixPos = { r: currR, c: currC };
                }

                // Explore neighbors
                for (let i = 0; i < 4; i++) {
                    const nr = currR + dr[i];
                    const nc = currC + dc[i];

                    // Check bounds, if it's a net piece (not '.'), and if not visited
                    if (nr >= 0 && nr < h && nc >= 0 && nc < w &&
                        grid[nr][nc] !== '.' && // Is part of a net (cell is #, 1, or 6)
                        !globalVisited.has(`${nr},${nc}`))
                    {
                        globalVisited.add(`${nr},${nc}`);
                        queue.push({ r: nr, c: nc });
                    }
                }
            }

            // Determine the target position for '6' based on '1' using straight-line extrapolation
            let targetSixPos: { r: number, c: number } | null = null;

            // Iterate over '1's neighbors to find the straight-line path
            for (let i = 0; i < 4; i++) {
                const nr = onePos.r + dr[i];
                const nc = onePos.c + dc[i];

                // Check if neighbor is part of the current net
                if (nr >= 0 && nr < h && nc >= 0 && nc < w && netCells.has(`${nr},${nc}`)) {
                    // Calculate the extrapolated position (extending the vector from '1' to its neighbor)
                    const nnr = nr + dr[i];
                    const nnc = nc + dc[i];

                    // Check if extrapolated position is valid and part of the current net
                    if (nnr >= 0 && nnr < h && nnc >= 0 && nnc < w && netCells.has(`${nnr},${nnc}`)) {
                        targetSixPos = { r: nnr, c: nnc };
                        break; // Found the target '6' position, it should be unique for a valid cube net
                    }
                }
            }

            // Apply corrections if '6' is in the wrong place
            if (currentSixPos && targetSixPos) {
                // Only modify if the current '6' is not already at the target position
                if (currentSixPos.r !== targetSixPos.r || currentSixPos.c !== targetSixPos.c) {
                    // Old '6' face becomes a generic net piece '#'
                    outputGrid[currentSixPos.r][currentSixPos.c] = '#'; 
                    // New '6' is placed at the correct position
                    outputGrid[targetSixPos.r][targetSixPos.c] = '6';   
                }
            }
            // The problem statement implies '6' is always present in a net,
            // so `currentSixPos` will not be null if `onePos` is valid.
        }
    }
}

// Print the modified grid
for (let i = 0; i < h; i++) {
    console.log(outputGrid[i].join(''));
}