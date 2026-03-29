/**
 * In a CodinGame environment, `readline()` and `console.log()` (or `print()`)
 * are typically provided globally for input/output operations.
 */
declare function readline(): string;

// Define a type for a cage to improve code readability and maintainability.
type Cage = {
    sick: number;    // Number of sick porcupines
    healthy: number; // Number of healthy porcupines
};

// Read the total number of cages (N).
const N: number = parseInt(readline());
// Read the total number of years to simulate (Y).
const Y: number = parseInt(readline());

// Initialize an array to store the state of all cages.
const cages: Cage[] = [];
// Populate the cages array with initial sick and healthy porcupine counts.
for (let i = 0; i < N; i++) {
    // Read a line containing S, H, A separated by spaces.
    const inputs: number[] = readline().split(' ').map(Number);
    const S: number = inputs[0]; // Initial number of sick porcupines
    const H: number = inputs[1]; // Initial number of healthy porcupines
    // The total alive (A = inputs[2]) is S + H, and is not explicitly needed for the simulation logic.
    cages.push({ sick: S, healthy: H });
}

// Flag to ensure "0" is printed only once if all porcupines die.
let hasPrintedZero: boolean = false;

// Simulate the porcupine population year by year.
for (let year = 1; year <= Y; year++) {
    let totalAliveThisYear: number = 0;
    
    // Create a temporary array to store the state of cages for the *next* year.
    // This is crucial to ensure that all calculations for the current year are based on
    // the state at the *beginning* of that year, preventing issues if `cages` were modified directly.
    const nextCages: Cage[] = [];

    // Iterate through each cage to apply the yearly rules.
    for (const cage of cages) {
        const s_prev: number = cage.sick;    // Sick porcupines at the beginning of the current year.
        const h_prev: number = cage.healthy; // Healthy porcupines at the beginning of the current year.

        // Rule: Each porcupine that was sick last year will cause 2 healthy porcupines
        // in the same cage to become sick. The number of newly infected cannot exceed
        // the available healthy porcupines.
        const newlySick: number = Math.min(s_prev * 2, h_prev);

        // Calculate the number of healthy porcupines remaining after infections.
        const h_current: number = h_prev - newlySick;

        // Rule: Porcupines who were sick last year (s_prev) die after causing infections.
        // The porcupines who will be sick for the *next* year are the ones who *just became* sick.
        const s_current: number = newlySick;

        // Calculate the total number of surviving porcupines in this cage at the end of the current year.
        // This includes remaining healthy ones and the newly sick ones (who are now 'sick' for the next cycle).
        const aliveInCage: number = h_current + s_current;
        totalAliveThisYear += aliveInCage;

        // Store the calculated state for this cage, which will be used in the next year's simulation.
        nextCages.push({ sick: s_current, healthy: h_current });
    }

    // After processing all cages for the current year, update the main `cages` array
    // with the `nextCages` state for the start of the next year.
    // `splice` is an efficient way to replace all elements in the `cages` array.
    cages.splice(0, cages.length, ...nextCages);

    // Output logic: print the total number of alive porcupines.
    if (totalAliveThisYear === 0) {
        // If all porcupines are dead, print "0" once.
        if (!hasPrintedZero) {
            console.log(0);
            hasPrintedZero = true;
        }
        // Stop the simulation if all porcupines are dead, as per problem requirements.
        break; 
    } else {
        // Otherwise, print the total number of alive porcupines for the current year.
        console.log(totalAliveThisYear);
    }
}