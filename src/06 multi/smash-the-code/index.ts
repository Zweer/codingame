/**
 * Global constants for the game grid.
 */
const GRID_WIDTH = 6;
const GRID_HEIGHT = 12; // Grid height is 12 rows (0-11)
const EMPTY_BLOCK = 0; // Represents an empty cell
const SKULL_BLOCK = 9; // Represents a skull block (using 9 to distinguish from 0 as an empty cell)

/**
 * Type alias for a 2D array representing the game grid.
 */
type Grid = number[][];

/**
 * Creates an empty grid initialized with EMPTY_BLOCK values.
 * @returns An empty Grid.
 */
function createEmptyGrid(): Grid {
    return Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(EMPTY_BLOCK));
}

/**
 * Parses grid lines from string format ('.', '0', '1'-'5') to internal number[][] representation.
 * '.' maps to EMPTY_BLOCK (0)
 * '0' maps to SKULL_BLOCK (9)
 * '1'-'5' map to their respective number values.
 * @param lines An array of strings, where each string represents a row of the grid.
 * @returns The parsed Grid.
 */
function parseGrid(lines: string[]): Grid {
    const grid: Grid = createEmptyGrid();
    for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            const char = lines[r][c];
            if (char === '.') {
                grid[r][c] = EMPTY_BLOCK;
            } else if (char === '0') {
                grid[r][c] = SKULL_BLOCK;
            } else {
                grid[r][c] = parseInt(char); // Colored block (1-5)
            }
        }
    }
    return grid;
}

/**
 * Creates a deep copy of the given grid. Essential for simulating moves without altering the original state.
 * @param grid The grid to copy.
 * @returns A new Grid instance that is a deep copy of the input grid.
 */
function deepCopyGrid(grid: Grid): Grid {
    return grid.map(row => [...row]);
}

/**
 * Finds the lowest empty row (highest row index) in a given column where a block can be dropped.
 * @param grid The current game grid.
 * @param col The column index (0-5) to check.
 * @returns The row index for the drop, or -1 if the column is full.
 */
function findDropHeight(grid: Grid, col: number): number {
    for (let r = GRID_HEIGHT - 1; r >= 0; r--) {
        if (grid[r][col] === EMPTY_BLOCK) {
            return r; // Lowest empty row in this column
        }
    }
    return -1; // Column is full
}

/**
 * Simulates dropping a pair of blocks (colorA on top of colorB) into the grid.
 * @param initialGrid The grid before the drop.
 * @param col The column (0-5) to drop the blocks into.
 * @param colorA Color of the top block.
 * @param colorB Color of the bottom block.
 * @returns The new grid after the drop, or null if the move is invalid (e.g., column full, blocks go out of bounds).
 */
function simulateDrop(initialGrid: Grid, col: number, colorA: number, colorB: number): Grid | null {
    const grid = deepCopyGrid(initialGrid);

    // Place block B (bottom block)
    const rowB = findDropHeight(grid, col);
    if (rowB === -1) {
        return null; // Column is full, cannot place bottom block
    }
    grid[rowB][col] = colorB;

    // Place block A (top block) directly above block B
    const rowA = findDropHeight(grid, col); // This will find the next available spot, which should be rowB - 1
    if (rowA === -1) { // If rowB was 0, then rowA would be -1, meaning block A goes out of bounds
        return null; // Invalid placement for block A
    }
    grid[rowA][col] = colorA;

    return grid;
}

/**
 * Performs a Breadth-First Search (BFS) or Depth-First Search (DFS) to find all connected blocks
 * of the same color starting from a given cell.
 * Updates a 'visited' array to prevent re-processing cells.
 * @param grid The current game grid.
 * @param startR Starting row for the search.
 * @param startC Starting column for the search.
 * @param targetColor The color of blocks to search for (1-5).
 * @param visited A 2D boolean array to keep track of visited cells during the search.
 * @returns A tuple: [groupSize, arrayOfBlocksInGroup].
 */
function findConnectedBlocks(grid: Grid, startR: number, startC: number, targetColor: number, visited: boolean[][]): [number, { r: number; c: number }[]] {
    const queue: { r: number; c: number }[] = [{ r: startR, c: startC }];
    const group: { r: number; c: number }[] = [];
    visited[startR][startC] = true;

    // Define directions for adjacent cells (Up, Down, Left, Right)
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    let head = 0; // Pointer for queue (acting as a manual queue for performance)
    while (head < queue.length) {
        const { r, c } = queue[head++];
        group.push({ r, c });

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            // Check bounds, if not visited, and if it's the target color block
            if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH &&
                !visited[nr][nc] && grid[nr][nc] === targetColor) {
                visited[nr][nc] = true;
                queue.push({ r: nr, c: nc });
            }
        }
    }
    return [group.length, group];
}

