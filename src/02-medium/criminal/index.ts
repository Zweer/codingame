// Standard input reading setup for CodinGame
const H: number = parseInt(readline());
const W: number = parseInt(readline());
const grid: string[][] = [];
let youX: number = -1; // Column of 'Y'
let youY: number = -1; // Row of 'Y'

// Read the grid and find 'Y's position
for (let i = 0; i < H; i++) {
    const row: string = readline();
    grid.push(row.split(''));
    const yIndex = row.indexOf('Y');
    if (yIndex !== -1) {
        youX = yIndex;
        youY = i;
    }
}

// Direction vectors for people based on their character
const dirX: { [key: string]: number } = { '^': 0, 'v': 0, '<': -1, '>': 1 };
const dirY: { [key: string]: number } = { '^': -1, 'v': 1, '<': 0, '>': 0 };

/**
 * Determines if a character is considered an obstacle.
 * According to rules: "other character: obstacle" AND "(!!OR ANOTHER PERSON!!)"
 * This means '.' and 'Y' are NOT obstacles. All other characters, including other people, are.
 * @param char The character to check.
 * @returns True if the character is an obstacle, false otherwise.
 */
function isObstacle(char: string): boolean {
    return char !== '.' && char !== 'Y';
}

/**
 * Checks if a person at (pX, pY) looking in direction pChar can see 'Y' at (yX, yY).
 *
 * @param pY Row of the person.
 * @param pX Column of the person.
 * @param pChar Character representing the person's direction ('^', 'v', '<', '>').
 * @param yY Row of 'Y'.
 * @param yX Column of 'Y'.
 * @param H Grid height.
 * @param W Grid width.
 * @param grid The 2D grid of characters.
 * @returns True if the person can see 'Y', false otherwise.
 */
