import * as readline from 'node:readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let board: string[][] = [];
const myPieces: { r: number; c: number }[] = [];
let lineCount = 0;

rl.on('line', (line: string) => {
    board.push(line.split(''));
    for (let c = 0; c < line.length; c++) {
        if (line[c] === 'X') {
            myPieces.push({ r: lineCount, c: c });
        }
    }
    lineCount++;
});

rl.on('close', () => {
    solve();
});

// Helper function to check if a cell is within board boundaries
function isValidCell(r: number, c: number): boolean {
    return r >= 0 && r < 6 && c >= 0 && c < 6;
}

// Interface for a state in BFS
interface BFSState {
    r: number;
    c: number;
    dr: number; // current direction row delta
    dc: number; // current direction col delta
    hasLooped: boolean; // true if the path has involved a loop
}

interface LoopResult {
    r: number;
    c: number;
    dr: number;
    dc: number;
}

/**
 * Determines the next position and direction when a piece
 * TRIES TO GO OFF THE BOARD and is forced into a CLOCKWISE loop.
 *
 * @param r current row position (must be on an edge)
 * @param c current column position (must be on an edge)
 * @param dr current direction row delta (e.g., -1 for Up, 1 for Down)
 * @param dc current direction col delta (e.g., -1 for Left, 1 for Right)
 * @returns LoopResult containing the new position and direction, or null if not a valid redirect scenario.
 */
function getClockwiseRedirect(r: number, c: number, dr: number, dc: number): LoopResult | null {
    // Piece is on the top edge (r=0) and tries to move UP (dr=-1)
    if (r === 0 && dr === -1) {
        if (c === 0) return { r: 0, c: 1, dr: 0, dc: 1 }; // From (0,0) UP -> (0,1) [Right along top]
        if (c === 5) return { r: 1, c: 5, dr: 1, dc: 0 }; // From (0,5) UP -> (1,5) [Down along right]
        return { r: 0, c: c + 1, dr: 0, dc: 1 }; // From (0,c) UP -> (0,c+1) [Right along top]
    }
    // Piece is on the right edge (c=5) and tries to move RIGHT (dc=1)
    if (c === 5 && dc === 1) {
        if (r === 0) return { r: 1, c: 5, dr: 1, dc: 0 }; // From (0,5) RIGHT -> (1,5) [Down along right]
        if (r === 5) return { r: 5, c: 4, dr: 0, dc: -1 }; // From (5,5) RIGHT -> (5,4) [Left along bottom]
        return { r: r + 1, c: 5, dr: 1, dc: 0 }; // From (r,5) RIGHT -> (r+1,5) [Down along right]
    }
    // Piece is on the bottom edge (r=5) and tries to move DOWN (dr=1)
    if (r === 5 && dr === 1) {
        if (c === 5) return { r: 5, c: 4, dr: 0, dc: -1 }; // From (5,5) DOWN -> (5,4) [Left along bottom]
        if (c === 0) return { r: 4, c: 0, dr: -1, dc: 0 }; // From (5,0) DOWN -> (4,0) [Up along left]
        return { r: 5, c: c - 1, dr: 0, dc: -1 }; // From (5,c) DOWN -> (5,c-1) [Left along bottom]
    }
    // Piece is on the left edge (c=0) and tries to move LEFT (dc=-1)
    if (c === 0 && dc === -1) {
        if (r === 5) return { r: 4, c: 0, dr: -1, dc: 0 }; // From (5,0) LEFT -> (4,0) [Up along left]
        if (r === 0) return { r: 0, c: 1, dr: 0, dc: 1 }; // From (0,0) LEFT -> (0,1) [Right along top]
        return { r: r - 1, c: 0, dr: -1, dc: 0 }; // From (r,0) LEFT -> (r-1,0) [Up along left]
    }
    return null; // Not a valid clockwise redirect scenario for this position/direction
}

