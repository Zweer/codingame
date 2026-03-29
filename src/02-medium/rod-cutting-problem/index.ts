/**
 * Reads a line from standard input. In a CodinGame environment, this function is usually provided globally.
 * For local testing, you might need to mock it.
 * Example: const readline = () => { /* ... actual readline implementation ... */ };
 */
declare function readline(): string;

/**
 * Solves the Rod Cutting Problem.
 */
function solveRodCutting(): void {
    // Read the total length of the rod
    const L: number = parseInt(readline());

    // Read the number of different marketable pieces
    const N: number = parseInt(readline());

    // Store marketable pieces that can actually fit in the rod (length <= L)
    interface Piece {
        length: number;
        value: number;
    }
    const marketablePieces: Piece[] = [];

    for (let i = 0; i < N; i++) {
        const [lengthStr, valueStr] = readline().split(' ');
        const length: number = parseInt(lengthStr);
        const value: number = parseInt(valueStr);

        // Optimization: Only consider pieces that can actually fit in the rod.
        // Pieces with length > L can never be used.
        if (length <= L) {
            marketablePieces.push({ length, value });
        }
    }

    // Initialize DP array.
    // dp[i] will store the maximum value that can be obtained from a rod of length 'i'.
    // Initialize all values to 0. This is important because non-marketable pieces have 0 value,
    // and if a length 'i' cannot be formed by any marketable piece, its value should be 0.
    const dp: number[] = new Array(L + 1).fill(0);

    // Fill the DP array using a bottom-up approach.
    // Iterate through all possible rod lengths from 1 up to L.
    for (let currentLength = 1; currentLength <= L; currentLength++) {
        // For each current rod length, consider all valid marketable pieces.
        for (const piece of marketablePieces) {
            // Check if the current piece can be used to form 'currentLength'.
            // This means 'currentLength' must be at least as long as 'piece.length'.
            if (currentLength >= piece.length) {
                // If we use 'piece', the value would be 'piece.value' plus the
                // maximum value we can get from the remaining rod length
                // (currentLength - piece.length).
                // We take the maximum of the current 'dp[currentLength]' (which might be
                // from a previous calculation using a different piece, or still 0)
                // and this new candidate value.
                dp[currentLength] = Math.max(dp[currentLength], piece.value + dp[currentLength - piece.length]);
            }
        }
    }

    // The maximum value for the rod of original length L is stored in dp[L].
    console.log(dp[L]);
}

// Call the function to execute the solution
solveRodCutting();