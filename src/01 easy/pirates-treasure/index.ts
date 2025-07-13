/**
 * Reads a line from standard input.
 * In CodinGame environment, this function is usually provided globally.
 */
declare function readline(): string;

/**
 * Prints a message to standard output.
 * In CodinGame environment, this function is usually provided globally.
 */
declare function print(message: string): void;

function main() {
    // Read map dimensions
    const W: number = parseInt(readline());
    const H: number = parseInt(readline());

    // Read the map grid
    const map: number[][] = [];
    for (let i = 0; i < H; i++) {
        map.push(readline().split(' ').map(Number));
    }

    // Define relative coordinates for 8 neighbors (dx, dy)
    // (top-left, top, top-right, left, right, bottom-left, bottom, bottom-right)
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

    // Iterate through each cell of the map
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            // Check if the current cell is a free space (0) - a potential treasure location
            if (map[y][x] === 0) {
                let validNeighborCount = 0;    // Number of neighbors that are within map boundaries
                let obstacleNeighborCount = 0; // Number of valid neighbors that are obstacles

                // Check all 8 surrounding cells
                for (let i = 0; i < 8; i++) {
                    const nx = x + dx[i]; // Neighbor's x-coordinate
                    const ny = y + dy[i]; // Neighbor's y-coordinate

                    // Check if the neighbor is within the map boundaries
                    if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                        validNeighborCount++; // This is a valid neighbor

                        // If the valid neighbor is an obstacle (1)
                        if (map[ny][nx] === 1) {
                            obstacleNeighborCount++;
                        }
                    }
                }

                // If all valid neighbors are obstacles, this is the treasure
                // The 'validNeighborCount' will naturally be 3, 5, or 8 depending
                // on whether the cell is a corner, edge, or inside, implicitly
                // satisfying the puzzle's conditions.
                if (validNeighborCount === obstacleNeighborCount) {
                    print(`${x} ${y}`); // Output the treasure coordinates
                    return; // Exit as only one treasure is guaranteed
                }
            }
        }
    }
}

// Call the main function to start the puzzle logic
main();