/**
 * Simulates the clearing process and gravity effects (chains) on the grid.
 * Blocks clear, fall, and new clears might occur. This repeats until no more blocks clear.
 * The grid is modified in place.
 * @param grid The grid to process. This grid will be modified based on game rules.
 * @returns The total number of blocks cleared during this entire chain reaction.
 */
function processClearsAndGravity(grid: Grid): number {
    let totalClearedBlocks = 0;
    let somethingClearedInChain = true;

    // Loop continues as long as new clears happen, simulating chain reactions
    while (somethingClearedInChain) {
        somethingClearedInChain = false; // Assume no clears for this iteration
        const blocksToClear: { r: number; c: number }[] = []; // Colored blocks to be cleared
        const skullBlocksToClear: { r: number; c: number }[] = []; // Skull blocks to be cleared
        // `visited` array needs to be reset for each 'tick' of the chain reaction
        // to find new groups formed after blocks fall.
        const visited = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(false));

        // Step 1: Find groups of 4+ colored blocks
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                const blockColor = grid[r][c];
                // Only process colored blocks (1-5) that haven't been visited yet
                if (blockColor !== EMPTY_BLOCK && blockColor !== SKULL_BLOCK && !visited[r][c]) {
                    const [groupSize, groupBlocks] = findConnectedBlocks(grid, r, c, blockColor, visited);
                    if (groupSize >= 4) {
                        groupBlocks.forEach(b => blocksToClear.push(b));
                        somethingClearedInChain = true; // Mark that a group was found and will be cleared
                    }
                }
            }
        }

        // If no groups were found in this iteration, the chain reaction ends
        if (!somethingClearedInChain) {
            break;
        }

        // Step 2: Clear identified colored blocks and find adjacent skull blocks
        // Using a Set to efficiently track cleared positions and prevent double-clearing/processing
        const clearedPositions = new Set<string>(); 

        // Clear colored blocks and add their positions to `clearedPositions`
        for (const { r, c } of blocksToClear) {
            // Ensure the block hasn't already been cleared by a previous group in this chain tick
            if (grid[r][c] !== EMPTY_BLOCK) {
                grid[r][c] = EMPTY_BLOCK; // Mark cell as empty
                totalClearedBlocks++;
                clearedPositions.add(`${r},${c}`);
            }
        }

        // Find skull blocks adjacent to the just-cleared colored blocks
        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];
        for (const { r, c } of blocksToClear) { // Iterate through the colored blocks that were just cleared
            for (let i = 0; i < 4; i++) {
                const nr = r + dr[i];
                const nc = c + dc[i];

                // Check bounds, if it's a skull block, and if it hasn't been marked for clearing already
                if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH &&
                    grid[nr][nc] === SKULL_BLOCK && !clearedPositions.has(`${nr},${nc}`)) {
                    skullBlocksToClear.push({ r: nr, c: nc });
                    clearedPositions.add(`${nr},${nc}`); // Mark as to be cleared to avoid duplicates
                }
            }
        }

        // Clear skull blocks
        for (const { r, c } of skullBlocksToClear) {
            grid[r][c] = EMPTY_BLOCK; // Mark cell as empty
            totalClearedBlocks++; // Count skull blocks as cleared for the total
        }

        // Step 3: Apply gravity (blocks fall to fill empty spaces)
        for (let c = 0; c < GRID_WIDTH; c++) { // Iterate through each column
            let emptyRow = GRID_HEIGHT - 1; // Start `emptyRow` pointer from the bottom of the column
            for (let r = GRID_HEIGHT - 1; r >= 0; r--) { // Iterate upwards from the bottom
                if (grid[r][c] !== EMPTY_BLOCK) { // If a block is found (not empty)
                    if (r !== emptyRow) { // If the block is not already in its lowest possible position
                        grid[emptyRow][c] = grid[r][c]; // Move the block down
                        grid[r][c] = EMPTY_BLOCK; // Clear its original position
                    }
                    emptyRow--; // Move the `emptyRow` pointer up to the next available empty slot
                }
            }
        }
        // The `while (somethingClearedInChain)` loop will now re-evaluate for new groups.
    }
    return totalClearedBlocks;
}

/**
 * Heuristic function to evaluate a given board state after a simulated move.
 * Aims to maximize cleared blocks and keep the board height low.
 * @param grid The current game grid after a simulated move and chain reaction.
 * @param clearedBlocks The total number of blocks cleared during the last chain reaction.
 * @returns A numeric score representing the "goodness" of the board state. Higher is better.
 */
