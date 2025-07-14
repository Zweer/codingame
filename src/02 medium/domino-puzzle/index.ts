import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let N: number;
const grid: string[][] = [];
const fallen: boolean[][] = [];

type Direction = [number, number]; // [dr, dc]

// Define constant direction vectors
const DIRS = {
    U: [-1, 0] as Direction,
    D: [1, 0] as Direction,
    L: [0, -1] as Direction,
    R: [0, 1] as Direction,
    UL: [-1, -1] as Direction,
    UR: [-1, 1] as Direction,
    DL: [1, -1] as Direction,
    DR: [1, 1] as Direction,
};

// Helper to get the direction opposite to a given direction
function getInverseDir(dr: number, dc: number): Direction {
    return [-dr, -dc];
}

// Helper to create a unique key for a direction vector for Set lookups
function dirKey(dr: number, dc: number): string {
    return `${dr},${dc}`;
}

interface DominoBehavior {
    // A set of valid directions (vector FROM the hitting domino TO the hit domino)
    // from which this domino CAN be hit.
    validHitFrom: Set<string>;
    // Function to calculate which cells this domino hits when it falls,
    // and the 'hit_from' direction for the next domino.
    // Parameters:
    //   r, c: Current domino's coordinates.
    //   hit_from_dr, hit_from_dc: Vector from the *hitter* to the *current* domino.
    //   dominoChar: The type of the current domino.
    // Returns: Array of objects, each containing:
    //   r, c: Coordinates of the target domino.
    //   hit_from_dr, hit_from_dc: Vector from the *current* domino to the *target* domino.
    getHitTargets: (r: number, c: number, hit_from_dr: number, hit_from_dc: number, dominoChar: string) => { r: number, c: number, hit_from_dr: number, hit_from_dc: number }[];
}

const dominoBehaviors: Record<string, DominoBehavior> = {
    '|': {
        validHitFrom: new Set([
            dirKey(DIRS.L[0], DIRS.L[1]), dirKey(DIRS.R[0], DIRS.R[1]),
            dirKey(DIRS.UL[0], DIRS.UL[1]), dirKey(DIRS.UR[0], DIRS.UR[1]),
            dirKey(DIRS.DL[0], DIRS.DL[1]), dirKey(DIRS.DR[0], DIRS.DR[1]),
        ]),
        getHitTargets: (r, c, hit_from_dr, hit_from_dc) => {
            // Determine the direction this domino falls (opposite of where it was hit from)
            const [fall_dr, fall_dc] = getInverseDir(hit_from_dr, hit_from_dc);
            const next_r = r + fall_dr;
            const next_c = c + fall_dc;
            // The hit on the next domino originates FROM the current domino in the direction it fell.
            // So, the 'hit_from' for the target is [fall_dr, fall_dc].
            return [{ r: next_r, c: next_c, hit_from_dr: fall_dr, hit_from_dc: fall_dc }];
        }
    },
    '-': {
        validHitFrom: new Set([
            dirKey(DIRS.U[0], DIRS.U[1]), dirKey(DIRS.D[0], DIRS.D[1]),
            dirKey(DIRS.UL[0], DIRS.UL[1]), dirKey(DIRS.UR[0], DIRS.UR[1]),
            dirKey(DIRS.DL[0], DIRS.DL[1]), dirKey(DIRS.DR[0], DIRS.DR[1]),
        ]),
        getHitTargets: (r, c, hit_from_dr, hit_from_dc) => {
            const [fall_dr, fall_dc] = getInverseDir(hit_from_dr, hit_from_dc);
            const next_r = r + fall_dr;
            const next_c = c + fall_dc;
            return [{ r: next_r, c: next_c, hit_from_dr: fall_dr, hit_from_dc: fall_dc }];
        }
    },
    '\\': { // Domino oriented from Top-Left to Bottom-Right
        validHitFrom: new Set([
            dirKey(DIRS.L[0], DIRS.L[1]), dirKey(DIRS.R[0], DIRS.R[1]),
            dirKey(DIRS.U[0], DIRS.U[1]), dirKey(DIRS.D[0], DIRS.D[1]),
            dirKey(DIRS.UR[0], DIRS.UR[1]), dirKey(DIRS.DL[0], DIRS.DL[1]),
        ]),
        getHitTargets: (r, c, hit_from_dr, hit_from_dc, dominoChar) => {
            const [fall_dr, fall_dc] = getInverseDir(hit_from_dr, hit_from_dc);
            let relativeTargets: Direction[];

            // '\' hits in one of two ways: (L, D, DL) or (R, U, UR).
            // The choice depends on the general direction of fall.
            // If it falls generally 'down' or 'left' (relative to its own position)
            if (fall_dr > 0 || fall_dc < 0) { 
                relativeTargets = [DIRS.L, DIRS.D, DIRS.DL];
            } else { // Otherwise, it falls generally 'up' or 'right'
                relativeTargets = [DIRS.R, DIRS.U, DIRS.UR];
            }

            return relativeTargets.map(([hit_dr_rel, hit_dc_rel]) => ({
                r: r + hit_dr_rel,
                c: c + hit_dc_rel,
                hit_from_dr: hit_dr_rel,
                hit_from_dc: hit_dc_rel,
            }));
        }
    },
    '/': { // Domino oriented from Top-Right to Bottom-Left
        validHitFrom: new Set([
            dirKey(DIRS.L[0], DIRS.L[1]), dirKey(DIRS.R[0], DIRS.R[1]),
            dirKey(DIRS.U[0], DIRS.U[1]), dirKey(DIRS.D[0], DIRS.D[1]),
            dirKey(DIRS.UL[0], DIRS.UL[1]), dirKey(DIRS.DR[0], DIRS.DR[1]),
        ]),
        getHitTargets: (r, c, hit_from_dr, hit_from_dc, dominoChar) => {
            const [fall_dr, fall_dc] = getInverseDir(hit_from_dr, hit_from_dc);
            let relativeTargets: Direction[];

            // '/' hits in one of two ways: (L, U, UL) or (R, D, DR).
            // The choice depends on the general direction of fall.
            // If it falls generally 'down' or 'right' (relative to its own position)
            if (fall_dr > 0 || fall_dc > 0) { 
                relativeTargets = [DIRS.R, DIRS.D, DIRS.DR];
            } else { // Otherwise, it falls generally 'up' or 'left'
                relativeTargets = [DIRS.L, DIRS.U, DIRS.UL];
            }

            return relativeTargets.map(([hit_dr_rel, hit_dc_rel]) => ({
                r: r + hit_dr_rel,
                c: c + hit_dc_rel,
                hit_from_dr: hit_dr_rel,
                hit_from_dc: hit_dc_rel,
            }));
        }
    }
};

