declare function readline(): string;
declare function print(message: any): void;

interface CellInfo {
    id: number;
    cs: number; // current colspan
    rs: number; // current rowspan
    originalInputRowIdx: number; // Row index from input (helps with initial placement order)
    originalInputCellIdxInRow: number; // Cell index within input row (helps with initial placement order)
    isSplitPart: boolean; // True for the new cell created by split
    startR_initial: number; // Row coordinate in the original grid
    startC_initial: number; // Column coordinate in the original grid
}

// Max possible dimensions for the grid.
// NR_original (up to 100) + 1 for new row.
// Max initial columns (not specified, but in example, sum of colspans in a row can be like 4).
// If NR=100 and average cells per row = 5, avg col = 5. So 500 initial.
// If a cell (1,1) is split 'C', all cells to its right shift.
// In worst case, if 100 cells in a row, all (1,1) and you split the first, all 99 shift.
// If you split cells in different rows but same logical column, you get more column shifts.
// If a cell is at col X and its cs increases, it pushes others.
// Max original cols (e.g., 100 cells, each 1 wide) + Max NR (100) shifts = 200. Let's make it 600 for safety.
const MAX_GRID_DIM_COL = 600;
const MAX_GRID_DIM_ROW = 101; // Max 100 rows + 1 possible new row

const NR_original = parseInt(readline());
let cellCounter = 0;
let allCells: CellInfo[] = [];

// initialLayoutGrid: Stores CellInfo objects at their top-left (r,c) in the original grid,
// or 'OCCUPIED' if covered by a spanning cell, or null if empty.
// Used to determine `startR_initial` and `startC_initial` for each cell,
// and to find the coordinates of `cellToSplit`.
let initialLayoutGrid: (CellInfo | null | 'OCCUPIED')[][] = Array(NR_original)
    .fill(null)
    .map(() => Array(MAX_GRID_DIM_COL).fill(null));

for (let r = 0; r < NR_original; r++) {
    const rowInput = readline().split(' ');
    let currentLogicalCol = 0;

    // Advance currentLogicalCol past any cells spanning from previous rows
    while (currentLogicalCol < MAX_GRID_DIM_COL && initialLayoutGrid[r] &&
           (initialLayoutGrid[r][currentLogicalCol] === 'OCCUPIED' || 
            (initialLayoutGrid[r][currentLogicalCol] instanceof Object && initialLayoutGrid[r][currentLogicalCol] !== null))) {
        currentLogicalCol++;
    }

    for (let i = 0; i < rowInput.length; i++) {
        const [csStr, rsStr] = rowInput[i].split(',');
        const cs = parseInt(csStr);
        const rs = parseInt(rsStr);

        const newCell: CellInfo = {
            id: cellCounter++,
            cs: cs,
            rs: rs,
            originalInputRowIdx: r,
            originalInputCellIdxInRow: i,
            isSplitPart: false,
            startR_initial: r,
            startC_initial: currentLogicalCol
        };
        allCells.push(newCell);

        // Place the cell in the initial layout grid (top-left)
        initialLayoutGrid[r][currentLogicalCol] = newCell;

        // Mark covered areas in the initial layout grid
        for (let rowCover = r; rowCover < r + rs; rowCover++) {
            // Ensure the row exists in the grid (for large rowspans)
            if (!initialLayoutGrid[rowCover]) {
                initialLayoutGrid[rowCover] = Array(MAX_GRID_DIM_COL).fill(null);
            }
            for (let colCover = currentLogicalCol; colCover < currentLogicalCol + cs; colCover++) {
                if (!(rowCover === r && colCover === currentLogicalCol)) { // Don't overwrite the top-left itself
                    initialLayoutGrid[rowCover][colCover] = 'OCCUPIED';
                }
            }
        }
        currentLogicalCol += cs;
    }
}

const [splitCellIdxStr, splitDirection] = readline().split(' ');
const splitCellIdx = parseInt(splitCellIdxStr);
const cellToSplit = allCells[splitCellIdx]; // Get the reference to the actual object

