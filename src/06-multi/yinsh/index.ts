// Define constants for coordinate conversion and board dimensions
const A_CHAR_CODE = 'a'.charCodeAt(0);
const MAX_ROW_COUNT = 11; // Max rows in the grid (1 to 11)
const MAX_COL_COUNT = 11; // Max columns in the grid (a to k)

// Enum to represent the state of a cell on the board
enum CellState {
    EMPTY = '.',
    MY_RING = 'R',
    MY_MARKER = 'S',
    ENEMY_RING = 'r',
    ENEMY_MARKER = 's',
}

// Helper function to convert a character from input to CellState enum
function charToCellState(char: string): CellState {
    switch (char) {
        case '.': return CellState.EMPTY;
        case 'R': return CellState.MY_RING;
        case 'S': return CellState.MY_MARKER;
        case 'r': return CellState.ENEMY_RING;
        case 's': return CellState.ENEMY_MARKER;
        default: throw new Error(`Unknown cell state char: ${char}`);
    }
}

// Interface for board coordinates (col, row)
interface Coord {
    col: number;
    row: number;
}

// Converts a CodinGame coordinate string (e.g., "a1", "k11") to internal { col, row }
// This mapping accounts for the irregular hex grid shape.
function toBoardCoords(cg_coord: string): Coord {
    const char = cg_coord[0];
    const num = parseInt(cg_coord.substring(1));

    const row_idx = num - 1;
    let col_char_offset = char.charCodeAt(0) - A_CHAR_CODE;
    let col_idx = col_char_offset;

    // Adjust column index for rows 7-11 (shifted hex grid)
    if (row_idx >= 6) {
        col_idx -= (row_idx - 5);
    }
    return { col: col_idx, row: row_idx };
}

// Converts internal { col, row } to a CodinGame coordinate string
function toCGCoord(col_idx: number, row_idx: number): string {
    const num = row_idx + 1;
    let col_char_offset = col_idx;

    // Adjust column char offset for rows 7-11
    if (row_idx >= 6) {
        col_char_offset += (row_idx - 5);
    }
    const char = String.fromCharCode(A_CHAR_CODE + col_char_offset);
    return `${char}${num}`;
}

// Checks if a coordinate is within the hexagonal board boundaries
function isValidCoord(col: number, row: number): boolean {
    if (row < 0 || row >= MAX_ROW_COUNT || col < 0 || col >= MAX_COL_COUNT) {
        return false;
    }

    // Define the lengths of each row (0-indexed)
    const rowLengths = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];
    const actualRowLength = rowLengths[row];

    let minColForThisRow = 0;
    if (row >= 6) { // For rows 7-11, the starting character is shifted
        minColForThisRow = row - 5;
    }

    const maxColForThisRow = minColForThisRow + actualRowLength - 1;

    return col >= minColForThisRow && col <= maxColForThisRow;
}

// Directions for 5-in-a-row checks (3 primary directions which cover all 6 axes)
const LINE_DIRECTIONS = [
    { dc: 1, dr: 0 },   // Horizontal (e.g., a1-f1)
    { dc: 0, dr: 1 },   // Down-right/Down (e.g., a1-b2, b2-c3, or a6-b7, b7-c8)
    { dc: -1, dr: 1 }   // Down-left (e.g., f1-e2, e2-d3)
];

// Global variable to store my player ID (0 for white, 1 for black)
let myId: number;
// Tracks the current turn number (0-indexed) for placement phase detection
let turn: number = 0; 

// Represents the game board state
class Board {
    grid: CellState[][];
    myRings: Coord[];
    enemyRings: Coord[];
    myMarkers: Coord[];
    enemyMarkers: Coord[];
    myRemovedRings: number;
    enemyRemovedRings: number;

    constructor() {
        this.grid = Array(MAX_ROW_COUNT).fill(0).map(() => Array(MAX_COL_COUNT).fill(CellState.EMPTY));
        this.myRings = [];
        this.enemyRings = [];
        this.myMarkers = [];
        this.enemyMarkers = [];
        this.myRemovedRings = 0;
        this.enemyRemovedRings = 0;
    }

