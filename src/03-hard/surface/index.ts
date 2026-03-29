/**
 * Solves the Surface puzzle.
 * Reads map dimensions, map data, and queries, then outputs lake sizes.
 */
function solveSurface(): void {
    // Read map dimensions
    const L: number = parseInt(readline()); // Width of the map
    const H: number = parseInt(readline()); // Height of the map

    // Read the map data row by row
    const map: string[] = [];
    for (let i = 0; i < H; i++) {
        map.push(readline());
    }

    // lakeIdMap stores the unique ID of the lake each water cell belongs to.
    // -1 means the cell is either land ('#') or unvisited water ('O').
    // Once visited during BFS, it will store a positive integer representing its lake ID.
    // Using `fill(null).map(() => Array(L).fill(-1))` ensures each inner array is a distinct instance.
    const lakeIdMap: number[][] = Array(H).fill(null).map(() => Array(L).fill(-1));

    // lakeSizes stores the size (area) of each lake, indexed by its ID.
    // e.g., lakeSizes[1] would be the size of the lake with ID 1.
    const lakeSizes: { [id: number]: number } = {};
    let currentLakeId = 0; // Counter for unique lake IDs, starting from 1 for actual lakes

    // Define directions for exploring neighbors: [dx, dy] for (x+dx, y+dy)
    // Represents: Right, Left, Down, Up
    const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    // --- Phase 1: Pre-calculate all lake sizes and map lake IDs to cells ---
    // Iterate through every cell on the map
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < L; x++) {
            // If the cell is water ('O') and has not yet been assigned to a lake (checked via lakeIdMap)
            if (map[y][x] === 'O' && lakeIdMap[y][x] === -1) {
                currentLakeId++; // Assign a new unique ID for this newly found lake
                let currentLakeSize = 0; // Initialize size for this lake

                // Use a BFS (Breadth-First Search) to find all connected water cells
                const queue: [number, number][] = [];
                queue.push([x, y]); // Start BFS from this cell
                lakeIdMap[y][x] = currentLakeId; // Mark cell as visited and assign its lake ID
                currentLakeSize++; // Count this cell as part of the current lake

                let head = 0; // Manual queue head pointer for optimized performance (avoiding Array.shift())
                while (head < queue.length) {
                    const [cx, cy] = queue[head++]; // Dequeue current cell

                    // Explore all 4 (horizontal/vertical) neighbors
                    for (const [dx, dy] of directions) {
                        const nx = cx + dx;
                        const ny = cy + dy;

                        // Check if neighbor is within map boundaries
                        if (nx >= 0 && nx < L && ny >= 0 && ny < H) {
                            // Check if neighbor is water ('O') and has not been visited/assigned to a lake yet
                            if (map[ny][nx] === 'O' && lakeIdMap[ny][nx] === -1) {
                                lakeIdMap[ny][nx] = currentLakeId; // Mark as visited and assign lake ID
                                currentLakeSize++; // Increment lake size
                                queue.push([nx, ny]); // Enqueue neighbor for further exploration
                            }
                        }
                    }
                }
                // After BFS completes, the full size of the current lake is found
                lakeSizes[currentLakeId] = currentLakeSize;
            }
        }
    }

    // --- Phase 2: Process queries ---
    const N: number = parseInt(readline()); // Number of coordinates to be tested

    for (let i = 0; i < N; i++) {
        const [X, Y] = readline().split(' ').map(Number); // Read query coordinates

        // If the queried cell is land ('#'), its lake area is 0
        if (map[Y][X] === '#') {
            console.log(0);
        } else {
            // If it's a water cell ('O'), retrieve its pre-calculated lake ID and then its size
            const lakeId = lakeIdMap[Y][X];
            // Access the stored size using the lake ID.
            console.log(lakeSizes[lakeId]);
        }
    }
}

// Call the main function to execute the solution
solveSurface();