function evaluateBoard(grid: Grid, clearedBlocks: number): number {
    let score = clearedBlocks * 1000; // High priority for clearing blocks (generates nuisance)

    // Calculate overall board height and identify the highest occupied row.
    let totalBlockHeight = 0; // Sum of (GRID_HEIGHT - row_index) for all blocks. Lower value means blocks are lower.
    let highestOccupiedRow = GRID_HEIGHT; // Initialize to a value outside the grid to easily find the minimum row index.
    
    for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            if (grid[r][c] !== EMPTY_BLOCK) {
                // (GRID_HEIGHT - r) assigns a "height" value to each block:
                // Block at r=0 (top) gets height 12. Block at r=11 (bottom) gets height 1.
                // Minimizing totalBlockHeight means keeping blocks lower in the grid.
                totalBlockHeight += (GRID_HEIGHT - r); 
                
                // Find the absolute highest block (smallest row index)
                if (r < highestOccupiedRow) {
                    highestOccupiedRow = r;
                }
            }
        }
    }

    // Apply a penalty for the overall height of blocks on the board.
    // A smaller totalBlockHeight is better.
    score -= totalBlockHeight * 10; 

    // Apply a strong penalty if the highest block is too close to the top,
    // as this indicates a high risk of losing the game.
    // Rows 0, 1, 2, 3 are considered dangerous.
    if (highestOccupiedRow < 4) { 
        score -= (4 - highestOccupiedRow) * 10000; // Strong penalty proportional to how high the block is
    } else if (highestOccupiedRow === GRID_HEIGHT) { // If the board is completely empty (no blocks)
        score += 500; // Small bonus for a clean board
    }

    return score;
}

// --- MAIN GAME LOOP ---
// CodinGame puzzles run in an infinite loop, reading input and providing output each turn.
while (true) {
    // Read the next 8 pairs of blocks. In this league, colorA is always equal to colorB.
    const nextPairs: { colorA: number; colorB: number }[] = [];
    for (let i = 0; i < 8; i++) {
        const line = readline().split(' ').map(Number);
        nextPairs.push({ colorA: line[0], colorB: line[1] });
    }

    // We only need to consider the immediate next pair for the current turn.
    const currentPair = nextPairs[0]; 

    // Read my score and grid state.
    const myScore = parseInt(readline());
    const myGridLines: string[] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
        myGridLines.push(readline());
    }
    const myGrid = parseGrid(myGridLines);

    // Read opponent's score and grid state (not used in this basic strategy).
    const oppScore = parseInt(readline());
    const oppGridLines: string[] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
        oppGridLines.push(readline());
    }
    // const oppGrid = parseGrid(oppGridLines);

    let bestCol = -1; // Stores the column for the best move
    let maxScore = -Infinity; // Tracks the highest score found for a move

    // Iterate through all 6 possible columns to drop the current pair.
    for (let col = 0; col < GRID_WIDTH; col++) {
        // Simulate dropping the blocks into the current column.
        const simulatedGrid = simulateDrop(myGrid, col, currentPair.colorA, currentPair.colorB);

        if (simulatedGrid === null) {
            // If the simulated move is invalid (e.g., column is full, blocks go out of bounds),
            // skip this column and try the next one.
            continue; 
        }

        // Process any clears and chain reactions that result from this drop.
        const clearedBlocks = processClearsAndGravity(simulatedGrid);
        
        // Evaluate the resulting board state after clears and gravity.
        const currentMoveScore = evaluateBoard(simulatedGrid, clearedBlocks);

        // If this move yields a higher score than previous moves, update the best move.
        if (currentMoveScore > maxScore) {
            maxScore = currentMoveScore;
            bestCol = col;
        }
    }

    // Output the chosen column.
    // A fallback is included in case no valid move is found (e.g., board is completely full).
    // In a normal game flow for Wood 1, a valid move should almost always be found unless
    // the player is about to lose.
    if (bestCol === -1) {
        // This scenario implies a full or nearly full board where even a 2-block drop isn't possible.
        // As a safeguard, try to find *any* valid column just to produce output and not crash.
        // This situation generally indicates a losing state.
        for (let col = 0; col < GRID_WIDTH; col++) {
            // Check if there's enough space for at least two blocks in this column
            if (findDropHeight(myGrid, col) > 0) { 
                bestCol = col;
                break;
            }
        }
        if (bestCol === -1) {
            // If still no column is found, the entire board is completely full or too high.
            // This is a definite loss. Output column 0 as a last resort.
            console.log("0 // No valid drop possible, board full!");
        } else {
             // Fallback: no optimal move by heuristic, chose the first valid one found.
             console.log(bestCol + " // Fallback: no optimal move, chose first valid");
        }
    } else {
        // Output the chosen column.
        console.log(bestCol);
    }
}