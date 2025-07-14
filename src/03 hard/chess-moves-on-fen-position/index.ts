// Standard input/output for CodinGame
declare function readline(): string;
declare function function print(message: any): void; // Using console.log is usually fine, but print is available

// Define the 8x8 board dimensions
const BOARD_SIZE = 8;

/**
 * FENBoard class handles parsing FEN, applying chess moves, and converting back to FEN.
 * It focuses only on the piece placement part of the FEN string.
 */
class FENBoard {
    // The 8x8 chessboard represented as a 2D array of strings.
    // board[row][col] where row 0 is rank 8 and row 7 is rank 1.
    // col 0 is file 'a' and col 7 is file 'h'.
    private board: string[][];

    /**
     * Constructor initializes the board and parses the initial FEN string.
     * @param fen The FEN string representing the initial board state.
     */
    constructor(fen: string) {
        // Initialize an empty 8x8 board
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('.'));
        this.parseFen(fen);
    }

    /**
     * Converts algebraic notation (e.g., "e2") to [row, col] coordinates.
     * Row 0 corresponds to rank 8, Row 7 to rank 1.
     * Col 0 corresponds to file 'a', Col 7 to file 'h'.
     * @param square The algebraic notation string (e.g., "a1", "h8").
     * @returns A tuple [row, col] representing the board coordinates.
     */
    private algToCoords(square: string): [number, number] {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 'a' -> 0, 'h' -> 7
        const rank = BOARD_SIZE - parseInt(square[1], 10);   // '8' -> 0, '1' -> 7
        return [rank, file];
    }

    /**
     * Parses the piece placement part of an FEN string and populates the board.
     * @param fen The FEN string to parse.
     */
    private parseFen(fen: string): void {
        const ranks = fen.split('/'); // Split the FEN into individual rank strings
        for (let r = 0; r < BOARD_SIZE; r++) {
            const rankStr = ranks[r];
            let c = 0; // Current column index
            for (let i = 0; i < rankStr.length; i++) {
                const char = rankStr[i];
                if (/\d/.test(char)) {
                    // If it's a digit, it represents 'numEmpty' consecutive empty squares
                    const numEmpty = parseInt(char, 10);
                    for (let j = 0; j < numEmpty; j++) {
                        this.board[r][c + j] = '.'; // Place empty squares
                    }
                    c += numEmpty; // Advance column pointer by the number of empty squares
                } else {
                    // If it's a letter, it's a piece character (e.g., 'p', 'R', 'k')
                    this.board[r][c] = char; // Place the piece
                    c++; // Advance column pointer by one
                }
            }
        }
    }

    /**
     * Applies a single chess move to the board.
     * Handles standard moves, castling, and en passant.
     * Assumes all moves are legal as per problem statement, so no validation is performed.
     * @param moveStr The move string (e.g., "e2e4", "e7e8Q", "e1g1", "h5g6").
     */
    public applyMove(moveStr: string): void {
        const startSquare = moveStr.substring(0, 2);
        const targetSquare = moveStr.substring(2, 4);
        // An optional 5th character indicates pawn promotion (e.g., 'Q' for Queen)
        const promotionPiece = moveStr.length === 5 ? moveStr[4] : null;

        const [sr, sc] = this.algToCoords(startSquare); // Start row, start column
        const [tr, tc] = this.algToCoords(targetSquare); // Target row, target column

        const piece = this.board[sr][sc]; // The piece being moved

        // 1. Handle Castling
        // Castling is uniquely identified by a King ('K' or 'k') moving two squares horizontally.
        if ((piece === 'K' || piece === 'k') && Math.abs(sc - tc) === 2) {
            let rookStartCol: number;
            let rookTargetCol: number;

            // Determine if it's kingside or queenside castling to move the correct rook
            if (tc > sc) { // Kingside castling (King moves right, e.g., e1g1)
                rookStartCol = 7; // Rook on h-file (column 7)
                rookTargetCol = 5; // Rook moves to f-file (column 5)
            } else { // Queenside castling (King moves left, e.g., e1c1)
                rookStartCol = 0; // Rook on a-file (column 0)
                rookTargetCol = 3; // Rook moves to d-file (column 3)
            }

            // Move the King to its target square and clear its starting square
            this.board[tr][tc] = piece;
            this.board[sr][sc] = '.';

            // Move the Rook to its target square and clear its starting square
            this.board[tr][rookTargetCol] = this.board[tr][rookStartCol];
            this.board[tr][rookStartCol] = '.';
            return; // Castling move is fully handled, no further processing needed
        }

        // 2. Handle En Passant Capture
        // Conditions for an en passant capture:
        // - The moving piece is a pawn ('P' or 'p').
        // - The pawn moves diagonally (both row and column change by 1).
        // - The target square is currently empty (if it had a piece, it would be a regular capture).
        // - There is an opponent's pawn on the square directly adjacent to the target,
        //   on the same rank as the capturing pawn's starting position (e.g., h5g6 captures pawn on g5).
        if ((piece === 'P' || piece === 'p') &&
            Math.abs(sr - tr) === 1 && Math.abs(sc - tc) === 1 &&
            this.board[tr][tc] === '.') {

            // The captured pawn in an en passant move is on the same rank as the capturing pawn's start,
            // but in the target column.
            const capturedPawnSquareRow = sr;
            const capturedPawnSquareCol = tc;

            const capturedPiece = this.board[capturedPawnSquareRow][capturedPawnSquareCol];

            // Check if the piece at the potential captured square is indeed an opponent's pawn
            const isWhitePawnMoving = piece === 'P';
            const isOpponentPawnCaptured = (isWhitePawnMoving && capturedPiece === 'p') ||
                                           (!isWhitePawnMoving && capturedPiece === 'P');

            if (isOpponentPawnCaptured) {
                // If all conditions met, remove the captured pawn
                this.board[capturedPawnSquareRow][capturedPawnSquareCol] = '.';
            }
        }

        // 3. Standard Piece Movement (Applies to all moves not handled by castling)
        // Move the piece from its starting square to its target square.
        this.board[tr][tc] = piece;
        // Clear the piece from its original starting square.
        this.board[sr][sc] = '.';

        // 4. Apply Pawn Promotion if specified
        if (promotionPiece) {
            // Replace the pawn (which just moved to the target square) with the promoted piece.
            this.board[tr][tc] = promotionPiece;
        }
    }

    /**
     * Converts the current state of the board back into an FEN piece placement string.
     * @returns The FEN piece placement string.
     */
    public toFen(): string {
        const fenRanks: string[] = []; // Array to hold FEN string for each rank
        for (let r = 0; r < BOARD_SIZE; r++) {
            let rankStr = ''; // String for the current rank
            let emptyCount = 0; // Counter for consecutive empty squares

            for (let c = 0; c < BOARD_SIZE; c++) {
                const char = this.board[r][c];
                if (char === '.') {
                    emptyCount++; // If square is empty, increment count
                } else {
                    if (emptyCount > 0) {
                        // If there were empty squares before the current piece, append their count
                        rankStr += emptyCount.toString();
                        emptyCount = 0; // Reset empty count
                    }
                    rankStr += char; // Append the piece character
                }
            }
            // After iterating through a rank, if there are any trailing empty squares, append their count
            if (emptyCount > 0) {
                rankStr += emptyCount.toString();
            }
            fenRanks.push(rankStr); // Add the completed rank string to the array
        }
        return fenRanks.join('/'); // Join all rank strings with '/' to form the final FEN string
    }
}

/**
 * Main function to read input, process moves, and print the final FEN.
 */
function main() {
    const initialFen = readline(); // Read the initial FEN string from input
    const numMoves = parseInt(readline()); // Read the number of moves to perform

    // Create a new FENBoard instance with the initial board position
    const board = new FENBoard(initialFen);

    // Loop through each move and apply it to the board
    for (let i = 0; i < numMoves; i++) {
        const move = readline(); // Read the current move string
        board.applyMove(move); // Apply the move using the FENBoard's method
    }

    // After all moves are applied, convert the final board state back to FEN and print it
    console.log(board.toFen());
}

// Call the main function to start the puzzle logic execution in the CodinGame environment
main();