// The 'readline()' function is provided by the CodinGame environment for reading input.
// The 'console.log()' function is used for printing output.

function solve() {
    // Read the number of lines describing the road pattern
    const N: number = parseInt(readline());

    // Read the second line: initial car position and commands string
    const line2: string = readline();
    const [initialXStr, commandsStr] = line2.split(';');

    // Convert initial car position to a 0-based index, as strings are 0-indexed
    let carX: number = parseInt(initialXStr) - 1;

    // Parse the commands string into an array of command objects.
    // Each command is formatted as "NUMBERDIRECTION", e.g., "4S", "3R".
    const commands: { steps: number; direction: string }[] = commandsStr.split(';').map(cmd => {
        // The number of steps is the part before the last character (the direction).
        const steps = parseInt(cmd.slice(0, -1));
        // The direction is the last character.
        const direction = cmd.slice(-1);
        return { steps, direction };
    });

    // Read the N lines describing the road patterns.
    // Each line is formatted as "REPETITIONS;PATTERN", e.g., "10;|     |     |".
    const roadPatterns: { repetitions: number; pattern: string }[] = [];
    for (let i = 0; i < N; i++) {
        const line = readline();
        const [repetitionsStr, pattern] = line.split(';');
        roadPatterns.push({
            repetitions: parseInt(repetitionsStr),
            pattern: pattern
        });
    }

    // Initialize pointers for the current command being executed and the current road pattern being drawn.
    let currentCommandIndex = 0;
    let currentCommandStepsRemaining = commands[0].steps;

    let currentRoadPatternIndex = 0;
    let currentRoadPatternRepetitionsRemaining = roadPatterns[0].repetitions;

    // Main simulation loop: iterates for each line of road to be displayed.
    // The loop continues as long as there are road patterns to process.
    // The problem implies that the total steps from all commands will perfectly match
    // the total number of repetitions from all road patterns.
    while (currentRoadPatternIndex < roadPatterns.length) {
        // Get the current road pattern string.
        const currentRoadPattern = roadPatterns[currentRoadPatternIndex].pattern;
        // Get the current command being applied for movement.
        const currentCommand = commands[currentCommandIndex];

        // Convert the current road pattern string into a mutable character array.
        const chars = currentRoadPattern.split('');

        // Place the car character '#' at its current horizontal position.
        // It's good practice to add a boundary check, though for typical CodinGame puzzles,
        // inputs are usually designed to keep the car within bounds.
        if (carX >= 0 && carX < chars.length) {
            chars[carX] = '#';
        }

        // Print the current line of the road with the car.
        console.log(chars.join(''));

        // After displaying the car at its current position, update its position
        // for the *next* line, based on the current command's direction.
        if (currentCommand.direction === 'L') {
            carX--;
        } else if (currentCommand.direction === 'R') {
            carX++;
        }
        // If the direction is 'S' (Straight), carX remains unchanged.

        // Decrement the steps remaining for the current command.
        currentCommandStepsRemaining--;

        // If the current command has completed all its steps, move to the next command.
        if (currentCommandStepsRemaining === 0) {
            currentCommandIndex++;
            // Check if there are more commands available.
            if (currentCommandIndex < commands.length) {
                currentCommandStepsRemaining = commands[currentCommandIndex].steps;
            } else {
                // If commands run out before road patterns, this means the trajectory is fully defined.
                // In a well-formed puzzle, this `break` condition usually aligns with the road patterns also running out.
                break;
            }
        }

        // Decrement the repetitions remaining for the current road pattern.
        currentRoadPatternRepetitionsRemaining--;

        // If the current road pattern has been displayed its required number of times, move to the next pattern.
        if (currentRoadPatternRepetitionsRemaining === 0) {
            currentRoadPatternIndex++;
            // Check if there are more road patterns available.
            if (currentRoadPatternIndex < roadPatterns.length) {
                currentRoadPatternRepetitionsRemaining = roadPatterns[currentRoadPatternIndex].repetitions;
            } else {
                // All road patterns have been processed, so the simulation is complete.
                break;
            }
        }
    }
}

// Call the solve function to execute the puzzle logic.
solve();