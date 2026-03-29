// The readline() function is globally available in the CodinGame environment.
// console.log() is used for output to the game referee, and console.error() for debug messages.

function solveChessPuzzle() {
    // --- Phase 1: Initialization ---
    // Read constants provided by the referee
    const constantsCount = parseInt(readline());
    const gameConstants: Map<string, string> = new Map();
    for (let i = 0; i < constantsCount; i++) {
        const inputs = readline().split(' ');
        const constantName = inputs[0];
        const constantValue = inputs[1];
        gameConstants.set(constantName, constantValue);
        // console.error(`Constant: ${constantName} = ${constantValue}`); // Debugging constant values
    }

    // Configure which inputs we want to receive for subsequent turns.
    // The order specified here is the order in which they will be provided.
    // 'fen' and 'moves' are critical. 'draw', 'game', 'score' are useful for more advanced logic.
    console.log('fen moves draw game score');

    // --- Phase 2: Game Loop ---
    // This loop continues for the duration of the match (two games).
    while (true) {
        // Read inputs based on the configuration sent in the first turn.
        const fen = readline(); // FEN string (e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w AHah - 0 1")
        // You could parse the FEN here if you needed board state for more complex logic.
        // For a random bot, only the list of legal moves is strictly necessary.

        const movesCount = parseInt(readline()); // Number of legal moves available for the current player
        const legalMoves: string[] = [];
        for (let i = 0; i < movesCount; i++) {
            legalMoves.push(readline()); // Each legal move in UCI format (e.g., "e2e4", "h7h8q")
        }

        const opponentDrawOffer = parseInt(readline()); // 1 if opponent offered draw last turn, 0 otherwise
        const gameNumber = parseInt(readline()); // Current game number (1 or 2)
        const scores = readline().split(' ').map(Number); // [myScore, opponentScore] in half-points

        // --- Debugging output (visible in the CodinGame console's Debug tab) ---
        // These logs help understand the game state as it progresses.
        // console.error(`--- Turn ---`);
        // console.error(`FEN: ${fen}`);
        // console.error(`Current Player: ${fen.split(' ')[1] === 'w' ? 'White' : 'Black'}`);
        // console.error(`Moves Count: ${movesCount}`);
        // console.error(`Legal Moves: [${legalMoves.join(', ')}]`);
        // console.error(`Opponent Draw Offer: ${opponentDrawOffer === 1 ? 'Yes' : 'No'}`);
        // console.error(`Game: ${gameNumber}`);
        // console.error(`Score: My ${scores[0]}, Opponent ${scores[1]}`);

        let chosenOutput: string;

        if (legalMoves.length === 0) {
            // If movesCount is 0, it means the current player has no legal moves.
            // This indicates a terminal game state (checkmate or stalemate).
            // The puzzle requires an output every turn. If a chess move is not possible,
            // we must choose another valid action like 'resign' or 'draw' (if offered).
            // 'resign' is a safe general fallback here.
            console.error("No legal moves available. Game is likely over (checkmate/stalemate). Resigning current game.");
            chosenOutput = "resign"; // Resign the current game
        } else {
            // --- Decision Logic: Simple Random Move ---
            // Choose a random legal move from the list provided by the referee.
            const randomIndex = Math.floor(Math.random() * legalMoves.length);
            chosenOutput = legalMoves[randomIndex];

            // --- Optional: Draw Acceptance Logic ---
            // For this basic bot, we will ignore draw offers and continue playing.
            // A more strategic bot might accept a draw under certain conditions
            // (e.g., if it secures the match win, or avoids a certain loss).
            // Example of how to accept a draw (uncomment and add conditions if desired):
            // if (opponentDrawOffer === 1 /* && some custom condition, e.g., to secure match victory */) {
            //     chosenOutput = "draw"; // Output "draw" to accept the offer
            //     console.error("Opponent offered draw. Decided to accept.");
            // }
        }

        // --- Output the chosen move or action to the game referee ---
        // This is the bot's action for the current turn.
        console.log(chosenOutput);
    }
}

// Call the main function to start the bot's execution.
solveChessPuzzle();