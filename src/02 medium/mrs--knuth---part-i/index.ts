/**
 * Represents a node in the Dancing Links matrix.
 * It's part of a doubly circular linked list in both horizontal and vertical directions.
 */
class DLXNode {
    left: DLXNode;
    right: DLXNode;
    up: DLXNode;
    down: DLXNode;
    column: ColumnHeader; // Reference to the column header this node belongs to
    rowId: number;       // Unique identifier for the option (row) this node is part of

    constructor(column?: ColumnHeader, rowId?: number) {
        this.left = this;
        this.right = this;
        this.up = this;
        this.down = this;
        // If no column is provided, it's either the root or a column header itself
        this.column = column || (this as any); 
        this.rowId = rowId !== undefined ? rowId : -1;
    }
}

/**
 * Represents a column header in the Dancing Links matrix.
 * Extends DLXNode with properties specific to columns.
 */
class ColumnHeader extends DLXNode {
    size: number; // Number of nodes (1s) currently active in this column
    name: string; // The name of the item/constraint this column represents

    constructor(name: string) {
        super();
        this.size = 0;
        this.name = name;
        this.column = this; // A column header points to itself as its column
    }
}

/**
 * Implements Knuth's Dancing Links (DLX) algorithm for solving Exact Cover problems.
 */
class DancingLinksSolver {
    root: ColumnHeader; // The root node of the DLX matrix
    columnHeaders: Map<string, ColumnHeader>; // Maps column names to their ColumnHeader objects
    optionDetails: Array<any[]>; // Stores the actual data associated with each row (option)
    solution: number[]; // Stores the rowIds of the selected options that form the solution

    constructor() {
        this.root = new ColumnHeader("root");
        this.columnHeaders = new Map();
        this.optionDetails = [];
        this.solution = [];

        // Initialize root's horizontal links to itself
        this.root.left = this.root;
        this.root.right = this.root;
    }

    /**
     * Adds a new column header to the matrix. If a column with the same name already exists, returns it.
     * @param name The name of the column (item).
     * @returns The ColumnHeader object.
     */
    addColumn(name: string): ColumnHeader {
        if (this.columnHeaders.has(name)) {
            return this.columnHeaders.get(name)!;
        }

        const newColumn = new ColumnHeader(name);
        this.columnHeaders.set(name, newColumn);

        // Link the new column horizontally into the root's list
        newColumn.right = this.root;
        newColumn.left = this.root.left;
        this.root.left.right = newColumn;
        this.root.left = newColumn;

        return newColumn;
    }

    /**
     * Adds a new row (option) to the matrix.
     * @param columnNames An array of names of columns that this row covers.
     * @param details An array containing the specific data for this option (e.g., [studentName, instrument, day, hour]).
     * @returns The unique ID assigned to this row.
     */
    addRow(columnNames: string[], details: any[]): number {
        const rowId = this.optionDetails.length;
        this.optionDetails.push(details);

        let firstNodeInRow: DLXNode | null = null;
        let prevNodeInRow: DLXNode | null = null;

        for (const colName of columnNames) {
            const colHeader = this.columnHeaders.get(colName);
            if (!colHeader) {
                // This indicates an issue in column name generation
                throw new Error(`Column '${colName}' not found when adding row.`);
            }

            const newNode = new DLXNode(colHeader, rowId);
            colHeader.size++; // Increment the size of the column

            // Link newNode vertically into its column
            newNode.down = colHeader;
            newNode.up = colHeader.up;
            colHeader.up.down = newNode;
            colHeader.up = newNode;

            // Link newNode horizontally into the current row
            if (!firstNodeInRow) {
                // First node in this row
                firstNodeInRow = newNode;
                prevNodeInRow = newNode;
            } else {
                // Link subsequent nodes horizontally
                newNode.left = prevNodeInRow!;
                newNode.right = firstNodeInRow!;
                prevNodeInRow!.right = newNode;
                firstNodeInRow!.left = newNode;
                prevNodeInRow = newNode;
            }
        }
        return rowId;
    }

    /**
     * Hides a column from the matrix. This involves removing it horizontally
     * and removing all nodes in its column vertically, decrementing their column sizes.
     * @param c The ColumnHeader to hide.
     */
    private hide(c: ColumnHeader) {
        c.right.left = c.left;
        c.left.right = c.right;

        for (let i = c.down; i !== c; i = i.down) { // Iterate down the column c
            for (let j = i.right; j !== i; j = j.right) { // Iterate right across the row i
                j.down.up = j.up;
                j.up.down = j.down;
                j.column.size--; // Decrement size of the column j is in
            }
        }
    }

    /**
     * Unhides a column, reversing the `hide` operation.
     * Crucial for backtracking in the recursive search.
     * @param c The ColumnHeader to unhide.
     */
    private unhide(c: ColumnHeader) {
        for (let i = c.up; i !== c; i = i.up) { // Iterate up the column c (reverse order of hide)
            for (let j = i.left; j !== i; j = j.left) { // Iterate left across the row i (reverse order)
                j.column.size++; // Increment size of the column j is in
                j.down.up = j;
                j.up.down = j;
            }
        }
        c.right.left = c; // Restore horizontal links for column c
        c.left.right = c;
    }