    // Creates a deep copy of the board state
    clone(): Board {
        const newBoard = new Board();
        newBoard.grid = this.grid.map(row => [...row]);
        newBoard.myRings = this.myRings.map(c => ({ ...c }));
        newBoard.enemyRings = this.enemyRings.map(c => ({ ...c }));
        newBoard.myMarkers = this.myMarkers.map(c => ({ ...c }));
        newBoard.enemyMarkers = this.enemyMarkers.map(c => ({ ...c }));
        newBoard.myRemovedRings = this.myRemovedRings;
        newBoard.enemyRemovedRings = this.enemyRemovedRings;
        return newBoard;
    }

    // Sets the state of a cell. Performs bounds checking.
    setCell(col: number, row: number, state: CellState) {
        if (!isValidCoord(col, row)) {
            return;
        }
        this.grid[row][col] = state;
    }

    // Gets the state of a cell. Returns EMPTY for out-of-bounds.
    getCell(col: number, row: number): CellState {
        if (!isValidCoord(col, row)) {
            return CellState.EMPTY;
        }
        return this.grid[row][col];
    }

    // Generator to iterate over cells in a straight line given a starting point and direction vector
    *getLineIterator(startCol: number, startRow: number, dc: number, dr: number): Generator<{ coord: Coord, state: CellState }> {
        let currentCol = startCol;
        let currentRow = startRow;
        while (isValidCoord(currentCol, currentRow)) {
            yield { coord: { col: currentCol, row: currentRow }, state: this.getCell(currentCol, currentRow) };
            currentCol += dc;
            currentRow += dr;
        }
    }

    // Counts 4-in-a-row threats for a given player
    countThreats(playerIsMe: boolean): number {
        const playerMarker = playerIsMe ? CellState.MY_MARKER : CellState.ENEMY_MARKER;
        const opponentRing = playerIsMe ? CellState.ENEMY_RING : CellState.MY_RING;
        
        let threatCount = 0;

        // Iterate through all possible starting cells on the board
        for (let r = 0; r < MAX_ROW_COUNT; r++) {
            for (let c = 0; c < MAX_COL_COUNT; c++) {
                if (!isValidCoord(c, r)) continue;

                // Iterate through the 3 primary line directions (and their inverses implicitly)
                for (const dir of LINE_DIRECTIONS) {
                    let count = 0;
                    let blockingRingPresent = false;
                    
                    // Check in positive direction
                    for (const { coord, state } of this.getLineIterator(c, r, dir.dc, dir.dr)) {
                        if (state === playerMarker) {
                            count++;
                        } else if (state === opponentRing) {
                            blockingRingPresent = true;
                            break; // Opponent ring blocks the line
                        } else { // Empty or opponent marker
                            break; // Line is interrupted
                        }
                    }

                    if (count >= 4 && !blockingRingPresent) {
                        threatCount++;
                    }
                    
                    // Check in negative direction (for lines that might start beyond c,r)
                    // This is only needed if LINE_DIRECTIONS don't cover all orientations from (0,0)
                    // But iterating ALL (c,r) as start positions and going in fixed directions covers all lines.
                    // This simple check is for sequences of markers.
                    // For true "threats" (e.g. SSSS_ ) a more complex sliding window approach would be needed.
                    // This simplified version counts any sequence of 4+ markers not blocked by enemy rings.
                }
            }
        }
        return threatCount;
    }
}

// Interfaces for structured action data
interface MovePart {
    type: 'move';
    from: Coord;
    to: Coord;
    flippedMarkers: Coord[]; // Populated during simulation to evaluate marker flipping
}

interface RemovePart {
    type: 'remove';
    markersStart: Coord;
    markersEnd: Coord;
    ringToRemove: Coord;
}

interface Action {
    originalString: string;
    parts: (MovePart | RemovePart)[];
    isPlacement: boolean;
    isSteal: boolean;
    // These deltas are pre-calculated during simulation for faster evaluation
    myRingsRemovedDelta: number;
    enemyRingsRemovedDelta: number;
    myMarkersDelta: number;
    enemyMarkersDelta: number;
    isWin: boolean;
}

