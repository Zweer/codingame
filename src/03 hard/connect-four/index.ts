// Define grid dimensions
const ROWS = 6;
const COLS = 7;

// Read the input grid
const grid: string[][] = [];
for (let i = 0; i < ROWS; i++) {
    // readline() is provided by the CodinGame environment
    grid.push(readline().split('')); 
}

/**
 * Checks if placing a token at (r, c) for 'player' results in a win.
 * @param r The row where the token was placed.
 * @param c The column where the token was placed.
 * @param player The player's token ('1' or '2').
 * @param currentGrid The current state of the game grid.
 * @returns True if a win is detected, false otherwise.
 */
function checkWinAt(r: number, c: number, player: string, currentGrid: string[][]): boolean {
    // Define the four directions to check: horizontal, vertical, main diagonal, anti-diagonal.
    // Only positive increments are needed for dr/dc because the 'k' loop covers all 4-token segments.
    const directions = [
        [0, 1],   // Horizontal (right)
        [1, 0],   // Vertical (down)
        [1, 1],   // Main Diagonal (down-right)
        [1, -1]   // Anti Diagonal (down-left)
    ];

    for (const [dr, dc] of directions) {
        // 'k' represents the position of the just-placed token (r, c) within a potential 4-token sequence.
        // k=0 means (r,c) is the first token, k=1 means it's the second, etc.
        // This allows checking all 4-token sequences that pass through (r, c).
        for (let k = 0; k < 4; k++) {
            // Calculate the starting coordinates of the 4-token sequence
            const startR = r - k * dr;
            const startC = c - k * dc;

            // Check if the entire 4-token sequence is within grid bounds
            // The sequence is from (startR, startC) to (startR + 3*dr, startC + 3*dc)
            if (startR >= 0 && startR + 3 * dr < ROWS &&
                startC >= 0 && startC + 3 * dc < COLS) {
                
                let isWinningLine = true;
                // Check if all 4 tokens in this sequence belong to the current player
                for (let i = 0; i < 4; i++) {
                    const checkR = startR + i * dr;
                    const checkC = startC + i * dc;
                    if (currentGrid[checkR][checkC] !== player) {
                        isWinningLine = false;
                        break; // Not a winning line, move to next k or direction
                    }
                }
                if (isWinningLine) {
                    return true; // Found a winning line
                }
            }
        }
    }
    return false; // No winning line found for this token placement
}

const player1Wins: number[] = [];
const player2Wins: number[] = [];

// Iterate through each column to simulate a move
for (let c = 0; c < COLS; c++) {
    let dropRow = -1; // Default to -1 indicating column is full

    // Find the lowest empty cell in the current column
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c] === '.') {
            dropRow = r;
            break; 
        }
    }

    // If the column is full, skip it and move to the next column
    if (dropRow === -1) {
        continue;
    }

    // Simulate Player 1's move
    grid[dropRow][c] = '1'; // Place token
    if (checkWinAt(dropRow, c, '1', grid)) {
        player1Wins.push(c); // Add column to winning list if it results in a win
    }
    grid[dropRow][c] = '.'; // Revert the grid for the next simulation

    // Simulate Player 2's move
    grid[dropRow][c] = '2'; // Place token
    if (checkWinAt(dropRow, c, '2', grid)) {
        player2Wins.push(c); // Add column to winning list if it results in a win
    }
    grid[dropRow][c] = '.'; // Revert the grid for the next simulation
}

// Output results for Player 1
if (player1Wins.length === 0) {
    console.log('NONE');
} else {
    // Sort columns and join with spaces
    console.log(player1Wins.sort((a, b) => a - b).join(' '));
}

// Output results for Player 2
if (player2Wins.length === 0) {
    console.log('NONE');
} else {
    // Sort columns and join with spaces
    console.log(player2Wins.sort((a, b) => a - b).join(' '));
}