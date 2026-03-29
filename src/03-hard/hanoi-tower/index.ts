// Define readline for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

// Read input
const N: number = parseInt(readline()); // Number of disks
const T: number = parseInt(readline()); // Turn for which to display the game state

// Initialize pegs: P0 (left), P1 (middle), P2 (right)
// Each peg is an array of disk sizes. Disks are pushed/popped from the end,
// so the top of the stack is the last element.
// Initial state: all disks on P0, largest at bottom (N) smallest at top (1).
const pegs: number[][] = [[], [], []];
for (let i = N; i >= 1; i--) {
    pegs[0].push(i);
}

let smallestDiskCurrentPeg: number = 0; // Tracks which peg disk 1 (smallest) is on
let turnCount: number = 0;
let stateAtT: number[][] | null = null; // To store the game state at turn T

/**
 * Helper function to get the top disk from a peg.
 * Returns the disk size or 0 if the peg is empty.
 */
function getTopDisk(pegIndex: number): number {
    const peg = pegs[pegIndex];
    return peg.length > 0 ? peg[peg.length - 1] : 0;
}

/**
 * Helper function to move a disk from a source peg to a destination peg.
 * Assumes the move is valid according to Hanoi rules for the disk being moved.
 * Updates smallestDiskCurrentPeg if disk 1 is moved.
 */
function makeMove(sourcePegIndex: number, destPegIndex: number) {
    const disk = pegs[sourcePegIndex].pop();
    if (disk !== undefined) {
        pegs[destPegIndex].push(disk);
        // If the smallest disk (1) was moved, update its current peg
        if (disk === 1) {
            smallestDiskCurrentPeg = destPegIndex;
        }
    }
}

// Simulate the game turn by turn until all disks are on peg 2 or turn T is reached
while (pegs[2].length !== N) {
    // 1. Move the smallest disk (disk 1)
    let targetPegForSmallest: number;
    if (N % 2 === 0) { // If N is even, smallest disk moves right (0->1, 1->2, 2->0)
        targetPegForSmallest = (smallestDiskCurrentPeg + 1) % 3;
    } else { // If N is odd, smallest disk moves left (0->2, 2->1, 1->0)
        targetPegForSmallest = (smallestDiskCurrentPeg - 1 + 3) % 3;
    }
    makeMove(smallestDiskCurrentPeg, targetPegForSmallest);
    turnCount++;

    // Capture state if current turn matches T
    if (turnCount === T) {
        // Deep copy the pegs state to store it for later output
        stateAtT = JSON.parse(JSON.stringify(pegs));
    }

    // Check if the game is finished after this move (before the second move of the turn)
    if (pegs[2].length === N) break;

    // 2. Make the single other possible move not involving the smallest disk
    // The two pegs not involved in the smallest disk move are candidates.
    // These are the pegs that do not currently hold the smallest disk.
    const otherPegs: number[] = [];
    for (let i = 0; i < 3; i++) {
        if (i !== smallestDiskCurrentPeg) {
            otherPegs.push(i);
        }
    }

    const pegA = otherPegs[0];
    const pegB = otherPegs[1];

    const topA = getTopDisk(pegA);
    const topB = getTopDisk(pegB);

    // Determine the valid move between pegA and pegB based on the puzzle's rule:
    // Move the smaller disk to the larger disk or to an empty peg.
    if (topA === 0) { // Peg A is empty, move from B to A
        makeMove(pegB, pegA);
    } else if (topB === 0) { // Peg B is empty, move from A to B
        makeMove(pegA, pegB);
    } else if (topA < topB) { // Top of A is smaller than top of B, move from A to B
        makeMove(pegA, pegB);
    } else { // Top of B is smaller than top of A, move from B to A
        makeMove(pegB, pegA);
    }

    turnCount++;

    // Capture state if current turn matches T
    if (turnCount === T) {
        stateAtT = JSON.parse(JSON.stringify(pegs));
    }

    // Check if the game is finished after this move
    if (pegs[2].length === N) break;
}

// Output the game state at turn T
if (stateAtT) {
    const maxDiskWidth = 2 * N + 1; // Width of the largest disk including the axis
    const poleChar = '|';
    const diskChar = '#';

    // Iterate N times for N rows, from top to bottom
    for (let i = 0; i < N; i++) {
        let line = '';
        for (let p = 0; p < 3; p++) { // Iterate through the three pegs
            const currentPegState = stateAtT[p];
            // Calculate index from bottom: 0 for the lowest disk, N-1 for the highest disk
            const diskIndexFromBottom = N - 1 - i;

            if (diskIndexFromBottom < currentPegState.length) {
                // There is a disk at this height
                const diskSize = currentPegState[diskIndexFromBottom];
                const diskWidth = 2 * diskSize + 1;
                const padding = (maxDiskWidth - diskWidth) / 2; // Spaces on each side of the disk
                line += ' '.repeat(padding) + diskChar.repeat(diskWidth) + ' '.repeat(padding);
            } else {
                // No disk at this height, print the pole
                line += ' '.repeat((maxDiskWidth - 1) / 2) + poleChar + ' '.repeat((maxDiskWidth - 1) / 2);
            }
            if (p < 2) { // Add a single space separator between pegs
                line += ' ';
            }
        }
        print(line.trimEnd()); // Remove any trailing spaces from the line
    }
}

// Output the total number of turns required to complete the game
print(Math.pow(2, N) - 1);