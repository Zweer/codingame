// The `readline` function is typically provided by the CodinGame environment
// to read input from standard input.
declare function readline(): string;

function solve() {
    // Read the input line and parse H and W dimensions
    const line = readline();
    const dimensions = line.split(' ').map(Number);
    const initialH = dimensions[0];
    const initialW = dimensions[1];

    /**
     * Recursively calculates the minimum number of squares to chop a rectangle.
     * This function implements the Euclidean algorithm approach for tiling with squares.
     *
     * @param h The current height of the chocolate piece.
     * @param w The current width of the chocolate piece.
     * @returns The minimum number of squares.
     */
    function findMinSquares(h: number, w: number): number {
        // Base case 1: If the dimensions are equal, it's already a square.
        // It counts as 1 piece.
        if (h === w) {
            return 1;
        }

        // Ensure 'h' is always the larger dimension for consistent calculation.
        // This simplifies the logic by always dividing the larger side by the smaller.
        if (h < w) {
            // Swap h and w using destructuring assignment
            [h, w] = [w, h];
        }

        // Base case 2: If the larger dimension (h) is perfectly divisible
        // by the smaller dimension (w), we can cut 'h / w' squares
        // of size 'w x w'. There is no remainder piece.
        if (h % w === 0) {
            return h / w;
        }

        // Recursive step:
        // We cut as many 'w x w' squares as possible from the 'h' side.
        // The number of such squares is 'Math.floor(h / w)'.
        const numSquaresCut = Math.floor(h / w);

        // The remaining piece will have dimensions 'w' x '(h % w)'.
        // We then recursively find the minimum squares for this remaining piece.
        const remainingH = h % w;

        // The total number of squares is the ones we just cut
        // plus the squares obtained from the remaining piece.
        return numSquaresCut + findMinSquares(w, remainingH);
    }

    // Call the function with the initial dimensions and print the result
    console.log(findMinSquares(initialH, initialW));
}

// Execute the solver function
solve();