// Standard CodinGame readline setup for TypeScript
declare function readline(): string;
declare function print(message: string): void;
declare function printErr(message: string): void;

// --- Data Structures ---

type Suit = 'C' | 'D' | 'H' | 'S';
type Rank = number; // 1-13 (Ace=1, King=13)
type Color = 'BLACK' | 'RED';

/**
 * Represents a playing card with its rank, suit, and color.
 */
interface Card {
    rank: Rank;
    suit: Suit;
    color: Color;
    // Method to return original string representation for debugging/output
    toString(): string; 
}

/**
 * Represents a single move operation.
 */
interface Move {
    sourceType: 'cascade' | 'cell';
    sourceIndex: number; // 0-7 for cascades, 0-3 for cells
    destType: 'cascade' | 'cell' | 'foundation';
    destIndex: number; // 0-7 for cascades, 0-3 for cells, -1 for foundation ('h')
    // Method to return original string representation for output
    toString(): string;
}

// --- Helper Functions for Card/Move Parsing ---

/**
 * Parses a two-character card string (e.g., "KH") into a Card object.
 */
function parseCardString(s: string): Card {
    const rankChar = s[0];
    const suitChar = s[1] as Suit;

    let rank: Rank;
    switch (rankChar) {
        case 'A': rank = 1; break;
        case 'T': rank = 10; break;
        case 'J': rank = 11; break;
        case 'Q': rank = 12; break;
        case 'K': rank = 13; break;
        default: rank = parseInt(rankChar); break;
    }

    const color: Color = (suitChar === 'C' || suitChar === 'S') ? 'BLACK' : 'RED';

    return { rank, suit: suitChar, color, toString: () => s };
}

/**
 * Converts a numeric rank to its character representation (e.g., 1 -> 'A').
 */
function getRankChar(rank: Rank): string {
    switch (rank) {
        case 1: return 'A';
        case 10: return 'T';
        case 11: return 'J';
        case 12: return 'Q';
        case 13: return 'K';
        default: return rank.toString();
    }
}

/**
 * Converts a Card object back to its two-character string representation.
 */
function cardToString(card: Card): string {
    return getRankChar(card.rank) + card.suit;
}

/**
 * Parses a foundation level string (e.g., "C-A") into a [Suit, Rank] tuple.
 */
function parseFoundationLevel(f: string): [Suit, Rank] {
    const suit = f[0] as Suit;
    const rankChar = f[2]; // Rank is at index 2 (e.g., "C-A")
    let rank: Rank;
    switch (rankChar) {
        case 'A': rank = 1; break;
        case 'T': rank = 10; break;
        case 'J': rank = 11; break;
        case 'Q': rank = 12; break;
        case 'K': rank = 13; break;
        default: rank = parseInt(rankChar); break;
    }
    return [suit, rank];
}

/**
 * Parses a two-character move string (e.g., "26", "7a", "ah") into a Move object.
 */
function parseMoveString(moveStr: string): Move {
    const sourceChar = moveStr[0];
    const destChar = moveStr[1];

    let sourceType: Move['sourceType'];
    let sourceIndex: number;
    if (sourceChar >= '1' && sourceChar <= '8') {
        sourceType = 'cascade';
        sourceIndex = parseInt(sourceChar) - 1; // 0-indexed for cascades (1-8)
    } else { // 'a' to 'd' for cells
        sourceType = 'cell';
        sourceIndex = sourceChar.charCodeAt(0) - 'a'.charCodeAt(0); // 0-indexed for cells (a-d)
    }

    let destType: Move['destType'];
    let destIndex: number;
    if (destChar >= '1' && destChar <= '8') {
        destType = 'cascade';
        destIndex = parseInt(destChar) - 1; // 0-indexed for cascades (1-8)
    } else if (destChar === 'h') { // 'h' for foundation
        destType = 'foundation';
        destIndex = -1; // Sentinel value for foundation
    } else { // 'a' to 'd' for cells
        destType = 'cell';
        destIndex = destChar.charCodeAt(0) - 'a'.charCodeAt(0); // 0-indexed for cells (a-d)
    }

    return { sourceType, sourceIndex, destType, destIndex, toString: () => moveStr };
}

// --- Board Representation and Simulation ---

/**
 * Represents the current state of the FreeCell board.
 * Includes methods for copying, simulating moves, and autoplay.
 */
class Board {
    foundations: Map<Suit, Rank>; // Map suit to the rank of the topmost card (0 for empty)
    cells: (Card | null)[];       // Array of 4 cells, null for empty
    cascades: Card[][];           // Array of 8 cascades, each is an array of cards (deepest to topmost)

    constructor(
        foundations: Map<Suit, Rank>,
        cells: (Card | null)[],
        cascades: Card[][]
    ) {
        // Deep copy essential mutable structures to ensure simulation does not alter original board
        this.foundations = new Map(foundations);
        this.cells = [...cells]; // Shallow copy of array, Card objects are immutable enough
        this.cascades = cascades.map(c => [...c]); // Deep copy of cascade arrays
    }