    /**
     * The main recursive function to find an exact cover.
     * @returns `true` if a solution is found, `false` otherwise.
     */
    solve(): boolean {
        // If the root's right pointer is itself, all columns have been covered.
        // A solution has been found.
        if (this.root.right === this.root) {
            return true;
        }

        // Choose column c: Knuth's heuristic - pick the column with the smallest number of 1s (smallest size).
        // This minimizes the branching factor in the search tree.
        let c: ColumnHeader = this.root.right as ColumnHeader;
        for (let j = c.right; j !== this.root; j = j.right) {
            const col = j as ColumnHeader;
            if (col.size < c.size) {
                c = col;
            }
        }

        this.hide(c); // Cover the chosen column c

        // For each row 'r' in column 'c' (iterating downwards)
        for (let r = c.down; r !== c; r = r.down) {
            this.solution.push(r.rowId); // Add row 'r' to the current partial solution

            // For each node 'j' in row 'r' (iterating rightwards)
            // Hide the column of 'j' (and all its intersecting rows)
            for (let j = r.right; j !== r; j = j.right) {
                this.hide(j.column);
            }

            // Recursively call solve for the reduced matrix
            if (this.solve()) {
                return true; // A solution was found, propagate true upwards
            }

            // Backtrack: If no solution found from this path, undo changes
            // Iterate leftwards across row 'r' (reverse order of hiding)
            for (let j = r.left; j !== r; j = j.left) {
                this.unhide(j.column); // Unhide the column of 'j'
            }
            this.solution.pop(); // Remove row 'r' from the partial solution
        }

        this.unhide(c); // Unhide the chosen column 'c'

        return false; // No solution found from this branch
    }
}

// --- Constants and Helper Functions for Puzzle Specifics ---

