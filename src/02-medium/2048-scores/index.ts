import * as readline from 'readline';

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const lines: string[] = [];
    for await (const line of rl) {
        lines.push(line);
    }
    rl.close();

    const grid: number[][] = [];
    for (let i = 0; i < 4; i++) {
        grid.push(lines[i].split(' ').map(Number));
    }
    const foursGenerated: number = parseInt(lines[4]);

    // Step 1: Calculate counts of tiles by value in the final grid
    // This map will store { value -> count_of_tiles_with_that_value }
    const tileCounts: Map<number, number> = new Map();
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const value = grid[r][c];
            if (value > 0) {
                tileCounts.set(value, (tileCounts.get(value) || 0) + 1);
            }
        }
    }

    // Step 2: Deduce initial and generated tile counts based on 2048 mechanics.
    // As derived in the reasoning:
    // N_i4 (initial 4s) must be 0.
    // N_g2 (generated 2s) must be 0.
    // This implies the game always starts with two '2' tiles, and all generated tiles during gameplay are '4's.

    // Step 3: Calculate TURNS
    // Total turns played is the sum of all generated tiles (2s and 4s).
    // Since N_g2 is 0, turns played is simply the count of generated 4s.
    const turns: number = foursGenerated;

    // Step 4: Calculate SCORE
    // The score increases by the value of the new tile when two tiles merge.
    // - Tiles with value '2': Based on N_i2=2, N_g2=0, any '2's on the board are original tiles that did not merge.
    //   They contribute 0 to the score.
    // - Tiles with value '4':
    //   - `foursGenerated` of these are tiles that were directly generated (contribute 0 to score).
    //   - The remaining `(countOf4sOnBoard - foursGenerated)` tiles must have been formed by `2+2` merges.
    //     Each such merge adds `4` to the score.
    // - Tiles with value `V > 4` (e.g., 8, 16, 32, ...):
    //   - These tiles cannot be initial or generated tiles. They *must* be products of merges.
    //   - Each such merge adds its value `V` to the score.
    // This aligns with the example's score calculation ("score = 2+2=4").

    let score: number = 0;

    // Contribution from 4s formed by 2+2 merges
    const countOf4sOnBoard = tileCounts.get(4) || 0;
    const foursFromMerges = Math.max(0, countOf4sOnBoard - foursGenerated);
    score += foursFromMerges * 4;

    // Contribution from tiles > 4 (e.g., 8, 16, 32, ...)
    // Iterate through all possible tile values (powers of 2) from 8 upwards.
    // Max value on a 4x4 grid if only 2s are merged is 131072 (2^17).
    // A loop is safe for typical 2048 values.
    for (let value = 8; value <= 131072; value *= 2) {
        const count = tileCounts.get(value) || 0;
        score += value * count;
    }

    console.log(score);
    console.log(turns);
}

main();