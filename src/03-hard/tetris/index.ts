/**
 * Reads a line from standard input. In a CodinGame environment, this is usually provided globally.
 */
declare function readline(): string;

/**
 * Prints a string to standard output, followed by a newline. In a CodinGame environment, this is usually provided globally.
 */
declare function print(s: string): void; // Or console.log, depending on environment.

/**
 * Solves the Tetris puzzle.
 */
function solveTetrisPuzzle(): void {
    // 1. Read shape dimensions and content
    // SW: Shape Width, SH: Shape Height
    const [SW, SH] = readline().split(' ').map(Number);
    const shape: string[][] = [];
    for (let i = 0; i < SH; i++) {
        shape.push(readline().split('')); // Read each row of the shape
    }

    // 2. Read playfield dimensions and content
    // FW: Field Width, FH: Field Height
    const [FW, FH] = readline().split(' ').map(Number);
    const initialPlayfield: string[][] = [];
    // Read playfield rows from top to bottom, then reverse to store Y=0 at index 0.
    // This aligns the internal representation with the Y-axis definition (Y=0 is bottom).
    const tempPlayfieldRows: string[][] = [];
    for (let i = 0; i < FH; i++) {
        tempPlayfieldRows.push(readline().split(''));
    }
    // Store playfield such that initialPlayfield[0] is the bottom row (Y=0)
    for (let i = FH - 1; i >= 0; i--) {
        initialPlayfield.push(tempPlayfieldRows[i]);
    }

    // Variables to store the best placement found
    let bestX: number = -1;
    let bestY: number = -1;
    let maxClearedLines: number = -1; // Initialize with -1 to ensure the first valid candidate becomes the best

    let firstCandidateProcessed = false; // Flag to handle the initial assignment of best values

    // 3. Iterate through all possible placement positions (X, Y)
    // The Y-axis starts at 0 on the bottom and increases upwards.
    // (X, Y) refers to the top-left corner of the shape's bounding box.
    // This means Y is the highest Y-coordinate occupied by the shape.

    // Minimum Y for the top of the shape:
    // The shape's lowest part (Y - SH + 1) must be >= 0. So, Y >= SH - 1.
    // Maximum Y for the top of the shape:
    // The shape's topmost part (Y) must be <= FH - 1.
    for (let currentY = SH - 1; currentY < FH; currentY++) {
        // Minimum X: 0
        // Maximum X: FW - SW
        for (let currentX = 0; currentX <= FW - SW; currentX++) {

            // Create a deep copy of the playfield for simulation of this specific placement.
            // Using map(row => [...row]) ensures a deep copy for a 2D array of primitives.
            const simulatedPlayfield: string[][] = initialPlayfield.map(row => [...row]);

            // Place the shape onto the simulated playfield
            for (let sr = 0; sr < SH; sr++) { // sr: shape row index (0 from top)
                for (let sc = 0; sc < SW; sc++) { // sc: shape column index (0 from left)
                    if (shape[sr][sc] === '*') {
                        // Calculate playfield coordinates for this specific block of the shape
                        const px = currentX + sc;
                        const py = currentY - sr; // Y decreases as shape row index (sr) increases (from top to bottom)
                        
                        // As per problem statement, valid placement is guaranteed for the correct answer.
                        // For other placements, we simply place the block; overlapping is handled by setting '*'.
                        simulatedPlayfield[py][px] = '*';
                    }
                }
            }

            // 4. Count lines cleared for this specific placement
            let currentClearedLines = 0;
            for (let r = 0; r < FH; r++) { // Iterate through all rows of the playfield (Y=0 to Y=FH-1)
                let isRowFull = true;
                for (let c = 0; c < FW; c++) {
                    if (simulatedPlayfield[r][c] === '.') {
                        isRowFull = false;
                        break;
                    }
                }
                if (isRowFull) {
                    currentClearedLines++;
                }
            }

            // 5. Update best solution based on problem's criteria:
            // Priority: 1. Max cleared lines, 2. Smallest Y (lowest position), 3. Smallest X
            if (!firstCandidateProcessed) {
                // Initialize with the first valid candidate found
                maxClearedLines = currentClearedLines;
                bestX = currentX;
                bestY = currentY;
                firstCandidateProcessed = true;
            } else if (currentClearedLines > maxClearedLines) {
                // Found a placement with more cleared lines
                maxClearedLines = currentClearedLines;
                bestX = currentX;
                bestY = currentY;
            } else if (currentClearedLines === maxClearedLines) {
                // If same number of lines cleared, apply tie-breaking rules
                if (currentY < bestY) {
                    // Prefer a lower Y-coordinate (lowest position)
                    bestY = currentY;
                    bestX = currentX; // X must be updated too as it's a new (Y,X)
                } else if (currentY === bestY) {
                    // If same Y-coordinate, prefer a lower X-coordinate
                    if (currentX < bestX) {
                        bestX = currentX;
                    }
                }
            }
        }
    }

    // 6. Output the result
    console.log(`${bestX} ${bestY}`);
    console.log(maxClearedLines);
}

// Call the main function to solve the puzzle
solveTetrisPuzzle();