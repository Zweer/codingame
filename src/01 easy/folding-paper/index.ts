// In CodinGame, readline() and print() are globally available.
// For local development, you might need to mock these functions.
declare const readline: () => string;
declare const print: (message: any) => void;

function solve() {
    // Read the sequence of fold operations.
    const order: string = readline();
    // Read the side from which to observe the final folding.
    const side: string = readline();

    // Initialize the number of visible layers for each of the four sides
    // (Left, Right, Up, Down). A single sheet of paper starts with 1 visible
    // layer from every side.
    let currentL = 1;
    let currentR = 1;
    let currentU = 1;
    let currentD = 1;

    // Iterate through each fold instruction in the 'order' string.
    for (const fold of order) {
        // Create temporary variables to store the new state after the current fold.
        // This is crucial to ensure that all calculations for a single fold operation
        // use the values from the state *before* any changes are applied in this step.
        let nextL = currentL;
        let nextR = currentR;
        let nextU = currentU;
        let nextD = currentD;

        // Apply the folding rules based on the current fold instruction.
        switch (fold) {
            case 'R': // Right side folds onto Left side
                // The new Left edge combines the layers from the old Left and Right edges.
                nextL = currentL + currentR;
                // The new Right edge becomes a crease, exposing only 1 layer.
                nextR = 1;
                // Vertical edges (Up and Down) double their visible layers as the paper thickens horizontally.
                nextU = currentU * 2;
                nextD = currentD * 2;
                break;

            case 'L': // Left side folds onto Right side
                // The new Right edge combines layers from the old Right and Left edges.
                nextR = currentR + currentL;
                // The new Left edge becomes a crease.
                nextL = 1;
                // Vertical edges (Up and Down) double their visible layers.
                nextU = currentU * 2;
                nextD = currentD * 2;
                break;

            case 'U': // Up side folds onto Down side
                // The new Down edge combines layers from the old Down and Up edges.
                nextD = currentD + currentU;
                // The new Up edge becomes a crease.
                nextU = 1;
                // Horizontal edges (Left and Right) double their visible layers as the paper thickens vertically.
                nextL = currentL * 2;
                nextR = currentR * 2;
                break;

            case 'D': // Down side folds onto Up side
                // The new Up edge combines layers from the old Up and Down edges.
                nextU = currentU + currentD;
                // The new Down edge becomes a crease.
                nextD = 1;
                // Horizontal edges (Left and Right) double their visible layers.
                nextL = currentL * 2;
                nextR = currentR * 2;
                break;

            default:
                // This case should ideally not be reached given the problem constraints on input characters.
                break;
        }

        // Update the current state with the calculated next state for the next fold iteration.
        currentL = nextL;
        currentR = nextR;
        currentU = nextU;
        currentD = nextD;
    }

    // After all folds are processed, output the number of layers visible from the requested side.
    switch (side) {
        case 'L':
            print(currentL);
            break;
        case 'R':
            print(currentR);
            break;
        case 'U':
            print(currentU);
            break;
        case 'D':
            print(currentD);
            break;
        default:
            // This case should not be reached given the problem constraints.
            break;
    }
}

// Call the solve function to execute the puzzle logic.
solve();