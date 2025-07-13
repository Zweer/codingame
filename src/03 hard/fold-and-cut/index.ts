function solve() {
    const S: string = readline();
    const [folds_str, cut_corner] = S.split('-');

    // current_cut_points will store `x,y` coordinates as strings (e.g., "0.5,0.25")
    // These coordinates represent distinct locations on the *original* paper,
    // normalized to the [0,1]x[0,1] unit square.
    let current_cut_points: Set<string> = new Set<string>();

    // Step 1: Initialize the set with the single point corresponding to the cut corner
    // in the final, fully-folded paper's coordinate system [0,1]x[0,1].
    let initial_x_normalized: number;
    let initial_y_normalized: number;

    switch (cut_corner) {
        case 'tl':
            initial_x_normalized = 0;
            initial_y_normalized = 0;
            break;
        case 'tr':
            initial_x_normalized = 1;
            initial_y_normalized = 0;
            break;
        case 'bl':
            initial_x_normalized = 0;
            initial_y_normalized = 1;
            break;
        case 'br':
            initial_x_normalized = 1;
            initial_y_normalized = 1;
            break;
        default:
            // This case should not be reached based on problem constraints
            throw new Error("Invalid cut corner: " + cut_corner);
    }

    current_cut_points.add(`${initial_x_normalized},${initial_y_normalized}`);

    // Step 2: Unfold the paper by reversing the fold instructions
    const folds_array = folds_str.split('');
    // Iterate from the last fold to the first
    for (let i = folds_array.length - 1; i >= 0; i--) {
        const fold_char = folds_array[i];
        const next_set_of_points: Set<string> = new Set<string>();

        // For each point currently in `current_cut_points`, apply the inverse transformation
        // to find its corresponding location(s) on the paper *before* this fold was applied.
        for (const point_str of current_cut_points) {
            const [x, y] = point_str.split(',').map(Number);

            // The transformations below are derived assuming:
            // - The current paper is normalized to [0,1]x[0,1].
            // - We are mapping (x_current, y_current) to (x_previous, y_previous).
            // - Each fold essentially halves a dimension and then scales the remaining half to 1.
            //   The inverse operation involves dividing by 2 to get back to the original half-size,
            //   and then potentially adding 0.5 to shift to the other half, or mirroring.

            if (fold_char === 'R') { // Undo "Right half folds over Left half"
                // Points in current [0,1] could be from original [0,0.5] (mapped as x_curr = 2*x_prev)
                next_set_of_points.add(`${x / 2},${y}`);
                // OR from original [0.5,1] (mapped as x_curr = 2*(1-x_prev))
                next_set_of_points.add(`${1 - x / 2},${y}`);
            } else if (fold_char === 'L') { // Undo "Left half folds over Right half"
                // Points in current [0,1] could be from original [0.5,1] (mapped as x_curr = 2*x_prev - 1)
                next_set_of_points.add(`${x / 2 + 0.5},${y}`);
                // OR from original [0,0.5] (mapped as x_curr = 1 - 2*x_prev)
                next_set_of_points.add(`${(1 - x) / 2},${y}`);
            } else if (fold_char === 'T') { // Undo "Top half folds over Bottom half"
                // Points in current [0,1] could be from original [0,0.5] (mapped as y_curr = 2*y_prev)
                next_set_of_points.add(`${x},${y / 2}`);
                // OR from original [0.5,1] (mapped as y_curr = 2*(1-y_prev))
                next_set_of_points.add(`${x},${1 - y / 2}`);
            } else if (fold_char === 'B') { // Undo "Bottom half folds over Top half"
                // Points in current [0,1] could be from original [0.5,1] (mapped as y_curr = 2*y_prev - 1)
                next_set_of_points.add(`${x},${y / 2 + 0.5}`);
                // OR from original [0,0.5] (mapped as y_curr = 1 - 2*y_prev)
                next_set_of_points.add(`${x},${(1 - y) / 2}`);
            }
        }
        current_cut_points = next_set_of_points;
    }

    // Step 3: Count the number of actual holes
    let hole_count = 0;
    // Use a small tolerance for floating point comparisons to determine if a point is on the boundary.
    // Coordinates very close to 0 or 1 are considered boundary points.
    const boundary_tolerance = 1e-9; 

    for (const point_str of current_cut_points) {
        const [x, y] = point_str.split(',').map(Number);

        // A point (x,y) on the original [0,1]x[0,1] paper is considered a hole
        // only if it's strictly inside the paper boundaries (0 < x < 1 and 0 < y < 1).
        if (x > boundary_tolerance && x < (1 - boundary_tolerance) &&
            y > boundary_tolerance && y < (1 - boundary_tolerance)) {
            hole_count++;
        }
    }

    console.log(hole_count);
}

// CodinGame platform's I/O functions
declare function readline(): string;
solve();