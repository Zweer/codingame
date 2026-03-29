/**
 * Reads a line from standard input. In a CodinGame environment, this function is provided.
 * For local testing outside CodinGame, you might need to mock this or use Node.js `readline` module.
 */
declare function readline(): string;

/**
 * Outputs a line to standard output. In a CodinGame environment, this function is provided.
 * `console.log` is often used and usually works fine on CodinGame.
 */
declare function print(message: any): void;


/**
 * Converts a standard checkers algebraic coordinate string (e.g., "A3", "H8")
 * into a 0-indexed {row, col} object suitable for array access.
 *
 * A1 (bottom-left) maps to {row: 7, col: 0}.
 * A8 (top-left) maps to {row: 0, col: 0}.
 * H1 (bottom-right) maps to {row: 7, col: 7}.
 * H8 (top-right) maps to {row: 0, col: 7}.
 *
 * @param coordStr The coordinate string (e.g., "A3").
 * @returns An object with `row` and `col` properties.
 */
function parseCoord(coordStr: string): { row: number, col: number } {
    // Column 'A' is 0, 'B' is 1, ..., 'H' is 7
    const col = coordStr.charCodeAt(0) - 'A'.charCodeAt(0);
    // Row '1' is 7, '2' is 6, ..., '8' is 0
    const row = 8 - parseInt(coordStr[1]);
    return { row, col };
}

/**
 * Main function to encapsulate the game logic for one turn.
 * This function will be called by the CodinGame environment.
 */
function main() {
    // Read the player's color ('r' for red, 'b' for black)
    const myColor = readline();

    // Read the 8x8 board state
    const board: string[][] = [];
    for (let i = 0; i < 8; i++) {
        board.push(readline().split('')); // Each line is a string, split into characters
    }

    // Read the number of legal moves available this turn
    const numLegalMoves = parseInt(readline());

    // Read all legal moves into an array
    const legalMoves: string[] = [];
    for (let i = 0; i < numLegalMoves; i++) {
        legalMoves.push(readline());
    }

    // --- AI Logic for choosing the best move ---

    // Define scoring constants. Higher values indicate higher priority.
    // Captures are paramount in checkers, followed by crowning a piece.
    const POINTS_PER_CAPTURE = 100;    // High value to prioritize any jump over a non-jump
    const POINTS_FOR_CROWNING = 50;    // Medium value to prioritize crowning
    const POINTS_FOR_NORMAL_MOVE = 1;  // Base score for a simple, non-capture move

    let maxScore = -Infinity; // Initialize with a very low score to ensure any valid move is picked
    let bestMove = "";        // Stores the chosen move string

    // Iterate through each legal move to evaluate its desirability
    for (const move of legalMoves) {
        let currentScore = 0;

        // Parse the move string into its coordinate segments.
        // A move like "A3C5A7" becomes ["A3", "C5", "A7"].
        const segments: string[] = [];
        for (let i = 0; i < move.length; i += 2) {
            segments.push(move.substring(i, i + 2));
        }

        // Calculate the number of jumps. (Number of segments - 1) equals number of jumps.
        // Example: "A3B4" (2 segments) means 1-1=0 jumps.
        // Example: "A3C5" (2 segments) means 2-1=1 jump.
        // Example: "A3C5A7" (3 segments) means 3-1=2 jumps.
        const numJumps = segments.length - 1;

        if (numJumps > 0) {
            // If the move involves jumps, add points for each captured piece.
            // In checkers, each jump captures one piece.
            currentScore += numJumps * POINTS_PER_CAPTURE;
        } else {
            // If it's a simple, non-capture move, add the base score.
            currentScore += POINTS_FOR_NORMAL_MOVE;
        }

        // Check for crowning potential: if the piece reaches the opponent's back row.
        const startCoordStr = segments[0]; // Original position of the piece
        const endCoordStr = segments[segments.length - 1]; // Final position of the piece after the move sequence
        
        const startPos = parseCoord(startCoordStr);
        const endPos = parseCoord(endCoordStr);

        // Get the character of the piece that is making this move from the board.
        const pieceAtStart = board[startPos.row][startPos.col];

        // Determine if the piece belongs to the current player (can be 'r'/'R' or 'b'/'B')
        const isMyPiece = (myColor === 'r' && (pieceAtStart === 'r' || pieceAtStart === 'R')) ||
                           (myColor === 'b' && (pieceAtStart === 'b' || pieceAtStart === 'B'));
        
        // Determine if the piece is already a King (to avoid re-scoring if already King)
        const isMyKing = (myColor === 'r' && pieceAtStart === 'R') ||
                         (myColor === 'b' && pieceAtStart === 'B');

        // A piece is crowned if it reaches the opponent's back row AND it's not already a King.
        if (isMyPiece && !isMyKing) {
            // Red pieces crown at row 0 (top of the board). Black pieces crown at row 7 (bottom of the board).
            const targetCrowningRow = myColor === 'r' ? 0 : 7;
            if (endPos.row === targetCrowningRow) {
                currentScore += POINTS_FOR_CROWNING;
            }
        }
        
        // Update the best move found so far if the current move has a higher score.
        // In case of a tie, the first encountered move (which is arbitrary based on input order) is chosen.
        if (currentScore > maxScore) {
            maxScore = currentScore;
            bestMove = move;
        }
    }

    // Output the chosen best move to standard output.
    console.log(bestMove);
}

// Call the main function to start the game logic.
main();