let lineNum = 0;
rl.on('line', (line) => {
    if (lineNum === 0) {
        N = parseInt(line);
        // Initialize fallen array
        for (let i = 0; i < N; i++) {
            fallen.push(new Array(N).fill(false));
        }
    } else {
        grid.push(line.split(' '));
    }

    lineNum++;
    if (lineNum > N) {
        rl.close();
    }
});

rl.on('close', () => {
    let standingCount = 0;
    // Calculate initial standing dominoes (exclude empty spots '.')
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            if (grid[r][c] !== '.') {
                standingCount++;
            }
        }
    }

    const queue: { r: number, c: number, hit_from_dr: number, hit_from_dc: number }[] = [];

    const startChar = grid[0][0];

    // Initial push simulation at (0,0)
    if (startChar !== '.') {
        fallen[0][0] = true;
        standingCount--;

        let initialHitFromDr: number;
        let initialHitFromDc: number;

        // Determine the 'hit_from' vector for the first domino at (0,0)
        // based on the problem's description of its initial fall direction.
        // The hit_from vector is FROM the imaginary source TO (0,0).
        if (startChar === '|') {
            // Falls RIGHT, so hit from LEFT. Source is (0,-1). Vector (0,0) - (0,-1) = [0,1] (RIGHT).
            initialHitFromDr = 0; initialHitFromDc = 1;
        } else if (startChar === '-') {
            // Falls DOWN, so hit from UP. Source is (-1,0). Vector (0,0) - (-1,0) = [1,0] (DOWN).
            initialHitFromDr = 1; initialHitFromDc = 0;
        } else if (startChar === '/') {
            // Falls DOWN-RIGHT, so hit from UP-LEFT. Source is (-1,-1). Vector (0,0) - (-1,-1) = [1,1] (DOWN-RIGHT).
            initialHitFromDr = 1; initialHitFromDc = 1;
        } else {
            // Problem states first piece will never be '\'.
            // This path should ideally not be taken.
            initialHitFromDr = 0; initialHitFromDc = 0; 
        }
        
        queue.push({ r: 0, c: 0, hit_from_dr: initialHitFromDr, hit_from_dc: initialHitFromDc });
    }

    // BFS loop to simulate the chain reaction
    let head = 0; // Pointer for efficient queue dequeuing (avoids array.shift() performance overhead)
    while (head < queue.length) {
        const { r, c, hit_from_dr, hit_from_dc } = queue[head++];
        
        const dominoType = grid[r][c];
        // If it's an empty spot or an unrecognized domino type, skip.
        // (This check should ideally be redundant if the initial grid is valid and
        // dominoes are only added to queue if they haven't fallen and are not '.').
        if (dominoType === '.' || !dominoBehaviors[dominoType]) {
            continue; 
        }

        const behavior = dominoBehaviors[dominoType];

        // Check if this domino is actually capable of falling from this hit direction
        if (!behavior.validHitFrom.has(dirKey(hit_from_dr, hit_from_dc))) {
            continue; // The hit was not effective for this domino type. It does not fall.
        }

        // Get the list of cells this domino hits when it falls
        const targets = behavior.getHitTargets(r, c, hit_from_dr, hit_from_dc, dominoType);

        for (const target of targets) {
            const { r: next_r, c: next_c, hit_from_dr: next_hit_from_dr, hit_from_dc: next_hit_from_dc } = target;

            // Check if the target cell is within grid boundaries
            if (next_r < 0 || next_r >= N || next_c < 0 || next_c >= N) {
                continue;
            }

            // Check if there is a domino at the target and it has not fallen yet
            if (grid[next_r][next_c] !== '.' && !fallen[next_r][next_c]) {
                fallen[next_r][next_c] = true; // Mark as fallen
                standingCount--; // Decrement standing count
                // Add the newly fallen domino to the queue for further processing
                queue.push({ r: next_r, c: next_c, hit_from_dr: next_hit_from_dr, hit_from_dc: next_hit_from_dc });
            }
        }
    }

    // Output the final count of standing dominoes
    console.log(standingCount);
});