// Parses a single action string into a structured Action object
function parseAction(actionString: string): Action {
    const action: Action = {
        originalString: actionString,
        parts: [],
        isPlacement: false,
        isSteal: false,
        myRingsRemovedDelta: 0,
        enemyRingsRemovedDelta: 0,
        myMarkersDelta: 0,
        enemyMarkersDelta: 0,
        isWin: false,
    };

    if (actionString === "STEAL") {
        action.isSteal = true;
        return action;
    }

    const segments = actionString.split(';');

    for (const segment of segments) {
        if (segment.startsWith('x')) { // Removal part (e.g., "xe4-i4xg2")
            const parts = segment.substring(1).split('x'); // ["e4-i4", "g2"]
            const markerCoords = parts[0].split('-');
            const ringCoord = parts[1];
            action.parts.push({
                type: 'remove',
                markersStart: toBoardCoords(markerCoords[0]),
                markersEnd: toBoardCoords(markerCoords[1]),
                ringToRemove: toBoardCoords(ringCoord),
            });
        } else if (segment.includes('-')) { // Move part (e.g., "b3-c3")
            const coords = segment.split('-');
            action.parts.push({
                type: 'move',
                from: toBoardCoords(coords[0]),
                to: toBoardCoords(coords[1]),
                flippedMarkers: [] // This will be populated during simulation
            });
        } else { // Placement part (single coordinate, e.g., "c6")
            action.isPlacement = true;
            action.parts.push({
                type: 'move', // Represent placement as a move from a dummy point
                from: { col: -1, row: -1 }, // Dummy 'from' for placements
                to: toBoardCoords(segment),
                flippedMarkers: []
            });
        }
    }
    return action;
}