function canPersonSeeYou(
    pY: number, pX: number, pChar: string,
    yY: number, yX: number,
    H: number, W: number, grid: string[][]
): boolean {
    const dx = dirX[pChar]; // Change in X for person's direction
    const dy = dirY[pChar]; // Change in Y for person's direction

    // 1. Calculate target_d (linear distance along person's primary viewing axis)
    //    and target_offset (perpendicular offset from the central ray).
    let target_d: number;
    let target_offset: number;

    if (dy !== 0) { // Person is looking vertically (up or down)
        target_d = Math.abs(yY - pY); // Distance is along Y-axis
        target_offset = yX - pX;     // Offset is in X-direction relative to person's X
    } else { // Person is looking horizontally (left or right)
        target_d = Math.abs(yX - pX); // Distance is along X-axis
        target_offset = yY - pY;     // Offset is in Y-direction relative to person's Y
    }

    // 2. Basic Field of Vision (FoV) and Direction Checks:
    //    - A person cannot see themselves.
    //    - The target must be within the vision cone's width (width is 2*d + 1, so abs(offset) <= d).
    //    - The target must be in the correct forward direction.
    if (target_d === 0) {
        return false; // 'Y' is at the person's location.
    }
    if (Math.abs(target_offset) > target_d) {
        return false; // 'Y' is outside the widening cone of vision.
    }
    // Check if 'Y' is in the correct forward direction relative to the person.
    if (dy !== 0 && (yY - pY) * dy <= 0) {
        return false; // Wrong direction vertically (e.g., looking 'v' but Y is above or at same row).
    }
    if (dx !== 0 && (yX - pX) * dx <= 0) {
        return false; // Wrong direction horizontally (e.g., looking '>' but Y is left or at same col).
    }

    // 3. Obstacle Check: Iterate through all layers of distance between the person and 'Y'.
    //    d_obs represents the current distance layer from the person (from 1 up to target_d - 1).
    for (let d_obs = 1; d_obs < target_d; d_obs++) {
        let current_obs_main_coord: number; // The coordinate along the main viewing axis for this layer (e.g., y-coord for vertical vision).
        let current_obs_min_offset_in_layer: number; // Minimum perpendicular offset for a cell in this layer.
        let current_obs_max_offset_in_layer: number; // Maximum perpendicular offset for a cell in this layer.

        if (dy !== 0) { // Vertical vision (person looking 'v' or '^')
            current_obs_main_coord = pY + dy * d_obs;
            current_obs_min_offset_in_layer = -d_obs;
            current_obs_max_offset_in_layer = d_obs;
        } else { // Horizontal vision (person looking '>' or '<')
            current_obs_main_coord = pX + dx * d_obs;
            current_obs_min_offset_in_layer = -d_obs;
            current_obs_max_offset_in_layer = d_obs;
        }

        // Iterate through all possible perpendicular offsets at this specific distance layer (d_obs).
        for (let offset_obs = current_obs_min_offset_in_layer; offset_obs <= current_obs_max_offset_in_layer; offset_obs++) {
            let ox: number; // Obstacle's x-coordinate
            let oy: number; // Obstacle's y-coordinate

            if (dy !== 0) { // Vertical vision: X changes with offset, Y changes with main_coord.
                ox = pX + offset_obs;
                oy = current_obs_main_coord;
            } else { // Horizontal vision: Y changes with offset, X changes with main_coord.
                ox = current_obs_main_coord;
                oy = pY + offset_obs;
            }

            // Ensure the potential obstacle cell (ox, oy) is within the grid boundaries.
            if (oy < 0 || oy >= H || ox < 0 || ox >= W) {
                continue; // Cell is out of bounds, not an obstacle.
            }

            const obstacleChar = grid[oy][ox];
            if (isObstacle(obstacleChar)) {
                // An obstacle has been found at (oy, ox) at (d_obs, offset_obs) relative to the person.
                // Now, check if this specific obstacle blocks the target 'Y'.

                // Rule 1: Central obstacle blocking.
                // If the obstacle is directly in front of the person (offset_obs === 0).
                if (offset_obs === 0) {
                    if (target_offset === 0) { // If 'Y' is also directly in front (on the central ray).
                        return false; // 'Y' is blocked by this central obstacle.
                    }
                } else { // Rule 2: Side obstacle casting a widening shadow.
                    // The "hidden area" (shadow) expands by 1 unit for each additional unit of distance
                    // *from the obstacle* to 'Y'. This expansion is (target_d - d_obs).
                    // The shadowed range of offsets at target_d is [offset_obs - expansion, offset_obs + expansion].
                    const shadow_expansion = (target_d - d_obs);
                    const shadow_min_bound = offset_obs - shadow_expansion;
                    const shadow_max_bound = offset_obs + shadow_expansion;

                    // 'Y' is blocked if:
                    //   a) Its offset falls within the calculated shadow range at target_d.
                    //   b) It is on the same side of the central ray as the obstacle.
                    //      Math.sign(offset_obs) === Math.sign(target_offset) correctly handles this:
                    //      it is true for positive/positive or negative/negative, but false if one is zero or signs differ.
                    if (target_offset >= shadow_min_bound && target_offset <= shadow_max_bound &&
                        Math.sign(offset_obs) === Math.sign(target_offset)) {
                        return false; // 'Y' is blocked by this side obstacle's shadow.
                    }
                }
            }
        }
    }

    // If the loops complete without 'Y' being blocked by any obstacle, the person can see 'Y'.
    return true;
}

let visiblePeopleCount: number = 0;

// Iterate through the entire grid to find all people.
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const char = grid[r][c];
        // Check if the current character represents a person.
        if (char === '^' || char === 'v' || char === '<' || char === '>') {
            // If it's a person, check if they can see 'Y'.
            if (canPersonSeeYou(r, c, char, youY, youX, H, W, grid)) {
                visiblePeopleCount++; // Increment count if they can.
            }
        }
    }
}

// Output the final count of people watching 'Y'.
console.log(visiblePeopleCount);