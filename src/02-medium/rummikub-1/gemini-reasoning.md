The problem asks us to find the shortest sequence of Rummikub actions to place a given `goalTile` onto a table of existing runs and sets. We need to output these actions and the final state of the table. The solution must adhere to specific rules regarding action types, table validity, splitting runs, and tie-breaking for action selection.

**1. Understanding Rummikub Rules & Actions:**

*   **Tiles:** Numeric value (1-13) and color (B, G, R, Y).
*   **Runs:** 3-13 tiles, same color, consecutive numbers (e.g., `3G 4G 5G`).
*   **Sets:** 3-4 tiles, same number, unique colors (e.g., `4B 4G 4R`).
*   **Actions:**
    *   `PUT tile rowid`: Add a tile to an existing row.
    *   `TAKE tile rowid`: Remove a tile from a row.
    *   `COMBINE rowid1 rowid2`: Merge two runs (`rowid1` gets the combined run, `rowid2` is removed). `rowid1 < rowid2`.
*   **Action Constraints:**
    *   `TAKE` must immediately be followed by `PUT` of the *same* tile.
    *   After *each* `PUT`, the entire table must consist of valid runs/sets.
    *   The *final* action is always `PUT goalTile`.
    *   **Splitting Runs:** If a `TAKE` or `PUT` action causes a run to break into two valid runs, the part with higher numerical values gets a new `rowid` (highest ever existed + 1). The lower part keeps the original `rowid`. Sets cannot be split.
    *   Sets cannot be created, only extended/shortened. Runs cannot be created (except by splitting).
*   **Action Selection & Order (Tie-breaking):**
    *   Least number of actions (overall sequence length).
    *   `COMBINE` actions are prioritized as early as possible within a sequence of the same length.
    *   When multiple `COMBINE`s are possible, prioritize lower `rowid1`, then lower `rowid2`.

**2. Approach: Breadth-First Search (BFS)**

Given the constraint `naction <= 7`, a BFS is suitable. BFS naturally finds the shortest path (least number of actions) first. To handle the tie-breaking rules, we'll sort the possible next states generated at each step before adding them to the queue.

**3. State Representation:**

A `GameState` object will represent the state of the Rummikub table at any point in the search:


**4. Core Logic (`applyAction` functions):**

We need functions to simulate `PUT`, `TAKE`, and `COMBINE` actions, returning a new `GameState` if the action is valid, or `null` otherwise. These functions are crucial for:
*   **Validity Checks:** Ensuring the resulting table state (or modified rows) adheres to Rummikub rules (min/max tiles, consecutive numbers, unique colors, etc.).
*   **Splitting Logic:** Correctly identifying and handling run splits when a tile is inserted into or removed from a run, assigning new `rowid`s.
*   **Cloning:** Deep cloning the `table` to avoid modifying states already in the queue.

**Helper Functions Breakdown:**

*   `parseTile(tileStr: string)`: Converts a tile string (e.g., "3R") to a `Tile` object.
*   `tileToString(tile: Tile)`: Converts a `Tile` object back to its string representation.
*   `tilesEqual(t1: Tile, t2: Tile)`: Compares two `Tile` objects.
*   `sortTilesForRun(tiles: Tile[])`: Sorts tiles by value for run representation.
*   `sortTilesForSet(tiles: Tile[])`: Sorts tiles by color (B, G, R, Y) for set representation.
*   `isValidRun(tiles: Tile[])`, `isValidSet(tiles: Tile[])`: Validate a given array of tiles as a run or set.
*   `getRowType(tiles: Tile[])`: Determines if tiles form a valid run or set, returning its type.
*   `cloneTable(table: Map<number, Row>)`: Creates a deep copy of the table.
*   `stateKey(state: GameState)`: Generates a unique string key for a `GameState` to use in the `visited` set (for BFS). This canonical representation prevents revisiting identical states.
*   `tryPutGoalTile(state: GameState, goalTile: Tile)`: Special function to try the final `PUT goalTile` action. It internally calls `applyPutAction`.
*   `applyPutAction(currentState, tileToPut, targetRowId, isFinalPut)`: Handles adding `tileToPut` to `targetRowId`. This function incorporates logic for extending existing runs/sets or splitting runs. It performs the necessary validity checks after the `PUT`.
*   `applyTakeAction(currentState, tileToTake, targetRowId)`: Handles removing `tileToTake` from `targetRowId`. It manages run splitting and validity checks after the `TAKE`.
*   `applyCombineAction(currentState, row1Id, row2Id)`: Handles merging two runs. It checks for validity, removes `row2Id`, and updates `row1Id`.