// Simulates an action on a board and returns the resulting board state and calculated deltas
function simulateAction(originalBoard: Board, action: Action, myPlayerId: number): Board {
    const board = originalBoard.clone();

    let myMarkersChange = 0;
    let enemyMarkersChange = 0;
    let myRingsRemovedCurrentTurn = 0;
    let enemyRingsRemovedCurrentTurn = 0;

    for (const part of action.parts) {
        if (part.type === 'move') {
            if (action.isPlacement) {
                // Ring Placement Phase
                const targetCoord = part.to;
                const ringType = (myPlayerId === 0) ? CellState.MY_RING : CellState.ENEMY_RING; // Player 0 is White (R), Player 1 is Black (r)
                board.setCell(targetCoord.col, targetCoord.row, ringType);
                if (myPlayerId === 0) board.myRings.push(targetCoord);
                else board.enemyRings.push(targetCoord);

                // STEAL action: Black takes White's first ring's spot. The board state will reflect this in next turn's input.
                // For simulation, we only care about the current board state resulting from THIS action.
                // The actual logic of changing ring ownership on STEAL is handled by the referee.
                // If I'm Black and STEAL, I place my ring. The effect on opponent's rings is not direct here.

            } else {
                // Ring Movement Phase
                const fromCoord = part.from;
                const toCoord = part.to;

                const movedRingType = board.getCell(fromCoord.col, fromCoord.row);
                const markerType = (movedRingType === CellState.MY_RING) ? CellState.MY_MARKER : CellState.ENEMY_MARKER;
                
                // 1. Place a marker at the original position of the ring
                board.setCell(fromCoord.col, fromCoord.row, markerType);
                if (markerType === CellState.MY_MARKER) myMarkersChange++; else enemyMarkersChange++;

                // 2. Move the ring to the new position
                board.setCell(toCoord.col, toCoord.row, movedRingType);
                // Update ring lists
                if (movedRingType === CellState.MY_RING) {
                    const idx = board.myRings.findIndex(c => c.col === fromCoord.col && c.row === fromCoord.row);
                    if (idx !== -1) board.myRings[idx] = toCoord;
                } else { // Enemy ring (shouldn't happen for my legal moves, but for generality)
                    const idx = board.enemyRings.findIndex(c => c.col === fromCoord.col && c.row === fromCoord.row);
                    if (idx !== -1) board.enemyRings[idx] = toCoord;
                }

                // 3. Determine direction vector for path traversal
                const dc = Math.sign(toCoord.col - fromCoord.col);
                const dr = Math.sign(toCoord.row - fromCoord.row);

                // 4. Flip markers that were jumped over
                let currentC = fromCoord.col + dc;
                let currentR = fromCoord.row + dr;

                const flipped: Coord[] = [];
                while (currentC !== toCoord.col || currentR !== toCoord.row) {
                    const jumpedCellState = board.getCell(currentC, currentR);
                    if (jumpedCellState === CellState.MY_MARKER) {
                        board.setCell(currentC, currentR, CellState.ENEMY_MARKER);
                        myMarkersChange--;
                        enemyMarkersChange++;
                        flipped.push({ col: currentC, row: currentR });
                    } else if (jumpedCellState === CellState.ENEMY_MARKER) {
                        board.setCell(currentC, currentR, CellState.MY_MARKER);
                        myMarkersChange++;
                        enemyMarkersChange--;
                        flipped.push({ col: currentC, row: currentR });
                    } else if (jumpedCellState !== CellState.EMPTY) {
                        // Should not jump over rings or invalid states, break if unexpected
                        break;
                    }
                    currentC += dc;
                    currentR += dr;
                }
                (part as MovePart).flippedMarkers = flipped; // Store for evaluation
            }
        } else if (part.type === 'remove') {
            // Marker and Ring Removal Phase
            const start = part.markersStart;
            const end = part.markersEnd;
            const ring = part.ringToRemove;

            // Determine line direction
            const dc = Math.sign(end.col - start.col);
            const dr = Math.sign(end.row - start.row);

            let currentC = start.col;
            let currentR = start.row;

            // Remove markers along the line
            while (true) {
                const markerState = board.getCell(currentC, currentR);
                if (markerState === CellState.MY_MARKER) myMarkersChange--;
                else if (markerState === CellState.ENEMY_MARKER) enemyMarkersChange--;
                board.setCell(currentC, currentR, CellState.EMPTY); // Remove marker from board

                if (currentC === end.col && currentR === end.row) break; // Reached end of line
                currentC += dc;
                currentR += dr;
            }

            // Determine if it's my ring or enemy ring being removed
            const ringBeingRemovedState = originalBoard.getCell(ring.col, ring.row); // Use original board state for ownership
            
            // Remove the ring from board and from ring list
            board.setCell(ring.col, ring.row, CellState.EMPTY);
            if (myPlayerId === 0 && ringBeingRemovedState === CellState.MY_RING || myPlayerId === 1 && ringBeingRemovedState === CellState.MY_RING) { // It's my ring being removed
                myRingsRemovedCurrentTurn++;
                board.myRings = board.myRings.filter(c => c.col !== ring.col || c.row !== ring.row);
            } else { // It's opponent's ring being removed
                enemyRingsRemovedCurrentTurn++;
                board.enemyRings = board.enemyRings.filter(c => c.col !== ring.col || c.row !== ring.row);
            }
        }
    }
    
    // Update total removed rings counts on the simulated board
    board.myRemovedRings = originalBoard.myRemovedRings + myRingsRemovedCurrentTurn;
    board.enemyRemovedRings = originalBoard.enemyRemovedRings + enemyRingsRemovedCurrentTurn;

    // Set deltas on the Action object for evaluation
    action.myMarkersDelta = myMarkersChange;
    action.enemyMarkersDelta = enemyMarkersChange;
    action.myRingsRemovedDelta = myRingsRemovedCurrentTurn;
    action.enemyRingsRemovedDelta = enemyRingsRemovedCurrentTurn;
    action.isWin = board.myRemovedRings >= 3; // Check if this action results in a win

    return board;
}

