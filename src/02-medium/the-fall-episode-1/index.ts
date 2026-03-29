// Define exit offsets
const ROOM_EXIT_OFFSETS: { [key: string]: { dx: number; dy: number } } = {
    "BOTTOM": { dx: 0, dy: 1 },
    "LEFT": { dx: -1, dy: 0 },
    "RIGHT": { dx: 1, dy: 0 }
};

// Define how Indy moves through each room type based on entrance point.
// Key: roomType, Value: map of entrance (TOP, LEFT, RIGHT) to exit side (BOTTOM, LEFT, RIGHT).
// We assume that the provided POS input will always correspond to a valid path
// given the "safe continuous route" constraint.
const ROOM_PATH_MAP: { [type: number]: { [entrance: string]: string } } = {
    // Type 0: No movement (not part of tunnel, Indy won't traverse)

    // Type 1: All entrances lead to BOTTOM
    1: { "TOP": "BOTTOM", "LEFT": "BOTTOM", "RIGHT": "BOTTOM" },

    // Type 2: Straight pipe, can be vertical or horizontal
    2: { "TOP": "BOTTOM", "LEFT": "RIGHT", "RIGHT": "LEFT" },

    // Type 3: Corner (looks like Type 2 rotated but behaves differently)
    // Image shows TOP -> BOTTOM, LEFT -> BOTTOM. Red arrow from RIGHT means Indy won't enter from RIGHT.
    3: { "TOP": "BOTTOM", "LEFT": "BOTTOM" },

    // Type 4: Corner
    // Image shows TOP -> LEFT, RIGHT -> BOTTOM. Red arrow from LEFT means Indy won't enter from LEFT.
    4: { "TOP": "LEFT", "RIGHT": "BOTTOM" },

    // Type 5: Corner
    // Image shows TOP -> RIGHT, LEFT -> BOTTOM. Red arrow from RIGHT means Indy won't enter from RIGHT.
    5: { "TOP": "RIGHT", "LEFT": "BOTTOM" },

    // Type 6: Horizontal T-junction (horizontal pipe with no top entry)
    // Image shows LEFT -> RIGHT, RIGHT -> LEFT. Red arrow from TOP means Indy won't enter from TOP.
    6: { "LEFT": "RIGHT", "RIGHT": "LEFT" },

    // Type 7: T-junction
    // Image shows TOP -> BOTTOM, LEFT -> BOTTOM. Red arrow from RIGHT means Indy won't enter from RIGHT.
    7: { "TOP": "BOTTOM", "LEFT": "BOTTOM" },

    // Type 8: T-junction
    // Image shows TOP -> BOTTOM, RIGHT -> BOTTOM. Red arrow from LEFT means Indy won't enter from LEFT.
    8: { "TOP": "BOTTOM", "RIGHT": "BOTTOM" },

    // Type 9: T-junction (no top entry)
    // Image shows LEFT -> BOTTOM, RIGHT -> BOTTOM. Red arrow from TOP means Indy won't enter from TOP.
    9: { "LEFT": "BOTTOM", "RIGHT": "BOTTOM" },

    // Type 10: Bent pipe
    // Image shows TOP -> LEFT. Red arrows from LEFT, RIGHT means Indy won't enter from LEFT or RIGHT.
    10: { "TOP": "LEFT" },

    // Type 11: Bent pipe
    // Image shows TOP -> RIGHT. Red arrows from LEFT, RIGHT means Indy won't enter from LEFT or RIGHT.
    11: { "TOP": "RIGHT" },

    // Type 12: Bent pipe
    // Image shows LEFT -> BOTTOM. Red arrow from TOP.
    // **Crucially, the example implies RIGHT -> BOTTOM for Type 12.** This is added for puzzle completion.
    12: { "LEFT": "BOTTOM", "RIGHT": "BOTTOM" },

    // Type 13: Bent pipe
    // Image shows RIGHT -> BOTTOM. Red arrows from TOP, LEFT means Indy won't enter from TOP or LEFT.
    13: { "RIGHT": "BOTTOM" }
};

// --- Initialization Input ---

// Read W (width) and H (height) of the grid
const [W, H] = readline().split(' ').map(Number);

// Read the grid representing the tunnel rooms
const grid: number[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(readline().split(' ').map(Number));
}

// Read EX (exit coordinate along X axis) - Not used in this particular puzzle (Episode 1)
const EX = parseInt(readline());

// --- Game Loop ---

// Loop indefinitely for each game turn, predicting Indy's next position
while (true) {
    // Read Indy's current position (XI, YI) and his entrance point (POS) into the current room
    const [XI_str, YI_str, POS] = readline().split(' ');
    const XI = parseInt(XI_str);
    const YI = parseInt(YI_str);

    // Get the room type at Indy's current position (YI is row, XI is column)
    const roomType = grid[YI][XI];

    // Determine the side Indy exits from the current room based on its type and his entrance point
    const exitSide = ROOM_PATH_MAP[roomType][POS];

    // Get the coordinate offsets (dx, dy) corresponding to the determined exit side
    const nextMove = ROOM_EXIT_OFFSETS[exitSide];

    // Calculate Indy's next X and Y coordinates
    const nextX = XI + nextMove.dx;
    const nextY = YI + nextMove.dy;

    // Output Indy's predicted next position
    console.log(`${nextX} ${nextY}`);
}