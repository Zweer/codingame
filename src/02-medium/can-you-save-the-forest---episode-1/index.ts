// Define a type for coordinates for better readability
type Coords = {
    x: number; // Column
    y: number; // Row
};

// Read maxBurnedForest from the initial input.
// This variable is read only once at the start of the game.
const maxBurnedForest: number = parseInt(readline());

// The game loop continues as long as the game is running.
// CodinGame platform handles termination based on victory/loss conditions.
while (true) {
    const map: string[] = [];
    // Read the 10 rows of the current map state for the current turn.
    for (let i = 0; i < 10; i++) {
        map.push(readline());
    }

    // Initialize lists to store coordinates of fires based on their level.
    const level3Fires: Coords[] = [];
    const level2Fires: Coords[] = [];
    const level1Fires: Coords[] = [];

    // Scan the entire 10x10 map to find all active fires.
    for (let y = 0; y < 10; y++) { // Iterate through rows (y-coordinate)
        for (let x = 0; x < 10; x++) { // Iterate through columns (x-coordinate)
            const cell = map[y][x];
            if (cell === '3') {
                level3Fires.push({ x, y });
            } else if (cell === '2') {
                level2Fires.push({ x, y });
            } else if (cell === '1') {
                level1Fires.push({ x, y });
            }
        }
    }

    let targetX: number;
    let targetY: number;

    // Apply the strategy: Prioritize extinguishing fires based on their level.
    // Level 3 fires are the most critical as they turn into '*' and spread next turn.
    if (level3Fires.length > 0) {
        // If there are Level 3 fires, pick the first one found (e.g., top-leftmost).
        // Extinguishing a '3' prevents it from turning '*' and spreading.
        const fire = level3Fires[0];
        targetX = fire.x;
        targetY = fire.y;
    } else if (level2Fires.length > 0) {
        // If no Level 3 fires, but there are Level 2 fires, pick the first one.
        // Extinguishing a '2' prevents it from becoming a '3' in the next turn.
        const fire = level2Fires[0];
        targetX = fire.x;
        targetY = fire.y;
    } else if (level1Fires.length > 0) {
        // If no Level 3 or 2 fires, but there are Level 1 fires, pick the first one.
        // Extinguishing a '1' prevents it from escalating further.
        const fire = level1Fires[0];
        targetX = fire.x;
        targetY = fire.y;
    } else {
        // If no active fires (1, 2, or 3) are found on the map,
        // it means all fires are extinguished. The game should end soon.
        // We still need to output valid coordinates. 0 0 is a safe choice.
        targetX = 0;
        targetY = 0;
    }

    // Output the chosen coordinates (column X, row Y) to standard output.
    console.log(`${targetX} ${targetY}`);
}