/**
 * Determines the next position and direction when a piece
 * TRIES TO GO OFF THE BOARD and is forced into a COUNTER-CLOCKWISE loop.
 *
 * @param r current row position (must be on an edge)
 * @param c current column position (must be on an edge)
 * @param dr current direction row delta (e.g., -1 for Up, 1 for Down)
 * @param dc current direction col delta (e.g., -1 for Left, 1 for Right)
 * @returns LoopResult containing the new position and direction, or null if not a valid redirect scenario.
 */
function getCounterClockwiseRedirect(r: number, c: number, dr: number, dc: number): LoopResult | null {
    // Piece is on the top edge (r=0) and tries to move UP (dr=-1)
    if (r === 0 && dr === -1) {
        if (c === 0) return { r: 1, c: 0, dr: 1, dc: 0 }; // From (0,0) UP -> (1,0) [Down along left]
        if (c === 5) return { r: 0, c: 4, dr: 0, dc: -1 }; // From (0,5) UP -> (0,4) [Left along top]
        return { r: 0, c: c - 1, dr: 0, dc: -1 }; // From (0,c) UP -> (0,c-1) [Left along top]
    }
    // Piece is on the right edge (c=5) and tries to move RIGHT (dc=1)
    if (c === 5 && dc === 1) {
        if (r === 0) return { r: 0, c: 4, dr: 0, dc: -1 }; // From (0,5) RIGHT -> (0,4) [Left along top]
        if (r === 5) return { r: 4, c: 5, dr: -1, dc: 0 }; // From (5,5) RIGHT -> (4,5) [Up along right]
        return { r: r - 1, c: 5, dr: -1, dc: 0 }; // From (r,5) RIGHT -> (r-1,5) [Up along right]
    }
    // Piece is on the bottom edge (r=5) and tries to move DOWN (dr=1)
    if (r === 5 && dr === 1) {
        if (c === 5) return { r: 4, c: 5, dr: -1, dc: 0 }; // From (5,5) DOWN -> (4,5) [Up along right]
        if (c === 0) return { r: 5, c: 1, dr: 0, dc: 1 }; // From (5,0) DOWN -> (5,1) [Right along bottom]
        return { r: 5, c: c + 1, dr: 0, dc: 1 }; // From (5,c) DOWN -> (5,c+1) [Right along bottom]
    }
    // Piece is on the left edge (c=0) and tries to move LEFT (dc=-1)
    if (c === 0 && dc === -1) {
        if (r === 5) return { r: 5, c: 1, dr: 0, dc: 1 }; // From (5,0) LEFT -> (5,1) [Right along bottom]
        if (r === 0) return { r: 1, c: 0, dr: 1, dc: 0 }; // From (0,0) LEFT -> (1,0) [Down along left]
        return { r: r + 1, c: 0, dr: 1, dc: 0 }; // From (r,0) LEFT -> (r+1,0) [Down along left]
    }
    return null; // Not a valid counter-clockwise redirect scenario for this position/direction
}

