// Helper to read input line by line (provided by CodinGame environment)
declare function readline(): string;
declare function print(message: any): void;

// Read input
const H: number = parseInt(readline());
const W: number = parseInt(readline());
const currentD: string = readline(); // "LEFT" or "RIGHT"

// Initialize grid from input
const initialGrid: string[][] = [];
for (let i = 0; i < H; i++) {
    initialGrid.push(readline().split(''));
}

// --- Rod Identification ---
// isRod[r][c] will be true if cell (r,c) is part of the fishing rod
const isRod: boolean[][] = Array(H).fill(0).map(() => Array(W).fill(false));
let hasAnyPipe = false; // Flag to check if any '|' character exists in the grid

// Pass 1: Identify all '|' characters and mark them as rod segments
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (initialGrid[r][c] === '|') {
            isRod[r][c] = true;
            hasAnyPipe = true;
        }
    }
}

// Pass 2: Identify 'C' characters that are part of the rod based on rules
if (!hasAnyPipe) {
    // Special Case: No '|' characters in the entire grid. Rod must be formed by a 'C'.
    // "first 'C' in the first row" means the one with the smallest column index.
    let rodAnchorCol = -1;
    for (let c = 0; c < W; c++) {
        if (initialGrid[0][c] === 'C') {
            rodAnchorCol = c;
            break; // Found the leftmost 'C' in row 0
        }
    }

    if (rodAnchorCol !== -1) {
        // This 'C' and any 'C's directly below it in the same column form the rod.
        for (let r = 0; r < H; r++) {
            if (initialGrid[r][rodAnchorCol] === 'C') {
                isRod[r][rodAnchorCol] = true;
            } else {
                break; // Rod continuity broken downwards (e.g., water or other char below C)
            }
        }
    }
} else {
    // Normal Case: There are '|' characters. 'C's are part of the rod only if directly below another rod segment.
    // Use a queue for BFS-like propagation from existing rod segments.
    const queue: { r: number; c: number }[] = [];

    // Add all initial rod segments (from '|') to the queue
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (isRod[r][c]) { // `isRod` already contains all '|'s from Pass 1
                queue.push({ r, c });
            }
        }
    }

    let head = 0;
    while (head < queue.length) {
        const { r, c } = queue[head++];

        // Check the cell directly below. If it's a 'C' and not already marked as rod,
        // mark it as rod and add to queue to propagate further down.
        if (r + 1 < H && initialGrid[r + 1][c] === 'C' && !isRod[r + 1][c]) {
            isRod[r + 1][c] = true;
            queue.push({ r + 1, c });
        }
    }
}

// --- Simulation ---
// Create a deep copy of the initial grid for current game state
let currentGrid: string[][] = [];
for (let r = 0; r < H; r++) {
    currentGrid.push(initialGrid[r].slice()); // slice() creates a shallow copy of the row array
}

let fishCaught = 0;
let rodBroken = false;

// Simulation loop. Continues as long as the rod is not broken.
// The loop breaks if the grid state stops changing, implying all movement and collisions have resolved.
while (!rodBroken) {
    // Prepare the next state of the grid
    const nextGrid: string[][] = Array(H).fill(0).map(() => Array(W).fill('.'));

    // collisionMap will store entities moving into a cell in the next turn
    // Key: "row,col", Value: { fishes: string[], garbages: string[] }
    const collisionMap: Map<string, { fishes: string[], garbages: string[] }> = new Map();

    // First, populate nextGrid with static rod elements. Non-rod cells default to '.'
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (isRod[r][c]) {
                nextGrid[r][c] = currentGrid[r][c]; // Rod characters remain
            } else {
                nextGrid[r][c] = '.'; // Default to water
            }
        }
    }

    // Determine movements for fish and garbage from currentGrid state
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (isRod[r][c]) continue; // Rod characters don't move

            const char = currentGrid[r][c];
            let nextC = c;
            let type: 'fish' | 'garbage' | 'static' = 'static';

            if (char === '>' || char === '<') {
                type = 'fish';
                nextC = c + (char === '>' ? 1 : -1);
            } else if (char !== '.') {
                // If it's not water and not a rod segment, it's garbage.
                // This correctly identifies 'C's that were not marked as 'isRod' as garbage.
                type = 'garbage';
                nextC = c + (currentD === 'RIGHT' ? 1 : -1);
            }

            if (type !== 'static') {
                // Check if the entity moves out of bounds
                if (nextC < 0 || nextC >= W) {
                    // Entity moves out of bounds and disappears. Don't add to collisionMap.
                } else {
                    // Entity moves to (r, nextC). Store in collisionMap for collision resolution.
                    const key = `${r},${nextC}`;
                    if (!collisionMap.has(key)) {
                        collisionMap.set(key, { fishes: [], garbages: [] });
                    }
                    const cellContents = collisionMap.get(key)!;
                    if (type === 'fish') {
                        cellContents.fishes.push(char);
                    } else { // type === 'garbage'
                        cellContents.garbages.push(char);
                    }
                }
            }
        }
    }

    // Resolve collisions and update nextGrid based on collisionMap
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const key = `${r},${c}`;
            const cellContents = collisionMap.get(key);

            // If no entities moved into this cell, its state is already correctly set by `nextGrid` initialization
            // (either rod character or '.'). So, nothing to do for this cell.
            if (!cellContents) {
                continue;
            }

            const fishes = cellContents.fishes;
            const garbages = cellContents.garbages;

            if (isRod[r][c]) {
                // This cell is part of the fishing rod.
                if (garbages.length > 0) {
                    rodBroken = true; // Rod breaks if any garbage touches it
                }
                if (fishes.length > 0) {
                    // Fish are caught if they touch the rod, even if the rod breaks simultaneously.
                    fishCaught += fishes.length;
                }
                // Rod character remains in nextGrid[r][c] (already copied). Entities hitting the rod disappear.
            } else {
                // This cell is NOT part of the rod.
                if (fishes.length > 0 && garbages.length > 0) {
                    // Fish and garbage collide: both disappear. Cell becomes '.' (already default).
                } else if (fishes.length > 1) {
                    // Multiple fish collide with each other: all disappear. Cell becomes '.' (already default).
                } else if (fishes.length === 1) {
                    // Exactly one fish moves into this cell.
                    nextGrid[r][c] = fishes[0];
                } else if (garbages.length > 0) {
                    // One or more garbage moves into this cell. Arbitrarily pick one to represent.
                    nextGrid[r][c] = garbages[0];
                }
                // If no entities or specific collision types (fish/garbage or multiple fish), it stays '.'
            }
        }
    }

    // Check if the grid state has changed for termination.
    // If the rod is broken, the simulation will end regardless in the next loop iteration due to `while (!rodBroken)`.
    let gridChanged = false;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (currentGrid[r][c] !== nextGrid[r][c]) {
                gridChanged = true;
                break;
            }
        }
        if (gridChanged) break;
    }

    currentGrid = nextGrid; // Update grid for the next turn

    // If the grid state did not change from the previous turn, it means no more movement or disappearances occurred.
    // The simulation has reached a stable state where all active entities have resolved their movements.
    if (!gridChanged) {
        break;
    }
}

// Output the total number of fish caught
console.log(fishCaught);