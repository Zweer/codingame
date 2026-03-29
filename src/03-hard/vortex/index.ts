/**
 * Reads a line from standard input.
 * In CodinGame, this is provided by `readline()`.
 * For local testing, you might need to mock this function.
 */
declare function readline(): string;

function solve() {
    // Read W and H (width and height of the matrix)
    const WH_line = readline().split(' ').map(Number);
    const W = WH_line[0];
    const H = WH_line[1];

    // Read X (number of positions to crank)
    const X = parseInt(readline(), 10);

    // Read the input matrix
    const matrix: number[][] = [];
    for (let i = 0; i < H; i++) {
        matrix.push(readline().split(' ').map(Number));
    }

    // Initialize result matrix as a deep copy of the input matrix.
    // Elements not part of any 'ring' (e.g., the center of an odd-dimension matrix)
    // should retain their original values.
    const resultMatrix: number[][] = Array(H).fill(0).map((_, r) => Array(W).fill(0).map((__, c) => matrix[r][c]));

    // Define boundaries for the current layer
    let currentLayerRow = 0;
    let currentLayerCol = 0;
    let currentLayerMaxRow = H - 1;
    let currentLayerMaxCol = W - 1;

    // Process layers from outermost to innermost
    while (currentLayerRow <= currentLayerMaxRow && currentLayerCol <= currentLayerMaxCol) {
        const layerElements: number[] = [];
        const layerCoordinates: [number, number][] = []; // Stores [row, col] for placing elements back

        // 1. Traverse Top row (left to right)
        // From (currentLayerRow, currentLayerCol) to (currentLayerRow, currentLayerMaxCol)
        for (let c = currentLayerCol; c <= currentLayerMaxCol; c++) {
            layerElements.push(matrix[currentLayerRow][c]);
            layerCoordinates.push([currentLayerRow, c]);
        }

        // 2. Traverse Right column (top to bottom)
        // From (currentLayerRow + 1, currentLayerMaxCol) to (currentLayerMaxRow, currentLayerMaxCol)
        // Skip currentLayerRow, currentLayerMaxCol as it's already added by the top row loop.
        for (let r = currentLayerRow + 1; r <= currentLayerMaxRow; r++) {
            layerElements.push(matrix[r][currentLayerMaxCol]);
            layerCoordinates.push([r, currentLayerMaxCol]);
        }

        // 3. Traverse Bottom row (right to left)
        // From (currentLayerMaxRow, currentLayerMaxCol - 1) down to (currentLayerMaxRow, currentLayerCol)
        // Only if there is a distinct bottom row (i.e., not a 1-row matrix like 5x1)
        // Skip currentLayerMaxRow, currentLayerMaxCol as it's already added by the right column loop.
        // Skip currentLayerMaxRow, currentLayerCol as it might be added by the left column loop for 1-column matrix.
        if (currentLayerRow < currentLayerMaxRow) {
            for (let c = currentLayerMaxCol - 1; c >= currentLayerCol; c--) {
                layerElements.push(matrix[currentLayerMaxRow][c]);
                layerCoordinates.push([currentLayerMaxRow, c]);
            }
        }

        // 4. Traverse Left column (bottom to top)
        // From (currentLayerMaxRow - 1, currentLayerCol) down to (currentLayerRow + 1, currentLayerCol)
        // Only if there is a distinct left column (i.e., not a 1-column matrix like 1x5)
        // Skip currentLayerMaxRow, currentLayerCol as it's already added by the bottom row loop.
        // Skip currentLayerRow, currentLayerCol as it's already added by the top row loop.
        if (currentLayerCol < currentLayerMaxCol) {
            for (let r = currentLayerMaxRow - 1; r >= currentLayerRow + 1; r--) {
                layerElements.push(matrix[r][currentLayerCol]);
                layerCoordinates.push([r, currentLayerCol]);
            }
        }

        const ringLength = layerElements.length;

        // If the current layer is empty (e.g., trying to process the center of a 2x2 matrix
        // after the outer layer has been processed, or if min(W,H) is 0/1 and no perimeter exists).
        // This break ensures we don't try to shift an empty array, which would be an error.
        if (ringLength === 0) {
            break;
        }

        // Calculate the effective shift. X can be very large (up to 10^8), so use modulo.
        // A counter-clockwise shift corresponds to a circular "left" shift on our linearly ordered layer elements.
        const effectiveShift = X % ringLength;

        // Perform the circular left shift on the elements
        const shiftedElements = layerElements.slice(effectiveShift).concat(layerElements.slice(0, effectiveShift));

        // Place the shifted elements back into the result matrix at their new positions
        for (let i = 0; i < ringLength; i++) {
            const [r, c] = layerCoordinates[i];
            resultMatrix[r][c] = shiftedElements[i];
        }

        // Move to the next inner layer by shrinking the boundaries
        currentLayerRow++;
        currentLayerCol++;
        currentLayerMaxRow--;
        currentLayerMaxCol--;
    }

    // Print the final cranked matrix, row by row
    for (let r = 0; r < H; r++) {
        console.log(resultMatrix[r].join(' '));
    }
}

// Call the solve function to execute the puzzle logic
solve();