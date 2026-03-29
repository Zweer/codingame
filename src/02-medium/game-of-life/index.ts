// Read width and height from the first line of input
const inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);

// Initialize the current board based on input
// The board stores cell states as numbers: 0 for dead, 1 for live
const board: number[][] = [];
for (let i = 0; i < height; i++) {
    const rowString: string = readline();
    board.push(rowString.split('').map(char => parseInt(char)));
}

// Create a new board to store the next state.
// This is crucial because all calculations for the next state must be based on the current state simultaneously.
const nextBoard: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

/**
 * Counts the number of live neighbors for a given cell (r, c).
 * @param r Row index of the cell.
 * @param c Column index of the cell.
 * @param currentBoard The current state of the board.
 * @param h Height of the board.
 * @param w Width of the board.
 * @returns The count of live neighbors.
 */
function countLiveNeighbors(r: number, c: number, currentBoard: number[][], h: number, w: number): number {
    let liveNeighbors = 0;
    // Define relative coordinates for the 8 neighbors (top-left to bottom-right)
    const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let i = 0; i < 8; i++) {
        const nr = r + dr[i]; // Neighbor row
        const nc = c + dc[i]; // Neighbor column

        // Check if the neighbor is within the board boundaries
        if (nr >= 0 && nr < h && nc >= 0 && nc < w) {
            // If the neighbor cell is live (1), increment the count
            if (currentBoard[nr][nc] === 1) {
                liveNeighbors++;
            }
        }
    }
    return liveNeighbors;
}

// Iterate through each cell of the board to compute its next state
for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
        const currentState = board[r][c];
        const liveNeighbors = countLiveNeighbors(r, c, board, height, width);
        let nextState: number;

        if (currentState === 1) { // If the current cell is LIVE
            if (liveNeighbors < 2) {
                nextState = 0; // Rule 1: Dies due to under-population
            } else if (liveNeighbors === 2 || liveNeighbors === 3) {
                nextState = 1; // Rule 2: Lives on to the next generation
            } else { // liveNeighbors > 3
                nextState = 0; // Rule 3: Dies due to over-population
            }
        } else { // If the current cell is DEAD (currentState === 0)
            if (liveNeighbors === 3) {
                nextState = 1; // Rule 4: Becomes a live cell due to reproduction
            } else {
                nextState = 0; // Remains dead
            }
        }
        // Store the computed next state in the nextBoard
        nextBoard[r][c] = nextState;
    }
}

// Print the computed next board state, row by row
for (let r = 0; r < height; r++) {
    console.log(nextBoard[r].join('')); // Join the numbers in the row to form a string like "010"
}