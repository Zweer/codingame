/**
 * Reads a line from standard input. In CodinGame, this is provided globally.
 * @returns {string} The line read.
 */
declare function readline(): string;

// Read the number of robbers
const R: number = parseInt(readline());

// Read the number of vaults
const V: number = parseInt(readline());

// Initialize an array to keep track of when each robber becomes free.
// Each element robberFreeTime[i] will store the time (in seconds) when robber i finishes their current task.
// Initially, all robbers are free at time 0.
const robberFreeTime: number[] = new Array(R).fill(0);

// Process each vault in increasing order of index
for (let i = 0; i < V; i++) {
    const inputs: string[] = readline().split(' ');
    const C: number = parseInt(inputs[0]); // Total number of characters
    const N: number = parseInt(inputs[1]); // Number of digit characters

    // Calculate the number of combinations for the current vault.
    // N digits (0-9) means 10 possibilities for N positions: 10^N
    // C - N vowels (A, E, I, O, U) means 5 possibilities for C-N positions: 5^(C-N)
    // The time to crack a vault is equal to the number of combinations.
    const vaultCrackingTime: number = Math.pow(10, N) * Math.pow(5, C - N);

    // Find the robber who will be free earliest.
    // We iterate through all robbers to find the one with the minimum current free time.
    let earliestFreeTime: number = Infinity; // Initialize with a very large number
    let earliestRobberIndex: number = -1; // Store the index of that robber

    for (let j = 0; j < R; j++) {
        if (robberFreeTime[j] < earliestFreeTime) {
            earliestFreeTime = robberFreeTime[j];
            earliestRobberIndex = j;
        }
    }

    // Assign the current vault to the earliest free robber.
    // Update their free time by adding the time taken for this vault.
    robberFreeTime[earliestRobberIndex] += vaultCrackingTime;
}

// After all vaults have been assigned and processed, the total heist time
// is the maximum time among all robbers' finishing times. This is when the last robber finishes.
let totalHeistTime: number = 0;
for (let i = 0; i < R; i++) {
    if (robberFreeTime[i] > totalHeistTime) {
        totalHeistTime = robberFreeTime[i];
    }
}

// Output the total time the heist takes.
console.log(totalHeistTime);