    /**
     * Gets the card available at the specified source of a move.
     * For cascades, it's the bottommost (last in array). For cells, it's the card in the cell.
     */
    getCardAtSource(move: Move): Card | null {
        if (move.sourceType === 'cascade') {
            const cascade = this.cascades[move.sourceIndex];
            return cascade.length > 0 ? cascade[cascade.length - 1] : null;
        } else { // cell
            return this.cells[move.sourceIndex];
        }
    }

    /**
     * Simulates a single move on the board and returns a new Board object.
     * This method only performs the explicit player move, not autoplay.
     */
    simulateMove(move: Move): Board {
        const newBoard = new Board(this.foundations, this.cells, this.cascades);
        const cardToMove = newBoard.getCardAtSource(move);

        if (!cardToMove) {
            // This case indicates an invalid move source (e.g., empty cascade/cell).
            // Based on problem, `possibleMoves` should only contain valid moves.
            return newBoard;
        }

        // Remove card from source
        if (move.sourceType === 'cascade') {
            newBoard.cascades[move.sourceIndex].pop();
        } else { // cell
            newBoard.cells[move.sourceIndex] = null;
        }

        // Place card at destination
        if (move.destType === 'cascade') {
            newBoard.cascades[move.destIndex].push(cardToMove);
        } else if (move.destType === 'cell') {
            newBoard.cells[move.destIndex] = cardToMove;
        }
        // Moves to foundation ('h') are explicitly handled by autoplay and are not in `possibleMoves` list.

        return newBoard;
    }

    /**
     * Checks if a card can be moved to its respective foundation (e.g., King on Queen, Ace on empty).
     */
    canMoveToFoundation(card: Card): boolean {
        // Get the current highest rank on this card's suit foundation (0 if empty)
        const currentRankInFoundation = this.foundations.get(card.suit) || 0;
        // A card can move to foundation if its rank is one higher than the current top card
        // (e.g., 2 can go on Ace, Ace can go on empty foundation (rank 0))
        return card.rank === currentRankInFoundation + 1;
    }

    /**
     * Simulates the game's autoplay mechanism, moving all possible cards to foundations.
     * Modifies the board state in place. Continues until no more cards can be moved.
     */
    simulateAutoplay(): void {
        let changed = true;
        while (changed) {
            changed = false;

            // Check cascades for cards that can go to foundation
            for (let i = 0; i < this.cascades.length; i++) {
                const cascade = this.cascades[i];
                if (cascade.length > 0) {
                    const card = cascade[cascade.length - 1]; // Get the topmost card
                    if (this.canMoveToFoundation(card)) {
                        this.foundations.set(card.suit, card.rank);
                        cascade.pop(); // Remove from cascade
                        changed = true;
                    }
                }
            }

            // Check cells for cards that can go to foundation
            for (let i = 0; i < this.cells.length; i++) {
                const card = this.cells[i];
                if (card && this.canMoveToFoundation(card)) {
                    this.foundations.set(card.suit, card.rank);
                    this.cells[i] = null; // Remove from cell
                    changed = true;
                }
            }
        }
    }

    /**
     * Returns the number of currently empty cells.
     */
    getEmptyCellCount(): number {
        return this.cells.filter(c => c === null).length;
    }

    /**
     * Returns the number of currently empty cascades.
     */
    getEmptyCascadeCount(): number {
        return this.cascades.filter(c => c.length === 0).length;
    }
}

// --- Scoring Logic ---

// Constants for scoring different aspects of a move.
// These values are chosen to prioritize game progress (foundations),
// then board flexibility (empty cascades/cells), then minor improvements.
const SCORE_FACTOR_FOUNDATION_PROGRESS = 10000; // Moving a card to foundation is the best outcome
const SCORE_EMPTY_CASCADE_DELTA = 500;        // Creating an empty cascade is very valuable
const SCORE_EMPTY_CELL_DELTA = 100;           // Creating an empty cell is valuable
const SCORE_CARD_UNCOVERED = 50;              // Exposing a new card in a cascade
const SCORE_CARD_MOVED_TO_CASCADE = 10;       // Successfully moving a card onto another cascade
const PENALTY_FILL_CELL = -75;                // Penalize filling an empty cell if the card doesn't immediately go to foundation

/**
 * Calculates a score based on the current state of foundations.
 * Higher rank cards on foundations contribute more to the score.
 * This helps prioritize moving higher cards to foundations.
 */
function calculateFoundationScore(foundations: Map<Suit, Rank>): number {
    let totalScore = 0;
    for (const rank of foundations.values()) {
        totalScore += rank; // Sum of ranks of topmost cards in foundations (e.g., A=1, K=13)
    }
    return totalScore;
}

/**
 * Evaluates a given move by simulating its effect and applying a heuristic score.
 * The heuristic prioritizes moves that clear foundations, free up cells/cascades,
 * and uncover cards.
 */