function solve() {
    let totalCaptures = 0;

    // The four initial straight directions a piece can move
    const initialDirections = [
        { dr: 0, dc: 1 },  // Right
        { dr: 0, dc: -1 }, // Left
        { dr: 1, dc: 0 },  // Down
        { dr: -1, dc: 0 }  // Up
    ];

    // Iterate through each of our pieces on the board
    for (const startPiece of myPieces) {
        // For each piece, consider each of the 4 initial straight directions
        for (const { dr: initialDr, dc: initialDc } of initialDirections) {
            const queue: BFSState[] = [];
            // visited set: stores "r,c,dr,dc,hasLooped" to prevent re-processing identical states
            const visited = new Set<string>();

            // Add the initial state to the queue
            queue.push({ r: startPiece.r, c: startPiece.c, dr: initialDr, dc: initialDc, hasLooped: false });
            visited.add(`${startPiece.r},${startPiece.c},${initialDr},${initialDc},false`);

            let foundCaptureOnThisPath = false; // Flag to track if this specific initial move results in a capture

            let head = 0; // Manual queue pointer for performance (alternative to `shift()`)
            while (head < queue.length) {
                const { r: currR, c: currC, dr: currDr, dc: currDc, hasLooped: currHasLooped } = queue[head++];

                let nextR = currR + currDr;
                let nextC = currC + currDc;
                let newHasLooped = currHasLooped;

                // --- Handle Movement Logic ---

                // Scenario 1: Attempting to move off the board (triggers loop redirection)
                if (!isValidCell(nextR, nextC)) {
                    newHasLooped = true; // A loop transition occurs, so future moves are "looped"

                    // Branch 1: Clockwise loop redirect
                    const cwRedirect = getClockwiseRedirect(currR, currC, currDr, currDc);
                    if (cwRedirect) {
                        const stateKey = `${cwRedirect.r},${cwRedirect.c},${cwRedirect.dr},${cwRedirect.dc},true`;
                        if (!visited.has(stateKey)) {
                            // Check the destination cell of the redirect
                            if (board[cwRedirect.r][cwRedirect.c] === 'X') {
                                // Blocked by own piece, this branch of path ends
                            } else if (board[cwRedirect.r][cwRedirect.c] === 'O') {
                                foundCaptureOnThisPath = true; // Valid capture (loop has occurred)
                                // Path is blocked by the captured opponent, this branch ends
                            } else {
                                // Empty cell, continue this branch of path
                                visited.add(stateKey);
                                queue.push({ r: cwRedirect.r, c: cwRedirect.c, dr: cwRedirect.dr, dc: cwRedirect.dc, hasLooped: true });
                            }
                        }
                    }

                    // Branch 2: Counter-clockwise loop redirect
                    const ccwRedirect = getCounterClockwiseRedirect(currR, currC, currDr, currDc);
                    if (ccwRedirect) {
                        const stateKey = `${ccwRedirect.r},${ccwRedirect.c},${ccwRedirect.dr},${ccwRedirect.dc},true`;
                        if (!visited.has(stateKey)) {
                            // Check the destination cell of the redirect
                            if (board[ccwRedirect.r][ccwRedirect.c] === 'X') {
                                // Blocked
                            } else if (board[ccwRedirect.r][ccwRedirect.c] === 'O') {
                                foundCaptureOnThisPath = true; // Valid capture
                                // Blocked
                            } else {
                                // Empty
                                visited.add(stateKey);
                                queue.push({ r: ccwRedirect.r, c: ccwRedirect.c, dr: ccwRedirect.dr, dc: ccwRedirect.dc, hasLooped: true });
                            }
                        }
                    }
                    continue; // The current path segment from (currR,currC) ends here by redirecting into new branches
                }

                // Scenario 2: Normal straight move (nextR, nextC is on board)
                // Check for blocking pieces at the next position
                if (board[nextR][nextC] === 'X') {
                    continue; // Path is blocked by own piece, ends here.
                }

                if (board[nextR][nextC] === 'O') {
                    if (newHasLooped) { // Only a capture if the path has involved a loop
                        foundCaptureOnThisPath = true;
                    }
                    continue; // Path is blocked by opponent (whether captured or just blocked), ends here.
                }

                // If not blocked by 'X' or 'O', and not a loop redirect, continue the path straight
                const stateKey = `${nextR},${nextC},${currDr},${currDc},${newHasLooped}`;
                if (!visited.has(stateKey)) {
                    visited.add(stateKey);
                    // Continue with the same direction as it's a straight path segment
                    queue.push({ r: nextR, c: nextC, dr: currDr, dc: currDc, hasLooped: newHasLooped });
                }
            }

            // If this specific initial move (startPiece + initialDirection) found any capture, count it.
            if (foundCaptureOnThisPath) {
                totalCaptures++;
            }
        }
    }

    console.log(totalCaptures);
}