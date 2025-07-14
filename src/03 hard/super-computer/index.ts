// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void; // print is an alias for console.log

// Using a custom console.log to match CodinGame's print function
const console = {
    log: print
};

// Define a type for a single calculation, storing its start and end days
type Calculation = {
    start: number;
    end: number; // Calculated as J + D - 1
};

// Read the total number of calculations (N)
const N: number = parseInt(readline());

// Array to store all parsed calculations
const calculations: Calculation[] = [];

// Loop N times to read each calculation's details
for (let i = 0; i < N; i++) {
    const line: string = readline(); // Read a line like "J D"
    const parts: string[] = line.split(' '); // Split into J and D strings
    const J: number = parseInt(parts[0]); // Parse start day
    const D: number = parseInt(parts[1]); // Parse duration
    
    // Calculate the inclusive end day: start_day + duration - 1
    calculations.push({ start: J, end: J + D - 1 });
}

// Sort the calculations. The greedy strategy requires sorting by finish time.
// If two calculations end on the same day, sort by their start day.
// This ensures that if there's a tie for the earliest finish, we pick the one
// that starts earliest, potentially freeing up resources sooner for later tasks.
calculations.sort((a, b) => {
    if (a.end !== b.end) {
        return a.end - b.end; // Primary sort: by end day in ascending order
    }
    return a.start - b.start; // Secondary sort: by start day in ascending order for ties
});

let selectedCalculationsCount: number = 0;
// Initialize lastSelectedCalculationFinishTime.
// Since all J > 0, the earliest a calculation can start is day 1.
// By setting this to 0, any calculation starting on day 1 (or later) will satisfy
// `calc.start >= lastSelectedCalculationFinishTime + 1` initially (e.g., 1 >= 0 + 1).
let lastSelectedCalculationFinishTime: number = 0; 

// Iterate through the sorted calculations to select non-overlapping ones
for (const calc of calculations) {
    // Check if the current calculation can be scheduled without overlapping
    // with the previously selected calculation.
    // A new calculation can start on the day AFTER the previous one finishes.
    // For example, if previous finished on day 5, this one can start on day 6 or later.
    if (calc.start >= lastSelectedCalculationFinishTime + 1) {
        selectedCalculationsCount++; // Select this calculation
        lastSelectedCalculationFinishTime = calc.end; // Update the finish time of the last selected calculation
    }
}

// Output the maximum number of calculations that can be carried out
console.log(selectedCalculationsCount);