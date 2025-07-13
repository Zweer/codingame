import * as readline from 'readline';

// Define a Point interface for better type safety and readability
interface Point {
    x: number;
    y: number;
}

// Define an interface for storing state information for cycle detection
interface StateInfo {
    step: number;     // The number of pivot changes completed when this state was first encountered
    counts: number[]; // A snapshot of the pivot counts at that step
}

// Main function to solve the puzzle
function solve() {
    // Setup readline interface for input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Variables to store input values
    let K: number;         // Number of points
    let N: number;         // Number of pivot changes
    let P_start_idx: number; // Index of the starting pivot
    const points: Point[] = []; // Array to store all points
    let lineNum = 0;       // Counter for input lines

    // Read input line by line
    rl.on('line', (line: string) => {
        if (lineNum === 0) {
            K = parseInt(line);
        } else if (lineNum === 1) {
            N = parseInt(line);
        } else if (lineNum === 2) {
            P_start_idx = parseInt(line);
        } else {
            const parts = line.split(' ').map(Number);
            points.push({ x: parts[0], y: parts[1] });
        }
        lineNum++;
    });

    // Process all input once the 'close' event is triggered
    rl.on('close', () => {
        // Initialize an array to store how many times each point was a pivot
        const pivotCounts: number[] = new Array(K).fill(0);

        // Set initial current pivot index
        let currPivotIdx: number = P_start_idx;
        // prevPivotIdx is used to define the current line's angle.
        // -1 is a sentinel value for the very first step (horizontal line).
        let prevPivotIdx: number = -1; 

        // The starting pivot is counted immediately
        pivotCounts[currPivotIdx]++;

        // Map to store visited states for cycle detection
        // Key: A string representing the state "${prevPivotIdx},${currPivotIdx}"
        // Value: An object containing the step number and pivot counts when this state was first seen
        const visitedStates = new Map<string, StateInfo>();

        // Simulate N pivot changes
        // 'n' represents the number of pivot changes that will occur in the current iteration.
        // It ranges from 0 to N-1, meaning N total pivot changes will be simulated.
        for (let n = 0; n < N; n++) {
            let currentLineAngle: number;

            // Determine the angle of the current line
            if (prevPivotIdx === -1) {
                // For the very first step, the line starts horizontally (angle 0 radians)
                currentLineAngle = 0;
            } else {
                // For subsequent steps, the line is defined by the previous and current pivot points
                const pPrev = points[prevPivotIdx];
                const pCurr = points[currPivotIdx];
                // Math.atan2(y, x) returns the angle in radians between the positive x-axis and the point (x, y)
                // The range is (-PI, PI]
                currentLineAngle = Math.atan2(pCurr.y - pPrev.y, pCurr.x - pPrev.x);
            }

            // Create a unique key for the current state (prevPivotIdx, currPivotIdx)
            const stateKey = `${prevPivotIdx},${currPivotIdx}`;

            // Check for cycle detection
            if (visitedStates.has(stateKey)) {
                const cycleInfo = visitedStates.get(stateKey)!;
                const cycleStartNumChanges = cycleInfo.step;   // Number of changes completed to reach this state previously
                const countsAtCycleStart = cycleInfo.counts;   // Pivot counts at that previous step

                // Calculate the length of the detected cycle
                const stepsInCycle = n - cycleStartNumChanges;
                // Calculate how many more pivot changes are remaining
                const remainingChanges = N - n;

                // Calculate how many full cycles can be applied
                const numFullCycles = Math.floor(remainingChanges / stepsInCycle);

                // Apply the counts from these full cycles to the total pivot counts
                for (let i = 0; i < K; i++) {
                    pivotCounts[i] += numFullCycles * (pivotCounts[i] - countsAtCycleStart[i]);
                }

                // Advance 'n' to skip the changes covered by the full cycles
                n += numFullCycles * stepsInCycle;
                
                // If 'n' has reached or exceeded 'N', all changes are done, so break the loop
                if (n >= N) {
                    break;
                }
            } else {
                // If this state hasn't been visited before, store it
                // 'n' is the number of changes *completed* before entering this state.
                visitedStates.set(stateKey, { step: n, counts: pivotCounts.slice() });
            }

            // Find the next point that the line will hit
            const Px = points[currPivotIdx].x;
            const Py = points[currPivotIdx].y;
            let nextPivotCandidateIdx: number = -1;
            let minAngleDiff: number = Infinity; // Initialize with a very large value

            // Iterate through all other points to find the one hit first
            for (let i = 0; i < K; i++) {
                if (i === currPivotIdx) {
                    continue; // A point cannot be the next pivot if it's the current pivot
                }

                const dx = points[i].x - Px;
                const dy = points[i].y - Py;
                const angle_P_i = Math.atan2(dy, dx); // Angle of the vector from current pivot to point i

                // Calculate the clockwise angle difference from the current line's angle
                // to the angle of the vector to point i.
                let angleDiff = currentLineAngle - angle_P_i;

                // Normalize the angle difference to be positive and within [0, 2*PI)
                // If angleDiff is 0 or negative, it means 'angle_P_i' is at or clockwise relative to 'currentLineAngle'.
                // Adding 2*PI converts it to the equivalent positive clockwise rotation needed to reach it.
                // Example: from 0 deg to -90 deg (270 deg clockwise) => 0 - (-PI/2) = PI/2.
                // Example: from 90 deg to 0 deg (90 deg clockwise) => PI/2 - 0 = PI/2.
                // Example: from 0 deg to 90 deg (270 deg clockwise) => 0 - PI/2 = -PI/2. After +2PI => 3PI/2.
                if (angleDiff <= 0) {
                    angleDiff += 2 * Math.PI;
                }

                // If this point has a smaller clockwise angle difference, it's the next candidate
                if (angleDiff < minAngleDiff) {
                    minAngleDiff = angleDiff;
                    nextPivotCandidateIdx = i;
                }
            }

            // Update the pivot indices for the next iteration
            prevPivotIdx = currPivotIdx;
            currPivotIdx = nextPivotCandidateIdx;
            // Increment the count for the newly chosen pivot
            pivotCounts[currPivotIdx]++;
        }

        // Output the final current pivot index
        console.log(currPivotIdx);
        // Output the total times each point was a pivot
        for (let i = 0; i < K; i++) {
            console.log(pivotCounts[i]);
        }
    });
}

// Call the solve function to start the program
solve();