**5. BFS Algorithm Flow:**

1.  **Initialization:**
    *   Parse `goalTile` and initial `nrow` rows into `initialTable`.
    *   Determine `maxInitialRowId`.
    *   Create `initialState`.
    *   Initialize `queue` with `initialState`.
    *   Initialize `visited` set to keep track of explored states.
    *   Initialize `solution = null`.

2.  **Loop (while `queue` is not empty and `solution` is not found):**
    *   Dequeue `currentState`.
    *   If `currentState` is already `visited`, continue.
    *   Add `currentState` to `visited`.
    *   **Pruning:** If `currentState.actions.length` exceeds the maximum allowed actions (considering the final `PUT goalTile`): `continue`.
        *   If `takenTile` is `null`: `currentActionCount + 1 <= 7` (max total 7 actions), so `currentActionCount <= 6`.
        *   If `takenTile` is not `null`: `currentActionCount + 2 <= 7` (max total 7 actions), so `currentActionCount <= 5`.
    *   **Goal Check:**
        *   If `currentState.takenTile` is `null` (no tile in hand), try `tryPutGoalTile(currentState, goalTile)`.
        *   If successful, `solution` is found. `break` the loop (BFS guarantees it's the shortest).
    *   **Generate Next States:**
        *   Create an empty `possibleNextStates` array.
        *   **If `currentState.takenTile` is NOT `null`:** The only valid next action is to `PUT` the `takenTile` back into any valid row. Iterate through `table.keys()` and call `applyPutAction`. Add valid results to `possibleNextStates`.
        *   **If `currentState.takenTile` IS `null`:**
            *   Generate `COMBINE` actions: Iterate all `rowid1`, `rowid2` pairs (`rowid1 < rowid2`), check if they are runs, and call `applyCombineAction`. Add valid results to `possibleNextStates`.
            *   Generate `TAKE` actions: Iterate all `rowid`s and all `tiles` within each row. Call `applyTakeAction`. Add valid results to `possibleNextStates`.
    *   **Sort `possibleNextStates`:** Apply the tie-breaking rules:
        *   `COMBINE` actions come before `TAKE`/`PUT` actions.
        *   For `COMBINE` actions, sort by `rowid1` then `rowid2`.
    *   **Enqueue Sorted States:** Add all states from `possibleNextStates` to the `queue`, ensuring no duplicates (using `visited` set).

3.  **Output:** Once `solution` is found, print its actions and the formatted final table state.

This detailed plan, with the provided helper functions and BFS structure, covers the requirements of the puzzle.

```typescript
// Standard input reading setup for CodinGame
declare function readline(): string;
declare function print(message: any): void;

/**
 * Represents a single Rummikub tile.
 */
interface Tile {
    value: number;
    color: string; // 'B', 'G', 'R', 'Y'
}

/**
 * Represents a row (run or set) on the Rummikub table.
 */
interface Row {
    id: number;
    type: 'run' | 'set';
    tiles: Tile[];
}

/**
 * Represents the entire game state for the BFS.
 */
interface GameState {
    table: Map<number, Row>; // Current rows on the table, keyed by rowId
    actions: string[];       // Sequence of actions taken to reach this state
    maxRowId: number;        // Highest rowId ever used/generated, for new split rows
    takenTile: Tile | null;  // The tile currently "in hand" after a TAKE action
    tookFromRowId: number | null; // The rowId from which takenTile was taken (not strictly needed for R1 but good practice)
}

// Order for sorting colors in sets (B, G, R, Y)
const COLOR_ORDER = { 'B': 0, 'G': 1, 'R': 2, 'Y': 3 };

/**
 * Parses a tile string (e.g., "3R") into a Tile object.
 */
function parseTile(tileStr: string): Tile {
    const value = parseInt(tileStr.match(/\d+/)![0]);
    const color = tileStr.match(/[BGRY]/)![0];
    return { value, color };
}

/**
 * Converts a Tile object back to its string representation.
 */
function tileToString(tile: Tile): string {
    return `${tile.value}${tile.color}`;
}

/**
 * Compares two Tile objects for equality.
 */
function tilesEqual(t1: Tile, t2: Tile): boolean {
    return t1.value === t2.value && t1.color === t2.color;
}

/**
 * Sorts tiles by value for run representation (low to high).
 */
function sortTilesForRun(tiles: Tile[]): Tile[] {
    return [...tiles].sort((a, b) => a.value - b.value);
}

/**
 * Sorts tiles by color order for set representation (B, G, R, Y).
 */
function sortTilesForSet(tiles: Tile[]): Tile[] {
    return [...tiles].sort((a, b) => COLOR_ORDER[a.color as keyof typeof COLOR_ORDER] - COLOR_ORDER[b.color as keyof typeof COLOR_ORDER]);
}

/**
 * Checks if a given array of tiles forms a valid Rummikub run.
 */
function isValidRun(tiles: Tile[]): boolean {
    if (tiles.length < 3 || tiles.length > 13) return false;
    const sorted = sortTilesForRun(tiles);
    const firstColor = sorted[0].color;
    for (let i = 0; i < sorted.length; i++) {
        // All tiles must have the same color
        if (sorted[i].color !== firstColor) return false;
        // Values must be consecutive
        if (i > 0 && sorted[i].value !== sorted[i - 1].value + 1) return false;
    }
    return true;
}

/**
 * Checks if a given array of tiles forms a valid Rummikub set.
 */
function isValidSet(tiles: Tile[]): boolean {
    if (tiles.length < 3 || tiles.length > 4) return false;
    const firstValue = tiles[0].value;
    const colors = new Set<string>();
    for (const tile of tiles) {
        // All tiles must have the same numeric value
        if (tile.value !== firstValue) return false;
        // All tiles must have unique colors
        if (colors.has(tile.color)) return false;
        colors.add(tile.color);
    }
    return true;
}

/**
 * Determines the type of a row (run or set) or null if invalid.
 */
function getRowType(tiles: Tile[]): 'run' | 'set' | null {
    if (tiles.length < 3) return null; // A valid run or set must have at least 3 tiles

    // Check if it's a run
    if (isValidRun(tiles)) return 'run';

    // Check if it's a set
    if (isValidSet(tiles)) return 'set';

    return null; // Neither a valid run nor a valid set
}

/**
 * Deep clones the game table (Map of Row objects).
 */
function cloneTable(table: Map<number, Row>): Map<number, Row> {
    const newTable = new Map<number, Row>();
    for (const [id, row] of table.entries()) {
        newTable.set(id, {
            id: row.id,
            type: row.type,
            tiles: [...row.tiles] // Tiles array is shallow copied, Tile objects are immutable and fine
        });
    }
    return newTable;
}

/**
 * Converts a GameState to a string key for the visited set, ensuring canonical representation.
 */
function stateKey(state: GameState): string {
    const sortedRows = Array.from(state.table.values()).sort((a, b) => a.id - b.id)
        .map(row => {
            const sortedTiles = row.type === 'run' ? sortTilesForRun(row.tiles) : sortTilesForSet(row.tiles);
            return `${row.id}-${row.type}-${sortedTiles.map(tileToString).join(',')}`;
        });
    return `${sortedRows.join('|')}|${state.takenTile ? tileToString(state.takenTile) : 'null'}|${state.tookFromRowId || 'null'}`;
}

/**
 * Attempts to apply a PUT action to the table.
 * Handles extending runs/sets and splitting runs.
 * Returns a new GameState if successful, null otherwise.
 * @param currentState The current game state.
 * @param tileToPut The tile to be put.
 * @param targetRowId The ID of the row to put the tile into.
 * @param isFinalPut True if this is the final PUT action for the goalTile.
 */
function applyPutAction(currentState: GameState, tileToPut: Tile, targetRowId: number, isFinalPut: boolean = false): GameState | null {
    const tableClone = cloneTable(currentState.table);
    const targetRow = tableClone.get(targetRowId);

    if (!targetRow) return null; // Row must exist

    const newTilesCandidate = [...targetRow.tiles, tileToPut];
    let newMaxRowId = currentState.maxRowId;
    let newTable = tableClone; // Reference to the table that will be returned

    let success = false;

    if (targetRow.type === 'run') {
        const sortedCandidate = sortTilesForRun(newTilesCandidate);
        // Try to extend the existing run without splitting
        if (isValidRun(sortedCandidate)) {
            newTable.set(targetRowId, { ...targetRow, tiles: sortedCandidate });
            success = true;
        } else {
            // Attempt to split the run
            const originalTilesSorted = sortTilesForRun(targetRow.tiles);

            // Find where the tileToPut would logically fit in the sorted original run.
            // This forms the potential split point.
            let splitPointIdx = 0;
            while (splitPointIdx < originalTilesSorted.length && tileToPut.value > originalTilesSorted[splitPointIdx].value) {
                splitPointIdx++;
            }

            const leftPartCandidate = [...originalTilesSorted.slice(0, splitPointIdx), tileToPut];
            const rightPartCandidate = originalTilesSorted.slice(splitPointIdx);

            // Both parts must be valid runs to qualify as a split
            if (isValidRun(leftPartCandidate) && isValidRun(rightPartCandidate)) {
                newMaxRowId++;
                newTable.set(targetRowId, { id: targetRowId, type: 'run', tiles: sortTilesForRun(leftPartCandidate) });
                newTable.set(newMaxRowId, { id: newMaxRowId, type: 'run', tiles: sortTilesForRun(rightPartCandidate) });
                success = true;
            }
        }
    } else if (targetRow.type === 'set') {
        const sortedCandidate = sortTilesForSet(newTilesCandidate);
        if (isValidSet(sortedCandidate)) {
            newTable.set(targetRowId, { ...targetRow, tiles: sortedCandidate });
            success = true;
        }
    }

    if (!success) {
        return null; // Could not put tile in a valid way (neither extend nor split)
    }

    // Final table validation: Ensure all rows in newTable are valid after the operation
    // This is crucial because a rule states: "After each PUT action, the table should only contain valid runs and/or sets."
    for (const row of newTable.values()) {
        const type = getRowType(row.tiles);
        if (type === null || type !== row.type) { // Must remain same type and valid
            return null;
        }
    }

    const newActions = [...currentState.actions, `PUT ${tileToString(tileToPut)} ${targetRowId}`];

    return {
        table: newTable,
        actions: newActions,
        maxRowId: newMaxRowId,
        takenTile: isFinalPut ? null : null, // If it's the final PUT, or putting back a taken tile, then no tile is "in hand"
        tookFromRowId: isFinalPut ? null : null,
    };
}

/**
 * Attempts to apply a TAKE action to the table.
 * Handles shortening runs/sets and splitting runs.
 * Returns a new GameState if successful, null otherwise.
 * @param currentState The current game state.
 * @param tileToTake The tile to be taken.
 * @param targetRowId The ID of the row to take the tile from.
 */
function applyTakeAction(currentState: GameState, tileToTake: Tile, targetRowId: number): GameState | null {
    const tableClone = cloneTable(currentState.table);
    const targetRow = tableClone.get(targetRowId);

    if (!targetRow) return null;

    const tileIndex = targetRow.tiles.findIndex(t => tilesEqual(t, tileToTake));
    if (tileIndex === -1) return null; // Tile not found in row

    // Create a new array of tiles excluding the one being taken
    const newTilesCandidate = targetRow.tiles.filter((_, idx) => idx !== tileIndex);
    let newMaxRowId = currentState.maxRowId;
    let newTable = tableClone;

    let success = false;

    if (targetRow.type === 'run') {
        const sortedCandidate = sortTilesForRun(newTilesCandidate);
        // Try to shorten the run without splitting
        if (isValidRun(sortedCandidate)) {
            newTable.set(targetRowId, { ...targetRow, tiles: sortedCandidate });
            success = true;
        } else {
            // Attempt to split the run
            const sortedOriginalTiles = sortTilesForRun(targetRow.tiles);
            const tileRemovedValue = tileToTake.value;

            // Divide original tiles into two parts based on the removed tile's value
            const leftPartCandidate = sortedOriginalTiles.filter(t => t.value < tileRemovedValue);
            const rightPartCandidate = sortedOriginalTiles.filter(t => t.value > tileRemovedValue);

            // Both resulting parts must be valid runs
            if (isValidRun(leftPartCandidate) && isValidRun(rightPartCandidate)) {
                newMaxRowId++;
                newTable.set(targetRowId, { id: targetRowId, type: 'run', tiles: sortTilesForRun(leftPartCandidate) });
                newTable.set(newMaxRowId, { id: newMaxRowId, type: 'run', tiles: sortTilesForRun(rightPartCandidate) });
                success = true;
            }
        }
    } else if (targetRow.type === 'set') {
        const sortedCandidate = sortTilesForSet(newTilesCandidate);
        // Sets can only be shortened, not split
        if (isValidSet(sortedCandidate)) {
            newTable.set(targetRowId, { ...targetRow, tiles: sortedCandidate });
            success = true;
        }
    }

    if (!success) {
        return null; // Cannot take tile in a valid way (invalidates row or cannot split into two valid ones)
    }

    // After a TAKE action, the *table* needs to remain valid (or split into valid parts).
    // This check ensures that the modified rows are valid.
    for (const row of newTable.values()) {
        const type = getRowType(row.tiles);
        if (type === null || type !== row.type) {
            return null;
        }
    }

    const newActions = [...currentState.actions, `TAKE ${tileToString(tileToTake)} ${targetRowId}`];

    return {
        table: newTable,
        actions: newActions,
        maxRowId: newMaxRowId,
        takenTile: tileToTake,
        tookFromRowId: targetRowId,
    };
}

/**
 * Attempts to apply a COMBINE action to the table.
 * Returns a new GameState if successful, null otherwise.
 * @param currentState The current game state.
 * @param row1Id The ID of the first run (lower rowId).
 * @param row2Id The ID of the second run (higher rowId).
 */
function applyCombineAction(currentState: GameState, row1Id: number, row2Id: number): GameState | null {
    // Rule: rowid1 < rowid2
    if (row1Id >= row2Id) return null;

    const tableClone = cloneTable(currentState.table);
    const row1 = tableClone.get(row1Id);
    const row2 = tableClone.get(row2Id);

    // Both rows must exist and be runs
    if (!row1 || !row2 || row1.type !== 'run' || row2.type !== 'run') {
        return null;
    }

    const combinedTiles = sortTilesForRun([...row1.tiles, ...row2.tiles]);

    // The combined tiles must form a single, uninterrupted, valid run.
    if (!isValidRun(combinedTiles)) {
        return null;
    }

    tableClone.set(row1Id, { ...row1, tiles: combinedTiles });
    tableClone.delete(row2Id); // Row2 becomes unused

    // After COMBINE, all remaining rows must be valid.
    for (const row of tableClone.values()) {
        const type = getRowType(row.tiles);
        if (type === null || type !== row.type) {
            return null;
        }
    }

    const newActions = [...currentState.actions, `COMBINE ${row1Id} ${row2Id}`];

    return {
        table: tableClone,
        actions: newActions,
        maxRowId: currentState.maxRowId, // Combine does not create a new max ID
        takenTile: null,
        tookFromRowId: null,
    };
}

/**
 * The main solver function using BFS.
 */
function solve() {
    // --- Input Parsing ---
    const goalTileStr: string = readline();
    const goalTile: Tile = parseTile(goalTileStr);

    const nrow: number = parseInt(readline());
    const initialTable = new Map<number, Row>();
    let maxInitialRowId = 0;

    for (let i = 0; i < nrow; i++) {
        const rowInput: string[] = readline().split(' ');
        const rowId: number = parseInt(rowInput[0]);
        const tilesStrs: string[] = rowInput.slice(1);
        const tiles: Tile[] = tilesStrs.map(parseTile);

        // Determine row type and sort tiles for canonical representation
        const type = getRowType(tiles);
        if (type === null) {
            // This scenario implies an invalid initial table, which shouldn't happen per problem statement.
            throw new Error(`Initial row ${rowId} is invalid: ${tilesStrs.join(' ')}`);
        }
        const sortedTiles = type === 'run' ? sortTilesForRun(tiles) : sortTilesForSet(tiles);

        initialTable.set(rowId, { id: rowId, type, tiles: sortedTiles });
        if (rowId > maxInitialRowId) {
            maxInitialRowId = rowId;
        }
    }

    // --- BFS Initialization ---
    const initialState: GameState = {
        table: initialTable,
        actions: [],
        maxRowId: maxInitialRowId,
        takenTile: null,
        tookFromRowId: null,
    };

    const queue: GameState[] = [initialState];
    const visited = new Set<string>(); // Stores stringified states to avoid redundant computation and cycles

    let solution: { actions: string[]; finalTable: Map<number, Row> } | null = null;

    // --- BFS Loop ---
    while (queue.length > 0) {
        const currentState = queue.shift()!;
        const currentKey = stateKey(currentState);

        if (visited.has(currentKey)) {
            continue;
        }
        visited.add(currentKey);

        // Pruning: Max actions <= 7
        const currentActionCount = currentState.actions.length;
        if (currentState.takenTile) {
            // If a tile is taken, we need 2 more actions (PUT takenTile, PUT goalTile).
            // So, currentActionCount + 2 <= 7 => currentActionCount <= 5.
            if (currentActionCount > 5) continue; 
        } else {
            // If no tile is taken, we need 1 more action (PUT goalTile).
            // So, currentActionCount + 1 <= 7 => currentActionCount <= 6.
            if (currentActionCount > 6) continue;
        }
        
        // Phase 1: Try to place goalTile if possible (shortest path)
        if (!currentState.takenTile) { // Can only directly PUT goalTile if no tile is in hand
            const finalState = applyPutAction(currentState, goalTile, -1, true); // Use -1 as dummy rowId, logic below will iterate valid ones
            if (finalState) {
                // We need to iterate all possible target rows for goalTile to adhere to problem logic
                // and potentially find the "first" valid one if tie-breaking rules implicitly apply
                // to final PUT action (though not explicitly stated).
                // Re-running tryPutGoalTile() here to ensure proper row iteration based on ID order.
                const directSolutionState = tryPutGoalTile(currentState, goalTile);
                if (directSolutionState) {
                    solution = { actions: directSolutionState.actions, finalTable: directSolutionState.table };
                    // Since BFS finds shortest paths first, this is THE solution.
                    break; 
                }
            }
        }

        // Phase 2: Explore next possible intermediate actions
        const possibleNextStates: GameState[] = [];

        if (currentState.takenTile) {
            // Rule: TAKE must immediately be followed by PUT of the same tile.
            const sortedRowIds = Array.from(currentState.table.keys()).sort((a, b) => a - b);
            for (const rowId of sortedRowIds) {
                const nextState = applyPutAction(currentState, currentState.takenTile, rowId);
                if (nextState) {
                    possibleNextStates.push(nextState);
                }
            }
        } else {
            // No tile taken, explore COMBINE or TAKE actions
            // Generate COMBINE states first, respecting row ID order (for tie-breaking)
            const rowIds = Array.from(currentState.table.keys()).sort((a, b) => a - b);
            for (let i = 0; i < rowIds.length; i++) {
                for (let j = i + 1; j < rowIds.length; j++) {
                    const r1Id = rowIds[i];
                    const r2Id = rowIds[j];
                    const r1 = currentState.table.get(r1Id);
                    const r2 = currentState.table.get(r2Id);
                    if (r1 && r2 && r1.type === 'run' && r2.type === 'run') {
                        const nextState = applyCombineAction(currentState, r1Id, r2Id);
                        if (nextState) {
                            possibleNextStates.push(nextState);
                        }
                    }
                }
            }

            // Generate TAKE states
            for (const rowId of rowIds) { // Iterate rowIds in ascending order for consistency
                const row = currentState.table.get(rowId)!;
                // Sort tiles within row to ensure consistent exploration order for TAKE actions
                const tilesToConsider = row.type === 'run' ? sortTilesForRun(row.tiles) : sortTilesForSet(row.tiles);
                for (const tileToTake of tilesToConsider) {
                    const nextState = applyTakeAction(currentState, tileToTake, rowId);
                    if (nextState) {
                        possibleNextStates.push(nextState);
                    }
                }
            }
        }

        // Sort possible next states according to tie-breaking rules:
        // 1. COMBINE actions before TAKE/PUT actions.
        // 2. For COMBINE: lower-numbered rowid1 before higher, then rowid2.
        possibleNextStates.sort((a, b) => {
            const lastActionA = a.actions[a.actions.length - 1];
            const lastActionB = b.actions[b.actions.length - 1];

            const typeA = lastActionA.split(' ')[0];
            const typeB = lastActionB.split(' ')[0];

            if (typeA === 'COMBINE' && typeB !== 'COMBINE') return -1;
            if (typeB === 'COMBINE' && typeA !== 'COMBINE') return 1;

            if (typeA === 'COMBINE' && typeB === 'COMBINE') {
                const partsA = lastActionA.split(' ');
                const r1a = parseInt(partsA[1]);
                const r2a = parseInt(partsA[2]);
                const partsB = lastActionB.split(' ');
                const r1b = parseInt(partsB[1]);
                const r2b = parseInt(partsB[2]);

                if (r1a !== r1b) return r1a - r1b;
                return r2a - r2b;
            }
            // For TAKE/PUT actions, no specific tie-breaking rule is given, so maintain order.
            return 0;
        });

        // Add sorted states to queue, avoiding duplicates already visited
        for (const nextState of possibleNextStates) {
            if (!visited.has(stateKey(nextState))) {
                queue.push(nextState);
            }
        }
    }

    // --- Output Results ---
    if (solution) {
        // Output actions
        solution.actions.forEach(action => print(action));

        // Output final table
        const sortedFinalRows = Array.from(solution.finalTable.values()).sort((a, b) => a.id - b.id);
        sortedFinalRows.forEach(row => {
            const sortedTiles = row.type === 'run' ? sortTilesForRun(row.tiles) : sortTilesForSet(row.tiles);
            print(`${row.id} ${sortedTiles.map(tileToString).join(' ')}`);
        });
    } else {
        // This case should not be reached as per problem constraints (solution always exists).
        print("No solution found.");
    }
}

// Special function to handle the final PUT of goalTile.
// It iterates through possible target rows and returns the first valid one
// (since no specific tie-breaking rule is given for the final PUT).
function tryPutGoalTile(state: GameState, goalTile: Tile): GameState | null {
    const sortedRowIds = Array.from(state.table.keys()).sort((a, b) => a - b);
    for (const rowId of sortedRowIds) {
        const nextState = applyPutAction(state, goalTile, rowId, true);
        if (nextState) {
            return nextState;
        }
    }
    return null;
}

// Call the solver function to start execution
solve();

```