function evaluateMove(move: Move, currentBoard: Board): number {
    let score = 0;

    // 1. Simulate the move on a copy of the current board.
    const boardAfterMove = currentBoard.simulateMove(move);
    // 2. Crucially, simulate the automatic movement of cards to foundations.
    boardAfterMove.simulateAutoplay();

    // --- Scoring Components ---

    // A. Foundation progress: The most critical factor.
    // Calculate the increase in foundation score (sum of ranks) after the move.
    const currentFoundationScore = calculateFoundationScore(currentBoard.foundations);
    const afterMoveFoundationScore = calculateFoundationScore(boardAfterMove.foundations);
    score += (afterMoveFoundationScore - currentFoundationScore) * SCORE_FACTOR_FOUNDATION_PROGRESS;

    // B. Change in available empty cells and cascades.
    // Positive if more free spaces, negative if fewer.
    score += (boardAfterMove.getEmptyCellCount() - currentBoard.getEmptyCellCount()) * SCORE_EMPTY_CELL_DELTA;
    score += (boardAfterMove.getEmptyCascadeCount() - currentBoard.getEmptyCascadeCount()) * SCORE_EMPTY_CASCADE_DELTA;

    // C. Card uncovering: If a card was moved from a cascade, it reveals the card beneath it.
    if (move.sourceType === 'cascade') {
        const initialLength = currentBoard.cascades[move.sourceIndex].length;
        // If a card was successfully removed from a non-empty cascade, it exposes a new card.
        if (initialLength > 0 && boardAfterMove.cascades[move.sourceIndex].length < initialLength) {
            score += SCORE_CARD_UNCOVERED;
        }
    }

    // D. Destination considerations:
    if (move.destType === 'cascade') {
        // Generally good to build sequences in cascades.
        score += SCORE_CARD_MOVED_TO_CASCADE;
    } else if (move.destType === 'cell') {
        // Penalize filling an empty cell if the card does not immediately move to a foundation.
        // This means the cell remains occupied after autoplay, indicating it's a "holding" move.
        if (currentBoard.cells[move.destIndex] === null && boardAfterMove.cells[move.destIndex] !== null) {
            score += PENALTY_FILL_CELL;
        }
    }

    return score;
}

// --- Main Game Loop ---

function main() {
    // Read and discard line 1 (foundationCountPlusOne) - not directly used in this logic
    readline();

    // Read cascade lengths (cascadeCountPlusOne_i) - also not directly used here as cascade content is explicit
    readline(); 

    // Read foundation states (e.g., "Foundations: C-A D-3")
    const foundationLine = readline().substring("Foundations: ".length);
    const foundationLevels = new Map<Suit, Rank>();
    // Initialize all foundations to empty (rank 0)
    ['C', 'D', 'H', 'S'].forEach(s => foundationLevels.set(s as Suit, 0));
    if (foundationLine !== '-') { // Only parse if there are actual foundations mentioned
        foundationLine.split(' ').forEach(f => {
            const [suit, rank] = parseFoundationLevel(f);
            foundationLevels.set(suit, rank);
        });
    }

    // Read cell contents (e.g., "KH 2C - -")
    const cellLine = readline();
    const cells: (Card | null)[] = cellLine.split(' ').map(s => s === '-' ? null : parseCardString(s));

    // Read cascade contents (8 lines, e.g., "0: 5H 4S 3D")
    const cascades: Card[][] = [];
    for (let i = 0; i < 8; i++) {
        const line = readline();
        const parts = line.split(' ');
        const cardsInCascade = parts.slice(1); // Skip the initial ':'
        cascades.push(cardsInCascade.map(parseCardString));
    }

    // Create the initial board state object
    const currentBoard = new Board(foundationLevels, cells, cascades);

    // Read the number of possible moves (M) and the moves themselves
    const M = parseInt(readline());
    const possibleMoveStrings = readline().split(' ');

    if (M === 0) {
        // As per problem description, if M is 0, it's a defeat condition.
        // The CodinGame platform handles game termination; we just don't output a move.
        return;
    }

    let bestMove: Move | null = null;
    let maxScore = -Infinity; // Initialize with a very low score

    // Iterate through all possible moves, evaluate each, and pick the best one
    for (const moveStr of possibleMoveStrings) {
        const move = parseMoveString(moveStr);
        const score = evaluateMove(move, currentBoard);

        // Debugging output (can be removed for submission)
        // printErr(`Move: ${moveStr}, Score: ${score}`); 

        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }

    // Output the chosen best move to standard output
    if (bestMove) {
        print(bestMove.toString());
    } else {
        // This case should ideally not be reached if M > 0, as there should always be a move.
        // If it occurs, it indicates an issue with the scoring or move generation (which is provided).
        printErr("Error: No best move found even though M > 0. Outputting first available move as fallback.");
        // Fallback: output the first available move if no best move was determined
        print(possibleMoveStrings[0]); 
    }
}

// Execute the main function to start the game logic
main();