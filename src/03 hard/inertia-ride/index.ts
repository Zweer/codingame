// These declarations are for CodinGame's environment.
// In a local setup, you might need to mock or implement `readline` and `print`.
declare function readline(): string;
declare function print(message: any): void;

/**
 * Solves the Inertia Ride puzzle.
 */
function solve(): void {
    // Read the initial inertia
    const initialInertia: number = parseInt(readline());

    // Read the width (W) and height (H) of the roller coaster grid
    const [W, H] = readline().split(' ').map(Number);

    // Parse the track layout.
    // trackChars[c] will store the character ('_', '\', or '/') at column 'c'.
    // Since "every ascii column has one and only one track", a 1D array is sufficient.
    const trackChars: string[] = new Array(W).fill('');
    for (let r = 0; r < H; r++) {
        const row: string = readline();
        for (let c = 0; c < W; c++) {
            if (row[c] !== '.') {
                trackChars[c] = row[c];
            }
        }
    }

    // Initialize simulation variables
    let currentX: number = 0; // Current 0-based column position of the wagon
    let currentInertia: number = initialInertia; // Current inertia of the wagon
    let direction: number = 1; // Current direction of movement: 1 for right, -1 for left

    // Main simulation loop: continues until a stopping condition is met
    while (true) {
        const trackChar: string = trackChars[currentX];

        // Rule 1: Calculate inertia change based on the current track type and direction
        let inertiaChange: number = 0;
        if (trackChar === '_') {
            inertiaChange = -1; // Horizontal track: inertia decreases by 1
        } else if (trackChar === '\\') { // Descending slope
            // If moving right, it's a descent (+9 inertia)
            // If moving left, it's an ascent (-10 inertia)
            inertiaChange = (direction === 1) ? 9 : -10;
        } else if (trackChar === '/') { // Ascending slope
            // If moving right, it's an ascent (-10 inertia)
            // If moving left, it's a descent (+9 inertia)
            inertiaChange = (direction === 1) ? -10 : 9;
        }
        currentInertia += inertiaChange;

        // Rule 2: If inertia goes negative, reverse direction
        if (currentInertia < 0) {
            currentInertia = Math.abs(currentInertia); // Inertia becomes its absolute value
            direction *= -1; // Reverse wagon direction
        }

        // Rule 6: Stopping condition 1 - Wagon stops on a horizontal track with 0 inertia.
        // This check must be performed after inertia update but before actual movement.
        // Note: 0 inertia on a slope does NOT stop the wagon (as per example 3).
        if (currentInertia === 0 && trackChar === '_') {
            print(currentX); // Output the current position and stop
            return;
        }

        // Rule 3: Determine the next position based on inertia and direction.
        // Null inertia (0) implies staying in place.
        let nextX: number = currentX;
        if (currentInertia > 0) {
            nextX += direction; // Move one step in the current direction
        }
        // If currentInertia is 0, nextX remains currentX (wagon stays in place)

        // Rule 5: Stopping condition 2 - Wagon reaches the first or last track.
        // If the calculated next position is out of bounds, it stops at the boundary.
        if (nextX < 0) {
            print(0); // Stops at position 0 (the first track)
            return;
        }
        if (nextX >= W) {
            print(W - 1); // Stops at position W-1 (the last track)
            return;
        }

        // Update current position for the next iteration of the loop
        currentX = nextX;
    }
}

// Call the solve function to start the puzzle execution
solve();