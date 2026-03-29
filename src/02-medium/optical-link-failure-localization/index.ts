/**
 * Reads a line from standard input. In CodinGame, this is usually provided by the environment.
 * @returns {string} The line read.
 */
declare function readline(): string;

// --- Input Parsing ---

const links: number = parseInt(readline()); // Number of optical links
const mtrails: number = parseInt(readline()); // Number of m-trails
const failures: number = parseInt(readline()); // Maximum number of failures (1 or 2)
const alarmCodeVectorStr: string = readline(); // Alarm code vector as a string of '0's and '1's

// Convert the alarm code vector string to a boolean array for easier comparison
// actualAlarmCode[j] is true if m-trail j has an alarm
const actualAlarmCode: boolean[] = alarmCodeVectorStr.split('').map(c => c === '1');

// Parse the link code matrix
// linkCodeMatrix[linkIdx][trailIdx] is true if linkIdx is used by trailIdx
const linkCodeMatrix: boolean[][] = [];
for (let i = 0; i < links; i++) {
    linkCodeMatrix.push(readline().split('').map(c => c === '1'));
}

// --- Core Logic ---

// Type alias for a set of failed links (e.g., [3] for single, [0, 2] for dual)
type FailedLinks = number[]; 

// Stores all sets of failed links that perfectly match the actual alarm code
const matchingScenarios: FailedLinks[] = [];

/**
 * Checks if two boolean arrays are element-wise identical.
 * @param {boolean[]} arr1 The first array.
 * @param {boolean[]} arr2 The second array.
 * @returns {boolean} True if arrays are identical, false otherwise.
 */
function arraysEqual(arr1: boolean[], arr2: boolean[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Calculates the expected alarm code vector given a hypothetical set of failed links.
 * An m-trail will alarm if it uses any of the links in the 'failedLinkIds' set.
 * @param {number[]} failedLinkIds An array of IDs of the links that are hypothetically failed.
 * @returns {boolean[]} The expected alarm code vector for this failure scenario.
 */
function calculateExpectedAlarm(failedLinkIds: number[]): boolean[] {
    const expectedAlarm: boolean[] = new Array(mtrails).fill(false); // Initialize all trails as not alarming
    for (let trailIdx = 0; trailIdx < mtrails; trailIdx++) {
        for (const failedLinkIdx of failedLinkIds) {
            // If the current m-trail (trailIdx) uses the current failed link (failedLinkIdx)
            if (linkCodeMatrix[failedLinkIdx][trailIdx]) {
                expectedAlarm[trailIdx] = true; // This trail will alarm
                break; // No need to check other failed links for this specific trail, it's already alarming
            }
        }
    }
    return expectedAlarm;
}

// --- Generate and Test Candidate Failure Scenarios ---

// Case 1: Single link failures (if 'failures' allows at least 1 failure)
if (failures >= 1) {
    for (let i = 0; i < links; i++) {
        const candidateFailedLinks: FailedLinks = [i]; // A single failed link: l_i
        const expectedAlarm = calculateExpectedAlarm(candidateFailedLinks);
        if (arraysEqual(expectedAlarm, actualAlarmCode)) {
            matchingScenarios.push(candidateFailedLinks);
        }
    }
}

// Case 2: Dual link failures (if 'failures' allows at least 2 failures)
// Iterate through all unique pairs of links (l_i, l_j) where i < j
if (failures >= 2) {
    for (let i = 0; i < links; i++) {
        // Start j from i+1 to avoid duplicate pairs (e.g., [0,1] is same as [1,0])
        // and to ensure the output order is ascending if a dual failure is the solution.
        for (let j = i + 1; j < links; j++) { 
            const candidateFailedLinks: FailedLinks = [i, j]; // A pair of failed links: l_i and l_j
            const expectedAlarm = calculateExpectedAlarm(candidateFailedLinks);
            if (arraysEqual(expectedAlarm, actualAlarmCode)) {
                matchingScenarios.push(candidateFailedLinks);
            }
        }
    }
}

// --- Output Result ---

if (matchingScenarios.length === 1) {
    // If exactly one scenario perfectly matches the observed alarm code,
    // this is the unambiguous solution.
    // The .join(' ') method correctly handles both single ([3] -> "3")
    // and dual ([0, 2] -> "0 2") link failure arrays.
    console.log(matchingScenarios[0].join(' '));
} else {
    // If zero matching scenarios are found, or more than one scenario matches,
    // the failure cannot be unambiguously identified.
    console.log("AMBIGUOUS");
}