// The initial coordinates of the cell to split
let splitCellR_initial = cellToSplit.startR_initial;
let splitCellC_initial = cellToSplit.startC_initial;

let newNumRows = NR_original;

// Phase 2: Apply Split and Adjust Spans
if (splitDirection === 'C') {
    // Modify the original cell's colspan
    cellToSplit.cs = 1;

    // Create the new cell part
    const newCellPart: CellInfo = {
        id: cellCounter++,
        cs: 1,
        rs: cellToSplit.rs, // New cell part's colspan is 1, rowspan is same
        originalInputRowIdx: cellToSplit.originalInputRowIdx,
        originalInputCellIdxInRow: cellToSplit.originalInputCellIdxInRow + 0.5, // Sorts after original cell in same row
        isSplitPart: true,
        startR_initial: splitCellR_initial, // Conceptually in the same row initially
        startC_initial: splitCellC_initial + 1 // Conceptually one column to the right initially
    };
    allCells.push(newCellPart);

    // Adjust colspans for other cells based on the simple rule
    for (const cell of allCells) {
        if (cell.id === cellToSplit.id || cell.id === newCellPart.id) continue; // Skip the split parts themselves

        // Rule: if a cell's rightmost covered column is at or beyond the split cell's initial column.
        // `cell.startC_initial + cell.cs - 1` is the rightmost occupied column index of `cell`.
        // `splitCellC_initial` is the start column of the cell that was split.
        if (cell.startC_initial + cell.cs - 1 >= splitCellC_initial) {
            cell.cs++;
        }
    }
} else { // splitDirection === 'R'
    // Modify the original cell's rowspan
    cellToSplit.rs = 1;

    // Create the new cell part
    const newCellPart: CellInfo = {
        id: cellCounter++,
        cs: cellToSplit.cs, // New cell part's rowspan is 1, colspan is same
        rs: 1,
        originalInputRowIdx: cellToSplit.originalInputRowIdx + 0.5, // Sorts after original cell's row
        originalInputCellIdxInRow: cellToSplit.originalInputCellIdxInRow, // Stays in the same logical column for sorting
        isSplitPart: true,
        startR_initial: splitCellR_initial + 1, // Conceptually one row below initially
        startC_initial: splitCellC_initial // Conceptually in the same column initially
    };
    allCells.push(newCellPart);
    newNumRows++; // Output will have one more row

    // Adjust rowspans for other cells based on the simple rule
    for (const cell of allCells) {
        if (cell.id === cellToSplit.id || cell.id === newCellPart.id) continue;

        // Rule: if a cell's bottommost covered row is at or below the split cell's initial row.
        // `cell.startR_initial + cell.rs - 1` is the bottommost occupied row index of `cell`.
        // `splitCellR_initial` is the start row of the cell that was split.
        if (cell.startR_initial + cell.rs - 1 >= splitCellR_initial) {
            cell.rs++;
        }
    }
}

// Phase 3: Generate Final Layout and Output

// Create `cellsForFinalLayout` with `finalR` and `finalC` properties for sorting based on new positions.
const cellsForFinalLayout: (CellInfo & { finalR: number; finalC: number })[] = allCells.map(cell => {
    let finalR = cell.startR_initial;
    let finalC = cell.startC_initial;

    if (splitDirection === 'C') {
        // If a cell's `startC_initial` is strictly greater than `splitCellC_initial`, it shifts right by 1.
        if (cell.startC_initial > splitCellC_initial) {
            finalC++;
        }
        // For the new split part, its `finalC` is explicitly `splitCellC_initial + 1`.
        if (cell.isSplitPart) {
            finalC = splitCellC_initial + 1;
            finalR = splitCellR_initial; // New split part is in the same row as original
        }
        // For the original split part, its `finalC` is explicitly `splitCellC_initial`.
        else if (cell.id === splitCellIdx) {
            finalC = splitCellC_initial;
            finalR = splitCellR_initial;
        }
    } else { // splitDirection === 'R'
        // If a cell's `startR_initial` is strictly greater than `splitCellR_initial`, it shifts down by 1.
        if (cell.startR_initial > splitCellR_initial) {
            finalR++;
        }
        // For the new split part, its `finalR` is explicitly `splitCellR_initial + 1`.
        if (cell.isSplitPart) {
            finalR = splitCellR_initial + 1;
            finalC = splitCellC_initial; // New split part is in the same column as original
        }
        // For the original split part, its `finalR` is explicitly `splitCellR_initial`.
        else if (cell.id === splitCellIdx) {
            finalR = splitCellR_initial;
            finalC = splitCellC_initial;
        }
    }
    return { ...cell, finalR, finalC };
});


