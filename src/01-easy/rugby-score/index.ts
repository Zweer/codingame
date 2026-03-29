// Read the score from standard input.
// readline() is a CodinGame-specific function to read a line of input.
const score: number = parseInt(readline());

// Array to store valid combinations of [tries, transformations, penalties/drops].
const combinations: [number, number, number][] = [];

// Loop through possible number of tries (t).
// The maximum number of tries is when all points come from tries, so score / 5.
for (let t = 0; t * 5 <= score; t++) {
    // Loop through possible number of successful transformation kicks (k).
    // A transformation can only happen after a try, so k cannot exceed t.
    // Also, k starts from 0.
    for (let k = 0; k <= t; k++) {
        // Calculate the points contributed by tries and transformations.
        const pointsFromTriesAndTransformations = (t * 5) + (k * 2);

        // Optimization: If the points from tries and transformations already exceed
        // the total score, then it's impossible to reach the score with more
        // transformations (or the same number of transformations for this 't').
        // Break from the inner 'k' loop and move to the next 't'.
        if (pointsFromTriesAndTransformations > score) {
            break;
        }

        // Calculate the remaining points needed to reach the total score.
        const remainingPoints = score - pointsFromTriesAndTransformations;

        // Check if the remaining points can be made up solely by penalty kicks/drop goals.
        // Penalty kicks/drop goals are worth 3 points each.
        // So, remainingPoints must be non-negative and perfectly divisible by 3.
        if (remainingPoints % 3 === 0) {
            const p = remainingPoints / 3; // Calculate the number of penalties/drops.
            // Add the valid combination [tries, transformations, penalties/drops] to our list.
            combinations.push([t, k, p]);
        }
    }
}

// Print each valid combination.
// The nested loop structure naturally ensures the combinations are found
// and added to the 'combinations' array in the required sorted order:
// by increasing tries, then transformations, then penalties/drops.
for (const combo of combinations) {
    // Output format: "numTries numTransformations numPenalties", separated by spaces.
    console.log(`${combo[0]} ${combo[1]} ${combo[2]}`);
}