const DAYS_ABBR = ["M", "Tu", "W", "Th", "F"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
// All possible hours in order for output display
const ALL_HOURS = [8, 9, 10, 11, 1, 2, 3, 4]; 

/**
 * Parses an availability string into a map of day index to set of available hours.
 * @param availabilityString The input string (e.g., "M 1 2 Tu 8").
 * @returns A Map where key is day index (0-4) and value is a Set of hours.
 */
function parseAvailability(availabilityString: string): Map<number, Set<number>> {
    const availMap = new Map<number, Set<number>>();
    const parts = availabilityString.split(' ');

    let currentDayIndex = -1;
    for (const part of parts) {
        const dayIdx = DAYS_ABBR.indexOf(part);
        if (dayIdx !== -1) {
            currentDayIndex = dayIdx;
            availMap.set(currentDayIndex, new Set<number>());
        } else if (currentDayIndex !== -1) {
            const hour = parseInt(part, 10);
            if (!isNaN(hour)) {
                availMap.get(currentDayIndex)!.add(hour);
            }
        }
    }
    return availMap;
}

/**
 * Pads a string to center it within a given width. Extra space goes to the right.
 * @param text The string to pad.
 * @param width The desired total width.
 * @param padChar The character to use for padding (default is ' ').
 * @returns The center-padded string.
 */
function centerPad(text: string, width: number, padChar: string = ' '): string {
    if (text.length >= width) {
        return text;
    }
    const totalPadding = width - text.length;
    const padLeft = Math.floor(totalPadding / 2);
    const padRight = totalPadding - padLeft;
    return padChar.repeat(padLeft) + text + padChar.repeat(padRight);
}

// --- Main Puzzle Logic ---

function solveMrsKnuth(): string[] {
    // readline() is provided by the CodinGame environment
    const teacherAvailabilityStr = readline();
    const numStudents = parseInt(readline(), 10);

    const teacherAvailMap = parseAvailability(teacherAvailabilityStr);
    // Get sorted indices of days Mrs. Knuth has *any* availability
    const mrsKnuthTeachingDays: number[] = Array.from(teacherAvailMap.keys()).sort((a, b) => a - b);

    const students: { name: string; instrument: string; avail: Map<number, Set<number>>; }[] = [];
    const allInstruments = new Set<string>(); // Collect all unique instruments

    for (let i = 0; i < numStudents; i++) {
        const studentLine = readline().split(' ');
        const name = studentLine[0];
        const instrument = studentLine[1];
        const studentAvailStr = studentLine.slice(2).join(' ');
        const studentAvailMap = parseAvailability(studentAvailStr);
        students.push({ name, instrument, avail: studentAvailMap });
        allInstruments.add(instrument);
    }

    const solver = new DancingLinksSolver();

    // 1. Create Student Columns: One column for each student
    for (const student of students) {
        solver.addColumn(`S_${student.name}`);
    }

    // 2. Create Time Slot Columns: One column for each (Day, Hour) slot Mrs. Knuth is available
    for (const dayIdx of mrsKnuthTeachingDays) {
        const hours = teacherAvailMap.get(dayIdx)!; // Guaranteed to exist by mrsKnuthTeachingDays
        for (const hour of hours) {
            solver.addColumn(`T_${DAYS_ABBR[dayIdx]}_${hour}`);
        }
    }

    // 3. Create Instrument-Per-Day Columns: One column for each (Day Mrs. Knuth teaches, Instrument) pair
    // This ensures no instrument is scheduled twice on the same day.
    for (const dayIdx of mrsKnuthTeachingDays) {
        for (const instrument of allInstruments) {
            solver.addColumn(`I_${DAYS_ABBR[dayIdx]}_${instrument}`);
        }
    }

    // Add rows (options) to the matrix
    // Each row represents a possible single lesson assignment
    for (const student of students) {
        // Iterate through all 5 days of the week
        for (let dayIdx = 0; dayIdx < DAYS_ABBR.length; dayIdx++) {
            const studentHoursOnDay = student.avail.get(dayIdx);
            const teacherHoursOnDay = teacherAvailMap.get(dayIdx);

            // A lesson is only possible if both student and teacher have availability on this day
            if (!studentHoursOnDay || !teacherHoursOnDay) {
                continue;
            }

            // Iterate through all possible hours (8-11 AM, 1-4 PM)
            for (const hour of ALL_HOURS) {
                // If both student and teacher are available at this specific (Day, Hour)
                if (studentHoursOnDay.has(hour) && teacherHoursOnDay.has(hour)) {
                    const columnNames: string[] = [
                        `S_${student.name}`,                 // Student gets their lesson
                        `T_${DAYS_ABBR[dayIdx]}_${hour}`,    // Time slot is filled
                        `I_${DAYS_ABBR[dayIdx]}_${student.instrument}` // Instrument used on this day
                    ];
                    // Store details for later output formatting
                    solver.addRow(columnNames, [student.name, student.instrument, dayIdx, hour]);
                }
            }
        }
    }

    // Solve the exact cover problem
    const success = solver.solve();
    if (!success) {
        // According to constraints, a unique solution always exists. This should not be reached.
        throw new Error("No solution found for Mrs. Knuth's schedule.");
    }

    // --- Format Output ---

    // Map display row index to actual hour (0-3 for 8-11, 4 for LUNCH, 5-8 for 1-4)
    const HOUR_ROW_MAP: { [key: number]: number } = {
        8: 0, 9: 1, 10: 2, 11: 3, // Morning hours
        1: 5, 2: 6, 3: 7, 4: 8    // Afternoon hours (row 4 is LUNCH)
    };
    const NUM_DISPLAY_ROWS = 9; // 8 rows for hours + 1 row for LUNCH
    const NUM_COLS = 5;         // Monday to Friday

    // Initialize schedule grid with empty slots
    const schedule: string[][] = [];
    for (let i = 0; i < NUM_DISPLAY_ROWS; i++) {
        schedule.push(Array(NUM_COLS).fill("--------------"));
    }

    // Populate the schedule grid based on the solver's solution
    for (const rowId of solver.solution) {
        const [studentName, instrument, dayIdx, hour] = solver.optionDetails[rowId];
        const displayRowIdx = HOUR_ROW_MAP[hour];
        schedule[displayRowIdx][dayIdx] = `${studentName}/${instrument}`;
    }

    const outputLines: string[] = [];

    // Header row for days of the week
    let headerLine = "       "; // Padding for the empty first column (2 char hour + 1 space + 4 padding for center justification of Mon)
    for (const dayName of DAYS_FULL) {
        headerLine += centerPad(dayName, 14); // Each day column is 14 chars wide
    }
    outputLines.push(headerLine.trimEnd()); // Remove trailing spaces

    // Schedule content rows
    for (let r = 0; r < NUM_DISPLAY_ROWS; r++) {
        let line = "";
        if (r === 4) { // This is the LUNCH row
            line += "       "; // Same padding as header for the first column
            for (let c = 0; c < NUM_COLS; c++) {
                line += centerPad("LUNCH", 14); // LUNCH is center-justified in all 5 columns
            }
        } else {
            // Determine the hour to display for this row
            const hour = r < 4 ? r + 8 : r - 4; // Map 0-3 to 8-11, 5-8 to 1-4
            line += String(hour).padStart(2, ' ') + " "; // Column 1: Hour, right justified, 2 chars + 1 space
            for (let c = 0; c < NUM_COLS; c++) {
                // Add a space separator, then the center-justified content for the schedule slot
                line += " " + centerPad(schedule[r][c], 14, ' '); 
            }
        }
        outputLines.push(line.trimEnd()); // Remove trailing spaces
    }

    return outputLines;
}

// CodinGame entry point:
// The `readline()` function is globally available in the CodinGame environment.
// The solution expects to print each line of the output using `console.log()` or `print()`.
const result = solveMrsKnuth();
for (const line of result) {
    console.log(line);
}