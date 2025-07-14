/**
 * Global variables for game state.
 * These are defined outside the loop to maintain state across turns.
 */
let W: number; // width of the building
let H: number; // height of the building
let N: number; // number of jumps Batman can make (unused in loop logic but part of input)

let batmanX: number; // Batman's current X position
let batmanY: number; // Batman's current Y position

let prevBatmanX: number; // Batman's X position BEFORE the jump that just concluded (used for feedback calculation)
let prevBatmanY: number; // Batman's Y position BEFORE the jump that just concluded (used for feedback calculation)

// Search space boundaries for the bomb's location
let minX: number;
let maxX: number;
let minY: number;
let maxY: number;

/**
 * Initialization phase: Read initial game data.
 */
// Read W and H (width and height of the building)
const inputs: string[] = readline().split(' ');
W = parseInt(inputs[0]);
H = parseInt(inputs[1]);

// Read N (number of jumps)
N = parseInt(readline());

// Read X0 and Y0 (Batman's starting position)
const posInputs: string[] = readline().split(' ');
batmanX = parseInt(posInputs[0]);
batmanY = parseInt(posInputs[1]);

// Initialize search space to the entire grid
minX = 0;
maxX = W - 1;
minY = 0;
maxY = H - 1;

// For the first turn, Batman's 'previous' position is his starting position,
// as no jump has occurred yet for feedback.
prevBatmanX = batmanX;
prevBatmanY = batmanY;

/**
 * Game loop: Runs for N turns, or until the bomb is found.
 * In CodinGame, this is typically an infinite loop, and the program exits
 * when the objective is met or jumps run out.
 */
while (true) {
    const bombDir: string = readline(); // Read feedback: COLDER, WARMER, SAME, or UNKNOWN

    // Update search space bounds based on the feedback from the LAST jump.
    // The feedback 'bombDir' relates to the jump from (prevBatmanX, prevBatmanY) to (batmanX, batmanY).
    if (bombDir !== "UNKNOWN") {
        const dx = batmanX - prevBatmanX; // Change in X coordinate
        const dy = batmanY - prevBatmanY; // Change in Y coordinate

        if (bombDir === "WARMER") {
            // Bomb is closer to (batmanX, batmanY) than (prevBatmanX, prevBatmanY).
            // This means the bomb is on the side of the perpendicular bisector that (batmanX, batmanY) is on.
            if (dx > 0) { // Batman moved right (X increased)
                // Bomb's X must be to the right of the midpoint.
                minX = Math.max(minX, Math.floor((prevBatmanX + batmanX) / 2) + 1);
            } else if (dx < 0) { // Batman moved left (X decreased)
                // Bomb's X must be to the left of the midpoint.
                maxX = Math.min(maxX, Math.floor((prevBatmanX + batmanX) / 2));
            }
            // If dx == 0, Batman moved vertically; this specific X-movement doesn't directly narrow X.

            if (dy > 0) { // Batman moved down (Y increased)
                // Bomb's Y must be below the midpoint.
                minY = Math.max(minY, Math.floor((prevBatmanY + batmanY) / 2) + 1);
            } else if (dy < 0) { // Batman moved up (Y decreased)
                // Bomb's Y must be above the midpoint.
                maxY = Math.min(maxY, Math.floor((prevBatmanY + batmanY) / 2));
            }
            // If dy == 0, Batman moved horizontally; this specific Y-movement doesn't directly narrow Y.

        } else if (bombDir === "COLDER") {
            // Bomb is closer to (prevBatmanX, prevBatmanY) than (batmanX, batmanY).
            // This means the bomb is on the side of the perpendicular bisector that (prevBatmanX, prevBatmanY) is on.
            if (dx > 0) { // Batman moved right (X increased)
                // Bomb's X must be to the left of the midpoint.
                maxX = Math.min(maxX, Math.floor((prevBatmanX + batmanX) / 2));
            } else if (dx < 0) { // Batman moved left (X decreased)
                // Bomb's X must be to the right of the midpoint.
                minX = Math.max(minX, Math.floor((prevBatmanX + batmanX) / 2) + 1);
            }

            if (dy > 0) { // Batman moved down (Y increased)
                // Bomb's Y must be above the midpoint.
                maxY = Math.min(maxY, Math.floor((prevBatmanY + batmanY) / 2));
            } else if (dy < 0) { // Batman moved up (Y decreased)
                // Bomb's Y must be below the midpoint.
                minY = Math.max(minY, Math.floor((prevBatmanY + batmanY) / 2) + 1);
            }
        } else if (bombDir === "SAME") {
            // Bomb is equidistant from (prevBatmanX, prevBatmanY) and (batmanX, batmanY).
            // This means the bomb lies on the perpendicular bisector itself.
            if (dx !== 0) { // If there was horizontal movement
                const midX_float = (prevBatmanX + batmanX) / 2;
                // The bomb's X-coordinate must be either floor(midX) or ceil(midX)
                // (e.g., if midpoint is 0.5, bomb could be 0 or 1).
                minX = Math.max(minX, Math.floor(midX_float));
                maxX = Math.min(maxX, Math.ceil(midX_float));
            }
            if (dy !== 0) { // If there was vertical movement
                const midY_float = (prevBatmanY + batmanY) / 2;
                // The bomb's Y-coordinate must be either floor(midY) or ceil(midY).
                minY = Math.max(minY, Math.floor(midY_float));
                maxY = Math.min(maxY, Math.ceil(midY_float));
            }
        }
    }

    // Store Batman's current position (where he just landed) as 'previous' for the next turn.
    prevBatmanX = batmanX;
    prevBatmanY = batmanY;

    // Calculate Batman's next jump position.
    // This is typically the center of the remaining valid search space to perform a binary search.
    batmanX = Math.floor((minX + maxX) / 2);
    batmanY = Math.floor((minY + maxY) / 2);

    // Output the calculated next jump coordinates.
    console.log(`${batmanX} ${batmanY}`);
}