/**
 * The readline() function is provided by the CodinGame platform to read input.
 * In a local setup, you might need to mock this or use Node.js's 'readline' module.
 */
declare function readline(): string;

function solve() {
    // Read n (number of devices), m (number of clicks), c (fuse capacity)
    const [n, m, c] = readline().split(' ').map(Number);

    // Read the current consumption value for each appliance.
    // deviceConsumptions[i] stores the consumption for device with ID (i+1).
    const deviceConsumptions: number[] = readline().split(' ').map(Number);

    // Read the sequence of device IDs to click.
    // clickSequence[j] is the ID of the device to toggle at step j.
    const clickSequence: number[] = readline().split(' ').map(Number);

    // Initialize the status of each device. All devices are initially OFF.
    // deviceStatus[i] is true if device with ID (i+1) is ON, false otherwise.
    const deviceStatus: boolean[] = new Array(n).fill(false);

    let currentTotalConsumption = 0; // Tracks the sum of current from currently ON devices.
    let maximalConsumption = 0;       // Stores the highest total consumption observed.
    let fuseBlown = false;            // Flag to indicate if the fuse blew at any point.

    // Iterate through each click in the sequence
    for (let i = 0; i < m; i++) {
        const deviceIdToToggle = clickSequence[i];
        // Convert the 1-indexed device ID to a 0-indexed array index.
        const deviceIndex = deviceIdToToggle - 1;

        // Toggle the device's power status
        if (deviceStatus[deviceIndex]) {
            // Device is currently ON, so turn it OFF
            deviceStatus[deviceIndex] = false;
            currentTotalConsumption -= deviceConsumptions[deviceIndex];
        } else {
            // Device is currently OFF, so turn it ON
            deviceStatus[deviceIndex] = true;
            currentTotalConsumption += deviceConsumptions[deviceIndex];
        }

        // After toggling, check if the current total consumption exceeds the fuse capacity
        if (currentTotalConsumption > c) {
            fuseBlown = true;
            // The fuse has blown, no need to process further clicks.
            break;
        }

        // Update the maximal consumption recorded so far
        maximalConsumption = Math.max(maximalConsumption, currentTotalConsumption);
    }

    // Output the final result based on whether the fuse was blown
    if (fuseBlown) {
        console.log("Fuse was blown.");
    } else {
        console.log("Fuse was not blown.");
        console.log(`Maximal consumed current was ${maximalConsumption} A.`);
    }
}

// Call the main function to execute the puzzle logic
solve();