// Evaluation function to score an action
function evaluateAction(action: Action, currentBoard: Board): number {
    // Simulate the action to get the resulting board state
    const simulatedBoard = simulateAction(currentBoard, action, myId);

    let score = 0;

    // 1. Win condition: Highest priority
    if (simulatedBoard.myRemovedRings >= 3) {
        return 1000000; // Overwhelmingly high score for winning
    }
    // If opponent wins (shouldn't be a choice for my turn, but as a safeguard)
    if (simulatedBoard.enemyRemovedRings >= 3) {
        return -1000000; // Extremely low score for losing
    }

    // 2. Ring removals: High bonus for removing my rings, high penalty for opponent removing theirs
    score += action.myRingsRemovedDelta * 10000;
    score -= action.enemyRingsRemovedDelta * 10000;
    
    // 3. Marker count: Moderate bonus for having more markers of my color, penalty for opponent's markers
    score += action.myMarkersDelta * 10;
    score -= action.enemyMarkersDelta * 10;

    // 4. Flipping markers: Bonus for flipping opponent markers to mine, penalty for flipping my markers to opponent
    let markersFlippedToMe = 0;
    let markersFlippedToOpponent = 0;
    for (const part of action.parts) {
        if (part.type === 'move') {
            for (const flippedCoord of part.flippedMarkers) {
                const stateAfterFlip = simulatedBoard.getCell(flippedCoord.col, flippedCoord.row);
                // If I'm player 0 (White) and the marker is MY_MARKER (S) or ENEMY_MARKER (s)
                if ((myId === 0 && stateAfterFlip === CellState.MY_MARKER) || (myId === 1 && stateAfterFlip === CellState.ENEMY_MARKER)) {
                    markersFlippedToMe++;
                } else {
                    markersFlippedToOpponent++;
                }
            }
        }
    }
    score += markersFlippedToMe * 5;
    score -= markersFlippedToOpponent * 5;

    // 5. Threat detection (4-in-a-row potential) on the simulated board
    score += simulatedBoard.countThreats(true) * 50; // My threats are good
    score -= simulatedBoard.countThreats(false) * 50; // Opponent threats are bad (I want to avoid helping them)

    // 6. Ring positioning (especially relevant during placement phase)
    if (action.isPlacement) {
        const targetCoord = (action.parts[0] as MovePart).to;
        // Simple heuristic: prefer central spots (f6 is (5,5) in board coords)
        const centerRow = Math.floor(MAX_ROW_COUNT / 2);
        const centerCol = Math.floor(MAX_COL_COUNT / 2);
        const distanceToCenter = Math.sqrt(Math.pow(targetCoord.row - centerRow, 2) + Math.pow(targetCoord.col - centerCol, 2));
        score -= distanceToCenter * 2; // Penalize distance from center
    }
    
    // 7. STEAL action evaluation (specific to black player's first move)
    if (action.isSteal) {
        if (myId === 1 && turn === 1) { // Only black player can STEAL on their first move (turn 1)
            score += 5000; // Significant bonus for stealing the first player's ring
        }
    }

    return score;
}

// Main game loop
function main() {
    myId = parseInt(readline()); // Read my player ID (0 or 1)
    let firstTurn = true; // Flag for the very first turn to output "yes"

    while (true) {
        // --- Read Game State Input ---
        const board = new Board(); // Create a new board object for the current turn
        
        // Read hex grid rows
        const hexGridRowsCount = parseInt(readline());
        for (let r = 0; r < hexGridRowsCount; r++) {
            const line = readline();
            let colOffset = 0;
            // Adjust column offset for rows 7-11 to correctly map input chars to board columns
            if (r >= 6) { 
                colOffset = r - 5;
            }
            for (let c = 0; c < line.length; c++) {
                const cellState = charToCellState(line[c]);
                const boardCol = c + colOffset;
                board.setCell(boardCol, r, cellState);

                // Populate ring and marker lists on the board object
                if (cellState === CellState.MY_RING) board.myRings.push({ col: boardCol, row: r });
                else if (cellState === CellState.MY_MARKER) board.myMarkers.push({ col: boardCol, row: r });
                else if (cellState === CellState.ENEMY_RING) board.enemyRings.push({ col: boardCol, row: r });
                else if (cellState === CellState.ENEMY_MARKER) board.enemyMarkers.push({ col: boardCol, row: r });
            }
        }

        // Read legal actions for the current turn
        const actionCount = parseInt(readline());
        const legalActions: Action[] = [];
        for (let i = 0; i < actionCount; i++) {
            legalActions.push(parseAction(readline()));
        }

        // --- Game Logic ---
        let bestAction: Action | null = null;
        let maxScore = -Infinity;

        if (firstTurn) {
            console.log("yes"); // Output "yes" on the very first turn to receive legal moves
            firstTurn = false;
        } else {
            // Evaluate each legal action and choose the one with the highest score
            for (const action of legalActions) {
                const score = evaluateAction(action, board);
                if (score > maxScore) {
                    maxScore = score;
                    bestAction = action;
                }
            }

            // Output the chosen best action
            if (bestAction) {
                console.log(bestAction.originalString);
            } else {
                // This case should ideally not be reached if actionCount > 0, but as a fallback
                console.log("NO_VALID_MOVE"); 
            }
        }
        turn++; // Increment turn counter for phase tracking
    }
}

// Start the game loop
main();