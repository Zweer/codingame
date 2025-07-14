// Define readline function for CodinGame environment.
// In a real browser or Node.js environment, you'd use different input methods.
declare function readline(): string;

/**
 * Solves the Sandpile Addition puzzle.
 */
function solveSandpileAddition(): void {
    // Read N, the size of the sandpiles (N x N)
    const N: number = parseInt(readline());

    // Initialize two sandpile matrices (2D arrays)
    // Array.from is used to create arrays of arrays, ensuring proper deep initialization.
    const sandpile1: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    const sandpile2: number[][] = Array.from({ length: N }, () => Array(N).fill(0));

    // Read data for sandpile 1
    for (let i = 0; i < N; i++) {
        const rowString: string = readline();
        for (let j = 0; j < N; j++) {
            // Parse each character to an integer and store it
            sandpile1[i][j] = parseInt(rowString[j]);
        }
    }

    // Read data for sandpile 2
    for (let i = 0; i < N; i++) {
        const rowString: string = readline();
        for (let j = 0; j < N; j++) {
            sandpile2[i][j] = parseInt(rowString[j]);
        }
    }

    // Perform initial element-wise addition to create the sum grid
    const resultGrid: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            resultGrid[r][c] = sandpile1[r][c] + sandpile2[r][c];
        }
    }

    // Define relative coordinates for neighbors: [row_offset, col_offset]
    // These represent: Up, Down, Left, Right
    const dr: number[] = [-1, 1, 0, 0]; // Row changes for neighbors
    const dc: number[] = [0, 0, -1, 1]; // Column changes for neighbors

    // Normalization loop: continues as long as any toppling occurs in an iteration
    let toppleOccurred: boolean = true;
    while (toppleOccurred) {
        // Reset the flag for the current iteration. If no topples occur, the loop will exit.
        toppleOccurred = false;

        // Iterate through every cell in the grid
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                // Check if the current cell has 4 or more grains, indicating it needs to topple
                if (resultGrid[r][c] >= 4) {
                    toppleOccurred = true; // A topple happened, so another iteration might be needed

                    // The cell loses 4 grains
                    resultGrid[r][c] -= 4;

                    // Distribute 1 grain to each of its four neighbors
                    for (let i = 0; i < 4; i++) {
                        const nr: number = r + dr[i]; // Calculate neighbor's row
                        const nc: number = c + dc[i]; // Calculate neighbor's column

                        // Check if the neighbor's coordinates are within the grid boundaries
                        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
                            resultGrid[nr][nc] += 1; // Add a grain to the valid neighbor
                        }
                        // If the neighbor is out of bounds (touches an edge), the grain is lost.
                    }
                }
            }
        }
    }

    // Print the final, normalized sandpile
    for (let r = 0; r < N; r++) {
        let rowString: string = "";
        for (let c = 0; c < N; c++) {
            rowString += resultGrid[r][c].toString();
        }
        console.log(rowString);
    }
}

// Call the function to execute the puzzle solution
solveSandpileAddition();