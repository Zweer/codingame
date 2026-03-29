// The 'readline()' function is provided by the CodinGame environment.
// For local testing, you might need a polyfill or mock.
// declare function readline(): string; 

function solve(): void {
    const N: number = parseInt(readline());
    
    // initialGrid stores the starting state of LEDs (true for lit, false for unlit)
    const initialGrid: boolean[][] = [];
    for (let i = 0; i < N; i++) {
        initialGrid.push(readline().split('').map(char => char === '*'));
    }

    /**
     * Applies the effect of pressing an LED at (r, c) to a given grid state.
     * Toggles the state of (r, c) and its immediate horizontal and vertical neighbors.
     * @param r The row index of the pressed LED.
     * @param c The column index of the pressed LED.
     * @param gridState The 2D boolean array representing the current state of LEDs.
     */
    function applyPressEffect(r: number, c: number, gridState: boolean[][]): void {
        const toggle = (row: number, col: number) => {
            if (row >= 0 && row < N && col >= 0 && col < N) {
                gridState[row][col] = !gridState[row][col];
            }
        };

        toggle(r, c);       // The LED itself
        toggle(r - 1, c);   // Above
        toggle(r + 1, c);   // Below
        toggle(r, c - 1);   // Left
        toggle(r, c + 1);   // Right
    }

    // Iterate through all 2^N possible combinations for presses in the first row.
    // Each 'firstRowMask' is a bitmask where the k-th bit (0 to N-1) indicates
    // whether to press the LED at (0, k).
    for (let firstRowMask = 0; firstRowMask < (1 << N); firstRowMask++) {
        // Create a deep copy of the initial grid for this trial.
        // This 'currentGridState' will be modified by presses.
        const currentGridState: boolean[][] = initialGrid.map(row => [...row]);
        
        // 'pressGrid' stores the decisions for which LEDs to touch ('X' or '.').
        // Initialize with all 'false' (no touches).
        const pressGrid: boolean[][] = Array(N).fill(null).map(() => Array(N).fill(false));

        // Apply the chosen presses for the first row (row 0) based on the current mask.
        for (let c = 0; c < N; c++) {
            if ((firstRowMask >> c) & 1) { // If the c-th bit is set in firstRowMask
                pressGrid[0][c] = true; // Mark this LED to be pressed
                applyPressEffect(0, c, currentGridState); // Apply its effect to currentGridState
            }
        }

        // Propagate the press decisions downwards, from row 1 to N-1.
        // For each cell (r, c), its state is determined by its initial state
        // and presses at (r,c), (r-1,c), (r+1,c), (r,c-1), (r,c+1).
        // Crucially, to make sure the LED at (r-1, c) is lit, the press at (r, c)
        // is the only remaining unknown that can flip its state.
        for (let r = 1; r < N; r++) {
            for (let c = 0; c < N; c++) {
                // If the LED directly above (r-1, c) is currently UNLIT,
                // we *must* press the LED at (r, c) to turn (r-1, c) ON.
                // If (r-1, c) is already lit, we *must not* press (r, c),
                // otherwise it would turn (r-1, c) OFF.
                if (!currentGridState[r - 1][c]) {
                    pressGrid[r][c] = true; // Mark this LED to be pressed
                    applyPressEffect(r, c, currentGridState); // Apply its effect
                }
                // If currentGridState[r-1][c] is true, pressGrid[r][c] remains false (no press)
                // and no effect is applied.
            }
        }

        // After processing all rows, check if all LEDs in the 'currentGridState' are lit.
        // Because of the propagation logic, all cells in rows 0 to N-2 are guaranteed to be lit.
        // We only need to verify the last row and any remaining effects on cells (r,c)
        // where r and c are near the bottom or right boundaries (due to (r+1,c) or (r,c+1) dependencies).
        // A full check is simplest and robust.
        let allLit = true;
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (!currentGridState[r][c]) {
                    allLit = false;
                    break;
                }
            }
            if (!allLit) break; // Optimization: exit inner loops early if not all lit
        }

        // If all LEDs are lit, we found the unique solution. Print it and exit.
        if (allLit) {
            for (let r = 0; r < N; r++) {
                console.log(pressGrid[r].map(p => p ? 'X' : '.').join(''));
            }
            return; // Terminate the program after finding the solution
        }
    }
}

// Call the solve function to run the puzzle logic.
solve();