// Sort `cellsForFinalLayout` by their `finalR` then `finalC` to determine print order.
cellsForFinalLayout.sort((a, b) => {
    if (a.finalR !== b.finalR) {
        return a.finalR - b.finalR;
    }
    return a.finalC - b.finalC;
});

// `outputGrid`: The grid that will be used to determine what cells to print per row.
// It stores the CellInfo object for top-left cells, or -1 for occupied cells.
let outputGrid: (CellInfo | null | -1)[][] = Array(newNumRows + 1)
    .fill(null)
    .map(() => Array(MAX_GRID_DIM_COL).fill(null));

// Populate `outputGrid` using the sorted `cellsForFinalLayout` and their updated `cs`/`rs`.
for (const cell of cellsForFinalLayout) {
    const r = cell.finalR;
    const c = cell.finalC;
    
    // Ensure row exists in the grid
    if (!outputGrid[r]) {
        outputGrid[r] = Array(MAX_GRID_DIM_COL).fill(null);
    }

    // Place the top-left cell
    outputGrid[r][c] = cell;

    // Mark covered areas as -1 (occupied by another cell)
    for (let rowCover = r; rowCover < r + cell.rs; rowCover++) {
        // Ensure row exists in the grid
        if (!outputGrid[rowCover]) {
            outputGrid[rowCover] = Array(MAX_GRID_DIM_COL).fill(null);
        }
        for (let colCover = c; colCover < c + cell.cs; colCover++) {
            if (!(rowCover === r && colCover === c)) { // Don't mark the top-left itself as -1
                outputGrid[rowCover][colCover] = -1; 
            }
        }
    }
}

// Print the final table structure
for (let r = 0; r < newNumRows; r++) {
    let rowOutput: string[] = [];
    if (!outputGrid[r]) outputGrid[r] = Array(MAX_GRID_DIM_COL).fill(null); // Ensure row exists for iteration

    for (let c = 0; c < MAX_GRID_DIM_COL; c++) {
        const cellAtPos = outputGrid[r][c];

        if (cellAtPos === null) {
            // Empty spot that is not occupied by a spanning cell.
            // This means we have advanced beyond all relevant cells for this row.
            // Break from inner loop to prevent printing trailing empty spaces.
            // This is crucial for correct output format which only lists starting cells.
            // If the cell `outputGrid[r][c]` is `null`, it implies `c` has passed the extent of any cell that starts at `r` or spans into `r` from left.
            // However, it could be `null` *between* cells if the problem implies truly sparse tables.
            // The problem statement says "filling empty columns". This implies cells will be contiguous or only skipped by spanning cells.
            // So if `null` is encountered here, it usually means we're past all relevant columns in this row.
            // This condition ensures we don't print "0,0" for empty spots.
            continue; 
        } else if (cellAtPos === -1) {
            // This spot is occupied by a spanning cell (not a top-left), so no new TD starts here.
            continue;
        } else if (cellAtPos instanceof Object) {
            // This is a top-left cell, print its cs,rs.
            rowOutput.push(`${cellAtPos.cs},${cellAtPos.rs}`);
        }
    }
    print(rowOutput.join(' '));
}