/**
 * The `readline()` function is provided by the CodinGame environment for reading input.
 * It reads one line of input at a time.
 */
declare function readline(): string;

// Read N for the length of one side of the room
const N: number = parseInt(readline());

// Read L for the base light of the candles
const L: number = parseInt(readline());

// Initialize the light grid with 0s.
// This 2D array will store the maximum light level for each cell.
const lightGrid: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));

// Store the coordinates of all candles found in the room.
const candlePositions: { r: number, c: number }[] = [];

// Read the N lines of the room map
for (let r = 0; r < N; r++) {
    const rowChars: string[] = readline().split(' ');
    for (let c = 0; c < N; c++) {
        // If a character is 'C', it's a candle. Store its position.
        if (rowChars[c] === 'C') {
            candlePositions.push({ r, c });
        }
    }
}

// Calculate the light level for each cell in the grid
for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
        // For each cell (r, c), determine the maximum light it receives from any candle.
        for (const candle of candlePositions) {
            // Calculate the Manhattan distance components
            const distR = Math.abs(r - candle.r);
            const distC = Math.abs(c - candle.c);
            
            // The "step" or distance for light decay is the Chebyshev distance
            // (maximum of the absolute differences in coordinates).
            const chebyshevDist = Math.max(distR, distC);
            
            // Calculate the light emitted by this specific candle at the current cell (r, c).
            // Light decreases by 1 for each step of distance.
            const currentCandleLight = L - chebyshevDist;

            // A spot cannot have negative light. If L - dist is negative, light is 0.
            const actualCandleLight = Math.max(0, currentCandleLight);

            // Update the light level of the cell (r, c) in the grid.
            // A spot receives the maximum light it can from any contributing candle.
            lightGrid[r][c] = Math.max(lightGrid[r][c], actualCandleLight);
        }
    }
}

// Count the number of dark spots (cells with 0 light)
let darkSpotsCount = 0;
for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
        if (lightGrid[r][c] === 0) {
            darkSpotsCount++;
        }
    }
}

// Output the final count of dark spots
console.log(darkSpotsCount);