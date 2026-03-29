// Define the BingoCard class to manage each card's state
class BingoCard {
    numbers: number[][]; // Stores the actual numbers on the card
    isMarked: boolean[][]; // Tracks which numbers are marked (true if marked)
    numToCoords: Map<number, { r: number; c: number }>; // Maps a number to its (row, col) for quick lookup

    rowCount: number[]; // Count of marked numbers per row
    colCount: number[]; // Count of marked numbers per column
    diag1Count: number; // Count for main diagonal (top-left to bottom-right)
    diag2Count: number; // Count for anti-diagonal (top-right to bottom-left)
    totalMarked: number; // Total marked numbers on the card

    hasLine: boolean; // True if this card has achieved a line
    hasFullHouse: boolean; // True if this card has achieved a full house

    constructor(cardNumbers: number[][]) {
        this.numbers = cardNumbers;
        // Initialize isMarked grid with all false
        this.isMarked = Array(5).fill(0).map(() => Array(5).fill(false));
        this.numToCoords = new Map();

        // Initialize counts to zero
        this.rowCount = Array(5).fill(0);
        this.colCount = Array(5).fill(0);
        this.diag1Count = 0;
        this.diag2Count = 0;
        this.totalMarked = 0;

        // Initialize win flags
        this.hasLine = false;
        this.hasFullHouse = false;

        // Populate numbers and numToCoords map
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const num = this.numbers[r][c];
                // Store coordinates only for actual bingo numbers (non-zero values)
                // The free space (0) is handled separately as it's never called.
                if (num !== 0) {
                    this.numToCoords.set(num, { r, c });
                }
            }
        }

        // Mark the free space at the center ([2][2])
        // This position is always considered marked from the start.
        // The puzzle states it's denoted by '0' in the input.
        this._markPosition(2, 2);

        // Perform initial checks for lines/full house after free space is marked.
        // For a 5x5 card, a single marked spot (free space) won't form a line or full house,
        // but it's good practice to make the class robust to different card sizes or rules.
        this.checkLine();
        this.checkFullHouse();
    }

    // Internal helper method to mark a position (r, c) and update all counts
    private _markPosition(r: number, c: number): void {
        // If the position is already marked, do nothing (prevents double-counting)
        if (this.isMarked[r][c]) {
            return;
        }

        this.isMarked[r][c] = true; // Mark the spot
        this.totalMarked++; // Increment total marked count

        this.rowCount[r]++; // Increment row count
        this.colCount[c]++; // Increment column count

        // Check for main diagonal (top-left to bottom-right)
        if (r === c) {
            this.diag1Count++;
        }
        // Check for anti-diagonal (top-right to bottom-left)
        if (r + c === 4) { // Sum of indices is 4 for 0-indexed 5x5 anti-diagonal
            this.diag2Count++;
        }
    }

    // Processes a called number: marks it if found on the card
    processCall(calledNumber: number): void {
        // Optimization: If the card already has a full house,
        // no further processing is needed for this card as its state
        // for "first line" or "first full house" won't change relative to the game's goal.
        if (this.hasFullHouse) {
            return;
        }

        // Look up the number's coordinates using the map
        const coords = this.numToCoords.get(calledNumber);
        if (coords) {
            // If the number is on the card, mark its position
            const { r, c } = coords;
            this._markPosition(r, c);
        }
    }

    // Checks if the card currently has a line (row, column, or diagonal of 5)
    // Updates the hasLine flag if a line is found
    checkLine(): boolean {
        if (this.hasLine) return true; // Already has a line, no need to re-check

        // Check all rows
        for (let i = 0; i < 5; i++) {
            if (this.rowCount[i] === 5) {
                this.hasLine = true;
                return true;
            }
        }
        // Check all columns
        for (let i = 0; i < 5; i++) {
            if (this.colCount[i] === 5) {
                this.hasLine = true;
                return true;
            }
        }
        // Check both diagonals
        if (this.diag1Count === 5 || this.diag2Count === 5) {
            this.hasLine = true;
            return true;
        }
        return false;
    }

    // Checks if the card currently has a full house (all 25 numbers marked)
    // Updates the hasFullHouse flag if a full house is found
    checkFullHouse(): boolean {
        if (this.hasFullHouse) return true; // Already has a full house, no need to re-check
        
        // A full house means all 25 spots on the 5x5 card are marked
        if (this.totalMarked === 25) {
            this.hasFullHouse = true;
            return true;
        }
        return false;
    }
}

// Read N, the number of bingo cards
const n: number = parseInt(readline());

const bingoCards: BingoCard[] = [];

// Read N bingo cards and create BingoCard objects
for (let i = 0; i < n; i++) {
    const cardNumbers: number[][] = [];
    for (let r = 0; r < 5; r++) {
        cardNumbers.push(readline().split(' ').map(Number));
    }
    bingoCards.push(new BingoCard(cardNumbers));
}

// Read the order in which numbers will be called
const calledNumbers: number[] = readline().split(' ').map(Number);

let firstLineCalls: number = Infinity;
let firstFullHouseCalls: number = Infinity;

// Flags to stop updating the minimum call counts once found globally
let lineAchievedGlobally: boolean = false;
let fullHouseAchievedGlobally: boolean = false;

// Simulate the game call by call
// callCount represents the number of calls made so far (1-indexed)
for (let callCount = 1; callCount <= calledNumbers.length; callCount++) {
    const currentCalledNumber = calledNumbers[callCount - 1]; // Get the current number to be called

    // Iterate through all bingo cards for the current called number
    for (const card of bingoCards) {
        card.processCall(currentCalledNumber); // Mark the number on the card if present

        // Check if this card achieved a line and if we haven't found the global minimum yet
        if (!lineAchievedGlobally && card.checkLine()) {
            firstLineCalls = Math.min(firstLineCalls, callCount);
        }

        // Check if this card achieved a full house and if we haven't found the global minimum yet
        if (!fullHouseAchievedGlobally && card.checkFullHouse()) {
            firstFullHouseCalls = Math.min(firstFullHouseCalls, callCount);
        }
    }

    // After processing all cards for the current call:
    // Update global flags. This ensures that if multiple cards get a line/full house
    // on the exact same call, firstLineCalls/firstFullHouseCalls will correctly
    // capture that callCount as the minimum.
    if (firstLineCalls !== Infinity) {
        lineAchievedGlobally = true;
    }
    if (firstFullHouseCalls !== Infinity) {
        fullHouseAchievedGlobally = true;
    }

    // Optimization: If both goals are achieved, no need to process further calls
    if (lineAchievedGlobally && fullHouseAchievedGlobally) {
        break;
    }
}

// Output the results
console.log(firstLineCalls);
console.log(firstFullHouseCalls);