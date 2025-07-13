// CodinGame provides these functions for input/output.
declare function readline(): string;
declare function print(message: any): void;

/**
 * Converts a time string in HH:MM:SS format to total seconds.
 * @param timeStr The time string (e.g., "10:15:46").
 * @returns The total number of seconds.
 */
function timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    return hours * 3600 + minutes * 60 + seconds;
}

// Read the number of time results (N)
const N: number = parseInt(readline(), 10);

// Initialize variables to store the best time found so far
let minTimeInSeconds: number = Infinity; // Start with a very large number of seconds
let minTimeString: string = "";        // Store the HH:MM:SS string of the best time

// Loop N times to read and process each time result
for (let i = 0; i < N; i++) {
    const currentTimeString: string = readline();
    const currentTimeInSeconds: number = timeToSeconds(currentTimeString);

    // If the current time is faster (smaller) than the current minimum
    if (currentTimeInSeconds < minTimeInSeconds) {
        minTimeInSeconds = currentTimeInSeconds; // Update the minimum seconds
        minTimeString = currentTimeString;     // Update the corresponding time string
    }
}

// Print the fastest time result found
print(minTimeString);