// Ensure readline and console.log are available in the CodinGame environment.
// For local testing with Node.js, you might need to mock them, e.g.:
// declare function readline(): string;
// declare function print(message: any): void;
// console.log = print;

function solve() {
    const N: number = parseInt(readline());
    const initialGrid: string[][] = [];
    const intensityGrid: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    const bombList: { type: 'A' | 'H' | 'B', r: number, c: number }[] = [];

    // 1. Read input and initialize grids
    for (let i = 0; i < N; i++) {
        const row = readline();
        initialGrid.push(row.split(''));
        for (let j = 0; j < N; j++) {
            const char = row[j];
            if (char === 'A' || char === 'H' || char === 'B') {
                bombList.push({ type: char, r: i, c: j });
                // Bomb locations themselves don't start with a numerical intensity;
                // they keep their character for final output. Their intensity value for
                // triggering other B-bombs or receiving effects starts at 0.
            } else {
                // For non-bomb cells, parse their initial numeric intensity.
                intensityGrid[i][j] = parseInt(char);
            }
        }
    }

    // Separate bombs for initial processing (A and H) and iterative processing (B)
    const aAndHBombs = bombList.filter(b => b.type === 'A' || b.type === 'H');
    let bBombs = bombList.filter(b => b.type === 'B');

    // Determine the maximum effective radius for the iteration loop.
    // A/H bombs have max Chebyshev distance 3.
    // B bomb has max Manhattan distance 3 horizontally, and 4 vertically.
    // So the largest delta needed is 4 in any direction.
    const maxEffectiveRadius = 4;

    /**
     * Applies the shockwave effect of a bomb to the intensityGrid.
     * The bomb's own location is handled such that its effect on itself is 0,
     * but it can receive effects from other bombs.
     */
    function applyBombEffect(bombR: number, bombC: number, type: 'A' | 'H' | 'B') {
        for (let dr = -maxEffectiveRadius; dr <= maxEffectiveRadius; dr++) {
            for (let dc = -maxEffectiveRadius; dc <= maxEffectiveRadius; dc++) {
                const currentR = bombR + dr;
                const currentC = bombC + dc;

                // Skip out of bounds cells
                if (currentR < 0 || currentR >= N || currentC < 0 || currentC >= N) {
                    continue;
                }

                let newIntensity = 0; // Default intensity from current bomb for this cell

                // Calculate intensity based on bomb type and relative position
                if (type === 'A') {
                    const d = Math.max(Math.abs(dr), Math.abs(dc)); // Chebyshev distance
                    // A-bomb pattern: 3 at d=1, 2 at d=2, 1 at d=3
                    if (d >= 1 && d <= 3) {
                        newIntensity = 4 - d;
                    }
                } else if (type === 'H') {
                    const d = Math.max(Math.abs(dr), Math.abs(dc)); // Chebyshev distance
                    // H-bomb pattern: constant 5 within 7x7 square (d up to 3)
                    if (d >= 1 && d <= 3) {
                        newIntensity = 5;
                    }
                } else if (type === 'B') {
                    // B-bomb only affects cardinal directions (dr=0 OR dc=0), not diagonals.
                    // The bomb's center (dr=0, dc=0) implicitly has newIntensity 0 as it doesn't match conditions below.
                    if (dr === 0 && dc !== 0) { // Horizontal arm
                        const d = Math.abs(dc);
                        // Pattern for horizontal arm: 3 at d=1, 2 at d=2, 1 at d=3
                        if (d === 1) newIntensity = 3;
                        else if (d === 2) newIntensity = 2;
                        else if (d === 3) newIntensity = 1;
                    } else if (dc === 0 && dr !== 0) { // Vertical arm
                        const d = Math.abs(dr);
                        // Pattern for vertical arm: 3 at d=1, 3 at d=2, 2 at d=3, 1 at d=4
                        if (d === 1) newIntensity = 3;
                        else if (d === 2) newIntensity = 3;
                        else if (d === 3) newIntensity = 2;
                        else if (d === 4) newIntensity = 1;
                    }
                }

                // Update the intensity grid with the maximum effect felt so far at this cell.
                intensityGrid[currentR][currentC] = Math.max(intensityGrid[currentR][currentC], newIntensity);
            }
        }
    }

    // 2. Phase 1: Process A and H bombs (explode unconditionally)
    for (const bomb of aAndHBombs) {
        applyBombEffect(bomb.r, bomb.c, bomb.type);
    }

    // 3. Phase 2: Process B bombs iteratively (for chain reactions)
    const explodedBBombs = new Set<string>(); // Keep track of B-bombs that have already exploded to avoid re-processing
    let bombsToProcessThisIteration = [...bBombs]; // List of B-bombs that haven't exploded yet

    let anyBombExplodedInIteration = true;
    while (anyBombExplodedInIteration) {
        anyBombExplodedInIteration = false; // Reset for current iteration
        const nextBombsToProcess: typeof bBombs = []; // To store B-bombs that don't explode this iteration

        for (const bomb of bombsToProcessThisIteration) {
            const key = `${bomb.r},${bomb.c}`; // Unique key for bomb location
            if (explodedBBombs.has(key)) {
                continue; // Skip if this B-bomb already exploded in a previous iteration
            }

            // A B-bomb explodes if its current location's intensity is > 0.
            // This intensity could be from A/H bombs, initial grid values, or previous B-bomb explosions.
            if (intensityGrid[bomb.r][bomb.c] > 0) {
                applyBombEffect(bomb.r, bomb.c, bomb.type);
                explodedBBombs.add(key); // Mark as exploded
                anyBombExplodedInIteration = true; // Indicate that an explosion occurred in this iteration
            } else {
                nextBombsToProcess.push(bomb); // This B-bomb didn't explode, add to list for next iteration
            }
        }
        bombsToProcessThisIteration = nextBombsToProcess; // Update list for next iteration

        // If no bombs exploded in this iteration, the chain reaction has stopped
        if (!anyBombExplodedInIteration) {
            break;
        }
    }

    // 4. Construct and output the final grid
    for (let i = 0; i < N; i++) {
        let rowOutput = '';
        for (let j = 0; j < N; j++) {
            const originalChar = initialGrid[i][j];
            // If the cell originally contained a bomb character ('A', 'H', or 'B'), display the character.
            if (originalChar === 'A' || originalChar === 'H' || originalChar === 'B') {
                rowOutput += originalChar;
            } else {
                // Otherwise (it was a numeric cell), display the maximum calculated intensity.
                rowOutput += intensityGrid[i][j].toString();
            }
        }
        console.log(rowOutput);
    }
}

// Call the main solve function to execute the logic.
solve();