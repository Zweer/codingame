import { readFileSync } from 'fs';

// Helper to parse pattern strings like "F4"
function parsePattern(s: string): { char: string; count: number } {
    return {
        char: s[0],
        count: parseInt(s.substring(1))
    };
}

// Function to solve the puzzle
function solve() {
    const inputLine = readFileSync(0, 'utf-8').trim();
    const parts = inputLine.split(' ');

    const sideSize = parseInt(parts[0]);
    const startCorner = parts[1];
    const direction = parts[2];
    const pattern1Def = parsePattern(parts[3]);
    const pattern2Def = parsePattern(parts[4]);

    // Grid initialization
    const grid: string[][] = Array(sideSize).fill(null).map(() => Array(sideSize).fill(' '));

    // Current position and direction
    let r: number;
    let c: number;
    let dr: number; // delta row
    let dc: number; // delta col

    // Set initial position and direction based on startCorner and spiral direction
    // This defines the very first cell and the direction of the first movement.
    // The first segment length will be sideSize - 1.
    if (startCorner === 'topLeft') {
        r = 0;
        c = 0;
        if (direction === 'clockwise') {
            dr = 0; dc = 1; // Start Right
        } else { // counter-clockwise
            dr = 1; dc = 0; // Start Down
        }
    } else if (startCorner === 'topRight') {
        r = 0;
        c = sideSize - 1;
        if (direction === 'clockwise') {
            dr = 0; dc = -1; // Start Left
        } else { // counter-clockwise
            dr = 1; dc = 0; // Start Down
        }
    } else if (startCorner === 'bottomRight') {
        r = sideSize - 1;
        c = sideSize - 1;
        if (direction === 'clockwise') {
            dr = 0; dc = -1; // Start Left
        } else { // counter-clockwise
            dr = -1; dc = 0; // Start Up
        }
    } else { // bottomLeft
        r = sideSize - 1;
        c = 0;
        if (direction === 'clockwise') {
            dr = 0; dc = 1; // Start Right
        } else { // counter-clockwise
            dr = -1; dc = 0; // Start Up
        }
    }

    // Spiral movement state
    // The very first cell is placed. Then segments of length sideSize - 1, then sideSize - 1, then sideSize - 2, etc.
    let currentSegmentLength = sideSize - 1;
    let stepsInCurrentSegment = 0; // How many steps taken in the current segment
    let segmentsCompletedInLayer = 0; // Counts 0, 1 for the first two segments, then resets for next pair

    // Character pattern state
    const A_CODE = 'A'.charCodeAt(0);
    const Z_CODE = 'Z'.charCodeAt(0);
    let activePatternIdx = 0; // 0 for pattern1, 1 for pattern2
    let charCountsInCurrentPatternBlock = 0; // How many chars printed using the current pattern's character
    let pattern1CurrentCharCode = pattern1Def.char.charCodeAt(0); // The current char for pattern1's progression
    let pattern2CurrentCharCode = pattern2Def.char.charCodeAt(0); // The current char for pattern2's progression
    let noMoreMaterial = false; // Flag to indicate if characters are exhausted

    // Helper to rotate direction (dr, dc)
    const rotate = (currentDr: number, currentDc: number, dir: string): [number, number] => {
        if (dir === 'clockwise') {
            // Clockwise rotation: (dx, dy) -> (dy, -dx)
            // (0,1) R -> (1,0) D -> (0,-1) L -> (-1,0) U -> (0,1) R
            return [currentDc, -currentDr];
        } else { // counter-clockwise
            // Counter-clockwise rotation: (dx, dy) -> (-dy, dx)
            // (0,1) R -> (-1,0) U -> (0,-1) L -> (1,0) D -> (0,1) R
            return [-currentDc, currentDr];
        }
    };
    
    // Iterate through all cells in the grid
    for (let i = 0; i < sideSize * sideSize; i++) {
        let charToPlace = ' '; // Default to space

        if (!noMoreMaterial) {
            // Determine which character to use based on the active pattern
            if (activePatternIdx === 0) { // Using pattern 1's character
                charToPlace = String.fromCharCode(pattern1CurrentCharCode);
            } else { // Using pattern 2's character
                charToPlace = String.fromCharCode(pattern2CurrentCharCode);
            }
        }
        grid[r][c] = charToPlace;

        // Update character pattern state after placing a character
        charCountsInCurrentPatternBlock++;

        const currentPatternCount = (activePatternIdx === 0) ? pattern1Def.count : pattern2Def.count;
        if (charCountsInCurrentPatternBlock === currentPatternCount) {
            charCountsInCurrentPatternBlock = 0; // Reset count for the next block of characters

            // Update the character for the pattern that just finished
            if (activePatternIdx === 0) { // Pattern 1 block just finished
                pattern1CurrentCharCode++; // Increment char for *next time* pattern1 is active
                if (pattern1CurrentCharCode > Z_CODE) {
                    pattern1CurrentCharCode = Z_CODE; // Clamp to 'Z'
                    noMoreMaterial = true; // No more material if we go past 'Z'
                }
                activePatternIdx = 1; // Switch to pattern 2 for the next character
            } else { // Pattern 2 block just finished
                pattern2CurrentCharCode--; // Decrement char for *next time* pattern2 is active
                if (pattern2CurrentCharCode < A_CODE) {
                    pattern2CurrentCharCode = A_CODE; // Clamp to 'A'
                    noMoreMaterial = true; // No more material if we go past 'A'
                }
                activePatternIdx = 0; // Switch to pattern 1 for the next character
            }
        }

        // Handle spiral movement: Only move if not the very last cell to avoid out-of-bounds
        if (i < sideSize * sideSize - 1) { 
            stepsInCurrentSegment++;
            if (stepsInCurrentSegment === currentSegmentLength) {
                // Current segment finished, time to turn
                stepsInCurrentSegment = 0; // Reset steps for the new segment
                segmentsCompletedInLayer++;

                [dr, dc] = rotate(dr, dc, direction); // Rotate the direction vector

                // If two segments (a pair) have been completed, decrease the segment length
                if (segmentsCompletedInLayer === 2) {
                    currentSegmentLength--;
                    segmentsCompletedInLayer = 0; // Reset for the next pair of segments
                }
            }
            // Move to the next position
            r += dr;
            c += dc;
        }
    }

    // Output the generated grid
    // If sideSize is greater than 31, output only the top-left 31x31 section
    const outputSideSize = Math.min(sideSize, 31);
    for (let i = 0; i < outputSideSize; i++) {
        console.log(grid[i].slice(0, outputSideSize).join(''));
    }
}

solve();