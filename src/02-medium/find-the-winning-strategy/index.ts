/**
 * Reads a line from standard input. In CodinGame, this function is usually provided.
 * If running locally for testing, you might need to mock it or provide a different implementation.
 * For a typical CodinGame environment, this is globally available.
 */
declare function readline(): string;

/**
 * The main function to solve the CodinGame puzzle.
 * It reads the game state, calculates the winning move using the Sprague-Grundy theorem,
 * and prints the chosen move.
 */
function solve() {
    // Read the initial dimensions of the grid.
    const rows: number = parseInt(readline());
    const columns: number = parseInt(readline());

    // The game proceeds turn by turn in a continuous loop.
    while (true) {
        let nimSum = 0; // This will store the XOR sum of Grundy values for all rows.
        // Array to hold the current positions and calculated Grundy value (distance 'd') for each row.
        const rowStates: { xPlayer: number; xBoss: number; d: number }[] = [];

        // Read the current state for all rows and calculate the overall Nim-sum.
        for (let i = 0; i < rows; i++) {
            const [xPlayer, xBoss] = readline().split(' ').map(Number);

            // For each row, the "distance" or "empty cells between tokens" (d)
            // represents the size of a Nim pile.
            // d = (position of boss's token) - (position of your token) - 1
            const d = xBoss - xPlayer - 1;
            rowStates.push({ xPlayer, xBoss, d });

            // The Grundy value of a single Nim pile of size 'd' is 'd'.
            // The Nim-sum for the entire game is the XOR sum of individual Grundy values.
            nimSum ^= d;
        }

        let chosenRow = -1; // To store the index of the row where we'll make a move.
        let newPlayerPosition = -1; // To store the new position for our token.

        // The core strategy: find a move that makes the Nim-sum zero.
        // We are guaranteed to start on a winning position (nimSum != 0).
        // For a current nimSum (N) and a row with Grundy value (d_i),
        // we want to find a new Grundy value (d_i') such that:
        // N XOR d_i XOR d_i' = 0
        // This implies: d_i' = N XOR d_i
        for (let i = 0; i < rows; i++) {
            const { xPlayer, xBoss, d } = rowStates[i];

            // Calculate the target Grundy value for this specific row.
            const target_d = nimSum ^ d;

            // A valid move must reduce the current Grundy value 'd' to 'target_d'.
            // So, we only consider moves where target_d < d.
            if (target_d < d) {
                // If we reduce the distance 'd' to 'target_d', we need to find the new
                // position 'newX' for our token (xPlayer).
                // Recall: d = xBoss - xPlayer - 1
                // So: target_d = xBoss - newX - 1
                // Rearranging for newX: newX = xBoss - target_d - 1
                const calculatedNewX = xBoss - target_d - 1;

                // This newX is guaranteed to be a valid move:
                // 1. It's to the right of xPlayer (calculatedNewX > xPlayer) because target_d < d.
                // 2. It's to the left of xBoss (calculatedNewX < xBoss) because target_d >= 0.

                // Store this move and break, as the first winning move found is sufficient.
                chosenRow = i;
                newPlayerPosition = calculatedNewX;
                break;
            }
        }

        // Output the chosen move: row index and the new position for our token.
        console.log(`${chosenRow} ${newPlayerPosition}`);
    }
}

// Execute the solver function to start the game.
solve();